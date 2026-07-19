import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Type, Heading, Image as ImageIcon, MousePointerClick, ListChecks, Quote, Minus } from "lucide-react";
import { type BlockType } from "../../../lib/content";

// Reihenfolge = Anordnung im Bogen von links nach rechts.
const OPTIONS: { type: BlockType; Icon: typeof Type; label: string; hint: string }[] = [
  { type: "text", Icon: Type, label: "Text", hint: "Fließtext" },
  { type: "title", Icon: Heading, label: "Titel", hint: "Überschrift" },
  { type: "image", Icon: ImageIcon, label: "Bild", hint: "Foto" },
  { type: "button", Icon: MousePointerClick, label: "Button", hint: "Link / CTA" },
  { type: "card", Icon: ListChecks, label: "Karte", hint: "Titel + Liste" },
  { type: "quote", Icon: Quote, label: "Zitat", hint: "Hervorheben" },
  { type: "divider", Icon: Minus, label: "Linie", hint: "Trenner" },
];

/**
 * Rundes „+", das beim Drauffahren (oder Tippen) die Block-Typen in einem
 * Bogen darüber auffächert — im de-Vries-Stil. Das Menü wird per Portal an
 * <body> gerendert, damit es NICHT im Stacking-Kontext von <main> (z-10)
 * gefangen ist und garantiert über Footer und Bearbeiten-Leiste liegt.
 *
 * Symmetrie: der Radius wird so gewählt, dass der GANZE Bogen in den Viewport
 * passt (statt einzelne Kacheln zu verschieben) — dadurch ist er immer exakt
 * ums „+" zentriert. Oben zu wenig Platz → klappt nach unten. Touch: Tippen
 * öffnet/schließt, Tippen daneben schließt.
 */
export function BlockPalette({ onPick }: { onPick: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false);
  const [tiles, setTiles] = useState<{ x: number; y: number }[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const compute = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const vw = window.innerWidth, vh = window.innerHeight;
    const n = OPTIONS.length;
    const half = 46, pad = 10;
    const spread = (n <= 1 ? 0 : Math.min(168, 27 * (n - 1))) * (Math.PI / 180);
    const maxA = spread / 2;
    const sinMax = Math.sin(maxA) || 1;
    // Radius so wählen, dass die äußersten Kacheln horizontal und die oberste
    // Kachel vertikal in den Viewport passen — Bogen bleibt so IMMER symmetrisch.
    const radiusX = (Math.min(cx, vw - cx) - half - pad) / sinMax;
    const roomUp = cy - half - pad;
    const roomDown = vh - cy - half - pad;
    // Enger gestapelt (wie gewünscht) — die Hover-Dynamik hebt die aktive Kachel
    // klar hervor, sodass die dichtere Anordnung trotzdem gut lesbar bleibt.
    const desired = vw < 560 ? 106 : 156;
    let dir: -1 | 1 = -1;
    let radius = Math.min(desired, radiusX, roomUp);
    if (radius < 78 && roomDown > roomUp) { dir = 1; radius = Math.min(desired, radiusX, roomDown); }
    radius = Math.max(radius, 64);
    const start = -maxA;
    const step = n <= 1 ? 0 : spread / (n - 1);
    setTiles(OPTIONS.map((_, i) => {
      const a = start + i * step;
      return { x: cx + radius * Math.sin(a), y: cy + dir * radius * Math.cos(a) };
    }));
  }, []);

  const openMenu = useCallback(() => { compute(); setOpen(true); }, [compute]);
  const pick = (type: BlockType) => { setOpen(false); onPick(type); };

  useEffect(() => { if (!open) setHovered(null); }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="flex justify-center py-2">
      <button ref={btnRef} type="button"
        onMouseEnter={openMenu}
        onClick={() => (open ? setOpen(false) : openMenu())}
        aria-haspopup="menu" aria-expanded={open} aria-label="Element hinzufügen"
        className="group relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0F7C77] text-white shadow-[0_10px_30px_rgb(15,124,119,0.35)] hover:bg-[#0c6a66] hover:scale-105 transition-all">
        <Plus size={26} strokeWidth={2.4} className={`transition-transform duration-200 ${open ? "rotate-45" : ""}`} />
      </button>

      {open && createPortal(
        <div ref={menuRef}
          className="fixed inset-0 z-[300] pointer-events-none" role="menu" aria-label="Block-Typ wählen">
          {OPTIONS.map((o, i) => {
            const p = tiles[i];
            if (!p) return null;
            const { Icon, label, hint, type } = o;
            // Dynamik: die berührte Kachel wächst nach vorn, die anderen weichen
            // (schrumpfen) zurück — nur eine ist groß, daher trotz enger Anordnung
            // gut lesbar. Zentrierung läuft über translate (Tailwind), Skalierung
            // über transform (inline) — getrennte CSS-Properties, kein Konflikt.
            const isHover = hovered === i;
            const scale = isHover ? 1.26 : hovered !== null ? 0.84 : 1;
            return (
              <button key={type} type="button" role="menuitem" onClick={() => pick(type)}
                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                style={{ left: p.x, top: p.y, transform: `scale(${scale})`, zIndex: isHover ? 30 : 1, animationDelay: `${i * 40}ms` }}
                className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-2xl bg-white border transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out motion-safe:animate-[curaTileFade_220ms_ease-out_backwards] ${isHover ? "border-[#6FD3D1] bg-[#DFF7F8] shadow-[0_26px_60px_rgb(16,60,58,0.34)]" : "border-[#E5F4F5] shadow-[0_14px_36px_rgb(16,60,58,0.20)]"}`}>
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#DFF7F8] text-[#0F7C77]">
                  <Icon size={19} strokeWidth={1.7} />
                </span>
                <span className="text-xs font-medium text-[#111111] leading-none">{label}</span>
                <span className="text-[10px] text-[#5F6B73] leading-none">{hint}</span>
              </button>
            );
          })}
          {/* Eintritt nur über Opacity animieren — `transform` gehört komplett der
              Hover-Skalierung (inline), `translate` (Tailwind) der Zentrierung.
              So kollidiert nichts (getrennte CSS-Properties). */}
          <style>{`@keyframes curaTileFade { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>,
        document.body,
      )}
    </div>
  );
}
