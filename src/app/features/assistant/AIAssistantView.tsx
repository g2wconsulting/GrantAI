import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { AI_RESPONSES, DEFAULT_AI } from "../../data/demoData";
import { useActiveOrg } from "../../hooks/useActiveOrg";
type Message = { role: "ai" | "user"; content: string };

export function AIAssistantView() {
  const { org } = useActiveOrg();
  const [messages, setMessages] = useState<Message[]>([{ role: "ai", content: `Hello! I have context on ${org?.name ?? "your organization"}. I can help you find grants, draft proposals, generate budgets, check compliance, and build strategy. What can I help you with today?` }]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const orgName = org?.name ?? "your organization";

  const suggestions = [
    "What grants should TwiddleU apply for?",
    "Which grants fit Jobvair?",
    "What reports are due this quarter?",
    "Are we missing any compliance items?",
    "Generate a 3-year budget for DOL",
    "Draft needs statement for MacArthur",
    "Find grants under $500K",
    "Which grants are most worth our time?",
  ];

  function send(text: string) {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setInput("");
    setTimeout(() => {
      const reply = AI_RESPONSES[msg] ?? DEFAULT_AI;
      setMessages(prev => [...prev, { role: "ai", content: reply }]);
    }, 600);
  }

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div className="flex flex-col gap-4" style={{ height: "calc(100vh - 132px)" }}>
      <div className="bg-gradient-to-r from-[#e2f9e8] to-[#e8f8f5] border border-teal-100 rounded-xl p-4 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-800">GrantAI Assistant</p>
          <p className="text-sm text-teal-600">Full context on {orgName} · Real-time intelligence</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /><span className="text-sm text-teal-500">Online</span></div>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-border p-5 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className={`max-w-lg rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${msg.role === "ai" ? "bg-[#f5fdf8] border border-border text-slate-700" : "bg-gradient-to-br from-teal-500 to-blue-500 text-white"}`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 shrink-0">
        {suggestions.map(s => (
          <button key={s} onClick={() => send(s)} className="px-3 py-1.5 bg-white border border-border rounded-full text-sm text-slate-600 hover:bg-[#e8faf0] hover:border-teal-200 hover:text-teal-800 transition-colors">{s}</button>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl p-3 flex items-center gap-3 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <input className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent" placeholder="Ask anything about grants, funding, proposals, budgets, compliance, or strategy..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send("")} />
        <button onClick={() => send("")} className="p-2 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg text-white hover:from-teal-600 hover:to-blue-600 transition-all">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
