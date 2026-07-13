import { useCallback, useEffect, useState } from "react";
import { Check, ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../../styles/classNames";
import { SectionHeader } from "../../components/common/SectionHeader";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { fetchOrgOpportunities } from "../../lib/dataService";
import { supabase } from "../../lib/supabase";
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", funder: "", deadline: "" });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, stage } : r)));
    await supabase.from("org_opportunities").update({ stage }).eq("id", rowId);
  }

  function startEdit(row: Row) {
    setEditingId(row.id);
    setEditForm({
      title: row.opportunity.title,
      funder: row.opportunity.funder,
      deadline: row.opportunity.deadline ?? "",
    });
  }

  async function saveEdit(row: Row) {
    await supabase
      .from("opportunities")
      .update({ title: editForm.title, funder: editForm.funder, deadline: editForm.deadline || null })
      .eq("id", row.opportunity.id);
    setEditingId(null);
    await load();
  }

  async function deleteFromPipeline(rowId: string) {
    await supabase.from("org_opportunities").delete().eq("id", rowId);
    setRows((prev) => prev.filter((r) => r.id !== rowId));
    setConfirmDeleteId(null);
  }

  const totalValueLabel = `${rows.length} grants in pipeline`;

  return (
    <div>
      <SectionHeader
        title="Grant Pipeline"
        sub={totalValueLabel}
        action={<button className={BTN_PRIMARY} onClick={load}><Plus className="w-3.5 h-3.5" />Refresh</button>}
      />

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
                    {editingId === card.id ? (
                      <div className="space-y-2 mb-2.5">
                        <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full text-sm font-semibold border border-teal-300 rounded-md px-2 py-1 outline-none" placeholder="Title" />
                        <input value={editForm.funder} onChange={(e) => setEditForm({ ...editForm, funder: e.target.value })} className="w-full text-sm border border-border rounded-md px-2 py-1 outline-none" placeholder="Funder" />
                        <input type="date" value={editForm.deadline} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} className="w-full text-sm border border-border rounded-md px-2 py-1 outline-none" />
                        <div className="flex gap-1.5">
                          <button onClick={() => saveEdit(card)} className={`${BTN_PRIMARY} text-sm flex-1 justify-center py-1`}><Check className="w-3 h-3" />Save</button>
                          <button onClick={() => setEditingId(null)} className={`${BTN_SECONDARY} text-sm py-1`}><X className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-base font-semibold text-slate-900 leading-snug mb-2.5 group-hover:text-teal-700 transition-colors">{card.opportunity.title}</p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-400">{card.opportunity.funder}</span>
                          {card.opportunity.deadline && <span className="text-sm text-slate-400">{new Date(card.opportunity.deadline).toLocaleDateString()}</span>}
                        </div>
                      </>
                    )}

                    <div className="mb-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-400">AI Match</span>
                        <span className="text-sm font-bold text-teal-700">{card.match_score}%</span>
                      </div>
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${card.match_score}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={card.stage}
                        onChange={(e) => moveStage(card.id, e.target.value)}
                        className="flex-1 text-sm border border-border rounded-md px-1.5 py-1 outline-none"
                      >
                        {COLS.map((c) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                      {card.opportunity.external_id && !card.opportunity.external_id.startsWith("manual:") && (
                        <a href={grantsGovUrl(card.opportunity.external_id)} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-teal-600 transition-colors shrink-0">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button onClick={() => startEdit(card)} className="text-slate-300 hover:text-teal-600 transition-colors shrink-0"><Pencil className="w-3.5 h-3.5" /></button>
                      {confirmDeleteId === card.id ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => deleteFromPipeline(card.id)} className="text-red-500 hover:text-red-700"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setConfirmDeleteId(null)} className="text-slate-300 hover:text-slate-500"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(card.id)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
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
