import { useCallback, useEffect, useRef, useState } from "react";
import { Calendar, ExternalLink, RefreshCw, Search, Sparkles, X } from "lucide-react";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../../styles/classNames";
import { MatchScore } from "../../components/common/MatchScore";
import { TagBadge } from "../../components/common/TagBadge";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { addToPipeline, dismissOpportunity, fetchOrgOpportunities, syncGrantsForOrg } from "../../lib/dataService";
import { grantsGovUrl } from "../../lib/grants";
import { FOCUS_OPTIONS } from "../../lib/constants";
import { supabase } from "../../lib/supabase";

type Row = {
  id: string;
  match_score: number;
  match_reasons: string[];
  win_prob: number;
  stage: string;
  opportunity: {
    id: string;
    title: string;
    funder: string;
    deadline: string | null;
    category: string | null;
    external_id: string | null;
    source_url: string | null;
  };
};

export function DiscoveryView() {
  const { org, refresh } = useActiveOrg();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [aiSearching, setAiSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsProfileInfo, setNeedsProfileInfo] = useState(false);
  const [profileMission, setProfileMission] = useState("");
  const [profileFocusAreas, setProfileFocusAreas] = useState<string[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [programCount, setProgramCount] = useState<number | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const autoTriggered = useRef(false);

  const hasProfileInfo = !!org?.mission?.trim() || (org?.focus_areas?.length ?? 0) > 0;

  useEffect(() => {
    if (!org) return;
    supabase
      .from("org_programs")
      .select("id", { count: "exact", head: true })
      .eq("org_id", org.id)
      .then(({ count }) => setProgramCount(count ?? 0));
  }, [org?.id]);

  const load = useCallback(async () => {
    if (!org) return;
    setLoading(true);
    const { data, error } = await fetchOrgOpportunities(org.id);
    if (error) setError(error);
    else setRows((data as unknown as Row[]).filter((r) => r.stage !== "declined"));
    setLoading(false);
  }, [org]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (org) {
      setProfileMission(org.mission ?? "");
      setProfileFocusAreas(org.focus_areas ?? []);
    }
  }, [org?.id]);

  async function handleSync() {
    if (!org) return;
    setSyncing(true);
    setError(null);
    const result = await syncGrantsForOrg(org);
    if (result.error) setError(result.error);
    setSyncing(false);
    await load();
  }

  async function handleAiSearch() {
    if (!org) return;
    setAiSearching(true);
    setError(null);
    try {
      const res = await fetch("/api/discover-grants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: org.id }),
      });
      let result: { error?: string; message?: string } = {};
      try {
        result = await res.json();
      } catch {
        setError(
          res.status === 504
            ? "The search took too long and timed out on the server — try again in a moment."
            : `The search server returned an unexpected response (status ${res.status}). Try again in a moment.`
        );
        setAiSearching(false);
        await load();
        return;
      }
      if (!res.ok) {
        if (result.error === "needs_profile_info") {
          setNeedsProfileInfo(true);
        } else {
          setError(result.message ?? result.error ?? "AI search failed");
        }
      }
    } catch {
      setError("Couldn't reach the search service — check your connection and try again.");
    }
    setAiSearching(false);
    await load();
  }

  function toggleProfileFocus(f: string) {
    setProfileFocusAreas((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  }

  async function handleSaveProfileAndSearch() {
    if (!org) return;
    if (!profileMission.trim() && profileFocusAreas.length === 0) return;
    setSavingProfile(true);
    setError(null);
    const { error: saveError } = await supabase
      .from("orgs")
      .update({ mission: profileMission.trim() || null, focus_areas: profileFocusAreas })
      .eq("id", org.id);
    setSavingProfile(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    await refresh();
    setNeedsProfileInfo(false);
    autoTriggered.current = true;
    void handleSync();
    void handleAiSearch();
  }

  async function handleAddToPipeline(rowId: string) {
    if (!org) return;
    const result = await addToPipeline(org.id, rowId);
    if (result.error) {
      setError(result.error);
      return;
    }
    setAddedIds((prev) => new Set(prev).add(rowId));
    await load();
  }

  async function handleDismiss(rowId: string) {
    const result = await dismissOpportunity(rowId);
    if (result.error) {
      setError(result.error);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== rowId));
  }

  // First time you land here with nothing yet, go ahead and find grants
  // for you automatically rather than requiring a click — but only once we
  // know enough about the org to search for something relevant.
  useEffect(() => {
    if (loading || rows.length !== 0 || autoTriggered.current || !org) return;
    if (!hasProfileInfo) {
      setNeedsProfileInfo(true);
      return;
    }
    autoTriggered.current = true;
    void handleSync();
    void handleAiSearch();
  }, [loading, rows.length, org, hasProfileInfo]);

  function daysUntil(dateStr: string | null) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const now = new Date();
    return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="space-y-4">
      <div className={`${CARD} p-4`}>
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-[#f0fbf5] rounded-xl px-3 py-2.5 border border-border">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none" placeholder="Search grants by keyword, funder, category, amount..." />
          </div>
          <button onClick={handleSync} disabled={syncing} className={BTN_SECONDARY}>
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync Grants.gov"}
          </button>
          <button onClick={handleAiSearch} disabled={aiSearching} className={BTN_PRIMARY}>
            <Sparkles className={`w-3.5 h-3.5 ${aiSearching ? "animate-pulse" : ""}`} />
            {aiSearching ? "Searching the web…" : "AI Web Search"}
          </button>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-sm text-slate-400">
            Grants.gov (federal) + AI web search (foundations, corporate, state/local), matched against: {org?.focus_areas?.join(", ") || "your org profile"}
          </span>
          <span className="ml-auto text-sm text-slate-400">{rows.length} opportunities</span>
        </div>
      </div>

      {!needsProfileInfo && programCount === 0 && !bannerDismissed && (
        <div className={`${CARD} p-4 flex items-start gap-3`}>
          <Sparkles className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700">Get more, better-matched grants</p>
            <p className="text-sm text-slate-400 mt-0.5">
              The AI search is more specific — and finds more opportunities — when it knows about the actual programs you run, not just your mission. Add a few in{" "}
              <a href="/organizations" className="text-teal-600 hover:underline">Org Profile → Programs</a>.
            </p>
          </div>
          <button onClick={() => setBannerDismissed(true)} className="text-slate-300 hover:text-slate-500 shrink-0"><X className="w-4 h-4" /></button>
        </div>
      )}

      {needsProfileInfo && (
        <div className={`${CARD} p-6`}>
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-teal-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Tell us a bit more about your organization</h3>
              <p className="text-sm text-slate-500 mt-1">
                To search the web for grants, proposals, and RFPs that actually fit you, we need at least a short mission statement or a few focus areas. This is saved to your org profile and used for every future match.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-600">What does your organization do? Who does it serve?</label>
              <textarea
                value={profileMission}
                onChange={(e) => setProfileMission(e.target.value)}
                rows={3}
                className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-200"
                placeholder="e.g. We provide workforce training and job placement for young adults in Chicago."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Focus areas (pick all that apply)</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {FOCUS_OPTIONS.map((f) => (
                  <button
                    type="button"
                    key={f}
                    onClick={() => toggleProfileFocus(f)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${profileFocusAreas.includes(f) ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white border-transparent" : "bg-white border-border text-slate-600 hover:border-teal-200"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleSaveProfileAndSearch}
              disabled={savingProfile || (!profileMission.trim() && profileFocusAreas.length === 0)}
              className={`${BTN_PRIMARY} mt-1`}
            >
              {savingProfile ? "Saving…" : "Save & Find Grants"}
            </button>
          </div>
        </div>
      )}

      {!needsProfileInfo && (loading || syncing || aiSearching) && (
        <p className="text-sm text-slate-400 px-1">
          {syncing || aiSearching ? "Finding grants that match your mission — this runs automatically, no need to click anything…" : "Loading matched grants…"}
        </p>
      )}

      {!needsProfileInfo && !loading && !syncing && !aiSearching && rows.length === 0 && (
        <div className={`${CARD} p-8 text-center`}>
          <Sparkles className="w-6 h-6 text-teal-400 mx-auto mb-2" />
          <p className="text-slate-600 font-medium">No matching grants found yet</p>
          <p className="text-sm text-slate-400 mt-1">We searched Grants.gov and the web based on your org profile. Try updating your mission/focus areas in Settings for better matches, then click Sync again.</p>
        </div>
      )}

      <div className="space-y-3">
        {rows.map((row) => {
          const opp = row.opportunity;
          const days = daysUntil(opp.deadline);
          const urgent = days !== null && days <= 7;
          const added = row.stage !== "researching" || addedIds.has(row.id);

          return (
            <div key={row.id} className={`${CARD} p-5 hover:shadow-md transition-all`}>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0 text-white font-bold text-sm">{row.match_score}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 text-base">{opp.title}</h3>
                        {row.match_score >= 80 && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#e8faf0] text-teal-800 rounded text-sm font-semibold border border-teal-100"><Sparkles className="w-2.5 h-2.5" />AI Pick</span>}
                      </div>
                      <p className="text-sm text-slate-400 mt-0.5">{opp.funder}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {opp.deadline && (
                        <div className="mt-1">
                          <p className={`text-sm font-bold ${urgent ? "text-red-600" : "text-slate-700"}`}>Due {new Date(opp.deadline).toLocaleDateString()}</p>
                          {urgent && days !== null && <p className="text-sm font-semibold text-red-500 mt-0.5">{days} day{days !== 1 ? "s" : ""} left!</p>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                    {opp.category && <TagBadge tag={opp.category} />}
                    <div className="flex items-center gap-1.5"><span className="text-sm text-slate-400">Match:</span><MatchScore score={row.match_score} /></div>
                    <div className="flex items-center gap-1"><span className="text-sm text-slate-400">Win prob:</span><span className="text-sm font-semibold text-emerald-600 ml-1">{row.win_prob}%</span></div>
                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /><span className="text-sm text-slate-400 capitalize">{row.stage}</span></div>
                  </div>
                  {row.match_reasons?.length > 0 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-[#e8f8f5] to-[#e2f9e8] rounded-lg border border-teal-100">
                      <div className="flex items-start gap-2"><Sparkles className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" /><p className="text-sm text-teal-900 leading-relaxed">{row.match_reasons.join(" · ")}</p></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                <button onClick={() => handleAddToPipeline(row.id)} disabled={added} className={BTN_PRIMARY}>
                  {added ? "In Pipeline ✓" : "Add to Pipeline"}
                </button>
                <button onClick={() => handleDismiss(row.id)} disabled={added} className={BTN_SECONDARY}>
                  <X className="w-3.5 h-3.5" />Dismiss
                </button>
                <div className="ml-auto">
                  {opp.source_url ? (
                    <a href={opp.source_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-teal-600 transition-colors">
                      <ExternalLink className="w-3 h-3" />View Source
                    </a>
                  ) : opp.external_id ? (
                    <a href={grantsGovUrl(opp.external_id)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-teal-600 transition-colors">
                      <ExternalLink className="w-3 h-3" />View on Grants.gov
                    </a>
                  ) : (
                    <span className="flex items-center gap-1.5 text-sm text-slate-300"><ExternalLink className="w-3 h-3" />No link available</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
