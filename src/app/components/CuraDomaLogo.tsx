import monogramImg from "../../imports/cura-doma-logo.png";

type Props = {
  className?: string;
  showTagline?: boolean;
  monogramOnly?: boolean;
  /** Play a one-time elegant "draw-in" reveal on mount. Used in the
   *  sticky header for a first-impression flourish; left off for the
   *  footer so it doesn't replay on every load far down the page. */
  animate?: boolean;
};

const TEAL = "#6FBDB8";
const TAGLINE = "#9AA3A8";

// Flowing calligraphic script for the wordmark — elegant, hand-written
// feel. Loaded via Google Fonts in src/styles/fonts.css. Connected
// scripts must NOT have letter-spacing (it breaks the joining strokes).
const WORDMARK_FONT = "'Great Vibes', 'Pinyon Script', cursive";

export function CuraDomaLogo({
  className,
  showTagline = true,
  monogramOnly = false,
  animate = false,
}: Props) {
  if (monogramOnly) {
    return (
      <img
        src={monogramImg}
        alt="Cura Doma"
        className={className}
        style={{ objectFit: "contain", mixBlendMode: "multiply" }}
      />
    );
  }

  return (
    <div
      className={`cura-logo inline-flex items-center gap-3 ${animate ? "cura-logo--animate" : ""} ${className ?? ""}`}
    >
      <img
        src={monogramImg}
        alt=""
        aria-hidden="true"
        className="cura-logo__mark h-full w-auto object-contain shrink-0"
        style={{ mixBlendMode: "multiply" }}
      />
      <div className="flex flex-col justify-center leading-none">
        <span
          className="cura-logo__wordmark"
          style={{
            fontFamily: WORDMARK_FONT,
            fontWeight: 400,
            color: TEAL,
            fontSize: "2.3em",
            letterSpacing: "normal",
            lineHeight: 1.05,
          }}
        >
          Cura Doma
        </span>
        {showTagline && (
          <span
            className="cura-logo__tagline"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              color: TAGLINE,
              fontSize: "0.42em",
              letterSpacing: "0.32em",
              marginTop: "0.6em",
              textTransform: "uppercase",
            }}
          >
            Ambulanter Betreuungsdienst
          </span>
        )}
      </div>

      <style>{`
        /* Wordmark appears to be "written" left-to-right */
        @keyframes curaLogoDraw {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0 0 0); }
        }
        @keyframes curaLogoMarkIn {
          from { opacity: 0; transform: scale(0.88) rotate(-5deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes curaLogoFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cura-logo--animate .cura-logo__mark {
          animation: curaLogoMarkIn 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .cura-logo--animate .cura-logo__wordmark {
          animation: curaLogoDraw 950ms cubic-bezier(0.65, 0, 0.35, 1) 180ms both;
        }
        .cura-logo--animate .cura-logo__tagline {
          animation: curaLogoFadeIn 700ms ease-out 820ms both;
        }
        @media (prefers-reduced-motion: reduce) {
          .cura-logo--animate .cura-logo__mark,
          .cura-logo--animate .cura-logo__wordmark,
          .cura-logo--animate .cura-logo__tagline {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
