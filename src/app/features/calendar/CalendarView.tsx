import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { CAL_EVENTS, EVENT_COLORS } from "../../data/demoData";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../../styles/classNames";
import { SectionHeader } from "../../components/common/SectionHeader";
export function CalendarView() {
  const [typeFilter, setTypeFilter] = useState("All");
  // July 2026: July 1 = Wednesday = index 3 (0=Sun)
  const daysInMonth = 31;
  const startIndex = 3;
  const totalCells = Math.ceil((startIndex + daysInMonth) / 7) * 7;

  const visibleEvents = typeFilter === "All" ? CAL_EVENTS : CAL_EVENTS.filter(e => e.type === typeFilter.toLowerCase());

  return (
    <div className="space-y-5">
      <SectionHeader title="Calendar" sub="July 2026 · Grant deadlines, reporting, and team events" action={
        <div className="flex items-center gap-2">
          <button className={BTN_SECONDARY}><ChevronLeft className="w-3.5 h-3.5" />June</button>
          <span className="text-base font-semibold text-slate-700 px-2">July 2026</span>
          <button className={BTN_SECONDARY}>August<ChevronRight className="w-3.5 h-3.5" /></button>
          <button className={BTN_PRIMARY}><Plus className="w-3.5 h-3.5" />Add Event</button>
        </div>
      } />

      <div className="flex items-center gap-2">
        {["All", "Deadlines", "Meetings", "Tasks"].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${typeFilter === t ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "bg-white border border-border text-slate-500 hover:bg-[#edf9f2]"}`}>{t}</button>
        ))}
      </div>

      <div className={`${CARD} p-5`}>
        <div className="grid grid-cols-7 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="text-center text-sm font-semibold text-slate-400 py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: totalCells }).map((_, i) => {
            const day = i - startIndex + 1;
            const isValid = day >= 1 && day <= daysInMonth;
            const isToday = day === 6;
            const dayEvents = visibleEvents.filter(e => e.day === day);
            return (
              <div key={i} className={`min-h-[80px] p-1.5 rounded-lg ${isValid ? "bg-white hover:bg-[#f5fdf8] cursor-pointer transition-colors" : "bg-transparent"} ${isToday ? "ring-2 ring-teal-400" : ""}`}>
                {isValid && (
                  <>
                    <span className={`text-sm font-medium block mb-1 ${isToday ? "w-5 h-5 bg-gradient-to-br from-teal-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm" : "text-slate-600"}`}>{day}</span>
                    <div className="space-y-0.5">
                      {dayEvents.map((ev, j) => (
                        <div key={j} className={`text-[9px] font-medium px-1 py-0.5 rounded truncate ${EVENT_COLORS[ev.type]}`}>{ev.title}</div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={`${CARD} p-5`}>
        <h3 className="font-semibold text-slate-900 text-base mb-4">Upcoming Events</h3>
        <div className="space-y-2.5">
          {CAL_EVENTS.map((ev, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#f5fdf8] hover:bg-[#eafaf3] transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-white border border-border flex flex-col items-center justify-center shrink-0">
                <span className="text-sm text-slate-400">JUL</span>
                <span className="text-base font-bold text-slate-900">{ev.day}</span>
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-800">{ev.title}</p>
                <p className="text-sm text-slate-400">July {ev.day}, 2026</p>
              </div>
              <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${EVENT_COLORS[ev.type]}`}>{ev.type.charAt(0).toUpperCase() + ev.type.slice(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Proposal Builder ─────────────────────────────────────────────────────────
