import { useState } from "react";
import { BookOpen, CheckSquare, FileText, Lightbulb } from "lucide-react";
import { CARD } from "../../styles/classNames";

const CATEGORIES = [
  {
    id: "writing",
    label: "Grant Writing",
    icon: FileText,
    items: [
      { title: "Needs Statement Checklist", desc: "What funders actually look for: data-backed problem statements, community voice, and clear scope." },
      { title: "Logic Model Basics", desc: "How to connect inputs → activities → outputs → outcomes → impact in a way reviewers can follow quickly." },
      { title: "Common Rejection Reasons", desc: "Misaligned scope, weak evaluation plans, unclear budgets, and missing letters of support — the recurring culprits." },
    ],
  },
  {
    id: "compliance",
    label: "Compliance & Reporting",
    icon: CheckSquare,
    items: [
      { title: "Indirect Cost Rate Basics", desc: "De minimis rate (10% of MTDC) vs. a negotiated rate — when each applies and how to document it." },
      { title: "Federal Reporting Cadence", desc: "Typical quarterly/annual reporting rhythms for federal awards, and what usually needs to be included." },
      { title: "Audit Readiness Checklist", desc: "What a Single Audit (if you're over the federal expenditure threshold) usually asks to see." },
    ],
  },
  {
    id: "budgeting",
    label: "Budgeting",
    icon: Lightbulb,
    items: [
      { title: "Direct vs. Indirect Costs", desc: "How funders typically distinguish these, and why miscategorizing them is a common audit flag." },
      { title: "Multi-Year Budget Planning", desc: "Building Year 1–3 projections that account for staffing ramp-up and inflation assumptions." },
    ],
  },
];

export function ResourceLibraryView() {
  const [active, setActive] = useState(CATEGORIES[0].id);
  const current = CATEGORIES.find((c) => c.id === active)!;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><BookOpen className="w-5 h-5 text-teal-600" />Resource Library</h1>
        <p className="text-sm text-slate-500 mt-1">Grant writing, compliance, and budgeting guidance — general knowledge, not a substitute for your own grant's specific guidelines.</p>
      </div>

      <div className="flex items-center gap-1 bg-white border border-border rounded-xl p-1 w-fit">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setActive(c.id)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${active === c.id ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "text-slate-500 hover:text-slate-800"}`}>
            <c.icon className="w-3.5 h-3.5" />{c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {current.items.map((item) => (
          <div key={item.title} className={`${CARD} p-5`}>
            <h3 className="font-semibold text-slate-900 mb-1.5">{item.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className={`${CARD} p-5 bg-[#f5fdf8]`}>
        <p className="text-sm text-slate-500">Want something added here — a template, a specific checklist, a walkthrough? Ask Owlfred in the AI Assistant, or let your Claude session know what would help.</p>
      </div>
    </div>
  );
}
