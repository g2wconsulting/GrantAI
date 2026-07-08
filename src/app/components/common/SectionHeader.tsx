import type { ReactNode } from "react";

export function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
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
