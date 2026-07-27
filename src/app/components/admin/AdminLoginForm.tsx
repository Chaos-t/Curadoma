import { useState } from "react";
import { Lock } from "lucide-react";
import { useAdmin } from "../../../lib/admin";
import { Css } from "../Css";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export function AdminLoginForm() {
  const { login } = useAdmin();
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);

  async function go() {
    if (busy) return; // schützt auch den Enter-Pfad vor Mehrfach-Submit
    if (!pw) { setMsg("Bitte Passwort eingeben."); return; }
    setBusy(true); setMsg("Prüfe Passwort …");
    const r = await login(pw);
    if (r === "ok") return; // AdminArea rendert danach das Dashboard
    setBusy(false);
    setShake(true);
    window.setTimeout(() => setShake(false), 500);
    setMsg(
      r === "bad" ? "Falsches Passwort."
        : r === "rate" ? "Zu viele Versuche — bitte später erneut."
        : r === "unconfigured" ? "Verwaltung ist noch nicht eingerichtet."
        : "Verbindungsfehler.",
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
      {/* Weiche, atmende Türkis-Orbs im Hintergrund (rein dekorativ) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="cura-admin-orb cura-admin-orb-a" />
        <div className="cura-admin-orb cura-admin-orb-b" />
      </div>

      {/* Wrapper trägt die Eintritts-Animation, die Karte das Wackeln (kein Konflikt) */}
      <div className="relative w-full max-w-sm motion-safe:animate-[curaAdminIn_600ms_cubic-bezier(0.22,1,0.36,1)_both]">
        <div className={`bg-white/95 backdrop-blur rounded-3xl border border-[#E5F4F5] shadow-[0_20px_60px_rgb(191,234,242,0.35)] p-8 ${shake ? "cura-admin-shake" : ""}`} style={jakarta}>
          <div className="flex justify-center mb-5">
            <span className="cura-admin-lock inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#DFF7F8] text-[#0F7C77]">
              <Lock size={24} strokeWidth={1.5} />
            </span>
          </div>
          <h1 className="text-2xl font-medium text-[#111111] mb-1 text-center">Verwaltung</h1>
          <p className="text-sm text-[#5F6B73] font-light mb-6 text-center">Passwort eingeben, um Anfragen, Bewerbungen und Termine zu verwalten.</p>
          <input type="password" value={pw} autoComplete="current-password" aria-label="Passwort" disabled={busy}
            onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-[#E5F4F5] bg-[#F8FEFF] mb-3 outline-none focus:border-[#6FD3D1] focus:ring-2 focus:ring-[#6FD3D1]/40 transition-shadow disabled:opacity-60" />
          <button onClick={go} disabled={busy}
            className="w-full bg-[#0F7C77] text-white hover:bg-[#0c6a66] disabled:opacity-60 py-3 rounded-full font-medium transition-colors">
            {busy ? "Prüfe …" : "Anmelden"}
          </button>
          <p role="status" aria-live="polite" className="text-xs mt-3 min-h-[1.2em] text-center text-[#5F6B73]">{msg}</p>
        </div>
      </div>

      <Css>{`
        @keyframes curaAdminIn {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes curaAdminLock {
          0%   { transform: scale(0.6) rotate(-8deg); opacity: 0; }
          60%  { transform: scale(1.08) rotate(0deg); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes curaAdminFloat {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50%      { transform: translate3d(0, -18px, 0) scale(1.06); }
        }
        @keyframes curaAdminShake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-8px); }
          40%, 60% { transform: translateX(8px); }
        }
        .cura-admin-lock { animation: curaAdminLock 700ms 120ms cubic-bezier(0.22,1,0.36,1) both; }
        .cura-admin-orb  { position: absolute; border-radius: 9999px; filter: blur(60px); opacity: 0.45; }
        .cura-admin-orb-a { width: 340px; height: 340px; top: -70px; left: -50px;
          background: radial-gradient(circle, #6FD3D1, rgba(111,211,209,0) 70%);
          animation: curaAdminFloat 9s ease-in-out infinite; }
        .cura-admin-orb-b { width: 300px; height: 300px; bottom: -70px; right: -40px;
          background: radial-gradient(circle, #BFEAF2, rgba(191,234,242,0) 70%);
          animation: curaAdminFloat 11s ease-in-out infinite reverse; }
        .cura-admin-shake { animation: curaAdminShake 500ms both; }
        @media (prefers-reduced-motion: reduce) {
          .cura-admin-lock, .cura-admin-orb-a, .cura-admin-orb-b, .cura-admin-shake { animation: none !important; }
        }
      `}</Css>
    </section>
  );
}
