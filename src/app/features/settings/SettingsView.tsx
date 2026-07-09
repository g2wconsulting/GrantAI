import { useState } from "react";
import { Briefcase, DollarSign, FileCheck, FolderOpen, Globe, Shield, Sparkles } from "lucide-react";
import { BTN_SECONDARY, CARD } from "../../styles/classNames";
import { SectionHeader } from "../../components/common/SectionHeader";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { supabase } from "../../lib/supabase";

export function SettingsView() {
  const { org, refresh } = useActiveOrg();
  const [tab, setTab] = useState("workspace");
  const [form, setForm] = useState(org);
  const [savedField, setSavedField] = useState<string | null>(null);

  if (!org) return null;
  if (!form) setForm(org);

  async function saveField(field: string, value: string) {
    await supabase.from("orgs").update({ [field]: value }).eq("id", org.id);
    await refresh();
    setSavedField(field);
    setTimeout(() => setSavedField(null), 2000);
  }

  return (
    <div className="space-y-5">
      <SectionHeader title="Settings" sub="Workspace and integrations — every field saves automatically when you click away" />
      <div className="flex items-center gap-1 bg-white border border-border rounded-xl p-1 w-fit">
        {["workspace", "integrations"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "text-slate-500 hover:text-slate-800"}`}>{t}</button>
        ))}
      </div>

      {tab === "workspace" && (
        <div className="grid grid-cols-2 gap-4">
          <div className={`${CARD} p-5`}>
            <h3 className="font-semibold text-slate-900 text-base mb-4">Organization Details</h3>
            <div className="space-y-3">
              {([
                ["name", "Organization Name"],
                ["ein", "EIN"],
                ["uei", "UEI"],
                ["city", "City, State"],
              ] as const).map(([field, label]) => (
                <div key={field}>
                  <label className="text-sm text-slate-400 uppercase tracking-wide flex items-center gap-2 mb-1">
                    {label}
                    {savedField === field && <span className="text-emerald-600 normal-case">Saved ✓</span>}
                  </label>
                  <input
                    value={(form?.[field] as string) ?? ""}
                    onChange={(e) => setForm({ ...form!, [field]: e.target.value })}
                    onBlur={(e) => saveField(field, e.target.value)}
                    className="w-full text-sm text-slate-700 border border-border rounded-lg px-3 py-2 bg-[#f5fdf8] outline-none focus:border-teal-300"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className={`${CARD} p-5`}>
            <h3 className="font-semibold text-slate-900 text-base mb-4 flex items-center gap-2">
              Mission Statement
              {savedField === "mission" && <span className="text-sm text-emerald-600 font-normal">Saved ✓</span>}
            </h3>
            <textarea
              value={form?.mission ?? ""}
              onChange={(e) => setForm({ ...form!, mission: e.target.value })}
              onBlur={(e) => saveField("mission", e.target.value)}
              className="w-full h-28 text-sm text-slate-700 bg-[#f5fdf8] border border-border rounded-xl p-3 outline-none resize-none focus:border-teal-300 leading-relaxed"
            />
            <p className="text-sm text-slate-400 mt-2">This is used to match you with relevant grants.</p>
          </div>
        </div>
      )}

      {tab === "integrations" && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Grants.gov", desc: "Live federal grant opportunities, synced from Discovery", connected: true, icon: Globe, action: "view" },
            { name: "AI Web Search", desc: "Foundation, corporate, and state/local grants found via live web search", connected: true, icon: Sparkles, action: "view" },
            { name: "SAM.gov", desc: "Federal registrations and eligibility verification", connected: false, icon: Shield, action: "soon" },
            { name: "Google Drive", desc: "Sync documents and proposals automatically", connected: false, icon: FolderOpen, action: "soon" },
            { name: "Salesforce", desc: "Sync partner contacts and grant records", connected: false, icon: Briefcase, action: "soon" },
            { name: "DocuSign", desc: "E-sign MOUs, letters of support, and agreements", connected: false, icon: FileCheck, action: "soon" },
            { name: "Quickbooks", desc: "Connect financial data for budget reporting", connected: false, icon: DollarSign, action: "soon" },
          ].map(({ name, desc, connected, icon: Icon, action }) => (
            <div key={name} className={`${CARD} p-4`}>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-[#e8faf0] rounded-lg"><Icon className="w-4 h-4 text-teal-600" /></div>
                {connected ? <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Connected</span> : <span className="text-sm text-slate-400">Coming soon</span>}
              </div>
              <p className="text-base font-semibold text-slate-800 mb-1">{name}</p>
              <p className="text-sm text-slate-400 leading-relaxed mb-3">{desc}</p>
              {action === "view" ? (
                <a href="/discovery" className={BTN_SECONDARY}>Go to Discovery</a>
              ) : (
                <button disabled className={`${BTN_SECONDARY} opacity-50 cursor-not-allowed`}>Not available yet</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
