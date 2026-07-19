import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Type, MousePointerClick, Image as ImageIcon, ListChecks } from "lucide-react";

export type BlockType = "text" | "image" | "button" | "card";

// Reihenfolge = Anordnung im Bogen von links nach rechts.
const OPTIONS: { type: BlockType; Icon: typeof Type; label: string; hint: string }[] = [
  { type: "text", Icon: Type, label: "Text", hint: "Fließtext" },
  { type: "image", Icon: ImageIcon, label: "Bild", hint: "Foto" },
  { type: "button", Icon: MousePointerClick, label: "Button", hint: "Link / CTA" },
  { type: "card", Icon: ListChecks, label: "Karte", hint: "Titel + Liste" },
];

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Rundes „+", das beim Drauffahren (oder Tippen) die Block-Typen in einem
 * Bogen darüber auffächert — im de-Vries-Stil. Das Menü wird per Portal an
 * <body> gerendert, damit es NICHT im Stacking-Kontext von <main> (z-10)
 * gefangen ist und garantiert über Footer und Bearbeiten-Leiste liegt.
 * Bogen nach oben; ist oben zu wenig Platz, klappt er nach unten. Positionen
 * werden an den Viewport geklammert (nichts wird abgeschnitten). Touch: Tippen
 * öffnet/schließt, Tippen daneben schließt.
 */
export function BlockPalette({ onPick }: { onPick: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false);
  const [tiles, setTiles] = useState<{ x: number; y: number }[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  const compute = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const vw = window.innerWidth, vh = window.innerHeight;
    const n = OPTIONS.length;
    const half = 44;                                  // halbe Kachelgröße + Rand
    const radius = clamp(vw < 560 ? 96 : 132, 84, vw / 2 - 56);
    const spread = (vw < 560 ? 120 : 152) * (Math.PI / 180);
    // Genug Platz oben? sonst nach unten auffächern.
    const dir = cy - radius - half > 8 ? -1 : 1;
    const start = -spread / 2;
    const step = n <= 1 ? 0 : spread / (n - 1);
    const pts = OPTIONS.map((_, i) => {
      const a = start + i * step;                     // 0 = senkrecht vom „+"
      return {
        x: clamp(cx + radius * Math.sin(a), half + 4, vw - half - 4),
        y: clamp(cy + dir * radius * Math.cos(a), half + 4, vh - half - 4),
      };
    });
    setTiles(pts);
  }, []);

  const openMenu = useCallback(() => { window.clearTimeout(closeTimer.current); compute(); setOpen(true); }, [compute]);
  const scheduleClose = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 220);
  }, []);
  const pick = (type: BlockType) => { window.clearTimeout(closeTimer.current); setOpen(false); onPick(type); };

  // Schließen bei Scroll/Resize (Position würde sonst verrutschen), Klick daneben, Esc.
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

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return (
    <div className="flex justify-center py-2">
      <button ref={btnRef} type="button"
        onMouseEnter={openMenu} onMouseLeave={scheduleClose}
        onClick={() => (open ? setOpen(false) : openMenu())}
        aria-haspopup="menu" aria-expanded={open} aria-label="Element hinzufügen"
        className="group relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0F7C77] text-white shadow-[0_10px_30px_rgb(15,124,119,0.35)] hover:bg-[#0c6a66] hover:scale-105 transition-all">
        <Plus size={26} strokeWidth={2.4} className={`transition-transform duration-200 ${open ? "rotate-45" : ""}`} />
      </button>

      {open && createPortal(
        <div ref={menuRef} onMouseEnter={() => window.clearTimeout(closeTimer.current)} onMouseLeave={scheduleClose}
          className="fixed inset-0 z-[300] pointer-events-none" role="menu" aria-label="Block-Typ wählen">
          {OPTIONS.map((o, i) => {
            const p = tiles[i];
            if (!p) return null;
            const { Icon, label, hint, type } = o;
            return (
              <button key={type} type="button" role="menuitem" onClick={() => pick(type)}
                style={{ left: p.x, top: p.y, animationDelay: `${i * 50}ms` }}
                className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-1 w-[84px] h-[84px] rounded-2xl bg-white border border-[#E5F4F5] shadow-[0_16px_40px_rgb(16,60,58,0.22)] hover:bg-[#DFF7F8] hover:border-[#6FD3D1] transition-colors motion-safe:animate-[curaTilePop_240ms_cubic-bezier(0.22,1,0.36,1)_both]">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#DFF7F8] text-[#0F7C77]">
                  <Icon size={19} strokeWidth={1.7} />
                </span>
                <span className="text-xs font-medium text-[#111111] leading-none">{label}</span>
                <span className="text-[10px] text-[#5F6B73] leading-none">{hint}</span>
              </button>
            );
          })}
          <style>{`@keyframes curaTilePop { from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }`}</style>
        </div>,
        document.body,
      )}
    </div>
  );
}
