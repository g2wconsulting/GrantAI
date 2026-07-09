import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { BTN_PRIMARY, CARD } from "../../styles/classNames";
import { formatCurrency } from "../../utils/money";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { fetchBudgets } from "../../lib/dataService";
import { supabase } from "../../lib/supabase";

type BudgetRow = {
  id: string;
  category: string;
  label: string;
  year1: number;
  year2: number;
  year3: number;
  org_opportunity: { id: string; opportunity: { title: string } } | null;
};

export function BudgetBuilderView() {
  const { org } = useActiveOrg();
  const [rows, setRows] = useState<BudgetRow[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string | "all">("all");
  const [loading, setLoading] = useState(true);
  const fmt = formatCurrency;

  const load = useCallback(async () => {
    if (!org) return;
    setLoading(true);
    const { data } = await fetchBudgets(org.id);
    setRows(data as unknown as BudgetRow[]);
    setLoading(false);
  }, [org]);

  useEffect(() => {
    load();
  }, [load]);

  const grantOptions = Array.from(
    new Map(rows.filter((r) => r.org_opportunity).map((r) => [r.org_opportunity!.id, r.org_opportunity!.opportunity.title])).entries()
  );

  const visibleRows = selectedOppId === "all" ? rows : rows.filter((r) => r.org_opportunity?.id === selectedOppId);

  const grouped = visibleRows.reduce<Record<string, BudgetRow[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  const totals = visibleRows.reduce(
    (acc, r) => ({ y1: acc.y1 + Number(r.year1), y2: acc.y2 + Number(r.year2), y3: acc.y3 + Number(r.year3) }),
    { y1: 0, y2: 0, y3: 0 }
  );

  async function updateCell(id: string, field: "year1" | "year2" | "year3", value: string) {
    const num = Number(value) || 0;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: num } : r)));
    await supabase.from("budgets").update({ [field]: num }).eq("id", id);
  }

  async function updateLabel(id: string, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, label: value } : r)));
    await supabase.from("budgets").update({ label: value }).eq("id", id);
  }

  async function addLine() {
    if (!org) return;
    const orgOppId = selectedOppId === "all" ? rows[0]?.org_opportunity?.id ?? null : selectedOppId;
    const { data } = await supabase
      .from("budgets")
      .insert({ org_id: org.id, org_opportunity_id: orgOppId, category: "Other", label: "New line item", year1: 0, year2: 0, year3: 0 })
      .select()
      .maybeSingle();
    if (data) await load();
  }

  async function deleteLine(id: string) {
    await supabase.from("budgets").delete().eq("id", id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return <p className="text-sm text-slate-400 px-1">Loading budgets…</p>;

  if (rows.length === 0) {
    return (
      <div className={`${CARD} p-8 text-center`}>
        <p className="text-slate-600 font-medium">No budgets yet</p>
        <p className="text-sm text-slate-400 mt-1">A starter budget line is created automatically when you add a grant to your pipeline from Discovery.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`${CARD} p-4`}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm text-slate-400 uppercase tracking-wide block mb-1">Grant</label>
            <select value={selectedOppId} onChange={(e) => setSelectedOppId(e.target.value)} className="text-sm font-medium text-slate-800 border border-border rounded-lg px-3 py-2 bg-white outline-none w-full max-w-sm hover:border-teal-300">
              <option value="all">All grants</option>
              {grantOptions.map(([id, title]) => (
                <option key={id} value={id}>{title}</option>
              ))}
            </select>
          </div>
          <button className={BTN_PRIMARY} onClick={addLine}><Plus className="w-3.5 h-3.5" />Add Line Item</button>
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
              <th className="px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([category, items]) => (
              <>
                <tr key={category} className="bg-[#f0fdf5]">
                  <td className="px-4 py-2 font-semibold text-slate-700 text-sm uppercase tracking-wide" colSpan={6}>{category}</td>
                </tr>
                {items.map((item) => {
                  const total = Number(item.year1) + Number(item.year2) + Number(item.year3);
                  return (
                    <tr key={item.id} className="border-t border-border hover:bg-[#f5fdf8]">
                      <td className="px-4 py-2.5 pl-7">
                        <input value={item.label} onChange={(e) => updateLabel(item.id, e.target.value)} className="w-full text-slate-600 bg-transparent outline-none border-b border-transparent focus:border-teal-300" />
                      </td>
                      {(["year1", "year2", "year3"] as const).map((f) => (
                        <td key={f} className="px-4 py-2.5 text-right">
                          <input
                            type="number"
                            value={item[f]}
                            onChange={(e) => updateCell(item.id, f, e.target.value)}
                            className="w-24 text-right text-slate-700 font-medium bg-transparent outline-none border-b border-transparent focus:border-teal-300"
                          />
                        </td>
                      ))}
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-800">{fmt(total)}</td>
                      <td className="px-2 py-2.5 text-center">
                        <button onClick={() => deleteLine(item.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  );
                })}
              </>
            ))}
            <tr className="border-t-2 border-teal-200 bg-teal-50">
              <td className="px-4 py-3 font-bold text-teal-800">Total</td>
              {[totals.y1, totals.y2, totals.y3, totals.y1 + totals.y2 + totals.y3].map((v, i) => (
                <td key={i} className="px-4 py-3 text-right font-bold text-teal-800">{fmt(v)}</td>
              ))}
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
