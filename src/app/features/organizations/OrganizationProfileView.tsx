import { useState } from "react";
import { AlertCircle, Briefcase, Check, MapPin, MoreHorizontal, UserPlus } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ORGS, financialsData } from "../../data/demoData";
import { BTN_PRIMARY, CARD } from "../../styles/classNames";
import { useActiveOrg } from "../../hooks/useActiveOrg";
export function OrganizationProfileView() {
  const { activeOrg: org } = useActiveOrg();
  const [tab, setTab] = useState("overview");
  const o = ORGS[org];
  const missing = ["Logic Model", "Board Roster (2025)", "Evaluation Framework", "Indirect Cost Rate Agreement"];
  const circumference = 2 * Math.PI * 38;
  const dash = circumference * (o.readiness / 100);

  return (
    <div className="space-y-5">
      <div className={`${CARD} p-5`}>
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0 text-white text-xl font-bold">{o.short}</div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">{o.name}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
              <span className="flex items-center gap-1 text-sm text-slate-500"><MapPin className="w-3 h-3" />{o.city}</span>
              <span className="flex items-center gap-1 text-sm text-slate-500"><Briefcase className="w-3 h-3" />{o.type}</span>
              <span className="text-sm text-slate-500">EIN: {o.ein}</span>
              <span className="text-sm text-slate-500">UEI: {o.uei}</span>
              <span className="text-sm text-slate-500">{o.staff} Staff</span>
              <span className="text-sm text-slate-500">Budget: {o.budget}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center">
              <svg width="96" height="96" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="38" fill="none" stroke="#e2f9e8" strokeWidth="8" />
                <circle cx="48" cy="48" r="38" fill="none" stroke="url(#scoreGrad)" strokeWidth="8" strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round" transform="rotate(-90 48 48)" />
                <defs><linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#14b8a6" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
                <text x="48" y="44" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1a2e24">{o.readiness}</text>
                <text x="48" y="58" textAnchor="middle" fontSize="9" fill="#94a3b8">/100</text>
              </svg>
              <p className="text-sm font-semibold text-slate-600 -mt-1">AI Readiness</p>
            </div>
            <div className={`${CARD} p-3 bg-amber-50 border-amber-100`}>
              <p className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Missing Info</p>
              <div className="space-y-1">
                {missing.map(m => <p key={m} className="text-sm text-amber-700">· {m}</p>)}
              </div>
            </div>
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
            <p className="text-sm text-slate-700 leading-relaxed">To advance economic opportunity and community resilience through innovative workforce development, digital equity, and community development programs that empower individuals, strengthen families, and build thriving communities.</p>
          </div>
          <div className={`${CARD} p-5`}>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Service Areas & Population</h3>
            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="font-medium">Geography:</span> Cook, DuPage, and Lake Counties, IL</p>
              <p><span className="font-medium">Population:</span> Adults 18–54, youth 14–24, immigrants, returning citizens</p>
              <p><span className="font-medium">Annual Reach:</span> 3,200+ individuals served</p>
            </div>
          </div>
          <div className={`${CARD} p-5`}>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Certifications & Registrations</h3>
            <div className="space-y-1.5">
              {["IRS 501(c)(3) — Active", "SAM.gov Registered — Active", "Illinois Charitable Org. — Active", "DUNS: 08-423-9124", "NAICS: 624310, 611430"].map(c => (
                <div key={c} className="flex items-center gap-2"><Check className="w-3 h-3 text-emerald-500 shrink-0" /><span className="text-sm text-slate-600">{c}</span></div>
              ))}
            </div>
          </div>
          <div className={`${CARD} p-5`}>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Strategic Priorities 2024–2027</h3>
            <div className="space-y-1.5">
              {["Workforce credentials for 1,000 adults annually", "Expand digital equity programming to 5 new ZIP codes", "Achieve $5M in annual grant funding by 2027", "Launch AI-powered career coaching platform", "Formalize 10 university and employer partnerships"].map((p, i) => (
                <div key={i} className="flex items-start gap-2"><span className="text-teal-500 font-bold text-sm mt-0.5">{i + 1}.</span><span className="text-sm text-slate-600">{p}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "programs" && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: "WorkForward", desc: "Sector-based workforce training in healthcare, IT, and logistics. Includes credentials, job placement, and 12-month follow-up.", budget: "$1.2M", served: "420", outcomes: "68% placement" },
            { name: "Digital Equity Initiative", desc: "Free broadband access, device distribution, and digital literacy training for low-income households across 8 Chicago neighborhoods.", budget: "$380K", served: "850", outcomes: "92% completion" },
            { name: "Youth Leadership Academy", desc: "Summer and after-school program building career readiness, financial literacy, and college access for youth ages 14–24.", budget: "$290K", served: "310", outcomes: "88% HS graduation" },
            { name: "Senior Tech Connect", desc: "Technology training and social connection programming for adults 60+ including telehealth navigation and digital safety.", budget: "$145K", served: "180", outcomes: "96% satisfaction" },
          ].map((prog) => (
            <div key={prog.name} className={`${CARD} p-5`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-900">{prog.name}</h3>
                <span className="text-sm font-bold text-emerald-600">{prog.budget}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-3">{prog.desc}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-400">Served: <span className="font-semibold text-slate-700">{prog.served}</span></span>
                <span className="text-slate-400">Outcome: <span className="font-semibold text-teal-700">{prog.outcomes}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "team" && (
        <div className={`${CARD} overflow-hidden`}>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-base">Board Members & Staff</h3>
            <button className={BTN_PRIMARY}><UserPlus className="w-3.5 h-3.5" />Add Member</button>
          </div>
          <table className="w-full">
            <thead><tr className="bg-[#f5fdf8]">{["Name", "Title", "Type", "Since", ""].map(h => <th key={h} className="text-left px-4 py-2.5 text-sm font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>
              {[
                ["Dr. Patricia Williams", "Board Chair", "Board", "2018"],
                ["Marcus Thompson", "Executive Director", "Staff", "2015"],
                ["Lisa Chen, CPA", "CFO", "Staff", "2019"],
                ["Rev. James Okafor", "Board Treasurer", "Board", "2020"],
                ["Maria Santos", "Director of Programs", "Staff", "2021"],
                ["Dr. Angela Rivera", "Board Secretary", "Board", "2019"],
                ["David Kim", "Director of Development", "Staff", "2022"],
              ].map(([name, title, type, since]) => (
                <tr key={name} className="border-t border-border hover:bg-[#f5fdf8] transition-colors">
                  <td className="px-4 py-3"><p className="text-base font-semibold text-slate-800">{name}</p></td>
                  <td className="px-4 py-3 text-sm text-slate-500">{title}</td>
                  <td className="px-4 py-3"><span className={`text-sm font-medium px-2 py-0.5 rounded-full ${type === "Board" ? "bg-blue-50 text-blue-700" : "bg-teal-50 text-teal-700"}`}>{type}</span></td>
                  <td className="px-4 py-3 text-sm text-slate-400">{since}</td>
                  <td className="px-4 py-3"><button className="text-slate-300 hover:text-slate-500"><MoreHorizontal className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "financials" && (
        <div className="grid grid-cols-3 gap-4">
          <div className={`${CARD} p-5 col-span-1`}>
            <h3 className="font-semibold text-slate-900 text-base mb-4">Financial Snapshot</h3>
            <div className="space-y-3">
              {[["Total Revenue", "$3.21M"], ["Total Expenses", "$3.08M"], ["Net Assets", "$740K"], ["Federal Funding", "58%"], ["Foundation Grants", "28%"], ["Earned Revenue", "14%"]].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm"><span className="text-slate-500">{k}</span><span className="font-semibold text-slate-800">{v}</span></div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-slate-400">Audit Status</p>
              <p className="text-sm font-semibold text-emerald-600 mt-0.5">Clean Opinion — FY2024</p>
            </div>
          </div>
          <div className={`${CARD} p-5 col-span-2`}>
            <h3 className="font-semibold text-slate-900 text-base mb-4">Budget vs. Actuals — FY2025</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={financialsData} barSize={20} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="grant" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 8 }} formatter={(v: number) => [`$${v}K`, ""]} />
                <Bar dataKey="budget" fill="#e2f9e8" radius={[4, 4, 0, 0]} name="Budget" />
                <Bar dataKey="spent" fill="#2ab07a" radius={[4, 4, 0, 0]} name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className={`${CARD} overflow-hidden`}>
          <div className="p-4 border-b border-border"><h3 className="font-semibold text-slate-900 text-base">Prior Awards & Grant History</h3></div>
          <table className="w-full">
            <thead><tr className="bg-[#f5fdf8]">{["Grant Name", "Funder", "Amount", "Period", "Status"].map(h => <th key={h} className="text-left px-4 py-2.5 text-sm font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>
              {[
                ["State Workforce Development", "IDOL", "$340,000", "FY2024", "Awarded"],
                ["NIH Research Supplement", "NIH", "$215,000", "FY2024", "Awarded"],
                ["Community Foundation Grant", "Chicago Community Trust", "$85,000", "FY2024", "Awarded"],
                ["Microsoft Philanthropies", "Microsoft", "$180,000", "FY2023", "Complete"],
                ["DOL WIOA — Cycle 3", "U.S. Dept. of Labor", "$680,000", "FY2022–23", "Complete"],
                ["Gates Foundation — Workforce", "Bill & Melinda Gates", "$420,000", "FY2021–22", "Complete"],
              ].map(([name, funder, amt, period, status]) => (
                <tr key={name} className="border-t border-border hover:bg-[#f5fdf8] transition-colors">
                  <td className="px-4 py-3 text-base font-semibold text-slate-800">{name}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{funder}</td>
                  <td className="px-4 py-3 text-sm font-bold text-emerald-600">{amt}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{period}</td>
                  <td className="px-4 py-3"><span className={`text-sm font-medium px-2 py-0.5 rounded-full ${status === "Awarded" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Partners ─────────────────────────────────────────────────────────────────
