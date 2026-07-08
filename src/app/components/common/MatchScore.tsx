export function MatchScore({ score }: { score: number }) {
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
