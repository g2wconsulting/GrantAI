import { useState } from "react";
import { Briefcase, Check, DollarSign, FileCheck, FolderOpen, Globe, Mail, MoreHorizontal, Phone, Shield, UserPlus } from "lucide-react";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../../styles/classNames";
import { SectionHeader } from "../../components/common/SectionHeader";
import { Toggle } from "../../components/common/Toggle";


export function SettingsView() {
  const [tab, setTab] = useState("workspace");
  return (
    <div className="space-y-5">
      <SectionHeader title="Settings" sub="Workspace, users, integrations, and preferences" />
      <div className="flex items-center gap-1 bg-white border border-border rounded-xl p-1 w-fit">
        {["workspace", "users", "integrations", "notifications", "ai"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "text-slate-500 hover:text-slate-800"}`}>{t}</button>
        ))}
      </div>

      {tab === "workspace" && (
        <div className="grid grid-cols-2 gap-4">
          <div className={`${CARD} p-5`}>
            <h3 className="font-semibold text-slate-900 text-base mb-4">Organization Details</h3>
            <div className="space-y-3">
              {[["Organization Name", "Horizons Community Foundation"], ["EIN", "83-4521890"], ["UEI", "HJKL9823MNP4"], ["City, State", "Chicago, IL"], ["Fiscal Year", "October 1 – September 30"]].map(([label, value]) => (
                <div key={label}>
                  <label className="text-sm text-slate-400 uppercase tracking-wide block mb-1">{label}</label>
                  <input defaultValue={value} className="w-full text-sm text-slate-700 border border-border rounded-lg px-3 py-2 bg-[#f5fdf8] outline-none focus:border-teal-300" />
                </div>
              ))}
              <button className={`${BTN_PRIMARY} mt-2`}><Check className="w-3.5 h-3.5" />Save Changes</button>
            </div>
          </div>
          <div className={`${CARD} p-5`}>
            <h3 className="font-semibold text-slate-900 text-base mb-4">Mission Statement</h3>
            <textarea className="w-full h-28 text-sm text-slate-700 bg-[#f5fdf8] border border-border rounded-xl p-3 outline-none resize-none focus:border-teal-300 leading-relaxed" defaultValue="To advance economic opportunity and community resilience through innovative workforce development, digital equity, and community development programs." />
            <div className="mt-4">
              <h3 className="font-semibold text-slate-900 text-base mb-2">Danger Zone</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-red-200 text-red-500 text-sm rounded-lg hover:bg-red-50 transition-colors">Delete Workspace</button>
            </div>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className={`${CARD} overflow-hidden`}>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-base">Team Members</h3>
            <button className={BTN_PRIMARY}><UserPlus className="w-3.5 h-3.5" />Invite User</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="bg-[#f5fdf8]">{["Name", "Email", "Role", "Status", "Last Active", ""].map(h => <th key={h} className="text-left px-4 py-2.5 font-semibold text-slate-400 uppercase tracking-wide text-sm">{h}</th>)}</tr></thead>
            <tbody>
              {[
                ["Jordan Adams", "jordan@horizons.org", "Admin", "Active", "Today"],
                ["Lisa Chen", "lisa@horizons.org", "Editor", "Active", "Yesterday"],
                ["Marcus Thompson", "marcus@horizons.org", "Admin", "Active", "Jul 5, 2026"],
                ["Sarah Kim", "sarah@horizons.org", "Viewer", "Pending", "—"],
              ].map(([name, email, role, status, last]) => (
                <tr key={email} className="border-t border-border hover:bg-[#f5fdf8]">
                  <td className="px-4 py-3 font-semibold text-slate-800">{name}</td>
                  <td className="px-4 py-3 text-slate-500">{email}</td>
                  <td className="px-4 py-3"><span className={`text-sm font-medium px-2 py-0.5 rounded-full ${role === "Admin" ? "bg-[#e8faf0] text-teal-700" : role === "Editor" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`}>{role}</span></td>
                  <td className="px-4 py-3"><span className={`text-sm font-medium px-2 py-0.5 rounded-full ${status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{status}</span></td>
                  <td className="px-4 py-3 text-slate-400">{last}</td>
                  <td className="px-4 py-3"><button className="text-slate-300 hover:text-slate-500"><MoreHorizontal className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "integrations" && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Grants.gov", desc: "Live federal grant opportunities, synced from Discovery", connected: true, icon: Globe, action: "view" },
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

      {tab === "notifications" && (
        <div className="grid grid-cols-2 gap-4">
          {[["Grant Deadlines", "Receive alerts 30, 14, and 7 days before deadlines"], ["New AI Matches", "Notify when AI finds a grant matching your profile"], ["Report Due Reminders", "Alerts for quarterly and annual reporting deadlines"], ["Award Notifications", "Confirmation when grant decisions are received"], ["Partner Activity", "Updates when partners interact with shared applications"], ["Budget Variances", "Alert when spending deviates more than 10% from plan"]].map(([title, desc]) => (
            <div key={title} className={`${CARD} p-4 flex items-start gap-4`}>
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-800">{title}</p>
                <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <div className="flex items-center gap-2"><Mail className="w-3 h-3 text-slate-400" /><Toggle on={true} /></div>
                <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-slate-400" /><Toggle on={false} /></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "ai" && (
        <div className="grid grid-cols-2 gap-4">
          <div className={`${CARD} p-5`}>
            <h3 className="font-semibold text-slate-900 text-base mb-4">AI Configuration</h3>
            <div className="space-y-4">
              {[["Auto-Match New Grants", "AI searches for new grants daily and adds matches", true], ["Smart Proposal Drafts", "AI pre-populates proposals using your org profile", true], ["Compliance Monitoring", "AI flags missing documents and compliance issues", true], ["Partner Suggestions", "AI recommends partnerships based on grant requirements", false]].map(([label, desc, on]) => (
                <div key={label as string} className="flex items-start justify-between gap-4">
                  <div><p className="text-base font-semibold text-slate-800">{label}</p><p className="text-sm text-slate-400 mt-0.5">{desc}</p></div>
                  <Toggle on={on as boolean} />
                </div>
              ))}
            </div>
          </div>
          <div className={`${CARD} p-5`}>
            <h3 className="font-semibold text-slate-900 text-base mb-4">Search Preferences</h3>
            <div className="space-y-3">
              <div><label className="text-sm text-slate-400 uppercase tracking-wide block mb-1">Search Frequency</label>
                <select className="w-full text-sm text-slate-700 border border-border rounded-lg px-3 py-2 bg-[#f5fdf8] outline-none hover:border-teal-300"><option>Daily</option><option>Weekly</option><option>Real-time</option></select>
              </div>
              <div><label className="text-sm text-slate-400 uppercase tracking-wide block mb-1">Minimum Match Score</label>
                <select className="w-full text-sm text-slate-700 border border-border rounded-lg px-3 py-2 bg-[#f5fdf8] outline-none hover:border-teal-300"><option>70% and above</option><option>80% and above</option><option>90% and above</option></select>
              </div>
              <div><label className="text-sm text-slate-400 uppercase tracking-wide block mb-1">Grant Amount Range</label>
                <div className="flex gap-2">
                  <input defaultValue="$50,000" className="flex-1 text-sm text-slate-700 border border-border rounded-lg px-3 py-2 bg-[#f5fdf8] outline-none focus:border-teal-300" />
                  <input defaultValue="$2,000,000" className="flex-1 text-sm text-slate-700 border border-border rounded-lg px-3 py-2 bg-[#f5fdf8] outline-none focus:border-teal-300" />
                </div>
              </div>
              <button className={`${BTN_PRIMARY} mt-2`}><Check className="w-3.5 h-3.5" />Save AI Settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI Assistant ─────────────────────────────────────────────────────────────
