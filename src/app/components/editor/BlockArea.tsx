import { lazy, Suspense } from "react";
import { ArrowUp, ArrowDown, Trash2, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useContent, type Block, type BlockAlign } from "../../../lib/content";
import { Editable } from "./Editable";
import { EditableImage } from "./EditableImage";
import { EditableList } from "./EditableList";

// Die „+"-Palette gibt es nur im Bearbeitungsmodus -> erst dann nachladen.
const BlockPalette = lazy(() => import("./BlockPalette").then((m) => ({ default: m.BlockPalette })));

const jakarta = { fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif" };
// Neutraler Platzhalter für neue, noch leere Bild-Blöcke (nur im Editor sichtbar).
const IMG_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260'%3E%3Crect width='100%25' height='100%25' fill='%23EAF6F5'/%3E%3Ctext x='50%25' y='50%25' fill='%235F6B73' font-family='sans-serif' font-size='18' text-anchor='middle' dominant-baseline='middle'%3EBild w%C3%A4hlen%3C/text%3E%3C/svg%3E";

const btnCls = "inline-flex items-center justify-center gap-2 bg-[#6FD3D1] text-white px-8 py-3.5 rounded-full text-base font-normal shadow-[0_8px_20px_rgb(111,211,209,0.25)]";

const textAlign = (a?: string) => (a === "center" ? "text-center" : a === "right" ? "text-right" : "text-left");
const imgAlign = (a?: string) => (a === "center" ? "mx-auto" : a === "right" ? "ml-auto" : "mr-auto");
// Typen mit Ausrichtungs-Steuerung (Karte/Linie brauchen keine).
const ALIGNABLE = new Set(["text", "title", "button", "quote", "image"]);

function BlockView({ areaId, block }: { areaId: string; block: Block }) {
  const { editMode, get, getZone, setBlockHref } = useContent();
  const base = `${areaId}.${block.k}`;

  if (block.t === "text") {
    if (!editMode && !get(`${base}.text`)) return null; // leeren Textblock nicht zeigen
    return (
      <div className={`${textAlign(block.align)} text-lg text-[#5F6B73] leading-relaxed font-light space-y-4 [&_a]:text-[#6FD3D1] [&_a:hover]:underline [&_strong]:text-[#111111] [&_strong]:font-medium`}>
        <Editable as="div" id={`${base}.text`} rich placeholder="Text schreiben — markieren für Fett, Kursiv oder Link" />
      </div>
    );
  }

  if (block.t === "title") {
    if (!editMode && !get(`${base}.title`)) return null;
    return (
      <Editable as="h2" id={`${base}.title`} placeholder="Überschrift schreiben"
        className={`${textAlign(block.align)} block text-3xl sm:text-4xl font-medium tracking-tight text-[#111111] leading-tight`} style={jakarta} />
    );
  }

  if (block.t === "quote") {
    if (!editMode && !get(`${base}.text`)) return null;
    return (
      <blockquote className={`${textAlign(block.align)} border-l-4 border-[#6FD3D1] pl-5 py-1`}>
        <Editable as="p" id={`${base}.text`} rich placeholder="Zitat schreiben …"
          className="block text-xl italic text-[#111111] font-light leading-relaxed [&_strong]:font-medium" />
        <Editable as="footer" id={`${base}.cite`} placeholder="Quelle (optional)"
          className="block mt-2 text-sm not-italic text-[#5F6B73]" />
      </blockquote>
    );
  }

  if (block.t === "divider") {
    return <hr className="border-0 border-t border-[#E5F4F5] my-2" />;
  }

  if (block.t === "button") {
    const label = <Editable as="span" id={`${base}.label`} placeholder="Button-Beschriftung" />;
    const hasLabel = editMode || get(`${base}.label`);
    if (!hasLabel) return null;
    return (
      <div className={textAlign(block.align)}>
        {editMode ? (
          <span className={`${btnCls} cursor-text`}>{label}</span>
        ) : (
          <a href={block.href || "#"} className={btnCls} {...(/^https?:/i.test(block.href || "") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{label}</a>
        )}
        {editMode && (
          <input value={block.href ?? ""} onChange={(e) => setBlockHref(areaId, block.k, e.target.value)}
            placeholder="Link-Ziel: https://… , /kontakt , mailto:… , tel:…" aria-label="Link-Ziel"
            className="mt-2 block w-full max-w-md px-3 py-1.5 text-xs rounded-lg border border-[#E5F4F5] bg-[#F8FEFF] outline-none focus:border-[#6FD3D1]" />
        )}
      </div>
    );
  }

  if (block.t === "card") {
    // Karte = editierbare Überschrift + freie Stichpunkt-Liste (Platzhalter).
    const bulletZone = `${base}.bullets`;
    if (!editMode) {
      const bkeys = getZone(bulletZone, ["0", "1", "2"]);
      const anyBullet = bkeys.some((k) => get(`${bulletZone}.${k}`));
      if (!get(`${base}.title`) && !anyBullet) return null; // ganz leere Karte nicht zeigen
    }
    return (
      <div className="rounded-2xl border border-[#E5F4F5] bg-white/90 p-6 sm:p-8 shadow-[0_10px_30px_rgb(191,234,242,0.25)]">
        <h3 className="text-xl font-medium tracking-tight text-[#111111] mb-3" style={jakarta}>
          <Editable as="span" id={`${base}.title`} placeholder="Überschrift der Karte" />
        </h3>
        <EditableList
          zoneId={bulletZone}
          defaultKeys={["0", "1", "2"]}
          editableId={(k) => `${bulletZone}.${k}`}
          placeholder="Stichpunkt"
          ulClassName="space-y-2"
        />
      </div>
    );
  }

  // image
  const url = get(`${base}.image`);
  if (!editMode && !url) return null; // leere Bild-Blöcke Besuchern nicht zeigen
  return (
    <EditableImage id={`${base}.image`} src={url || IMG_PLACEHOLDER} alt="" className={`w-full max-w-2xl block ${imgAlign(block.align)} rounded-2xl border-4 border-white shadow-[0_18px_50px_rgb(191,234,242,0.35)]`} />
  );
}

function AlignControls({ areaId, blockKey, align }: { areaId: string; blockKey: string; align?: BlockAlign }) {
  const { setBlockAlign } = useContent();
  const cur = align ?? "left";
  const item = (a: BlockAlign, Icon: typeof AlignLeft, title: string) => (
    <button type="button" onClick={() => setBlockAlign(areaId, blockKey, a)} title={title} aria-label={title}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors ${cur === a ? "bg-[#0F7C77] text-white" : "text-[#5F6B73] hover:text-[#111111] hover:bg-[#F8FEFF]"}`}>
      <Icon size={14} strokeWidth={1.8} />
    </button>
  );
  return (
    <div className="absolute -top-3 left-2 z-20 flex items-center gap-0.5 bg-white rounded-full p-0.5 shadow-sm border border-[#E5F4F5]" contentEditable={false}>
      {item("left", AlignLeft, "Linksbündig")}
      {item("center", AlignCenter, "Zentriert")}
      {item("right", AlignRight, "Rechtsbündig")}
    </div>
  );
}

function BlockControls({ areaId, blockKey, index, count }: {
  areaId: string; blockKey: string; index: number; count: number;
}) {
  const { moveBlock, removeBlock } = useContent();
  const b = "inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-[#E5F4F5] text-[#5F6B73] hover:text-[#111111] disabled:opacity-30 shadow-sm transition-colors";
  return (
    <div className="absolute -top-3 right-2 z-20 flex items-center gap-1" contentEditable={false}>
      <button type="button" onClick={() => moveBlock(areaId, blockKey, -1)} disabled={index === 0} title="Nach oben" aria-label="Nach oben" className={b}><ArrowUp size={15} strokeWidth={1.8} /></button>
      <button type="button" onClick={() => moveBlock(areaId, blockKey, 1)} disabled={index === count - 1} title="Nach unten" aria-label="Nach unten" className={b}><ArrowDown size={15} strokeWidth={1.8} /></button>
      <button type="button" onClick={() => { if (confirm("Diesen Block entfernen?")) removeBlock(areaId, blockKey); }} title="Entfernen" aria-label="Entfernen" className={`${b} text-[#d7120a] border-[#f3c2bf]`}><Trash2 size={15} strokeWidth={1.8} /></button>
    </div>
  );
}

/** Bereich aus typisierten Blöcken. Neue Blöcke kommen über die radiale
 *  „+"-Palette (BlockPalette, per Portal über allem). Jeder Block hat im
 *  Bearbeitungsmodus links eine Ausrichtungs-Leiste (L·M·R) und rechts
 *  Verschieben/Entfernen; leere Blöcke werden Besuchern nicht gezeigt. */
export function BlockArea({ areaId }: { areaId: string }) {
  const { editMode, getBlocks, addBlock } = useContent();
  const blocks = getBlocks(areaId);

  return (
    <div className="space-y-5" style={jakarta}>
      {blocks.map((block, i) => (
        <div key={block.k} className="relative">
          {editMode && ALIGNABLE.has(block.t) && <AlignControls areaId={areaId} blockKey={block.k} align={block.align} />}
          {editMode && <BlockControls areaId={areaId} blockKey={block.k} index={i} count={blocks.length} />}
          <BlockView areaId={areaId} block={block} />
        </div>
      ))}

      {editMode && (
        <Suspense fallback={null}>
          <BlockPalette onPick={(type) => addBlock(areaId, type)} />
        </Suspense>
      )}
    </div>
  );
}
