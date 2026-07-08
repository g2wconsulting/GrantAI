import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { BTN_PRIMARY } from "../../styles/classNames";

export function LoginView() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const result = mode === "signin" ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else if (mode === "signup") {
      setInfo("Account created! If email confirmation is required, check your inbox. Otherwise you're signed in.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0fdf5] px-4">
      <div className="w-full max-w-sm bg-white border border-border rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-slate-800 font-bold text-base leading-none">GrantAI</p>
            <p className="text-slate-500 text-sm mt-0.5">AI OS for Nonprofits</p>
          </div>
        </div>

        <h1 className="text-lg font-semibold text-slate-900 mb-1">
          {mode === "signin" ? "Sign in to your account" : "Create your account"}
        </h1>
        <p className="text-sm text-slate-500 mb-5">
          {mode === "signin" ? "Welcome back." : "Start finding grants that fit your mission."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-200"
              placeholder="you@organization.org"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-200"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-emerald-600">{info}</p>}

          <button type="submit" disabled={loading} className={`${BTN_PRIMARY} w-full justify-center mt-2`}>
            {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-4 text-center">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="text-teal-600 font-medium hover:underline"
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setInfo(null); }}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
