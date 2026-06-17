import { Link } from "react-router";
import { CheckCircle, Phone, Repeat, Info } from "lucide-react";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

const tableRows = [
  { grad: "Pflegegrad 2", geld: "316 €", umw: "126,40 €", rest: "189,60 €", services: "z. B. Haushaltshilfe, Begleitung, Betreuung" },
  { grad: "Pflegegrad 3", geld: "545 €", umw: "218 €", rest: "327 €", services: "z. B. Demenzbetreuung, Alltagshilfe" },
  { grad: "Pflegegrad 4", geld: "728 €", umw: "291,20 €", rest: "436,80 €", services: "z. B. stundenweise Betreuung zur Entlastung" },
  { grad: "Pflegegrad 5", geld: "901 €", umw: "360,40 €", rest: "540,60 €", services: "z. B. umfassende Unterstützung im Alltag" },
];

export function UmwandlungPage() {
  return (
    <>
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#6FD3D1] mb-6 uppercase tracking-wider">
            Pflegekasse
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-6" style={jakarta}>
            Umwandlung von Geldleistungen <br className="hidden lg:block" />
            <span className="text-[#6FD3D1]">in Sachleistungen</span>
          </h1>
          <p className="text-lg text-[#5F6B73] leading-relaxed font-light">
            Mehr praktische Hilfe im Alltag – kombinieren Sie finanzielle Unterstützung mit konkreter Entlastung.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 space-y-6 text-[17px] text-[#5F6B73] font-light leading-relaxed">
          <p>
            Wer Pflegegrad 2 hat und zu Hause von Angehörigen gepflegt wird, erhält von der Pflegekasse ein sogenanntes Pflegegeld. Doch nicht immer reicht die Unterstützung im Alltag aus – besonders wenn die Belastung für Angehörige steigt oder zusätzliche Hilfe benötigt wird. In diesem Fall bietet sich eine sinnvolle Lösung an: die Umwandlung eines Teils des Pflegegeldes in sogenannte Sachleistungen.
          </p>
          <h2 className="text-2xl font-medium tracking-tight text-[#111111] pt-4" style={jakarta}>Was bedeutet das für Sie?</h2>
          <p>
            Statt das Pflegegeld vollständig selbst zu verwenden, kann ein Teil davon in konkrete Unterstützungsleistungen durch unseren Betreuungsdienst umgewandelt werden. So erhalten Sie gezielte, praktische Entlastung – ganz nach Ihrem individuellen Bedarf.
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#F8FEFF]/80">
        <div className="cura-reveal cura-reveal-up max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="cura-card-glow bg-white p-8 rounded-3xl border border-[#E5F4F5]">
            <h3 className="text-xl font-medium text-[#111111] mb-4" style={jakarta}>Ihre Vorteile auf einen Blick</h3>
            <ul className="space-y-3 text-[15px] text-[#5F6B73] font-light">
              {[
                "Sie behalten einen Teil Ihres Pflegegeldes und nutzen gleichzeitig professionelle Hilfe.",
                "Die Leistungen werden direkt mit der Pflegekasse abgerechnet – Sie müssen sich um nichts kümmern.",
                "Sie erhalten qualifizierte Unterstützung im Haushalt, bei der Alltagsbegleitung oder der Betreuung zu Hause.",
                "Angehörige werden entlastet – Sie gewinnen mehr Zeit und Sicherheit.",
              ].map((v, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-[#6FD3D1] mt-1 shrink-0" />
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="cura-card-glow bg-white p-8 rounded-3xl border border-[#E5F4F5]">
            <h3 className="text-xl font-medium text-[#111111] mb-4" style={jakarta}>Was wir Ihnen bieten können</h3>
            <ul className="space-y-3 text-[15px] text-[#5F6B73] font-light">
              {[
                "Unterstützung bei Hausarbeit und Einkäufen",
                "Begleitung zu Terminen oder Spaziergängen",
                "Entlastung und Betreuung bei Demenz",
                "Individuelle Betreuung im gewohnten Umfeld",
                "Verlässliche Hilfe – regelmäßig oder flexibel",
              ].map((v, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-[#6FD3D1] mt-1 shrink-0" />
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <Repeat size={24} className="text-[#6FD3D1]" />
            <h2 className="text-2xl font-medium tracking-tight text-[#111111]" style={jakarta}>Wie funktioniert die Umwandlung?</h2>
          </div>
          <p className="text-[#5F6B73] font-light leading-relaxed mb-4">
            Die Pflegekasse erlaubt es, bis zu 40 % des Pflegegeldes für anerkannte Betreuungsleistungen zu verwenden. Wir beraten Sie gerne persönlich, wie Sie diese Möglichkeit optimal für sich nutzen können – und übernehmen auf Wunsch auch die Abstimmung mit der Pflegekasse.
          </p>
          <div className="cura-card-glow bg-[#F8FEFF] p-5 rounded-2xl border border-[#E5F4F5] flex items-start gap-3">
            <Info size={20} className="text-[#6FD3D1] mt-0.5 shrink-0" />
            <p className="text-[15px] text-[#5F6B73] font-light">
              <strong>Fazit:</strong> Sie kombinieren finanzielle Unterstützung mit konkreter Entlastung – genau dort, wo Hilfe gebraucht wird.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F8FEFF]/80">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <h2 className="cura-reveal cura-reveal-up text-3xl font-medium tracking-tight text-[#111111] mb-3 text-center" style={jakarta}>
            Beispiele: Pflegegeld &amp; Umwandlung in Sachleistungen
          </h2>
          <p className="cura-reveal cura-reveal-up text-[#5F6B73] font-light text-center mb-10">
            Übersicht der maximalen Umwandlung von 40&nbsp;% des Pflegegeldes.
          </p>

          {/* Desktop table */}
          <div className="cura-reveal cura-reveal-up cura-card-glow hidden md:block bg-white rounded-3xl border border-[#E5F4F5] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#DFF7F8] text-[#111111]">
                  <tr>
                    <th className="p-4 font-medium" style={jakarta}>Pflegegrad</th>
                    <th className="p-4 font-medium" style={jakarta}>Pflegegeld pro Monat</th>
                    <th className="p-4 font-medium" style={jakarta}>Max. Umwandlungsbetrag (40 %)</th>
                    <th className="p-4 font-medium" style={jakarta}>Verbleibendes Pflegegeld</th>
                    <th className="p-4 font-medium" style={jakarta}>Mögliche Sachleistungen</th>
                  </tr>
                </thead>
                <tbody className="text-[#5F6B73] font-light">
                  {tableRows.map((r, i) => (
                    <tr key={i} className="border-t border-[#E5F4F5]">
                      <td className="p-4 font-medium text-[#111111]">{r.grad}</td>
                      <td className="p-4">{r.geld}</td>
                      <td className="p-4">{r.umw}</td>
                      <td className="p-4">{r.rest}</td>
                      <td className="p-4">{r.services}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="cura-reveal cura-reveal-up md:hidden space-y-4">
            {tableRows.map((r, i) => (
              <div key={i} className="cura-card-glow bg-white p-6 rounded-2xl border border-[#E5F4F5]">
                <div className="text-base font-medium text-[#111111] mb-3" style={jakarta}>{r.grad}</div>
                <dl className="space-y-2 text-sm text-[#5F6B73] font-light">
                  <div className="flex justify-between gap-3"><dt>Pflegegeld / Monat</dt><dd className="text-right text-[#111111]">{r.geld}</dd></div>
                  <div className="flex justify-between gap-3"><dt>Max. Umwandlung (40 %)</dt><dd className="text-right text-[#111111]">{r.umw}</dd></div>
                  <div className="flex justify-between gap-3"><dt>Verbleibendes Pflegegeld</dt><dd className="text-right text-[#111111]">{r.rest}</dd></div>
                  <div className="pt-2 border-t border-[#E5F4F5]"><dt className="text-xs uppercase tracking-wider mb-1">Mögliche Sachleistungen</dt><dd>{r.services}</dd></div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/80">
        <div className="cura-reveal cura-reveal-up max-w-3xl mx-auto px-6 text-center">
          <Link to="/kontakt" className="inline-flex items-center gap-2 bg-[#6FD3D1] text-white hover:bg-[#5BC2C0] px-8 py-3.5 rounded-full text-base font-normal transition-all shadow-sm">
            <Phone size={18} /> Persönlich beraten lassen
          </Link>
        </div>
      </section>
    </>
  );
}
