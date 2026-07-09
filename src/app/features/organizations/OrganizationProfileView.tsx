import { useCallback, useEffect, useState } from "react";
import { Briefcase, MapPin, Plus, Trash2 } from "lucide-react";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../../styles/classNames";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { supabase } from "../../lib/supabase";
import { fetchAwardedGrants, fetchGrantHistory } from "../../lib/dataService";

const FOCUS_OPTIONS = ["Workforce Development", "Education", "Healthcare", "Housing", "Environment", "Arts & Culture", "Youth Services", "Digital Equity / Technology", "Food Security", "Community Development"];

type Program = { id: string; name: string; description: string | null; budget: string | null; people_served: string | null; outcome: string | null };
type TeamMember = { id: string; name: string; title: string | null; member_type: string; since_year: string | null };
type HistoryRow = { id: string; name: string; funder: string | null; amount: string | null; period: string | null; status: string };

export function OrganizationProfileView() {
  const { org, refresh } = useActiveOrg();
  const [tab, setTab] = useState("overview");
  const [form, setForm] = useState(org);
  const [savedField, setSavedField] = useState<string | null>(null);

  const [programs, setPrograms] = useState<Program[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [awarded, setAwarded] = useState<any[]>([]);
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showHistoryForm, setShowHistoryForm] = useState(false);
  const [programForm, setProgramForm] = useState({ name: "", description: "", budget: "", people_served: "", outcome: "" });
  const [teamForm, setTeamForm] = useState({ name: "", title: "", member_type: "Staff", since_year: "" });
  const [historyForm, setHistoryForm] = useState({ name: "", funder: "", amount: "", period: "", status: "Awarded" });

  const circumference = 2 * Math.PI * 38;

  const loadExtras = useCallback(async () => {
    if (!org) return;
    const [{ data: p }, { data: t }, { data: h, error: hErr }, { data: a }] = await Promise.all([
      supabase.from("org_programs").select("*").eq("org_id", org.id),
      supabase.from("org_team_members").select("*").eq("org_id", org.id),
      fetchGrantHistory(org.id).then((r) => ({ data: r.data, error: r.error })),
      fetchAwardedGrants(org.id).then((r) => ({ data: r.data })),
    ]);
    setPrograms((p as Program[]) ?? []);
    setTeam((t as TeamMember[]) ?? []);
    setHistory((h as HistoryRow[]) ?? []);
    setAwarded(a ?? []);
  }, [org]);

  useEffect(() => {
    loadExtras();
  }, [loadExtras]);

  if (!org) return null;
  if (!form) setForm(org);
  const readiness = org.readiness ?? 50;
  const dash = circumference * (readiness / 100);

  async function saveField(field: string, value: any) {
    await supabase.from("orgs").update({ [field]: value }).eq("id", org!.id);
    await refresh();
    setSavedField(field);
    setTimeout(() => setSavedField(null), 2000);
  }

  function toggleFocus(f: string) {
    if (!form) return;
    const next = form.focus_areas.includes(f) ? form.focus_areas.filter((x) => x !== f) : [...form.focus_areas, f];
    setForm({ ...form, focus_areas: next });
    saveField("focus_areas", next);
  }

  async function addProgram() {
    if (!org || !programForm.name.trim()) return;
    await supabase.from("org_programs").insert({ org_id: org.id, ...programForm });
    setProgramForm({ name: "", description: "", budget: "", people_served: "", outcome: "" });
    setShowProgramForm(false);
    await loadExtras();
  }
  async function deleteProgram(id: string) {
    await supabase.from("org_programs").delete().eq("id", id);
    setPrograms((prev) => prev.filter((p) => p.id !== id));
  }

  async function addTeamMember() {
    if (!org || !teamForm.name.trim()) return;
    await supabase.from("org_team_members").insert({ org_id: org.id, ...teamForm });
    setTeamForm({ name: "", title: "", member_type: "Staff", since_year: "" });
    setShowTeamForm(false);
    await loadExtras();
  }
  async function deleteTeamMember(id: string) {
    await supabase.from("org_team_members").delete().eq("id", id);
    setTeam((prev) => prev.filter((t) => t.id !== id));
  }

  async function addHistory() {
    if (!org || !historyForm.name.trim()) return;
    await supabase.from("grant_history").insert({ org_id: org.id, ...historyForm });
    setHistoryForm({ name: "", funder: "", amount: "", period: "", status: "Awarded" });
    setShowHistoryForm(false);
    await loadExtras();
  }
  async function deleteHistory(id: string) {
    await supabase.from("grant_history").delete().eq("id", id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }

  return (
    <div className="space-y-5">
      <div className={`${CARD} p-5`}>
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0 text-white text-xl font-bold">{org.short}</div>
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <input value={form?.name ?? ""} onChange={(e) => setForm({ ...form!, name: e.target.value })} onBlur={(e) => saveField("name", e.target.value)} className="text-lg font-bold text-slate-900 w-full outline-none border-b border-transparent focus:border-teal-300 bg-transparent" />
            </div>
            <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400 shrink-0" /><input value={form?.city ?? ""} onChange={(e) => setForm({ ...form!, city: e.target.value })} onBlur={(e) => saveField("city", e.target.value)} placeholder="City, State" className="text-sm text-slate-500 outline-none border-b border-transparent focus:border-teal-300 bg-transparent w-full" /></div>
            <div className="flex items-center gap-1"><Briefcase className="w-3 h-3 text-slate-400 shrink-0" /><input value={form?.type ?? ""} onChange={(e) => setForm({ ...form!, type: e.target.value })} onBlur={(e) => saveField("type", e.target.value)} placeholder="Org type" className="text-sm text-slate-500 outline-none border-b border-transparent focus:border-teal-300 bg-transparent w-full" /></div>
            <div className="flex items-center gap-1 text-sm text-slate-500">EIN: <input value={form?.ein ?? ""} onChange={(e) => setForm({ ...form!, ein: e.target.value })} onBlur={(e) => saveField("ein", e.target.value)} className="outline-none border-b border-transparent focus:border-teal-300 bg-transparent w-full" /></div>
            <div className="flex items-center gap-1 text-sm text-slate-500">UEI: <input value={form?.uei ?? ""} onChange={(e) => setForm({ ...form!, uei: e.target.value })} onBlur={(e) => saveField("uei", e.target.value)} className="outline-none border-b border-transparent focus:border-teal-300 bg-transparent w-full" /></div>
            <div className="flex items-center gap-1 text-sm text-slate-500">Staff: <input type="number" value={form?.staff_count ?? ""} onChange={(e) => setForm({ ...form!, staff_count: Number(e.target.value) })} onBlur={(e) => saveField("staff_count", Number(e.target.value))} className="outline-none border-b border-transparent focus:border-teal-300 bg-transparent w-full" /></div>
            <div className="flex items-center gap-1 text-sm text-slate-500">Budget: <input value={form?.budget_size ?? ""} onChange={(e) => setForm({ ...form!, budget_size: e.target.value })} onBlur={(e) => saveField("budget_size", e.target.value)} className="outline-none border-b border-transparent focus:border-teal-300 bg-transparent w-full" /></div>
            {savedField && <p className="text-sm text-emerald-600 col-span-2">Saved ✓</p>}
          </div>
          <div className="text-center shrink-0">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="38" fill="none" stroke="#e2f9e8" strokeWidth="8" />
              <circle cx="48" cy="48" r="38" fill="none" stroke="url(#scoreGrad)" strokeWidth="8" strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round" transform="rotate(-90 48 48)" />
              <defs><linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#14b8a6" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
              <text x="48" y="44" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1a2e24">{readiness}</text>
              <text x="48" y="58" textAnchor="middle" fontSize="9" fill="#94a3b8">/100</text>
            </svg>
            <p className="text-sm font-semibold text-slate-600 -mt-1">Profile Completeness</p>
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
            <textarea value={form?.mission ?? ""} onChange={(e) => setForm({ ...form!, mission: e.target.value })} onBlur={(e) => saveField("mission", e.target.value)} rows={5} placeholder="What does your organization do, and who does it serve?" className="w-full text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300 resize-none" />
          </div>
          <div className={`${CARD} p-5`}>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {FOCUS_OPTIONS.map((f) => (
                <button key={f} type="button" onClick={() => toggleFocus(f)} className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${form?.focus_areas.includes(f) ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white border-transparent" : "bg-white border-border text-slate-600 hover:border-teal-200"}`}>{f}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "programs" && (
        <div className="space-y-3">
          <div className="flex justify-end"><button className={BTN_PRIMARY} onClick={() => setShowProgramForm(true)}><Plus className="w-3.5 h-3.5" />Add Program</button></div>
          {showProgramForm && (
            <div className={`${CARD} p-4 grid grid-cols-2 gap-3`}>
              <input placeholder="Program name" value={programForm.name} onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300 col-span-2" />
              <textarea placeholder="Description" value={programForm.description} onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300 col-span-2 resize-none" rows={2} />
              <input placeholder="Budget (e.g. $250K)" value={programForm.budget} onChange={(e) => setProgramForm({ ...programForm, budget: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" />
              <input placeholder="People served" value={programForm.people_served} onChange={(e) => setProgramForm({ ...programForm, people_served: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" />
              <input placeholder="Outcome (e.g. 68% placement)" value={programForm.outcome} onChange={(e) => setProgramForm({ ...programForm, outcome: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300 col-span-2" />
              <div className="col-span-2 flex gap-2"><button className={BTN_PRIMARY} onClick={addProgram}>Add</button><button className={BTN_SECONDARY} onClick={() => setShowProgramForm(false)}>Cancel</button></div>
            </div>
          )}
          {programs.length === 0 && !showProgramForm && <div className={`${CARD} p-8 text-center`}><p className="text-slate-600 font-medium">No programs added yet</p></div>}
          <div className="grid grid-cols-2 gap-4">
            {programs.map((p) => (
              <div key={p.id} className={`${CARD} p-5`}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">{p.name}</h3>
                  <button onClick={() => deleteProgram(p.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                {p.description && <p className="text-sm text-slate-500 leading-relaxed mb-3">{p.description}</p>}
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  {p.budget && <span>Budget: <span className="font-semibold text-slate-700">{p.budget}</span></span>}
                  {p.people_served && <span>Served: <span className="font-semibold text-slate-700">{p.people_served}</span></span>}
                  {p.outcome && <span>Outcome: <span className="font-semibold text-teal-700">{p.outcome}</span></span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "team" && (
        <div className="space-y-3">
          <div className="flex justify-end"><button className={BTN_PRIMARY} onClick={() => setShowTeamForm(true)}><Plus className="w-3.5 h-3.5" />Add Member</button></div>
          {showTeamForm && (
            <div className={`${CARD} p-4 grid grid-cols-2 gap-3`}>
              <input placeholder="Name" value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" />
              <input placeholder="Title" value={teamForm.title} onChange={(e) => setTeamForm({ ...teamForm, title: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" />
              <select value={teamForm.member_type} onChange={(e) => setTeamForm({ ...teamForm, member_type: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300"><option>Staff</option><option>Board</option></select>
              <input placeholder="Since (year)" value={teamForm.since_year} onChange={(e) => setTeamForm({ ...teamForm, since_year: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" />
              <div className="col-span-2 flex gap-2"><button className={BTN_PRIMARY} onClick={addTeamMember}>Add</button><button className={BTN_SECONDARY} onClick={() => setShowTeamForm(false)}>Cancel</button></div>
            </div>
          )}
          {team.length === 0 && !showTeamForm ? (
            <div className={`${CARD} p-8 text-center`}><p className="text-slate-600 font-medium">No team members added yet</p></div>
          ) : team.length > 0 && (
            <div className={`${CARD} overflow-hidden`}>
              <table className="w-full">
                <thead><tr className="bg-[#f5fdf8]">{["Name", "Title", "Type", "Since", ""].map(h => <th key={h} className="text-left px-4 py-2.5 text-sm font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
                <tbody>
                  {team.map((m) => (
                    <tr key={m.id} className="border-t border-border hover:bg-[#f5fdf8]">
                      <td className="px-4 py-3 text-base font-semibold text-slate-800">{m.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{m.title}</td>
                      <td className="px-4 py-3"><span className={`text-sm font-medium px-2 py-0.5 rounded-full ${m.member_type === "Board" ? "bg-blue-50 text-blue-700" : "bg-teal-50 text-teal-700"}`}>{m.member_type}</span></td>
                      <td className="px-4 py-3 text-sm text-slate-400">{m.since_year}</td>
                      <td className="px-4 py-3"><button onClick={() => deleteTeamMember(m.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "financials" && (
        <div className={`${CARD} p-5`}>
          <h3 className="font-semibold text-slate-900 text-base mb-4">Financial Snapshot</h3>
          <div className="grid grid-cols-3 gap-4">
            {([
              ["total_revenue", "Total Revenue"],
              ["total_expenses", "Total Expenses"],
              ["net_assets", "Net Assets"],
            ] as const).map(([field, label]) => (
              <div key={field}>
                <label className="text-sm text-slate-400 uppercase tracking-wide block mb-1">{label}</label>
                <input value={(form as any)?.[field] ?? ""} onChange={(e) => setForm({ ...form!, [field]: e.target.value } as any)} onBlur={(e) => saveField(field, e.target.value)} placeholder="$0" className="w-full text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" />
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-400 mt-4">For grant-by-grant budget tracking, use the Budgets tab.</p>
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-4">
          {awarded.length > 0 && (
            <div className={`${CARD} overflow-hidden`}>
              <div className="p-4 border-b border-border"><h3 className="font-semibold text-slate-900 text-base">Awarded Through This Platform</h3></div>
              <table className="w-full">
                <thead><tr className="bg-[#f5fdf8]">{["Grant", "Funder", "Match Score"].map(h => <th key={h} className="text-left px-4 py-2.5 text-sm font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
                <tbody>
                  {awarded.map((a: any) => (
                    <tr key={a.id} className="border-t border-border">
                      <td className="px-4 py-3 font-semibold text-slate-800">{a.opportunity?.title}</td>
                      <td className="px-4 py-3 text-slate-500">{a.opportunity?.funder}</td>
                      <td className="px-4 py-3 text-emerald-600 font-semibold">{a.match_score}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end"><button className={BTN_PRIMARY} onClick={() => setShowHistoryForm(true)}><Plus className="w-3.5 h-3.5" />Log Past Award</button></div>
          {showHistoryForm && (
            <div className={`${CARD} p-4 grid grid-cols-2 gap-3`}>
              <input placeholder="Grant name" value={historyForm.name} onChange={(e) => setHistoryForm({ ...historyForm, name: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300 col-span-2" />
              <input placeholder="Funder" value={historyForm.funder} onChange={(e) => setHistoryForm({ ...historyForm, funder: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" />
              <input placeholder="Amount" value={historyForm.amount} onChange={(e) => setHistoryForm({ ...historyForm, amount: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" />
              <input placeholder="Period (e.g. FY2023)" value={historyForm.period} onChange={(e) => setHistoryForm({ ...historyForm, period: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300 col-span-2" />
              <div className="col-span-2 flex gap-2"><button className={BTN_PRIMARY} onClick={addHistory}>Add</button><button className={BTN_SECONDARY} onClick={() => setShowHistoryForm(false)}>Cancel</button></div>
            </div>
          )}
          {history.length === 0 && awarded.length === 0 && !showHistoryForm ? (
            <div className={`${CARD} p-8 text-center`}><p className="text-slate-600 font-medium">No award history yet</p></div>
          ) : history.length > 0 && (
            <div className={`${CARD} overflow-hidden`}>
              <div className="p-4 border-b border-border"><h3 className="font-semibold text-slate-900 text-base">Logged Prior Awards</h3></div>
              <table className="w-full">
                <thead><tr className="bg-[#f5fdf8]">{["Grant Name", "Funder", "Amount", "Period", ""].map(h => <th key={h} className="text-left px-4 py-2.5 text-sm font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-t border-border hover:bg-[#f5fdf8]">
                      <td className="px-4 py-3 text-base font-semibold text-slate-800">{h.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{h.funder}</td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-600">{h.amount}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{h.period}</td>
                      <td className="px-4 py-3"><button onClick={() => deleteHistory(h.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
