import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { useAuth } from "../../context/AuthContext";
import { BTN_PRIMARY } from "../../styles/classNames";
import { FOCUS_OPTIONS } from "../../lib/constants";

export function OnboardingView() {
  const { createOrg } = useActiveOrg();
  const { user, signOut } = useAuth();
  const [name, setName] = useState("");
  const [type, setType] = useState("Community Nonprofit");
  const [city, setCity] = useState("");
  const [mission, setMission] = useState("");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [budgetSize, setBudgetSize] = useState("Under $500K");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleFocus(f: string) {
    setFocusAreas((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    const result = await createOrg({
      name,
      type,
      city,
      mission,
      focus_areas: focusAreas,
      budget_size: budgetSize,
    });
    setLoading(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0fdf5] px-4 py-10">
      <div className="w-full max-w-lg bg-white border border-border rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-slate-800 font-bold text-base leading-none">GrantAI</p>
            <p className="text-slate-500 text-sm mt-0.5">Set up your organization</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">{user?.email}</p>
            <button type="button" onClick={() => signOut()} className="text-sm text-teal-600 hover:underline">
              Sign out
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-5">
          This information is used to find and score grants that actually fit your mission — the more detail, the better the matches.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600">Organization name *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-200" placeholder="Horizons Community Foundation" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-600">Organization type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-200">
                {["Community Nonprofit", "EdTech Nonprofit", "Workforce Nonprofit", "Health Nonprofit", "Environmental Nonprofit", "Arts Nonprofit", "For-Profit Business / Startup", "Other"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">City, State</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-200" placeholder="Chicago, IL" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">Mission statement</label>
            <textarea value={mission} onChange={(e) => setMission(e.target.value)} rows={3} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-200" placeholder="What does your organization do, and who does it serve?" />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">Focus areas (pick all that apply)</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {FOCUS_OPTIONS.map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => toggleFocus(f)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${focusAreas.includes(f) ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white border-transparent" : "bg-white border-border text-slate-600 hover:border-teal-200"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">Annual budget size</label>
            <select value={budgetSize} onChange={(e) => setBudgetSize(e.target.value)} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-200">
              {["Under $500K", "$500K–$1M", "$1M–$5M", "$5M–$20M", "Over $20M"].map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className={`${BTN_PRIMARY} w-full justify-center mt-2`}>
            {loading ? "Creating…" : "Create Organization"}
          </button>
        </form>
      </div>
    </div>
  );
}
