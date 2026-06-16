import { useEffect, useState } from "react";
import { MapPin, Navigation, Clock, Lock } from "lucide-react";
import { CityRoadmap } from "./CityRoadmap";
import { consent, requestReopenBanner } from "../../lib/consent";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

/** Render the Google-Maps embed only when the visitor has accepted
 *  external embeds. Otherwise show a click-to-load placeholder that
 *  explains the trade-off and lets them adjust consent. */
function HamelnMapEmbed() {
  // Track the consent value reactively so toggling the banner updates the card.
  const [allowed, setAllowed] = useState<boolean>(() => consent.externalAllowed());
  useEffect(() => consent.subscribe((s) => setAllowed(s?.external === true)), []);

  if (allowed) {
    return (
      <iframe
        title="Standort Hameln"
        src="https://www.google.com/maps?q=S%C3%BCntelhang+9%2C+31787+Hameln%2C+Germany&output=embed"
        className="w-full h-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#DFF7F8] via-[#F8FEFF] to-[#BFEAF2]/40 flex flex-col items-center justify-center text-center px-6">
      <Lock size={28} className="text-[#6FD3D1] mb-3" strokeWidth={1.5} />
      <p className="text-sm text-[#111111] font-medium mb-1" style={jakarta}>
        Karte ausgeblendet
      </p>
      <p className="text-xs text-[#5F6B73] font-light leading-relaxed mb-4 max-w-xs">
        Beim Laden der Google-Maps-Karte werden Daten an Google übertragen.
        Stimmen Sie der Einbettung externer Inhalte zu, um die Karte zu sehen.
      </p>
      <button
        type="button"
        onClick={() => requestReopenBanner()}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#6FD3D1] hover:bg-[#5BC2C0] text-white text-xs font-medium transition-colors"
      >
        Karte zulassen
      </button>
    </div>
  );
}

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
          <div className="cura-card-glow bg-white rounded-3xl border border-[#E5F4F5] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-[16/10] w-full overflow-hidden">
              <HamelnMapEmbed />
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
          <div className="cura-card-glow bg-white rounded-3xl border border-[#E5F4F5] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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

        {/* Two scroll-driven serpentine routes (Hameln + Paderborn) —
            desktop: SVG snake paths; mobile: vertical timelines. */}
        <CityRoadmap />

        {/* Einladung: nachfragen, falls der eigene Ort nicht gelistet ist */}
        <p className="text-center text-[15px] text-[#5F6B73] font-light mt-14 max-w-2xl mx-auto">
          Ihr Ort ist nicht dabei?{" "}
          <a
            href="/kontakt"
            className="text-[#6FD3D1] hover:text-[#5BC2C0] font-medium underline-offset-2 hover:underline transition-colors"
          >
            Fragen Sie uns gerne
          </a>{" "}
          – wir prüfen, ob wir auch zu Ihnen kommen können.
        </p>
      </div>
    </section>
  );
}
