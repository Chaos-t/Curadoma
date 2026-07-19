import { CheckCircle, Plus, X } from "lucide-react";
import { useContent } from "../../../lib/content";
import { Editable } from "./Editable";

/**
 * Editierbare Stichpunkt-Liste, die auf dem validierten Zonen-System aufsetzt:
 * Struktur (Reihenfolge/Bestand der Punkte) liegt als Zone in `zones:current`,
 * der TEXT jedes Punktes läuft über die sanitisierte <Editable>-Pipeline.
 * Wird sowohl vom „Karte"-Block als auch von den Leistungs-Karten genutzt.
 *
 * - `zoneId`      eindeutige Zone (z. B. `page.<slug>.blocks.<key>.bullets`)
 * - `defaultKeys` Ausgangs-Schlüssel (Code-Defaults; oft Indizes "0".."n")
 * - `editableId`  Editable-ID je Punkt (Text-Speicherort)
 * - `defaultText` Seed-Text je Punkt (was ohne Override angezeigt wird)
 */
export function EditableList({
  zoneId, defaultKeys, editableId, defaultText, ulClassName = "space-y-2", addLabel = "Stichpunkt hinzufügen",
}: {
  zoneId: string;
  defaultKeys: string[];
  editableId: (key: string) => string;
  defaultText: (key: string) => string;
  ulClassName?: string;
  addLabel?: string;
}) {
  const { editMode, getZone, addZoneItem, removeZoneItem } = useContent();
  const keys = getZone(zoneId, defaultKeys);

  return (
    <ul className={ulClassName}>
      {keys.map((key) => (
        <li key={key} className="flex items-start gap-2 text-sm text-[#5F6B73] font-light">
          <CheckCircle size={16} className="text-[#6FD3D1] mt-0.5 shrink-0" />
          <Editable as="span" id={editableId(key)}>{defaultText(key)}</Editable>
          {editMode && (
            <button type="button" contentEditable={false}
              onClick={() => removeZoneItem(zoneId, key, defaultKeys)}
              title="Stichpunkt entfernen" aria-label="Stichpunkt entfernen"
              className="ml-1 shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full text-[#d7120a] hover:bg-[#fdeceb] transition-colors">
              <X size={13} strokeWidth={2} />
            </button>
          )}
        </li>
      ))}
      {editMode && (
        <li contentEditable={false}>
          <button type="button" onClick={() => addZoneItem(zoneId, defaultKeys)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F7C77] border border-dashed border-[#6FD3D1] rounded-full px-3 py-1.5 hover:bg-[#DFF7F8] transition-colors">
            <Plus size={13} strokeWidth={2} /> {addLabel}
          </button>
        </li>
      )}
    </ul>
  );
}
