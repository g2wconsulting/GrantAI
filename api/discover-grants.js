// Vercel Serverless Function
// POST /api/discover-grants  { orgId: string }
//
// Uses Claude with real-time web search to find current, real grant
// opportunities (foundations, corporate giving, state/local programs —
// not just the federal Grants.gov feed) that match the org's profile,
// then writes them straight into Supabase using the service role key
// (bypasses RLS — safe because this only runs server-side).
//
// Runs a few smaller searches in PARALLEL (one per funding category)
// instead of one big search. Each is bounded and aborted well under
// Vercel's function timeout, and wall-clock stays roughly the same as a
// single search since they run concurrently — but total yield is higher.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const NONPROFIT_CATEGORIES = [
  { category: "Foundation", focus: "foundation grants and other private philanthropic funding" },
  { category: "Corporate", focus: "corporate giving and CSR (corporate social responsibility) programs" },
  { category: "State", focus: "state and local government grants and RFPs" },
];

const BUSINESS_CATEGORIES = [
  { category: "State", focus: "small business grants and state/local economic development programs" },
  { category: "Federal R&D", focus: "SBIR/STTR and other federal R&D funding opportunities" },
  { category: "Business Competition", focus: "corporate RFPs and business competitions" },
];

function buildPrompt(org, isBusiness, focus, programs) {
  const programLines = programs.length
    ? programs.map((p) => `  - ${p.name}${p.description ? `: ${p.description}` : ""}${p.people_served ? ` (serves: ${p.people_served})` : ""}`).join("\n")
    : "  Not specified";

  return `You are a grant and funding-opportunity research assistant. Search the web for CURRENT, REAL, OPEN opportunities related specifically to: ${focus}. They must be a strong fit for the organization below — NOT the federal Grants.gov feed (that is covered separately).

Organization profile:
- Name: ${org.name}
- Type: ${org.type ?? (isBusiness ? "Business" : "Nonprofit")}
- Location: ${org.city ?? "Unknown"}
- Mission / what they do: ${org.mission ?? "Not specified"}
- Focus areas: ${(org.focus_areas ?? []).join(", ") || "Not specified"}
- Annual budget/revenue size: ${org.budget_size ?? "Not specified"}
- Specific programs run:
${programLines}

Find up to 3 real, currently open or upcoming opportunities using web search. Do not fabricate opportunities or URLs — only include ones you actually found via search. This runs under a hard ~20-second time limit: search once or twice, then answer immediately with whatever you've found. Do not double-check or re-search — first reasonable results are enough.

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
}

/** Pulls a JSON array of grants out of free-form model text. Returns null (not []) on failure, so callers can tell "parsed but empty" apart from "couldn't parse at all". */
function extractGrants(text) {
  const cleaned = (text ?? "").replace(/```json|```/g, "").trim();
  const jsonStart = cleaned.indexOf("[");
  const jsonEnd = cleaned.lastIndexOf("]");
  if (jsonStart === -1 || jsonEnd === -1) return null;
  try {
    return JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));
  } catch {
    return null;
  }
}

/**
 * Tries OpenAI (gpt-5.6's built-in web_search tool) first — the user has
 * OpenAI credits to spend here — and falls back to Claude if OpenAI isn't
 * configured, errors, or times out. Each attempt gets its own short
 * timeout so the two attempts combined still fit safely inside Vercel's
 * function limit even in the worst case (OpenAI fails, then Claude runs).
 */
async function searchCategory(org, isBusiness, focus, programs) {
  const prompt = buildPrompt(org, isBusiness, focus, programs);

  if (OPENAI_API_KEY) {
    const openaiGrants = await searchWithOpenAI(prompt);
    if (openaiGrants && openaiGrants.length > 0) return openaiGrants;
  }

  return (await searchWithClaude(prompt)) ?? [];
}

async function searchWithOpenAI(prompt) {
  const controller = new AbortController();
  const abortTimer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5.6",
        tools: [{ type: "web_search" }],
        search_context_size: "low",
        input: prompt,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const messageItem = (data.output ?? []).find((item) => item.type === "message");
    const text = messageItem?.content?.[0]?.text;
    return extractGrants(text);
  } catch {
    return null;
  } finally {
    clearTimeout(abortTimer);
  }
}

async function searchWithClaude(prompt) {
  if (!ANTHROPIC_API_KEY) return null;
  const controller = new AbortController();
  const abortTimer = setTimeout(() => controller.abort(), 20000);

  try {
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 2000,
        thinking: { type: "disabled" },
        output_config: { effort: "low" },
        messages: [{ role: "user", content: prompt }],
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 3 }],
      }),
    });

    if (!claudeRes.ok) return null;

    const claudeData = await claudeRes.json();
    const textBlocks = (claudeData.content ?? [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return extractGrants(textBlocks);
  } catch {
    // Timed out or failed — this category just contributes nothing; the
    // other categories running in parallel are unaffected.
    return null;
  } finally {
    clearTimeout(abortTimer);
  }
}

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
  const categories = isBusiness ? BUSINESS_CATEGORIES : NONPROFIT_CATEGORIES;

  const { data: programs } = await supabase
    .from("org_programs")
    .select("name, description, people_served")
    .eq("org_id", orgId)
    .limit(8);

  try {
    const results = await Promise.all(categories.map((c) => searchCategory(org, isBusiness, c.focus, programs ?? [])));
    const grants = results.flat().filter(Boolean);
    const categoriesWithNoResults = results.filter((r) => r.length === 0).length;

    if (grants.length === 0) {
      res.status(502).json({
        error: categoriesWithNoResults === categories.length
          ? "Could not find any grants right now — try again in a moment."
          : "Could not parse grant results from the AI response — try again in a moment.",
      });
      return;
    }

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

    res.status(200).json({ synced, total_found: grants.length, categories_searched: categories.length - categoriesWithNoResults });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
