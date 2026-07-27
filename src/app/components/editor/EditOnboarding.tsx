import { useEffect, useState } from "react";
import { useContent } from "../../../lib/content";

const KEY = "cura_edit_onboarded";
export const OPEN_HELP_EVENT = "cura-open-help";

// Kurz-Anleitung: erscheint beim ERSTEN Start des Bearbeitungsmodus (einmalig,
// per localStorage gemerkt) und jederzeit wieder über den „❓ Hilfe"-Knopf.
export function EditOnboarding() {
  const { editMode } = useContent();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!editMode) { setOpen(false); return; }
    let seen = false;
    try { seen = localStorage.getItem(KEY) === "1"; } catch { /* localStorage evtl. blockiert */ }
    if (!seen) setOpen(true);
    const onHelp = () => setOpen(true);
    window.addEventListener(OPEN_HELP_EVENT, onHelp);
    return () => window.removeEventListener(OPEN_HELP_EVENT, onHelp);
  }, [editMode]);

  if (!editMode || !open) return null;

  const close = () => {
    try { localStorage.setItem(KEY, "1"); } catch { /* egal */ }
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-black/40" onClick={close}>
      <div
        className="w-full max-w-md bg-white rounded-3xl border border-[#E5F4F5] shadow-[0_30px_80px_rgba(0,0,0,0.3)] p-7"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif" }}
        role="dialog" aria-modal="true" aria-label="Hilfe zum Bearbeiten"
      >
        <h2 className="text-xl font-medium text-[#111111] mb-4">So bearbeitest du deine Seite</h2>
        <ul className="space-y-2.5 text-sm text-[#5F6B73] mb-6">
          <li>✏️ <b className="text-[#111111]">Text ändern:</b> auf einen <span className="text-[#d7120a]">rot umrandeten</span> Text klicken und tippen.</li>
          <li>🖼️ <b className="text-[#111111]">Bild ersetzen:</b> auf ein umrandetes Bild klicken und eine Datei wählen (max. 3 MB).</li>
          <li>🔵 Geänderte Felder bekommen einen <span className="text-[#0F7C77] font-medium">türkisen</span> Rahmen — so siehst du, was du angefasst hast.</li>
          <li>✍️ <b className="text-[#111111]">Fett / Kursiv / Link:</b> in Textfeldern Text markieren → eine kleine Leiste erscheint.</li>
          <li>💾 <b className="text-[#111111]">Speichern:</b> unten „Speichern" oder <b>Strg + S</b>. Danach ist die Änderung live.</li>
          <li>↩️ <b className="text-[#111111]">Verwerfen:</b> setzt ungespeicherte Änderungen zurück.</li>
        </ul>
        <button onClick={close} className="w-full bg-[#0F7C77] text-white hover:bg-[#0c6a66] py-3 rounded-full font-medium transition-colors">
          Verstanden, los geht's
        </button>
        <p className="text-xs text-[#5F6B73] text-center mt-3">Jederzeit über „❓ Hilfe" unten wieder öffnen.</p>
      </div>
    </div>
  );
}
