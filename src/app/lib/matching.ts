import type { GrantsGovOpportunity } from "./grants";
import type { OrgRecord } from "../context/ActiveOrgContext";

// Simple, transparent keyword-overlap scorer. Swap for an LLM-based
// scorer later without changing anything downstream — it just needs
// to return { score, reasons }.
export function scoreMatch(org: OrgRecord, opp: GrantsGovOpportunity): { score: number; reasons: string[] } {
  const haystack = `${opp.title} ${opp.agencyName}`.toLowerCase();
  const reasons: string[] = [];
  let score = 40; // baseline

  const keywords = [
    ...(org.focus_areas ?? []),
    ...(org.type ? [org.type.replace(/nonprofit/i, "").trim()] : []),
    ...(org.mission ? org.mission.split(/\s+/).filter((w) => w.length > 6) : []),
  ]
    .filter(Boolean)
    .map((k) => k.toLowerCase());

  const seen = new Set<string>();
  for (const kw of keywords) {
    if (seen.has(kw)) continue;
    if (kw.length < 4) continue;
    if (haystack.includes(kw)) {
      score += 8;
      seen.add(kw);
      if (reasons.length < 3) {
        reasons.push(`Matches your focus on "${kw}"`);
      }
    }
  }

  score = Math.max(30, Math.min(97, score));

  if (reasons.length === 0) {
    reasons.push("General eligibility fit based on organization type");
  }

  return { score, reasons };
}
