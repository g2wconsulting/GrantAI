import { useCallback, useEffect, useState } from "react";
import { Check, CheckCircle2, Sparkles } from "lucide-react";
import { PROPOSAL_SECTIONS } from "../../data/demoData";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../../styles/classNames";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { fetchProposals } from "../../lib/dataService";
import { supabase } from "../../lib/supabase";

type ProposalRow = {
  id: string;
  title: string;
  status: string;
  content: Record<string, string>;
  org_opportunity: { opportunity: { title: string } } | null;
};

export function ProposalBuilderView() {
  const { org } = useActiveOrg();
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("exec");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!org) return;
    setLoading(true);
    const { data } = await fetchProposals(org.id);
    const list = data as unknown as ProposalRow[];
    setProposals(list);
    setSelectedId((current) => current ?? list[0]?.id ?? null);
    setLoading(false);
  }, [org]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = proposals.find((p) => p.id === selectedId) ?? null;

  useEffect(() => {
    setDraft(selected?.content?.[activeSection] ?? "");
  }, [selected, activeSection]);

  async function saveDraft() {
    if (!selected) return;
    setSaving(true);
    const nextContent = { ...(selected.content ?? {}), [activeSection]: draft };
    await supabase.from("proposals").update({ content: nextContent, updated_at: new Date().toISOString() }).eq("id", selected.id);
    setProposals((prev) => prev.map((p) => (p.id === selected.id ? { ...p, content: nextContent } : p)));
    setSaving(false);
  }

  async function markComplete() {
    if (!selected) return;
    await supabase.from("proposals").update({ status: "submitted" }).eq("id", selected.id);
    await load();
  }

  const sectionsWithContent = PROPOSAL_SECTIONS.map((s) => ({
    ...s,
    status: selected?.content?.[s.id] ? "complete" : "not-started",
  }));
  const completed = sectionsWithContent.filter((s) => s.status === "complete").length;
  const pct = Math.round((completed / sectionsWithContent.length) * 100);
  const current = sectionsWithContent.find((s) => s.id === activeSection)!;

  if (loading) return <p className="text-sm text-slate-400 px-1">Loading proposals…</p>;

  if (proposals.length === 0) {
    return (
      <div className={`${CARD} p-8 text-center`}>
        <p className="text-slate-600 font-medium">No proposals yet</p>
        <p className="text-sm text-slate-400 mt-1">Proposals are created automatically when you add a grant to your pipeline from Discovery.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`${CARD} p-4`}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm text-slate-400 uppercase tracking-wide block mb-1">Proposal</label>
            <select value={selectedId ?? ""} onChange={(e) => setSelectedId(e.target.value)} className="text-sm font-medium text-slate-800 border border-border rounded-lg px-3 py-2 bg-white outline-none w-full max-w-sm hover:border-teal-300">
              {proposals.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400 mb-1">Completion</p>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full" style={{ width: `${pct}%` }} /></div>
              <span className="text-sm font-bold text-slate-700">{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className={`${CARD} p-3 w-52 shrink-0`}>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 px-2">Sections</p>
          <div className="space-y-0.5">
            {sectionsWithContent.map((sec) => (
              <button key={sec.id} onClick={() => setActiveSection(sec.id)} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${activeSection === sec.id ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "text-slate-600 hover:bg-[#edf9f2]"}`}>
                {sec.status === "complete" ? <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${activeSection === sec.id ? "text-white" : "text-emerald-500"}`} /> : <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${activeSection === sec.id ? "border-white/50" : "border-slate-200"}`} />}
                <span className="truncate">{sec.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className={`${CARD} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">{current.label}</h3>
              <span className="text-sm text-slate-400">{draft.split(/\s+/).filter(Boolean).length} words</span>
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={saveDraft}
              className="w-full h-72 text-sm text-slate-700 bg-[#f5fdf8] border border-border rounded-xl p-4 outline-none resize-none leading-relaxed placeholder:text-slate-300 focus:border-teal-300"
              placeholder={`Start writing your ${current.label.toLowerCase()} here...`}
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-slate-400">{saving ? "Saving…" : "Autosaves when you click away"}</p>
              <div className="flex gap-2">
                <button className={BTN_SECONDARY} onClick={saveDraft}><Sparkles className="w-3.5 h-3.5" />Save</button>
                <button className={BTN_PRIMARY} onClick={markComplete}><Check className="w-3.5 h-3.5" />Mark Submitted</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
