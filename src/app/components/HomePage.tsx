import { Link } from "react-router";
import {
  Home, Brain, Users, Info, CheckCircle,
  MapPin, Clock, Sun, MessageCircle, ShieldCheck, Heart, Handshake,
  ArrowRight, HandHeart, Phone, Mail, Sparkles, Repeat, Calendar, ExternalLink,
} from "lucide-react";
import { EinzugsgebietSection } from "./EinzugsgebietSection";
import { GoogleReviews } from "./GoogleReviews";
import { InstagramFeed } from "./InstagramFeed";
import LightPillar from "./LightPillar";

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
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#6FD3D1] mb-5 uppercase tracking-wider">
            <Handshake size={14} /> Unsere Partner
          </div>
          <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Gemeinsam stark für Sie
          </h2>
          <p className="text-[15px] lg:text-base text-[#5F6B73] font-light leading-relaxed">
            Wir arbeiten vertrauensvoll mit Beratungs- und Versorgungspartnern zusammen,
            um Ihnen eine umfassende Betreuung zu ermöglichen.
          </p>
        </div>

        {/* Mobile: swipe / Desktop: marquee */}
        <div className="relative">
          <div className="hidden md:block relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="flex gap-6 motion-safe:animate-[curaPartnerMarquee_45s_linear_infinite]">
              {loop.map((p, i) => (
                <PartnerCard key={`${p.name}-${i}`} partner={p} />
              ))}
            </div>
          </div>
          <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6">
            {partners.map((p) => (
              <div key={p.name} className="snap-start shrink-0 w-[80%]">
                <PartnerCard partner={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes curaPartnerMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative shrink-0 w-64 bg-white rounded-2xl border border-[#E5F4F5] shadow-[0_8px_24px_rgb(191,234,242,0.25)] hover:shadow-[0_14px_32px_rgb(191,234,242,0.45)] hover:border-[#BFEAF2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6FD3D1] transition-all duration-200 p-5 flex items-center gap-4 motion-safe:animate-[curaFadeIn_900ms_ease-out_both] no-underline"
      aria-label={`${partner.name} — externe Website öffnen`}
    >
      {/* Logo with bg-mint tile so transparent-PNG logos read on white */}
      <div className="w-14 h-14 rounded-xl bg-[#F8FEFF] border border-[#E5F4F5] flex items-center justify-center shrink-0 overflow-hidden">
        <img
          src={partner.logoUrl}
          alt={`${partner.name} Logo`}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="max-w-[80%] max-h-[80%] object-contain"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#9AA3A8] font-light mb-0.5">
          Partner
          <ExternalLink size={10} className="text-[#9AA3A8] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="text-sm font-medium text-[#111111] truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {partner.name}
        </div>
        <div className="text-[11px] text-[#5F6B73] font-light truncate">
          {partner.tagline}
        </div>
      </div>
      <style>{`@keyframes curaFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </a>
  );
}

const heroImage = "https://images.unsplash.com/photo-1773227055624-07b515ba87c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJlZ2l2ZXIlMjBob2xkaW5nJTIwZWxkZXJseSUyMHdvbWFuJTIwaGFuZHN8ZW58MXx8fHwxNzc1MzE0MDE0fDA&ixlib=rb-4.1.0&q=80&w=1080";
const demenzImage = "https://images.unsplash.com/photo-1758691031958-29541f3207a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJlZ2l2ZXIlMjByZWFkaW5nJTIwYm9vayUyMHNlbmlvciUyMHdvbWFufGVufDF8fHx8MTc3NTMxNDAxNHww&ixlib=rb-4.1.0&q=80&w=1080";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export function HomePage() {
  return (
    <>
      {/* Hero Section — dark, with the animated LightPillar backdrop */}
      <section className="relative pt-16 pb-28 lg:pt-28 lg:pb-36 overflow-hidden bg-[#0A1018]">
        {/* Animated light pillar (React Bits). Screen-blended over the dark bg. */}
        <LightPillar
          className="pointer-events-none z-0"
          topColor="#f0f0f0"
          bottomColor="#00daff"
          intensity={1}
          rotationSpeed={0.3}
          glowAmount={0.002}
          pillarWidth={3}
          pillarHeight={0.4}
          noiseIntensity={0.5}
          pillarRotation={25}
          interactive={false}
          mixBlendMode="screen"
          quality="high"
        />
        {/* Readability scrim — keeps text legible over the bright pillar
            (stronger top/bottom, lighter in the middle to preserve the glow) */}
        <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-[#0A1018]/55 via-[#0A1018]/25 to-[#0A1018]/45" />
        {/* Soft fade so the dark hero melts into the light page below */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#F8FEFF] z-[2] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="cura-hero-text flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm text-xs font-normal text-white/85 mb-8">
              <HandHeart size={18} strokeWidth={1.5} className="text-[#6FD3D1]" />
              Vertrauensvolle Betreuung im eigenen Zuhause
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.15] mb-6" style={jakarta}>
              Sie können nicht immer da sein. <br className="hidden lg:block" />
              <span className="text-[#6FD3D1]">Wir können es.</span>
            </h1>
            <p className="text-lg lg:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-10 font-light">
              Liebevolle und individuelle Unterstützung für pflegebedürftige Menschen in ihrer gewohnten Umgebung. Wir entlasten Angehörige und fördern ein würdevolles, selbstbestimmtes Leben.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
              <Link to="/kontakt" className="w-full sm:w-auto bg-[#6FD3D1] text-white hover:bg-[#5BC2C0] px-8 py-3.5 rounded-full text-base font-normal transition-all shadow-[0_8px_20px_rgb(111,211,209,0.25)] flex items-center justify-center gap-2">
                Kostenlos beraten lassen
              </Link>
              <Link to="/leistungen" className="w-full sm:w-auto bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm px-8 py-3.5 rounded-full text-base font-normal transition-all flex items-center justify-center">
                Unsere Leistungen
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-white/60 font-light">
              <span className="inline-flex items-center gap-1.5"><CheckCircle size={14} className="text-[#6FD3D1]" /> Anerkannter Anbieter</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle size={14} className="text-[#6FD3D1]" /> Abrechnung über Pflegekasse möglich</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle size={14} className="text-[#6FD3D1]" /> Persönliche Betreuung</span>
            </div>
          </div>

          <div className="cura-hero-image flex-1 w-full max-w-lg lg:max-w-none relative">
            <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_60px_rgb(191,234,242,0.4)] border-4 border-white">
              <img src={heroImage} alt="Betreuerin hält die Hände einer älteren Dame" className="w-full h-auto aspect-[4/3] object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-4 lg:-left-12 bg-white p-5 rounded-2xl shadow-[0_10px_30px_rgb(0,0,0,0.05)] border border-[#E5F4F5] flex items-center gap-4">
              <div className="w-12 h-12 bg-[#DFF7F8] rounded-full flex items-center justify-center text-[#6FD3D1]">
                <ShieldCheck size={24} strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-sm font-medium tracking-tight text-[#111111]" style={jakarta}>Anerkannter Partner</div>
                <div className="text-xs text-[#5F6B73] font-light mt-0.5">Abrechnung mit der Pflegekasse</div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          /* Slow slide-in from the sides on first render. The text on
             the left, the image on the right — image enters a touch
             later so the eye lands on the headline first. */
          @keyframes curaHeroEnterLeft {
            0%   { opacity: 0; transform: translateX(-44px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          @keyframes curaHeroEnterRight {
            0%   { opacity: 0; transform: translateX(44px); }
            100% { opacity: 1; transform: translateX(0); }
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
        `}</style>
      </section>

      {/* Introduction */}
      <section className="py-24 bg-white/80">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Users size={48} strokeWidth={1} className="text-[#BFEAF2] mb-6 mx-auto" />
          <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-6" style={jakarta}>
            Der Mensch im Mittelpunkt
          </h2>
          <p className="text-lg lg:text-xl text-[#5F6B73] leading-relaxed font-light">
            Cura Doma ist Ihr anerkannter ambulanter Betreuungsdienst. Unsere Mission ist es, pflegebedürftigen Menschen und ihren Familien zur Seite zu stehen. Wir fördern die Selbstständigkeit, schaffen Freiräume für pflegende Angehörige und machen es möglich, so lange wie möglich sicher und geborgen im eigenen Zuhause zu leben.
          </p>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-24 bg-[#F8FEFF]/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-4" style={jakarta}>
              Wie wir Sie unterstützen können
            </h2>
            <p className="text-lg text-[#5F6B73] font-light">
              Individuelle Leistungen, die sich sanft in Ihren Alltag einfügen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Sparkles size={28} strokeWidth={1.5} />, title: "Entlastungsleistungen", desc: "Monatlich 131 € nach § 45a SGB XI für Alltagsbegleitung, Haushaltshilfe und Betreuung – direkt mit der Pflegekasse abgerechnet.", link: "/entlastung" },
              { icon: <Brain size={28} strokeWidth={1.5} />, title: "Demenz- & Seniorenbetreuung", desc: "Einfühlsame, strukturierte Begleitung mit Empathie, Geduld und fachlicher Kompetenz – für Würde und Lebensqualität zu Hause.", link: "/demenzbetreuung" },
              { icon: <Home size={28} strokeWidth={1.5} />, title: "Haushaltsnahe Dienstleistungen", desc: "Reinigung, Wäschepflege, Einkaufshilfe und Zubereitung kleiner Mahlzeiten – damit Sie sich zu Hause weiterhin wohlfühlen.", link: "/haushaltsnahe-dienstleistungen" },
              { icon: <Repeat size={28} strokeWidth={1.5} />, title: "Umwandlung in Sachleistungen", desc: "Bis zu 40 % Ihres Pflegegeldes (ab Pflegegrad 2) in konkrete Betreuungsleistungen umwandeln – mehr praktische Hilfe im Alltag.", link: "/umwandlung-sachleistungen" },
              { icon: <Calendar size={28} strokeWidth={1.5} />, title: "Verhinderungspflege", desc: "Bis zu 1.612 € pro Jahr (ab Pflegegrad 2), wenn die private Pflegeperson Urlaub, Krankheit oder eine Pause braucht.", link: "/verhinderungspflege" },
              { icon: <Users size={28} strokeWidth={1.5} />, title: "Entlastung für Angehörige", desc: "Verlässliche Übernahme der Betreuung, damit pflegende Familienmitglieder beruhigt neue Kraft schöpfen können.", link: "/leistungen" },
            ].map((service, i) => (
              <Link
                key={i}
                to={service.link}
                className="group bg-white/90 backdrop-blur-sm p-8 rounded-3xl border border-[#E5F4F5] shadow-sm hover:shadow-md hover:border-[#BFEAF2] transition-all duration-300 flex flex-col"
              >
                <div className="w-14 h-14 bg-[#DFF7F8] rounded-2xl flex items-center justify-center text-[#6FD3D1] mb-6">
                  {service.icon}
                </div>
                <h3 className="text-xl font-medium tracking-tight text-[#111111] mb-3" style={jakarta}>{service.title}</h3>
                <p className="text-[15px] text-[#5F6B73] leading-relaxed font-light mb-5 flex-1">{service.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6FD3D1] group-hover:gap-2.5 transition-all">
                  Mehr erfahren <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/leistungen" className="inline-flex items-center gap-2 text-sm font-medium text-[#6FD3D1] hover:text-[#5BC2C0] transition-colors">
              Alle Leistungen im Detail ansehen <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Entlastungsleistungen & Pflegekasse */}
      <section className="py-24 bg-white/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-6" style={jakarta}>
                Ihre Ansprüche bei der Pflegekasse
              </h2>
              <p className="text-lg text-[#5F6B73] leading-relaxed font-light mb-8">
                Wussten Sie schon? Ab Pflegegrad 1 steht Ihnen ein monatlicher <strong>Entlastungsbetrag von 131 Euro (§ 45b SGB XI)</strong> zur Verfügung. Dieser kann für unsere haushaltsnahen Dienstleistungen und die Alltagsbegleitung genutzt werden.
              </p>
              <div className="bg-[#F8FEFF] p-6 rounded-2xl border border-[#E5F4F5] mb-8">
                <h4 className="text-base font-medium text-[#111111] mb-2 flex items-center gap-2">
                  <Info size={18} className="text-[#6FD3D1]" /> Weitere Möglichkeiten
                </h4>
                <ul className="space-y-3 text-[15px] text-[#5F6B73] font-light">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={18} className="text-[#6FD3D1] mt-0.5 shrink-0" />
                    <span><strong>Verhinderungspflege:</strong> Fällt die private Pflegeperson aus, können wir einspringen. Die Kosten trägt die Kasse.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={18} className="text-[#6FD3D1] mt-0.5 shrink-0" />
                    <span><strong>Umwandlung von Pflegesachleistungen:</strong> Nutzen Sie ungenutzte Sachleistungsbeträge für unsere Betreuung.</span>
                  </li>
                </ul>
              </div>
              <Link to="/entlastung" className="inline-flex items-center gap-2 text-sm font-medium text-[#6FD3D1] hover:text-[#5BC2C0] transition-colors">
                Mehr zu Ihren Ansprüchen erfahren <ArrowRight size={16} />
              </Link>
            </div>

            <div className="flex-1 w-full bg-[#F8FEFF] rounded-3xl p-8 lg:p-10 border border-[#E5F4F5]">
              <h3 className="text-2xl font-medium tracking-tight text-[#111111] mb-8 text-center" style={jakarta}>
                Einfach und unkompliziert
              </h3>
              <div className="space-y-8 relative">
                <div className="absolute left-6 top-8 bottom-8 w-px bg-[#DFF7F8] -z-10"></div>
                {[
                  { num: "1", title: "Beratung", desc: "Wir besprechen Ihre individuelle Situation und zeigen auf, welche Budgets der Pflegekasse Ihnen zustehen.", filled: false },
                  { num: "2", title: "Antrag & Organisation", desc: "Wir helfen Ihnen bei der Beantragung der Leistungen und planen gemeinsam die Einsätze nach Ihren Wünschen.", filled: false },
                  { num: "3", title: "Direkte Abrechnung", desc: "Sobald alles bewilligt ist, rechnen wir unsere Leistungen bequem und direkt mit Ihrer Pflegekasse ab. Sie müssen sich um nichts kümmern.", filled: true },
                ].map((step) => (
                  <div key={step.num} className="flex gap-6">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-medium text-lg shrink-0 ${step.filled ? "bg-[#6FD3D1] text-white shadow-md" : "bg-white border-2 border-[#6FD3D1] text-[#6FD3D1]"}`}
                      style={jakarta}
                    >
                      {step.num}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-[#111111] mb-1" style={jakarta}>{step.title}</h4>
                      <p className="text-sm text-[#5F6B73] font-light">{step.desc}</p>
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
          <div className="order-2 lg:order-1 relative">
            <div className="aspect-square rounded-3xl overflow-hidden">
              <img src={demenzImage} alt="Betreuerin liest Seniorin vor" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-[#BFEAF2] opacity-10 rounded-3xl mix-blend-multiply"></div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#6FD3D1] mb-6 uppercase tracking-wider">
              Spezialisierte Betreuung
            </div>
            <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-6" style={jakarta}>
              Senioren- und Demenzbetreuung mit Herz
            </h2>
            <p className="text-lg text-[#5F6B73] leading-relaxed font-light mb-8">
              Menschen mit demenziellen Veränderungen benötigen eine Umgebung, die Geborgenheit und Sicherheit ausstrahlt. Wir begegnen unseren Klienten mit tiefem Respekt, Empathie und fachlichem Wissen.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                { icon: <Sun size={24} className="text-[#6FD3D1] mt-0.5" />, title: "Tagesstruktur & Orientierung", desc: "Feste Rhythmen und vertraute Rituale geben Sicherheit im Alltag." },
                { icon: <MessageCircle size={24} className="text-[#6FD3D1] mt-0.5" />, title: "Biografiearbeit & Gespräche", desc: "Wir knüpfen an Lebensgeschichten an und aktivieren positive Erinnerungen." },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E5F4F5]">
                  {item.icon}
                  <div>
                    <div className="text-base font-medium text-[#111111]">{item.title}</div>
                    <div className="text-sm text-[#5F6B73] font-light mt-1">{item.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/demenzbetreuung" className="inline-flex items-center gap-2 text-sm font-medium text-[#6FD3D1] hover:text-[#5BC2C0] transition-colors">
              Mehr zur Demenzbetreuung <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Families Choose Us */}
      <section className="py-20 bg-white/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-2xl lg:text-3xl font-medium tracking-tight text-[#111111] mb-12" style={jakarta}>
            Warum sich Familien für uns entscheiden
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
            {[
              { icon: <Heart size={32} strokeWidth={1.5} />, label: "Individuell" },
              { icon: <Clock size={32} strokeWidth={1.5} />, label: "Zuverlässig" },
              { icon: <Handshake size={32} strokeWidth={1.5} />, label: "Respektvoll" },
              { icon: <ShieldCheck size={32} strokeWidth={1.5} />, label: "Vertrauensvoll" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#F8FEFF] border border-[#E5F4F5] flex items-center justify-center text-[#6FD3D1] mb-4">
                  {item.icon}
                </div>
                <h4 className="text-base font-medium text-[#111111]">{item.label}</h4>
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
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-5xl font-medium tracking-tight text-[#111111] mb-6" style={jakarta}>
            Interesse an einer kostenlosen <br className="hidden lg:block" />und unverbindlichen Beratung?
          </h2>
          <p className="text-lg lg:text-xl text-[#5F6B73] mb-10 max-w-2xl mx-auto font-light">
            Wir nehmen uns Zeit für Sie und beantworten alle Fragen zur Pflegekasse in Ruhe – persönlich und ohne Verpflichtung.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/kontakt" className="w-full sm:w-auto bg-[#6FD3D1] text-white hover:bg-[#5BC2C0] px-8 py-4 rounded-full text-base font-normal transition-all flex items-center justify-center gap-2 shadow-sm">
              <Mail size={20} />
              Jetzt anfragen
            </Link>
            <a href="tel:+4951517107093" className="w-full sm:w-auto bg-[#F8FEFF] text-[#111111] border border-[#E5F4F5] hover:bg-[#DFF7F8] px-8 py-4 rounded-full text-base font-normal transition-all flex items-center justify-center gap-2">
              <Phone size={20} className="text-[#6FD3D1]" />
              Anrufen: 05151 7107093
            </a>
          </div>
          <div className="text-sm text-[#5F6B73] font-light flex items-center justify-center gap-2">
            <Clock size={16} className="text-[#6FD3D1]" />
            Wir melden uns in der Regel innerhalb von 24 Stunden bei Ihnen.
          </div>
        </div>
      </section>
    </>
  );
}