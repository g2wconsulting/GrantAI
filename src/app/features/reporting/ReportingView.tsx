import { useCallback, useEffect, useState } from "react";
import { Plus, Sparkles, X } from "lucide-react";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../../styles/classNames";
import { SectionHeader } from "../../components/common/SectionHeader";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { supabase } from "../../lib/supabase";

type ReportRow = { id: string; name: string; due_date: string | null; status: string };

export function ReportingView() {
  const { org } = useActiveOrg();
  const [tab, setTab] = useState("grant reports");
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", due_date: "" });

  const load = useCallback(async () => {
    if (!org) return;
    setLoading(true);
    const { data } = await supabase.from("reports").select("*").eq("org_id", org.id).order("due_date");
    setReports((data as ReportRow[]) ?? []);
    setLoading(false);
  }, [org]);

  useEffect(() => {
    load();
  }, [load]);

  async function addReport() {
    if (!org || !form.name.trim()) return;
    await supabase.from("reports").insert({ org_id: org.id, name: form.name, due_date: form.due_date || null, status: "Not Started" });
    setForm({ name: "", due_date: "" });
    setShowAdd(false);
    await load();
  }

  async function updateStatus(id: string, status: string) {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    await supabase.from("reports").update({ status }).eq("id", id);
  }

  return (
    <div className="space-y-5">
      <SectionHeader title="Reporting & Impact" sub={org?.name ?? ""} />

      <div className="flex items-center gap-1 bg-white border border-border rounded-xl p-1 w-fit">
        {["grant reports", "outcomes", "financials"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "text-slate-500 hover:text-slate-800"}`}>{t}</button>
        ))}
      </div>

      {tab === "grant reports" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className={BTN_PRIMARY} onClick={() => setShowAdd(true)}><Plus className="w-3.5 h-3.5" />Add Report</button>
          </div>

          {showAdd && (
            <div className={`${CARD} p-4`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800">New Report</h3>
                <button onClick={() => setShowAdd(false)} className="text-slate-300 hover:text-slate-500"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Report name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" />
                <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" />
              </div>
              <button className={`${BTN_PRIMARY} mt-3`} onClick={addReport}><Plus className="w-3.5 h-3.5" />Add</button>
            </div>
          )}

          {loading && <p className="text-sm text-slate-400 px-1">Loading…</p>}

          {!loading && reports.length === 0 && (
            <div className={`${CARD} p-8 text-center`}>
              <p className="text-slate-600 font-medium">No reports yet</p>
              <p className="text-sm text-slate-400 mt-1">Add upcoming reporting deadlines here to track them.</p>
            </div>
          )}

          {reports.length > 0 && (
            <div className={`${CARD} overflow-hidden`}>
              <table className="w-full text-sm">
                <thead><tr className="bg-[#f5fdf8]">{["Report", "Due Date", "Status"].map(h => <th key={h} className="text-left px-4 py-2.5 font-semibold text-slate-400 uppercase tracking-wide text-sm">{h}</th>)}</tr></thead>
                <tbody>
                  {reports.map(r => (
                    <tr key={r.id} className="border-t border-border hover:bg-[#f5fdf8]">
                      <td className="px-4 py-3 font-semibold text-slate-800">{r.name}</td>
                      <td className="px-4 py-3 text-slate-600">{r.due_date ? new Date(r.due_date).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3">
                        <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className="text-sm border border-border rounded-md px-2 py-1 outline-none">
                          {["Not Started", "In Progress", "Due Soon", "Submitted"].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "outcomes" && (
        <div className={`${CARD} p-8 text-center`}>
          <p className="text-slate-600 font-medium">No outcome metrics tracked yet</p>
          <p className="text-sm text-slate-400 mt-1">Outcomes tracking (participants served, credentials earned, etc.) is coming soon.</p>
        </div>
      )}

      {tab === "financials" && (
        <div className={`${CARD} p-8 text-center`}>
          <p className="text-slate-600 font-medium">No financial reporting data yet</p>
          <p className="text-sm text-slate-400 mt-1">Add budgets to your grants in the Budgets tab — spend summaries will appear here automatically as that data grows.</p>
        </div>
      )}
    </div>
  );
}
