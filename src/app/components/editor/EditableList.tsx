import { CheckCircle, Plus, X } from "lucide-react";
import { useContent } from "../../../lib/content";
import { Editable } from "./Editable";

/**
 * Editierbare Stichpunkt-Liste, die auf dem validierten Zonen-System aufsetzt:
 * Struktur (Reihenfolge/Bestand der Punkte) liegt als Zone in `zones:current`,
 * der TEXT jedes Punktes läuft über die sanitisierte <Editable>-Pipeline.
 * Wird vom „Karte"-Block (Platzhalter-Modus) und den Leistungs-Karten
 * (feste Standard-Texte) genutzt.
 *
 * - `defaultText` Seed-Text je Punkt (z. B. Leistungen) — ODER
 * - `placeholder`  echter Platzhalter je Punkt (z. B. neue Karte); leere
 *   Punkte werden Besuchern dann nicht gezeigt.
 */
export function EditableList({
  zoneId, defaultKeys, editableId, defaultText, placeholder, ulClassName = "space-y-2", addLabel = "Stichpunkt hinzufügen",
}: {
  zoneId: string;
  defaultKeys: string[];
  editableId: (key: string) => string;
  defaultText?: (key: string) => string;
  placeholder?: string;
  ulClassName?: string;
  addLabel?: string;
}) {
  const { editMode, getZone, addZoneItem, removeZoneItem, get } = useContent();
  const keys = getZone(zoneId, defaultKeys);

  return (
    <ul className={ulClassName}>
      {keys.map((key) => {
        // Leere Platzhalter-Punkte Besuchern nicht zeigen.
        if (!editMode && placeholder && !get(editableId(key))) return null;
        return (
          <li key={key} className="flex items-start gap-2 text-sm text-[#5F6B73] font-light">
            <CheckCircle size={16} className="text-[#6FD3D1] mt-0.5 shrink-0" />
            <Editable as="span" id={editableId(key)} placeholder={placeholder}>
              {placeholder ? null : (defaultText ? defaultText(key) : "")}
            </Editable>
            {editMode && (
              <button type="button" contentEditable={false}
                onClick={() => removeZoneItem(zoneId, key, defaultKeys)}
                title="Stichpunkt entfernen" aria-label="Stichpunkt entfernen"
                className="ml-1 shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full text-[#d7120a] hover:bg-[#fdeceb] transition-colors">
                <X size={13} strokeWidth={2} />
              </button>
            )}
          </li>
        );
      })}
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
