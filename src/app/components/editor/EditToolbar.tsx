import { Undo2, Redo2 } from "lucide-react";
import { useContent } from "../../../lib/content";
import { OPEN_HELP_EVENT } from "./EditOnboarding";

export function EditToolbar() {
  const { editMode, dirtyCount, saving, status, error, save, discard, exit, restore, undo, redo, canUndo, canRedo } = useContent();
  if (!editMode) return null;
  const iconBtn = "inline-flex items-center justify-center w-9 h-9 rounded-full text-[#5F6B73] hover:text-[#111111] hover:bg-[#F8FEFF] disabled:opacity-30 disabled:hover:bg-transparent transition-colors";
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[min(94vw,680px)] bg-white/95 backdrop-blur border border-[#E5F4F5] shadow-[0_20px_60px_rgb(0,0,0,0.18)] rounded-2xl px-4 py-3 flex flex-wrap items-center gap-2.5"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <span className="inline-flex items-center gap-2 text-sm font-medium text-[#111111]">
        <span className="w-2 h-2 rounded-full bg-[#d7120a]" /> Bearbeitungsmodus
      </span>
      <span className="text-xs text-[#5F6B73]">{dirtyCount} Änderung{dirtyCount === 1 ? "" : "en"}</span>

      <span className="inline-flex items-center gap-0.5 pl-1">
        <button onClick={undo} disabled={!canUndo} title="Rückgängig (Strg+Z)" aria-label="Rückgängig" className={iconBtn}>
          <Undo2 size={17} strokeWidth={1.7} />
        </button>
        <button onClick={redo} disabled={!canRedo} title="Wiederholen (Strg+Y)" aria-label="Wiederholen" className={iconBtn}>
          <Redo2 size={17} strokeWidth={1.7} />
        </button>
      </span>

      <div className="flex-1" />
      {(status || error) && <span className={`text-xs ${error ? "text-[#d7120a]" : "text-[#5F6B73]"}`}>{error || status}</span>}
      <button onClick={save} disabled={saving || dirtyCount === 0} title="Speichern (Strg+S)"
        className="bg-[#6FD3D1] text-white hover:bg-[#5BC2C0] disabled:opacity-40 px-4 py-2 rounded-full text-sm font-medium transition-colors">
        {saving ? "…" : "Speichern"}
      </button>
      <button onClick={discard} disabled={dirtyCount === 0}
        className="text-[#5F6B73] hover:text-[#111111] disabled:opacity-40 px-3 py-2 rounded-full text-sm">Verwerfen</button>
      <button onClick={() => { if (confirm("Den zuletzt gespeicherten (veröffentlichten) Stand wiederherstellen? Danach die Seite neu laden.")) restore(); }}
        disabled={saving || dirtyCount > 0}
        title={dirtyCount > 0 ? "Erst speichern oder verwerfen" : "Den zuletzt veröffentlichten Stand wiederherstellen (Server)"}
        className="text-[#5F6B73] hover:text-[#111111] disabled:opacity-40 px-3 py-2 rounded-full text-sm">↺ Zurücksetzen</button>
      <button onClick={() => window.dispatchEvent(new Event(OPEN_HELP_EVENT))}
        title="Kurz-Anleitung öffnen"
        className="text-[#5F6B73] hover:text-[#111111] px-3 py-2 rounded-full text-sm">❓ Hilfe</button>
      <button onClick={() => { if (dirtyCount === 0 || confirm("Ungespeicherte Änderungen verwerfen und verlassen?")) exit(); }}
        className="text-[#d7120a] hover:underline px-3 py-2 rounded-full text-sm">Verlassen</button>
    </div>
  );
}
