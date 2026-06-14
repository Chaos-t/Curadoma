// Global animated page background — a light-mode "light pillar" trail that
// runs behind every section of the site. Fixed to the viewport (z-0), so as
// the page scrolls the soft teal streaks stay present everywhere. Content
// sections sit on semi-transparent backgrounds, so the animation shows
// strongest in transparent areas (e.g. the hero) and softly through the rest.
//
// History: we previously shipped a static gradient here (and, earlier still,
// three animated variants the user removed). The user has now explicitly
// asked for an animated background that spans the whole page.
import LightPillar from "./LightPillar";

export function BackgroundScene() {
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
        bottomColor="#2BB6B3"
        intensity={1.3}
        rotationSpeed={0.22}
        glowAmount={0.0024}
        pillarWidth={3.4}
        pillarHeight={0.4}
        noiseIntensity={0.25}
        pillarRotation={20}
        interactive={false}
        mixBlendMode="normal"
        quality="medium"
      />
    </div>
  );
}
