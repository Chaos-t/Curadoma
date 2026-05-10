import monogramImg from "../../imports/ChatGPT_Image_2._Mai_2026,_16_07_38.png";

type Props = {
  className?: string;
  showTagline?: boolean;
  monogramOnly?: boolean;
};

const TEAL = "#6FBDB8";
const TAGLINE = "#9AA3A8";

export function CuraDomaLogo({ className, showTagline = true, monogramOnly = false }: Props) {
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
    <div className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <img
        src={monogramImg}
        alt=""
        aria-hidden="true"
        className="h-full w-auto object-contain shrink-0"
        style={{ mixBlendMode: "multiply" }}
      />
      <div className="flex flex-col justify-center leading-none">
        <span
          style={{
            fontFamily: "'Lora', 'Cormorant Garamond', 'Times New Roman', serif",
            fontWeight: 400,
            color: TEAL,
            fontSize: "1.6em",
            letterSpacing: "0.01em",
            lineHeight: 1,
          }}
        >
          Cura Doma
        </span>
        {showTagline && (
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              color: TAGLINE,
              fontSize: "0.42em",
              letterSpacing: "0.32em",
              marginTop: "0.5em",
              textTransform: "uppercase",
            }}
          >
            Ambulanter Betreuungsdienst
          </span>
        )}
      </div>
    </div>
  );
}
