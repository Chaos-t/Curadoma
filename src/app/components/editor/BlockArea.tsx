import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown, Trash2, Plus, Type, MousePointerClick, Image as ImageIcon } from "lucide-react";
import { useContent, type Block } from "../../../lib/content";
import { Editable } from "./Editable";
import { EditableImage } from "./EditableImage";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
// Neutraler Platzhalter für neue, noch leere Bild-Blöcke (nur im Editor sichtbar).
const IMG_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260'%3E%3Crect width='100%25' height='100%25' fill='%23EAF6F5'/%3E%3Ctext x='50%25' y='50%25' fill='%235F6B73' font-family='sans-serif' font-size='18' text-anchor='middle' dominant-baseline='middle'%3EBild w%C3%A4hlen%3C/text%3E%3C/svg%3E";

const btnCls = "inline-flex items-center justify-center gap-2 bg-[#6FD3D1] text-white px-8 py-3.5 rounded-full text-base font-normal shadow-[0_8px_20px_rgb(111,211,209,0.25)]";

function BlockView({ areaId, block }: { areaId: string; block: Block }) {
  const { editMode, get, setBlockHref } = useContent();
  const base = `${areaId}.${block.k}`;

  if (block.t === "text") {
    return (
      <div className="text-lg text-[#5F6B73] leading-relaxed font-light space-y-4 [&_a]:text-[#6FD3D1] [&_a:hover]:underline [&_strong]:text-[#111111] [&_strong]:font-medium">
        <Editable as="div" id={`${base}.text`} rich>Neuer Textblock — im Bearbeitungsmodus anklicken und schreiben (markieren für Fett/Kursiv/Link).</Editable>
      </div>
    );
  }

  if (block.t === "button") {
    const label = <Editable as="span" id={`${base}.label`}>Button-Text</Editable>;
    return (
      <div>
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

  // image
  const url = get(`${base}.image`);
  if (!editMode && !url) return null; // leere Bild-Blöcke Besuchern nicht zeigen
  return (
    <EditableImage id={`${base}.image`} src={url || IMG_PLACEHOLDER} alt="" className="w-full max-w-2xl rounded-2xl border-4 border-white shadow-[0_18px_50px_rgb(191,234,242,0.35)]" />
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

const PALETTE = [
  { type: "text" as const, Icon: Type, label: "Textblock", hint: "Fließtext" },
  { type: "button" as const, Icon: MousePointerClick, label: "Button", hint: "Link / CTA" },
  { type: "image" as const, Icon: ImageIcon, label: "Bild", hint: "Foto einfügen" },
];

/** Bereich aus typisierten Blöcken (Text/Button/Bild). Die „+"-Palette öffnet
 *  sich beim Drüberfahren (Hover) mit Animation und schwebt per fixed + hohem
 *  z-Index über allem (sonst deckt der Footer sie zu). Klick/Tap für Touch. */
export function BlockArea({ areaId }: { areaId: string }) {
  const { editMode, getBlocks, addBlock } = useContent();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const blocks = getBlocks(areaId);

  const openMenu = () => {
    window.clearTimeout(closeTimer.current);
    const el = addBtnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ top: r.bottom + 8, left: r.left + r.width / 2 });
    setOpen(true);
  };
  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 180);
  };
  const pick = (type: "text" | "button" | "image") => { window.clearTimeout(closeTimer.current); addBlock(areaId, type); setOpen(false); };

  // Schließen bei Scroll/Resize und bei Klick außerhalb (Touch).
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || addBtnRef.current?.contains(t)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return (
    <div className="space-y-5" style={jakarta}>
      {blocks.map((block, i) => (
        <div key={block.k} className="relative">
          {editMode && <BlockControls areaId={areaId} blockKey={block.k} index={i} count={blocks.length} />}
          <BlockView areaId={areaId} block={block} />
        </div>
      ))}

      {editMode && (
        <>
          <button ref={addBtnRef} type="button"
            onMouseEnter={openMenu} onMouseLeave={scheduleClose}
            onClick={() => (open ? setOpen(false) : openMenu())}
            aria-haspopup="true" aria-expanded={open}
            className="group inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-dashed border-[#6FD3D1] text-[#0F7C77] hover:bg-[#DFF7F8] transition-colors text-sm font-medium">
            <Plus size={18} strokeWidth={2} className="transition-transform group-hover:rotate-90" /> Block hinzufügen
          </button>

          {open && pos && (
            <div ref={menuRef}
              onMouseEnter={() => window.clearTimeout(closeTimer.current)} onMouseLeave={scheduleClose}
              className="fixed z-[200]" style={{ top: pos.top, left: pos.left, transform: "translateX(-50%)" }}
              role="menu" aria-label="Block-Typ wählen">
              <div className="w-64 bg-white rounded-2xl border border-[#E5F4F5] shadow-[0_18px_50px_rgb(16,60,58,0.22)] p-2 motion-safe:animate-[curaBlockPop_220ms_cubic-bezier(0.22,1,0.36,1)_both]">
                {PALETTE.map(({ type, Icon, label, hint }, i) => (
                  <button key={type} type="button" role="menuitem" onClick={() => pick(type)}
                    style={{ animationDelay: `${i * 45}ms` }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left hover:bg-[#DFF7F8] transition-colors motion-safe:animate-[curaBlockItem_260ms_ease-out_both]">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#DFF7F8] text-[#0F7C77] shrink-0">
                      <Icon size={17} strokeWidth={1.7} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-[#111111]">{label}</span>
                      <span className="block text-xs text-[#5F6B73]">{hint}</span>
                    </span>
                  </button>
                ))}
              </div>
              <style>{`
                @keyframes curaBlockPop  { from { opacity: 0; transform: translateY(-8px) scale(0.96); } to { opacity: 1; transform: none; } }
                @keyframes curaBlockItem { from { opacity: 0; transform: translateY(6px); }            to { opacity: 1; transform: none; } }
              `}</style>
            </div>
          )}
        </>
      )}
    </div>
  );
}
