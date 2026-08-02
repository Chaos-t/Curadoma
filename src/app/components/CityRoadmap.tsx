// Scroll-driven roadmap. Two hand-drawn serpentine SVG paths (one per
// operational hub: Hameln + Paderborn) snake through their respective
// cities. A Car icon follows the path as the user scrolls past the
// section — when the section reaches the top of the viewport, the car
// is at the start; when the section's bottom passes the top of the
// viewport, the car is at the last city.
//
// Mobile (< 768px): the SVG paths are replaced by a clean vertical
// timeline. Curving snake-paths look great on desktop and unreadable
// on a narrow phone, so we deliberately ship two layouts.

import { useEffect, useRef, useState } from "react";
import { Car, MapPin } from "lucide-react";
import { Editable } from "./editor/Editable";
import { Css } from "./Css";

const jakarta = { fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif" };

// Dekorative Landkarte hinter der Route. Bewusst STATISCH — die Bewegung
// liefert allein das scrollgesteuerte Auto.
//
// Bewusst NICHT editierbar (Entscheidung des Betreibers, s. §3.4 der Spec):
// die Routen-Grafik liegt lückenlos über der Karte, sodass im Bearbeitungs-
// modus nirgends eine Klickfläche zum Austauschen frei bleibt — und
// EditableImage haengt im Bearbeitungsmodus zusaetzlich role="button"
// tabIndex={0} an ein Element, das gleichzeitig aria-hidden="true" traegt
// (fokussierbar, aber fuer Screenreader stumm). Ein simples <img> vermeidet
// beides.
//
// Bei Paderborn wird dieselbe Datei gespiegelt gezeigt: Das liest sich als
// zweite Gegend, kostet aber keine zusätzlichen Bytes.
const KARTE = "/karte-einzugsgebiet.webp";

function RouteMap({ idBase }: { idBase: string }) {
  return (
    <img
      src={KARTE}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      className={`cura-route-map absolute inset-0 w-full h-full object-cover ${idBase === "paderborn" ? "scale-x-[-1] object-[60%_50%]" : "object-[40%_50%]"}`}
    />
  );
}

type Route = {
  /** Stable id prefix for the content editor (e.g. "hameln") */
  idBase: string;
  /** Localised label */
  label: string;
  /** Hub city, displayed as the anchor */
  hub: string;
  /** SVG viewBox dimensions */
  vbWidth: number;
  vbHeight: number;
  /** Serpentine path commands, drawn in viewBox coords */
  pathD: string;
  /** Ordered list of city names placed along the path */
  cities: string[];
};

const HAMELN_ROUTE: Route = {
  idBase: "hameln",
  label: "Tour Hameln",
  hub: "Hameln",
  vbWidth: 800,
  vbHeight: 1900,
  // S-curve cascading down the column. Four full swings so the 12
  // angefahrene Orte sit along an aesthetically curving spine.
  pathD: [
    "M 400,60",
    "C 660,180 140,320 400,460",
    "C 660,600 140,740 400,880",
    "C 660,1020 140,1160 400,1300",
    "C 660,1440 140,1580 400,1720",
    "C 540,1800 400,1860 400,1860",
  ].join(" "),
  cities: [
    "Hameln",
    "Afferde/Hastenbeck",
    "Tündern/Emmerthal",
    "Hessisch Oldendorf/Fischbeck",
    "Klein Berkel/Groß Berkel",
    "Aerzen",
    "Sünteltal",
    "Bad Münder/Altenhagen",
    "Springe",
    "Völksen",
    "Bennigsen",
    "Gehrden",
  ],
};

const PADERBORN_ROUTE: Route = {
  idBase: "paderborn",
  label: "Tour Paderborn",
  hub: "Paderborn",
  vbWidth: 800,
  vbHeight: 1440,
  // Three full swings down the column for the 8 angefahrene Orte.
  pathD: [
    "M 400,60",
    "C 660,180 140,320 400,460",
    "C 660,600 140,740 400,880",
    "C 660,1020 140,1160 400,1300",
    "C 540,1370 400,1420 400,1420",
  ].join(" "),
  cities: [
    "Paderborn",
    "Delbrück",
    "Geseke",
    "Salzkotten",
    "Thüle",
    "Wewer",
    "Borchen",
    "Wewelsburg",
  ],
};

const ROUTES: Route[] = [HAMELN_ROUTE, PADERBORN_ROUTE];

/** Hook: returns scroll progress 0..1 of the element through the viewport.
 *  0 = element's top is at the viewport bottom (about to enter)
 *  1 = element's bottom is at the viewport top (just left)
 *  Uses passive scroll listener + rAF to coalesce updates. */
function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const compute = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      // Total scroll distance from "just entering" to "just left"
      const total = rect.height + vh;
      // How far we've traveled along that range
      const traveled = vh - rect.top;
      const p = Math.max(0, Math.min(1, traveled / total));
      setProgress(p);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return { ref, progress };
}

/** Hook: tracks whether viewport width < breakpoint.
 *
 *  WICHTIG: Der Startwert ist bewusst IMMER `false`, obwohl im Browser die
 *  Breite bekannt waere. Seit die Seiten beim Build vorab gerendert werden
 *  (SSG), rendert der Server ohne `window` — also die Desktop-Variante. Laese
 *  der Client hier beim ERSTEN Rendern schon die echte Breite, entstuende bei
 *  schmalen Fenstern ein anderer Baum als im ausgelieferten HTML: React bricht
 *  die Hydration ab (Fehler #418) und baut die Seite komplett neu auf.
 *  Deshalb erst NACH dem Mounten im Effekt auf den echten Wert wechseln. */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    onResize(); // direkt nach der Hydration den echten Wert uebernehmen
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
}

/** Desktop variant: an SVG serpentine path with the car following it
 *  based on scroll progress. */
function RouteSnake({ route, progress }: { route: Route; progress: number }) {
  const pathRef = useRef<SVGPathElement | null>(null);
  // Stop positions, computed once the path is in the DOM.
  const [stops, setStops] = useState<{ x: number; y: number }[]>([]);
  const [carPt, setCarPt] = useState<{ x: number; y: number; angle: number }>({
    x: 400, y: 60, angle: 0,
  });

  // Re-sample the path on mount (and on route change). Stops are
  // evenly spaced along the curve so even an asymmetric path stays
  // readable.
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    const n = route.cities.length;
    const pts = Array.from({ length: n }, (_, i) => {
      const len = ((i + 0.5) / n) * total;
      const p = path.getPointAtLength(len);
      return { x: p.x, y: p.y };
    });
    setStops(pts);
  }, [route]);

  // Update the car position whenever scroll progress changes.
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    // Car travels through 80% of the path window (10% lead-in, 10% lead-out)
    // so the entire animation reads while the section is comfortably in view.
    const eased = Math.max(0, Math.min(1, (progress - 0.1) / 0.8));
    const len = eased * total;
    const pt = path.getPointAtLength(len);
    // Heading = angle from a small sample before to a small sample after
    const eps = Math.max(2, total * 0.005);
    const before = path.getPointAtLength(Math.max(0, len - eps));
    const after = path.getPointAtLength(Math.min(total, len + eps));
    const angle = (Math.atan2(after.y - before.y, after.x - before.x) * 180) / Math.PI;
    setCarPt({ x: pt.x, y: pt.y, angle });
  }, [progress, route]);

  const { vbWidth, vbHeight, pathD, cities } = route;

  return (
    <div className="relative w-full max-w-[460px] mx-auto" style={{ aspectRatio: `${vbWidth} / ${vbHeight}` }}>
      <RouteMap idBase={route.idBase} />
      <svg
        viewBox={`0 0 ${vbWidth} ${vbHeight}`}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        {/* Die Strecke, zweilagig gezeichnet.
            Problem: Seit die Landkarte dahinter liegt, verschwand die Linie. Gemessen
            hatte das alte #BFEAF2 gegen die Huegel der Karte nur 1,18 Kontrast — beide
            im selben blassen Mint. Einfach nachzudunkeln waere falsch, weil die Linie
            dann dunkler waere als die besuchten Haltepunkte (#6FD3D1) und die
            Rangfolge Strasse < Haltepunkt < Auto (#0F7C77) kippen wuerde.
            Loesung wie auf echten Landkarten: eine helle Kontur UNTER der Linie. Sie
            gibt jedem Strich einen eigenen Untergrund, sodass die Strecke unabhaengig
            davon lesbar bleibt, ob sie gerade ueber einen Huegel oder eine freie
            Flaeche laeuft. Dieselbe Strichfolge, nur breiter — der Halo folgt exakt
            den Strichen statt ein durchgehendes Band zu ziehen.
            (Kein Kontrast-Thema im Sinne der Textregel: das ist eine Grafik.) */}
        <path
          d={pathD}
          fill="none"
          stroke="#F8FEFF"
          strokeWidth={9}
          strokeDasharray="9 8"
          strokeLinecap="round"
        />
        <path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke="#5BC2C0"
          strokeWidth={4}
          strokeDasharray="9 8"
          strokeLinecap="round"
        />

        {/* Stops along the road. Each stop "lights up" when the car is
            past it (progress threshold reached). */}
        {stops.map((s, i) => {
          const stopProgress = (i + 0.5) / cities.length;
          const eased = Math.max(0, Math.min(1, (progress - 0.1) / 0.8));
          const visited = eased >= stopProgress - 0.02;
          return (
            <g key={cities[i]}>
              {/* Outer ring */}
              <circle
                cx={s.x}
                cy={s.y}
                r={visited ? 14 : 10}
                fill={visited ? "rgba(111,211,209,0.25)" : "rgba(191,234,242,0.4)"}
                style={{ transition: "all 220ms ease-out" }}
              />
              {/* Inner dot */}
              <circle
                cx={s.x}
                cy={s.y}
                r={6}
                fill={visited ? "#6FD3D1" : "#ffffff"}
                stroke={visited ? "#6FD3D1" : "#BFEAF2"}
                strokeWidth={2}
                style={{ transition: "all 220ms ease-out" }}
              />
            </g>
          );
        })}
      </svg>

      {/* City labels — positioned absolutely in CSS to allow real text
          shaping. SVG <text> would also work but HTML keeps font
          inheritance and accessibility simple. */}
      {stops.map((s, i) => {
        const stopProgress = (i + 0.5) / cities.length;
        const eased = Math.max(0, Math.min(1, (progress - 0.1) / 0.8));
        const visited = eased >= stopProgress - 0.02;
        // Place label on the opposite side of the path centerline (400)
        const onLeft = s.x < vbWidth / 2;
        return (
          <div
            key={cities[i]}
            className="absolute pointer-events-none flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border text-[12px] font-medium tabular-nums shadow-sm max-w-[170px] leading-snug transition-all duration-300"
            style={{
              left: `${(s.x / vbWidth) * 100}%`,
              top: `${(s.y / vbHeight) * 100}%`,
              transform: onLeft
                ? "translate(calc(-100% - 16px), -50%)"
                : "translate(16px, -50%)",
              borderColor: visited ? "#6FD3D1" : "#E5F4F5",
              color: visited ? "#111111" : "#5F6B73",
              boxShadow: visited
                ? "0 10px 22px rgba(111,211,209,0.28)"
                : "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <span className="text-[10px] text-[#5F6B73]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="w-px h-3 bg-[#E5F4F5]" />
            <MapPin size={12} className={visited ? "text-[#6FD3D1]" : "text-[#9AA3A8]"} />
            <Editable as="span" id={`einzugsgebiet.roadmap.${route.idBase}.city.${i}`} className="pointer-events-auto">{cities[i]}</Editable>
          </div>
        );
      })}

      {/* The car — positioned by converting SVG coords to % of the
          wrapper. CSS transform handles centring + rotation. */}
      <div
        className="absolute pointer-events-none flex items-center justify-center w-10 h-10 rounded-full bg-[#0F7C77] text-white shadow-[0_10px_28px_rgb(111,211,209,0.45)] transition-transform duration-100 ease-linear"
        style={{
          left: `${(carPt.x / vbWidth) * 100}%`,
          top: `${(carPt.y / vbHeight) * 100}%`,
          transform: `translate(-50%, -50%) rotate(${carPt.angle}deg)`,
        }}
        aria-hidden="true"
      >
        <Car size={18} strokeWidth={1.8} />
      </div>
    </div>
  );
}

/** Mobile variant: a plain vertical timeline with the cities listed
 *  down the page. Car progress is mapped to which stop is "active". */
function RouteTimelineMobile({ route, progress }: { route: Route; progress: number }) {
  const eased = Math.max(0, Math.min(1, (progress - 0.1) / 0.8));
  const activeIdx = Math.floor(eased * route.cities.length);

  return (
    <div className="relative">
      <RouteMap idBase={route.idBase} />
      <ol className="relative max-w-md mx-auto pl-12">
      {/* Strasse und Auto sind Deko, gehoeren aber in ein <li>: in <ol> sind nur
          <li> als Kinder erlaubt. `contents` laesst das li selbst keine Box
          erzeugen, damit bleibt das <ol> der Bezugsrahmen fuer die absolute
          Positionierung und die Geometrie aendert sich nicht. */}
      <li className="contents" aria-hidden="true">
        {/* Strasse. Gleiche Logik wie beim Desktop-Pfad: eine helle Kontur
            dahinter, damit die Linie auch dort lesbar bleibt, wo sie ueber
            einen Huegel der Karte laeuft. */}
        <span
          className="absolute top-2 bottom-2 left-[16px] w-[6px] bg-[#F8FEFF] rounded-full"
        />
        <span
          className="absolute top-2 bottom-2 left-[18px] w-0 border-l-2 border-dashed border-[#5BC2C0]"
        />
        {/* Car: vertical position tied to eased progress */}
        <span
          className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-[#0F7C77] text-white shadow-[0_8px_20px_rgb(111,211,209,0.4)] transition-all duration-150 ease-linear z-10"
          style={{
            left: "18px",
            top: `calc(${eased * 100}% + ${(1 - eased) * 8 - eased * 8}px)`,
          }}
        >
          <Car size={16} strokeWidth={1.8} />
        </span>
      </li>

      {route.cities.map((c, i) => {
        const visited = i <= activeIdx;
        return (
          <li
            key={c}
            className="relative py-3 flex items-center gap-3"
            style={{ minHeight: 48 }}
          >
            <span
              className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-colors"
              style={{
                left: "-30px",
                top: "50%",
                background: visited ? "#6FD3D1" : "#ffffff",
                boxShadow: visited
                  ? "0 0 0 3px rgba(111,211,209,0.3)"
                  : "0 0 0 3px #BFEAF2",
              }}
              aria-hidden="true"
            />
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border text-[13px] font-medium transition-all ${
                visited
                  ? "border-[#6FD3D1] text-[#111111] shadow-[0_8px_18px_rgb(111,211,209,0.22)]"
                  : "border-[#E5F4F5] text-[#5F6B73]"
              }`}
            >
              <span className="text-[10px] text-[#5F6B73] tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <MapPin
                size={12}
                className={visited ? "text-[#6FD3D1]" : "text-[#9AA3A8]"}
              />
              <Editable as="span" id={`einzugsgebiet.roadmap.${route.idBase}.city.${i}`}>{c}</Editable>
            </span>
          </li>
        );
      })}
      </ol>
    </div>
  );
}

function SingleRoute({ route }: { route: Route }) {
  const { ref, progress } = useScrollProgress<HTMLDivElement>();
  const isMobile = useIsMobile();

  return (
    <div ref={ref} className="relative">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-[11px] font-medium text-[#0E6E6A] uppercase tracking-wider mb-3">
          <Car size={14} strokeWidth={1.7} />
          <Editable as="span" id={`einzugsgebiet.roadmap.${route.idBase}.label`}>{route.label}</Editable>
        </div>
        <h3
          className="text-2xl font-medium tracking-tight text-[#111111]"
          style={jakarta}
        >
          Strecke ab Station <span className="text-[#0F7C77]"><Editable as="span" id={`einzugsgebiet.roadmap.${route.idBase}.hub`}>{route.hub}</Editable></span>
        </h3>
        <p className="text-sm text-[#5F6B73] font-light mt-1">
          {route.cities.length} Orte werden regelmäßig angefahren
        </p>
      </div>

      {isMobile ? (
        <RouteTimelineMobile route={route} progress={progress} />
      ) : (
        <RouteSnake route={route} progress={progress} />
      )}
    </div>
  );
}

export function CityRoadmap() {
  return (
    <>
      <section className="relative w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-10">
          {ROUTES.map((r) => (
            <SingleRoute key={r.hub} route={r} />
          ))}
        </div>
      </section>

      <Css>{`
        /* Deckkraft per Media-Query, NICHT per JS-Breakpoint: Die Seiten
           werden vorab gerendert, ein abweichender Erstrender im Client
           bricht die Hydration. Mobil schwächer, damit die Ortsschildchen
           auf schmalen Displays klar bleiben. */
        .cura-route-map {
          opacity: 0.3;
          -webkit-mask-image: linear-gradient(to bottom, transparent, #000 6%, #000 94%, transparent);
                  mask-image: linear-gradient(to bottom, transparent, #000 6%, #000 94%, transparent);
        }
        @media (min-width: 768px) {
          .cura-route-map { opacity: 0.45; }
        }
      `}</Css>
    </>
  );
}
