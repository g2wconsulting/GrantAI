import { ExternalLink, Sparkles, TrendingUp } from "lucide-react";
import { opportunities } from "../../data/demoData";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../../styles/classNames";
import { MatchScore } from "../../components/common/MatchScore";
import { TagBadge } from "../../components/common/TagBadge";
export function RecommendationsView() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-[#e2f9e8] via-[#edfaf5] to-[#e2f9e8] border border-teal-100 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm"><Sparkles className="w-5 h-5 text-teal-600" /></div>
          <div>
            <h2 className="font-semibold text-slate-800">AI Strategic Recommendations</h2>
            <p className="text-sm text-teal-600 mt-0.5">Personalized for Horizons Community Foundation · Updated 2 hours ago</p>
            <div className="flex items-center gap-4 mt-3">
              {[["47", "Matches Found"], ["$2.4M", "Est. Available"], ["91", "Avg AI Score"]].map(([val, lbl], i) => (
                <div key={i} className="flex items-center gap-3">
                  {i > 0 && <div className="w-px h-8 bg-teal-100" />}
                  <div className="text-center"><p className="text-xl font-bold text-slate-800">{val}</p><p className="text-sm text-teal-500">{lbl}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {opportunities.map((opp) => (
        <div key={opp.id} className={`${CARD} p-5 hover:shadow-sm transition-shadow`}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0 text-white font-bold">{opp.match}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900 text-base">{opp.title}</h3>
                    {opp.recommended && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#e8faf0] text-teal-800 rounded text-sm font-semibold border border-teal-100"><Sparkles className="w-2.5 h-2.5" />Recommended</span>}
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">{opp.funder} · {opp.amount}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0"><TagBadge tag={opp.tag} /><p className="text-sm text-slate-400">Due {opp.deadline}</p></div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 p-3 bg-[#f5fdf8] rounded-lg">
                <div><p className="text-sm text-slate-400 mb-0.5">AI Match</p><MatchScore score={opp.match} /></div>
                <div><p className="text-sm text-slate-400 mb-1">Win Probability</p><p className="text-sm font-bold text-emerald-600">{opp.winProb}</p></div>
                <div><p className="text-sm text-slate-400 mb-1">Difficulty</p><p className={`text-sm font-bold ${opp.difficulty === "High" ? "text-rose-500" : "text-amber-500"}`}>{opp.difficulty}</p></div>
              </div>
              <div className="mt-3 flex items-start gap-2"><TrendingUp className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" /><p className="text-sm text-slate-600 leading-relaxed">{opp.insight}</p></div>
            </div>
          </div>
          <div className="flex gap-2 mt-4 pt-3 border-t border-border">
            <button className={BTN_PRIMARY}>Start Proposal</button>
            <button className={BTN_SECONDARY}>Add to Pipeline</button>
            <button className={`${BTN_SECONDARY} ml-auto`}><ExternalLink className="w-3 h-3" />View NOFO</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────
