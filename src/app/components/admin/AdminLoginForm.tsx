import { useState } from "react";
import { useAdmin } from "../../../lib/admin";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export function AdminLoginForm() {
  const { login } = useAdmin();
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function go() {
    if (!pw) { setMsg("Bitte Passwort eingeben."); return; }
    setBusy(true); setMsg("Prüfe Passwort …");
    const r = await login(pw);
    if (r === "ok") return; // AdminArea rendert danach das Dashboard
    setBusy(false);
    setMsg(
      r === "bad" ? "Falsches Passwort."
        : r === "rate" ? "Zu viele Versuche — bitte später erneut."
        : r === "unconfigured" ? "Verwaltung ist noch nicht eingerichtet."
        : "Verbindungsfehler.",
    );
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-[#E5F4F5] shadow-[0_20px_60px_rgb(191,234,242,0.3)] p-8" style={jakarta}>
        <h1 className="text-2xl font-medium text-[#111111] mb-1">Verwaltung</h1>
        <p className="text-sm text-[#5F6B73] font-light mb-6">Passwort eingeben, um Anfragen, Bewerbungen und Termine zu verwalten.</p>
        <input type="password" value={pw} autoComplete="current-password"
          onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-xl border border-[#E5F4F5] bg-[#F8FEFF] mb-3 outline-none focus:border-[#6FD3D1]" />
        <button onClick={go} disabled={busy}
          className="w-full bg-[#0F7C77] text-white hover:bg-[#0c6a66] disabled:opacity-50 py-3 rounded-full font-medium transition-colors">
          Anmelden
        </button>
        <p className="text-xs mt-3 min-h-[1.2em] text-[#5F6B73]">{msg}</p>
      </div>
    </section>
  );
}
