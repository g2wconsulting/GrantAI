import { useState } from "react";
import { Download, Sparkles } from "lucide-react";
import { BUDGET_ROWS } from "../../data/demoData";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../../styles/classNames";
import { formatCurrency } from "../../utils/money";
export function BudgetBuilderView() {
  const [grant, setGrant] = useState("DOL WIOA Workforce Grant — $750,000");

  const getTotals = (rows: typeof BUDGET_ROWS) => {
    let y1 = 0, y2 = 0, y3 = 0;
    rows.forEach(r => r.items.forEach(i => { y1 += i.y1; y2 += i.y2; y3 += i.y3; }));
    return { y1, y2, y3, total: y1 + y2 + y3 };
  };

  const direct = getTotals(BUDGET_ROWS);
  const indirect = { y1: Math.round(direct.y1 * 0.15), y2: Math.round(direct.y2 * 0.15), y3: Math.round(direct.y3 * 0.15) };
  const totalProject = { y1: direct.y1 + indirect.y1, y2: direct.y2 + indirect.y2, y3: direct.y3 + indirect.y3 };
  const fmt = formatCurrency;

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
