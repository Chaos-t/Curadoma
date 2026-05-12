// Calm wave background — six soft SVG sine-curves layered at different
// heights, each drifting horizontally at its own slow speed (parallax-
// like). The result reads as quiet pastel ripples — "wellig und ruhig"
// per the user's request.
//
// Why SVG and not CSS gradient blobs:
//   - Real wave SHAPES are what makes the scene feel like water /
//     ribbons of silk, not just tinted air.
//   - Each <path> is 2× viewport wide, animation translates it -50%
//     so the loop is mathematically seamless.
//
// Mobile: same effect, but with reduced wave count + lower blur — GPU
// budget on old Android phones is tight.

const WAVES = [
  // Soft sky teal — top, faint
  { top: "6%",  height: 280, fillId: "cura-wave-teal",     opacity: 0.55, blur: 6,  duration: 38, dir: 1, amplitude: 1.0 },
  // Mint — upper middle
  { top: "24%", height: 240, fillId: "cura-wave-mint",     opacity: 0.5,  blur: 8,  duration: 52, dir: -1, amplitude: 0.9 },
  // Lavender — centre
  { top: "42%", height: 260, fillId: "cura-wave-lavender", opacity: 0.45, blur: 10, duration: 64, dir: 1, amplitude: 1.1 },
  // Cream / blush — lower middle
  { top: "60%", height: 240, fillId: "cura-wave-blush",    opacity: 0.45, blur: 9,  duration: 46, dir: -1, amplitude: 0.85 },
  // Soft sage — lower
  { top: "76%", height: 260, fillId: "cura-wave-sage",     opacity: 0.5,  blur: 7,  duration: 58, dir: 1, amplitude: 1.0 },
];

// One canonical sine-ish curve, 2880 units wide (== 2× a 1440-wide
// reference viewport) so each wave can translateX(-50%) and loop
// seamlessly. The bottom of the path is filled so each wave appears
// as a "filled below the curve" band, not just a stroke.
function wavePathD(amplitude: number, height: number) {
  // peaks at y = 50 - amplitude*40, valleys at y = 50 + amplitude*40
  const peak = 50 - amplitude * 40;
  const valley = 50 + amplitude * 40;
  const baseline = height;
  return [
    `M 0,${peak}`,
    `C 480,${valley} 960,${peak} 1440,${valley}`,
    `S 2400,${peak} 2880,${valley}`,
    `L 2880,${baseline} L 0,${baseline} Z`,
  ].join(" ");
}

export function BackgroundScene() {
  return (
    <div className="cura-scene" aria-hidden="true">
      <div className="cura-scene-base" />

      {WAVES.map((w, i) => (
        <div
          key={i}
          className="cura-wave"
          style={{
            top: w.top,
            height: w.height,
            opacity: w.opacity,
            filter: `blur(${w.blur}px)`,
            animationName: w.dir > 0 ? "cura-wave-drift-r" : "cura-wave-drift-l",
            animationDuration: `${w.duration}s`,
          }}
        >
          <svg
            viewBox={`0 0 2880 ${w.height}`}
            preserveAspectRatio="none"
            width="200%"
            height="100%"
          >
            <defs>
              {/* One gradient per wave, defined inline so each <svg> is
                  self-contained and we don't depend on an outer
                  <defs>. The two stops give the wave a subtle vertical
                  shading — top a touch more saturated than bottom. */}
              <linearGradient id={`${w.fillId}-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={WAVE_COLORS[w.fillId][0]} />
                <stop offset="100%" stopColor={WAVE_COLORS[w.fillId][1]} />
              </linearGradient>
            </defs>
            <path d={wavePathD(w.amplitude, w.height)} fill={`url(#${w.fillId}-${i})`} />
          </svg>
        </div>
      ))}

      <style>{`
        .cura-scene {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .cura-scene-base {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, #FBFEFE 0%, #F4FBFC 50%, #F8FEFF 100%);
        }
        .cura-wave {
          position: absolute;
          left: 0;
          /* 200% width, animation moves it from 0 → -50% (or back),
             which puts the second copy of the sine pattern exactly
             where the first one started — seamless loop. */
          width: 200%;
          will-change: transform;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-direction: alternate;
        }
        @keyframes cura-wave-drift-r {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
        @keyframes cura-wave-drift-l {
          0%   { transform: translateX(-25%); }
          100% { transform: translateX(0); }
        }

        @media (max-width: 767px) {
          /* On phones the waves stay, but a touch crisper (less blur) to
             compensate for smaller paint area. */
          .cura-wave { filter: blur(5px) !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cura-wave { animation: none; }
        }
      `}</style>
    </div>
  );
}

// Per-wave gradient stops. Kept out of inline JSX so the wave map above
// stays readable.
const WAVE_COLORS: Record<string, [string, string]> = {
  "cura-wave-teal":     ["rgba(150, 215, 220, 0.85)", "rgba(150, 215, 220, 0.25)"],
  "cura-wave-mint":     ["rgba(195, 230, 215, 0.80)", "rgba(195, 230, 215, 0.22)"],
  "cura-wave-lavender": ["rgba(215, 215, 235, 0.78)", "rgba(215, 215, 235, 0.20)"],
  "cura-wave-blush":    ["rgba(255, 220, 220, 0.75)", "rgba(255, 220, 220, 0.20)"],
  "cura-wave-sage":     ["rgba(205, 225, 200, 0.80)", "rgba(205, 225, 200, 0.22)"],
};
