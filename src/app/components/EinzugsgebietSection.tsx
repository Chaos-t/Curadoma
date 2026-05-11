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

        {/* Tour Chips — a teal "spotlight" sweeps through the cities one by one,
            suggesting our team driving from town to town. */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-[11px] font-medium text-[#6FD3D1] uppercase tracking-wider">
            <Car size={14} strokeWidth={1.7} />
            Wir fahren regelmäßig zu Ihnen
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 py-2">
          {cities.map((c, i) => (
            <span
              key={c}
              className="cura-tour-chip inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-light shrink-0"
              style={{ "--i": i } as CSSProperties}
            >
              <MapPin size={14} className="cura-tour-pin" />
              <span className="cura-tour-label">{c}</span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .cura-tour-chip {
          /* idle baseline */
          background: #ffffff;
          border-color: #E5F4F5;
          color: #5F6B73;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
          transform: translateY(0) scale(1);
          will-change: transform, box-shadow, background-color, color;
          animation: curaCityVisit 7.8s linear infinite calc(var(--i) * 0.6s);
        }
        .cura-tour-chip .cura-tour-pin {
          color: #6FD3D1;
          animation: curaCityVisitPin 7.8s linear infinite calc(var(--i) * 0.6s);
        }

        @keyframes curaCityVisit {
          /* 0%: peak — team just arrived */
          0% {
            background: #6FD3D1;
            border-color: #6FD3D1;
            color: #ffffff;
            box-shadow:
              0 0 0 6px rgba(111, 211, 209, 0.22),
              0 12px 28px rgba(111, 211, 209, 0.38);
            transform: translateY(-4px) scale(1.06);
          }
          /* 7%: ring expands and fades — radar */
          7% {
            background: #6FD3D1;
            border-color: #6FD3D1;
            color: #ffffff;
            box-shadow:
              0 0 0 14px rgba(111, 211, 209, 0),
              0 6px 16px rgba(111, 211, 209, 0.18);
            transform: translateY(-2px) scale(1.03);
          }
          /* 14%: settled back to idle white */
          14%, 100% {
            background: #ffffff;
            border-color: #E5F4F5;
            color: #5F6B73;
            box-shadow: 0 1px 2px rgba(0,0,0,0.04);
            transform: translateY(0) scale(1);
          }
        }

        @keyframes curaCityVisitPin {
          0%, 7%    { color: #ffffff; transform: scale(1.15); }
          14%, 100% { color: #6FD3D1; transform: scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .cura-tour-chip,
          .cura-tour-chip .cura-tour-pin { animation: none; }
        }
      `}</style>
    </section>
  );
}
