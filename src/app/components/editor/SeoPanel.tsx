import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { createPortal } from "react-dom";
import { X, Search } from "lucide-react";
import { useContent, type SeoEntry } from "../../../lib/content";
import { useAdmin, adminErrorText } from "../../../lib/admin";
import { SEO_BY_PATH, SEO_DEFAULT } from "../../../lib/seo";

export const OPEN_SEO_EVENT = "cura-open-seo";

const jakarta = { fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif" };
const SITE = "https://curadoma.de";

/** „SEO & Titel"-Panel: bearbeitet Titel, Meta-Beschreibung und OG-Bild der
 *  AKTUELLEN Route (Overlay über die Code-Defaults). Wird über OPEN_SEO_EVENT
 *  aus der Bearbeiten-Leiste geöffnet. Nur im Bearbeitungsmodus. */
export function SeoPanel() {
  const { pathname } = useLocation();
  const { editMode, getSeo, saveSeo, getPages } = useContent();
  const { pw } = useAdmin();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const key = pathname.replace(/\/+$/, "") || "/";

  useEffect(() => {
    const openHandler = () => {
      const ov = getSeo()[key] || {};
      setTitle(ov.title || ""); setDescription(ov.description || ""); setImage(ov.image || "");
      setErr(null); setStatus(null); setOpen(true);
    };
    window.addEventListener(OPEN_SEO_EVENT, openHandler);
    return () => window.removeEventListener(OPEN_SEO_EVENT, openHandler);
  }, [getSeo, key]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!editMode || !open) return null;

  const dyn = getPages().find((p) => `/${p.slug}` === key);
  const base = SEO_BY_PATH[key] ?? SEO_DEFAULT;
  const effTitle = title.trim() || (dyn ? `${dyn.label} – Cura Doma` : base.title);
  const effDesc = description.trim() || base.description;
  const prettyUrl = "curadoma.de" + (key === "/" ? "" : key);

  const save = async () => {
    setBusy(true); setErr(null); setStatus(null);
    try {
      const entry: SeoEntry = {};
      if (title.trim()) entry.title = title.trim();
      if (description.trim()) entry.description = description.trim();
      if (image.trim()) entry.image = image.trim();
      const next = { ...getSeo() };
      if (Object.keys(entry).length) next[key] = entry; else delete next[key];
      const validated = await saveSeo(next, pw());
      // Felder + Vorschau auf den SERVER-Stand angleichen (der Server entfernt
      // evtl. Tags / kürzt) — sonst zeigt das Panel etwas anderes als live ist.
      const e = validated[key] || {};
      setTitle(e.title || ""); setDescription(e.description || ""); setImage(e.image || "");
      setStatus("Gespeichert ✓ — in 1–2 Min live.");
    } catch (e) { setErr(adminErrorText(e)); }
    finally { setBusy(false); }
  };

  const field = "w-full px-3 py-2 rounded-xl border border-[#E5F4F5] bg-[#F8FEFF] text-sm outline-none focus:border-[#6FD3D1]";
  const counter = (n: number, rec: number) => (
    <span className={`text-[11px] ${n > rec ? "text-[#d7120a]" : "text-[#5F6B73]"}`}>{n}/{rec} empf.</span>
  );

  return createPortal(
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/40" style={jakarta}
      onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-[0_30px_80px_rgb(0,0,0,0.3)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5F4F5] sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-lg font-medium text-[#111111]">SEO &amp; Titel</h2>
            <p className="text-xs text-[#5F6B73]">für <b className="text-[#0F7C77]">{prettyUrl}</b></p>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Schließen" className="text-[#5F6B73] hover:text-[#111111] hover:bg-[#F8FEFF] rounded-full p-1.5"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1"><label className="text-sm font-medium text-[#111111]">Seiten-Titel</label>{counter(title.length, 60)}</div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={field}
              placeholder={dyn ? `${dyn.label} – Cura Doma` : base.title} aria-label="Seiten-Titel" />
            <p className="text-[11px] text-[#5F6B73] mt-1">Erscheint im Browser-Tab und als blaue Überschrift bei Google. Leer = Standard.</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1"><label className="text-sm font-medium text-[#111111]">Meta-Beschreibung</label>{counter(description.length, 155)}</div>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${field} resize-none`}
              placeholder={base.description} aria-label="Meta-Beschreibung" />
            <p className="text-[11px] text-[#5F6B73] mt-1">Der graue Text unter dem Titel bei Google. Leer = Standard.</p>
          </div>

          <div>
            <label className="text-sm font-medium text-[#111111] block mb-1">Vorschau-Bild (beim Teilen)</label>
            <input value={image} onChange={(e) => setImage(e.target.value)} className={field}
              placeholder="https://… (z. B. ein Bild aus der Mediathek)" aria-label="Vorschau-Bild-URL" />
            <p className="text-[11px] text-[#5F6B73] mt-1">Optional. Wird beim Teilen auf WhatsApp/Facebook/X angezeigt. Muss eine vollständige https-Adresse sein.</p>
          </div>

          {/* Google-Vorschau */}
          <div className="rounded-xl border border-[#E5F4F5] bg-[#F8FEFF] p-4">
            <div className="flex items-center gap-1.5 text-xs text-[#5F6B73] mb-2"><Search size={13} /> So sieht es bei Google aus</div>
            <div className="text-xs text-[#3C7A00]">{prettyUrl}</div>
            <div className="text-[#1a0dab] text-lg leading-snug truncate">{effTitle}</div>
            <div className="text-sm text-[#4d5156] line-clamp-2">{effDesc}</div>
          </div>

          {err && <p className="text-sm text-[#d7120a]" role="alert">{err}</p>}
          {status && <p className="text-sm text-[#0F7C77]">{status}</p>}

          <div className="flex items-center gap-2 pt-1">
            <button onClick={save} disabled={busy}
              className="bg-[#0F7C77] text-white hover:bg-[#0c6a66] disabled:opacity-50 px-5 py-2.5 rounded-full text-sm font-medium">
              {busy ? "Speichern …" : "Speichern"}
            </button>
            <button onClick={() => setOpen(false)} className="text-[#5F6B73] hover:text-[#111111] px-4 py-2.5 rounded-full text-sm">Schließen</button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
