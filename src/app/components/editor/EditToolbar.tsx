import { useContent } from "../../../lib/content";

export function EditToolbar() {
  const { editMode, dirtyCount, saving, status, error, save, discard, exit, restore } = useContent();
  if (!editMode) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[min(92vw,640px)] bg-white/95 backdrop-blur border border-[#E5F4F5] shadow-[0_20px_60px_rgb(0,0,0,0.18)] rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <span className="inline-flex items-center gap-2 text-sm font-medium text-[#111111]">
        <span className="w-2 h-2 rounded-full bg-[#d7120a]" /> Bearbeitungsmodus
      </span>
      <span className="text-xs text-[#5F6B73]">{dirtyCount} Änderung{dirtyCount === 1 ? "" : "en"}</span>
      <div className="flex-1" />
      {(status || error) && <span className={`text-xs ${error ? "text-[#d7120a]" : "text-[#5F6B73]"}`}>{error || status}</span>}
      <button onClick={save} disabled={saving || dirtyCount === 0} title="Speichern (Strg+S)"
        className="bg-[#6FD3D1] text-white hover:bg-[#5BC2C0] disabled:opacity-40 px-4 py-2 rounded-full text-sm font-medium transition-colors">
        {saving ? "…" : "Speichern"}
      </button>
      <button onClick={discard} disabled={dirtyCount === 0}
        className="text-[#5F6B73] hover:text-[#111111] disabled:opacity-40 px-3 py-2 rounded-full text-sm">Verwerfen</button>
      <button onClick={() => { if (confirm("Letzte gespeicherte Änderung rückgängig machen?")) restore(); }}
        disabled={saving || dirtyCount > 0}
        title={dirtyCount > 0 ? "Erst speichern oder verwerfen" : "Den letzten gespeicherten Stand zurücknehmen"}
        className="text-[#5F6B73] hover:text-[#111111] disabled:opacity-40 px-3 py-2 rounded-full text-sm">Rückgängig</button>
      <button onClick={() => { if (dirtyCount === 0 || confirm("Ungespeicherte Änderungen verwerfen und verlassen?")) exit(); }}
        className="text-[#d7120a] hover:underline px-3 py-2 rounded-full text-sm">Verlassen</button>
    </div>
  );
}
