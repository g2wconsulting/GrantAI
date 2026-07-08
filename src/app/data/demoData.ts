import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Cpu,
  DollarSign,
  FileText,
  FolderOpen,
  Globe,
  Shield,
  Sparkles,
  Target,
} from "lucide-react";
import type { OrgKey, Organization } from "../types";

export const ORGS: Record<OrgKey, Organization> = {
  horizons: { name: "Horizons Community Foundation", short: "HC", type: "Community Nonprofit", city: "Chicago, IL", ein: "83-4521890", uei: "HJKL9823MNP4", readiness: 84, staff: 24, budget: "$3.2M" },
  twiddleu: { name: "TwiddleU", short: "TU", type: "EdTech Nonprofit", city: "Atlanta, GA", ein: "47-2891034", uei: "TWDU8723XYZ1", readiness: 71, staff: 12, budget: "$1.8M" },
  jobvair: { name: "Jobvair", short: "JV", type: "Workforce Nonprofit", city: "Detroit, MI", ein: "61-3490182", uei: "JBVR4521ABC9", readiness: 78, staff: 18, budget: "$2.4M" },
};

// ─── Chart Data ───────────────────────────────────────────────────────────────

export const timelineData = [
  { month: "Jan", requested: 420, awarded: 280 },
  { month: "Feb", requested: 380, awarded: 195 },
  { month: "Mar", requested: 610, awarded: 410 },
  { month: "Apr", requested: 540, awarded: 320 },
  { month: "May", requested: 730, awarded: 520 },
  { month: "Jun", requested: 680, awarded: 485 },
  { month: "Jul", requested: 810, awarded: 590 },
];

export const sourceData = [
  { name: "Federal", value: 42, color: "#7ec8e3" },
  { name: "Foundation", value: 28, color: "#5dd4b8" },
  { name: "State", value: 16, color: "#86efac" },
  { name: "Corporate", value: 9, color: "#fcd989" },
  { name: "Other", value: 5, color: "#b4c9d4" },
];

export const stageData = [
  { stage: "Research", count: 14 },
  { stage: "Qualified", count: 9 },
  { stage: "Writing", count: 6 },
  { stage: "Submitted", count: 8 },
  { stage: "Awarded", count: 12 },
];

export const financialsData = [
  { grant: "DOL WIOA", budget: 750, spent: 312 },
  { grant: "MacArthur", budget: 500, spent: 48 },
  { grant: "NIH Supp.", budget: 215, spent: 198 },
  { grant: "Community Fdn", budget: 85, spent: 82 },
  { grant: "State WFD", budget: 340, spent: 287 },
];

// ─── Opportunities ────────────────────────────────────────────────────────────

export const DATE_RANGES = [
  { label: "Any date", value: "all" },
  { label: "Due this month", value: "month" },
  { label: "Due in 30 days", value: "30" },
  { label: "Due in 60 days", value: "60" },
  { label: "Due in 90 days", value: "90" },
  { label: "Due after 90 days", value: "90plus" },
];

export const opportunities = [
  { id: 1, title: "DOL Workforce Innovation & Opportunity Act", funder: "U.S. Dept. of Labor", amount: "$750,000", deadline: "Aug 14, 2026", deadlineDate: new Date("2026-08-14"), match: 94, tag: "Federal", recommended: true, insight: "87% of required attachments already in your document library. Strong workforce development narrative fit.", difficulty: "Medium", winProb: "72%" },
  { id: 2, title: "MacArthur Foundation — Technology & Society", funder: "MacArthur Foundation", amount: "$500,000", deadline: "Sep 2, 2026", deadlineDate: new Date("2026-09-02"), match: 91, tag: "Foundation", recommended: true, insight: "Similar organizations in your network received awards in 2024. Emphasize AI equity and community ownership angles.", difficulty: "High", winProb: "61%" },
  { id: 3, title: "NSF Convergence Accelerator — AI Track", funder: "National Science Foundation", amount: "$1,000,000", deadline: "Sep 30, 2026", deadlineDate: new Date("2026-09-30"), match: 88, tag: "Federal", recommended: true, insight: "Partner with Howard University to boost eligibility by 12 points. You already have 80% of this proposal written.", difficulty: "High", winProb: "55%" },
  { id: 4, title: "HUD Community Development Block Grant", funder: "Dept. of Housing & Urban Dev.", amount: "$400,000", deadline: "Oct 15, 2026", deadlineDate: new Date("2026-10-15"), match: 82, tag: "Federal", recommended: false, insight: "Geographic footprint aligns with HUD Opportunity Zones. Budget target: $380K–$420K.", difficulty: "Medium", winProb: "48%" },
  { id: 5, title: "Google.org Impact Challenge — AI for Good", funder: "Google.org", amount: "$300,000", deadline: "Nov 1, 2026", deadlineDate: new Date("2026-11-01"), match: 79, tag: "Corporate", recommended: false, insight: "AI-driven social programs are a priority this cycle. Strong tech implementation narrative required.", difficulty: "Medium", winProb: "43%" },
  { id: 6, title: "EPA Environmental Justice Collaborative", funder: "U.S. Environmental Protection Agency", amount: "$250,000", deadline: "Nov 5, 2026", deadlineDate: new Date("2026-11-05"), match: 74, tag: "Federal", recommended: false, insight: "Geographic overlap with target communities is strong. Add a community health section.", difficulty: "Medium", winProb: "39%" },
];

export const kanbanData: Record<string, { title: string; amount: string; deadline: string; match: number }[]> = {
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

export const KANBAN_COLS = [
  { id: "researching", label: "Researching", dot: "bg-slate-400" },
  { id: "qualified", label: "Qualified", dot: "bg-blue-500" },
  { id: "writing", label: "Writing", dot: "bg-teal-500" },
  { id: "submitted", label: "Submitted", dot: "bg-amber-500" },
  { id: "awarded", label: "Awarded", dot: "bg-emerald-500" },
];

export const KPI_DATA = [
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

export const CAL_EVENTS = [
  { day: 6, title: "MacArthur LOI Review", type: "task" },
  { day: 8, title: "Board Meeting", type: "meeting" },
  { day: 14, title: "NIH Q2 Report Due", type: "deadline" },
  { day: 15, title: "MacArthur LOI Draft Due", type: "deadline" },
  { day: 22, title: "Howard University Partner Call", type: "meeting" },
  { day: 28, title: "NSF Letter of Intent", type: "deadline" },
  { day: 30, title: "DOL WIOA Internal Review", type: "task" },
];

export const EVENT_COLORS: Record<string, string> = {
  deadline: "bg-red-100 text-red-700",
  meeting: "bg-purple-100 text-purple-700",
  task: "bg-teal-100 text-teal-700",
};

export const PROPOSAL_SECTIONS = [
  { id: "exec", label: "Executive Summary", status: "complete", words: 342 },
  { id: "needs", label: "Needs Statement", status: "in-progress", words: 218 },
  { id: "design", label: "Project Design", status: "empty", words: 0 },
  { id: "workplan", label: "Work Plan & Timeline", status: "empty", words: 0 },
  { id: "eval", label: "Evaluation Plan", status: "empty", words: 0 },
  { id: "budget", label: "Budget Narrative", status: "empty", words: 0 },
  { id: "sustain", label: "Sustainability Plan", status: "empty", words: 0 },
  { id: "attach", label: "Attachments & Compliance", status: "in-progress", words: 0 },
];

export const SECTION_CONTENT: Record<string, string> = {
  exec: "Horizons Community Foundation respectfully requests $750,000 from the U.S. Department of Labor to expand our WorkForward program serving 300 unemployed and underemployed adults in Cook County, Illinois. Over a 36-month performance period, we will deliver sector-based workforce training, industry-recognized credentials, career coaching, and employer connections in high-growth fields including healthcare support, logistics, and information technology.\n\nFounded in 2011, Horizons has served over 12,000 individuals through evidence-based workforce and community development programming. Our 68% employment placement rate and strong employer partnerships position us as a capable and trusted WIOA service provider.",
  needs: "Cook County's unemployment rate for adults without a college degree remains 2.3 times higher than the regional average, with Black and Latino workers disproportionately concentrated in low-wage, high-displacement occupations. Among our service population—adults ages 18-54 residing in Chicago's South and West Sides—53% lack post-secondary credentials and 41% report barriers including prior justice involvement, housing instability, or limited English proficiency.\n\nLocal labor market analysis indicates demand for 4,200 new workers in healthcare support roles and 1,800 in logistics and supply chain positions over the next three years, yet training capacity...",
};

export const PARTNERS = [
  { name: "Howard University", type: "University", role: "Training Partner", stage: "Active MOU", grants: ["NSF AI Track", "DOL WIOA"], contact: "Dr. Renee Phillips", lastContact: "Jul 3, 2026" },
  { name: "City of Chicago DFSS", type: "Government", role: "Referral & Co-Applicant", stage: "Strategic Partner", grants: ["HUD CDBG", "DOL WIOA"], contact: "Comm. Brandie Knazze", lastContact: "Jun 28, 2026" },
  { name: "United Way Metro Chicago", type: "Funder", role: "Funder & Collaborator", stage: "Active MOU", grants: ["Community Grant"], contact: "Sean Garrett", lastContact: "Jun 15, 2026" },
  { name: "CareerSource Illinois", type: "Workforce Agency", role: "Referral Partner", stage: "Engaged", grants: ["DOL WIOA"], contact: "Maria Lopez", lastContact: "May 30, 2026" },
  { name: "Microsoft TEALS", type: "Corporate", role: "Technology Partner", stage: "Prospect", grants: [], contact: "James Wu", lastContact: "Apr 12, 2026" },
  { name: "Chicago Community Trust", type: "Funder", role: "Funder", stage: "Strategic Partner", grants: ["Community Foundation Grant"], contact: "Helene Gayle", lastContact: "Jul 1, 2026" },
];

export const STAGE_COLORS: Record<string, string> = {
  "Strategic Partner": "bg-emerald-50 text-emerald-700",
  "Active MOU": "bg-teal-50 text-teal-700",
  "Engaged": "bg-blue-50 text-blue-700",
  "Prospect": "bg-slate-100 text-slate-600",
};

export const DOCS = [
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

export const FILE_ICONS: Record<string, { bg: string; label: string }> = {
  pdf: { bg: "bg-red-100 text-red-600", label: "PDF" },
  word: { bg: "bg-blue-100 text-blue-600", label: "DOC" },
  excel: { bg: "bg-emerald-100 text-emerald-600", label: "XLS" },
  image: { bg: "bg-purple-100 text-purple-600", label: "IMG" },
};

export const FOLDERS = [
  { name: "All Files", icon: FolderOpen, count: 12, color: "text-slate-500" },
  { name: "Proposals", icon: FileText, count: 2, color: "text-blue-500" },
  { name: "Budgets", icon: DollarSign, count: 1, color: "text-emerald-500" },
  { name: "Financial", icon: BarChart3, count: 2, color: "text-teal-500" },
  { name: "Legal", icon: Shield, count: 4, color: "text-violet-500" },
  { name: "Reports", icon: BookOpen, count: 2, color: "text-amber-500" },
  { name: "Media", icon: Globe, count: 1, color: "text-pink-400" },
];

export const BUDGET_ROWS = [
  { category: "Personnel", items: [{ label: "Program Director (1.0 FTE)", y1: 85000, y2: 87550, y3: 90177 }, { label: "Career Coach I (1.0 FTE)", y1: 55000, y2: 56650, y3: 58350 }, { label: "Career Coach II (0.75 FTE)", y1: 41250, y2: 42488, y3: 43762 }, { label: "Data Coordinator (0.5 FTE)", y1: 28000, y2: 28840, y3: 29705 }] },
  { category: "Fringe Benefits (19%)", items: [{ label: "Fringe @ 19%", y1: 39710, y2: 40890, y3: 42117 }] },
  { category: "Travel", items: [{ label: "Local mileage & site visits", y1: 4200, y2: 4200, y3: 4200 }, { label: "Conference attendance", y1: 2800, y2: 2800, y3: 2800 }] },
  { category: "Supplies", items: [{ label: "Training materials & curricula", y1: 8500, y2: 7000, y3: 6000 }, { label: "Office supplies", y1: 1800, y2: 1800, y3: 1800 }] },
  { category: "Contractual", items: [{ label: "Howard University — Training", y1: 30000, y2: 30000, y3: 25000 }, { label: "Evaluator (external)", y1: 12000, y2: 12000, y3: 12000 }] },
];

export const METRICS = [
  { label: "Participants Enrolled", current: 847, target: 900, unit: "people", color: "bg-teal-500" },
  { label: "Credentials Earned", current: 312, target: 350, unit: "credentials", color: "bg-blue-500" },
  { label: "Job Placements", current: 198, target: 225, unit: "placements", color: "bg-emerald-500" },
  { label: "Retained at 6 months", current: 162, target: 180, unit: "retained", color: "bg-sky-500" },
  { label: "Average Wage Gain", current: 8.4, target: 8.0, unit: "$/hr", color: "bg-violet-400" },
  { label: "Partner Engagements", current: 24, target: 20, unit: "partners", color: "bg-amber-400" },
];

export const REPORTS_DUE = [
  { name: "DOL WIOA — Q3 Performance Report", grant: "DOL WIOA", due: "Jul 30, 2026", status: "Due Soon" },
  { name: "NIH Supplement — Interim Report", grant: "NIH Research", due: "Aug 15, 2026", status: "Not Started" },
  { name: "Community Foundation — Year-End", grant: "Chicago Community Trust", due: "Sep 1, 2026", status: "Not Started" },
  { name: "State Workforce Dev. — Final Report", grant: "IDOL", due: "Sep 30, 2026", status: "Not Started" },
  { name: "MacArthur — Narrative Update", grant: "MacArthur", due: "Dec 1, 2026", status: "Not Started" },
];

export const AI_RESPONSES: Record<string, string> = {
  "What grants should TwiddleU apply for?": "For TwiddleU, I recommend focusing on: (1) Dept. of Education Title IV-A Innovation Grant ($500K, 89% match) — your digital learning platform aligns directly with their ed-tech innovation priority. (2) Lumina Foundation — Adult Learner Access ($350K, 84% match) — adult upskilling is their core focus. (3) NSF STEM+C ($750K, 81% match) — your coding curriculum qualifies. Apply in this order. I can start drafting any of these now.",
  "Which grants fit Jobvair?": "Jobvair is an excellent fit for: (1) DOL H-1B Technical Skills Training ($800K, 92% match) — AI-powered job matching aligns perfectly with their tech skills focus. (2) JPMorgan Chase PRO Infinity ($400K, 88% match) — workforce mobility platform is their stated priority. (3) Michigan Works! State Grant ($250K, 86% match) — geographic match for Detroit. Jobvair should prioritize the DOL H-1B grant — deadline is September 15. Shall I start the proposal?",
  "What reports are due this quarter?": "For Q3 2026 (July–September), you have 4 reports due:\n\n• DOL WIOA Q3 Performance Report — due July 30 (24 days away!)\n• NIH Supplement Interim Report — due August 15\n• Community Foundation Year-End — due September 1\n• State Workforce Dev. Final Report — due September 30\n\nThe DOL WIOA report is most urgent. You are at 94% of enrollment target and 89% of credential goal — strong numbers. I can generate a draft in 30 seconds.",
  "Are we missing any compliance items?": "I found 6 compliance gaps across your active grants:\n\n⚠️ DOL WIOA: Missing signed participant consent forms for 23 enrollees (due July 31)\n⚠️ NIH: Indirect cost rate agreement expires August 1 — needs renewal\n⚠️ MacArthur: LOI letter of support from Howard University not yet uploaded\n✓ HUD CDBG: All documentation complete\n✓ Community Foundation: Up to date\n\nI recommend addressing the DOL consent forms today. Want me to generate the consent form template?",
  "Generate a 3-year budget for DOL": "Generating 3-year DOL WIOA budget for $750,000:\n\nYear 1: $252,260 | Year 2: $259,918 | Year 3: $237,822\nPersonnel: $450,000 (60%) | Fringe: $122,717 (16%)\nTravel: $21,000 (3%) | Supplies: $31,800 (4%)\nContractual: $81,000 (11%) | Indirect (15%): $112,617\nTotal Federal: $750,000 | Match Required: $150,000\n\nI have generated the full SF-424A and budget narrative. Go to Budgets to view, edit, and export.",
  "Draft needs statement for MacArthur": "Drafting Needs Statement for MacArthur Foundation Technology & Society...\n\nThe convergence of artificial intelligence and civic infrastructure presents both unprecedented opportunity and acute risk for historically underserved communities. In Chicago's South and West Side neighborhoods — home to 340,000 residents with median household incomes below $35,000 — technology adoption rates lag the citywide average by 34%, while AI-driven hiring tools actively screen out qualified candidates due to algorithmic bias in resume parsing and credential recognition.\n\nHorizons Community Foundation requests $500,000 to deploy a community-owned AI literacy curriculum...\n\nGo to Proposal Builder to review and complete this section.",
  "Find grants under $500K": "Found 12 grants under $500K matching your profile:\n\nTop matches:\n• HUD CDBG — $400K (82% match, due Oct 15)\n• Google.org AI for Good — $300K (79% match, due Nov 1)\n• EPA Environmental Justice — $250K (74% match, due Nov 5)\n• NEA Arts in Communities — $75K (68% match, due Oct 20)\n• NIH Health Equity Supplement — $185K (71% match, due Dec 1)\n\nThe HUD and Google.org grants have the strongest near-term alignment. Want me to start proposals for either?",
  "Which grants are most worth our time?": "Based on your capacity, deadlines, and win probability, here is my prioritized list:\n\n🥇 DOL WIOA ($750K, 72% win prob) — Highest ROI. You have 87% of documents ready. Start now.\n🥈 MacArthur ($500K, 61% win prob) — Strong mission fit. Draft LOI this week.\n🥉 HUD CDBG ($400K, 48% win prob) — Solid geographic match. Apply after DOL.\n\n⏭️ Skip for now: NSF Convergence (too high difficulty without university partner), Google.org (requires stronger AI implementation narrative).\n\nFocus your next 30 days on DOL + MacArthur. I estimate 40 hours of writing time needed total.",
};

export const DEFAULT_AI = "I have full context on Horizons Community Foundation, TwiddleU, and Jobvair — including missions, pipelines, documents, partners, and metrics. Ask me about grants, proposals, budgets, reports, compliance, or strategy for any of your organizations.";
