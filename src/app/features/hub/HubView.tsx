import { Link } from "react-router";
import { HUB_ITEMS } from "../../config/navigation";
import { CARD } from "../../styles/classNames";

const DESCRIPTIONS: Record<string, string> = {
  profile: "Your mission, focus areas, programs, team, and financial snapshot.",
  certifications: "MBE/WBE/DBE certifications, state registrations, licenses, and expirations.",
  partners: "Universities, funders, government agencies, and corporate partners.",
  documents: "Compliance, financial, and board documents in one place.",
  budgets: "Line-item budgets tied to each grant in your pipeline.",
  reporting: "Grant reports due, outcomes, and financial reporting.",
  resources: "Templates, guides, and tips for grant writing and compliance.",
};

export function HubView() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">The Hub</h1>
        <p className="text-sm text-slate-500 mt-1">Everything about your organization, partners, and paperwork — all in one place.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {HUB_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.id} to={item.path} className={`${CARD} p-5 hover:shadow-md hover:border-teal-200 transition-all group block`}>
              <div className="w-10 h-10 rounded-xl bg-[#e8faf0] flex items-center justify-center mb-3 group-hover:bg-gradient-to-br group-hover:from-teal-500 group-hover:to-blue-500 transition-colors">
                <Icon className="w-4 h-4 text-teal-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{item.label}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{DESCRIPTIONS[item.id] ?? ""}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
