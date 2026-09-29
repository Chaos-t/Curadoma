import { Link } from "react-router";
import { MapPin, Navigation, Clock, ArrowRight } from "lucide-react";
import { CityRoadmap } from "./CityRoadmap";
import { ConsentMap } from "./ConsentMap";
import { Editable } from "./editor/Editable";
import { AddressBlock, useAddress } from "./editor/Shared";
import { LOCATION_LIST, type Location } from "../../lib/locations";

const jakarta = { fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif" };

/** Karte eines Standorts. Beide Karten entstehen aus lib/locations — frueher
 *  waren es zwei handgeschriebene Bloecke, und die Paderborn-Karte stand
 *  deshalb noch auf "Adresse folgt", als die Adresse laengst feststand. */
function LocationCard({ loc }: { loc: Location }) {
  const addr = useAddress(loc.key);
  const k = loc.key;
  return (
    <div className="cura-card-glow bg-white rounded-3xl border border-[#E5F4F5] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="aspect-[16/10] w-full overflow-hidden">
        <ConsentMap src={addr.maps.embed} title={`${loc.name} – ${addr.line}`} />
      </div>
      <div className="p-7 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#DFF7F8] text-[11px] font-medium text-[#0E6E6A] uppercase tracking-wider">
            <Clock size={12} /> <Editable as="span" id={`einzugsgebiet-section.${k}.badge`}>Aktiv</Editable>
          </span>
        </div>
        <h3 className="text-xl font-medium text-[#111111] mb-2" style={jakarta}>
          <Editable as="span" id={`einzugsgebiet-section.${k}.title`}>{loc.name}</Editable>
        </h3>
        <p className="text-[15px] text-[#5F6B73] font-light mb-5"><AddressBlock variant="br" location={k} /></p>
        <div className="flex flex-wrap gap-3 mt-auto">
          <a
            href={addr.maps.directions}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#0F7C77] text-white hover:bg-[#0E6E6A] px-5 py-2.5 rounded-full text-sm font-normal transition-all shadow-sm"
          >
            <Navigation size={16} /> <Editable as="span" id={`einzugsgebiet-section.${k}.route-button`}>Route ansehen</Editable>
          </a>
          <Link
            to={loc.path}
            className="inline-flex items-center gap-2 bg-white text-[#5F6B73] border border-[#E5F4F5] hover:bg-[#F8FEFF] hover:text-[#111111] px-5 py-2.5 rounded-full text-sm font-normal transition-all"
          >
            <MapPin size={16} /> <Editable as="span" id={`einzugsgebiet-section.${k}.more-link`}>Zur Standortseite</Editable>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function EinzugsgebietSection({ heading = true }: { heading?: boolean }) {
  return (
    <section className="py-24 bg-white/80 border-t border-[#E5F4F5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {heading && (
          <div className="cura-reveal cura-reveal-up max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#DFF7F8] text-[#0E6E6A] mb-4">
              <MapPin size={22} />
            </div>
            <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-4" style={jakarta}>
              {/* Achtung: Fuer diese ID liegt ein Live-Override ("Unser Einzugsgebiet")
                  im Editor. Eine Aenderung des Standardtexts hier waere unsichtbar. */}
              <Editable as="span" id="einzugsgebiet-section.intro.heading">Unser Einzugsgebiet</Editable>
            </h2>
            <p className="text-[17px] text-[#5F6B73] font-light leading-relaxed">
              <Editable as="span" id="einzugsgebiet-section.intro.text" rich>
                Unser Betreuungsdienst ist im Raum <strong>Hameln, Springe, Paderborn, Salzkotten und Umgebung</strong> für Sie da – mit zwei Standorten in Hameln und im Kreis Paderborn. Wir bieten unsere Leistungen in zahlreichen Städten, Gemeinden und Ortsteilen der Region an, um eine wohnortnahe und verlässliche Betreuung sicherzustellen.
              </Editable>
            </p>
          </div>
        )}

        <div className="cura-reveal cura-reveal-up grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {LOCATION_LIST.map((loc) => <LocationCard key={loc.key} loc={loc} />)}
        </div>

        {/* Two scroll-driven serpentine routes (Hameln + Paderborn) —
            desktop: SVG snake paths; mobile: vertical timelines. */}
        <CityRoadmap />

        {/* Einladung: nachfragen, falls der eigene Ort nicht gelistet ist */}
        <p className="cura-reveal cura-reveal-up text-center text-[15px] text-[#5F6B73] font-light mt-14 max-w-2xl mx-auto">
          <Editable as="span" id="einzugsgebiet-section.cta.text.before">Ihr Ort ist nicht dabei?</Editable>{" "}
          <Link
            to="/kontakt"
            className="inline-flex items-center gap-1 text-[#0F7C77] hover:text-[#5BC2C0] font-medium underline-offset-2 hover:underline transition-colors"
          >
            <Editable as="span" id="einzugsgebiet-section.cta.text.link">Fragen Sie uns gerne</Editable>
            <ArrowRight size={14} />
          </Link>{" "}
          <Editable as="span" id="einzugsgebiet-section.cta.text.after">– wir prüfen, ob wir auch zu Ihnen kommen können.</Editable>
        </p>
      </div>
    </section>
  );
}
