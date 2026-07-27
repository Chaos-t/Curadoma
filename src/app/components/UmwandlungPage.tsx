import { Link } from "react-router";
import { CheckCircle, Phone, Repeat } from "lucide-react";
import { Editable } from "./editor/Editable";

const jakarta = { fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif" };

// Werte = Pflegesachleistung/Monat + max. Umwandlung (40 %) nach § 45a SGB XI.
const tableRows = [
  { grad: "Pflegegrad 2", sach: "796 €", umw: "318,40 €" },
  { grad: "Pflegegrad 3", sach: "1.497 €", umw: "598,80 €" },
  { grad: "Pflegegrad 4", sach: "1.859 €", umw: "743,60 €" },
  { grad: "Pflegegrad 5", sach: "2.299 €", umw: "919,60 €" },
];

export function UmwandlungPage() {
  return (
    <>
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#0E6E6A] mb-6 uppercase tracking-wider">
            <Editable as="span" id="umwandlung.hero.badge">Pflegekasse</Editable>
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-6" style={jakarta}>
            <Editable as="span" id="umwandlung.hero.title">Umwandlungsanspruch</Editable> <br className="hidden lg:block" />
            <span className="text-[#0F7C77]"><Editable as="span" id="umwandlung.hero.title.accent">nach § 45a SGB XI</Editable></span>
          </h1>
          <p className="text-lg text-[#5F6B73] leading-relaxed font-light">
            <Editable as="span" id="umwandlung.hero.subtitle">Mehr praktische Hilfe im Alltag – kombinieren Sie finanzielle Unterstützung mit konkreter Entlastung.</Editable>
          </p>
        </div>
      </section>

      <section className="py-20 bg-white/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 space-y-6 text-[17px] text-[#5F6B73] font-light leading-relaxed">
          <p>
            <Editable as="span" id="umwandlung.intro.paragraph">Wer Pflegegrad 2 oder höher hat und Pflegesachleistungen bezieht, nutzt diese im Alltag oft nicht vollständig aus. Genau hier setzt der Umwandlungsanspruch nach § 45a SGB XI an: Bis zu 40 % der nicht genutzten Pflegesachleistungen lassen sich in anerkannte Angebote zur Unterstützung im Alltag umwandeln – so verfällt ungenutztes Budget nicht, sondern wird zu konkreter Hilfe.</Editable>
          </p>
          <h2 className="text-2xl font-medium tracking-tight text-[#111111] pt-4" style={jakarta}><Editable as="span" id="umwandlung.intro.heading">Was bedeutet das für Sie?</Editable></h2>
          <p>
            <Editable as="span" id="umwandlung.intro.paragraph2">Statt ungenutzte Sachleistungsbeträge verfallen zu lassen, wandeln Sie einen Teil davon in konkrete Unterstützung durch unseren Betreuungsdienst um. So erhalten Sie gezielte, praktische Entlastung – ganz nach Ihrem individuellen Bedarf und direkt mit der Pflegekasse abgerechnet.</Editable>
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#F8FEFF]/80">
        <div className="cura-reveal cura-reveal-up max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="cura-card-glow bg-white p-8 rounded-3xl border border-[#E5F4F5]">
            <h3 className="text-xl font-medium text-[#111111] mb-4" style={jakarta}><Editable as="span" id="umwandlung.vorteile.title">Ihre Vorteile auf einen Blick</Editable></h3>
            <ul className="space-y-3 text-[15px] text-[#5F6B73] font-light">
              {[
                "Sie setzen ungenutzte Pflegesachleistungen sinnvoll ein – statt sie verfallen zu lassen.",
                "Die Leistungen werden direkt mit der Pflegekasse abgerechnet – Sie müssen sich um nichts kümmern.",
                "Sie erhalten qualifizierte Unterstützung im Haushalt, bei der Alltagsbegleitung oder der Betreuung zu Hause.",
                "Angehörige werden entlastet – Sie gewinnen mehr Zeit und Sicherheit.",
              ].map((v, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-[#6FD3D1] mt-1 shrink-0" />
                  <span><Editable as="span" id={`umwandlung.vorteile.${i}`}>{v}</Editable></span>
                </li>
              ))}
            </ul>
          </div>

          <div className="cura-card-glow bg-white p-8 rounded-3xl border border-[#E5F4F5]">
            <h3 className="text-xl font-medium text-[#111111] mb-4" style={jakarta}><Editable as="span" id="umwandlung.angebot.title">Was wir Ihnen bieten können</Editable></h3>
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
                  <span><Editable as="span" id={`umwandlung.angebot.${i}`}>{v}</Editable></span>
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
            <h2 className="text-2xl font-medium tracking-tight text-[#111111]" style={jakarta}><Editable as="span" id="umwandlung.funktion.heading">Wie funktioniert die Umwandlung?</Editable></h2>
          </div>
          <p className="text-[#5F6B73] font-light leading-relaxed mb-4">
            <Editable as="span" id="umwandlung.funktion.paragraph">Die Pflegekasse ermöglicht es, bis zu 40 % der nicht genutzten Pflegesachleistungen für anerkannte Angebote zur Unterstützung im Alltag einzusetzen. Dazu zählen beispielsweise Haushaltshilfe, Alltagsbegleitung oder Betreuungsleistungen.</Editable>
          </p>
          <p className="text-[#5F6B73] font-light leading-relaxed">
            <Editable as="span" id="umwandlung.funktion.paragraph2">Wir beraten Sie gerne persönlich und unterstützen Sie bei der Abstimmung mit der Pflegekasse.</Editable>
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#F8FEFF]/80">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <h2 className="cura-reveal cura-reveal-up text-3xl font-medium tracking-tight text-[#111111] mb-3 text-center" style={jakarta}>
            <Editable as="span" id="umwandlung.tabelle.heading" rich>Beispiele: Umwandlung von Pflegesachleistungen</Editable>
          </h2>
          <p className="cura-reveal cura-reveal-up text-[#5F6B73] font-light text-center mb-10">
            <Editable as="span" id="umwandlung.tabelle.intro" rich>Übersicht der maximalen Umwandlung von 40&nbsp;% der Pflegesachleistungen.</Editable>
          </p>

          {/* Desktop table */}
          <div className="cura-reveal cura-reveal-up cura-card-glow hidden md:block bg-white rounded-3xl border border-[#E5F4F5] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#DFF7F8] text-[#111111]">
                  <tr>
                    <th className="p-4 font-medium" style={jakarta}><Editable as="span" id="umwandlung.tabelle.head.grad">Pflegegrad</Editable></th>
                    <th className="p-4 font-medium" style={jakarta}><Editable as="span" id="umwandlung.tabelle.head.sach">Pflegesachleistung pro Monat</Editable></th>
                    <th className="p-4 font-medium" style={jakarta}><Editable as="span" id="umwandlung.tabelle.head.umw">Max. Umwandlungsbetrag (40 %)</Editable></th>
                  </tr>
                </thead>
                <tbody className="text-[#5F6B73] font-light">
                  {tableRows.map((r, i) => (
                    <tr key={i} className="border-t border-[#E5F4F5]">
                      <td className="p-4 font-medium text-[#111111]"><Editable as="span" id={`umwandlung.tabelle.rows.${i}.grad`}>{r.grad}</Editable></td>
                      <td className="p-4"><Editable as="span" id={`umwandlung.tabelle.rows.${i}.sach`}>{r.sach}</Editable></td>
                      <td className="p-4"><Editable as="span" id={`umwandlung.tabelle.rows.${i}.umw`}>{r.umw}</Editable></td>
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
                <div className="text-base font-medium text-[#111111] mb-3" style={jakarta}><Editable as="span" id={`umwandlung.tabelle.rows.${i}.grad`}>{r.grad}</Editable></div>
                <dl className="space-y-2 text-sm text-[#5F6B73] font-light">
                  <div className="flex justify-between gap-3"><dt><Editable as="span" id="umwandlung.tabelle.mobile.label.sach">Pflegesachleistung / Monat</Editable></dt><dd className="text-right text-[#111111]"><Editable as="span" id={`umwandlung.tabelle.rows.${i}.sach`}>{r.sach}</Editable></dd></div>
                  <div className="flex justify-between gap-3"><dt><Editable as="span" id="umwandlung.tabelle.mobile.label.umw">Max. Umwandlung (40 %)</Editable></dt><dd className="text-right text-[#111111]"><Editable as="span" id={`umwandlung.tabelle.rows.${i}.umw`}>{r.umw}</Editable></dd></div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/80">
        <div className="cura-reveal cura-reveal-up max-w-3xl mx-auto px-6 text-center">
          <Link to="/kontakt" className="inline-flex items-center gap-2 bg-[#0F7C77] text-white hover:bg-[#0E6E6A] px-8 py-3.5 rounded-full text-base font-normal transition-all shadow-sm">
            <Phone size={18} /> <Editable as="span" id="umwandlung.cta.button">Persönlich beraten lassen</Editable>
          </Link>
        </div>
      </section>
    </>
  );
}
