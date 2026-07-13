import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, BadgeCheck, Clock, Plus, Trash2, X } from "lucide-react";
import { BTN_PRIMARY, CARD } from "../../styles/classNames";
import { SectionHeader } from "../../components/common/SectionHeader";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { supabase } from "../../lib/supabase";

const STATES = ["Federal", "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const COMMON_CERTS = ["MBE", "WBE", "DBE", "8(a)", "HUBZone", "SDVOSB", "VOSB", "DUNS/UEI Registration", "SAM.gov Registration", "State Business License", "Other"];

type Cert = {
  id: string;
  name: string;
  cert_type: string;
  state: string | null;
  cert_number: string | null;
  issuing_authority: string | null;
  issue_date: string | null;
  expiration_date: string | null;
  status: string;
  notes: string | null;
};

function certUrgency(expiration: string | null): { label: string; color: string; days: number | null } {
  if (!expiration) return { label: "No expiration", color: "bg-slate-100 text-slate-500", days: null };
  const days = Math.ceil((new Date(expiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Expired", color: "bg-red-50 text-red-700", days };
  if (days <= 60) return { label: `Expires in ${days}d`, color: "bg-amber-50 text-amber-700", days };
  return { label: "Active", color: "bg-emerald-50 text-emerald-700", days };
}

export function CertificationsView() {
  const { org } = useActiveOrg();
  const [certs, setCerts] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "MBE",
    cert_type: "Certification",
    state: "Federal",
    cert_number: "",
    issuing_authority: "",
    issue_date: "",
    expiration_date: "",
    notes: "",
  });

  const load = useCallback(async () => {
    if (!org) return;
    setLoading(true);
    const { data } = await supabase.from("certifications").select("*").eq("org_id", org.id).order("expiration_date", { ascending: true, nullsFirst: false });
    setCerts((data as Cert[]) ?? []);
    setLoading(false);
  }, [org]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = filterState === "All" ? certs : certs.filter((c) => c.state === filterState);
  const expiringSoon = certs.filter((c) => {
    const u = certUrgency(c.expiration_date);
    return u.days !== null && u.days >= 0 && u.days <= 60;
  });
  const expired = certs.filter((c) => {
    const u = certUrgency(c.expiration_date);
    return u.days !== null && u.days < 0;
  });

  async function addCert() {
    if (!org || !form.name.trim()) return;
    const status = form.expiration_date && new Date(form.expiration_date) < new Date() ? "Expired" : "Active";
    await supabase.from("certifications").insert({ org_id: org.id, ...form, status });
    setForm({ name: "MBE", cert_type: "Certification", state: "Federal", cert_number: "", issuing_authority: "", issue_date: "", expiration_date: "", notes: "" });
    setShowAdd(false);
    await load();
  }

  async function deleteCert(id: string) {
    await supabase.from("certifications").delete().eq("id", id);
    setCerts((prev) => prev.filter((c) => c.id !== id));
  }

  const statesInUse = ["All", ...Array.from(new Set(certs.map((c) => c.state).filter(Boolean) as string[]))];

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Certifications & Registrations"
        sub={`${certs.length} tracked · ${expiringSoon.length} expiring soon · ${expired.length} expired`}
        action={<button className={BTN_PRIMARY} onClick={() => setShowAdd(true)}><Plus className="w-3.5 h-3.5" />Add Certification</button>}
      />

      {(expired.length > 0 || expiringSoon.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {expired.length > 0 && (
            <div className={`${CARD} p-4 border-red-200 bg-red-50/50`}>
              <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-red-600" /><h3 className="font-semibold text-red-800 text-sm">Expired ({expired.length})</h3></div>
              <div className="space-y-1">
                {expired.map((c) => <p key={c.id} className="text-sm text-red-700">{c.name} {c.state ? `(${c.state})` : ""}</p>)}
              </div>
            </div>
          )}
          {expiringSoon.length > 0 && (
            <div className={`${CARD} p-4 border-amber-200 bg-amber-50/50`}>
              <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-amber-600" /><h3 className="font-semibold text-amber-800 text-sm">Expiring Within 60 Days ({expiringSoon.length})</h3></div>
              <div className="space-y-1">
                {expiringSoon.map((c) => <p key={c.id} className="text-sm text-amber-700">{c.name} {c.state ? `(${c.state})` : ""} — {certUrgency(c.expiration_date).label}</p>)}
              </div>
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <div className={`${CARD} p-4`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">New Certification / Registration</h3>
            <button onClick={() => setShowAdd(false)} className="text-slate-300 hover:text-slate-500"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Certification</label>
              <select value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300">
                {COMMON_CERTS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Type</label>
              <select value={form.cert_type} onChange={(e) => setForm({ ...form, cert_type: e.target.value })} className="w-full text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300">
                <option>Certification</option><option>Registration</option><option>License</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">State / Jurisdiction</label>
              <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300">
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <input placeholder="Certificate/registration number" value={form.cert_number} onChange={(e) => setForm({ ...form, cert_number: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300 col-span-2" />
            <input placeholder="Issuing authority" value={form.issuing_authority} onChange={(e) => setForm({ ...form, issuing_authority: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" />
            <div><label className="text-sm text-slate-400 block mb-1">Issue date</label><input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} className="w-full text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" /></div>
            <div><label className="text-sm text-slate-400 block mb-1">Expiration date</label><input type="date" value={form.expiration_date} onChange={(e) => setForm({ ...form, expiration_date: e.target.value })} className="w-full text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" /></div>
            <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300 col-span-3" />
          </div>
          <button className={`${BTN_PRIMARY} mt-3`} onClick={addCert}><Plus className="w-3.5 h-3.5" />Add</button>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {statesInUse.map((s) => (
          <button key={s} onClick={() => setFilterState(s)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterState === s ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "bg-white border border-border text-slate-500 hover:bg-[#edf9f2]"}`}>{s}</button>
        ))}
      </div>

      {loading && <p className="text-sm text-slate-400 px-1">Loading…</p>}

      {!loading && certs.length === 0 && (
        <div className={`${CARD} p-8 text-center`}>
          <BadgeCheck className="w-6 h-6 text-teal-400 mx-auto mb-2" />
          <p className="text-slate-600 font-medium">No certifications tracked yet</p>
          <p className="text-sm text-slate-400 mt-1">Add your MBE/WBE/DBE certifications, state registrations, and licenses to track expirations across every state you operate in.</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className={`${CARD} overflow-hidden`}>
          <table className="w-full text-sm">
            <thead><tr className="bg-[#f5fdf8]">{["Certification", "Type", "State", "Number", "Expires", "Status", ""].map(h => <th key={h} className="text-left px-4 py-2.5 font-semibold text-slate-500 uppercase tracking-wide text-sm">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((c) => {
                const urgency = certUrgency(c.expiration_date);
                return (
                  <tr key={c.id} className="border-t border-border hover:bg-[#f5fdf8]">
                    <td className="px-4 py-3 font-semibold text-slate-800">{c.name}</td>
                    <td className="px-4 py-3 text-slate-500">{c.cert_type}</td>
                    <td className="px-4 py-3 text-slate-500">{c.state}</td>
                    <td className="px-4 py-3 text-slate-500">{c.cert_number || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{c.expiration_date ? new Date(c.expiration_date).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3"><span className={`text-sm font-medium px-2 py-0.5 rounded-full ${urgency.color}`}>{urgency.label}</span></td>
                    <td className="px-4 py-3"><button onClick={() => deleteCert(c.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
