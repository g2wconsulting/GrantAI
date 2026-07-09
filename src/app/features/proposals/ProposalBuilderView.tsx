import { useCallback, useEffect, useRef, useState } from "react";
import { Check, CheckCircle2, Download, Folder, Plus, Sparkles, Trash2, Upload, X } from "lucide-react";
import { PROPOSAL_SECTIONS } from "../../data/demoData";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../../styles/classNames";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { fetchProposals } from "../../lib/dataService";
import { supabase } from "../../lib/supabase";

type ProposalRow = {
  id: string;
  title: string;
  status: string;
  content: Record<string, string>;
  org_opportunity: { opportunity: { title: string } } | null;
};

type FileItem = { name: string; id: string | null };

export function ProposalBuilderView() {
  const { org } = useActiveOrg();
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("exec");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState("");
  const [newFolderMode, setNewFolderMode] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!org) return;
    setLoading(true);
    const { data } = await fetchProposals(org.id);
    const list = data as unknown as ProposalRow[];
    setProposals(list);
    setSelectedId((current) => current ?? list[0]?.id ?? null);
    setLoading(false);
  }, [org]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = proposals.find((p) => p.id === selectedId) ?? null;

  const storagePrefix = org && selected ? `${org.id}/proposals/${selected.id}/${currentFolder ? currentFolder + "/" : ""}` : null;

  const loadFiles = useCallback(async () => {
    if (!storagePrefix) return;
    const { data } = await supabase.storage.from("org-files").list(storagePrefix, { limit: 100 });
    setFiles((data ?? []).filter((f) => f.name !== ".keep").map((f) => ({ name: f.name, id: f.id })));
  }, [storagePrefix]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  async function uploadFile(file: File) {
    if (!storagePrefix) return;
    setUploading(true);
    await supabase.storage.from("org-files").upload(`${storagePrefix}${file.name}`, file, { upsert: true });
    setUploading(false);
    await loadFiles();
  }

  async function createFolder() {
    if (!storagePrefix || !newFolderName.trim()) return;
    const placeholder = new Blob([""]);
    await supabase.storage.from("org-files").upload(`${storagePrefix}${newFolderName.trim()}/.keep`, placeholder);
    setNewFolderName("");
    setNewFolderMode(false);
    await loadFiles();
  }

  async function downloadFile(name: string) {
    if (!storagePrefix) return;
    const { data } = await supabase.storage.from("org-files").createSignedUrl(`${storagePrefix}${name}`, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  async function deleteFile(name: string, isFolder: boolean) {
    if (!storagePrefix) return;
    const path = isFolder ? `${storagePrefix}${name}/.keep` : `${storagePrefix}${name}`;
    await supabase.storage.from("org-files").remove([path]);
    await loadFiles();
  }

  useEffect(() => {
    setDraft(selected?.content?.[activeSection] ?? "");
  }, [selected, activeSection]);

  useEffect(() => {
    setCurrentFolder("");
  }, [selectedId]);

  async function saveDraft() {
    if (!selected) return;
    setSaving(true);
    const nextContent = { ...(selected.content ?? {}), [activeSection]: draft };
    await supabase.from("proposals").update({ content: nextContent, updated_at: new Date().toISOString() }).eq("id", selected.id);
    setProposals((prev) => prev.map((p) => (p.id === selected.id ? { ...p, content: nextContent } : p)));
    setSaving(false);
  }

  async function markComplete() {
    if (!selected) return;
    await supabase.from("proposals").update({ status: "submitted" }).eq("id", selected.id);
    await load();
  }

  const sectionsWithContent = PROPOSAL_SECTIONS.map((s) => ({
    ...s,
    status: selected?.content?.[s.id] ? "complete" : "not-started",
  }));
  const completed = sectionsWithContent.filter((s) => s.status === "complete").length;
  const pct = Math.round((completed / sectionsWithContent.length) * 100);
  const current = sectionsWithContent.find((s) => s.id === activeSection)!;

  if (loading) return <p className="text-sm text-slate-400 px-1">Loading proposals…</p>;

  if (proposals.length === 0) {
    return (
      <div className={`${CARD} p-8 text-center`}>
        <p className="text-slate-600 font-medium">No proposals yet</p>
        <p className="text-sm text-slate-400 mt-1">Proposals are created automatically when you add a grant to your pipeline from Discovery.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`${CARD} p-4`}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm text-slate-400 uppercase tracking-wide block mb-1">Proposal</label>
            <select value={selectedId ?? ""} onChange={(e) => setSelectedId(e.target.value)} className="text-sm font-medium text-slate-800 border border-border rounded-lg px-3 py-2 bg-white outline-none w-full max-w-sm hover:border-teal-300">
              {proposals.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400 mb-1">Completion</p>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full" style={{ width: `${pct}%` }} /></div>
              <span className="text-sm font-bold text-slate-700">{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className={`${CARD} p-3 w-52 shrink-0`}>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 px-2">Sections</p>
          <div className="space-y-0.5">
            {sectionsWithContent.map((sec) => (
              <button key={sec.id} onClick={() => setActiveSection(sec.id)} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${activeSection === sec.id ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "text-slate-600 hover:bg-[#edf9f2]"}`}>
                {sec.status === "complete" ? <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${activeSection === sec.id ? "text-white" : "text-emerald-500"}`} /> : <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${activeSection === sec.id ? "border-white/50" : "border-slate-200"}`} />}
                <span className="truncate">{sec.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className={`${CARD} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">{current.label}</h3>
              <span className="text-sm text-slate-400">{draft.split(/\s+/).filter(Boolean).length} words</span>
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={saveDraft}
              className="w-full h-72 text-sm text-slate-700 bg-[#f5fdf8] border border-border rounded-xl p-4 outline-none resize-none leading-relaxed placeholder:text-slate-300 focus:border-teal-300"
              placeholder={`Start writing your ${current.label.toLowerCase()} here...`}
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-slate-400">{saving ? "Saving…" : "Autosaves when you click away"}</p>
              <div className="flex gap-2">
                <button className={BTN_SECONDARY} onClick={saveDraft}><Sparkles className="w-3.5 h-3.5" />Save</button>
                <button className={BTN_PRIMARY} onClick={markComplete}><Check className="w-3.5 h-3.5" />Mark Submitted</button>
              </div>
            </div>
          </div>

          <div className={`${CARD} p-5 mt-4`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">Files</h3>
                {currentFolder && (
                  <button onClick={() => setCurrentFolder("")} className="text-sm text-teal-600 hover:underline">← Back to root</button>
                )}
              </div>
              <div className="flex gap-2">
                <button className={BTN_SECONDARY} onClick={() => setNewFolderMode(true)}><Plus className="w-3.5 h-3.5" />New Folder</button>
                <button className={BTN_PRIMARY} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <Upload className="w-3.5 h-3.5" />{uploading ? "Uploading…" : "Upload"}
                </button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} />
              </div>
            </div>

            {newFolderMode && (
              <div className="flex gap-2 mb-3">
                <input autoFocus value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createFolder()} placeholder="Folder name..." className="flex-1 text-sm border border-teal-300 rounded-lg px-3 py-1.5 outline-none bg-[#f5fdf8]" />
                <button onClick={createFolder} className={`${BTN_PRIMARY} text-sm`}>Create</button>
                <button onClick={() => setNewFolderMode(false)} className={`${BTN_SECONDARY} text-sm`}>Cancel</button>
              </div>
            )}

            {files.length === 0 ? (
              <p className="text-sm text-slate-400">No files yet — upload documents or create folders to organize this proposal's materials.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {files.map((f) => {
                  const isFolder = f.id === null;
                  return (
                    <div key={f.name} className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:bg-[#f5fdf8] transition-colors group">
                      {isFolder ? (
                        <button onClick={() => setCurrentFolder(currentFolder ? `${currentFolder}/${f.name}` : f.name)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                          <Folder className="w-4 h-4 text-teal-500 shrink-0" />
                          <span className="text-sm text-slate-700 truncate">{f.name}</span>
                        </button>
                      ) : (
                        <button onClick={() => downloadFile(f.name)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                          <Download className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="text-sm text-slate-700 truncate">{f.name}</span>
                        </button>
                      )}
                      <button onClick={() => deleteFile(f.name, isFolder)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
