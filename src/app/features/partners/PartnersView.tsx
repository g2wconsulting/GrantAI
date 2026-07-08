import { useState } from "react";
import { MoreHorizontal, Plus, Sparkles, UserPlus } from "lucide-react";
import { PARTNERS, STAGE_COLORS } from "../../data/demoData";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../../styles/classNames";
import { SectionHeader } from "../../components/common/SectionHeader";
export function PartnersView() {
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
