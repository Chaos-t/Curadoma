import { MapPin, Navigation, Clock, Car } from "lucide-react";
import type { CSSProperties } from "react";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

const cities = ["Hameln", "Springe", "Paderborn", "Bad Pyrmont", "Coppenbrügge", "Aerzen", "Salzhemmendorf", "Emmerthal", "Hessisch Oldendorf", "Bad Münder", "Detmold", "Höxter", "Umgebung"];

export function EinzugsgebietSection({ heading = true }: { heading?: boolean }) {
  return (
    <section className="py-24 bg-white/80 border-t border-[#E5F4F5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {heading && (
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#DFF7F8] text-[#6FD3D1] mb-4">
              <MapPin size={22} />
            </div>
            <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-4" style={jakarta}>
              Unser Einzugsgebiet
            </h2>
            <p className="text-[17px] text-[#5F6B73] font-light leading-relaxed">
              Unser Betreuungsdienst ist im Raum <strong>Springe, Hameln, Paderborn und Umgebung</strong> für Sie da. Wir bieten unsere Leistungen in zahlreichen Städten, Gemeinden und Ortsteilen der Region an, um eine wohnortnahe und verlässliche Betreuung sicherzustellen.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Hameln */}
          <div className="bg-white rounded-3xl border border-[#E5F4F5] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-[16/10] w-full overflow-hidden">
              <iframe
                title="Standort Hameln"
                src="https://www.google.com/maps?q=S%C3%BCntelhang+9%2C+31787+Hameln%2C+Germany&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="p-7">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#DFF7F8] text-[11px] font-medium text-[#6FD3D1] uppercase tracking-wider">
                  <Clock size={12} /> Aktiv
                </span>
              </div>
              <h3 className="text-xl font-medium text-[#111111] mb-2" style={jakarta}>Standort Hameln</h3>
              <p className="text-[15px] text-[#5F6B73] font-light mb-5">Süntelhang 9<br />31787 Hameln</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=S%C3%BCntelhang+9%2C+31787+Hameln%2C+Germany"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#6FD3D1] text-white hover:bg-[#5BC2C0] px-5 py-2.5 rounded-full text-sm font-normal transition-all shadow-sm"
                >
                  <Navigation size={16} /> Route ansehen
                </a>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=S%C3%BCntelhang+9%2C+31787+Hameln%2C+Germany"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-[#5F6B73] border border-[#E5F4F5] hover:bg-[#F8FEFF] px-5 py-2.5 rounded-full text-sm font-normal transition-all"
                >
                  <MapPin size={16} /> In Google Maps öffnen
                </a>
              </div>
            </div>
          </div>

          {/* Paderborn */}
          <div className="bg-white rounded-3xl border border-[#E5F4F5] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-[#DFF7F8] via-[#F8FEFF] to-[#BFEAF2]/40 flex items-center justify-center">
              <div className="text-center px-6">
                <MapPin size={36} className="text-[#6FD3D1] mx-auto mb-3" strokeWidth={1.3} />
                <div className="text-[#111111] font-medium" style={jakarta}>Paderborn</div>
                <div className="text-sm text-[#5F6B73] font-light mt-1">Karte folgt – Adresse wird in Kürze ergänzt.</div>
              </div>
            </div>
            <div className="p-7">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF5E5] text-[11px] font-medium text-[#C99A4A] uppercase tracking-wider">
                  <Clock size={12} /> Bald verfügbar
                </span>
              </div>
              <h3 className="text-xl font-medium text-[#111111] mb-2" style={jakarta}>Standort Paderborn</h3>
              <p className="text-[15px] text-[#5F6B73] font-light mb-5">
                Adresse folgt<br />33098 Paderborn (Region)
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  disabled
                  className="inline-flex items-center gap-2 bg-[#E5F4F5] text-[#9AAFB6] px-5 py-2.5 rounded-full text-sm font-normal cursor-not-allowed"
                >
                  <Navigation size={16} /> Route folgt
                </button>
                <a
                  href="/kontakt"
                  className="inline-flex items-center gap-2 bg-white text-[#5F6B73] border border-[#E5F4F5] hover:bg-[#F8FEFF] px-5 py-2.5 rounded-full text-sm font-normal transition-all"
                >
                  Anfrage senden
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap: a Car icon drives along a dashed road from town to town.
            Each stop pulses teal as the car arrives. */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-[11px] font-medium text-[#6FD3D1] uppercase tracking-wider">
            <Car size={14} strokeWidth={1.7} />
            Unsere Tour durch die Region
          </div>
        </div>

        <ol
          className="cura-roadmap relative mx-auto max-w-3xl pt-2 pb-4"
          style={{ "--n": cities.length } as CSSProperties}
        >
          {/* Dashed road line down the middle (desktop) / left (mobile) */}
          <span className="cura-roadmap-line" aria-hidden="true" />

          {/* Moving car */}
          <span
            className="cura-roadmap-car shadow-[0_10px_28px_rgb(111,211,209,0.45)]"
            aria-hidden="true"
          >
            <Car size={18} strokeWidth={1.8} />
          </span>

          {cities.map((c, i) => (
            <li
              key={c}
              className={`cura-roadmap-stop ${i % 2 === 0 ? "is-left" : "is-right"}`}
              style={{ "--i": i } as CSSProperties}
            >
              <div className="cura-roadmap-card inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5F4F5] shadow-sm">
                <span className="text-[11px] font-medium tabular-nums text-[#9AA3A8] tracking-wider">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="w-px h-3 bg-[#E5F4F5]" aria-hidden="true" />
                <MapPin size={14} className="text-[#6FD3D1]" />
                <span className="text-sm font-medium text-[#5F6B73]">{c}</span>
              </div>
              <span className="cura-roadmap-dot" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </div>

      <style>{`
        .cura-roadmap {
          --cycle: 18s;
          --car-size: 40px;
          list-style: none;
          padding-inline-start: 0;
        }

        /* Dashed road */
        .cura-roadmap-line {
          position: absolute;
          top: 0; bottom: 0;
          width: 0;
          border-left: 2px dashed #BFEAF2;
          z-index: 0;
        }

        /* Stop dot — anchored to the road */
        .cura-roadmap-dot {
          position: absolute;
          top: 50%;
          width: 14px; height: 14px;
          border-radius: 9999px;
          background: #ffffff;
          box-shadow: 0 0 0 3px #BFEAF2;
          z-index: 2;
          transform: translate(-50%, -50%);
        }

        /* The moving car */
        .cura-roadmap-car {
          position: absolute;
          top: 0;
          width: var(--car-size);
          height: var(--car-size);
          border-radius: 9999px;
          background: #6FD3D1;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
          opacity: 0;
          transform: translate(-50%, -50%);
          animation: curaCarTravel var(--cycle) linear infinite;
        }

        /* Stop pulse — fires when car arrives at that stop */
        .cura-roadmap-dot {
          animation: curaStopPulse var(--cycle) linear infinite;
          animation-delay: calc((var(--i) + 0.5) / var(--n) * var(--cycle));
        }
        .cura-roadmap-card {
          animation: curaCardPulse var(--cycle) linear infinite;
          animation-delay: calc((var(--i) + 0.5) / var(--n) * var(--cycle));
          will-change: transform, box-shadow;
        }

        /* Each stop's dot anchors to the road, so its 'left' lives with the
           road definitions below. The card just flows in normal text-align. */
        .cura-roadmap-stop { position: relative; display: block; }
        .cura-roadmap-stop + .cura-roadmap-stop { margin-top: 14px; }

        /* Mobile: road on the left, single column, dots on the left edge */
        .cura-roadmap-line { left: 22px; }
        .cura-roadmap-car  { left: 22px; }
        .cura-roadmap-dot  { left: 22px; }
        .cura-roadmap-stop.is-left,
        .cura-roadmap-stop.is-right {
          padding: 6px 0 6px 56px;
          text-align: left;
        }

        /* Desktop ≥ 768px: zig-zag, road in the middle */
        @media (min-width: 768px) {
          .cura-roadmap-line { left: 50%; }
          .cura-roadmap-car  { left: 50%; }
          .cura-roadmap-dot  { left: 50%; }
          .cura-roadmap-stop + .cura-roadmap-stop { margin-top: 18px; }
          .cura-roadmap-stop.is-left {
            padding: 6px calc(50% + 32px) 6px 0;
            text-align: right;
          }
          .cura-roadmap-stop.is-right {
            padding: 6px 0 6px calc(50% + 32px);
            text-align: left;
          }
        }

        /* Car keyframes: fade in near first stop, linear to last stop, fade out.
           Linear region (4%–96%) maps the car's top position to time, so the
           car center is at stop i exactly when t = (i + 0.5)/N * cycle.        */
        @keyframes curaCarTravel {
          0%, 3%    { top: 4%;   opacity: 0; }
          4%        { top: 4%;   opacity: 1; }
          96%       { top: 96%;  opacity: 1; }
          97%, 100% { top: 96%;  opacity: 0; }
        }

        /* Stop dot pulse: peak at 0% of its (delayed) cycle = exact car arrival */
        @keyframes curaStopPulse {
          0% {
            background: #6FD3D1;
            box-shadow:
              0 0 0 4px rgba(111, 211, 209, 0.30),
              0 6px 18px rgba(111, 211, 209, 0.55);
            transform: translate(-50%, -50%) scale(1.55);
          }
          6% {
            background: #6FD3D1;
            box-shadow:
              0 0 0 14px rgba(111, 211, 209, 0),
              0 2px 10px rgba(111, 211, 209, 0.2);
            transform: translate(-50%, -50%) scale(1.2);
          }
          12%, 100% {
            background: #ffffff;
            box-shadow: 0 0 0 3px #BFEAF2;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        /* Card pulse: subtle lift + teal glow when car arrives */
        @keyframes curaCardPulse {
          0% {
            box-shadow:
              0 0 0 3px rgba(111, 211, 209, 0.25),
              0 14px 28px rgba(111, 211, 209, 0.28);
            transform: scale(1.03);
          }
          8% {
            box-shadow:
              0 0 0 0 rgba(111, 211, 209, 0),
              0 6px 14px rgba(111, 211, 209, 0.1);
            transform: scale(1.01);
          }
          14%, 100% {
            box-shadow: 0 1px 2px rgba(0,0,0,0.04);
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cura-roadmap-car { animation: none; opacity: 1; top: 50%; }
          .cura-roadmap-dot,
          .cura-roadmap-card { animation: none; }
        }
      `}</style>
    </section>
  );
}
