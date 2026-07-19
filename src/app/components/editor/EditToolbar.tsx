import { useState } from "react";
import { Undo2, Redo2, Pencil } from "lucide-react";
import { useContent } from "../../../lib/content";
import { OPEN_HELP_EVENT } from "./EditOnboarding";
import { OPEN_SEO_EVENT } from "./SeoPanel";
import { router } from "../../routes";

/**
 * Bearbeiten-Leiste als LINKES, vertikales Panel im „Edge-Panel"-Stil: normal
 * eingeklappt (nur ein schmaler Griff mit rot pulsierendem Marker ragt heraus);
 * beim Rangehen (Hover) oder Antippen (Touch) fährt das Panel per Animation aus.
 * So ist es nicht dauerhaft im Weg und skaliert für künftige Optionen.
 */
export function EditToolbar() {
  const { editMode, dirtyCount, saving, status, error, save, discard, exit, restore, undo, redo, canUndo, canRedo } = useContent();
  const [open, setOpen] = useState(false);
  if (!editMode) return null;

  const iconBtn = "inline-flex items-center justify-center w-9 h-9 rounded-full text-[#5F6B73] hover:text-[#111111] hover:bg-[#F8FEFF] disabled:opacity-30 disabled:hover:bg-transparent transition-colors";
  const rowBtn = "w-full text-left px-3 py-2 rounded-xl text-sm transition-colors";

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[100]"
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className={`flex items-stretch transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-[248px]"}`}>
        {/* Panel */}
        <div className="w-[248px] bg-white/95 backdrop-blur border border-l-0 border-[#E5F4F5] rounded-r-2xl shadow-[0_20px_60px_rgb(0,0,0,0.18)] p-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm font-medium text-[#111111] px-1">
            <span className="w-2 h-2 rounded-full bg-[#d7120a]" /> Bearbeitungsmodus
          </div>
          <div className="flex items-center justify-between px-1 mb-0.5">
            <span className="text-xs text-[#5F6B73]">{dirtyCount} Änderung{dirtyCount === 1 ? "" : "en"}</span>
            <span className="inline-flex items-center gap-0.5">
              <button onClick={undo} disabled={!canUndo} title="Rückgängig (Strg+Z)" aria-label="Rückgängig" className={iconBtn}><Undo2 size={16} strokeWidth={1.7} /></button>
              <button onClick={redo} disabled={!canRedo} title="Wiederholen (Strg+Y)" aria-label="Wiederholen" className={iconBtn}><Redo2 size={16} strokeWidth={1.7} /></button>
            </span>
          </div>

          {(status || error) && <div className={`text-xs px-1 pb-0.5 ${error ? "text-[#d7120a]" : "text-[#5F6B73]"}`}>{error || status}</div>}

          <button onClick={save} disabled={saving || dirtyCount === 0} title="Speichern (Strg+S)"
            className="w-full bg-[#6FD3D1] text-white hover:bg-[#5BC2C0] disabled:opacity-40 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            {saving ? "Speichern …" : "Speichern"}
          </button>
          <button onClick={discard} disabled={dirtyCount === 0}
            className={`${rowBtn} text-[#5F6B73] hover:text-[#111111] hover:bg-[#F8FEFF] disabled:opacity-40 disabled:hover:bg-transparent`}>Verwerfen</button>
          <button onClick={() => { if (confirm("Den zuletzt gespeicherten (veröffentlichten) Stand wiederherstellen? Danach die Seite neu laden.")) restore(); }}
            disabled={saving || dirtyCount > 0}
            title={dirtyCount > 0 ? "Erst speichern oder verwerfen" : "Den zuletzt veröffentlichten Stand wiederherstellen (Server)"}
            className={`${rowBtn} text-[#5F6B73] hover:text-[#111111] hover:bg-[#F8FEFF] disabled:opacity-40 disabled:hover:bg-transparent`}>↺ Zurücksetzen</button>
          <button onClick={() => window.dispatchEvent(new Event(OPEN_SEO_EVENT))} title="SEO & Titel dieser Seite bearbeiten"
            className={`${rowBtn} text-[#0F7C77] hover:bg-[#DFF7F8] font-medium`}>🔍 SEO &amp; Titel</button>
          <button onClick={() => window.dispatchEvent(new Event(OPEN_HELP_EVENT))} title="Kurz-Anleitung öffnen"
            className={`${rowBtn} text-[#5F6B73] hover:text-[#111111] hover:bg-[#F8FEFF]`}>❓ Hilfe</button>
          <button onClick={() => { if (dirtyCount === 0 || confirm("Ungespeicherte Änderungen verwerfen und verlassen?")) { exit(); router.navigate("/"); } }}
            className={`${rowBtn} text-[#d7120a] hover:bg-[#fdeceb]`}>Verlassen</button>
        </div>

        {/* Griff: immer sichtbar, rot pulsierender Marker */}
        <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? "Bearbeiten-Leiste schließen" : "Bearbeiten-Leiste öffnen"} aria-expanded={open}
          className="self-center flex flex-col items-center justify-center gap-2 w-9 py-4 bg-[#0F7C77] text-white rounded-r-2xl shadow-[0_10px_30px_rgb(15,124,119,0.35)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff5a52] opacity-80" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff5a52]" />
          </span>
          <Pencil size={15} strokeWidth={1.9} />
          <span className="text-[10px] font-medium tracking-wide [writing-mode:vertical-rl] rotate-180">Bearbeiten</span>
        </button>
      </div>
    </div>
  );
}
