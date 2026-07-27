import { Css } from "./Css";
// Global animated page background — ein weicher, langsam driftender Türkis-
// Lichtschleier hinter allen Sektionen. Fixed zum Viewport (z-0), Inhalts-
// bereiche liegen auf halbtransparenten Flächen, sodass die Bewegung im Hero
// am stärksten und sonst nur zart durchscheint.
//
// WARUM CSS UND NICHT WebGL (2026-07-27):
// Vorher lief hier ein raymarched Fragment-Shader über three.js. Gemessen mit
// Lighthouse gegen die Live-Seite:
//   LightPillar.js  40.773 ms gesamt — davon nur 290 ms JavaScript.
//   Hauptthread „Other": 41.061 ms · Total Blocking Time 22.440 ms · TTI 44,6 s
// Die Kosten waren also NICHT das Skript, sondern das Rendern selbst: ohne
// schnelle GPU fällt WebGL auf Software-Rasterisierung zurück (Lighthouse,
// aber genauso ältere/schwache Geräte — also genau die Zielgruppe dieser
// Seite). Ein ganzflächiger Raymarch kostet dort Hunderte ms PRO BILD.
//
// WARUM KEIN JS-BREAKPOINT MEHR:
// Die Mobil-Abstimmung lief früher über window.innerWidth. Seit die Seiten beim
// Build vorab gerendert werden (SSG), kennt der Server die Fensterbreite nicht —
// der Client hätte beim ersten Rendern etwas anderes erzeugt als das
// ausgelieferte HTML (React-Fehler #418, Hydration-Mismatch). Die Abstimmung
// läuft deshalb rein über eine CSS-Media-Query: identisches Markup auf Server
// und Client, und ganz ohne Re-Render.
//
// Animiert wird ausschließlich `transform` — das läuft auf dem Compositor und
// belastet den Hauptthread praktisch nicht. `prefers-reduced-motion` stoppt sie.

export function BackgroundScene() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Grundfläche */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #FBFEFE 0%, #F4FBFC 50%, #F8FEFF 100%)" }}
      />

      {/* Lichtschleier: zwei sehr große, weiche Verläufe, die langsam
          gegeneinander driften. */}
      <div className="cura-bg-layer cura-bg-layer--a" />
      <div className="cura-bg-layer cura-bg-layer--b" />

      <Css>{`
        .cura-bg-layer {
          position: absolute;
          top: 50%;
          left: 50%;
          /* Desktop-Abstimmung; die Media-Query unten uebernimmt fuers Handy. */
          --tilt: 18deg;
          --size: 150vmax;
          width: var(--size);
          height: var(--size);
          margin-top: calc(var(--size) / -2);
          margin-left: calc(var(--size) / -2);
          will-change: transform;
          transform: rotate(var(--tilt));
        }
        /* Schmales Hochformat: steiler und breiter, damit der Schleier als
           vertikale Spur liest (wie zuvor beim WebGL-Verlauf). */
        @media (max-width: 767px) {
          .cura-bg-layer { --tilt: 34deg; --size: 190vmax; }
        }
        .cura-bg-layer--a {
          background:
            radial-gradient(closest-side ellipse at 50% 42%,
              rgba(91, 198, 195, 0.30) 0%,
              rgba(123, 214, 210, 0.16) 38%,
              rgba(191, 234, 242, 0.07) 62%,
              rgba(248, 254, 255, 0) 78%);
          animation: curaBgDriftA 38s ease-in-out infinite alternate;
        }
        .cura-bg-layer--b {
          background:
            radial-gradient(closest-side ellipse at 46% 58%,
              rgba(191, 234, 242, 0.26) 0%,
              rgba(111, 211, 209, 0.13) 45%,
              rgba(248, 254, 255, 0) 74%);
          animation: curaBgDriftB 52s ease-in-out infinite alternate;
        }
        @keyframes curaBgDriftA {
          from { transform: rotate(var(--tilt)) translate3d(-6%, -3%, 0) scale(1);    }
          to   { transform: rotate(var(--tilt)) translate3d( 7%,  4%, 0) scale(1.12); }
        }
        @keyframes curaBgDriftB {
          from { transform: rotate(calc(var(--tilt) * -1)) translate3d( 5%,  4%, 0) scale(1.08); }
          to   { transform: rotate(calc(var(--tilt) * -1)) translate3d(-6%, -5%, 0) scale(0.96); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cura-bg-layer { animation: none; }
        }
      `}</Css>
    </div>
  );
}
