import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { BTN_PRIMARY, CARD } from "../../styles/classNames";
import { SectionHeader } from "../../components/common/SectionHeader";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { fetchOrgOpportunities, removeFromPipeline, updatePipelineStage } from "../../lib/dataService";
import { grantsGovUrl } from "../../lib/grants";

const COLS = [
  { id: "researching", label: "Researching", dot: "bg-slate-400" },
  { id: "qualified", label: "Qualified", dot: "bg-blue-400" },
  { id: "writing", label: "Writing", dot: "bg-amber-400" },
  { id: "submitted", label: "Submitted", dot: "bg-purple-400" },
  { id: "awarded", label: "Awarded", dot: "bg-emerald-400" },
];

type Row = {
  id: string;
  match_score: number;
  stage: string;
  opportunity: { id: string; title: string; funder: string; deadline: string | null; external_id: string | null };
};

export function PipelineView() {
  const { org } = useActiveOrg();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!org) return;
    setLoading(true);
    const { data } = await fetchOrgOpportunities(org.id);
    setRows(data as unknown as Row[]);
    setLoading(false);
  }, [org]);

  useEffect(() => {
    load();
  }, [load]);

  async function moveStage(rowId: string, stage: string) {
    const prevRows = rows;
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, stage } : r)));
    const { error } = await updatePipelineStage(rowId, stage);
    if (error) {
      setRows(prevRows);
      setError(error);
    }
  }

  async function handleRemove(rowId: string, title: string) {
    if (!window.confirm(`Remove "${title}" from your pipeline? This also deletes its draft proposal, budget lines, and calendar deadlines.`)) return;
    setError(null);
    const prevRows = rows;
    setRows((prev) => prev.filter((r) => r.id !== rowId));
    const { error } = await removeFromPipeline(rowId);
    if (error) {
      setRows(prevRows);
      setError(error);
    }
  }

  const totalValueLabel = `${rows.length} grants in pipeline`;

  return (
    <div>
      <SectionHeader
        title="Grant Pipeline"
        sub={totalValueLabel}
        action={<button className={BTN_PRIMARY} onClick={load}><Plus className="w-3.5 h-3.5" />Refresh</button>}
      />

      {error && <p className="text-sm text-red-600 px-1 mb-4">{error}</p>}

      {loading && <p className="text-sm text-slate-400 px-1 mb-4">Loading pipeline…</p>}

      {!loading && rows.length === 0 && (
        <div className={`${CARD} p-8 text-center mb-4`}>
          <p className="text-slate-600 font-medium">Nothing in your pipeline yet</p>
          <p className="text-sm text-slate-400 mt-1">Go to Discovery, sync live grants, and click "Add to Pipeline" on ones you want to pursue.</p>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-6">
        {COLS.map((col) => {
          const cards = rows.filter((r) => r.stage === col.id);
          return (
            <div key={col.id} className="w-64 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="text-base font-semibold text-slate-700">{col.label}</span>
                  <span className="text-sm text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{cards.length}</span>
                </div>
              </div>
              <div className="space-y-2.5">
                {cards.map((card) => (
                  <div key={card.id} className={`${CARD} p-3.5 hover:shadow-md transition-all group`}>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <p className="text-base font-semibold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">{card.opportunity.title}</p>
                      <button
                        onClick={() => handleRemove(card.id, card.opportunity.title)}
                        className="text-slate-300 hover:text-red-500 transition-colors shrink-0 p-0.5"
                        title="Remove from pipeline"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">{card.opportunity.funder}</span>
                      {card.opportunity.deadline && <span className="text-sm text-slate-400">{new Date(card.opportunity.deadline).toLocaleDateString()}</span>}
                    </div>
                    <div className="mb-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-400">AI Match</span>
                        <span className="text-sm font-bold text-teal-700">{card.match_score}%</span>
                      </div>
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${card.match_score}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={card.stage}
                        onChange={(e) => moveStage(card.id, e.target.value)}
                        className="flex-1 text-sm border border-border rounded-md px-1.5 py-1 outline-none"
                      >
                        {COLS.map((c) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                      {card.opportunity.external_id && (
                        <a href={grantsGovUrl(card.opportunity.external_id)} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-teal-600 transition-colors shrink-0">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
