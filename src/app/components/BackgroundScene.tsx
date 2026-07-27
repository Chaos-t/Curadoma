// Global animated page background — ein weicher, langsam driftender Türkis-
// Lichtschleier hinter allen Sektionen. Fixed zum Viewport (z-0), Inhalts-
// bereiche liegen auf halbtransparenten Flächen, sodass die Bewegung im Hero
// am stärksten und sonst nur zart durchscheint.
//
// WARUM CSS UND NICHT MEHR WebGL (2026-07-27):
// Vorher lief hier ein raymarched Fragment-Shader über three.js. Gemessen mit
// Lighthouse gegen die Live-Seite:
//   LightPillar.js  40.773 ms gesamt — davon nur 290 ms JavaScript.
//   Hauptthread „Other": 41.061 ms · Total Blocking Time 22.440 ms · TTI 44,6 s
// Die Kosten waren also NICHT das Skript, sondern das Rendern selbst: ohne
// schnelle GPU fällt WebGL auf Software-Rasterisierung zurück (Lighthouse,
// aber genauso ältere/schwache Geräte — also genau die Zielgruppe dieser
// Seite). Ein ganzflächiger Raymarch kostet dort Hunderte ms PRO BILD; FPS
// deckeln half deshalb kaum.
//
// Diese Fassung nutzt nur `transform`-Animationen auf großen, weichen
// Farbverläufen: die laufen auf dem Compositor, belasten den Hauptthread
// praktisch nicht, brauchen kein three.js (~128 KB gzip weniger) und sehen auf
// JEDEM Gerät gleich aus. `prefers-reduced-motion` schaltet die Bewegung ab.
import { useEffect, useState } from "react";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === "undefined" ? false : window.innerWidth < breakpoint,
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
}

export function BackgroundScene() {
  const isMobile = useIsMobile();
  // Auf dem schmalen Hochformat wird der Schleier steiler und breiter gefahren
  // (wie zuvor beim WebGL-Verlauf), damit er als vertikale Spur liest.
  const tilt = isMobile ? 34 : 18;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Grundfläche */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #FBFEFE 0%, #F4FBFC 50%, #F8FEFF 100%)" }}
      />

      {/* Lichtschleier: zwei sehr große, weiche Verläufe, die langsam
          gegeneinander driften. Nur transform wird animiert. */}
      <div className="cura-bg-layer cura-bg-layer--a" style={{ ["--tilt" as string]: `${tilt}deg` }} />
      <div className="cura-bg-layer cura-bg-layer--b" style={{ ["--tilt" as string]: `${tilt}deg` }} />

      <style>{`
        .cura-bg-layer {
          position: absolute;
          top: 50%;
          left: 50%;
          width: ${isMobile ? "190vmax" : "150vmax"};
          height: ${isMobile ? "190vmax" : "150vmax"};
          margin-top: ${isMobile ? "-95vmax" : "-75vmax"};
          margin-left: ${isMobile ? "-95vmax" : "-75vmax"};
          will-change: transform;
          /* Nur transform animieren -> laeuft auf dem Compositor. */
          transform: rotate(var(--tilt));
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
      `}</style>
    </div>
  );
}
