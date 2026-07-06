import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, Search, Sparkles, GitBranch, Calendar,
  FileText, Building2, Users, FolderOpen, DollarSign,
  BarChart3, Settings, MessageSquare, Bell,
  Award, Clock, Target, Activity, Cpu,
  ArrowUpRight, Plus, Send, CheckCircle2,
  ExternalLink, ChevronRight, Filter, ChevronDown, ChevronLeft,
  Star, TrendingUp, Upload, Download, Pencil,
  AlertCircle, Globe, Phone, Mail, UserPlus,
  MoreHorizontal, X, Briefcase, MapPin, BookOpen,
  Shield, FileCheck, Zap, Check, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type OrgKey = "horizons" | "twiddleu" | "jobvair";

// ─── Org Data ─────────────────────────────────────────────────────────────────

const ORGS: Record<OrgKey, { name: string; short: string; type: string; city: string; ein: string; uei: string; readiness: number; staff: number; budget: string }> = {
  horizons: { name: "Horizons Community Foundation", short: "HC", type: "Community Nonprofit", city: "Chicago, IL", ein: "83-4521890", uei: "HJKL9823MNP4", readiness: 84, staff: 24, budget: "$3.2M" },
  twiddleu: { name: "TwiddleU", short: "TU", type: "EdTech Nonprofit", city: "Atlanta, GA", ein: "47-2891034", uei: "TWDU8723XYZ1", readiness: 71, staff: 12, budget: "$1.8M" },
  jobvair: { name: "Jobvair", short: "JV", type: "Workforce Nonprofit", city: "Detroit, MI", ein: "61-3490182", uei: "JBVR4521ABC9", readiness: 78, staff: 18, budget: "$2.4M" },
};

// ─── Chart Data ───────────────────────────────────────────────────────────────

const timelineData = [
  { month: "Jan", requested: 420, awarded: 280 },
  { month: "Feb", requested: 380, awarded: 195 },
  { month: "Mar", requested: 610, awarded: 410 },
  { month: "Apr", requested: 540, awarded: 320 },
  { month: "May", requested: 730, awarded: 520 },
  { month: "Jun", requested: 680, awarded: 485 },
  { month: "Jul", requested: 810, awarded: 590 },
];

const sourceData = [
  { name: "Federal", value: 42, color: "#7ec8e3" },
  { name: "Foundation", value: 28, color: "#5dd4b8" },
  { name: "State", value: 16, color: "#86efac" },
  { name: "Corporate", value: 9, color: "#fcd989" },
  { name: "Other", value: 5, color: "#b4c9d4" },
];

const stageData = [
  { stage: "Research", count: 14 },
  { stage: "Qualified", count: 9 },
  { stage: "Writing", count: 6 },
  { stage: "Submitted", count: 8 },
  { stage: "Awarded", count: 12 },
];

const financialsData = [
  { grant: "DOL WIOA", budget: 750, spent: 312 },
  { grant: "MacArthur", budget: 500, spent: 48 },
  { grant: "NIH Supp.", budget: 215, spent: 198 },
  { grant: "Community Fdn", budget: 85, spent: 82 },
  { grant: "State WFD", budget: 340, spent: 287 },
];

// ─── Opportunities ────────────────────────────────────────────────────────────

const DATE_RANGES = [
  { label: "Any date", value: "all" },
  { label: "Due this month", value: "month" },
  { label: "Due in 30 days", value: "30" },
  { label: "Due in 60 days", value: "60" },
  { label: "Due in 90 days", value: "90" },
  { label: "Due after 90 days", value: "90plus" },
];

const opportunities = [
  { id: 1, title: "DOL Workforce Innovation & Opportunity Act", funder: "U.S. Dept. of Labor", amount: "$750,000", deadline: "Aug 14, 2026", deadlineDate: new Date("2026-08-14"), match: 94, tag: "Federal", recommended: true, insight: "87% of required attachments already in your document library. Strong workforce development narrative fit.", difficulty: "Medium", winProb: "72%" },
  { id: 2, title: "MacArthur Foundation — Technology & Society", funder: "MacArthur Foundation", amount: "$500,000", deadline: "Sep 2, 2026", deadlineDate: new Date("2026-09-02"), match: 91, tag: "Foundation", recommended: true, insight: "Similar organizations in your network received awards in 2024. Emphasize AI equity and community ownership angles.", difficulty: "High", winProb: "61%" },
  { id: 3, title: "NSF Convergence Accelerator — AI Track", funder: "National Science Foundation", amount: "$1,000,000", deadline: "Sep 30, 2026", deadlineDate: new Date("2026-09-30"), match: 88, tag: "Federal", recommended: true, insight: "Partner with Howard University to boost eligibility by 12 points. You already have 80% of this proposal written.", difficulty: "High", winProb: "55%" },
  { id: 4, title: "HUD Community Development Block Grant", funder: "Dept. of Housing & Urban Dev.", amount: "$400,000", deadline: "Oct 15, 2026", deadlineDate: new Date("2026-10-15"), match: 82, tag: "Federal", recommended: false, insight: "Geographic footprint aligns with HUD Opportunity Zones. Budget target: $380K–$420K.", difficulty: "Medium", winProb: "48%" },
  { id: 5, title: "Google.org Impact Challenge — AI for Good", funder: "Google.org", amount: "$300,000", deadline: "Nov 1, 2026", deadlineDate: new Date("2026-11-01"), match: 79, tag: "Corporate", recommended: false, insight: "AI-driven social programs are a priority this cycle. Strong tech implementation narrative required.", difficulty: "Medium", winProb: "43%" },
  { id: 6, title: "EPA Environmental Justice Collaborative", funder: "U.S. Environmental Protection Agency", amount: "$250,000", deadline: "Nov 5, 2026", deadlineDate: new Date("2026-11-05"), match: 74, tag: "Federal", recommended: false, insight: "Geographic overlap with target communities is strong. Add a community health section.", difficulty: "Medium", winProb: "39%" },
];

const kanbanData: Record<string, { title: string; amount: string; deadline: string; match: number }[]> = {
  researching: [
    { title: "EPA Environmental Justice", amount: "$250K", deadline: "Nov 5", match: 74 },
    { title: "NEA Arts in Communities", amount: "$75K", deadline: "Oct 20", match: 68 },
    { title: "NIH Health Equity Supplement", amount: "$185K", deadline: "Dec 1", match: 71 },
  ],
  qualified: [
    { title: "DOL WIOA Workforce Grant", amount: "$750K", deadline: "Aug 14", match: 94 },
    { title: "HUD CDBG Program", amount: "$400K", deadline: "Oct 15", match: 82 },
  ],
  writing: [
    { title: "MacArthur Tech & Society", amount: "$500K", deadline: "Sep 2", match: 91 },
    { title: "NSF Convergence AI Track", amount: "$1M", deadline: "Sep 30", match: 88 },
  ],
  submitted: [
    { title: "Dept. of Education Title IV", amount: "$320K", deadline: "Jul 1", match: 85 },
    { title: "Microsoft Philanthropies AI", amount: "$180K", deadline: "Jun 15", match: 77 },
    { title: "W.K. Kellogg Foundation", amount: "$250K", deadline: "Jun 30", match: 80 },
  ],
  awarded: [
    { title: "NIH Research Supplement", amount: "$215K", deadline: "Apr 2026", match: 90 },
    { title: "Community Foundation Grant", amount: "$85K", deadline: "Mar 2026", match: 88 },
    { title: "State Workforce Development", amount: "$340K", deadline: "Feb 2026", match: 92 },
  ],
};

const KANBAN_COLS = [
  { id: "researching", label: "Researching", dot: "bg-slate-400" },
  { id: "qualified", label: "Qualified", dot: "bg-blue-500" },
  { id: "writing", label: "Writing", dot: "bg-teal-500" },
  { id: "submitted", label: "Submitted", dot: "bg-amber-500" },
  { id: "awarded", label: "Awarded", dot: "bg-emerald-500" },
];

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "discovery", label: "Grant Discovery", icon: Search },
  { id: "pipeline", label: "Pipeline", icon: GitBranch },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "proposals", label: "Proposal Builder", icon: FileText },
  { id: "profile", label: "Org Profile", icon: Building2 },
  { id: "partners", label: "Partners", icon: Users },
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "budgets", label: "Budgets", icon: DollarSign },
  { id: "reporting", label: "Reporting", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "ai", label: "AI Assistant", icon: MessageSquare },
];

const KPI_DATA = [
  { label: "Grants Matched", value: "47", sub: "+8 this week", icon: Sparkles, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Upcoming Deadlines", value: "8", sub: "Next: Aug 14", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Est. Funding Available", value: "$2.4M", sub: "42 open opportunities", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "In Progress", value: "6", sub: "Active proposals", icon: Activity, color: "text-teal-600", bg: "bg-teal-50" },
  { label: "Success Rate", value: "68%", sub: "+4% vs last year", icon: Target, color: "text-sky-600", bg: "bg-sky-50" },
  { label: "Awards Received", value: "$1.2M", sub: "This fiscal year", icon: Award, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Grant Readiness", value: "84/100", sub: "Strong profile", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  { label: "AI Opportunity Score", value: "91", sub: "Exceptional match fit", icon: Cpu, color: "text-blue-500", bg: "bg-blue-50" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BTN_PRIMARY = "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-teal-500 to-blue-500 text-white text-sm font-medium rounded-lg hover:from-teal-600 hover:to-blue-600 transition-all";
const BTN_SECONDARY = "flex items-center gap-1.5 px-3 py-1.5 border border-border text-slate-600 text-sm font-medium rounded-lg hover:bg-[#edf9f2] transition-colors";
const CARD = "bg-white rounded-xl border border-border";

function MatchScore({ score }: { score: number }) {
  const barColor = score >= 90 ? "bg-emerald-500" : score >= 80 ? "bg-teal-500" : "bg-amber-400";
  const textColor = score >= 90 ? "text-emerald-600" : score >= 80 ? "text-teal-600" : "text-amber-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-semibold ${textColor}`}>{score}%</span>
    </div>
  );
}

function TagBadge({ tag }: { tag: string }) {
  const map: Record<string, string> = {
    Federal: "bg-blue-50 text-blue-700 border-blue-100",
    Foundation: "bg-teal-50 text-teal-700 border-teal-100",
    State: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Corporate: "bg-amber-50 text-amber-700 border-amber-100",
    Other: "bg-slate-50 text-slate-600 border-slate-100",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-medium border ${map[tag] ?? map.Other}`}>{tag}</span>;
}

function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        {sub && <p className="text-sm text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardView() {
  const now = new Date();
  const endingSoon = opportunities
    .map(o => ({ ...o, daysLeft: Math.ceil((o.deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) }))
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

function DiscoveryView() {
  const [filter, setFilter] = useState("All");
  const [dateRange, setDateRange] = useState("all");
  const [sortBy, setSortBy] = useState("match");
  const tags = ["All", "Federal", "Foundation", "State", "Corporate"];
  const now = new Date();

  function inDateRange(opp: typeof opportunities[0]) {
    const d = opp.deadlineDate;
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (dateRange === "all") return true;
    if (dateRange === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (dateRange === "30") return diff >= 0 && diff <= 30;
    if (dateRange === "60") return diff >= 0 && diff <= 60;
    if (dateRange === "90") return diff >= 0 && diff <= 90;
    if (dateRange === "90plus") return diff > 90;
    return true;
  }

  const filtered = opportunities
    .filter((o) => (filter === "All" || o.tag === filter) && inDateRange(o))
    .sort((a, b) => {
      if (sortBy === "match") return b.match - a.match;
      if (sortBy === "deadline") return a.deadlineDate.getTime() - b.deadlineDate.getTime();
      if (sortBy === "amount") return parseInt(b.amount.replace(/\D/g, "")) - parseInt(a.amount.replace(/\D/g, ""));
      return 0;
    });

  function daysUntil(d: Date) {
    return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="space-y-4">
      <div className={`${CARD} p-4`}>
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-[#f0fbf5] rounded-xl px-3 py-2.5 border border-border">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none" placeholder="Search grants by keyword, funder, category, amount..." />
          </div>
          <button className={BTN_SECONDARY}><Filter className="w-3.5 h-3.5" />Filters</button>
          <button className={BTN_PRIMARY}><Sparkles className="w-3.5 h-3.5" />AI Search</button>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {tags.map((t) => (
            <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === t ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>{t}</button>
          ))}
          <div className="w-px h-4 bg-border mx-1" />
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="text-sm border border-border rounded-lg px-2 py-1 text-slate-600 bg-white outline-none cursor-pointer hover:border-teal-300">
              {DATE_RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1.5 ml-1">
            <span className="text-sm text-slate-400">Sort:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border border-border rounded-lg px-2 py-1 text-slate-600 bg-white outline-none cursor-pointer hover:border-teal-300">
              <option value="match">AI Match</option>
              <option value="deadline">Deadline</option>
              <option value="amount">Amount</option>
            </select>
          </div>
          <span className="ml-auto text-sm text-slate-400">{filtered.length} opportunities</span>
        </div>
      </div>
      <div className="space-y-3">
        {filtered.map((opp) => (
          <div key={opp.id} className={`${CARD} p-5 hover:shadow-md transition-all`}>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0 text-white font-bold text-sm">{opp.match}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 text-base">{opp.title}</h3>
                      {opp.recommended && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#e8faf0] text-teal-800 rounded text-sm font-semibold border border-teal-100"><Sparkles className="w-2.5 h-2.5" />AI Pick</span>}
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">{opp.funder}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900 text-sm">{opp.amount}</p>
                    {(() => {
                      const days = daysUntil(opp.deadlineDate);
                      const urgent = days <= 7;
                      return (
                        <div className="mt-1">
                          <p className={`text-sm font-bold ${urgent ? "text-red-600" : "text-slate-700"}`}>Due {opp.deadline}</p>
                          {urgent && <p className="text-sm font-semibold text-red-500 mt-0.5">{days} day{days !== 1 ? "s" : ""} left!</p>}
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                  <TagBadge tag={opp.tag} />
                  <div className="flex items-center gap-1.5"><span className="text-sm text-slate-400">Match:</span><MatchScore score={opp.match} /></div>
                  <div className="flex items-center gap-1"><span className="text-sm text-slate-400">Win prob:</span><span className="text-sm font-semibold text-emerald-600 ml-1">{opp.winProb}</span></div>
                  <div className="flex items-center gap-1"><span className="text-sm text-slate-400">Difficulty:</span><span className={`text-sm font-semibold ml-1 ${opp.difficulty === "High" ? "text-rose-500" : "text-amber-500"}`}>{opp.difficulty}</span></div>
                </div>
                <div className="mt-3 p-3 bg-gradient-to-r from-[#e8f8f5] to-[#e2f9e8] rounded-lg border border-teal-100">
                  <div className="flex items-start gap-2"><Sparkles className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" /><p className="text-sm text-teal-900 leading-relaxed">{opp.insight}</p></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
              <button className={BTN_PRIMARY}>Start Proposal</button>
              <button className={BTN_SECONDARY}>Add to Pipeline</button>
              <button className={BTN_SECONDARY}>View NOFO</button>
              <div className="ml-auto flex items-center gap-1.5 text-sm text-slate-300 hover:text-slate-500 cursor-pointer transition-colors"><ExternalLink className="w-3 h-3" />Grants.gov</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Recommendations ──────────────────────────────────────────────────────────

function RecommendationsView() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-[#e2f9e8] via-[#edfaf5] to-[#e2f9e8] border border-teal-100 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm"><Sparkles className="w-5 h-5 text-teal-600" /></div>
          <div>
            <h2 className="font-semibold text-slate-800">AI Strategic Recommendations</h2>
            <p className="text-sm text-teal-600 mt-0.5">Personalized for Horizons Community Foundation · Updated 2 hours ago</p>
            <div className="flex items-center gap-4 mt-3">
              {[["47", "Matches Found"], ["$2.4M", "Est. Available"], ["91", "Avg AI Score"]].map(([val, lbl], i) => (
                <div key={i} className="flex items-center gap-3">
                  {i > 0 && <div className="w-px h-8 bg-teal-100" />}
                  <div className="text-center"><p className="text-xl font-bold text-slate-800">{val}</p><p className="text-sm text-teal-500">{lbl}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {opportunities.map((opp) => (
        <div key={opp.id} className={`${CARD} p-5 hover:shadow-sm transition-shadow`}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0 text-white font-bold">{opp.match}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900 text-base">{opp.title}</h3>
                    {opp.recommended && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#e8faf0] text-teal-800 rounded text-sm font-semibold border border-teal-100"><Sparkles className="w-2.5 h-2.5" />Recommended</span>}
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">{opp.funder} · {opp.amount}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0"><TagBadge tag={opp.tag} /><p className="text-sm text-slate-400">Due {opp.deadline}</p></div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 p-3 bg-[#f5fdf8] rounded-lg">
                <div><p className="text-sm text-slate-400 mb-0.5">AI Match</p><MatchScore score={opp.match} /></div>
                <div><p className="text-sm text-slate-400 mb-1">Win Probability</p><p className="text-sm font-bold text-emerald-600">{opp.winProb}</p></div>
                <div><p className="text-sm text-slate-400 mb-1">Difficulty</p><p className={`text-sm font-bold ${opp.difficulty === "High" ? "text-rose-500" : "text-amber-500"}`}>{opp.difficulty}</p></div>
              </div>
              <div className="mt-3 flex items-start gap-2"><TrendingUp className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" /><p className="text-sm text-slate-600 leading-relaxed">{opp.insight}</p></div>
            </div>
          </div>
          <div className="flex gap-2 mt-4 pt-3 border-t border-border">
            <button className={BTN_PRIMARY}>Start Proposal</button>
            <button className={BTN_SECONDARY}>Add to Pipeline</button>
            <button className={`${BTN_SECONDARY} ml-auto`}><ExternalLink className="w-3 h-3" />View NOFO</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

function PipelineView() {
  return (
    <div>
      <SectionHeader title="Grant Pipeline" sub="39 total grants · $4.6M total pipeline value" action={
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-border rounded-lg overflow-hidden">
            <button className="px-3 py-1.5 text-sm text-slate-400 hover:bg-[#edf9f2] border-r border-border transition-colors">List</button>
            <button className="px-3 py-1.5 text-sm font-medium bg-gradient-to-br from-teal-500 to-blue-500 text-white">Kanban</button>
            <button className="px-3 py-1.5 text-sm text-slate-400 hover:bg-[#edf9f2] border-l border-border transition-colors">Timeline</button>
          </div>
          <button className={BTN_PRIMARY}><Plus className="w-3.5 h-3.5" />Add Grant</button>
        </div>
      } />
      <div className="flex gap-4 overflow-x-auto pb-6">
        {KANBAN_COLS.map((col) => {
          const cards = kanbanData[col.id] ?? [];
          const totals: Record<string, number> = { researching: 460, qualified: 1150, writing: 1500, submitted: 750, awarded: 640 };
          return (
            <div key={col.id} className="w-60 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="text-base font-semibold text-slate-700">{col.label}</span>
                  <span className="text-sm text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{cards.length}</span>
                </div>
                <button className="text-slate-300 hover:text-slate-500 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
              </div>
              <p className="text-sm text-slate-400 mb-3">${totals[col.id]}K total</p>
              <div className="space-y-2.5">
                {cards.map((card, i) => (
                  <div key={i} className={`${CARD} p-3.5 hover:shadow-md transition-all cursor-pointer group`}>
                    <p className="text-base font-semibold text-slate-900 leading-snug mb-2.5 group-hover:text-teal-700 transition-colors">{card.title}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-bold text-slate-800">{card.amount}</span>
                      <span className="text-sm text-slate-400">{card.deadline}</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-400">AI Match</span>
                        <span className="text-sm font-bold text-teal-700">{card.match}%</span>
                      </div>
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${card.match}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
                <button className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-slate-200 rounded-xl text-sm text-slate-400 hover:border-teal-300 hover:text-teal-600 transition-colors">
                  <Plus className="w-3 h-3" />Add grant
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

const CAL_EVENTS = [
  { day: 6, title: "MacArthur LOI Review", type: "task" },
  { day: 8, title: "Board Meeting", type: "meeting" },
  { day: 14, title: "NIH Q2 Report Due", type: "deadline" },
  { day: 15, title: "MacArthur LOI Draft Due", type: "deadline" },
  { day: 22, title: "Howard University Partner Call", type: "meeting" },
  { day: 28, title: "NSF Letter of Intent", type: "deadline" },
  { day: 30, title: "DOL WIOA Internal Review", type: "task" },
];

const EVENT_COLORS: Record<string, string> = {
  deadline: "bg-red-100 text-red-700",
  meeting: "bg-purple-100 text-purple-700",
  task: "bg-teal-100 text-teal-700",
};

function CalendarView() {
  const [typeFilter, setTypeFilter] = useState("All");
  // July 2026: July 1 = Wednesday = index 3 (0=Sun)
  const daysInMonth = 31;
  const startIndex = 3;
  const totalCells = Math.ceil((startIndex + daysInMonth) / 7) * 7;

  const visibleEvents = typeFilter === "All" ? CAL_EVENTS : CAL_EVENTS.filter(e => e.type === typeFilter.toLowerCase());

  return (
    <div className="space-y-5">
      <SectionHeader title="Calendar" sub="July 2026 · Grant deadlines, reporting, and team events" action={
        <div className="flex items-center gap-2">
          <button className={BTN_SECONDARY}><ChevronLeft className="w-3.5 h-3.5" />June</button>
          <span className="text-base font-semibold text-slate-700 px-2">July 2026</span>
          <button className={BTN_SECONDARY}>August<ChevronRight className="w-3.5 h-3.5" /></button>
          <button className={BTN_PRIMARY}><Plus className="w-3.5 h-3.5" />Add Event</button>
        </div>
      } />

      <div className="flex items-center gap-2">
        {["All", "Deadlines", "Meetings", "Tasks"].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${typeFilter === t ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "bg-white border border-border text-slate-500 hover:bg-[#edf9f2]"}`}>{t}</button>
        ))}
      </div>

      <div className={`${CARD} p-5`}>
        <div className="grid grid-cols-7 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="text-center text-sm font-semibold text-slate-400 py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: totalCells }).map((_, i) => {
            const day = i - startIndex + 1;
            const isValid = day >= 1 && day <= daysInMonth;
            const isToday = day === 6;
            const dayEvents = visibleEvents.filter(e => e.day === day);
            return (
              <div key={i} className={`min-h-[80px] p-1.5 rounded-lg ${isValid ? "bg-white hover:bg-[#f5fdf8] cursor-pointer transition-colors" : "bg-transparent"} ${isToday ? "ring-2 ring-teal-400" : ""}`}>
                {isValid && (
                  <>
                    <span className={`text-sm font-medium block mb-1 ${isToday ? "w-5 h-5 bg-gradient-to-br from-teal-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm" : "text-slate-600"}`}>{day}</span>
                    <div className="space-y-0.5">
                      {dayEvents.map((ev, j) => (
                        <div key={j} className={`text-[9px] font-medium px-1 py-0.5 rounded truncate ${EVENT_COLORS[ev.type]}`}>{ev.title}</div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={`${CARD} p-5`}>
        <h3 className="font-semibold text-slate-900 text-base mb-4">Upcoming Events</h3>
        <div className="space-y-2.5">
          {CAL_EVENTS.map((ev, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#f5fdf8] hover:bg-[#eafaf3] transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-white border border-border flex flex-col items-center justify-center shrink-0">
                <span className="text-sm text-slate-400">JUL</span>
                <span className="text-base font-bold text-slate-900">{ev.day}</span>
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-800">{ev.title}</p>
                <p className="text-sm text-slate-400">July {ev.day}, 2026</p>
              </div>
              <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${EVENT_COLORS[ev.type]}`}>{ev.type.charAt(0).toUpperCase() + ev.type.slice(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Proposal Builder ─────────────────────────────────────────────────────────

const PROPOSAL_SECTIONS = [
  { id: "exec", label: "Executive Summary", status: "complete", words: 342 },
  { id: "needs", label: "Needs Statement", status: "in-progress", words: 218 },
  { id: "design", label: "Project Design", status: "empty", words: 0 },
  { id: "workplan", label: "Work Plan & Timeline", status: "empty", words: 0 },
  { id: "eval", label: "Evaluation Plan", status: "empty", words: 0 },
  { id: "budget", label: "Budget Narrative", status: "empty", words: 0 },
  { id: "sustain", label: "Sustainability Plan", status: "empty", words: 0 },
  { id: "attach", label: "Attachments & Compliance", status: "in-progress", words: 0 },
];

const SECTION_CONTENT: Record<string, string> = {
  exec: "Horizons Community Foundation respectfully requests $750,000 from the U.S. Department of Labor to expand our WorkForward program serving 300 unemployed and underemployed adults in Cook County, Illinois. Over a 36-month performance period, we will deliver sector-based workforce training, industry-recognized credentials, career coaching, and employer connections in high-growth fields including healthcare support, logistics, and information technology.\n\nFounded in 2011, Horizons has served over 12,000 individuals through evidence-based workforce and community development programming. Our 68% employment placement rate and strong employer partnerships position us as a capable and trusted WIOA service provider.",
  needs: "Cook County's unemployment rate for adults without a college degree remains 2.3 times higher than the regional average, with Black and Latino workers disproportionately concentrated in low-wage, high-displacement occupations. Among our service population—adults ages 18-54 residing in Chicago's South and West Sides—53% lack post-secondary credentials and 41% report barriers including prior justice involvement, housing instability, or limited English proficiency.\n\nLocal labor market analysis indicates demand for 4,200 new workers in healthcare support roles and 1,800 in logistics and supply chain positions over the next three years, yet training capacity...",
};

function ProposalBuilderView() {
  const [activeSection, setActiveSection] = useState("exec");
  const [selectedGrant, setSelectedGrant] = useState("DOL WIOA Workforce Grant — $750,000");
  const current = PROPOSAL_SECTIONS.find(s => s.id === activeSection)!;
  const completed = PROPOSAL_SECTIONS.filter(s => s.status === "complete").length;
  const pct = Math.round((completed / PROPOSAL_SECTIONS.length) * 100);

  return (
    <div className="space-y-4">
      <div className={`${CARD} p-4`}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm text-slate-400 uppercase tracking-wide block mb-1">Grant</label>
            <select value={selectedGrant} onChange={e => setSelectedGrant(e.target.value)} className="text-sm font-medium text-slate-800 border border-border rounded-lg px-3 py-2 bg-white outline-none w-full max-w-sm hover:border-teal-300">
              <option>DOL WIOA Workforce Grant — $750,000</option>
              <option>MacArthur Technology & Society — $500,000</option>
              <option>NSF Convergence Accelerator — $1,000,000</option>
            </select>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400 mb-1">Completion</p>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full" style={{ width: `${pct}%` }} /></div>
              <span className="text-sm font-bold text-slate-700">{pct}%</span>
            </div>
          </div>
          <button className={BTN_PRIMARY}><Sparkles className="w-3.5 h-3.5" />AI Complete All</button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className={`${CARD} p-3 w-52 shrink-0`}>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 px-2">Sections</p>
          <div className="space-y-0.5">
            {PROPOSAL_SECTIONS.map((sec) => (
              <button key={sec.id} onClick={() => setActiveSection(sec.id)} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${activeSection === sec.id ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "text-slate-600 hover:bg-[#edf9f2]"}`}>
                {sec.status === "complete" ? <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${activeSection === sec.id ? "text-white" : "text-emerald-500"}`} /> : sec.status === "in-progress" ? <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${activeSection === sec.id ? "border-white" : "border-amber-400"}`} /> : <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${activeSection === sec.id ? "border-white/50" : "border-slate-200"}`} />}
                <span className="truncate">{sec.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex gap-4">
          <div className={`${CARD} p-5 flex-1`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">{current.label}</h3>
                {current.words > 0 && <span className="text-sm text-slate-400">{current.words} words</span>}
              </div>
              <div className="flex items-center gap-2">
                <button className={BTN_PRIMARY}><Sparkles className="w-3.5 h-3.5" />Draft with AI</button>
                <button className={BTN_SECONDARY}><Zap className="w-3.5 h-3.5" />Improve</button>
                <button className={BTN_SECONDARY}><FileCheck className="w-3.5 h-3.5" />Check Rubric</button>
              </div>
            </div>
            <textarea
              className="w-full h-72 text-sm text-slate-700 bg-[#f5fdf8] border border-border rounded-xl p-4 outline-none resize-none leading-relaxed placeholder:text-slate-300 focus:border-teal-300"
              defaultValue={SECTION_CONTENT[activeSection] ?? ""}
              placeholder={`Start writing your ${current.label.toLowerCase()} here, or click "Draft with AI" to generate a complete section based on your organization profile and grant requirements...`}
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-slate-400">Autosaved · Last edited 4 min ago</p>
              <div className="flex gap-2">
                <button className={BTN_SECONDARY}><Download className="w-3.5 h-3.5" />Export Word</button>
                <button className={BTN_PRIMARY}><Check className="w-3.5 h-3.5" />Mark Complete</button>
              </div>
            </div>
          </div>

          <div className="w-56 space-y-3 shrink-0">
            <div className={`${CARD} p-4`}>
              <div className="flex items-center gap-1.5 mb-3"><Sparkles className="w-3.5 h-3.5 text-teal-600" /><p className="text-base font-semibold text-slate-800">AI Suggestions</p></div>
              <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                <p className="p-2 bg-[#f5fdf8] rounded-lg">Mention your 68% placement rate early — it exceeds the national average.</p>
                <p className="p-2 bg-[#f5fdf8] rounded-lg">Include Cook County unemployment data from BLS 2025 report.</p>
                <p className="p-2 bg-[#f5fdf8] rounded-lg">Add Howard University as a training partner to strengthen the application.</p>
              </div>
            </div>
            <div className={`${CARD} p-4`}>
              <div className="flex items-center gap-1.5 mb-3"><Shield className="w-3.5 h-3.5 text-blue-500" /><p className="text-base font-semibold text-slate-800">Scoring Rubric</p></div>
              <div className="space-y-2">
                {[["Statement of Need", "20pts"], ["Project Design", "30pts"], ["Evaluation", "20pts"], ["Budget", "15pts"], ["Org Capacity", "15pts"]].map(([label, pts]) => (
                  <div key={label} className="flex justify-between text-sm"><span className="text-slate-500">{label}</span><span className="font-semibold text-slate-700">{pts}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Org Profile ──────────────────────────────────────────────────────────────

function OrgProfileView({ org }: { org: OrgKey }) {
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

const PARTNERS = [
  { name: "Howard University", type: "University", role: "Training Partner", stage: "Active MOU", grants: ["NSF AI Track", "DOL WIOA"], contact: "Dr. Renee Phillips", lastContact: "Jul 3, 2026" },
  { name: "City of Chicago DFSS", type: "Government", role: "Referral & Co-Applicant", stage: "Strategic Partner", grants: ["HUD CDBG", "DOL WIOA"], contact: "Comm. Brandie Knazze", lastContact: "Jun 28, 2026" },
  { name: "United Way Metro Chicago", type: "Funder", role: "Funder & Collaborator", stage: "Active MOU", grants: ["Community Grant"], contact: "Sean Garrett", lastContact: "Jun 15, 2026" },
  { name: "CareerSource Illinois", type: "Workforce Agency", role: "Referral Partner", stage: "Engaged", grants: ["DOL WIOA"], contact: "Maria Lopez", lastContact: "May 30, 2026" },
  { name: "Microsoft TEALS", type: "Corporate", role: "Technology Partner", stage: "Prospect", grants: [], contact: "James Wu", lastContact: "Apr 12, 2026" },
  { name: "Chicago Community Trust", type: "Funder", role: "Funder", stage: "Strategic Partner", grants: ["Community Foundation Grant"], contact: "Helene Gayle", lastContact: "Jul 1, 2026" },
];

const STAGE_COLORS: Record<string, string> = {
  "Strategic Partner": "bg-emerald-50 text-emerald-700",
  "Active MOU": "bg-teal-50 text-teal-700",
  "Engaged": "bg-blue-50 text-blue-700",
  "Prospect": "bg-slate-100 text-slate-600",
};

function PartnersView() {
  const [filter, setFilter] = useState("All");
  const types = ["All", "University", "Government", "Funder", "Workforce Agency", "Corporate"];
  const filtered = filter === "All" ? PARTNERS : PARTNERS.filter(p => p.type === filter);

  return (
    <div className="space-y-4">
      <SectionHeader title="Partner CRM" sub={`${PARTNERS.length} partners · 4 active MOUs`} action={<button className={BTN_PRIMARY}><UserPlus className="w-3.5 h-3.5" />Add Partner</button>} />

      <div className="flex items-center gap-2 flex-wrap">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === t ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "bg-white border border-border text-slate-500 hover:bg-[#edf9f2]"}`}>{t}</button>
        ))}
      </div>

      <div className={`${CARD} overflow-hidden`}>
        <table className="w-full">
          <thead><tr className="bg-[#f5fdf8]">{["Partner", "Type", "Role", "Relationship Stage", "Linked Grants", "Last Contact", ""].map(h => <th key={h} className="text-left px-4 py-2.5 text-sm font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.name} className="border-t border-border hover:bg-[#f5fdf8] transition-colors">
                <td className="px-4 py-3">
                  <p className="text-base font-semibold text-slate-800">{p.name}</p>
                  <p className="text-sm text-slate-400">{p.contact}</p>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{p.type}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{p.role}</td>
                <td className="px-4 py-3"><span className={`text-sm font-medium px-2 py-0.5 rounded-full ${STAGE_COLORS[p.stage]}`}>{p.stage}</span></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">{p.grants.slice(0, 2).map(g => <span key={g} className="text-sm bg-[#e8faf0] text-teal-700 px-1.5 py-0.5 rounded">{g}</span>)}</div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">{p.lastContact}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className={BTN_SECONDARY.replace("flex items-center gap-1.5 ", "")}>View</button>
                    <button className="text-slate-300 hover:text-slate-500 p-1"><MoreHorizontal className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`${CARD} p-5 bg-gradient-to-r from-[#e2f9e8] to-[#e8f8f5] border-teal-100`}>
        <div className="flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-teal-600" /><p className="text-base font-semibold text-slate-800">AI-Suggested Partnerships</p></div>
        <div className="grid grid-cols-3 gap-3">
          {[["Wayne State University", "Could strengthen NSF proposal — has AI research lab aligned with your programs."], ["Chicago Cook Workforce Partnership", "Key WIOA intermediary — partnership could unlock co-enrollment for 200+ participants."], ["JPMorgan Chase — PRO Infinity", "Corporate funder with $50M workforce initiative aligned with your tech training programs."]].map(([name, reason]) => (
            <div key={name} className={`${CARD} p-3`}>
              <p className="text-base font-semibold text-slate-800 mb-1">{name}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{reason}</p>
              <button className={`${BTN_PRIMARY} mt-2 text-sm`}><Plus className="w-3 h-3" />Connect</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Documents ────────────────────────────────────────────────────────────────

const DOCS = [
  { name: "IRS Determination Letter", category: "Legal", date: "Jan 2011", size: "284 KB", type: "pdf", tags: ["Required"] },
  { name: "Form 990 — FY2024", category: "Financial", date: "Apr 2025", size: "1.2 MB", type: "pdf", tags: ["Required", "Annual"] },
  { name: "Audit Report FY2024", category: "Financial", date: "Mar 2025", size: "2.8 MB", type: "pdf", tags: ["Required"] },
  { name: "DOL WIOA Proposal Draft v3", category: "Proposals", date: "Jun 30, 2026", size: "840 KB", type: "word", tags: ["Active", "Draft"] },
  { name: "MacArthur LOI Draft", category: "Proposals", date: "Jul 2, 2026", size: "320 KB", type: "word", tags: ["Active", "Draft"] },
  { name: "Strategic Plan 2024–2027", category: "Reports", date: "Jan 2024", size: "3.4 MB", type: "pdf", tags: ["Public"] },
  { name: "Board Roster — 2024", category: "Legal", date: "Feb 2024", size: "95 KB", type: "word", tags: ["Required"] },
  { name: "DOL WIOA Budget Template", category: "Budgets", date: "Jun 28, 2026", size: "180 KB", type: "excel", tags: ["Active"] },
  { name: "Howard University MOU", category: "Legal", date: "May 2026", size: "210 KB", type: "pdf", tags: ["Partner"] },
  { name: "WorkForward Program Report Q1", category: "Reports", date: "Apr 2026", size: "920 KB", type: "pdf", tags: ["Q1 2026"] },
  { name: "Organization Logo Pack", category: "Media", date: "Mar 2024", size: "14.2 MB", type: "image", tags: ["Branding"] },
  { name: "Staff Bios — 2025", category: "Legal", date: "Jan 2025", size: "420 KB", type: "word", tags: ["Required"] },
];

const FILE_ICONS: Record<string, { bg: string; label: string }> = {
  pdf: { bg: "bg-red-100 text-red-600", label: "PDF" },
  word: { bg: "bg-blue-100 text-blue-600", label: "DOC" },
  excel: { bg: "bg-emerald-100 text-emerald-600", label: "XLS" },
  image: { bg: "bg-purple-100 text-purple-600", label: "IMG" },
};

const FOLDERS = [
  { name: "All Files", icon: FolderOpen, count: 12, color: "text-slate-500" },
  { name: "Proposals", icon: FileText, count: 2, color: "text-blue-500" },
  { name: "Budgets", icon: DollarSign, count: 1, color: "text-emerald-500" },
  { name: "Financial", icon: BarChart3, count: 2, color: "text-teal-500" },
  { name: "Legal", icon: Shield, count: 4, color: "text-violet-500" },
  { name: "Reports", icon: BookOpen, count: 2, color: "text-amber-500" },
  { name: "Media", icon: Globe, count: 1, color: "text-pink-400" },
];

function DocumentsView() {
  const [category, setCategory] = useState("All Files");
  const [newFolderMode, setNewFolderMode] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [extraFolders, setExtraFolders] = useState<string[]>([]);

  const activeCategory = category === "All Files" ? "All" : category;
  const filtered = activeCategory === "All" ? DOCS : DOCS.filter(d => d.category === activeCategory);

  function createFolder() {
    if (newFolderName.trim()) {
      setExtraFolders(prev => [...prev, newFolderName.trim()]);
      setNewFolderName("");
      setNewFolderMode(false);
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader title="Document Library" sub={`${DOCS.length} files · AI-indexed and searchable`} action={
        <div className="flex gap-2">
          <button className={BTN_SECONDARY} onClick={() => setNewFolderMode(true)}><Plus className="w-3.5 h-3.5" />New Folder</button>
          <button className={BTN_PRIMARY}><Upload className="w-3.5 h-3.5" />Upload</button>
        </div>
      } />

      <div className="flex gap-4">
        {/* Folder sidebar */}
        <div className={`${CARD} p-3 w-48 shrink-0 h-fit`}>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 px-2">Folders</p>
          <div className="space-y-0.5">
            {FOLDERS.map(({ name, icon: Icon, count, color }) => (
              <button key={name} onClick={() => setCategory(name)} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${category === name ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "text-slate-700 hover:bg-[#edf9f2]"}`}>
                <Icon className={`w-3.5 h-3.5 shrink-0 ${category === name ? "text-white" : color}`} />
                <span className="flex-1 truncate">{name}</span>
                <span className={`text-sm font-semibold px-1.5 py-0.5 rounded-full ${category === name ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{count}</span>
              </button>
            ))}
            {extraFolders.map(name => (
              <button key={name} onClick={() => setCategory(name)} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${category === name ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "text-slate-700 hover:bg-[#edf9f2]"}`}>
                <FolderOpen className={`w-3.5 h-3.5 shrink-0 ${category === name ? "text-white" : "text-slate-400"}`} />
                <span className="flex-1 truncate">{name}</span>
                <span className={`text-sm font-semibold px-1.5 py-0.5 rounded-full ${category === name ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>0</span>
              </button>
            ))}
          </div>

          {newFolderMode ? (
            <div className="mt-2 px-2">
              <input
                autoFocus
                className="w-full text-sm border border-teal-300 rounded-lg px-2 py-1.5 outline-none bg-[#f5fdf8] mb-1.5"
                placeholder="Folder name..."
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") createFolder(); if (e.key === "Escape") setNewFolderMode(false); }}
              />
              <div className="flex gap-1">
                <button onClick={createFolder} className="flex-1 text-sm py-1 bg-gradient-to-br from-teal-500 to-blue-500 text-white rounded-lg font-medium">Create</button>
                <button onClick={() => setNewFolderMode(false)} className="flex-1 text-sm py-1 border border-border text-slate-500 rounded-lg">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setNewFolderMode(true)} className="w-full flex items-center gap-2 px-2.5 py-2 mt-1 rounded-lg text-sm text-slate-400 hover:text-teal-600 hover:bg-[#edf9f2] transition-colors">
              <Plus className="w-3.5 h-3.5" />New Folder
            </button>
          )}
        </div>

        {/* File grid */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-[#f0fbf5] rounded-xl px-3 py-2 border border-border">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input className="flex-1 bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none" placeholder="Search documents..." />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className={`${CARD} flex flex-col items-center justify-center py-16 text-center`}>
              <FolderOpen className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-sm font-medium text-slate-500">This folder is empty</p>
              <p className="text-sm text-slate-400 mt-1">Upload files or move documents here</p>
              <button className={`${BTN_PRIMARY} mt-4`}><Upload className="w-3.5 h-3.5" />Upload File</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((doc) => {
                const fi = FILE_ICONS[doc.type];
                return (
                  <div key={doc.name} className={`${CARD} p-4 hover:shadow-md transition-all cursor-pointer group`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${fi.bg} flex items-center justify-center shrink-0 text-sm font-bold`}>{fi.label}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-slate-800 leading-snug group-hover:text-teal-700 transition-colors truncate">{doc.name}</p>
                        <p className="text-sm text-slate-400 mt-0.5">{doc.date} · {doc.size}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.tags.map(t => <span key={t} className="text-sm bg-[#e8faf0] text-teal-700 px-1.5 py-0.5 rounded">{t}</span>)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className={`${BTN_SECONDARY} text-sm py-1`}><Download className="w-3 h-3" />Download</button>
                      <button className={`${BTN_SECONDARY} text-sm py-1`}><Sparkles className="w-3 h-3" />AI Extract</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Budget Builder ───────────────────────────────────────────────────────────

const BUDGET_ROWS = [
  { category: "Personnel", items: [{ label: "Program Director (1.0 FTE)", y1: 85000, y2: 87550, y3: 90177 }, { label: "Career Coach I (1.0 FTE)", y1: 55000, y2: 56650, y3: 58350 }, { label: "Career Coach II (0.75 FTE)", y1: 41250, y2: 42488, y3: 43762 }, { label: "Data Coordinator (0.5 FTE)", y1: 28000, y2: 28840, y3: 29705 }] },
  { category: "Fringe Benefits (19%)", items: [{ label: "Fringe @ 19%", y1: 39710, y2: 40890, y3: 42117 }] },
  { category: "Travel", items: [{ label: "Local mileage & site visits", y1: 4200, y2: 4200, y3: 4200 }, { label: "Conference attendance", y1: 2800, y2: 2800, y3: 2800 }] },
  { category: "Supplies", items: [{ label: "Training materials & curricula", y1: 8500, y2: 7000, y3: 6000 }, { label: "Office supplies", y1: 1800, y2: 1800, y3: 1800 }] },
  { category: "Contractual", items: [{ label: "Howard University — Training", y1: 30000, y2: 30000, y3: 25000 }, { label: "Evaluator (external)", y1: 12000, y2: 12000, y3: 12000 }] },
];

function BudgetBuilderView() {
  const [grant, setGrant] = useState("DOL WIOA Workforce Grant — $750,000");

  const getTotals = (rows: typeof BUDGET_ROWS) => {
    let y1 = 0, y2 = 0, y3 = 0;
    rows.forEach(r => r.items.forEach(i => { y1 += i.y1; y2 += i.y2; y3 += i.y3; }));
    return { y1, y2, y3, total: y1 + y2 + y3 };
  };

  const direct = getTotals(BUDGET_ROWS);
  const indirect = { y1: Math.round(direct.y1 * 0.15), y2: Math.round(direct.y2 * 0.15), y3: Math.round(direct.y3 * 0.15) };
  const totalProject = { y1: direct.y1 + indirect.y1, y2: direct.y2 + indirect.y2, y3: direct.y3 + indirect.y3 };
  const fmt = (n: number) => `$${n.toLocaleString()}`;

  return (
    <div className="space-y-4">
      <div className={`${CARD} p-4`}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm text-slate-400 uppercase tracking-wide block mb-1">Grant</label>
            <select value={grant} onChange={e => setGrant(e.target.value)} className="text-sm font-medium text-slate-800 border border-border rounded-lg px-3 py-2 bg-white outline-none w-full max-w-sm hover:border-teal-300">
              <option>DOL WIOA Workforce Grant — $750,000</option>
              <option>MacArthur Foundation — $500,000</option>
              <option>NSF Convergence — $1,000,000</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button className={BTN_SECONDARY}><Download className="w-3.5 h-3.5" />Excel</button>
            <button className={BTN_SECONDARY}><Download className="w-3.5 h-3.5" />SF-424A</button>
            <button className={BTN_PRIMARY}><Sparkles className="w-3.5 h-3.5" />Generate Narrative</button>
          </div>
        </div>
      </div>

      <div className={`${CARD} overflow-hidden`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f5fdf8]">
              <th className="text-left px-4 py-3 font-semibold text-slate-600 w-64">Category / Line Item</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Year 1</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Year 2</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Year 3</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Total</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">%</th>
            </tr>
          </thead>
          <tbody>
            {BUDGET_ROWS.map((row) => (
              <>
                <tr key={row.category} className="bg-[#f0fdf5]">
                  <td className="px-4 py-2 font-semibold text-slate-700 text-sm uppercase tracking-wide" colSpan={6}>{row.category}</td>
                </tr>
                {row.items.map((item) => {
                  const total = item.y1 + item.y2 + item.y3;
                  const pct = ((total / 750000) * 100).toFixed(1);
                  return (
                    <tr key={item.label} className="border-t border-border hover:bg-[#f5fdf8]">
                      <td className="px-4 py-2.5 text-slate-600 pl-7">{item.label}</td>
                      <td className="px-4 py-2.5 text-right text-slate-700 font-medium">{fmt(item.y1)}</td>
                      <td className="px-4 py-2.5 text-right text-slate-700 font-medium">{fmt(item.y2)}</td>
                      <td className="px-4 py-2.5 text-right text-slate-700 font-medium">{fmt(item.y3)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-800">{fmt(total)}</td>
                      <td className="px-4 py-2.5 text-right text-slate-400">{pct}%</td>
                    </tr>
                  );
                })}
              </>
            ))}
            <tr className="border-t-2 border-teal-200 bg-teal-50">
              <td className="px-4 py-3 font-bold text-teal-800">Total Direct Costs</td>
              {[direct.y1, direct.y2, direct.y3, direct.y1 + direct.y2 + direct.y3].map((v, i) => <td key={i} className="px-4 py-3 text-right font-bold text-teal-800">{fmt(v)}</td>)}
              <td className="px-4 py-3 text-right text-teal-600">{((direct.y1 + direct.y2 + direct.y3) / 750000 * 100).toFixed(1)}%</td>
            </tr>
            <tr className="border-t border-border">
              <td className="px-4 py-2.5 text-slate-600 pl-7">Indirect Costs (15% of direct)</td>
              {[indirect.y1, indirect.y2, indirect.y3, indirect.y1 + indirect.y2 + indirect.y3].map((v, i) => <td key={i} className="px-4 py-2.5 text-right text-slate-700 font-medium">{fmt(v)}</td>)}
              <td className="px-4 py-2.5 text-right text-slate-400">15.0%</td>
            </tr>
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td className="px-4 py-3 font-bold text-slate-800">Total Federal Request</td>
              {[totalProject.y1, totalProject.y2, totalProject.y3, 750000].map((v, i) => <td key={i} className="px-4 py-3 text-right font-bold text-slate-900">{fmt(v)}</td>)}
              <td className="px-4 py-3 text-right text-slate-400">100%</td>
            </tr>
            <tr className="border-t border-border">
              <td className="px-4 py-2.5 text-slate-500 pl-7">Match Requirement (20%)</td>
              <td className="px-4 py-2.5 text-right text-amber-600 font-medium">$60,000</td>
              <td className="px-4 py-2.5 text-right text-amber-600 font-medium">$62,000</td>
              <td className="px-4 py-2.5 text-right text-amber-600 font-medium">$28,000</td>
              <td className="px-4 py-2.5 text-right text-amber-600 font-bold">$150,000</td>
              <td className="px-4 py-2.5 text-right text-amber-500">20%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={`${CARD} p-5`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900 text-base">Budget Narrative</h3>
          <button className={BTN_PRIMARY}><Sparkles className="w-3.5 h-3.5" />AI Generate Narrative</button>
        </div>
        <textarea className="w-full h-32 text-sm text-slate-700 bg-[#f5fdf8] border border-border rounded-xl p-4 outline-none resize-none leading-relaxed placeholder:text-slate-300 focus:border-teal-300" placeholder="Click 'AI Generate Narrative' to create a complete budget justification, or start writing here. Describe the basis for each cost, how it supports the program, and why it is reasonable and necessary..." />
      </div>
    </div>
  );
}

// ─── Reporting ────────────────────────────────────────────────────────────────

const METRICS = [
  { label: "Participants Enrolled", current: 847, target: 900, unit: "people", color: "bg-teal-500" },
  { label: "Credentials Earned", current: 312, target: 350, unit: "credentials", color: "bg-blue-500" },
  { label: "Job Placements", current: 198, target: 225, unit: "placements", color: "bg-emerald-500" },
  { label: "Retained at 6 months", current: 162, target: 180, unit: "retained", color: "bg-sky-500" },
  { label: "Average Wage Gain", current: 8.4, target: 8.0, unit: "$/hr", color: "bg-violet-400" },
  { label: "Partner Engagements", current: 24, target: 20, unit: "partners", color: "bg-amber-400" },
];

const REPORTS_DUE = [
  { name: "DOL WIOA — Q3 Performance Report", grant: "DOL WIOA", due: "Jul 30, 2026", status: "Due Soon" },
  { name: "NIH Supplement — Interim Report", grant: "NIH Research", due: "Aug 15, 2026", status: "Not Started" },
  { name: "Community Foundation — Year-End", grant: "Chicago Community Trust", due: "Sep 1, 2026", status: "Not Started" },
  { name: "State Workforce Dev. — Final Report", grant: "IDOL", due: "Sep 30, 2026", status: "Not Started" },
  { name: "MacArthur — Narrative Update", grant: "MacArthur", due: "Dec 1, 2026", status: "Not Started" },
];

function ReportingView() {
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

function Toggle({ on }: { on?: boolean }) {
  const [active, setActive] = useState(on ?? false);
  return (
    <button onClick={() => setActive(!active)} className={`w-9 h-5 rounded-full transition-colors ${active ? "bg-gradient-to-r from-teal-500 to-blue-500" : "bg-slate-200"}`}>
      <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform mx-0.5 ${active ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}

function SettingsView() {
  const [tab, setTab] = useState("workspace");
  return (
    <div className="space-y-5">
      <SectionHeader title="Settings" sub="Workspace, users, integrations, and preferences" />
      <div className="flex items-center gap-1 bg-white border border-border rounded-xl p-1 w-fit">
        {["workspace", "users", "integrations", "notifications", "ai"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "text-slate-500 hover:text-slate-800"}`}>{t}</button>
        ))}
      </div>

      {tab === "workspace" && (
        <div className="grid grid-cols-2 gap-4">
          <div className={`${CARD} p-5`}>
            <h3 className="font-semibold text-slate-900 text-base mb-4">Organization Details</h3>
            <div className="space-y-3">
              {[["Organization Name", "Horizons Community Foundation"], ["EIN", "83-4521890"], ["UEI", "HJKL9823MNP4"], ["City, State", "Chicago, IL"], ["Fiscal Year", "October 1 – September 30"]].map(([label, value]) => (
                <div key={label}>
                  <label className="text-sm text-slate-400 uppercase tracking-wide block mb-1">{label}</label>
                  <input defaultValue={value} className="w-full text-sm text-slate-700 border border-border rounded-lg px-3 py-2 bg-[#f5fdf8] outline-none focus:border-teal-300" />
                </div>
              ))}
              <button className={`${BTN_PRIMARY} mt-2`}><Check className="w-3.5 h-3.5" />Save Changes</button>
            </div>
          </div>
          <div className={`${CARD} p-5`}>
            <h3 className="font-semibold text-slate-900 text-base mb-4">Mission Statement</h3>
            <textarea className="w-full h-28 text-sm text-slate-700 bg-[#f5fdf8] border border-border rounded-xl p-3 outline-none resize-none focus:border-teal-300 leading-relaxed" defaultValue="To advance economic opportunity and community resilience through innovative workforce development, digital equity, and community development programs." />
            <div className="mt-4">
              <h3 className="font-semibold text-slate-900 text-base mb-2">Danger Zone</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-red-200 text-red-500 text-sm rounded-lg hover:bg-red-50 transition-colors">Delete Workspace</button>
            </div>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className={`${CARD} overflow-hidden`}>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-base">Team Members</h3>
            <button className={BTN_PRIMARY}><UserPlus className="w-3.5 h-3.5" />Invite User</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="bg-[#f5fdf8]">{["Name", "Email", "Role", "Status", "Last Active", ""].map(h => <th key={h} className="text-left px-4 py-2.5 font-semibold text-slate-400 uppercase tracking-wide text-sm">{h}</th>)}</tr></thead>
            <tbody>
              {[
                ["Jordan Adams", "jordan@horizons.org", "Admin", "Active", "Today"],
                ["Lisa Chen", "lisa@horizons.org", "Editor", "Active", "Yesterday"],
                ["Marcus Thompson", "marcus@horizons.org", "Admin", "Active", "Jul 5, 2026"],
                ["Sarah Kim", "sarah@horizons.org", "Viewer", "Pending", "—"],
              ].map(([name, email, role, status, last]) => (
                <tr key={email} className="border-t border-border hover:bg-[#f5fdf8]">
                  <td className="px-4 py-3 font-semibold text-slate-800">{name}</td>
                  <td className="px-4 py-3 text-slate-500">{email}</td>
                  <td className="px-4 py-3"><span className={`text-sm font-medium px-2 py-0.5 rounded-full ${role === "Admin" ? "bg-[#e8faf0] text-teal-700" : role === "Editor" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`}>{role}</span></td>
                  <td className="px-4 py-3"><span className={`text-sm font-medium px-2 py-0.5 rounded-full ${status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{status}</span></td>
                  <td className="px-4 py-3 text-slate-400">{last}</td>
                  <td className="px-4 py-3"><button className="text-slate-300 hover:text-slate-500"><MoreHorizontal className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "integrations" && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Grants.gov", desc: "Search and track federal grant opportunities", connected: true, icon: Globe },
            { name: "SAM.gov", desc: "Federal registrations and eligibility verification", connected: true, icon: Shield },
            { name: "Google Drive", desc: "Sync documents and proposals automatically", connected: false, icon: FolderOpen },
            { name: "Salesforce", desc: "Sync partner contacts and grant records", connected: false, icon: Briefcase },
            { name: "DocuSign", desc: "E-sign MOUs, letters of support, and agreements", connected: false, icon: FileCheck },
            { name: "Quickbooks", desc: "Connect financial data for budget reporting", connected: false, icon: DollarSign },
          ].map(({ name, desc, connected, icon: Icon }) => (
            <div key={name} className={`${CARD} p-4`}>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-[#e8faf0] rounded-lg"><Icon className="w-4 h-4 text-teal-600" /></div>
                {connected ? <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Connected</span> : <span className="text-sm text-slate-400">Not connected</span>}
              </div>
              <p className="text-base font-semibold text-slate-800 mb-1">{name}</p>
              <p className="text-sm text-slate-400 leading-relaxed mb-3">{desc}</p>
              <button className={connected ? BTN_SECONDARY : BTN_PRIMARY}>{connected ? "Configure" : "Connect"}</button>
            </div>
          ))}
        </div>
      )}

      {tab === "notifications" && (
        <div className="grid grid-cols-2 gap-4">
          {[["Grant Deadlines", "Receive alerts 30, 14, and 7 days before deadlines"], ["New AI Matches", "Notify when AI finds a grant matching your profile"], ["Report Due Reminders", "Alerts for quarterly and annual reporting deadlines"], ["Award Notifications", "Confirmation when grant decisions are received"], ["Partner Activity", "Updates when partners interact with shared applications"], ["Budget Variances", "Alert when spending deviates more than 10% from plan"]].map(([title, desc]) => (
            <div key={title} className={`${CARD} p-4 flex items-start gap-4`}>
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-800">{title}</p>
                <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <div className="flex items-center gap-2"><Mail className="w-3 h-3 text-slate-400" /><Toggle on={true} /></div>
                <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-slate-400" /><Toggle on={false} /></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "ai" && (
        <div className="grid grid-cols-2 gap-4">
          <div className={`${CARD} p-5`}>
            <h3 className="font-semibold text-slate-900 text-base mb-4">AI Configuration</h3>
            <div className="space-y-4">
              {[["Auto-Match New Grants", "AI searches for new grants daily and adds matches", true], ["Smart Proposal Drafts", "AI pre-populates proposals using your org profile", true], ["Compliance Monitoring", "AI flags missing documents and compliance issues", true], ["Partner Suggestions", "AI recommends partnerships based on grant requirements", false]].map(([label, desc, on]) => (
                <div key={label as string} className="flex items-start justify-between gap-4">
                  <div><p className="text-base font-semibold text-slate-800">{label}</p><p className="text-sm text-slate-400 mt-0.5">{desc}</p></div>
                  <Toggle on={on as boolean} />
                </div>
              ))}
            </div>
          </div>
          <div className={`${CARD} p-5`}>
            <h3 className="font-semibold text-slate-900 text-base mb-4">Search Preferences</h3>
            <div className="space-y-3">
              <div><label className="text-sm text-slate-400 uppercase tracking-wide block mb-1">Search Frequency</label>
                <select className="w-full text-sm text-slate-700 border border-border rounded-lg px-3 py-2 bg-[#f5fdf8] outline-none hover:border-teal-300"><option>Daily</option><option>Weekly</option><option>Real-time</option></select>
              </div>
              <div><label className="text-sm text-slate-400 uppercase tracking-wide block mb-1">Minimum Match Score</label>
                <select className="w-full text-sm text-slate-700 border border-border rounded-lg px-3 py-2 bg-[#f5fdf8] outline-none hover:border-teal-300"><option>70% and above</option><option>80% and above</option><option>90% and above</option></select>
              </div>
              <div><label className="text-sm text-slate-400 uppercase tracking-wide block mb-1">Grant Amount Range</label>
                <div className="flex gap-2">
                  <input defaultValue="$50,000" className="flex-1 text-sm text-slate-700 border border-border rounded-lg px-3 py-2 bg-[#f5fdf8] outline-none focus:border-teal-300" />
                  <input defaultValue="$2,000,000" className="flex-1 text-sm text-slate-700 border border-border rounded-lg px-3 py-2 bg-[#f5fdf8] outline-none focus:border-teal-300" />
                </div>
              </div>
              <button className={`${BTN_PRIMARY} mt-2`}><Check className="w-3.5 h-3.5" />Save AI Settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI Assistant ─────────────────────────────────────────────────────────────

type Message = { role: "ai" | "user"; content: string };

const AI_RESPONSES: Record<string, string> = {
  "What grants should TwiddleU apply for?": "For TwiddleU, I recommend focusing on: (1) Dept. of Education Title IV-A Innovation Grant ($500K, 89% match) — your digital learning platform aligns directly with their ed-tech innovation priority. (2) Lumina Foundation — Adult Learner Access ($350K, 84% match) — adult upskilling is their core focus. (3) NSF STEM+C ($750K, 81% match) — your coding curriculum qualifies. Apply in this order. I can start drafting any of these now.",
  "Which grants fit Jobvair?": "Jobvair is an excellent fit for: (1) DOL H-1B Technical Skills Training ($800K, 92% match) — AI-powered job matching aligns perfectly with their tech skills focus. (2) JPMorgan Chase PRO Infinity ($400K, 88% match) — workforce mobility platform is their stated priority. (3) Michigan Works! State Grant ($250K, 86% match) — geographic match for Detroit. Jobvair should prioritize the DOL H-1B grant — deadline is September 15. Shall I start the proposal?",
  "What reports are due this quarter?": "For Q3 2026 (July–September), you have 4 reports due:\n\n• DOL WIOA Q3 Performance Report — due July 30 (24 days away!)\n• NIH Supplement Interim Report — due August 15\n• Community Foundation Year-End — due September 1\n• State Workforce Dev. Final Report — due September 30\n\nThe DOL WIOA report is most urgent. You are at 94% of enrollment target and 89% of credential goal — strong numbers. I can generate a draft in 30 seconds.",
  "Are we missing any compliance items?": "I found 6 compliance gaps across your active grants:\n\n⚠️ DOL WIOA: Missing signed participant consent forms for 23 enrollees (due July 31)\n⚠️ NIH: Indirect cost rate agreement expires August 1 — needs renewal\n⚠️ MacArthur: LOI letter of support from Howard University not yet uploaded\n✓ HUD CDBG: All documentation complete\n✓ Community Foundation: Up to date\n\nI recommend addressing the DOL consent forms today. Want me to generate the consent form template?",
  "Generate a 3-year budget for DOL": "Generating 3-year DOL WIOA budget for $750,000:\n\nYear 1: $252,260 | Year 2: $259,918 | Year 3: $237,822\nPersonnel: $450,000 (60%) | Fringe: $122,717 (16%)\nTravel: $21,000 (3%) | Supplies: $31,800 (4%)\nContractual: $81,000 (11%) | Indirect (15%): $112,617\nTotal Federal: $750,000 | Match Required: $150,000\n\nI have generated the full SF-424A and budget narrative. Go to Budgets to view, edit, and export.",
  "Draft needs statement for MacArthur": "Drafting Needs Statement for MacArthur Foundation Technology & Society...\n\nThe convergence of artificial intelligence and civic infrastructure presents both unprecedented opportunity and acute risk for historically underserved communities. In Chicago's South and West Side neighborhoods — home to 340,000 residents with median household incomes below $35,000 — technology adoption rates lag the citywide average by 34%, while AI-driven hiring tools actively screen out qualified candidates due to algorithmic bias in resume parsing and credential recognition.\n\nHorizons Community Foundation requests $500,000 to deploy a community-owned AI literacy curriculum...\n\nGo to Proposal Builder to review and complete this section.",
  "Find grants under $500K": "Found 12 grants under $500K matching your profile:\n\nTop matches:\n• HUD CDBG — $400K (82% match, due Oct 15)\n• Google.org AI for Good — $300K (79% match, due Nov 1)\n• EPA Environmental Justice — $250K (74% match, due Nov 5)\n• NEA Arts in Communities — $75K (68% match, due Oct 20)\n• NIH Health Equity Supplement — $185K (71% match, due Dec 1)\n\nThe HUD and Google.org grants have the strongest near-term alignment. Want me to start proposals for either?",
  "Which grants are most worth our time?": "Based on your capacity, deadlines, and win probability, here is my prioritized list:\n\n🥇 DOL WIOA ($750K, 72% win prob) — Highest ROI. You have 87% of documents ready. Start now.\n🥈 MacArthur ($500K, 61% win prob) — Strong mission fit. Draft LOI this week.\n🥉 HUD CDBG ($400K, 48% win prob) — Solid geographic match. Apply after DOL.\n\n⏭️ Skip for now: NSF Convergence (too high difficulty without university partner), Google.org (requires stronger AI implementation narrative).\n\nFocus your next 30 days on DOL + MacArthur. I estimate 40 hours of writing time needed total.",
};

const DEFAULT_AI = "I have full context on Horizons Community Foundation, TwiddleU, and Jobvair — including missions, pipelines, documents, partners, and metrics. Ask me about grants, proposals, budgets, reports, compliance, or strategy for any of your organizations.";

function AIView({ org }: { org: OrgKey }) {
  const [messages, setMessages] = useState<Message[]>([{ role: "ai", content: `Hello, Jordan! I have full context on all three organizations — Horizons Community Foundation, TwiddleU, and Jobvair. I can help you find grants, draft proposals, generate budgets, check compliance, and build strategy for each. What can I help you with today?` }]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const orgName = ORGS[org].name;

  const suggestions = [
    "What grants should TwiddleU apply for?",
    "Which grants fit Jobvair?",
    "What reports are due this quarter?",
    "Are we missing any compliance items?",
    "Generate a 3-year budget for DOL",
    "Draft needs statement for MacArthur",
    "Find grants under $500K",
    "Which grants are most worth our time?",
  ];

  function send(text: string) {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setInput("");
    setTimeout(() => {
      const reply = AI_RESPONSES[msg] ?? DEFAULT_AI;
      setMessages(prev => [...prev, { role: "ai", content: reply }]);
    }, 600);
  }

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div className="flex flex-col gap-4" style={{ height: "calc(100vh - 132px)" }}>
      <div className="bg-gradient-to-r from-[#e2f9e8] to-[#e8f8f5] border border-teal-100 rounded-xl p-4 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-800">GrantAI Assistant</p>
          <p className="text-sm text-teal-600">Full context on {orgName}, TwiddleU, and Jobvair · 47 matched grants · Real-time intelligence</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /><span className="text-sm text-teal-500">Online</span></div>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-border p-5 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className={`max-w-lg rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${msg.role === "ai" ? "bg-[#f5fdf8] border border-border text-slate-700" : "bg-gradient-to-br from-teal-500 to-blue-500 text-white"}`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 shrink-0">
        {suggestions.map(s => (
          <button key={s} onClick={() => send(s)} className="px-3 py-1.5 bg-white border border-border rounded-full text-sm text-slate-600 hover:bg-[#e8faf0] hover:border-teal-200 hover:text-teal-800 transition-colors">{s}</button>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl p-3 flex items-center gap-3 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <input className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent" placeholder="Ask anything about grants, funding, proposals, budgets, compliance, or strategy..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send("")} />
        <button onClick={() => send("")} className="p-2 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg text-white hover:from-teal-600 hover:to-blue-600 transition-all">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

const VIEW_LABELS: Record<string, string> = {
  dashboard: "Dashboard", discovery: "Grant Discovery",
  pipeline: "Pipeline", calendar: "Calendar", proposals: "Proposal Builder",
  profile: "Org Profile", partners: "Partners", documents: "Documents",
  budgets: "Budget Builder", reporting: "Reporting", settings: "Settings", ai: "AI Assistant",
};

export default function App() {
  const [view, setView] = useState("dashboard");
  const [activeOrg, setActiveOrg] = useState<OrgKey>("horizons");
  const [orgOpen, setOrgOpen] = useState(false);
  const org = ORGS[activeOrg];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0fdf5]" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside className="w-56 bg-[#c8edd4] flex flex-col shrink-0">
        <div className="px-4 pt-5 pb-4 border-b border-black/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shadow-md shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-slate-800 font-bold text-base leading-none tracking-tight">GrantAI</p>
              <p className="text-slate-600 text-sm mt-0.5 tracking-wide uppercase">AI OS for Nonprofits</p>
            </div>
          </div>
        </div>

        <div className="px-3 py-2.5 border-b border-black/10 relative">
          <button onClick={() => setOrgOpen(!orgOpen)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/5 cursor-pointer transition-colors">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">{org.short}</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-slate-800 text-sm font-medium truncate">{org.name}</p>
              <p className="text-slate-600 text-sm">{org.city}</p>
            </div>
            <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform ${orgOpen ? "rotate-180" : ""}`} />
          </button>
          {orgOpen && (
            <div className="absolute left-3 right-3 top-full mt-1 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden">
              {(Object.keys(ORGS) as OrgKey[]).map(key => (
                <button key={key} onClick={() => { setActiveOrg(key); setOrgOpen(false); }} className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[#f5fdf8] transition-colors ${activeOrg === key ? "bg-[#e8faf0]" : ""}`}>
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold">{ORGS[key].short}</span>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-800">{ORGS[key].name}</p>
                    <p className="text-sm text-slate-400">{ORGS[key].city}</p>
                  </div>
                  {activeOrg === key && <Check className="w-3 h-3 text-teal-600 ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = view === id;
            return (
              <button key={id} onClick={() => setView(id)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${active ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white shadow-sm" : "text-slate-800 hover:text-slate-950 hover:bg-black/5"}`}>
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
                {id === "discovery" && <span className="ml-auto bg-teal-100 text-teal-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">47</span>}
                {id === "ai" && <span className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-black/10">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-black/5 cursor-pointer transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">JA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-800 text-sm font-medium truncate">Jordan Adams</p>
              <p className="text-slate-600 text-sm">Grant Director</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-border flex items-center px-6 gap-4 shrink-0">
          <h1 className="font-semibold text-slate-900 text-lg">{VIEW_LABELS[view] ?? view}</h1>
          <div className="flex-1 max-w-xs mx-4">
            <div className="flex items-center gap-2 bg-[#f0fbf5] rounded-lg px-3 py-1.5 border border-border">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input className="flex-1 bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none" placeholder="Search grants, proposals, partners..." />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#e8faf0] border border-teal-100 rounded-lg">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-teal-700">{org.name}</span>
            </div>
            <button className="relative p-2 hover:bg-[#edf9f2] rounded-lg transition-colors">
              <Bell className="w-4 h-4 text-slate-400" />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full" />
            </button>
            <button className={BTN_PRIMARY}><Plus className="w-3.5 h-3.5" />New Grant</button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6" onClick={() => orgOpen && setOrgOpen(false)}>
          {view === "dashboard" && <DashboardView />}
          {view === "discovery" && <DiscoveryView />}
          {view === "pipeline" && <PipelineView />}
          {view === "calendar" && <CalendarView />}
          {view === "proposals" && <ProposalBuilderView />}
          {view === "profile" && <OrgProfileView org={activeOrg} />}
          {view === "partners" && <PartnersView />}
          {view === "documents" && <DocumentsView />}
          {view === "budgets" && <BudgetBuilderView />}
          {view === "reporting" && <ReportingView />}
          {view === "settings" && <SettingsView />}
          {view === "ai" && <AIView org={activeOrg} />}
        </main>
      </div>
    </div>
  );
}
