import { Link } from "react-router";
import { CheckCircle, Phone, Calendar, Euro, FileText, Users } from "lucide-react";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export function VerhinderungspflegePage() {
  return (
    <>
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#6FD3D1] mb-6 uppercase tracking-wider">
            § 39 SGB XI
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-6" style={jakarta}>
            <span className="text-[#6FD3D1]">Verhinderungspflege</span>
          </h1>
          <p className="text-lg text-[#5F6B73] leading-relaxed font-light">
            So können Sie es über uns nutzen – wenn pflegende Angehörige einmal eine Pause brauchen.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 space-y-6 text-[17px] text-[#5F6B73] font-light leading-relaxed">
          <p>
            Wenn pflegende Angehörige einmal eine Pause brauchen – sei es durch Urlaub, Krankheit oder andere Verpflichtungen – springt unser Betreuungsdienst im Rahmen der Verhinderungspflege zuverlässig ein. Wir sorgen dafür, dass Ihre Angehörigen weiterhin gut betreut sind – und helfen Ihnen dabei, die Kosten unkompliziert über die Pflegekasse abzurechnen.
          </p>
          <h2 className="text-2xl font-medium tracking-tight text-[#111111] pt-4" style={jakarta}>Was ist Verhinderungspflege?</h2>
          <p>
            Die Verhinderungspflege ist eine Leistung der Pflegeversicherung nach § 39 SGB XI. Sie ermöglicht es Pflegebedürftigen, eine Vertretung für ihre private Pflegeperson zu bekommen – z. B. durch einen professionellen Betreuungsdienst wie unseren.
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#F8FEFF]/80">
        <div className="cura-reveal cura-reveal-up max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="cura-card-glow bg-white p-8 rounded-3xl border border-[#E5F4F5]">
            <div className="w-12 h-12 bg-[#DFF7F8] rounded-2xl flex items-center justify-center text-[#6FD3D1] mb-5">
              <CheckCircle size={22} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-medium text-[#111111] mb-4" style={jakarta}>Voraussetzungen</h3>
            <ul className="space-y-3 text-[15px] text-[#5F6B73] font-light">
              {[
                "Der oder die Pflegebedürftige hat Pflegegrad 2 oder höher.",
                "Die reguläre Pflegeperson hat den Pflegebedürftigen bereits mindestens 6 Monate zu Hause betreut.",
                "Die Pflegeperson ist vorübergehend verhindert (z. B. durch Krankheit oder Urlaub).",
              ].map((v, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-[#6FD3D1] mt-1 shrink-0" />
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="cura-card-glow bg-white p-8 rounded-3xl border border-[#E5F4F5]">
            <div className="w-12 h-12 bg-[#DFF7F8] rounded-2xl flex items-center justify-center text-[#6FD3D1] mb-5">
              <Users size={22} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-medium text-[#111111] mb-4" style={jakarta}>Welche Leistungen übernehmen wir für Sie?</h3>
            <ul className="space-y-3 text-[15px] text-[#5F6B73] font-light">
              {[
                "Alltagsbegleitung und Betreuung",
                "Hilfe im Haushalt",
                "Begleitung zu Terminen",
                "Aktivierende Gespräche und Beschäftigung",
                "Unterstützung bei der Organisation des Alltags",
              ].map((v, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-[#6FD3D1] mt-1 shrink-0" />
                  <span>{v}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-[#5F6B73] font-light leading-relaxed mt-4">
              Wir betreuen Ihre Angehörigen zuverlässig, empathisch und individuell – ganz nach Ihren Bedürfnissen.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/80">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="cura-reveal cura-reveal-up text-3xl font-medium tracking-tight text-[#111111] mb-10 text-center" style={jakarta}>
            Wie viel übernimmt die Pflegekasse?
          </h2>
          <div className="cura-reveal cura-reveal-up grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Euro size={24} strokeWidth={1.5} />, value: "1.612 €", desc: "pro Kalenderjahr für Verhinderungspflege" },
              { icon: <Euro size={24} strokeWidth={1.5} />, value: "+ 806 €", desc: "zusätzlich aus nicht genutzter Kurzzeitpflege (gesamt bis zu 2.418 €/Jahr)" },
              { icon: <Calendar size={24} strokeWidth={1.5} />, value: "42 Tage", desc: "Nutzung pro Jahr möglich" },
            ].map((s, i) => (
              <div key={i} className="cura-card-glow bg-[#F8FEFF] p-7 rounded-3xl border border-[#E5F4F5] text-center">
                <div className="w-12 h-12 bg-[#DFF7F8] rounded-2xl flex items-center justify-center text-[#6FD3D1] mx-auto mb-4">
                  {s.icon}
                </div>
                <div className="text-2xl font-medium text-[#111111] mb-2" style={jakarta}>{s.value}</div>
                <p className="text-sm text-[#5F6B73] font-light leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F8FEFF]/80">
        <div className="max-w-4xl mx-auto px-6">
          <div className="cura-reveal cura-reveal-up cura-card-glow bg-white p-8 lg:p-10 rounded-3xl border border-[#E5F4F5]">
            <div className="flex items-center gap-3 mb-4">
              <FileText size={24} className="text-[#6FD3D1]" />
              <h2 className="text-2xl font-medium tracking-tight text-[#111111]" style={jakarta}>
                Wie funktioniert die Abrechnung mit der Pflegekasse?
              </h2>
            </div>
            <p className="text-[#5F6B73] font-light leading-relaxed">
              Damit Sie sich um möglichst wenig kümmern müssen, unterstützen wir Sie bei der Abrechnung: Wir helfen nach Wunsch bei der Antragstellung und rechnen am Ende eines Monats die geleisteten Stunden einfach über die Verhinderungspflege ab.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/80">
        <div className="cura-reveal cura-reveal-up max-w-3xl mx-auto px-6 text-center">
          <Link to="/kontakt" className="inline-flex items-center gap-2 bg-[#6FD3D1] text-white hover:bg-[#5BC2C0] px-8 py-3.5 rounded-full text-base font-normal transition-all shadow-sm">
            <Phone size={18} /> Beratung vereinbaren
          </Link>
        </div>
      </section>
    </>
  );
}
