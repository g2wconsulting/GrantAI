import { useState } from "react";

export function Toggle({ on }: { on?: boolean }) {
  const [active, setActive] = useState(on ?? false);
  return (
    <button onClick={() => setActive(!active)} className={`w-9 h-5 rounded-full transition-colors ${active ? "bg-gradient-to-r from-teal-500 to-blue-500" : "bg-slate-200"}`}>
      <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform mx-0.5 ${active ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}
