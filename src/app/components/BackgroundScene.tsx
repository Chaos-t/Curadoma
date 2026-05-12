// Two-layer pseudo-3D background, tuned for visibility through the
// page's 80%-opaque section overlays.
//
// Layer 1 — Aurora mesh: five large pastel blobs (teal, mint, lavender,
// blush, sage) drift independently. Colours kept SOFT (pastel pal) so
// the mood stays calming, but ALPHA bumped up enough that the mood
// reads through the bg-white/80 sections that overlay them.
//
// Layer 2 — 3D wireframe sphere: a stack of latitude rings, all
// children of one 3D scene that slowly rotates. As the scene rotates
// in 3D, the rings sweep through tilt angles — the result reads as a
// transparent sphere spinning in space. Plus one wide orbit ring + one
// counter-rotating accent ring for variety.
//
// Mobile: rings/sphere hidden — perspective is wasted on narrow
// viewports and we save the GPU. The aurora layer stays, with reduced
// blur radius for older-device performance.
//
// No three.js / no canvas — pure CSS + GPU compositing only.

export function BackgroundScene() {
  return (
    <div className="cura-scene" aria-hidden="true">
      <div className="cura-scene-base" />

      {/* Aurora mesh layer */}
      <div className="cura-mesh">
        <span className="cura-blob blob-teal" />
        <span className="cura-blob blob-mint" />
        <span className="cura-blob blob-lavender" />
        <span className="cura-blob blob-blush" />
        <span className="cura-blob blob-sage" />
      </div>

      {/* 3D wireframe layer — desktop only */}
      <div className="cura-shapes">
        {/* Counter-rotating accent ring (top-right) */}
        <span className="cura-ring ring-accent-1" />

        {/* Wireframe "sphere" — six latitude rings of one scene */}
        <div className="cura-sphere">
          <span className="cura-sphere-ring r1" />
          <span className="cura-sphere-ring r2" />
          <span className="cura-sphere-ring r3" />
          <span className="cura-sphere-ring r4" />
          <span className="cura-sphere-ring r5" />
          <span className="cura-sphere-ring r6" />
        </div>

        {/* Wide orbit (bottom-left) */}
        <span className="cura-ring ring-accent-2" />
      </div>

      <style>{`
        .cura-scene {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
          perspective: 1600px;
          perspective-origin: 50% 50%;
        }
        .cura-scene-base {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, #FBFEFE 0%, #F4FBFC 50%, #F8FEFF 100%);
        }

        /* ----- Aurora mesh: soft pastel field, but saturated enough to
                survive an 80%-opaque section overlay sitting on top.   ----- */
        .cura-mesh { position: absolute; inset: 0; }
        .cura-blob {
          position: absolute;
          width: 760px;
          height: 760px;
          border-radius: 50%;
          filter: blur(56px);
          opacity: 0.62;
          will-change: transform;
        }
        /* Soft pastel palette — the section overlays are now /55 so we
           don't need to push saturation. Goal: visible-but-airy mood,
           not saturated tint. */
        .blob-teal {
          top: 6%; left: -10%;
          background: radial-gradient(circle at 35% 35%,
            rgba(160, 220, 225, 0.70) 0%,
            rgba(160, 220, 225, 0.28) 45%,
            rgba(160, 220, 225, 0) 78%);
          animation: cura-blob-1 42s ease-in-out infinite alternate;
        }
        .blob-mint {
          top: -8%; right: -6%;
          background: radial-gradient(circle at 50% 45%,
            rgba(195, 235, 215, 0.65) 0%,
            rgba(195, 235, 215, 0.25) 45%,
            rgba(195, 235, 215, 0) 78%);
          animation: cura-blob-2 56s ease-in-out infinite alternate;
        }
        .blob-lavender {
          top: 30%; left: 38%;
          width: 880px; height: 880px;
          background: radial-gradient(circle at 40% 50%,
            rgba(218, 218, 240, 0.62) 0%,
            rgba(218, 218, 240, 0.22) 50%,
            rgba(218, 218, 240, 0) 80%);
          animation: cura-blob-3 64s ease-in-out infinite alternate;
        }
        .blob-blush {
          bottom: 4%; right: -2%;
          background: radial-gradient(circle at 45% 50%,
            rgba(255, 222, 225, 0.55) 0%,
            rgba(255, 222, 225, 0.20) 48%,
            rgba(255, 222, 225, 0) 80%);
          animation: cura-blob-4 48s ease-in-out infinite alternate;
        }
        .blob-sage {
          bottom: -2%; left: 6%;
          background: radial-gradient(circle at 50% 45%,
            rgba(210, 230, 210, 0.62) 0%,
            rgba(210, 230, 210, 0.25) 45%,
            rgba(210, 230, 210, 0) 78%);
          animation: cura-blob-5 52s ease-in-out infinite alternate;
        }

        @keyframes cura-blob-1 {
          0%   { transform: translate3d(0, 0, 0) scale(1)   rotate(0deg); }
          100% { transform: translate3d(90px, 70px, 0) scale(1.10) rotate(20deg); }
        }
        @keyframes cura-blob-2 {
          0%   { transform: translate3d(0, 0, 0) scale(1)   rotate(0deg); }
          100% { transform: translate3d(-70px, 90px, 0) scale(1.13) rotate(-15deg); }
        }
        @keyframes cura-blob-3 {
          0%   { transform: translate3d(0, 0, 0) scale(1)   rotate(0deg); }
          100% { transform: translate3d(-80px, -50px, 0) scale(1.08) rotate(25deg); }
        }
        @keyframes cura-blob-4 {
          0%   { transform: translate3d(0, 0, 0) scale(1)   rotate(0deg); }
          100% { transform: translate3d(60px, -80px, 0) scale(1.12) rotate(-20deg); }
        }
        @keyframes cura-blob-5 {
          0%   { transform: translate3d(0, 0, 0) scale(1)   rotate(0deg); }
          100% { transform: translate3d(80px, -60px, 0) scale(1.10) rotate(15deg); }
        }

        /* ----- 3D wireframe layer ----- */
        .cura-shapes {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          display: none;
        }
        @media (min-width: 768px) {
          .cura-shapes { display: block; }
        }

        /* Accent rings — flank the viewport corners. Thicker stroke +
           inset highlight so they read as ribbons of light, not just
           outlined circles, through the section overlays. */
        .cura-ring {
          position: absolute;
          border-radius: 50%;
          transform-style: preserve-3d;
          will-change: transform;
          border: 4px solid rgba(111, 211, 209, 0.85);
          box-shadow:
            inset 0 0 36px rgba(111, 211, 209, 0.32),
            0 0 40px rgba(111, 211, 209, 0.35);
        }
        .ring-accent-1 {
          width: 500px; height: 500px;
          top: 14%; right: 2%;
          animation: cura-ring-1 60s linear infinite;
        }
        .ring-accent-2 {
          width: 380px; height: 380px;
          bottom: 16%; left: 3%;
          border-color: rgba(150, 200, 220, 0.82);
          box-shadow:
            inset 0 0 32px rgba(150, 200, 220, 0.28),
            0 0 36px rgba(150, 200, 220, 0.35);
          animation: cura-ring-2 78s linear infinite reverse;
        }
        @keyframes cura-ring-1 {
          0%   { transform: rotateX(72deg) rotateY(-8deg) rotateZ(0deg); }
          100% { transform: rotateX(72deg) rotateY(-8deg) rotateZ(360deg); }
        }
        @keyframes cura-ring-2 {
          0%   { transform: rotateX(64deg) rotateY(14deg) rotateZ(0deg); }
          100% { transform: rotateX(64deg) rotateY(14deg) rotateZ(360deg); }
        }

        /* ----- Wireframe sphere: a 3D scene of 6 latitude rings.
                The whole scene rotates; each ring is parallel to the
                "equator" but offset in Z, so the result reads as a
                ghost sphere slowly spinning. ----- */
        .cura-sphere {
          position: absolute;
          top: 50%; left: 50%;
          width: 460px; height: 460px;
          margin-top: -230px;
          margin-left: -230px;
          transform-style: preserve-3d;
          animation: cura-sphere-spin 70s linear infinite;
        }
        .cura-sphere-ring {
          position: absolute;
          left: 50%; top: 50%;
          width: 440px; height: 440px;
          margin-top: -220px;
          margin-left: -220px;
          border-radius: 50%;
          border: 2px solid rgba(120, 195, 205, 0.75);
          box-shadow: 0 0 18px rgba(120, 195, 205, 0.18);
          transform-style: preserve-3d;
        }
        /* Six rings, tilted on the X axis at increments so they form a
           sphere when seen through perspective. */
        .cura-sphere-ring.r1 { transform: rotateY(0deg)   rotateX(0deg);  }
        .cura-sphere-ring.r2 { transform: rotateY(30deg)  rotateX(0deg);  }
        .cura-sphere-ring.r3 { transform: rotateY(60deg)  rotateX(0deg);  }
        .cura-sphere-ring.r4 { transform: rotateY(90deg)  rotateX(0deg);  }
        .cura-sphere-ring.r5 { transform: rotateY(120deg) rotateX(0deg);  }
        .cura-sphere-ring.r6 { transform: rotateY(150deg) rotateX(0deg);  }

        @keyframes cura-sphere-spin {
          0%   { transform: rotateX(70deg) rotateY(0deg)   rotateZ(0deg); }
          50%  { transform: rotateX(60deg) rotateY(180deg) rotateZ(20deg); }
          100% { transform: rotateX(70deg) rotateY(360deg) rotateZ(0deg); }
        }

        /* ----- Mobile trim ----- */
        @media (max-width: 767px) {
          .cura-blob { filter: blur(38px); width: 500px; height: 500px; opacity: 0.72; }
          .blob-lavender { width: 580px; height: 580px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .cura-blob, .cura-ring, .cura-sphere { animation: none; }
        }
      `}</style>
    </div>
  );
}
