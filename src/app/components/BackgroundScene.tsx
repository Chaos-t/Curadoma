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
import { useEffect, useState } from "react";
import LightPillar from "./LightPillar";

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
      {/* Soft teal light-pillar trail across the whole page */}
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
    </div>
  );
}
