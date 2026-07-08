import { useState } from "react";
import { Check, CheckCircle2, Download, FileCheck, Shield, Sparkles, Zap } from "lucide-react";
import { PROPOSAL_SECTIONS, SECTION_CONTENT } from "../../data/demoData";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../../styles/classNames";
export function ProposalBuilderView() {
  const [activeSection, setActiveSection] = useState("exec");
  const [selectedGrant, setSelectedGrant] = useState("DOL WIOA Workforce Grant — $750,000");
  const current = PROPOSAL_SECTIONS.find(s => s.id === activeSection)!;
  const completed = PROPOSAL_SECTIONS.filter(s => s.status === "complete").length;
  const pct = Math.round((completed / PROPOSAL_SECTIONS.length) * 100);

  return (
    <div className="space-y-4">
      <div className={`${CARD} p-4`}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm text-slate-400 uppercase tracking-wide block mb-1">Grant</label>
            <select value={selectedGrant} onChange={e => setSelectedGrant(e.target.value)} className="text-sm font-medium text-slate-800 border border-border rounded-lg px-3 py-2 bg-white outline-none w-full max-w-sm hover:border-teal-300">
              <option>DOL WIOA Workforce Grant — $750,000</option>
              <option>MacArthur Technology & Society — $500,000</option>
              <option>NSF Convergence Accelerator — $1,000,000</option>
            </select>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400 mb-1">Completion</p>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full" style={{ width: `${pct}%` }} /></div>
              <span className="text-sm font-bold text-slate-700">{pct}%</span>
            </div>
          </div>
          <button className={BTN_PRIMARY}><Sparkles className="w-3.5 h-3.5" />AI Complete All</button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className={`${CARD} p-3 w-52 shrink-0`}>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 px-2">Sections</p>
          <div className="space-y-0.5">
            {PROPOSAL_SECTIONS.map((sec) => (
              <button key={sec.id} onClick={() => setActiveSection(sec.id)} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${activeSection === sec.id ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "text-slate-600 hover:bg-[#edf9f2]"}`}>
                {sec.status === "complete" ? <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${activeSection === sec.id ? "text-white" : "text-emerald-500"}`} /> : sec.status === "in-progress" ? <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${activeSection === sec.id ? "border-white" : "border-amber-400"}`} /> : <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${activeSection === sec.id ? "border-white/50" : "border-slate-200"}`} />}
                <span className="truncate">{sec.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex gap-4">
          <div className={`${CARD} p-5 flex-1`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">{current.label}</h3>
                {current.words > 0 && <span className="text-sm text-slate-400">{current.words} words</span>}
              </div>
              <div className="flex items-center gap-2">
                <button className={BTN_PRIMARY}><Sparkles className="w-3.5 h-3.5" />Draft with AI</button>
                <button className={BTN_SECONDARY}><Zap className="w-3.5 h-3.5" />Improve</button>
                <button className={BTN_SECONDARY}><FileCheck className="w-3.5 h-3.5" />Check Rubric</button>
              </div>
            </div>
            <textarea
              className="w-full h-72 text-sm text-slate-700 bg-[#f5fdf8] border border-border rounded-xl p-4 outline-none resize-none leading-relaxed placeholder:text-slate-300 focus:border-teal-300"
              defaultValue={SECTION_CONTENT[activeSection] ?? ""}
              placeholder={`Start writing your ${current.label.toLowerCase()} here, or click "Draft with AI" to generate a complete section based on your organization profile and grant requirements...`}
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-slate-400">Autosaved · Last edited 4 min ago</p>
              <div className="flex gap-2">
                <button className={BTN_SECONDARY}><Download className="w-3.5 h-3.5" />Export Word</button>
                <button className={BTN_PRIMARY}><Check className="w-3.5 h-3.5" />Mark Complete</button>
              </div>
            </div>
          </div>

          <div className="w-56 space-y-3 shrink-0">
            <div className={`${CARD} p-4`}>
              <div className="flex items-center gap-1.5 mb-3"><Sparkles className="w-3.5 h-3.5 text-teal-600" /><p className="text-base font-semibold text-slate-800">AI Suggestions</p></div>
              <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                <p className="p-2 bg-[#f5fdf8] rounded-lg">Mention your 68% placement rate early — it exceeds the national average.</p>
                <p className="p-2 bg-[#f5fdf8] rounded-lg">Include Cook County unemployment data from BLS 2025 report.</p>
                <p className="p-2 bg-[#f5fdf8] rounded-lg">Add Howard University as a training partner to strengthen the application.</p>
              </div>
            </div>
            <div className={`${CARD} p-4`}>
              <div className="flex items-center gap-1.5 mb-3"><Shield className="w-3.5 h-3.5 text-blue-500" /><p className="text-base font-semibold text-slate-800">Scoring Rubric</p></div>
              <div className="space-y-2">
                {[["Statement of Need", "20pts"], ["Project Design", "30pts"], ["Evaluation", "20pts"], ["Budget", "15pts"], ["Org Capacity", "15pts"]].map(([label, pts]) => (
                  <div key={label} className="flex justify-between text-sm"><span className="text-slate-500">{label}</span><span className="font-semibold text-slate-700">{pts}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Org Profile ──────────────────────────────────────────────────────────────
