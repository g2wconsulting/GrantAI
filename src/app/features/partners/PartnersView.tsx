import { useCallback, useEffect, useState } from "react";
import { MoreHorizontal, Plus, UserPlus, X } from "lucide-react";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../../styles/classNames";
import { SectionHeader } from "../../components/common/SectionHeader";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { supabase } from "../../lib/supabase";

const STAGE_COLORS: Record<string, string> = {
  Prospect: "bg-slate-100 text-slate-500",
  Engaged: "bg-blue-50 text-blue-700",
  Active: "bg-emerald-50 text-emerald-700",
  Formalized: "bg-teal-50 text-teal-700",
};

type Partner = { id: string; name: string; type: string; role: string; stage: string; contact: string | null; last_contact: string | null };

export function PartnersView() {
  const { org } = useActiveOrg();
  const [filter, setFilter] = useState("All");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", type: "University", role: "", contact: "" });

  const types = ["All", "University", "Government", "Funder", "Workforce Agency", "Corporate"];

  const load = useCallback(async () => {
    if (!org) return;
    setLoading(true);
    const { data } = await supabase.from("partners").select("*").eq("org_id", org.id).order("name");
    setPartners((data as Partner[]) ?? []);
    setLoading(false);
  }, [org]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = filter === "All" ? partners : partners.filter((p) => p.type === filter);

  async function addPartner() {
    if (!org || !form.name.trim()) return;
    await supabase.from("partners").insert({
      org_id: org.id,
      name: form.name,
      type: form.type,
      role: form.role,
      contact: form.contact,
      stage: "Prospect",
    });
    setForm({ name: "", type: "University", role: "", contact: "" });
    setShowAdd(false);
    await load();
  }

  async function deletePartner(id: string) {
    await supabase.from("partners").delete().eq("id", id);
    setPartners((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-4">
      <SectionHeader title="Partner CRM" sub={`${partners.length} partner${partners.length === 1 ? "" : "s"}`} action={<button className={BTN_PRIMARY} onClick={() => setShowAdd(true)}><UserPlus className="w-3.5 h-3.5" />Add Partner</button>} />

      {showAdd && (
        <div className={`${CARD} p-4`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">New Partner</h3>
            <button onClick={() => setShowAdd(false)} className="text-slate-300 hover:text-slate-500"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Organization name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300">
              {types.slice(1).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input placeholder="Role (e.g. Fiscal Sponsor)" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" />
            <input placeholder="Contact name/email" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" />
          </div>
          <button className={`${BTN_PRIMARY} mt-3`} onClick={addPartner}><Plus className="w-3.5 h-3.5" />Add Partner</button>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === t ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "bg-white border border-border text-slate-500 hover:bg-[#edf9f2]"}`}>{t}</button>
        ))}
      </div>

      {loading && <p className="text-sm text-slate-400 px-1">Loading partners…</p>}

      {!loading && partners.length === 0 && (
        <div className={`${CARD} p-8 text-center`}>
          <p className="text-slate-600 font-medium">No partners yet</p>
          <p className="text-sm text-slate-400 mt-1">Add universities, funders, government agencies, or corporate partners to track relationships here.</p>
        </div>
      )}

      {partners.length > 0 && (
        <div className={`${CARD} overflow-hidden`}>
          <table className="w-full">
            <thead><tr className="bg-[#f5fdf8]">{["Partner", "Type", "Role", "Stage", "Last Contact", ""].map(h => <th key={h} className="text-left px-4 py-2.5 text-sm font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-[#f5fdf8] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-base font-semibold text-slate-800">{p.name}</p>
                    {p.contact && <p className="text-sm text-slate-400">{p.contact}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{p.type}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.role || "—"}</td>
                  <td className="px-4 py-3"><span className={`text-sm font-medium px-2 py-0.5 rounded-full ${STAGE_COLORS[p.stage] ?? STAGE_COLORS.Prospect}`}>{p.stage}</span></td>
                  <td className="px-4 py-3 text-sm text-slate-400">{p.last_contact ? new Date(p.last_contact).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deletePartner(p.id)} className="text-slate-300 hover:text-red-500 p-1"><MoreHorizontal className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
