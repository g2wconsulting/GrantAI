// Vercel Serverless Function
// POST /api/discover-grants  { orgId: string }
//
// Uses Claude with real-time web search to find current, real grant
// opportunities (foundations, corporate giving, state/local programs —
// not just the federal Grants.gov feed) that match the org's profile,
// then writes them straight into Supabase using the service role key
// (bypasses RLS — safe because this only runs server-side).

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ANTHROPIC_API_KEY) {
    res.status(500).json({ error: "Server is missing required environment variables." });
    return;
  }

  const { orgId } = req.body || {};
  if (!orgId) {
    res.status(400).json({ error: "orgId is required" });
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: org, error: orgError } = await supabase
    .from("orgs")
    .select("*")
    .eq("id", orgId)
    .single();

  if (orgError || !org) {
    res.status(404).json({ error: "Organization not found" });
    return;
  }

  const hasMission = !!org.mission?.trim();
  const hasFocusAreas = Array.isArray(org.focus_areas) && org.focus_areas.length > 0;
  if (!hasMission && !hasFocusAreas) {
    res.status(422).json({
      error: "needs_profile_info",
      message: "We need a bit more about your organization before we can search for relevant grants — add a mission statement or a few focus areas.",
    });
    return;
  }

  const isBusiness = /business|startup|for-profit|company|llc|inc\.?$/i.test(org.type ?? "");

  const prompt = `You are a grant and funding-opportunity research assistant. Search the web for CURRENT, REAL, OPEN grant, funding, and RFP opportunities that are a strong fit for the following organization. Include ${
    isBusiness
      ? "small business grants, SBIR/STTR and other federal R&D funding, state/local economic development grants, corporate RFPs, and business competitions"
      : "foundation grants, corporate giving/CSR programs, and state or local government grants"
  } — NOT the federal Grants.gov feed (that is covered separately).

Organization profile:
- Name: ${org.name}
- Type: ${org.type ?? (isBusiness ? "Business" : "Nonprofit")}
- Location: ${org.city ?? "Unknown"}
- Mission / what they do: ${org.mission ?? "Not specified"}
- Focus areas: ${(org.focus_areas ?? []).join(", ") || "Not specified"}
- Annual budget/revenue size: ${org.budget_size ?? "Not specified"}

Find up to 4 real, currently open or upcoming opportunities using web search. Do not fabricate opportunities or URLs — only include ones you actually found via search. This runs under a hard ~50-second time limit, so work fast: a few well-targeted searches and a direct answer, not exhaustive research. Do not spend time double-checking each result — reasonable confidence from the search results is enough.

Respond with ONLY a JSON array (no markdown fences, no commentary) where each item has exactly this shape:
{
  "title": string,
  "funder": string,
  "category": "Foundation" | "Corporate" | "State" | "Local" | "Federal R&D" | "Business Competition",
  "amount_floor": number | null,
  "amount_ceiling": number | null,
  "deadline": "YYYY-MM-DD" | null,
  "eligibility": string,
  "description": string,
  "source_url": string,
  "match_score": number,
  "match_reasons": [string, string]
}`;

  try {
    const messages = [{ role: "user", content: prompt }];
    // web_fetch (opening each candidate's page to double-check it) was
    // pushing total latency past Vercel's function timeout (confirmed via
    // X-Vercel-Error: FUNCTION_INVOCATION_TIMEOUT / 504) — search only, and
    // fewer of them, so this reliably finishes inside the time limit.
    const tools = [{ type: "web_search_20260209", name: "web_search", max_uses: 4 }];

    let claudeData;
    // A long search can still exceed Anthropic's default 10-iteration
    // server-tool loop, which pauses the turn (stop_reason: "pause_turn")
    // rather than erroring. Resume once by re-sending the conversation so
    // far — this should rarely trigger now given the smaller tool budget.
    for (let round = 0; round < 2; round++) {
      const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-5",
          max_tokens: 4000,
          output_config: { effort: "low" },
          messages,
          tools,
        }),
      });

      if (!claudeRes.ok) {
        const text = await claudeRes.text();
        res.status(502).json({ error: `Claude API error: ${claudeRes.status} ${text}` });
        return;
      }

      claudeData = await claudeRes.json();
      if (claudeData.stop_reason !== "pause_turn") break;

      messages.push({ role: "assistant", content: claudeData.content });
    }

    const textBlocks = (claudeData.content ?? [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const cleaned = textBlocks.replace(/```json|```/g, "").trim();
    const jsonStart = cleaned.indexOf("[");
    const jsonEnd = cleaned.lastIndexOf("]");
    if (jsonStart === -1 || jsonEnd === -1) {
      res.status(502).json({ error: "Could not parse grant results from AI response", raw: cleaned.slice(0, 500) });
      return;
    }

    const grants = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));

    let synced = 0;
    for (const g of grants) {
      if (!g.title || !g.source_url) continue;

      const externalId = `ai:${Buffer.from(g.source_url).toString("base64").slice(0, 40)}`;

      const { data: oppRow, error: oppError } = await supabase
        .from("opportunities")
        .upsert(
          {
            external_id: externalId,
            title: g.title,
            funder: g.funder ?? "Unknown",
            deadline: g.deadline ?? null,
            category: g.category ?? "Foundation",
            amount_floor: g.amount_floor ?? null,
            amount_ceiling: g.amount_ceiling ?? null,
            eligibility: g.eligibility ?? null,
            description: g.description ?? null,
            source_url: g.source_url ?? null,
            raw: g,
          },
          { onConflict: "external_id" }
        )
        .select()
        .single();

      if (oppError || !oppRow) continue;

      await supabase.from("org_opportunities").upsert(
        {
          org_id: orgId,
          opportunity_id: oppRow.id,
          match_score: g.match_score ?? 60,
          match_reasons: g.match_reasons ?? [],
          win_prob: Math.max(15, (g.match_score ?? 60) - 20),
        },
        { onConflict: "org_id,opportunity_id" }
      );

      synced += 1;
    }

    res.status(200).json({ synced, total_found: grants.length });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
