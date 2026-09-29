import { Link } from "react-router";
import {
  Home, Brain, Users, Info, CheckCircle,
  MapPin, Clock, Sun, MessageCircle, ShieldCheck, Heart, Handshake,
  ArrowRight, HandHeart, Phone, Mail, Sparkles, Repeat, Calendar, ExternalLink,
} from "lucide-react";
import { EinzugsgebietSection } from "./EinzugsgebietSection";
import { GoogleReviews } from "./GoogleReviews";
import { InstagramFeed } from "./InstagramFeed";
import { Editable } from "./editor/Editable";
import { EditableImage } from "./editor/EditableImage";
import { Css } from "./Css";
import { ValueSeal } from "./ValueSeal";

type Partner = {
  name: string;
  /** External URL the card links to (opens in new tab). */
  url: string;
  /** Logo image URL — hot-linked from the partner's CDN. */
  logoUrl: string;
  /** Tagline under the partner name. */
  tagline: string;
};

const partners: Partner[] = [
  {
    name: "Verbund Pflegehilfe",
    url: "https://www.pflegehilfe.org/",
    logoUrl: "https://static.pflegehilfe.org/favicons/apple-touch-icon-180x180.png",
    tagline: "Bundesweite Pflegeberatung",
  },
  {
    name: "PflegeHelfer24",
    url: "https://pflege-helfer24.de/",
    logoUrl: "https://a.storyblok.com/f/289506/1396x1396/fa34d298ea/ph24_new_icon_only.png",
    tagline: "Hausnotruf & Pflegehilfen",
  },
  {
    name: "Pflegehilfe Hameln",
    url: "https://pflegehilfe-hameln.de/",
    logoUrl: "https://pflegehilfe-hameln.de/pflegehilfe-hameln-logo-blau.png",
    tagline: "Regional vor Ort",
  },
];

function PartnerSection() {
  // Repeat 4× so the marquee feels populated even with only 3 partners
  const loop = [...partners, ...partners, ...partners, ...partners];
  return (
    <section className="py-24 bg-white/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="cura-reveal cura-reveal-up text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#0E6E6A] mb-5 uppercase tracking-wider">
            <Handshake size={14} /> <Editable as="span" id="home.partners.badge">Unsere Partner</Editable>
          </div>
          <Editable as="h2" id="home.partners.title" style={{ fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif" }} className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-4">
            Gemeinsam stark für Sie
          </Editable>
          <Editable as="p" id="home.partners.text" className="text-[15px] lg:text-base text-[#5F6B73] font-light leading-relaxed">
            Wir arbeiten vertrauensvoll mit Beratungs- und Versorgungspartnern zusammen,
            um Ihnen eine umfassende Betreuung zu ermöglichen.
          </Editable>
        </div>

        {/* Mobile: swipe / Desktop: marquee */}
        <div className="relative">
          <div className="hidden md:block relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="flex gap-6 motion-safe:animate-[curaPartnerMarquee_45s_linear_infinite]">
              {loop.map((p, i) => (
                <PartnerCard key={`${p.name}-${i}`} partner={p} index={i % partners.length} />
              ))}
            </div>
          </div>
          <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6">
            {partners.map((p, i) => (
              <div key={p.name} className="snap-start shrink-0 w-[80%]">
                <PartnerCard partner={p} index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Css>{`
        @keyframes curaPartnerMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</Css>
    </section>
  );
}

function PartnerCard({ partner, index }: { partner: Partner; index: number }) {
  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      className="cura-card-glow group relative shrink-0 w-64 bg-white rounded-2xl border border-[#E5F4F5] shadow-[0_8px_24px_rgb(191,234,242,0.25)] hover:shadow-[0_14px_32px_rgb(191,234,242,0.45)] hover:border-[#BFEAF2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6FD3D1] transition-all duration-200 p-5 flex items-center gap-4 motion-safe:animate-[curaFadeIn_900ms_ease-out_both] no-underline"
      aria-label={`${partner.name} — externe Website öffnen`}
    >
      {/* Logo with bg-mint tile so transparent-PNG logos read on white */}
      <div className="w-14 h-14 rounded-xl bg-[#F8FEFF] border border-[#E5F4F5] flex items-center justify-center shrink-0 overflow-hidden">
        <EditableImage
          id={`home.partners.${index}.logo`}
          src={partner.logoUrl}
          alt={`${partner.name} Logo`}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="max-w-[80%] max-h-[80%] object-contain"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#5F6B73] font-light mb-0.5">
          <Editable as="span" id="home.partners.eyebrow-label">Partner</Editable>
          <ExternalLink size={10} className="text-[#9AA3A8] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="text-sm font-medium text-[#111111] truncate" style={{ fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif" }}>
          <Editable as="span" id={`home.partners.${index}.name`}>{partner.name}</Editable>
        </div>
        <div className="text-[11px] text-[#5F6B73] font-light truncate">
          <Editable as="span" id={`home.partners.${index}.tagline`}>{partner.tagline}</Editable>
        </div>
      </div>
      <Css>{`@keyframes curaFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</Css>
    </a>
  );
}

const heroBase = "https://images.unsplash.com/photo-1773227055624-07b515ba87c5?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJlZ2l2ZXIlMjBob2xkaW5nJTIwZWxkZXJseSUyMHdvbWFuJTIwaGFuZHN8ZW58MXx8fHwxNzc1MzE0MDE0fDA&ixlib=rb-4.1.0&q=80";
const heroImage = `${heroBase}&w=1080`;
// Das Hero-Bild ist das LCP-Element. Ohne srcSet laedt auch ein 360-px-Handy
// die 1080-px-Fassung — genau der Posten „Bilduebermittlung verbessern".
// Unsplash liefert die Breite ueber &w=, daher hier gestaffelt anbieten.
const heroSrcSet = [480, 640, 828, 1080].map((w) => `${heroBase}&w=${w} ${w}w`).join(", ");
const demenzImage = "https://images.unsplash.com/photo-1758691031958-29541f3207a5?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJlZ2l2ZXIlMjByZWFkaW5nJTIwYm9vayUyMHNlbmlvciUyMHdvbWFufGVufDF8fHx8MTc3NTMxNDAxNHww&ixlib=rb-4.1.0&q=80&w=1080";

const jakarta = { fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif" };

export function HomePage() {
  return (
    <>
      {/* Hero Section — transparent so the global animated background shows through */}
      <section className="relative pt-16 pb-28 lg:pt-28 lg:pb-36 overflow-hidden">
        {/* Soft scrim behind the text column so copy stays legible over the animated background */}
        <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-r from-[#F8FEFF]/85 via-[#F8FEFF]/35 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="cura-hero-text flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5F4F5] shadow-sm text-xs font-normal text-[#5F6B73] mb-8">
              <HandHeart size={18} strokeWidth={1.5} className="text-[#6FD3D1]" />
              <Editable as="span" id="home.hero.badge">Vertrauensvolle Betreuung im eigenen Zuhause</Editable>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-6" style={jakarta}>
              <Editable as="span" id="home.hero.title">Sie können nicht immer da sein.</Editable> <br className="hidden lg:block" />
              <span className="text-[#0F7C77]"><Editable as="span" id="home.hero.title-highlight">Wir können es.</Editable></span>
            </h1>
            <Editable as="p" id="home.hero.subtitle" className="text-lg lg:text-xl text-[#5F6B73] leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-10 font-light">
              Liebevolle und individuelle Unterstützung für pflegebedürftige Menschen in ihrer gewohnten Umgebung – rund um Hameln und Paderborn. Wir entlasten Angehörige und fördern ein würdevolles, selbstbestimmtes Leben.
            </Editable>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
              <Link to="/kontakt" className="w-full sm:w-auto bg-[#0F7C77] text-white hover:bg-[#0E6E6A] px-8 py-3.5 rounded-full text-base font-normal transition-all shadow-[0_8px_20px_rgb(111,211,209,0.25)] flex items-center justify-center gap-2">
                <Editable as="span" id="home.hero.cta-primary">Kostenlos beraten lassen</Editable>
              </Link>
              <Link to="/leistungen" className="w-full sm:w-auto bg-white text-[#5F6B73] border border-[#E5F4F5] hover:bg-[#F8FEFF] hover:text-[#111111] px-8 py-3.5 rounded-full text-base font-normal transition-all flex items-center justify-center">
                <Editable as="span" id="home.hero.cta-secondary">Unsere Leistungen</Editable>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-[#5F6B73] font-light">
              <span className="inline-flex items-center gap-1.5"><CheckCircle size={14} className="text-[#6FD3D1]" /> <Editable as="span" id="home.hero.trust.0">Anerkannter Anbieter</Editable></span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle size={14} className="text-[#6FD3D1]" /> <Editable as="span" id="home.hero.trust.1">Abrechnung über Pflegekasse möglich</Editable></span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle size={14} className="text-[#6FD3D1]" /> <Editable as="span" id="home.hero.trust.2">Persönliche Betreuung</Editable></span>
            </div>
          </div>

          <div className="cura-hero-image flex-1 w-full max-w-lg lg:max-w-none relative">
            {/* Halb hinter dem Bild: Das entsteht AUSSCHLIESSLICH über die
                Stapelreihenfolge — Siegel z-0, Bildrahmen relative z-10.
                Kein Clipping, keine Maske. Der Rahmen hat overflow-hidden,
                rounded-3xl und 4px weißen Rand, darunter verschwindet das
                Siegel sauber. Oben LINKS, weil unten links schon die
                "Anerkannter Partner"-Karte sitzt. */}
            <ValueSeal className="absolute -top-6 -left-6 lg:-top-10 lg:-left-10 z-0 w-[140px] h-[140px] lg:w-[170px] lg:h-[170px]" />
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgb(191,234,242,0.4)] border-4 border-white">
              {/* Bild ueber der Falz und LCP-Kandidat: bewusst NICHT lazy, mit
                  hoher Prioritaet holen + feste Groesse (Seitenverhaeltnis
                  reserviert Platz -> kein Layout-Sprung). fetchpriority wird
                  kleingeschrieben gespreizt, weil React 18 nur das HTML-Attribut
                  kennt (camelCase erst ab React 19). */}
              <EditableImage id="home.hero.image" src={heroImage} alt="Betreuerin hält die Hände einer älteren Dame" altId="home.hero.image-alt"
                width={1200} height={900} loading="eager" decoding="async"
                srcSet={heroSrcSet} sizes="(max-width: 1023px) 92vw, 46vw"
                {...{ fetchpriority: "high" }}
                className="w-full h-auto aspect-[4/3] object-cover" />
            </div>
            <div className="cura-card-glow absolute -bottom-6 -left-4 lg:-left-12 z-20 bg-white p-5 rounded-2xl shadow-[0_10px_30px_rgb(0,0,0,0.05)] border border-[#E5F4F5] flex items-center gap-4">
              <div className="w-12 h-12 bg-[#DFF7F8] rounded-full flex items-center justify-center text-[#0E6E6A]">
                <ShieldCheck size={24} strokeWidth={1.5} />
              </div>
              <div>
                <Editable as="div" id="home.hero.card.title" style={jakarta} className="text-sm font-medium tracking-tight text-[#111111]">Anerkannter Partner</Editable>
                <Editable as="div" id="home.hero.card.desc" className="text-xs text-[#5F6B73] font-light mt-0.5">Abrechnung mit der Pflegekasse</Editable>
              </div>
            </div>
          </div>
        </div>

        <Css>{`
          /* Slow slide-in from the sides on first render. The text on
             the left, the image on the right — image enters a touch
             later so the eye lands on the headline first.

             WICHTIG: Hier wird BEWUSST nur transform animiert, NICHT die
             Deckkraft. Mit "opacity: 0" im 0%-Keyframe + fill-mode "both" war
             die Überschrift ab dem allerersten Frame unsichtbar — Chrome fand
             dadurch gar kein "größtes Inhaltselement" und Lighthouse meldete
             mobil NO_LCP (kein LCP/TBT-Messwert). Reines transform bleibt
             zudem auf dem Compositor und belastet den Hauptthread nicht. */
          @keyframes curaHeroEnterLeft {
            0%   { transform: translateX(-44px); }
            100% { transform: translateX(0); }
          }
          @keyframes curaHeroEnterRight {
            0%   { transform: translateX(44px); }
            100% { transform: translateX(0); }
          }
          .cura-hero-text {
            animation: curaHeroEnterLeft 1.2s cubic-bezier(0.22, 1, 0.36, 1) both;
          }
          .cura-hero-image {
            animation: curaHeroEnterRight 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
          }
          @media (prefers-reduced-motion: reduce) {
            .cura-hero-text, .cura-hero-image { animation: none; }
          }
        `}</Css>
      </section>

      {/* Introduction */}
      <section className="py-24 bg-white/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 text-center">
          <Users size={48} strokeWidth={1} className="text-[#BFEAF2] mb-6 mx-auto" />
          <Editable as="h2" id="home.intro.title" style={jakarta} className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-6">
            Der Mensch im Mittelpunkt
          </Editable>
          <Editable as="p" id="home.intro.text" className="text-lg lg:text-xl text-[#5F6B73] leading-relaxed font-light">
            Cura Doma ist Ihr anerkannter ambulanter Betreuungsdienst aus Hameln – und auch im Kreis Paderborn für Sie da. Unsere Mission ist es, pflegebedürftigen Menschen und ihren Familien zur Seite zu stehen. Wir fördern die Selbstständigkeit, schaffen Freiräume für pflegende Angehörige und machen es möglich, so lange wie möglich sicher und geborgen im eigenen Zuhause zu leben.
          </Editable>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-24 bg-[#F8FEFF]/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="cura-reveal cura-reveal-up mb-16 text-center max-w-2xl mx-auto">
            <Editable as="h2" id="home.services.title" style={jakarta} className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-4">
              Wie wir Sie unterstützen können
            </Editable>
            <Editable as="p" id="home.services.intro" className="text-lg text-[#5F6B73] font-light">
              Individuelle Leistungen, die sich sanft in Ihren Alltag einfügen – in Hameln, Paderborn und Umgebung.
            </Editable>
          </div>

          <div className="cura-reveal cura-reveal-up grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Sparkles size={28} strokeWidth={1.5} />, title: "Entlastungsleistungen", desc: "Monatlich 131 € nach § 45b SGB XI für Alltagsbegleitung, Haushaltshilfe und Betreuung – direkt mit der Pflegekasse abgerechnet.", link: "/entlastung" },
              { icon: <Brain size={28} strokeWidth={1.5} />, title: "Demenz- & Seniorenbetreuung", desc: "Einfühlsame, strukturierte Begleitung mit Empathie, Geduld und fachlicher Kompetenz – für Würde und Lebensqualität zu Hause.", link: "/demenzbetreuung" },
              { icon: <Home size={28} strokeWidth={1.5} />, title: "Haushaltsnahe Dienstleistungen", desc: "Reinigung, Wäschepflege, Einkaufshilfe und Zubereitung kleiner Mahlzeiten – damit Sie sich zu Hause weiterhin wohlfühlen.", link: "/haushaltsnahe-dienstleistungen" },
              { icon: <Repeat size={28} strokeWidth={1.5} />, title: "Umwandlungsanspruch", desc: "Bis zu 40 % Ihrer Pflegesachleistungen (ab Pflegegrad 2) in konkrete Betreuungsleistungen umwandeln – mehr praktische Hilfe im Alltag.", link: "/umwandlung-sachleistungen" },
              { icon: <Calendar size={28} strokeWidth={1.5} />, title: "Verhinderungspflege", desc: "Bis zu 3.539 € pro Jahr (gemeinsamer Jahresbetrag für Verhinderungs- und Kurzzeitpflege), wenn die private Pflegeperson Urlaub, Krankheit oder eine Pause braucht.", link: "/verhinderungspflege" },
              { icon: <Users size={28} strokeWidth={1.5} />, title: "Entlastung für Angehörige", desc: "Verlässliche Übernahme der Betreuung, damit pflegende Familienmitglieder beruhigt neue Kraft schöpfen können.", link: "/leistungen" },
            ].map((service, i) => (
              <Link
                key={i}
                to={service.link}
                className="cura-card-glow group bg-white/90 backdrop-blur-sm p-8 rounded-3xl border border-[#E5F4F5] shadow-sm hover:shadow-md hover:border-[#BFEAF2] transition-all duration-300 flex flex-col"
              >
                <div className="w-14 h-14 bg-[#DFF7F8] rounded-2xl flex items-center justify-center text-[#0E6E6A] mb-6">
                  {service.icon}
                </div>
                <Editable as="h3" id={`home.services.${i}.title`} style={jakarta} className="text-xl font-medium tracking-tight text-[#111111] mb-3">{service.title}</Editable>
                <Editable as="p" id={`home.services.${i}.desc`} className="text-[15px] text-[#5F6B73] leading-relaxed font-light mb-5 flex-1">{service.desc}</Editable>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0F7C77] group-hover:gap-2.5 transition-all">
                  <Editable as="span" id="home.services.card-link">Mehr erfahren</Editable> <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/leistungen" className="inline-flex items-center gap-2 text-sm font-medium text-[#0F7C77] hover:text-[#5BC2C0] transition-colors">
              <Editable as="span" id="home.services.all-link">Alle Leistungen im Detail ansehen</Editable> <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Entlastungsleistungen & Pflegekasse */}
      <section className="py-24 bg-white/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="cura-reveal cura-reveal-left flex-1">
              <Editable as="h2" id="home.pflegekasse.title" style={jakarta} className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-6">
                Ihre Ansprüche bei der Pflegekasse
              </Editable>
              <Editable as="p" id="home.pflegekasse.text" rich className="text-lg text-[#5F6B73] leading-relaxed font-light mb-8">
                Wussten Sie schon? Ab Pflegegrad 1 steht Ihnen ein monatlicher <strong>Entlastungsbetrag von 131 Euro (§ 45b SGB XI)</strong> zur Verfügung. Dieser kann für unsere haushaltsnahen Dienstleistungen und die Alltagsbegleitung genutzt werden.
              </Editable>
              <div className="cura-card-glow bg-[#F8FEFF] p-6 rounded-2xl border border-[#E5F4F5] mb-8">
                <h3 className="text-base font-medium text-[#111111] mb-2 flex items-center gap-2">
                  <Info size={18} className="text-[#6FD3D1]" /> <Editable as="span" id="home.pflegekasse.box.title">Weitere Möglichkeiten</Editable>
                </h3>
                <ul className="space-y-3 text-[15px] text-[#5F6B73] font-light">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={18} className="text-[#6FD3D1] mt-0.5 shrink-0" />
                    <Editable as="span" id="home.pflegekasse.box.0" rich><strong>Verhinderungspflege:</strong> Fällt die private Pflegeperson aus, können wir einspringen. Die Kosten trägt die Kasse.</Editable>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={18} className="text-[#6FD3D1] mt-0.5 shrink-0" />
                    <Editable as="span" id="home.pflegekasse.box.1" rich><strong>Umwandlung von Pflegesachleistungen:</strong> Nutzen Sie ungenutzte Sachleistungsbeträge für unsere Betreuung.</Editable>
                  </li>
                </ul>
              </div>
              <Link to="/entlastung" className="inline-flex items-center gap-2 text-sm font-medium text-[#0F7C77] hover:text-[#5BC2C0] transition-colors">
                <Editable as="span" id="home.pflegekasse.link">Mehr zu Ihren Ansprüchen erfahren</Editable> <ArrowRight size={16} />
              </Link>
            </div>

            <div className="cura-reveal cura-reveal-right cura-card-glow flex-1 w-full bg-[#F8FEFF] rounded-3xl p-8 lg:p-10 border border-[#E5F4F5]">
              <Editable as="h3" id="home.steps.title" style={jakarta} className="text-2xl font-medium tracking-tight text-[#111111] mb-8 text-center">
                Einfach und unkompliziert
              </Editable>
              <div className="space-y-8 relative">
                <div className="absolute left-6 top-8 bottom-8 w-px bg-[#DFF7F8] -z-10"></div>
                {[
                  { num: "1", title: "Beratung", desc: "Wir besprechen Ihre individuelle Situation und zeigen auf, welche Budgets der Pflegekasse Ihnen zustehen.", filled: false },
                  { num: "2", title: "Antrag & Organisation", desc: "Wir helfen Ihnen bei der Beantragung der Leistungen und planen gemeinsam die Einsätze nach Ihren Wünschen.", filled: false },
                  { num: "3", title: "Direkte Abrechnung", desc: "Sobald alles bewilligt ist, rechnen wir unsere Leistungen bequem und direkt mit Ihrer Pflegekasse ab. Sie müssen sich um nichts kümmern.", filled: true },
                ].map((step, i) => (
                  <div key={step.num} className="flex gap-6">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-medium text-lg shrink-0 ${step.filled ? "bg-[#0F7C77] text-white shadow-md" : "bg-white border-2 border-[#6FD3D1] text-[#0F7C77]"}`}
                      style={jakarta}
                    >
                      {step.num}
                    </div>
                    <div>
                      <Editable as="h4" id={`home.steps.${i}.title`} style={jakarta} className="text-lg font-medium text-[#111111] mb-1">{step.title}</Editable>
                      <Editable as="p" id={`home.steps.${i}.desc`} className="text-sm text-[#5F6B73] font-light">{step.desc}</Editable>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Senioren & Demenzbetreuung */}
      <section className="py-24 bg-[#F8FEFF]/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="cura-reveal cura-reveal-left order-2 lg:order-1 relative">
            <div className="aspect-square rounded-3xl overflow-hidden">
              <EditableImage id="home.demenz.image" src={demenzImage} alt="Betreuerin liest Seniorin vor" altId="home.demenz.image-alt" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-[#BFEAF2] opacity-10 rounded-3xl mix-blend-multiply"></div>
          </div>

          <div className="cura-reveal cura-reveal-right order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#0E6E6A] mb-6 uppercase tracking-wider">
              <Editable as="span" id="home.demenz.badge">Spezialisierte Betreuung</Editable>
            </div>
            <Editable as="h2" id="home.demenz.title" style={jakarta} className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-6">
              Senioren- und Demenzbetreuung mit Herz
            </Editable>
            <Editable as="p" id="home.demenz.text" className="text-lg text-[#5F6B73] leading-relaxed font-light mb-8">
              Menschen mit demenziellen Veränderungen benötigen eine Umgebung, die Geborgenheit und Sicherheit ausstrahlt. Wir begegnen unseren Klienten mit tiefem Respekt, Empathie und fachlichem Wissen.
            </Editable>
            <ul className="space-y-4 mb-8">
              {[
                { icon: <Sun size={24} className="text-[#6FD3D1] mt-0.5" />, title: "Tagesstruktur & Orientierung", desc: "Feste Rhythmen und vertraute Rituale geben Sicherheit im Alltag." },
                { icon: <MessageCircle size={24} className="text-[#6FD3D1] mt-0.5" />, title: "Biografiearbeit & Gespräche", desc: "Wir knüpfen an Lebensgeschichten an und aktivieren positive Erinnerungen." },
              ].map((item, i) => (
                <li key={i} className="cura-card-glow flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E5F4F5]">
                  {item.icon}
                  <div>
                    <Editable as="div" id={`home.demenz.${i}.title`} className="text-base font-medium text-[#111111]">{item.title}</Editable>
                    <Editable as="div" id={`home.demenz.${i}.desc`} className="text-sm text-[#5F6B73] font-light mt-1">{item.desc}</Editable>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/demenzbetreuung" className="inline-flex items-center gap-2 text-sm font-medium text-[#0F7C77] hover:text-[#5BC2C0] transition-colors">
              <Editable as="span" id="home.demenz.link">Mehr zur Demenzbetreuung</Editable> <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Families Choose Us */}
      <section className="py-20 bg-white/80">
        <div className="cura-reveal cura-reveal-up max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <Editable as="h2" id="home.why.title" style={jakarta} className="text-2xl lg:text-3xl font-medium tracking-tight text-[#111111] mb-12">
            Warum sich Familien für uns entscheiden
          </Editable>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
            {[
              { icon: <Heart size={32} strokeWidth={1.5} />, label: "Individuell" },
              { icon: <Clock size={32} strokeWidth={1.5} />, label: "Zuverlässig" },
              { icon: <Handshake size={32} strokeWidth={1.5} />, label: "Respektvoll" },
              { icon: <ShieldCheck size={32} strokeWidth={1.5} />, label: "Vertrauensvoll" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#F8FEFF] border border-[#E5F4F5] flex items-center justify-center text-[#0F7C77] mb-4">
                  {item.icon}
                </div>
                <Editable as="h3" id={`home.why.${i}`} className="text-base font-medium text-[#111111]">{item.label}</Editable>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PartnerSection />

      <GoogleReviews />

      <InstagramFeed />

      <EinzugsgebietSection />

      {/* Contact CTA */}
      <section className="py-24 lg:py-32 bg-white/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-5xl font-medium tracking-tight text-[#111111] mb-6" style={jakarta}>
            <Editable as="span" id="home.cta.title">Interesse an einer kostenlosen</Editable> <br className="hidden lg:block" /><Editable as="span" id="home.cta.title-line2">und unverbindlichen Beratung?</Editable>
          </h2>
          <Editable as="p" id="home.cta.text" className="text-lg lg:text-xl text-[#5F6B73] mb-10 max-w-2xl mx-auto font-light">
            Wir nehmen uns Zeit für Sie und beantworten alle Fragen zur Pflegekasse in Ruhe – persönlich und ohne Verpflichtung.
          </Editable>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/kontakt" className="w-full sm:w-auto bg-[#0F7C77] text-white hover:bg-[#0E6E6A] px-8 py-4 rounded-full text-base font-normal transition-all flex items-center justify-center gap-2 shadow-sm">
              <Mail size={20} />
              <Editable as="span" id="home.cta.button-anfrage">Jetzt anfragen</Editable>
            </Link>
            <a href="tel:+4951517107093" className="w-full sm:w-auto bg-[#F8FEFF] text-[#111111] border border-[#E5F4F5] hover:bg-[#DFF7F8] px-8 py-4 rounded-full text-base font-normal transition-all flex items-center justify-center gap-2">
              <Phone size={20} className="text-[#6FD3D1]" />
              Anrufen: <Editable as="span" id="shared.tel_display">05151 7107093</Editable>
            </a>
          </div>
          <div className="text-sm text-[#5F6B73] font-light flex items-center justify-center gap-2">
            <Clock size={16} className="text-[#6FD3D1]" />
            <Editable as="span" id="home.cta.note">Wir melden uns in der Regel innerhalb von 24 Stunden bei Ihnen.</Editable>
          </div>
        </div>
      </section>
    </>
  );
}