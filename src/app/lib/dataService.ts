import { supabase } from "./supabase";
import { searchGrantsGov } from "./grants";
import { scoreMatch } from "./matching";
import type { OrgRecord } from "../context/ActiveOrgContext";

/**
 * Pulls live opportunities from Grants.gov based on the org's focus areas,
 * upserts them into the shared `opportunities` table, computes a match
 * score for this org, and upserts into `org_opportunities`.
 */
export async function syncGrantsForOrg(org: OrgRecord) {
  const keywords = org.focus_areas?.length ? org.focus_areas : [org.type ?? "nonprofit"];
  const seenExternalIds = new Set<string>();
  const allHits: Awaited<ReturnType<typeof searchGrantsGov>> = [];

  for (const kw of keywords.slice(0, 3)) {
    try {
      const hits = await searchGrantsGov(kw, 15);
      for (const h of hits) {
        if (!seenExternalIds.has(h.id)) {
          seenExternalIds.add(h.id);
          allHits.push(h);
        }
      }
    } catch (err) {
      console.error(`Grants.gov search failed for "${kw}"`, err);
    }
  }

  if (allHits.length === 0) return { synced: 0, error: null };

  // Upsert into shared opportunities table
  const rows = allHits.map((h) => ({
    external_id: h.id,
    title: h.title,
    funder: h.agencyName,
    deadline: h.closeDate || null,
    category: "Federal",
    cfda_numbers: h.cfdaList ?? [],
    raw: h,
  }));

  const { data: upserted, error } = await supabase
    .from("opportunities")
    .upsert(rows, { onConflict: "external_id" })
    .select();

  if (error) return { synced: 0, error: error.message };

  // Compute match + upsert org_opportunities
  const matchRows = (upserted ?? []).map((opp) => {
    const { score, reasons } = scoreMatch(org, {
      id: opp.external_id,
      number: "",
      title: opp.title,
      agencyName: opp.funder,
      openDate: "",
      closeDate: opp.deadline ?? "",
      oppStatus: "",
      docType: "",
    });
    return {
      org_id: org.id,
      opportunity_id: opp.id,
      match_score: score,
      match_reasons: reasons,
      win_prob: Math.max(20, score - 15),
    };
  });

  const { error: matchError } = await supabase
    .from("org_opportunities")
    .upsert(matchRows, { onConflict: "org_id,opportunity_id" });

  if (matchError) return { synced: 0, error: matchError.message };

  return { synced: matchRows.length, error: null };
}

/** Fetch this org's matched opportunities, joined with opportunity details. */
export async function fetchOrgOpportunities(orgId: string) {
  const { data, error } = await supabase
    .from("org_opportunities")
    .select("*, opportunity:opportunities(*)")
    .eq("org_id", orgId)
    .order("match_score", { ascending: false });

  return { data: data ?? [], error: error?.message ?? null };
}

/**
 * Moves an opportunity into the pipeline and auto-populates the linked
 * proposal, budget skeleton, and calendar deadline — this is the
 * "auto-populate other menu items" behavior.
 */
export async function addToPipeline(orgId: string, orgOpportunityId: string) {
  const { data: orgOpp, error: fetchError } = await supabase
    .from("org_opportunities")
    .select("*, opportunity:opportunities(*)")
    .eq("id", orgOpportunityId)
    .single();

  if (fetchError || !orgOpp) return { error: fetchError?.message ?? "Opportunity not found" };

  const { error: stageError } = await supabase
    .from("org_opportunities")
    .update({ stage: "qualified" })
    .eq("id", orgOpportunityId);
  if (stageError) return { error: stageError.message };

  const opp = orgOpp.opportunity as any;

  // Auto-create a draft proposal
  const { error: proposalError } = await supabase.from("proposals").insert({
    org_id: orgId,
    org_opportunity_id: orgOpportunityId,
    title: `${opp?.title ?? "Untitled Grant"} — Draft Proposal`,
    status: "draft",
  });
  if (proposalError) return { error: proposalError.message };

  // Auto-create a starter budget line
  const { error: budgetError } = await supabase.from("budgets").insert({
    org_id: orgId,
    org_opportunity_id: orgOpportunityId,
    category: "Personnel",
    label: "Program staffing (edit me)",
    year1: 0,
    year2: 0,
    year3: 0,
  });
  if (budgetError) return { error: budgetError.message };

  // Auto-create a calendar deadline if we have one
  if (opp?.deadline) {
    const { error: calError } = await supabase.from("calendar_events").insert({
      org_id: orgId,
      org_opportunity_id: orgOpportunityId,
      title: `${opp.title} — Submission Deadline`,
      event_date: opp.deadline,
      type: "deadline",
    });
    if (calError) return { error: calError.message };
  }

  return { error: null };
}
