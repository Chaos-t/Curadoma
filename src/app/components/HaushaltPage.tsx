import { Link } from "react-router";
import { CheckCircle, Sparkles, Phone, ShieldCheck, Home } from "lucide-react";
import { Editable } from "./editor/Editable";

const jakarta = { fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif" };

export function HaushaltPage() {
  const leistungen = [
    { title: "Unterstützung bei der Reinigung der Wohnung", desc: "Staubsaugen, Wischen, Bad- und Küchenreinigung." },
    { title: "Wäschepflege", desc: "Waschen, Trocknen, Bügeln und Zusammenlegen, Betten ab- und beziehen." },
    { title: "Einkaufshilfe", desc: "Begleitung zum Supermarkt oder komplette Erledigung des Einkaufs nach Wunsch und Bedarf." },
    { title: "Zubereitung kleiner Mahlzeiten", desc: "Unterstützung beim Kochen oder Bereitstellung einfacher Speisen." },
  ];

  const vorteile = [
    "Entlastung für Pflegebedürftige und Angehörige",
    "Mehr Zeit für das Wesentliche im Leben",
    "Vertrauensvolle, geschulte Mitarbeitende",
    "Unterstützung im gewohnten Umfeld",
    "Anerkannt nach § 45a SGB XI vom Landesamt für Soziales",
  ];

  return (
    <>
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#0E6E6A] mb-6 uppercase tracking-wider">
            <Editable as="span" id="haushalt.hero.badge">§ 45a SGB XI</Editable>
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-6" style={jakarta}>
            <Editable as="span" id="haushalt.hero.title">Haushaltsnahe</Editable> <span className="text-[#0F7C77]"><Editable as="span" id="haushalt.hero.title.accent">Dienstleistungen</Editable></span>
          </h1>
          <p className="text-lg text-[#5F6B73] leading-relaxed font-light">
            <Editable as="span" id="haushalt.hero.subtitle">Unterstützung im Alltag nach § 45a SGB XI – zuverlässig, individuell und mit Herz.</Editable>
          </p>
        </div>
      </section>

      <section className="py-20 bg-white/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 space-y-6 text-[17px] text-[#5F6B73] font-light leading-relaxed">
          <p>
            <Editable as="span" id="haushalt.intro.paragraph0">Der Alltag kann im Alter oder bei gesundheitlichen Einschränkungen schnell zur Herausforderung werden. Viele Aufgaben im Haushalt, die früher selbstverständlich waren, erfordern plötzlich Hilfe. Genau hier setzen unsere haushaltsnahen Dienstleistungen an – zuverlässig, individuell und mit Herz.</Editable>
          </p>
          <p>
            <Editable as="span" id="haushalt.intro.paragraph1">Als anerkannter Betreuungsdienst unterstützen wir Sie oder Ihre Angehörigen im täglichen Leben und sorgen dafür, dass Sie sich in Ihrem Zuhause weiterhin wohlfühlen können. Unsere Leistungen können über den Entlastungsbetrag der Pflegekasse abgerechnet werden – sprechen Sie uns gerne an, wir beraten Sie unverbindlich.</Editable>
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#F8FEFF]/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <h2 className="cura-reveal cura-reveal-up text-3xl font-medium tracking-tight text-[#111111] mb-12 text-center" style={jakarta}>
            <Editable as="span" id="haushalt.services.heading">Unsere haushaltsnahen Dienstleistungen im Überblick</Editable>
          </h2>
          <div className="cura-reveal cura-reveal-up grid grid-cols-1 md:grid-cols-2 gap-6">
            {leistungen.map((l, i) => (
              <div key={i} className="cura-card-glow bg-white p-7 rounded-3xl border border-[#E5F4F5] shadow-sm">
                <div className="w-12 h-12 bg-[#DFF7F8] rounded-2xl flex items-center justify-center text-[#0E6E6A] mb-4">
                  <Home size={22} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium text-[#111111] mb-2" style={jakarta}><Editable as="span" id={`haushalt.services.${i}.title`}>{l.title}</Editable></h3>
                <p className="text-[15px] text-[#5F6B73] font-light leading-relaxed"><Editable as="span" id={`haushalt.services.${i}.desc`}>{l.desc}</Editable></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/80">
        <div className="max-w-4xl mx-auto px-6">
          <div className="cura-reveal cura-reveal-up cura-card-glow bg-[#F8FEFF] p-8 lg:p-10 rounded-3xl border border-[#E5F4F5]">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles size={24} className="text-[#6FD3D1]" />
              <h2 className="text-2xl font-medium tracking-tight text-[#111111]" style={jakarta}>
                <Editable as="span" id="haushalt.vorteile.heading">Ihre Vorteile auf einen Blick</Editable>
              </h2>
            </div>
            <ul className="space-y-3">
              {vorteile.map((v, i) => (
                <li key={i} className="flex items-start gap-3 text-[#5F6B73] font-light">
                  <CheckCircle size={20} className="text-[#6FD3D1] mt-0.5 shrink-0" />
                  <span><Editable as="span" id={`haushalt.vorteile.${i}`}>{v}</Editable></span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F8FEFF]/80">
        <div className="cura-reveal cura-reveal-up max-w-3xl mx-auto px-6 text-center">
          <ShieldCheck size={48} strokeWidth={1} className="text-[#BFEAF2] mb-6 mx-auto" />
          <h2 className="text-2xl lg:text-3xl font-medium tracking-tight text-[#111111] mb-4" style={jakarta}>
            <Editable as="span" id="haushalt.cta.heading">Lassen Sie sich kostenlos beraten</Editable>
          </h2>
          <p className="text-lg text-[#5F6B73] font-light mb-8">
            <Editable as="span" id="haushalt.cta.text">Wir zeigen Ihnen, wie Sie unsere haushaltsnahen Dienstleistungen über die Pflegekasse abrechnen können.</Editable>
          </p>
          <Link to="/kontakt" className="inline-flex items-center gap-2 bg-[#0F7C77] text-white hover:bg-[#0E6E6A] px-8 py-3.5 rounded-full text-base font-normal transition-all shadow-sm">
            <Phone size={18} /> <Editable as="span" id="haushalt.cta.button">Jetzt anfragen</Editable>
          </Link>
        </div>
      </section>
    </>
  );
}
