// Vercel Serverless Function
// POST /api/sync-grants-gov  { orgId: string }
//
// Grants.gov's public search API blocks direct browser requests (no CORS
// headers), so this has to run server-side. Pulls federal opportunities
// matching the org's focus areas and writes them into Supabase using the
// service role key (bypasses RLS — safe, server-only).

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SEARCH_URL = "https://api.grants.gov/v1/api/search2";

async function searchGrantsGov(keyword, rows = 15) {
  const res = await fetch(SEARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keyword, oppStatuses: "forecasted|posted", rows }),
  });
  if (!res.ok) {
    console.error("Grants.gov search failed:", res.status, await res.text());
    return [];
  }
  const data = await res.json();
  const list = data?.data?.oppHits ?? [];
  return list.map((hit) => ({
    id: String(hit.id),
    title: hit.title ?? "Untitled Opportunity",
    agencyName: hit.agencyName ?? hit.agencyCode ?? "Unknown Agency",
    closeDate: hit.closeDate ?? "",
    cfdaList: hit.cfdaList ?? [],
  }));
}

function scoreMatch(org, opp) {
  const haystack = `${opp.title} ${opp.agencyName}`.toLowerCase();
  const reasons = [];
  let score = 40;
  const keywords = [
    ...(org.focus_areas ?? []),
    ...(org.type ? [org.type.replace(/nonprofit/i, "").trim()] : []),
  ]
    .filter(Boolean)
    .map((k) => k.toLowerCase());

  const seen = new Set();
  for (const kw of keywords) {
    if (seen.has(kw) || kw.length < 4) continue;
    if (haystack.includes(kw)) {
      score += 8;
      seen.add(kw);
      if (reasons.length < 3) reasons.push(`Matches your focus on "${kw}"`);
    }
  }
  score = Math.max(30, Math.min(97, score));
  if (reasons.length === 0) reasons.push("General eligibility fit based on organization type");
  return { score, reasons };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    res.status(500).json({ error: "Server is missing required environment variables." });
    return;
  }

  const { orgId } = req.body || {};
  if (!orgId) {
    res.status(400).json({ error: "orgId is required" });
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: org, error: orgError } = await supabase.from("orgs").select("*").eq("id", orgId).single();
  if (orgError || !org) {
    res.status(404).json({ error: "Organization not found" });
    return;
  }

  const keywords = org.focus_areas?.length ? org.focus_areas : [org.type ?? "nonprofit"];
  const seen = new Set();
  const allHits = [];

  try {
    for (const kw of keywords.slice(0, 3)) {
      const hits = await searchGrantsGov(kw, 15);
      for (const h of hits) {
        if (!seen.has(h.id)) {
          seen.add(h.id);
          allHits.push(h);
        }
      }
    }

    if (allHits.length === 0) {
      res.status(200).json({ synced: 0, message: "No matching federal grants found right now." });
      return;
    }

    const rows = allHits.map((h) => ({
      external_id: h.id,
      title: h.title,
      funder: h.agencyName,
      deadline: h.closeDate || null,
      category: "Federal",
      cfda_numbers: h.cfdaList ?? [],
      raw: h,
    }));

    const { data: upserted, error: upsertError } = await supabase
      .from("opportunities")
      .upsert(rows, { onConflict: "external_id" })
      .select();

    if (upsertError) {
      res.status(502).json({ error: upsertError.message });
      return;
    }

    const matchRows = (upserted ?? []).map((opp) => {
      const { score, reasons } = scoreMatch(org, { title: opp.title, agencyName: opp.funder });
      return {
        org_id: orgId,
        opportunity_id: opp.id,
        match_score: score,
        match_reasons: reasons,
        win_prob: Math.max(20, score - 15),
      };
    });

    const { error: matchError } = await supabase
      .from("org_opportunities")
      .upsert(matchRows, { onConflict: "org_id,opportunity_id" });

    if (matchError) {
      res.status(502).json({ error: matchError.message });
      return;
    }

    res.status(200).json({ synced: matchRows.length });
  } catch (err) {
    console.error("Grants.gov sync failed:", err);
    res.status(500).json({ error: String(err) });
  }
}
