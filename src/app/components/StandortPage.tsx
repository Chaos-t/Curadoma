import type { ReactNode } from "react";
import { Link } from "react-router";
import {
  MapPin, Phone, Mail, Clock, Navigation, ArrowRight, ChevronRight,
  Sparkles, Brain, Home, Calendar, Repeat, HelpCircle, ExternalLink,
} from "lucide-react";
import { Editable } from "./editor/Editable";
import { AddressBlock, PhoneText, EmailText, HoursText, useAddress } from "./editor/Shared";
import { ConsentMap } from "./ConsentMap";
import { useContent } from "../../lib/content";
import { LOCATIONS, type LocationKey } from "../../lib/locations";
import { jsonLd, plainText } from "../../lib/text";

const jakarta = { fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif" };
const SITE = "https://curadoma.de";

// Eine Seite pro Standort (/standort-hameln, /standort-paderborn).
//
// SEO: Lokale Landingpages sind das Standardwerkzeug fuer Suchen der Form
// "Betreuungsdienst + Ort". Sie funktionieren nur, wenn jede Seite echten,
// EIGENEN Inhalt hat — sonst wertet Google sie als Doppel-/Brueckenseiten ab.
// Deshalb unterscheiden sich Orte, Adresse, Einleitung und FAQ je Standort.
//
// GEO (Generative Engine Optimization): Die Einleitung beantwortet die Frage
// "Wer betreut wo?" im ersten Satz, und die FAQ liefert zitierfaehige
// Frage-Antwort-Paare. Beides wird zusaetzlich als FAQPage-Structured-Data
// ausgegeben — aus DENSELBEN (editierbaren) Werten, damit sichtbarer Text und
// Structured Data nie auseinanderlaufen (Google-Richtlinie).
//
// INHALTLICHE GRENZE: Nur Fakten, die bereits auf der Seite stehen. Die
// Anerkennung nach § 45a SGB XI gilt fuer beide Standorte (Niedersachsen und
// NRW, vom Betreiber am 29.09.2026 bestaetigt, siehe Impressum) — deshalb hat
// auch Paderborn Entlastungsbetrag und Umwandlungsanspruch.

type Service = { icon: ReactNode; title: string; desc: string; link: string };
type Faq = { q: string; a: string };
type Content = {
  badge: string;
  h1: string;
  h1Highlight: string;
  intro: string;
  servicesTitle: string;
  services: Service[];
  placesTitle: string;
  faqs: Faq[];
  ctaTitle: string;
};

const svcEntlastung: Service = {
  icon: <Sparkles size={26} strokeWidth={1.5} />,
  title: "Alltagsbegleitung & Entlastung",
  desc: "Gesellschaft, Gespräche, Spaziergänge und Begleitung zu Terminen – Unterstützung, die den Alltag spürbar leichter macht.",
  link: "/entlastung",
};
const svcDemenz: Service = {
  icon: <Brain size={26} strokeWidth={1.5} />,
  title: "Demenz- & Seniorenbetreuung",
  desc: "Einfühlsame, strukturierte Begleitung mit Geduld und fachlicher Kompetenz – für Würde und Lebensqualität zu Hause.",
  link: "/demenzbetreuung",
};
const svcHaushalt: Service = {
  icon: <Home size={26} strokeWidth={1.5} />,
  title: "Haushaltsnahe Dienstleistungen",
  desc: "Reinigung, Wäschepflege, Einkaufshilfe und kleine Mahlzeiten – damit Sie sich zu Hause weiterhin wohlfühlen.",
  link: "/haushaltsnahe-dienstleistungen",
};
const svcVerhinderung: Service = {
  icon: <Calendar size={26} strokeWidth={1.5} />,
  title: "Verhinderungspflege",
  desc: "Wir springen ein, wenn pflegende Angehörige Urlaub, Krankheit oder eine Pause brauchen.",
  link: "/verhinderungspflege",
};
const svcUmwandlung: Service = {
  icon: <Repeat size={26} strokeWidth={1.5} />,
  title: "Umwandlungsanspruch",
  desc: "Ungenutzte Pflegesachleistungen ab Pflegegrad 2 in konkrete Betreuung und Alltagshilfe umwandeln.",
  link: "/umwandlung-sachleistungen",
};

const faqBeratung: Faq = {
  q: "Was kostet die Beratung?",
  a: "Das Erstgespräch ist kostenlos und unverbindlich. Wir nehmen uns Zeit für Ihre Situation und zeigen Ihnen, welche Leistungen der Pflegekasse Ihnen zustehen.",
};

const CONTENT: Record<LocationKey, Content> = {
  hameln: {
    badge: "Standort Hameln",
    h1: "Ambulante Betreuung",
    h1Highlight: "in Hameln & Umgebung",
    intro:
      "Von unserem Standort in Hameln aus betreut Cura Doma pflegebedürftige Menschen in Hameln, Emmerthal, Aerzen, Hessisch Oldendorf, Bad Münder, Springe und den umliegenden Orten. Wir unterstützen im Alltag, im Haushalt und bei Demenz und entlasten pflegende Angehörige – damit Ihre Liebsten sicher und selbstbestimmt zu Hause leben können.",
    servicesTitle: "Unsere Leistungen in Hameln",
    services: [svcEntlastung, svcDemenz, svcHaushalt, svcVerhinderung, svcUmwandlung],
    placesTitle: "Hier sind wir rund um Hameln unterwegs",
    faqs: [
      {
        q: "Wo befindet sich Cura Doma in Hameln?",
        a: "Unser Standort liegt am Süntelhang 9 in 31787 Hameln. Von dort betreuen wir Menschen in Hameln und Umgebung – die Betreuung selbst findet bei Ihnen zu Hause statt.",
      },
      {
        q: "Welche Orte rund um Hameln betreut Cura Doma?",
        a: "Regelmäßig fahren wir unter anderem Hameln, Afferde, Hastenbeck, Tündern, Emmerthal, Hessisch Oldendorf, Fischbeck, Klein und Groß Berkel, Aerzen, das Sünteltal, Bad Münder, Springe, Völksen, Bennigsen und Gehrden an. Ihr Ort ist nicht dabei? Sprechen Sie uns an – wir prüfen gerne, ob wir auch zu Ihnen kommen können.",
      },
      {
        q: "Übernimmt die Pflegekasse die Kosten für die Betreuung?",
        a: "In vielen Fällen ja. Als nach § 45a SGB XI anerkanntes Angebot zur Unterstützung im Alltag (Land Niedersachsen) rechnen wir unsere Leistungen direkt mit Ihrer Pflegekasse ab – etwa über den Entlastungsbetrag von 131 € im Monat ab Pflegegrad 1, die Verhinderungspflege oder die Umwandlung von Pflegesachleistungen. Welche Möglichkeiten Ihnen zustehen, klären wir im kostenlosen Beratungsgespräch.",
      },
      faqBeratung,
      {
        q: "Wie erreiche ich Cura Doma in Hameln?",
        a: "Telefonisch unter 05151 7107093, per E-Mail an info@curadoma.de oder über unser Kontaktformular – Montag bis Freitag von 8 bis 17 Uhr. Wir melden uns in der Regel innerhalb von 24 Stunden bei Ihnen.",
      },
    ],
    ctaTitle: "Kostenlose Beratung in Hameln",
  },
  paderborn: {
    badge: "Standort Paderborn",
    h1: "Ambulante Betreuung",
    h1Highlight: "in Paderborn & Umgebung",
    intro:
      "Von unserem Standort in Salzkotten aus betreut Cura Doma pflegebedürftige Menschen in Paderborn, Delbrück, Geseke, Salzkotten, Borchen und den umliegenden Orten. Wir unterstützen im Alltag, im Haushalt und bei Demenz und entlasten pflegende Angehörige – damit Ihre Liebsten sicher und selbstbestimmt zu Hause leben können.",
    servicesTitle: "Unsere Leistungen in Paderborn und Umgebung",
    services: [svcEntlastung, svcDemenz, svcHaushalt, svcVerhinderung, svcUmwandlung],
    placesTitle: "Hier sind wir rund um Paderborn unterwegs",
    faqs: [
      {
        q: "Wo befindet sich der Standort von Cura Doma im Kreis Paderborn?",
        a: "Unser Standort für Paderborn und Umgebung liegt in der Bachstraße 13 in 33154 Salzkotten. Von dort betreuen wir Menschen in Paderborn, Salzkotten und den umliegenden Orten – die Betreuung selbst findet bei Ihnen zu Hause statt.",
      },
      {
        q: "Welche Orte im Raum Paderborn betreut Cura Doma?",
        a: "Regelmäßig fahren wir unter anderem Paderborn, Delbrück, Geseke, Salzkotten, Thüle, Wewer, Borchen und Wewelsburg an. Ihr Ort ist nicht dabei? Sprechen Sie uns an – wir prüfen gerne, ob wir auch zu Ihnen kommen können.",
      },
      {
        q: "Kann ich die Betreuung über die Pflegekasse finanzieren?",
        a: "In vielen Fällen ja. Als nach § 45a SGB XI anerkanntes Angebot zur Unterstützung im Alltag (Land Nordrhein-Westfalen) rechnen wir unsere Leistungen direkt mit Ihrer Pflegekasse ab – etwa über den Entlastungsbetrag von 131 € im Monat ab Pflegegrad 1, die Verhinderungspflege oder die Umwandlung von Pflegesachleistungen. Welche Möglichkeiten Ihnen zustehen, klären wir im kostenlosen Beratungsgespräch.",
      },
      faqBeratung,
      {
        q: "Wie erreiche ich Cura Doma im Raum Paderborn?",
        a: "Telefonisch unter 05151 7107093, per E-Mail an info@curadoma.de oder über unser Kontaktformular – Montag bis Freitag von 8 bis 17 Uhr. Wir melden uns in der Regel innerhalb von 24 Stunden bei Ihnen.",
      },
    ],
    ctaTitle: "Kostenlose Beratung in Paderborn und Umgebung",
  },
};

export function StandortPage({ location }: { location: LocationKey }) {
  const loc = LOCATIONS[location];
  const c = CONTENT[location];
  const addr = useAddress(location);
  const { get } = useContent();
  const p = `standort-${location}`; // Editor-ID-Praefix

  // Klartextwert eines Feldes: Editor-Override, sonst Code-Standard.
  const val = (id: string, def: string) => plainText(get(id)) || plainText(def);

  // Structured Data aus denselben Werten wie der sichtbare Text.
  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Startseite", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Einzugsgebiet", item: `${SITE}/einzugsgebiet` },
          { "@type": "ListItem", position: 3, name: loc.name, item: `${SITE}${loc.path}` },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE}${loc.path}#faq`,
        about: { "@id": `${SITE}/#standort-${location}` },
        mainEntity: c.faqs.map((f, i) => ({
          "@type": "Question",
          name: val(`${p}.faq.${i}.q`, f.q),
          acceptedAnswer: { "@type": "Answer", text: val(`${p}.faq.${i}.a`, f.a) },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />

      {/* Hero */}
      <section className="relative pt-10 pb-20 lg:pt-14 lg:pb-24 overflow-hidden bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#BFEAF2] opacity-15 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <nav aria-label="Brotkrumen" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[#5F6B73] font-light">
              <li><Link to="/" className="hover:text-[#0F7C77] transition-colors">Startseite</Link></li>
              <li aria-hidden="true"><ChevronRight size={12} /></li>
              <li><Link to="/einzugsgebiet" className="hover:text-[#0F7C77] transition-colors">Einzugsgebiet</Link></li>
              <li aria-hidden="true"><ChevronRight size={12} /></li>
              <li aria-current="page" className="text-[#0F7C77]">{loc.name}</li>
            </ol>
          </nav>

          <div className="flex flex-col lg:flex-row items-start gap-12">
            <div className="cura-reveal cura-reveal-left flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#0E6E6A] mb-6 uppercase tracking-wider">
                <MapPin size={14} /> <Editable as="span" id={`${p}.hero.badge`}>{c.badge}</Editable>
              </div>
              <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-6 hyphens-auto" style={jakarta}>
                <Editable as="span" id={`${p}.hero.title`}>{c.h1}</Editable>{" "}
                <span className="text-[#0F7C77]"><Editable as="span" id={`${p}.hero.title-highlight`}>{c.h1Highlight}</Editable></span>
              </h1>
              <p className="text-lg text-[#5F6B73] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light mb-8">
                <Editable as="span" id={`${p}.hero.intro`}>{c.intro}</Editable>
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/kontakt" className="w-full sm:w-auto bg-[#0F7C77] text-white hover:bg-[#0E6E6A] px-8 py-3.5 rounded-full text-base font-normal transition-all shadow-[0_8px_20px_rgb(111,211,209,0.25)] flex items-center justify-center gap-2">
                  <Editable as="span" id={`${p}.hero.cta-primary`}>Kostenlos beraten lassen</Editable>
                </Link>
                <PhoneText
                  icon={<Phone size={18} className="text-[#6FD3D1]" />}
                  className="w-full sm:w-auto bg-white text-[#111111] border border-[#E5F4F5] hover:bg-[#F8FEFF] px-8 py-3.5 rounded-full text-base font-normal transition-all flex items-center justify-center gap-2"
                />
              </div>
            </div>

            {/* Standort-Karte */}
            <div className="cura-reveal cura-reveal-right w-full lg:w-[440px] shrink-0">
              <div className="cura-card-glow bg-white rounded-3xl border border-[#E5F4F5] overflow-hidden shadow-[0_20px_60px_rgb(191,234,242,0.3)]">
                <div className="aspect-[16/10] w-full overflow-hidden">
                  <ConsentMap src={addr.maps.embed} title={`${loc.name} – ${addr.line}`} />
                </div>
                <div className="p-6 sm:p-7">
                  <h2 className="text-lg font-medium text-[#111111] mb-4" style={jakarta}>
                    <Editable as="span" id={`${p}.card.title`}>{`Ihr ${loc.name}`}</Editable>
                  </h2>
                  <ul className="space-y-3 text-[15px] text-[#5F6B73] font-light">
                    <li className="flex items-start gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-[#6FD3D1]" /><AddressBlock variant="br" location={location} /></li>
                    <li className="flex items-start gap-3"><Clock size={18} className="mt-0.5 shrink-0 text-[#6FD3D1]" /><HoursText withSuffix /></li>
                    <li className="flex items-start gap-3"><Phone size={18} className="mt-0.5 shrink-0 text-[#6FD3D1]" /><PhoneText className="hover:text-[#0F7C77] transition-colors" /></li>
                    <li className="flex items-start gap-3"><Mail size={18} className="mt-0.5 shrink-0 text-[#6FD3D1]" /><EmailText className="hover:text-[#0F7C77] transition-colors break-all" /></li>
                  </ul>
                  <div className="flex flex-wrap gap-3 mt-6">
                    <a href={addr.maps.directions} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#0F7C77] text-white hover:bg-[#0E6E6A] px-5 py-2.5 rounded-full text-sm font-normal transition-all shadow-sm">
                      <Navigation size={16} /> <Editable as="span" id={`${p}.card.route`}>Route planen</Editable>
                    </a>
                    <a href={addr.maps.search} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-white text-[#5F6B73] border border-[#E5F4F5] hover:bg-[#F8FEFF] hover:text-[#111111] px-5 py-2.5 rounded-full text-sm font-normal transition-all">
                      <ExternalLink size={16} /> <Editable as="span" id={`${p}.card.maps`}>In Google Maps öffnen</Editable>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leistungen vor Ort */}
      <section className="py-20 bg-white/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="cura-reveal cura-reveal-up text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-4 hyphens-auto" style={jakarta}>
              <Editable as="span" id={`${p}.leistungen.title`}>{c.servicesTitle}</Editable>
            </h2>
            <p className="text-lg text-[#5F6B73] font-light">
              <Editable as="span" id={`${p}.leistungen.intro`}>Individuelle Unterstützung, die sich sanft in Ihren Alltag einfügt – direkt bei Ihnen zu Hause.</Editable>
            </p>
          </div>
          {/* Flex statt Grid: eine unvollstaendige letzte Reihe (Paderborn 4,
              Hameln 5 Karten) steht mittig statt links allein. */}
          <div className="cura-reveal cura-reveal-up flex flex-wrap justify-center gap-6">
            {c.services.map((s, i) => (
              <Link key={s.link} to={s.link}
                className="cura-card-glow group w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] bg-white/90 backdrop-blur-sm p-7 rounded-3xl border border-[#E5F4F5] shadow-sm hover:shadow-md hover:border-[#BFEAF2] transition-all duration-300 flex flex-col">
                <div className="w-12 h-12 bg-[#DFF7F8] rounded-2xl flex items-center justify-center text-[#0E6E6A] mb-5">{s.icon}</div>
                <h3 className="text-lg font-medium tracking-tight text-[#111111] mb-2" style={jakarta}>
                  <Editable as="span" id={`${p}.leistungen.${i}.title`}>{s.title}</Editable>
                </h3>
                <p className="text-[15px] text-[#5F6B73] leading-relaxed font-light mb-5 flex-1">
                  <Editable as="span" id={`${p}.leistungen.${i}.desc`}>{s.desc}</Editable>
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0F7C77] group-hover:gap-2.5 transition-all">
                  <Editable as="span" id="home.services.card-link">Mehr erfahren</Editable> <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Angefahrene Orte */}
      <section className="py-20 bg-[#F8FEFF]/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl lg:text-3xl font-medium tracking-tight text-[#111111] mb-4 hyphens-auto" style={jakarta}>
            <Editable as="span" id={`${p}.orte.title`}>{c.placesTitle}</Editable>
          </h2>
          <p className="text-[#5F6B73] font-light mb-8 max-w-2xl mx-auto">
            <Editable as="span" id={`${p}.orte.intro`}>Diese Orte fahren wir regelmäßig an. Ihr Ort ist nicht dabei? Fragen Sie uns gerne – wir prüfen, ob wir auch zu Ihnen kommen können.</Editable>
          </p>
          {/* Dieselben Editor-IDs wie die Route auf /einzugsgebiet — ein Ort,
              einmal umbenannt, aendert sich an beiden Stellen. */}
          <ul className="flex flex-wrap justify-center gap-2.5 mb-8">
            {loc.routeStops.map((stop, i) => (
              <li key={stop} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#E5F4F5] text-sm text-[#111111] shadow-sm">
                <MapPin size={13} className="text-[#6FD3D1] shrink-0" />
                <Editable as="span" id={`einzugsgebiet.roadmap.${location}.city.${i}`}>{stop}</Editable>
              </li>
            ))}
          </ul>
          <Link to="/einzugsgebiet" className="inline-flex items-center gap-2 text-sm font-medium text-[#0F7C77] hover:text-[#5BC2C0] transition-colors">
            <Editable as="span" id={`${p}.orte.link`}>Alle Orte und Routen ansehen</Editable> <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white/80">
        <div className="max-w-3xl mx-auto px-6">
          <div className="cura-reveal cura-reveal-up text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#DFF7F8] text-[#0E6E6A] mb-4">
              <HelpCircle size={22} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-medium tracking-tight text-[#111111]" style={jakarta}>
              <Editable as="span" id={`${p}.faq.title`}>Häufige Fragen</Editable>
            </h2>
          </div>
          <div className="space-y-4">
            {c.faqs.map((f, i) => (
              <div key={i} className="cura-reveal cura-reveal-up cura-card-glow bg-[#F8FEFF] rounded-2xl border border-[#E5F4F5] p-6 sm:p-7">
                <h3 className="text-base sm:text-lg font-medium text-[#111111] mb-2 hyphens-auto" style={jakarta}>
                  <Editable as="span" id={`${p}.faq.${i}.q`}>{f.q}</Editable>
                </h3>
                <p className="text-[15px] text-[#5F6B73] font-light leading-relaxed">
                  <Editable as="span" id={`${p}.faq.${i}.a`}>{f.a}</Editable>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#F8FEFF]/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-6 hyphens-auto" style={jakarta}>
            <Editable as="span" id={`${p}.cta.title`}>{c.ctaTitle}</Editable>
          </h2>
          <p className="text-lg text-[#5F6B73] mb-10 max-w-2xl mx-auto font-light">
            <Editable as="span" id={`${p}.cta.text`}>Wir nehmen uns Zeit für Sie und beantworten alle Fragen zur Pflegekasse in Ruhe – persönlich und ohne Verpflichtung.</Editable>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/kontakt" className="w-full sm:w-auto bg-[#0F7C77] text-white hover:bg-[#0E6E6A] px-8 py-4 rounded-full text-base font-normal transition-all flex items-center justify-center gap-2 shadow-sm">
              <Mail size={20} /> <Editable as="span" id={`${p}.cta.button`}>Jetzt anfragen</Editable>
            </Link>
            <PhoneText
              icon={<Phone size={20} className="text-[#6FD3D1]" />}
              className="w-full sm:w-auto bg-white text-[#111111] border border-[#E5F4F5] hover:bg-[#DFF7F8] px-8 py-4 rounded-full text-base font-normal transition-all flex items-center justify-center gap-2"
            />
          </div>
        </div>
      </section>
    </>
  );
}
