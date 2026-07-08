import { Plus } from "lucide-react";
import { KANBAN_COLS, kanbanData } from "../../data/demoData";
import { BTN_PRIMARY, CARD } from "../../styles/classNames";
import { SectionHeader } from "../../components/common/SectionHeader";
export function PipelineView() {
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
