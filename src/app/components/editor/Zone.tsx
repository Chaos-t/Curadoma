import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import { useContent } from "../../../lib/content";

const jakarta = { fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif" };

/** Liefert die geordneten Item-Keys einer Zone (Server-Override oder Code-Defaults)
 *  plus editMode. Der Inhalt jedes Items läuft weiter über <Editable>. */
export function useZone(zoneId: string, defaultKeys: string[]) {
  const { editMode, getZone } = useContent();
  return { keys: getZone(zoneId, defaultKeys), editMode };
}

/** Steuerung je Eintrag im Bearbeitungsmodus: nach oben/unten, entfernen.
 *  Wird absolut positioniert — der umschließende Container braucht `relative`. */
export function ZoneItemControls({ zoneId, itemKey, index, count, defaultKeys, label = "Eintrag" }: {
  zoneId: string; itemKey: string; index: number; count: number; defaultKeys: string[]; label?: string;
}) {
  const { editMode, removeZoneItem, moveZoneItem } = useContent();
  if (!editMode) return null;
  const btn = "inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-[#E5F4F5] text-[#5F6B73] hover:text-[#111111] disabled:opacity-30 disabled:hover:text-[#5F6B73] shadow-sm transition-colors";
  return (
    <div className="absolute -top-3 right-3 z-20 flex items-center gap-1" contentEditable={false}>
      <button type="button" onClick={() => moveZoneItem(zoneId, itemKey, -1, defaultKeys)} disabled={index === 0}
        title="Nach oben" aria-label="Nach oben" className={btn}><ArrowUp size={15} strokeWidth={1.8} /></button>
      <button type="button" onClick={() => moveZoneItem(zoneId, itemKey, 1, defaultKeys)} disabled={index === count - 1}
        title="Nach unten" aria-label="Nach unten" className={btn}><ArrowDown size={15} strokeWidth={1.8} /></button>
      <button type="button" onClick={() => { if (confirm(`${label} entfernen? (erst beim Speichern endgültig)`)) removeZoneItem(zoneId, itemKey, defaultKeys); }}
        title={`${label} entfernen`} aria-label={`${label} entfernen`} className={`${btn} text-[#d7120a] border-[#f3c2bf]`}><Trash2 size={15} strokeWidth={1.8} /></button>
    </div>
  );
}

/** „+ hinzufügen"-Knopf am Ende einer Zone (nur im Bearbeitungsmodus). */
export function ZoneAddButton({ zoneId, defaultKeys, label = "Eintrag hinzufügen" }: {
  zoneId: string; defaultKeys: string[]; label?: string;
}) {
  const { editMode, addZoneItem } = useContent();
  if (!editMode) return null;
  return (
    <button type="button" onClick={() => addZoneItem(zoneId, defaultKeys)}
      className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-dashed border-[#6FD3D1] text-[#0F7C77] hover:bg-[#DFF7F8] transition-colors text-sm font-medium"
      style={jakarta}>
      <Plus size={18} strokeWidth={2} /> {label}
    </button>
  );
}
