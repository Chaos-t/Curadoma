// Calm pseudo-3D background. Floating blurred orbs drift in depth space,
// giving the page a sense of dimension without becoming a focal point.
//
// No three.js / no canvas — pure CSS 3D transforms, so the runtime cost
// is GPU compositing only. Respects prefers-reduced-motion and trims
// itself on mobile (fewer orbs, lower blur) for budget devices.

import type { CSSProperties } from "react";

type Orb = {
  /** percentage left position */
  x: number;
  /** percentage top position */
  y: number;
  /** depth in px — more negative = further away */
  z: number;
  /** orb diameter in px (will be scaled by transform) */
  size: number;
  /** drift cycle in seconds */
  duration: number;
  /** start offset in seconds (negative so they begin mid-cycle) */
  delay: number;
  /** which hue: 'teal' (brand primary) or 'mint' (brand secondary) */
  hue: "teal" | "mint";
  /** drift travel in px on each axis (kept gentle) */
  dx: number;
  dy: number;
};

// Desktop layer: more orbs, fuller depth field.
const DESKTOP_ORBS: Orb[] = [
  { x: 12, y: 18, z: -400, size: 520, duration: 26, delay: -3,  hue: "teal", dx: 60,  dy: -40 },
  { x: 82, y: 22, z: -250, size: 380, duration: 32, delay: -10, hue: "mint", dx: -50, dy: 35  },
  { x: 30, y: 70, z: -180, size: 460, duration: 38, delay: -16, hue: "teal", dx: 45,  dy: -30 },
  { x: 70, y: 78, z: -350, size: 420, duration: 34, delay: -22, hue: "mint", dx: -40, dy: -45 },
  { x: 50, y: 45, z: -550, size: 600, duration: 44, delay: -8,  hue: "teal", dx: 30,  dy: 20  },
  { x: 95, y: 55, z: -120, size: 280, duration: 28, delay: -14, hue: "mint", dx: -35, dy: -25 },
];

// Mobile layer: 3 orbs only, lower blur, smaller drift — keeps the GPU
// budget low on phones (especially older Android).
const MOBILE_ORBS: Orb[] = [
  { x: 18, y: 22, z: -300, size: 340, duration: 28, delay: -5,  hue: "teal", dx: 35,  dy: -20 },
  { x: 80, y: 60, z: -200, size: 300, duration: 34, delay: -14, hue: "mint", dx: -30, dy: 25  },
  { x: 45, y: 88, z: -400, size: 380, duration: 40, delay: -22, hue: "teal", dx: 25,  dy: -15 },
];

function orbStyle(o: Orb): CSSProperties {
  return {
    left: `${o.x}%`,
    top: `${o.y}%`,
    width: o.size,
    height: o.size,
    // CSS custom props consumed by the keyframe (kept on the element
    // so each orb gets its own travel without per-orb keyframes).
    ["--z" as never]: `${o.z}px`,
    ["--dx" as never]: `${o.dx}px`,
    ["--dy" as never]: `${o.dy}px`,
    ["--dur" as never]: `${o.duration}s`,
    ["--delay" as never]: `${o.delay}s`,
  };
}

export function BackgroundScene() {
  return (
    <div className="cura-scene" aria-hidden="true">
      {/* Soft base gradient — replaces the old WaveBackground */}
      <div className="cura-scene-base" />

      {/* Depth field — desktop variant */}
      <div className="cura-scene-orbs cura-scene-orbs-desktop">
        {DESKTOP_ORBS.map((o, i) => (
          <span
            key={i}
            className={`cura-orb cura-orb-${o.hue}`}
            style={orbStyle(o)}
          />
        ))}
      </div>

      {/* Depth field — mobile variant */}
      <div className="cura-scene-orbs cura-scene-orbs-mobile">
        {MOBILE_ORBS.map((o, i) => (
          <span
            key={i}
            className={`cura-orb cura-orb-${o.hue}`}
            style={orbStyle(o)}
          />
        ))}
      </div>

      {/* Faint diagonal beam — adds depth without motion */}
      <div className="cura-scene-beam" />

      <style>{`
        .cura-scene {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
          perspective: 1200px;
          perspective-origin: 50% 50%;
        }
        .cura-scene-base {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, #FBFEFE 0%, #F4FBFC 50%, #F8FEFF 100%);
        }
        .cura-scene-beam {
          position: absolute;
          top: -20%;
          left: -30%;
          width: 160%;
          height: 60%;
          background: linear-gradient(120deg,
            rgba(255,255,255,0) 30%,
            rgba(191, 234, 242, 0.18) 50%,
            rgba(255,255,255,0) 70%);
          transform: rotate(-12deg);
          filter: blur(40px);
          opacity: 0.65;
        }

        .cura-scene-orbs {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
        }

        .cura-orb {
          position: absolute;
          border-radius: 9999px;
          /* Centred on its (x, y) anchor */
          translate: -50% -50%;
          /* z-depth is the only thing the 3D scene needs from each orb;
             the keyframe rotates + drifts it gently. */
          transform: translateZ(var(--z));
          filter: blur(70px);
          opacity: 0.55;
          will-change: transform;
          animation: cura-orb-drift var(--dur) ease-in-out infinite alternate;
          animation-delay: var(--delay);
        }
        .cura-orb-teal {
          background: radial-gradient(circle at 30% 30%,
            rgba(111, 211, 209, 0.55) 0%,
            rgba(111, 211, 209, 0.10) 55%,
            rgba(111, 211, 209, 0) 75%);
        }
        .cura-orb-mint {
          background: radial-gradient(circle at 40% 35%,
            rgba(191, 234, 242, 0.65) 0%,
            rgba(191, 234, 242, 0.10) 55%,
            rgba(191, 234, 242, 0) 75%);
        }

        @keyframes cura-orb-drift {
          0% {
            transform: translateZ(var(--z))
                       translate3d(0, 0, 0)
                       rotateX(0deg) rotateY(0deg);
          }
          100% {
            transform: translateZ(calc(var(--z) + 120px))
                       translate3d(var(--dx), var(--dy), 0)
                       rotateX(8deg) rotateY(-10deg);
          }
        }

        /* Show only the desktop orb set on >= 768px */
        .cura-scene-orbs-mobile { display: block; }
        .cura-scene-orbs-desktop { display: none; }
        @media (min-width: 768px) {
          .cura-scene-orbs-mobile { display: none; }
          .cura-scene-orbs-desktop { display: block; }
        }
        /* Mobile orbs: lower blur radius (cheaper) */
        @media (max-width: 767px) {
          .cura-orb { filter: blur(50px); opacity: 0.5; }
        }

        @media (prefers-reduced-motion: reduce) {
          .cura-orb { animation: none; }
        }
      `}</style>
    </div>
  );
}
