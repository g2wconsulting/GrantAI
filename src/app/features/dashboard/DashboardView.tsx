import { AlertCircle, ArrowUpRight, CheckCircle2, Sparkles, Star, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { KPI_DATA, opportunities, sourceData, stageData, timelineData } from "../../data/demoData";
import { CARD } from "../../styles/classNames";
import { TagBadge } from "../../components/common/TagBadge";
import { daysUntil } from "../../utils/dates";
export function DashboardView() {
  const now = new Date();
  const endingSoon = opportunities
    .map(o => ({ ...o, daysLeft: daysUntil(o.deadlineDate, now) }))
    .filter(o => o.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3);

  return (
    <div className="space-y-5">
      {/* Ending-soon banner */}
      <div className="bg-white border border-amber-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-base font-semibold text-slate-800">Grants Ending Soon</p>
          <span className="text-sm text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full font-medium">{endingSoon.length} upcoming</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {endingSoon.map(o => {
            const urgent = o.daysLeft <= 7;
            return (
              <div key={o.id} className={`flex items-start gap-3 p-3 rounded-lg border ${urgent ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"}`}>
                <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 ${urgent ? "bg-red-100" : "bg-amber-100"}`}>
                  <span className={`text-sm font-semibold ${urgent ? "text-red-500" : "text-amber-600"}`}>DAY{o.daysLeft !== 1 ? "S" : ""}</span>
                  <span className={`text-lg font-bold leading-none ${urgent ? "text-red-600" : "text-amber-700"}`}>{o.daysLeft}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-slate-800 leading-snug truncate">{o.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{o.funder}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-sm font-bold text-slate-700">{o.amount}</span>
                    <span className={`text-sm font-semibold ${urgent ? "text-red-600" : "text-amber-600"}`}>Due {o.deadline}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Good morning, Jordan</h2>
          <p className="text-sm text-slate-400 mt-0.5">3 high-priority grants due this month · 2 new AI matches today</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-emerald-700">AI scanning 18 sources</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPI_DATA.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={`${CARD} p-4 hover:shadow-md transition-all cursor-default group`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${kpi.bg}`}><Icon className={`w-4 h-4 ${kpi.color}`} /></div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-200 group-hover:text-slate-400 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-0.5 tracking-tight">{kpi.value}</p>
              <p className="text-sm text-slate-500 leading-snug">{kpi.label}</p>
              <p className="text-sm text-emerald-600 mt-1.5 font-medium">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${CARD} p-5 lg:col-span-2`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Funding Pipeline</h3>
              <p className="text-sm text-slate-400 mt-0.5">Requested vs. Awarded ($K)</p>
            </div>
            <select className="text-sm border border-border rounded-lg px-2 py-1.5 text-slate-500 bg-white outline-none">
              <option>Last 7 months</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={timelineData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="gradReq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2ab07a" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#2ab07a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAwd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ca678" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#0ca678" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 10 }} formatter={(v: number) => [`$${v}K`, ""]} />
              <Area type="monotone" dataKey="requested" stroke="#2ab07a" strokeWidth={2} fill="url(#gradReq)" name="Requested" />
              <Area type="monotone" dataKey="awarded" stroke="#0ca678" strokeWidth={2} fill="url(#gradAwd)" name="Awarded" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#2ab07a] rounded" /><span className="text-sm text-slate-400">Requested</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#0ca678] rounded" /><span className="text-sm text-slate-400">Awarded</span></div>
          </div>
        </div>

        <div className={`${CARD} p-5`}>
          <h3 className="font-semibold text-slate-900 text-base mb-0.5">Funding by Source</h3>
          <p className="text-sm text-slate-400 mb-3">Distribution by funder type</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={sourceData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={2} strokeWidth={0}>
                {sourceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 8 }} formatter={(v: number) => [`${v}%`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {sourceData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} /><span className="text-sm text-slate-500">{d.name}</span></div>
                <span className="text-base font-semibold text-slate-700">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${CARD} p-5`}>
          <h3 className="font-semibold text-slate-900 text-base mb-0.5">Applications by Stage</h3>
          <p className="text-sm text-slate-400 mb-4">Current pipeline distribution</p>
          <ResponsiveContainer width="100%" height={155}>
            <BarChart data={stageData} barSize={26} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <XAxis dataKey="stage" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 8 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#2ab07a" name="Grants" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`${CARD} p-5 lg:col-span-2`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-teal-50 rounded-lg"><Sparkles className="w-4 h-4 text-teal-600" /></div>
              <div>
                <h3 className="font-semibold text-slate-900 text-base">AI Recommendations</h3>
                <p className="text-sm text-slate-400">Updated 2h ago</p>
              </div>
            </div>
            <button className="text-sm text-teal-700 font-medium hover:text-teal-900 transition-colors">View all</button>
          </div>
          <div className="space-y-2.5">
            {opportunities.filter((o) => o.recommended).map((opp) => (
              <div key={opp.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#f5fdf8] hover:bg-[#eafaf3] transition-colors cursor-pointer border border-transparent hover:border-teal-100">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0 text-white text-sm font-bold">{opp.match}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-base font-semibold text-slate-900 leading-snug">{opp.title}</p>
                    <TagBadge tag={opp.tag} />
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">{opp.funder} · {opp.amount} · Due {opp.deadline}</p>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-1">{opp.insight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`${CARD} p-5`}>
        <h3 className="font-semibold text-slate-900 text-base mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { icon: Sparkles, color: "bg-[#e8faf0] text-teal-700", text: "AI found 3 new federal grant matches", sub: "NSF, DOL, and EPA opportunities added to your pipeline", time: "2h ago" },
            { icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600", text: "Proposal submitted — Dept. of Education Title IV", sub: "$320,000 · Review expected within 90 days", time: "Yesterday" },
            { icon: Star, color: "bg-amber-50 text-amber-600", text: "MacArthur Foundation LOI deadline in 14 days", sub: "Draft is 60% complete — AI can generate the remaining sections", time: "Today" },
            { icon: TrendingUp, color: "bg-blue-50 text-blue-600", text: "Success rate improved to 68%", sub: "Up from 64% — NIH and Community Foundation awards recorded", time: "3 days ago" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-start gap-3">
                <div className={`p-1.5 rounded-lg ${item.color} shrink-0 mt-0.5`}><Icon className="w-3.5 h-3.5" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{item.text}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{item.sub}</p>
                </div>
                <span className="text-sm text-slate-300 shrink-0 mt-0.5">{item.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Discovery ────────────────────────────────────────────────────────────────
