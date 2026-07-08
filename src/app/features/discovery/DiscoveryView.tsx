import { useState } from "react";
import { Calendar, ExternalLink, Filter, Search, Sparkles } from "lucide-react";
import { DATE_RANGES, opportunities } from "../../data/demoData";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../../styles/classNames";
import { MatchScore } from "../../components/common/MatchScore";
import { TagBadge } from "../../components/common/TagBadge";
import { daysUntil, isDateInRange } from "../../utils/dates";
import { parseCurrencyAmount } from "../../utils/money";
export function DiscoveryView() {
  const [filter, setFilter] = useState("All");
  const [dateRange, setDateRange] = useState("all");
  const [sortBy, setSortBy] = useState("match");
  const tags = ["All", "Federal", "Foundation", "State", "Corporate"];
  const now = new Date();


  const filtered = opportunities
    .filter((o) => (filter === "All" || o.tag === filter) && isDateInRange(o.deadlineDate, dateRange, now))
    .sort((a, b) => {
      if (sortBy === "match") return b.match - a.match;
      if (sortBy === "deadline") return a.deadlineDate.getTime() - b.deadlineDate.getTime();
      if (sortBy === "amount") return parseCurrencyAmount(b.amount) - parseCurrencyAmount(a.amount);
      return 0;
    });

  const daysUntilDeadline = (d: Date) => daysUntil(d, now);

  return (
    <div className="space-y-4">
      <div className={`${CARD} p-4`}>
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-[#f0fbf5] rounded-xl px-3 py-2.5 border border-border">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none" placeholder="Search grants by keyword, funder, category, amount..." />
          </div>
          <button className={BTN_SECONDARY}><Filter className="w-3.5 h-3.5" />Filters</button>
          <button className={BTN_PRIMARY}><Sparkles className="w-3.5 h-3.5" />AI Search</button>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {tags.map((t) => (
            <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === t ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>{t}</button>
          ))}
          <div className="w-px h-4 bg-border mx-1" />
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="text-sm border border-border rounded-lg px-2 py-1 text-slate-600 bg-white outline-none cursor-pointer hover:border-teal-300">
              {DATE_RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1.5 ml-1">
            <span className="text-sm text-slate-400">Sort:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border border-border rounded-lg px-2 py-1 text-slate-600 bg-white outline-none cursor-pointer hover:border-teal-300">
              <option value="match">AI Match</option>
              <option value="deadline">Deadline</option>
              <option value="amount">Amount</option>
            </select>
          </div>
          <span className="ml-auto text-sm text-slate-400">{filtered.length} opportunities</span>
        </div>
      </div>
      <div className="space-y-3">
        {filtered.map((opp) => (
          <div key={opp.id} className={`${CARD} p-5 hover:shadow-md transition-all`}>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0 text-white font-bold text-sm">{opp.match}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 text-base">{opp.title}</h3>
                      {opp.recommended && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#e8faf0] text-teal-800 rounded text-sm font-semibold border border-teal-100"><Sparkles className="w-2.5 h-2.5" />AI Pick</span>}
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">{opp.funder}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900 text-sm">{opp.amount}</p>
                    {(() => {
                      const days = daysUntilDeadline(opp.deadlineDate);
                      const urgent = days <= 7;
                      return (
                        <div className="mt-1">
                          <p className={`text-sm font-bold ${urgent ? "text-red-600" : "text-slate-700"}`}>Due {opp.deadline}</p>
                          {urgent && <p className="text-sm font-semibold text-red-500 mt-0.5">{days} day{days !== 1 ? "s" : ""} left!</p>}
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                  <TagBadge tag={opp.tag} />
                  <div className="flex items-center gap-1.5"><span className="text-sm text-slate-400">Match:</span><MatchScore score={opp.match} /></div>
                  <div className="flex items-center gap-1"><span className="text-sm text-slate-400">Win prob:</span><span className="text-sm font-semibold text-emerald-600 ml-1">{opp.winProb}</span></div>
                  <div className="flex items-center gap-1"><span className="text-sm text-slate-400">Difficulty:</span><span className={`text-sm font-semibold ml-1 ${opp.difficulty === "High" ? "text-rose-500" : "text-amber-500"}`}>{opp.difficulty}</span></div>
                </div>
                <div className="mt-3 p-3 bg-gradient-to-r from-[#e8f8f5] to-[#e2f9e8] rounded-lg border border-teal-100">
                  <div className="flex items-start gap-2"><Sparkles className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" /><p className="text-sm text-teal-900 leading-relaxed">{opp.insight}</p></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
              <button className={BTN_PRIMARY}>Start Proposal</button>
              <button className={BTN_SECONDARY}>Add to Pipeline</button>
              <button className={BTN_SECONDARY}>View NOFO</button>
              <div className="ml-auto flex items-center gap-1.5 text-sm text-slate-300 hover:text-slate-500 cursor-pointer transition-colors"><ExternalLink className="w-3 h-3" />Grants.gov</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Recommendations ──────────────────────────────────────────────────────────
