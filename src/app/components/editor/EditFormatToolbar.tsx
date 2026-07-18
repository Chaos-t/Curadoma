import { useEffect, useState } from "react";
import { Bold, Italic, Link2 } from "lucide-react";
import { useContent } from "../../../lib/content";

// Schwebende Format-Leiste: erscheint über einer Text-Auswahl innerhalb eines
// RICH-Editable-Feldes und bietet Fett/Kursiv/Link. Nur bei rich=true, weil nur
// diese Felder ihr innerHTML speichern (Server sanitisiert strong/b/em/i/br/a).
export function EditFormatToolbar() {
  const { editMode } = useContent();
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!editMode) { setPos(null); return; }
    const update = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) { setPos(null); return; }
      const node = sel.anchorNode;
      const el = node ? (node.nodeType === 3 ? node.parentElement : (node as HTMLElement)) : null;
      const rich = el?.closest?.('[data-ed-rich="true"][contenteditable="true"]');
      if (!rich) { setPos(null); return; }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) { setPos(null); return; }
      const left = Math.min(Math.max(60, rect.left + rect.width / 2), window.innerWidth - 60);
      setPos({ top: Math.max(8, rect.top - 46), left });
    };
    document.addEventListener("selectionchange", update);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      document.removeEventListener("selectionchange", update);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [editMode]);

  if (!editMode || !pos) return null;

  // execCommand feuert ein 'input'-Event -> Editable.onInput speichert das neue
  // innerHTML als pending. Ungültige Link-Ziele fängt serverseitig safeHref ab.
  const cmd = (c: string, val?: string) => document.execCommand(c, false, val);
  const addLink = () => {
    const url = window.prompt("Link-Ziel (https://… , mailto:… , tel:… oder /pfad):", "https://");
    if (url) document.execCommand("createLink", false, url);
  };
  const btn = "w-8 h-8 inline-flex items-center justify-center rounded-full hover:bg-[#DFF7F8] text-[#111111] transition-colors";

  return (
    <div
      onMouseDown={(e) => e.preventDefault()} // Auswahl/Fokus des Feldes nicht verlieren
      className="fixed z-[110] -translate-x-1/2 flex items-center gap-0.5 bg-white border border-[#E5F4F5] shadow-[0_8px_24px_rgba(0,0,0,0.15)] rounded-full px-1.5 py-1"
      style={{ top: pos.top, left: pos.left }}
      role="toolbar" aria-label="Text formatieren"
    >
      <button type="button" onClick={() => cmd("bold")} className={btn} title="Fett" aria-label="Fett">
        <Bold size={16} strokeWidth={2} />
      </button>
      <button type="button" onClick={() => cmd("italic")} className={btn} title="Kursiv" aria-label="Kursiv">
        <Italic size={16} strokeWidth={2} />
      </button>
      <button type="button" onClick={addLink} className={`${btn} text-[#0F7C77]`} title="Link einfügen" aria-label="Link einfügen">
        <Link2 size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
