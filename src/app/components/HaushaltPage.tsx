import { Link } from "react-router";
import { CheckCircle, Sparkles, Phone, ShieldCheck, Home } from "lucide-react";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

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
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#6FD3D1] mb-6 uppercase tracking-wider">
            § 45a SGB XI
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-6" style={jakarta}>
            Haushaltsnahe <span className="text-[#6FD3D1]">Dienstleistungen</span>
          </h1>
          <p className="text-lg text-[#5F6B73] leading-relaxed font-light">
            Unterstützung im Alltag nach § 45a SGB XI – zuverlässig, individuell und mit Herz.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white/80">
        <div className="max-w-4xl mx-auto px-6 space-y-6 text-[17px] text-[#5F6B73] font-light leading-relaxed">
          <p>
            Der Alltag kann im Alter oder bei gesundheitlichen Einschränkungen schnell zur Herausforderung werden. Viele Aufgaben im Haushalt, die früher selbstverständlich waren, erfordern plötzlich Hilfe. Genau hier setzen unsere haushaltsnahen Dienstleistungen an – zuverlässig, individuell und mit Herz.
          </p>
          <p>
            Als anerkannter Betreuungsdienst unterstützen wir Sie oder Ihre Angehörigen im täglichen Leben und sorgen dafür, dass Sie sich in Ihrem Zuhause weiterhin wohlfühlen können. Unsere Leistungen können über den Entlastungsbetrag der Pflegekasse abgerechnet werden – sprechen Sie uns gerne an, wir beraten Sie unverbindlich.
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#F8FEFF]/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <h2 className="text-3xl font-medium tracking-tight text-[#111111] mb-12 text-center" style={jakarta}>
            Unsere haushaltsnahen Dienstleistungen im Überblick
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leistungen.map((l, i) => (
              <div key={i} className="bg-white p-7 rounded-3xl border border-[#E5F4F5] shadow-sm">
                <div className="w-12 h-12 bg-[#DFF7F8] rounded-2xl flex items-center justify-center text-[#6FD3D1] mb-4">
                  <Home size={22} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium text-[#111111] mb-2" style={jakarta}>{l.title}</h3>
                <p className="text-[15px] text-[#5F6B73] font-light leading-relaxed">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/80">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-[#F8FEFF] p-8 lg:p-10 rounded-3xl border border-[#E5F4F5]">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles size={24} className="text-[#6FD3D1]" />
              <h2 className="text-2xl font-medium tracking-tight text-[#111111]" style={jakarta}>
                Ihre Vorteile auf einen Blick
              </h2>
            </div>
            <ul className="space-y-3">
              {vorteile.map((v, i) => (
                <li key={i} className="flex items-start gap-3 text-[#5F6B73] font-light">
                  <CheckCircle size={20} className="text-[#6FD3D1] mt-0.5 shrink-0" />
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F8FEFF]/80">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <ShieldCheck size={48} strokeWidth={1} className="text-[#BFEAF2] mb-6 mx-auto" />
          <h2 className="text-2xl lg:text-3xl font-medium tracking-tight text-[#111111] mb-4" style={jakarta}>
            Lassen Sie sich kostenlos beraten
          </h2>
          <p className="text-lg text-[#5F6B73] font-light mb-8">
            Wir zeigen Ihnen, wie Sie unsere haushaltsnahen Dienstleistungen über die Pflegekasse abrechnen können.
          </p>
          <Link to="/kontakt" className="inline-flex items-center gap-2 bg-[#6FD3D1] text-white hover:bg-[#5BC2C0] px-8 py-3.5 rounded-full text-base font-normal transition-all shadow-sm">
            <Phone size={18} /> Jetzt anfragen
          </Link>
        </div>
      </section>
    </>
  );
}
