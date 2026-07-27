import monogramImg from "../../imports/cura-doma-logo.webp";
import { Css } from "./Css";

type Props = {
  className?: string;
  showTagline?: boolean;
  monogramOnly?: boolean;
  /** Play a one-time elegant "draw-in" reveal on mount. Used in the
   *  sticky header for a first-impression flourish; left off for the
   *  footer so it doesn't replay on every load far down the page. */
  animate?: boolean;
};

const TEAL = "#0F7C77";
const TAGLINE = "#5F6B73";

// Cormorant — a high-contrast, spiky-serif display face (OFL, free for
// commercial use; loaded via Google Fonts in src/styles/fonts.css). A close,
// freely-usable stand-in for Khalos. Used only for the logo wordmark.
const WORDMARK_FONT = "'Cormorant', 'Cormorant Fallback', 'Cormorant Garamond', 'Times New Roman', serif";

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
        width={500}
        height={500}
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
        width={500}
        height={500}
        className="cura-logo__mark h-full w-auto object-contain shrink-0"
        style={{ mixBlendMode: "multiply" }}
      />
      <div className="flex flex-col justify-center leading-none">
        <span
          className="cura-logo__wordmark"
          style={{
            fontFamily: WORDMARK_FONT,
            fontWeight: 600,
            color: TEAL,
            fontSize: "2em",
            letterSpacing: "0.02em",
            lineHeight: 1.05,
          }}
        >
          <span className="cura-logo__wordmark-inner">Cura Doma</span>
        </span>
        {showTagline && (
          <span
            className="cura-logo__tagline"
            style={{
              fontFamily: "'Inter', 'Inter Fallback', sans-serif",
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

      <Css>{`
        /* Wordmark appears to be "written" left-to-right.
           Bewusst per transform statt clip-path: clip-path laeuft in Blink
           NICHT auf dem Compositor (Lighthouse: „Nicht zusammengesetzte
           Animationen vermeiden") und kostet auf jedem Frame Hauptthread-Zeit.
           Der aeussere Span clippt, der innere faehrt per translateX herein —
           optisch derselbe Wisch-Effekt, aber compositor-beschleunigt. */
        .cura-logo__wordmark { display: inline-block; overflow: hidden; }
        .cura-logo__wordmark-inner { display: inline-block; will-change: transform; }
        @keyframes curaLogoDraw {
          from { transform: translateX(-101%); }
          to   { transform: translateX(0); }
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
        .cura-logo--animate .cura-logo__wordmark-inner {
          animation: curaLogoDraw 950ms cubic-bezier(0.65, 0, 0.35, 1) 180ms both;
        }
        .cura-logo--animate .cura-logo__tagline {
          animation: curaLogoFadeIn 700ms ease-out 820ms both;
        }
        @media (prefers-reduced-motion: reduce) {
          .cura-logo--animate .cura-logo__mark,
          .cura-logo--animate .cura-logo__wordmark-inner,
          .cura-logo--animate .cura-logo__tagline {
            animation: none;
          }
        }
      `}</Css>
    </div>
  );
}
