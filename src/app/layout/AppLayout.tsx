import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { Bell, Check, ChevronDown, LogOut, Plus, Search, Sparkles, X } from "lucide-react";
import { NAV_ITEMS, getViewLabel } from "../config/navigation";
import { useActiveOrg } from "../hooks/useActiveOrg";
import { useAuth } from "../context/AuthContext";
import { addManualGrant } from "../lib/dataService";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../styles/classNames";

export function AppLayout() {
  const [orgOpen, setOrgOpen] = useState(false);
  const [showNewGrant, setShowNewGrant] = useState(false);
  const [grantForm, setGrantForm] = useState({ title: "", funder: "", deadline: "", amountFloor: "", amountCeiling: "" });
  const [savingGrant, setSavingGrant] = useState(false);
  const { orgs, activeOrgId, setActiveOrgId, org } = useActiveOrg();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const title = getViewLabel(location.pathname);

  if (!org) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f0fdf5]">
        <p className="text-slate-500">Loading your organization…</p>
      </div>
    );
  }

  async function submitNewGrant() {
    if (!org || !grantForm.title.trim()) return;
    setSavingGrant(true);
    await addManualGrant(org.id, {
      title: grantForm.title,
      funder: grantForm.funder,
      deadline: grantForm.deadline || null,
      amountFloor: grantForm.amountFloor ? Number(grantForm.amountFloor) : null,
      amountCeiling: grantForm.amountCeiling ? Number(grantForm.amountCeiling) : null,
    });
    setSavingGrant(false);
    setShowNewGrant(false);
    setGrantForm({ title: "", funder: "", deadline: "", amountFloor: "", amountCeiling: "" });
    navigate("/pipeline");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0fdf5]" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>

      {/* Sidebar */}
      <aside className="w-56 bg-[#c8edd4] flex flex-col shrink-0">
        <div className="px-4 pt-5 pb-4 border-b border-black/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shadow-md shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-slate-800 font-bold text-base leading-none tracking-tight">GrantAI</p>
              <p className="text-slate-600 text-sm mt-0.5 tracking-wide uppercase">For Nonprofits</p>
            </div>
          </div>
        </div>

        <div className="px-3 py-2.5 border-b border-black/10 relative">
          <button onClick={() => setOrgOpen(!orgOpen)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/5 cursor-pointer transition-colors">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">{org.short}</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-slate-800 text-sm font-medium truncate">{org.name}</p>
              <p className="text-slate-600 text-sm">{org.city}</p>
            </div>
            <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform ${orgOpen ? "rotate-180" : ""}`} />
          </button>
          {orgOpen && (
            <div className="absolute left-3 right-3 top-full mt-1 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden">
              {orgs.map((o) => (
                <button key={o.id} onClick={() => { setActiveOrgId(o.id); setOrgOpen(false); }} className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[#f5fdf8] transition-colors ${activeOrgId === o.id ? "bg-[#e8faf0]" : ""}`}>
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold">{o.short}</span>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-800">{o.name}</p>
                    <p className="text-sm text-slate-400">{o.city}</p>
                  </div>
                  {activeOrgId === o.id && <Check className="w-3 h-3 text-teal-600 ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, path, icon: Icon, badge, pulse }) => (
            <NavLink
              key={id}
              to={path}
              end={path === "/"}
              className={({ isActive }) => `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white shadow-sm" : "text-slate-800 hover:text-slate-950 hover:bg-black/5"}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
              {badge && <span className="ml-auto bg-teal-100 text-teal-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
              {pulse && <span className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-black/10">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-black/5 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">{user?.email?.slice(0, 2).toUpperCase() ?? "U"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-800 text-sm font-medium truncate">{user?.email}</p>
              <p className="text-slate-600 text-sm">Member</p>
            </div>
            <button onClick={() => signOut()} title="Sign out" className="p-1.5 rounded-md hover:bg-black/10 shrink-0">
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-border flex items-center px-6 gap-4 shrink-0">
          <h1 className="font-semibold text-slate-900 text-lg">{title}</h1>
          <div className="flex-1 max-w-xs mx-4">
            <div className="flex items-center gap-2 bg-[#f0fbf5] rounded-lg px-3 py-1.5 border border-border">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input className="flex-1 bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none" placeholder="Search grants, proposals, partners..." />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#e8faf0] border border-teal-100 rounded-lg">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-teal-700">{org.name}</span>
            </div>
            <button className="relative p-2 hover:bg-[#edf9f2] rounded-lg transition-colors">
              <Bell className="w-4 h-4 text-slate-400" />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full" />
            </button>
            <button className={BTN_PRIMARY} onClick={() => setShowNewGrant(true)}><Plus className="w-3.5 h-3.5" />New Grant</button>
          </div>
        </header>

        {showNewGrant && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowNewGrant(false)}>
            <div className={`${CARD} p-5 w-full max-w-md`} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 text-base">Add a Grant</h3>
                <button onClick={() => setShowNewGrant(false)} className="text-slate-300 hover:text-slate-500"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-sm text-slate-400 mb-4">Already know about a grant? Add it directly — it'll appear in your Pipeline with a draft proposal and budget ready to go.</p>
              <div className="space-y-3">
                <input placeholder="Grant title *" value={grantForm.title} onChange={(e) => setGrantForm({ ...grantForm, title: e.target.value })} className="w-full text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" />
                <input placeholder="Funder" value={grantForm.funder} onChange={(e) => setGrantForm({ ...grantForm, funder: e.target.value })} className="w-full text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" />
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Deadline</label>
                  <input type="date" value={grantForm.deadline} onChange={(e) => setGrantForm({ ...grantForm, deadline: e.target.value })} className="w-full text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Min amount" type="number" value={grantForm.amountFloor} onChange={(e) => setGrantForm({ ...grantForm, amountFloor: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" />
                  <input placeholder="Max amount" type="number" value={grantForm.amountCeiling} onChange={(e) => setGrantForm({ ...grantForm, amountCeiling: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={submitNewGrant} disabled={savingGrant || !grantForm.title.trim()} className={`${BTN_PRIMARY} flex-1 justify-center`}>{savingGrant ? "Adding…" : "Add Grant"}</button>
                <button onClick={() => setShowNewGrant(false)} className={BTN_SECONDARY}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6" onClick={() => orgOpen && setOrgOpen(false)}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
