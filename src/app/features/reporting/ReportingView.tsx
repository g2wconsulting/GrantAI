import { useState } from "react";
import { Download, Sparkles, Target } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { METRICS, REPORTS_DUE, financialsData } from "../../data/demoData";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../../styles/classNames";
import { SectionHeader } from "../../components/common/SectionHeader";
export function ReportingView() {
  const [tab, setTab] = useState("outcomes");

  return (
    <div className="space-y-5">
      <SectionHeader title="Reporting & Impact" sub="FY2025 · Horizons Community Foundation" action={
        <div className="flex gap-2">
          <button className={BTN_SECONDARY}><Download className="w-3.5 h-3.5" />Export</button>
          <button className={BTN_PRIMARY}><Sparkles className="w-3.5 h-3.5" />AI Board Report</button>
        </div>
      } />

      <div className="flex items-center gap-1 bg-white border border-border rounded-xl p-1 w-fit">
        {["outcomes", "financials", "grant reports", "ai reports"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "text-slate-500 hover:text-slate-800"}`}>{t}</button>
        ))}
      </div>

      {tab === "outcomes" && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {METRICS.map((m) => {
            const pct = Math.min(100, Math.round((m.current / m.target) * 100));
            const exceeded = m.current >= m.target;
            return (
              <div key={m.label} className={`${CARD} p-5`}>
                <p className="text-sm font-semibold text-slate-500 mb-3">{m.label}</p>
                <p className="text-4xl font-bold text-slate-900 mb-0.5">{m.current}{m.unit === "$/hr" ? "" : ""}<span className="text-base font-normal text-slate-400 ml-1">{m.unit}</span></p>
                <p className="text-sm text-slate-400 mb-3">Target: {m.target} {m.unit}</p>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                  <div className={`h-full ${m.color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">{pct}% of target</span>
                  {exceeded ? <span className="text-sm font-semibold text-emerald-600">Target met ✓</span> : <span className="text-sm text-slate-400">{m.target - m.current} remaining</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "financials" && (
        <div className="space-y-4">
          <div className={`${CARD} p-5`}>
            <h3 className="font-semibold text-slate-900 text-base mb-4">Budget vs. Actuals by Grant</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={financialsData} barSize={22} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <XAxis dataKey="grant" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 8 }} formatter={(v: number) => [`$${v}K`, ""]} />
                <Bar dataKey="budget" fill="#d1fae5" radius={[4, 4, 0, 0]} name="Budget" />
                <Bar dataKey="spent" fill="#2ab07a" radius={[4, 4, 0, 0]} name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={`${CARD} overflow-hidden`}>
            <div className="p-4 border-b border-border"><h3 className="font-semibold text-slate-900 text-base">Spend by Grant</h3></div>
            <table className="w-full text-sm">
              <thead><tr className="bg-[#f5fdf8]">{["Grant", "Awarded", "Spent", "Remaining", "% Used"].map(h => <th key={h} className="text-left px-4 py-2.5 font-semibold text-slate-400 uppercase tracking-wide text-sm">{h}</th>)}</tr></thead>
              <tbody>
                {financialsData.map(f => {
                  const rem = f.budget - f.spent;
                  const pct = Math.round((f.spent / f.budget) * 100);
                  return (
                    <tr key={f.grant} className="border-t border-border hover:bg-[#f5fdf8]">
                      <td className="px-4 py-3 font-semibold text-slate-800">{f.grant}</td>
                      <td className="px-4 py-3 text-slate-600">${f.budget}K</td>
                      <td className="px-4 py-3 text-emerald-600 font-semibold">${f.spent}K</td>
                      <td className="px-4 py-3 text-slate-500">${rem}K</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                          <span className="text-slate-600">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "grant reports" && (
        <div className={`${CARD} overflow-hidden`}>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-base">Upcoming & Overdue Reports</h3>
            <button className={BTN_PRIMARY}><Sparkles className="w-3.5 h-3.5" />AI Draft Report</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="bg-[#f5fdf8]">{["Report", "Grant", "Due Date", "Status", ""].map(h => <th key={h} className="text-left px-4 py-2.5 font-semibold text-slate-400 uppercase tracking-wide text-sm">{h}</th>)}</tr></thead>
            <tbody>
              {REPORTS_DUE.map(r => (
                <tr key={r.name} className="border-t border-border hover:bg-[#f5fdf8]">
                  <td className="px-4 py-3 font-semibold text-slate-800">{r.name}</td>
                  <td className="px-4 py-3 text-slate-500">{r.grant}</td>
                  <td className="px-4 py-3 text-slate-600">{r.due}</td>
                  <td className="px-4 py-3"><span className={`text-sm font-medium px-2 py-0.5 rounded-full ${r.status === "Due Soon" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{r.status}</span></td>
                  <td className="px-4 py-3"><button className={BTN_PRIMARY.replace("flex items-center gap-1.5 ", "")}><Sparkles className="w-3 h-3" />Draft</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "ai reports" && (
        <div className="grid grid-cols-2 gap-4">
          <div className={`${CARD} p-5`}>
            <h3 className="font-semibold text-slate-900 text-base mb-4">Generate AI Report</h3>
            <div className="space-y-3">
              <div><label className="text-sm text-slate-400 uppercase tracking-wide block mb-1">Report Type</label>
                <select className="w-full text-sm text-slate-700 border border-border rounded-lg px-3 py-2 bg-white outline-none hover:border-teal-300">
                  <option>Quarterly Performance Report</option>
                  <option>Annual Impact Report</option>
                  <option>Board Report</option>
                  <option>Funder Update</option>
                  <option>Impact Summary</option>
                </select>
              </div>
              <div><label className="text-sm text-slate-400 uppercase tracking-wide block mb-1">Grant</label>
                <select className="w-full text-sm text-slate-700 border border-border rounded-lg px-3 py-2 bg-white outline-none hover:border-teal-300">
                  <option>All Grants</option>
                  <option>DOL WIOA</option>
                  <option>MacArthur Foundation</option>
                  <option>NIH Research Supplement</option>
                </select>
              </div>
              <div><label className="text-sm text-slate-400 uppercase tracking-wide block mb-1">Period</label>
                <select className="w-full text-sm text-slate-700 border border-border rounded-lg px-3 py-2 bg-white outline-none hover:border-teal-300">
                  <option>Q2 2026 (Apr–Jun)</option>
                  <option>Q1 2026 (Jan–Mar)</option>
                  <option>FY2025</option>
                </select>
              </div>
              <button className={`${BTN_PRIMARY} w-full justify-center py-2.5`}><Sparkles className="w-4 h-4" />Generate Report</button>
            </div>
          </div>
          <div className={`${CARD} p-5`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 text-base">Preview</h3>
              <div className="flex gap-2">
                <button className={BTN_SECONDARY}><Download className="w-3.5 h-3.5" />PDF</button>
                <button className={BTN_SECONDARY}><Download className="w-3.5 h-3.5" />Word</button>
              </div>
            </div>
            <div className="bg-[#f5fdf8] border border-border rounded-xl p-4 text-sm text-slate-600 leading-relaxed h-52 overflow-y-auto">
              <p className="font-bold text-slate-800 mb-2">WorkForward Program — Q2 2026 Performance Report</p>
              <p className="mb-2">During the second quarter of 2026 (April 1 – June 30), Horizons Community Foundation made significant progress toward all DOL WIOA performance targets. A total of 847 participants are enrolled, representing 94% of our annual goal of 900.</p>
              <p className="mb-2">Credential attainment reached 312 individuals (89% of target), with strong completion rates in healthcare support (97 credentials) and IT fundamentals (84 credentials). Job placement rates remain at 68%, exceeding the national WIOA benchmark of 60.1%.</p>
              <p>Partner engagements expanded to 24 active organizational relationships, including a new MOU with Howard University supporting the NSF AI Track application...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────
