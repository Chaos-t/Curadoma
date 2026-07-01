import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useContent } from "../../lib/content";
import { FN_BASE, FN_ANON } from "../../lib/booking";

export function AdminLoginPage() {
  const { enterEditMode } = useContent();
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex,nofollow";
    document.head.appendChild(m);
    return () => { document.head.removeChild(m); };
  }, []);

  async function go() {
    if (!pw) { setMsg("Bitte Passwort eingeben."); return; }
    setBusy(true); setMsg("Prüfe Passwort …");
    try {
      const r = await fetch(`${FN_BASE}/site-content/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${FN_ANON}` },
        body: JSON.stringify({ password: pw, action: "__check" }),
      });
      if (r.status === 401) { setMsg("Falsches Passwort."); setBusy(false); return; }
      if (r.status === 429) { setMsg("Zu viele Versuche — bitte später erneut."); setBusy(false); return; }
      if (r.status === 503) { setMsg("Editor ist noch nicht eingerichtet."); setBusy(false); return; }
      if (r.ok) {
        enterEditMode(pw);
        navigate("/");
      } else {
        setMsg("Unerwarteter Fehler (" + r.status + ").");
        setBusy(false);
      }
    } catch { setMsg("Verbindungsfehler."); setBusy(false); }
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-[#E5F4F5] shadow-[0_20px_60px_rgb(191,234,242,0.3)] p-8"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <h1 className="text-2xl font-medium text-[#111111] mb-1">Seite bearbeiten</h1>
        <p className="text-sm text-[#5F6B73] font-light mb-6">Passwort eingeben — danach kannst du Texte &amp; Bilder direkt auf der Seite ändern.</p>
        <input type="password" value={pw} autoComplete="current-password"
          onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-[#E5F4F5] bg-[#F8FEFF] mb-3 outline-none focus:border-[#6FD3D1]" />
        <button onClick={go} disabled={busy}
          className="w-full bg-[#6FD3D1] text-white hover:bg-[#5BC2C0] disabled:opacity-50 py-3 rounded-full font-medium transition-colors">
          Bearbeitungsmodus starten
        </button>
        <p className="text-xs mt-3 min-h-[1.2em] text-[#5F6B73]">{msg}</p>
      </div>
    </section>
  );
}
