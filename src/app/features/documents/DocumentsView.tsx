import { useCallback, useEffect, useRef, useState } from "react";
import { Download, FolderOpen, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from "../../styles/classNames";
import { SectionHeader } from "../../components/common/SectionHeader";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { supabase } from "../../lib/supabase";

const CATEGORIES = ["Compliance", "Financial", "Proposals", "Board", "Other"];

type Doc = {
  id: string;
  name: string;
  category: string | null;
  tags: string[];
  created_at: string;
  storage_path: string | null;
  file_type: string | null;
  size_bytes: number | null;
};

function formatBytes(bytes: number | null) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsView() {
  const { org } = useActiveOrg();
  const [category, setCategory] = useState("All Files");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Compliance", tags: "" });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!org) return;
    setLoading(true);
    const { data } = await supabase.from("documents").select("*").eq("org_id", org.id).order("created_at", { ascending: false });
    setDocs((data as Doc[]) ?? []);
    setLoading(false);
  }, [org]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = docs
    .filter((d) => category === "All Files" || d.category === category)
    .filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase()));

  const counts = CATEGORIES.reduce<Record<string, number>>((acc, c) => {
    acc[c] = docs.filter((d) => d.category === c).length;
    return acc;
  }, {});

  async function addDoc() {
    if (!org || !file) return;
    setUploading(true);
    setError(null);
    const path = `${org.id}/documents/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("org-files").upload(path, file);
    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }
    const { error: insertError } = await supabase.from("documents").insert({
      org_id: org.id,
      name: form.name.trim() || file.name,
      category: form.category,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      storage_path: path,
      file_type: file.type || null,
      size_bytes: file.size,
    });
    setUploading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setForm({ name: "", category: "Compliance", tags: "" });
    setFile(null);
    setShowAdd(false);
    await load();
  }

  async function downloadDoc(doc: Doc) {
    if (!doc.storage_path) return;
    const { data, error: signError } = await supabase.storage.from("org-files").createSignedUrl(doc.storage_path, 60);
    if (signError || !data?.signedUrl) {
      setError(signError?.message ?? "Could not generate a download link");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  async function deleteDoc(doc: Doc) {
    if (doc.storage_path) await supabase.storage.from("org-files").remove([doc.storage_path]);
    await supabase.from("documents").delete().eq("id", doc.id);
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
  }

  return (
    <div className="space-y-4">
      <SectionHeader title="Document Library" sub={`${docs.length} file${docs.length === 1 ? "" : "s"} tracked`} action={
        <button className={BTN_PRIMARY} onClick={() => setShowAdd(true)}><Plus className="w-3.5 h-3.5" />Add Document</button>
      } />

      {showAdd && (
        <div className={`${CARD} p-4`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">Upload a Document</h3>
            <button onClick={() => { setShowAdd(false); setFile(null); }} className="text-slate-300 hover:text-slate-500"><X className="w-4 h-4" /></button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
              if (f && !form.name.trim()) setForm((prev) => ({ ...prev, name: f.name }));
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-lg py-6 flex flex-col items-center gap-1.5 transition-colors ${file ? "border-teal-300 bg-[#f0fbf5]" : "border-border hover:border-teal-200"}`}
          >
            <Upload className="w-5 h-5 text-teal-500" />
            <span className="text-sm font-medium text-slate-700">{file ? file.name : "Click to choose a file"}</span>
            {file && <span className="text-sm text-slate-400">{formatBytes(file.size)}</span>}
          </button>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <input placeholder="Document name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300 col-span-2" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-teal-300 col-span-3" />
          </div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          <button className={`${BTN_PRIMARY} mt-3`} onClick={addDoc} disabled={!file || uploading}>
            <Plus className="w-3.5 h-3.5" />{uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      )}

      <div className="flex gap-4">
        <div className={`${CARD} p-3 w-48 shrink-0 h-fit`}>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 px-2">Folders</p>
          <div className="space-y-0.5">
            <button onClick={() => setCategory("All Files")} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${category === "All Files" ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "text-slate-700 hover:bg-[#edf9f2]"}`}>
              <FolderOpen className="w-3.5 h-3.5 shrink-0" /><span className="flex-1">All Files</span>
              <span className={`text-sm font-semibold px-1.5 py-0.5 rounded-full ${category === "All Files" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{docs.length}</span>
            </button>
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${category === c ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white" : "text-slate-700 hover:bg-[#edf9f2]"}`}>
                <FolderOpen className="w-3.5 h-3.5 shrink-0" /><span className="flex-1 truncate">{c}</span>
                <span className={`text-sm font-semibold px-1.5 py-0.5 rounded-full ${category === c ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{counts[c] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-[#f0fbf5] rounded-xl px-3 py-2 border border-border">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none" placeholder="Search documents..." />
            </div>
          </div>

          {loading && <p className="text-sm text-slate-400 px-1">Loading…</p>}

          {!loading && filtered.length === 0 ? (
            <div className={`${CARD} flex flex-col items-center justify-center py-16 text-center`}>
              <FolderOpen className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-sm font-medium text-slate-500">{docs.length === 0 ? "No documents yet" : "This folder is empty"}</p>
              <p className="text-sm text-slate-400 mt-1">Add a document to start tracking your files here.</p>
              <button onClick={() => setShowAdd(true)} className={`${BTN_PRIMARY} mt-4`}><Plus className="w-3.5 h-3.5" />Add Document</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((doc) => (
                <div key={doc.id} className={`${CARD} p-4 hover:shadow-md transition-all group`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#e8faf0] flex items-center justify-center shrink-0 text-sm font-bold text-teal-700">{doc.category?.slice(0, 2).toUpperCase() ?? "DO"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-slate-800 leading-snug truncate">{doc.name}</p>
                      <p className="text-sm text-slate-400 mt-0.5">
                        {new Date(doc.created_at).toLocaleDateString()}
                        {doc.size_bytes ? ` · ${formatBytes(doc.size_bytes)}` : ""}
                      </p>
                      {doc.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.tags.map((t) => <span key={t} className="text-sm bg-[#e8faf0] text-teal-700 px-1.5 py-0.5 rounded">{t}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                    {doc.storage_path && (
                      <button onClick={() => downloadDoc(doc)} className={`${BTN_SECONDARY} text-sm py-1`}><Download className="w-3 h-3" />Download</button>
                    )}
                    <button onClick={() => deleteDoc(doc)} className={`${BTN_SECONDARY} text-sm py-1`}><Trash2 className="w-3 h-3" />Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
