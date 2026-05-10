import { Link } from "react-router";
import {
  Coffee, Home, Route, Brain, Users, ClipboardList, Heart, ShieldCheck,
  ArrowRight, Phone, CheckCircle, Sparkles, BookOpen, UtensilsCrossed,
} from "lucide-react";

import carSide from "../../imports/WhatsApp_Image_2026-04-28_at_11.59.22-1.jpeg";
import carRear from "../../imports/WhatsApp_Image_2026-04-28_at_11.59.22_(1)-1.jpeg";
import carDriver from "../../imports/WhatsApp_Image_2026-04-28_at_11.59.23-1.jpeg";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const img1 = "https://images.unsplash.com/photo-1761574928717-d626a2b42ab4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwY291cGxlJTIwd2Fsa2luZyUyMGdhcmRlbiUyMHBlYWNlZnVsfGVufDF8fHx8MTc3NTMxNDQ5MHww&ixlib=rb-4.1.0&q=80&w=1080";
const img2 = "https://images.unsplash.com/photo-1595715316313-1730ee539c64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwY2xlYW5pbmclMjBzZXJ2aWNlJTIwdGlkeSUyMGxpdmluZyUyMHJvb218ZW58MXx8fHwxNzc1MzE0NDkwfDA&ixlib=rb-4.1.0&q=80&w=1080";

const services = [
  {
    icon: <Coffee size={28} strokeWidth={1.5} />,
    title: "Alltagsbegleitung",
    desc: "Zuhören, Vorlesen, gemeinsame Spaziergänge oder Kochen. Wir leisten Gesellschaft und bringen Freude in den Tag.",
    details: [
      "Gemeinsame Spaziergänge und Ausflüge",
      "Vorlesen, Spielen und kreative Beschäftigung",
      "Begleitung bei Hobbys und Interessen",
      "Gesellschaft und Gespräche gegen Einsamkeit",
    ],
  },
  {
    icon: <Home size={28} strokeWidth={1.5} />,
    title: "Hilfe im Haushalt",
    desc: "Unterstützung bei der Reinigung der Wohnung, Wäschepflege und beim Einkaufen – für ein gepflegtes Zuhause.",
    details: [
      "Reinigung und Pflege der Wohnräume",
      "Wäsche waschen, bügeln und einräumen",
      "Einkaufen und Besorgungen erledigen",
      "Blumen- und Pflanzenpflege",
    ],
  },
  {
    icon: <Route size={28} strokeWidth={1.5} />,
    title: "Begleitung zu Terminen",
    desc: "Sichere Begleitung zu Ärzten, Behörden oder Veranstaltungen. Wir organisieren den Ablauf und bleiben an Ihrer Seite.",
    details: [
      "Arztbesuche und Therapietermine",
      "Behördengänge und Amtsbesuche",
      "Begleitung zu kulturellen Veranstaltungen",
      "Fahrdienst-Organisation und Begleitung",
    ],
  },
  {
    icon: <Brain size={28} strokeWidth={1.5} />,
    title: "Demenzbetreuung",
    desc: "Fachkundige, einfühlsame Betreuung, die Struktur gibt, Erinnerungen aktiviert und Sicherheit vermittelt.",
    details: [
      "Individuelle Tagesstrukturierung",
      "Gedächtnistraining und Biografiearbeit",
      "Validation und einfühlsame Kommunikation",
      "Sichere und vertraute Umgebung schaffen",
    ],
  },
  {
    icon: <Users size={28} strokeWidth={1.5} />,
    title: "Entlastung für Angehörige",
    desc: "Verlässliche Übernahme der Betreuung, damit pflegende Familienmitglieder beruhigt neue Kraft schöpfen können.",
    details: [
      "Stundenweise Betreuungsübernahme",
      "Regelmäßige feste Betreuungszeiten",
      "Flexible Einsatzplanung nach Ihren Bedürfnissen",
      "Vertrauensvolle Bezugspersonen für Ihre Liebsten",
    ],
  },
  {
    icon: <ClipboardList size={28} strokeWidth={1.5} />,
    title: "Alltagsorganisation",
    desc: "Hilfe beim Schriftverkehr, Organisieren von Mahlzeitendiensten oder Planung der Woche. Wir bringen Ordnung hinein.",
    details: [
      "Hilfe beim Schriftverkehr und Post",
      "Organisation von Mahlzeitendiensten",
      "Wochenplanung und Terminkoordination",
      "Unterstützung bei Anträgen und Formularen",
    ],
  },
];

export function LeistungenPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#BFEAF2] opacity-15 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#6FD3D1] mb-6 uppercase tracking-wider">
              Unsere Leistungen
            </div>
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-6" style={jakarta}>
              Individuelle Unterstützung, <br className="hidden lg:block" />
              <span className="text-[#6FD3D1]">die Ihren Alltag bereichert</span>
            </h1>
            <p className="text-lg text-[#5F6B73] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
              Unser Angebot umfasst vielfältige Leistungen, die sich sanft und flexibel in den Alltag pflegebedürftiger Menschen einfügen. Jeder Mensch ist einzigartig – und genau so gestalten wir unsere Betreuung.
            </p>
          </div>
          <div className="flex-1 w-full max-w-md lg:max-w-none">
            <div className="rounded-3xl overflow-hidden shadow-[0_20px_60px_rgb(191,234,242,0.3)] border-4 border-white">
              <img src={img1} alt="Seniorenpaar im Garten" className="w-full aspect-[4/3] object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Detail */}
      <section className="py-24 bg-white/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service, i) => (
              <div key={i} className="bg-[#F8FEFF]/80 backdrop-blur-sm p-8 rounded-3xl border border-[#E5F4F5] hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start gap-5 mb-5">
                  <div className="w-14 h-14 bg-[#DFF7F8] rounded-2xl flex items-center justify-center text-[#6FD3D1] shrink-0">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium tracking-tight text-[#111111] mb-2" style={jakarta}>{service.title}</h3>
                    <p className="text-[15px] text-[#5F6B73] leading-relaxed font-light">{service.desc}</p>
                  </div>
                </div>
                <ul className="space-y-2 ml-[4.75rem]">
                  {service.details.map((detail, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-[#5F6B73] font-light">
                      <CheckCircle size={16} className="text-[#6FD3D1] mt-0.5 shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fahrzeug-Galerie */}
      <section className="py-24 bg-white/70">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#6FD3D1] mb-5 uppercase tracking-wider">
              Mobil für Sie unterwegs
            </div>
            <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-4" style={jakarta}>
              Wir kommen zu Ihnen nach Hause
            </h2>
            <p className="text-[15px] lg:text-base text-[#5F6B73] font-light leading-relaxed">
              Mit unserem Cura&nbsp;Doma Fahrzeug sind wir flexibel im gesamten Einzugsgebiet rund um Hameln im Einsatz —
              für Betreuung, Begleitung und haushaltsnahe Dienstleistungen direkt bei Ihnen vor Ort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-2 lg:row-span-1 rounded-3xl overflow-hidden shadow-[0_18px_50px_rgb(191,234,242,0.35)] border-4 border-white">
              <img src={carSide} alt="Cura Doma Fahrzeug — Seitenansicht mit Logo und Leistungen" className="w-full h-full aspect-[16/9] object-cover" />
            </div>
            <div className="rounded-3xl overflow-hidden shadow-[0_18px_50px_rgb(191,234,242,0.35)] border-4 border-white">
              <img src={carRear} alt="Cura Doma Fahrzeug — Heckansicht" className="w-full h-full aspect-[4/3] object-cover" />
            </div>
            <div className="md:col-span-2 lg:col-span-3 rounded-3xl overflow-hidden shadow-[0_18px_50px_rgb(191,234,242,0.35)] border-4 border-white">
              <img src={carDriver} alt="Cura Doma Fahrzeug — Fahrerseite mit Schriftzügen Betreuung, Begleitung, Beratung" className="w-full aspect-[21/9] object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Image + Text */}
      <section className="py-24 bg-[#F8FEFF]/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative rounded-3xl overflow-hidden">
            <img src={img2} alt="Gepflegtes Zuhause" className="w-full aspect-[4/3] object-cover rounded-3xl" />
          </div>
          <div>
            <h2 className="text-3xl font-medium tracking-tight text-[#111111] mb-6" style={jakarta}>
              Für ein Zuhause, das sich wie Zuhause anfühlt
            </h2>
            <p className="text-lg text-[#5F6B73] leading-relaxed font-light mb-6">
              Wir glauben daran, dass ein gepflegtes, ordentliches Umfeld zum Wohlbefinden beiträgt. Unsere haushaltsnahen Dienstleistungen sorgen dafür, dass sich Ihr Zuhause immer einladend und sicher anfühlt.
            </p>
            <p className="text-lg text-[#5F6B73] leading-relaxed font-light mb-8">
              Dabei respektieren wir stets Ihre persönlichen Gewohnheiten und Vorlieben. Nichts geschieht, ohne dass Sie es möchten.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/kontakt" className="bg-[#6FD3D1] text-white hover:bg-[#5BC2C0] px-8 py-3.5 rounded-full text-base font-normal transition-all shadow-[0_8px_20px_rgb(111,211,209,0.25)] flex items-center justify-center gap-2">
                Jetzt beraten lassen
              </Link>
              <Link to="/entlastung" className="bg-white text-[#5F6B73] border border-[#E5F4F5] hover:bg-[#F8FEFF] px-8 py-3.5 rounded-full text-base font-normal transition-all flex items-center justify-center gap-2">
                Kostenübernahme prüfen
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 bg-white/80">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ShieldCheck size={48} strokeWidth={1} className="text-[#BFEAF2] mb-6 mx-auto" />
          <h2 className="text-2xl lg:text-3xl font-medium tracking-tight text-[#111111] mb-4" style={jakarta}>
            Anerkannt und vertrauensvoll
          </h2>
          <p className="text-lg text-[#5F6B73] font-light mb-8">
            Als zugelassener Betreuungsdienst nach § 45b SGB XI rechnen wir unsere Leistungen direkt mit Ihrer Pflegekasse ab. Für Sie entstehen keine zusätzlichen Kosten im Rahmen Ihres Entlastungsbetrags.
          </p>
          <Link to="/kontakt" className="inline-flex items-center gap-2 bg-[#6FD3D1] text-white hover:bg-[#5BC2C0] px-8 py-3.5 rounded-full text-base font-normal transition-all shadow-sm">
            <Phone size={18} /> Kostenloses Erstgespräch vereinbaren
          </Link>
        </div>
      </section>
    </>
  );
}
