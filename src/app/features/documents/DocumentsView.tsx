import { useState } from "react";
import { Download, FolderOpen, Plus, Search, Sparkles, Upload } from "lucide-react";
import { DOCS, FILE_ICONS, FOLDERS } from "../../data/demoData";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../../styles/classNames";
import { SectionHeader } from "../../components/common/SectionHeader";
export function DocumentsView() {
  const [category, setCategory] = useState("All Files");
  const [newFolderMode, setNewFolderMode] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [extraFolders, setExtraFolders] = useState<string[]>([]);

  const activeCategory = category === "All Files" ? "All" : category;
  const filtered = activeCategory === "All" ? DOCS : DOCS.filter(d => d.category === activeCategory);

  function createFolder() {
    if (newFolderName.trim()) {
      setExtraFolders(prev => [...prev, newFolderName.trim()]);
      setNewFolderName("");
      setNewFolderMode(false);
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader title="Document Library" sub={`${DOCS.length} files · AI-indexed and searchable`} action={
        <div className="flex gap-2">
          <button className={BTN_SECONDARY} onClick={() => setNewFolderMode(true)}><Plus className="w-3.5 h-3.5" />New Folder</button>
          <button className={BTN_PRIMARY}><Upload className="w-3.5 h-3.5" />Upload</button>
        </div>
      } />

      <div className="flex gap-4">
        {/* Folder sidebar */}
        <div className={`${CARD} p-3 w-48 shrink-0 h-fit`}>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 px-2">Folders</p>
          <div className="space-y-0.5">
            {FOLDERS.map(({ name, icon: Icon, count, color }) => (
              <button key={name} onClick={() => setCategory(name)} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${category === name ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "text-slate-700 hover:bg-[#edf9f2]"}`}>
                <Icon className={`w-3.5 h-3.5 shrink-0 ${category === name ? "text-white" : color}`} />
                <span className="flex-1 truncate">{name}</span>
                <span className={`text-sm font-semibold px-1.5 py-0.5 rounded-full ${category === name ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{count}</span>
              </button>
            ))}
            {extraFolders.map(name => (
              <button key={name} onClick={() => setCategory(name)} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${category === name ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "text-slate-700 hover:bg-[#edf9f2]"}`}>
                <FolderOpen className={`w-3.5 h-3.5 shrink-0 ${category === name ? "text-white" : "text-slate-400"}`} />
                <span className="flex-1 truncate">{name}</span>
                <span className={`text-sm font-semibold px-1.5 py-0.5 rounded-full ${category === name ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>0</span>
              </button>
            ))}
          </div>

          {newFolderMode ? (
            <div className="mt-2 px-2">
              <input
                autoFocus
                className="w-full text-sm border border-teal-300 rounded-lg px-2 py-1.5 outline-none bg-[#f5fdf8] mb-1.5"
                placeholder="Folder name..."
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") createFolder(); if (e.key === "Escape") setNewFolderMode(false); }}
              />
              <div className="flex gap-1">
                <button onClick={createFolder} className="flex-1 text-sm py-1 bg-gradient-to-br from-teal-500 to-blue-500 text-white rounded-lg font-medium">Create</button>
                <button onClick={() => setNewFolderMode(false)} className="flex-1 text-sm py-1 border border-border text-slate-500 rounded-lg">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setNewFolderMode(true)} className="w-full flex items-center gap-2 px-2.5 py-2 mt-1 rounded-lg text-sm text-slate-400 hover:text-teal-600 hover:bg-[#edf9f2] transition-colors">
              <Plus className="w-3.5 h-3.5" />New Folder
            </button>
          )}
        </div>

        {/* File grid */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-[#f0fbf5] rounded-xl px-3 py-2 border border-border">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input className="flex-1 bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none" placeholder="Search documents..." />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className={`${CARD} flex flex-col items-center justify-center py-16 text-center`}>
              <FolderOpen className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-sm font-medium text-slate-500">This folder is empty</p>
              <p className="text-sm text-slate-400 mt-1">Upload files or move documents here</p>
              <button className={`${BTN_PRIMARY} mt-4`}><Upload className="w-3.5 h-3.5" />Upload File</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((doc) => {
                const fi = FILE_ICONS[doc.type];
                return (
                  <div key={doc.name} className={`${CARD} p-4 hover:shadow-md transition-all cursor-pointer group`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${fi.bg} flex items-center justify-center shrink-0 text-sm font-bold`}>{fi.label}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-slate-800 leading-snug group-hover:text-teal-700 transition-colors truncate">{doc.name}</p>
                        <p className="text-sm text-slate-400 mt-0.5">{doc.date} · {doc.size}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.tags.map(t => <span key={t} className="text-sm bg-[#e8faf0] text-teal-700 px-1.5 py-0.5 rounded">{t}</span>)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className={`${BTN_SECONDARY} text-sm py-1`}><Download className="w-3 h-3" />Download</button>
                      <button className={`${BTN_SECONDARY} text-sm py-1`}><Sparkles className="w-3 h-3" />AI Extract</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Budget Builder ───────────────────────────────────────────────────────────
