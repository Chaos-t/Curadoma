import { HandHeart } from "lucide-react";
import { Css } from "./Css";

// Die vier Begriffe stehen bewusst FEST IM CODE und sind nicht über den
// Inhalts-Editor änderbar — wie der Axion-Studio-Credit im Footer.
// Grund: Der Text läuft in einem SVG-<textPath> an einer Kurve entlang.
// contentEditable ist dort unzuverlässig (der Cursor springt), und jede
// Textänderung verändert die Bogenlänge, sodass die Schriftgröße neu
// bestimmt werden müsste, damit der Kreis weiterhin genau aufgeht.
const WORDS = ["MIT HERZ", "ZUVERLÄSSIG", "RESPEKTVOLL", "ZUHAUSE BETREUT"];

// Radius in viewBox-Einheiten. Umfang = 2 * PI * 76 ≈ 477.5 — daran muss
// sich die Schriftgröße orientieren, siehe Step 4.
const R = 76;

export function ValueSeal({ className, idSuffix = "" }: { className?: string; idSuffix?: string }) {
  // Eigene id je Instanz: Würde das Siegel zweimal auf einer Seite stehen,
  // zeigten sonst beide <textPath> auf denselben Pfad.
  const pathId = `cura-seal-path${idSuffix}`;
  const text = WORDS.join(" · ") + " · ";

  return (
    // aria-hidden: Die Begriffe sind dekorative Wiederholung — die Sektion
    // "Warum sich Familien für uns entscheiden" nennt dieselben Werte weiter
    // unten als echten Inhalt. Ein zweites Vorlesen wäre nur Lärm.
    // Fallback "relative" nur, wenn kein className mit eigenem Positions-Utility
    // uebergeben wird (s. Begruendung im <Css>-Block unten) — HomePage.tsx
    // ersetzt es mit "absolute ...", nicht kombiniert damit.
    <div className={`cura-seal ${className ?? "relative"}`} aria-hidden="true">
      <svg viewBox="0 0 200 200" className="cura-seal__ring block w-full h-full">
        <defs>
          <path
            id={pathId}
            fill="none"
            d={`M 100,100 m -${R},0 a ${R},${R} 0 1,1 ${R * 2},0 a ${R},${R} 0 1,1 -${R * 2},0`}
          />
        </defs>
        <text
          fill="#0F7C77"
          style={{
            fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif",
            fontWeight: 500,
            fontSize: 11.5,
            letterSpacing: "0.16em",
          }}
        >
          <textPath href={`#${pathId}`} startOffset="0">{text}</textPath>
        </text>
      </svg>

      <span className="cura-seal__core absolute inset-0 flex items-center justify-center text-[#6FD3D1]">
        <HandHeart className="w-1/4 h-1/4" strokeWidth={1.5} />
      </span>

      <Css>{`
        /* Nur der Ring dreht sich, das Herz in der Mitte steht still.
           WICHTIG: hier steht bewusst KEIN "position" fuer .cura-seal. Diese
           Regel liegt (wie jedes <Css>-Element) ausserhalb jedes CSS-Layers,
           Tailwinds Utilities (u.a. "absolute") stecken aber in
           "@layer utilities". Nach der Cascade-Layers-Spezifikation schlaegt
           JEDE nicht geschichtete Regel JEDE geschichtete Regel — unabhaengig
           von Spezifitaet. Ein hier gesetztes "position: relative" wuerde
           das von HomePage.tsx per className uebergebene "absolute" also
           IMMER ueberstimmen, das Siegel bliebe faelschlich position:relative
           und wuerde nicht mehr hinter dem Bildrahmen verschwinden. Die
           Positionierung kommt daher ausschliesslich aus dem className-Prop
           (Default-Fallback "relative" oben im JSX). */
        .cura-seal { pointer-events: none; }
        .cura-seal__ring { animation: curaSealSpin 30s linear infinite; will-change: transform; }
        @keyframes curaSealSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cura-seal__ring { animation: none; }
        }
      `}</Css>
    </div>
  );
}
