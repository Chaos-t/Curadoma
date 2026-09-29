import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { consent, requestReopenBanner } from "../../lib/consent";
import { Editable } from "./editor/Editable";

const jakarta = { fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif" };

/**
 * Google-Maps-Karte, die NUR nach Einwilligung laedt. Ohne Einwilligung
 * erscheint ein Platzhalter mit "Karte zulassen".
 *
 * Warum ein eigener Baustein: Beim Laden der Karte gehen Daten (u. a. die
 * IP-Adresse) an Google. Der Cookie-Banner verspricht, dass das nur mit
 * Zustimmung passiert. Die Kontaktseite hat die Karte bisher OHNE diese
 * Pruefung geladen — ein Widerspruch zum eigenen Banner. Jetzt nutzen alle
 * Karten der Seite diesen einen Baustein.
 *
 * SSR: Der Startwert ist IMMER `false`. Der Server kennt die Einwilligung
 * nicht (sie liegt im localStorage des Besuchers). Wuerde der Client sie schon
 * beim ersten Rendern lesen, saehe sein Baum fuer jeden, der zugestimmt hat,
 * anders aus als das vorab gerenderte HTML -> die Hydration bricht ab. Die
 * alte Einzugsgebiet-Karte hatte genau diesen Fehler. Deshalb wird der echte
 * Wert erst nach dem Mounten im Effekt geholt.
 */
export function ConsentMap({ src, title, className }: { src: string; title: string; className?: string }) {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    setAllowed(consent.externalAllowed());
    return consent.subscribe((s) => setAllowed(s?.external === true));
  }, []);

  if (allowed) {
    return (
      <iframe
        title={title}
        src={src}
        className={`w-full h-full border-0 ${className ?? ""}`}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }
  return (
    <div className={`w-full h-full bg-gradient-to-br from-[#DFF7F8] via-[#F8FEFF] to-[#BFEAF2]/40 flex flex-col items-center justify-center text-center px-6 py-8 ${className ?? ""}`}>
      <Lock size={28} className="text-[#6FD3D1] mb-3" strokeWidth={1.5} />
      <p className="text-sm text-[#111111] font-medium mb-1" style={jakarta}>
        <Editable as="span" id="einzugsgebiet-section.map-placeholder.title">Karte ausgeblendet</Editable>
      </p>
      <p className="text-xs text-[#5F6B73] font-light leading-relaxed mb-4 max-w-xs">
        <Editable as="span" id="einzugsgebiet-section.map-placeholder.desc">Beim Laden der Google-Maps-Karte werden Daten an Google übertragen.
        Stimmen Sie der Einbettung externer Inhalte zu, um die Karte zu sehen.</Editable>
      </p>
      <button
        type="button"
        onClick={() => requestReopenBanner()}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0F7C77] hover:bg-[#0E6E6A] text-white text-xs font-medium transition-colors"
      >
        <Editable as="span" id="einzugsgebiet-section.map-placeholder.button">Karte zulassen</Editable>
      </button>
    </div>
  );
}
