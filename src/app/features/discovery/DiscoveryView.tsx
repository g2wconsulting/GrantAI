import { useCallback, useEffect, useState } from "react";
import { Calendar, ExternalLink, RefreshCw, Search, Sparkles } from "lucide-react";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../../styles/classNames";
import { MatchScore } from "../../components/common/MatchScore";
import { TagBadge } from "../../components/common/TagBadge";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { addToPipeline, fetchOrgOpportunities, syncGrantsForOrg } from "../../lib/dataService";

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
  };
};

export function DiscoveryView() {
  const { org } = useActiveOrg();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!org) return;
    setLoading(true);
    const { data, error } = await fetchOrgOpportunities(org.id);
    if (error) setError(error);
    else setRows(data as unknown as Row[]);
    setLoading(false);
  }, [org]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSync() {
    if (!org) return;
    setSyncing(true);
    setError(null);
    const result = await syncGrantsForOrg(org);
    if (result.error) setError(result.error);
    setSyncing(false);
    await load();
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
          <button onClick={handleSync} disabled={syncing} className={BTN_PRIMARY}>
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync Live Grants"}
          </button>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-sm text-slate-400">
            Pulling from Grants.gov, matched against: {org?.focus_areas?.join(", ") || "your org profile"}
          </span>
          <span className="ml-auto text-sm text-slate-400">{rows.length} opportunities</span>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-400 px-1">Loading matched grants…</p>}

      {!loading && rows.length === 0 && (
        <div className={`${CARD} p-8 text-center`}>
          <Sparkles className="w-6 h-6 text-teal-400 mx-auto mb-2" />
          <p className="text-slate-600 font-medium">No grants synced yet</p>
          <p className="text-sm text-slate-400 mt-1">Click "Sync Live Grants" to pull current opportunities from Grants.gov and score them against your organization profile.</p>
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
                <div className="ml-auto flex items-center gap-1.5 text-sm text-slate-300 hover:text-slate-500 cursor-pointer transition-colors"><ExternalLink className="w-3 h-3" />Grants.gov</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
