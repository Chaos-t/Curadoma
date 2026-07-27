// Global animated page background — a light-mode "light pillar" trail that
// runs behind every section of the site. Fixed to the viewport (z-0), so as
// the page scrolls the soft teal streaks stay present everywhere. Content
// sections sit on semi-transparent backgrounds, so the animation shows
// strongest in transparent areas (e.g. the hero) and softly through the rest.
//
// Mobile (< 768px) gets its own tuning: a narrow portrait viewport compresses
// the beam horizontally, so we soften it (lower intensity), widen it into more
// of a gentle wash, and steepen the angle so it reads as a vertical trail.
//
// History: we previously shipped a static gradient here (and, earlier still,
// three animated variants the user removed). The user has explicitly asked
// for an animated background that spans the whole page.
import { useEffect, useState, lazy, Suspense } from "react";

// three.js ist gross (~150 KB gzip) und treibt hier NUR den dekorativen
// Hintergrund. Deshalb wird der WebGL-Teil erst NACH dem ersten Rendern
// nachgeladen (dynamic import + Idle-Callback): der Hauptinhalt erscheint
// dadurch deutlich frueher, der Verlauf unten dient bis dahin als Flaeche.
const LightPillar = lazy(() => import("./LightPillar"));

/** True, sobald der Browser Leerlauf hat (bzw. nach kurzer Verzoegerung) —
 *  damit der Hintergrund nicht mit dem Hauptinhalt um Ladezeit konkurriert. */
function useDeferredMount(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Bei „weniger Bewegung" bleibt der animierte Hintergrund ganz aus.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let idleId: number | undefined;
    let timerId: number | undefined;
    const win = window as unknown as {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (h: number) => void;
    };

    // Erst wenn die Seite KOMPLETT geladen ist (Bilder/Schriften durch) und der
    // Browser danach Leerlauf hat, den dekorativen Hintergrund starten. So
    // konkurriert er nicht mit dem eigentlichen Inhalt um CPU und Bandbreite.
    const start = () => {
      if (win.requestIdleCallback) idleId = win.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      else timerId = window.setTimeout(() => setReady(true), 600);
    };

    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      window.removeEventListener("load", start);
      if (idleId !== undefined) win.cancelIdleCallback?.(idleId);
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, []);
  return ready;
}

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
  const showPillar = useDeferredMount();

  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      {/* Light gradient base — also the surface shown if WebGL is unavailable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #FBFEFE 0%, #F4FBFC 50%, #F8FEFF 100%)",
        }}
      />
      {/* Soft teal light-pillar trail across the whole page — erst nach dem
          ersten Rendern nachgeladen (siehe useDeferredMount oben). */}
      {showPillar && (
        <Suspense fallback={null}>
          <LightPillar
            lightMode
            topColor="#F8FEFF"
            bottomColor="#5BC6C3"
            intensity={isMobile ? 0.7 : 0.95}
            rotationSpeed={0.22}
            glowAmount={0.0024}
            pillarWidth={isMobile ? 4.8 : 3.4}
            pillarHeight={0.4}
            noiseIntensity={0.25}
            pillarRotation={isMobile ? 35 : 20}
            interactive={false}
            mixBlendMode="normal"
            quality="medium"
          />
        </Suspense>
      )}
    </div>
  );
}
