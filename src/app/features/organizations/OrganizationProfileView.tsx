import { useState } from "react";
import { Briefcase, Check, MapPin, Pencil, X } from "lucide-react";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../../styles/classNames";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { supabase } from "../../lib/supabase";

const FOCUS_OPTIONS = ["Workforce Development", "Education", "Healthcare", "Housing", "Environment", "Arts & Culture", "Youth Services", "Digital Equity / Technology", "Food Security", "Community Development"];

export function OrganizationProfileView() {
  const { org, refresh } = useActiveOrg();
  const [tab, setTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(org);
  const [saving, setSaving] = useState(false);
  const circumference = 2 * Math.PI * 38;

  if (!org) return null;
  const readiness = org.readiness ?? 50;
  const dash = circumference * (readiness / 100);

  function startEdit() {
    setForm(org);
    setEditing(true);
  }

  function toggleFocus(f: string) {
    if (!form) return;
    setForm({ ...form, focus_areas: form.focus_areas.includes(f) ? form.focus_areas.filter((x) => x !== f) : [...form.focus_areas, f] });
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    await supabase
      .from("orgs")
      .update({
        name: form.name,
        type: form.type,
        city: form.city,
        ein: form.ein,
        uei: form.uei,
        mission: form.mission,
        focus_areas: form.focus_areas,
        budget_size: form.budget_size,
        staff_count: form.staff_count,
      })
      .eq("id", org.id);
    await refresh();
    setSaving(false);
    setEditing(false);
  }

  return (
    <div className="space-y-5">
      <div className={`${CARD} p-5`}>
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0 text-white text-xl font-bold">{org.short}</div>
          <div className="flex-1">
            {!editing ? (
              <>
                <h2 className="text-lg font-bold text-slate-900">{org.name}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                  {org.city && <span className="flex items-center gap-1 text-sm text-slate-500"><MapPin className="w-3 h-3" />{org.city}</span>}
                  {org.type && <span className="flex items-center gap-1 text-sm text-slate-500"><Briefcase className="w-3 h-3" />{org.type}</span>}
                  {org.ein && <span className="text-sm text-slate-500">EIN: {org.ein}</span>}
                  {org.uei && <span className="text-sm text-slate-500">UEI: {org.uei}</span>}
                  {org.staff_count != null && <span className="text-sm text-slate-500">{org.staff_count} Staff</span>}
                  {org.budget_size && <span className="text-sm text-slate-500">Budget: {org.budget_size}</span>}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-w-2xl">
                <div><label className="text-sm text-slate-400 block mb-1">Name</label><input value={form?.name ?? ""} onChange={(e) => setForm({ ...form!, name: e.target.value })} className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-teal-300" /></div>
                <div><label className="text-sm text-slate-400 block mb-1">Type</label><input value={form?.type ?? ""} onChange={(e) => setForm({ ...form!, type: e.target.value })} className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-teal-300" /></div>
                <div><label className="text-sm text-slate-400 block mb-1">City, State</label><input value={form?.city ?? ""} onChange={(e) => setForm({ ...form!, city: e.target.value })} className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-teal-300" /></div>
                <div><label className="text-sm text-slate-400 block mb-1">Budget size</label><input value={form?.budget_size ?? ""} onChange={(e) => setForm({ ...form!, budget_size: e.target.value })} className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-teal-300" /></div>
                <div><label className="text-sm text-slate-400 block mb-1">EIN</label><input value={form?.ein ?? ""} onChange={(e) => setForm({ ...form!, ein: e.target.value })} className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-teal-300" /></div>
                <div><label className="text-sm text-slate-400 block mb-1">UEI</label><input value={form?.uei ?? ""} onChange={(e) => setForm({ ...form!, uei: e.target.value })} className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-teal-300" /></div>
                <div><label className="text-sm text-slate-400 block mb-1">Staff count</label><input type="number" value={form?.staff_count ?? ""} onChange={(e) => setForm({ ...form!, staff_count: Number(e.target.value) })} className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-teal-300" /></div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center">
              <svg width="96" height="96" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="38" fill="none" stroke="#e2f9e8" strokeWidth="8" />
                <circle cx="48" cy="48" r="38" fill="none" stroke="url(#scoreGrad)" strokeWidth="8" strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round" transform="rotate(-90 48 48)" />
                <defs><linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#14b8a6" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
                <text x="48" y="44" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1a2e24">{readiness}</text>
                <text x="48" y="58" textAnchor="middle" fontSize="9" fill="#94a3b8">/100</text>
              </svg>
              <p className="text-sm font-semibold text-slate-600 -mt-1">Profile Completeness</p>
            </div>
            {!editing ? (
              <button onClick={startEdit} className={BTN_SECONDARY}><Pencil className="w-3.5 h-3.5" />Edit</button>
            ) : (
              <div className="flex flex-col gap-2">
                <button onClick={save} disabled={saving} className={BTN_PRIMARY}><Check className="w-3.5 h-3.5" />{saving ? "Saving…" : "Save"}</button>
                <button onClick={() => setEditing(false)} className={BTN_SECONDARY}><X className="w-3.5 h-3.5" />Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-white border border-border rounded-xl p-1 w-fit">
        {["overview", "programs", "team", "financials", "history"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "text-slate-500 hover:text-slate-800"}`}>{t}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-2 gap-4">
          <div className={`${CARD} p-5`}>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Mission</h3>
            {!editing ? (
              <p className="text-sm text-slate-700 leading-relaxed">{org.mission || "No mission statement on file yet — click Edit above to add one and improve grant matching."}</p>
            ) : (
              <textarea value={form?.mission ?? ""} onChange={(e) => setForm({ ...form!, mission: e.target.value })} rows={5} className="w-full text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300 resize-none" />
            )}
          </div>
          <div className={`${CARD} p-5`}>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Focus Areas</h3>
            {!editing ? (
              org.focus_areas?.length ? (
                <div className="flex flex-wrap gap-1.5">{org.focus_areas.map((f) => <span key={f} className="text-sm bg-[#e8faf0] text-teal-700 px-2 py-0.5 rounded-full">{f}</span>)}</div>
              ) : (
                <p className="text-sm text-slate-400">No focus areas set yet — click Edit above to add some.</p>
              )
            ) : (
              <div className="flex flex-wrap gap-2">
                {FOCUS_OPTIONS.map((f) => (
                  <button key={f} type="button" onClick={() => toggleFocus(f)} className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${form?.focus_areas.includes(f) ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white border-transparent" : "bg-white border-border text-slate-600 hover:border-teal-200"}`}>{f}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "programs" && (
        <div className={`${CARD} p-8 text-center`}>
          <p className="text-slate-600 font-medium">No programs added yet</p>
          <p className="text-sm text-slate-400 mt-1">Program tracking is coming soon — for now, use Proposals and Budgets to manage individual grant-funded work.</p>
        </div>
      )}

      {tab === "team" && (
        <div className={`${CARD} p-8 text-center`}>
          <p className="text-slate-600 font-medium">No team members added yet</p>
          <p className="text-sm text-slate-400 mt-1">Board and staff roster tracking is coming soon.</p>
        </div>
      )}

      {tab === "financials" && (
        <div className={`${CARD} p-8 text-center`}>
          <p className="text-slate-600 font-medium">No financial data yet</p>
          <p className="text-sm text-slate-400 mt-1">Connect budgets to grants in the Budgets tab to start tracking spend here.</p>
        </div>
      )}

      {tab === "history" && (
        <div className={`${CARD} p-8 text-center`}>
          <p className="text-slate-600 font-medium">No award history yet</p>
          <p className="text-sm text-slate-400 mt-1">Awarded grants from your Pipeline will appear here automatically.</p>
        </div>
      )}
    </div>
  );
}
