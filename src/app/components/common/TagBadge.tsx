export function TagBadge({ tag }: { tag: string }) {
  const map: Record<string, string> = {
    Federal: "bg-blue-50 text-blue-700 border-blue-100",
    Foundation: "bg-teal-50 text-teal-700 border-teal-100",
    State: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Corporate: "bg-amber-50 text-amber-700 border-amber-100",
    Other: "bg-slate-50 text-slate-600 border-slate-100",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-medium border ${map[tag] ?? map.Other}`}>{tag}</span>;
}
