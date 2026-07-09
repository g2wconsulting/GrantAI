import { useCallback, useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../../styles/classNames";
import { SectionHeader } from "../../components/common/SectionHeader";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { fetchCalendarEvents } from "../../lib/dataService";

const EVENT_COLORS: Record<string, string> = {
  deadline: "bg-red-50 text-red-700",
  report: "bg-amber-50 text-amber-700",
  meeting: "bg-blue-50 text-blue-700",
  other: "bg-slate-50 text-slate-600",
};

type EventRow = { id: string; title: string; event_date: string; type: string };

export function CalendarView() {
  const { org } = useActiveOrg();
  const [typeFilter, setTypeFilter] = useState("All");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthOffset, setMonthOffset] = useState(0);

  const load = useCallback(async () => {
    if (!org) return;
    setLoading(true);
    const { data } = await fetchCalendarEvents(org.id);
    setEvents(data as unknown as EventRow[]);
    setLoading(false);
  }, [org]);

  useEffect(() => {
    load();
  }, [load]);

  const viewDate = new Date();
  viewDate.setMonth(viewDate.getMonth() + monthOffset);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startIndex = new Date(year, month, 1).getDay();
  const totalCells = Math.ceil((startIndex + daysInMonth) / 7) * 7;
  const today = new Date();

  const monthEvents = events.filter((e) => {
    const d = new Date(e.event_date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const visibleEvents = typeFilter === "All" ? monthEvents : monthEvents.filter((e) => e.type === typeFilter.toLowerCase().replace("deadlines", "deadline").replace("meetings", "meeting").replace("tasks", "other"));

  return (
    <div className="space-y-5">
      <SectionHeader title="Calendar" sub={`${monthLabel} · Grant deadlines pulled automatically from your pipeline`} action={
        <div className="flex items-center gap-2">
          <button className={BTN_SECONDARY} onClick={() => setMonthOffset((m) => m - 1)}><ChevronLeft className="w-3.5 h-3.5" />Prev</button>
          <span className="text-base font-semibold text-slate-700 px-2">{monthLabel}</span>
          <button className={BTN_SECONDARY} onClick={() => setMonthOffset((m) => m + 1)}>Next<ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
      } />

      <div className="flex items-center gap-2">
        {["All", "Deadlines", "Meetings", "Tasks"].map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${typeFilter === t ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "bg-white border border-border text-slate-500 hover:bg-[#edf9f2]"}`}>{t}</button>
        ))}
      </div>

      {loading && <p className="text-sm text-slate-400 px-1">Loading calendar…</p>}

      <div className={`${CARD} p-5`}>
        <div className="grid grid-cols-7 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center text-sm font-semibold text-slate-400 py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: totalCells }).map((_, i) => {
            const day = i - startIndex + 1;
            const isValid = day >= 1 && day <= daysInMonth;
            const isToday = isValid && day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const dayEvents = visibleEvents.filter((e) => new Date(e.event_date).getDate() === day);
            return (
              <div key={i} className={`min-h-[80px] p-1.5 rounded-lg ${isValid ? "bg-white hover:bg-[#f5fdf8] cursor-pointer transition-colors" : "bg-transparent"} ${isToday ? "ring-2 ring-teal-400" : ""}`}>
                {isValid && (
                  <>
                    <span className={`text-sm font-medium block mb-1 ${isToday ? "w-5 h-5 bg-gradient-to-br from-teal-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm" : "text-slate-600"}`}>{day}</span>
                    <div className="space-y-0.5">
                      {dayEvents.map((ev) => (
                        <div key={ev.id} className={`text-[9px] font-medium px-1 py-0.5 rounded truncate ${EVENT_COLORS[ev.type] ?? EVENT_COLORS.other}`}>{ev.title}</div>
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
        {monthEvents.length === 0 && !loading && (
          <p className="text-sm text-slate-400">No events yet — deadlines appear here automatically when you add a grant to your pipeline.</p>
        )}
        <div className="space-y-2.5">
          {monthEvents.map((ev) => {
            const d = new Date(ev.event_date);
            return (
              <div key={ev.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#f5fdf8] hover:bg-[#eafaf3] transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-white border border-border flex flex-col items-center justify-center shrink-0">
                  <span className="text-sm text-slate-400">{d.toLocaleDateString(undefined, { month: "short" }).toUpperCase()}</span>
                  <span className="text-base font-bold text-slate-900">{d.getDate()}</span>
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-slate-800">{ev.title}</p>
                  <p className="text-sm text-slate-400">{d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</p>
                </div>
                <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${EVENT_COLORS[ev.type] ?? EVENT_COLORS.other}`}>{ev.type.charAt(0).toUpperCase() + ev.type.slice(1)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
