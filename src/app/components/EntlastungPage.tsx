import { Link } from "react-router";
import { CheckCircle, Phone, Euro, ShieldCheck, FileText, HelpCircle, Heart, Users, Info } from "lucide-react";
import { Editable } from "./editor/Editable";
import { EditableImage } from "./editor/EditableImage";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const img = "https://images.unsplash.com/photo-1632152133952-98b268dc4b86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGglMjBpbnN1cmFuY2UlMjBkb2N1bWVudCUyMHBhcGVyd29yayUyMGRlc2t8ZW58MXx8fHwxNzc1MzE0NDk1fDA&ixlib=rb-4.1.0&q=80&w=1080";

export function EntlastungPage() {
  return (
    <>
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#DFF7F8] opacity-20 rounded-full blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/3"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="cura-reveal cura-reveal-left flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#0E6E6A] mb-6 uppercase tracking-wider">
              <Editable as="span" id="entlastung.hero.badge">§ 45a / § 45b SGB XI</Editable>
            </div>
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-6" style={jakarta}>
              <Editable as="span" id="entlastung.hero.title">Entlastungsleistungen</Editable> <br className="hidden lg:block" />
              <span className="text-[#0F7C77]"><Editable as="span" id="entlastung.hero.title-highlight">nach § 45b SGB XI</Editable></span>
            </h1>
            <p className="text-lg text-[#5F6B73] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
              <Editable as="span" id="entlastung.hero.subtitle">Unterstützung im Alltag für Pflegebedürftige und Angehörige – finanziert über die Pflegekasse.</Editable>
            </p>
          </div>
          <div className="cura-reveal cura-reveal-right flex-1 w-full max-w-md lg:max-w-none">
            <div className="rounded-3xl overflow-hidden shadow-[0_20px_60px_rgb(191,234,242,0.3)] border-4 border-white">
              <EditableImage id="entlastung.hero.image" src={img} alt="Dokumente und Unterlagen" altId="entlastung.hero.image.alt" className="w-full aspect-[4/3] object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 space-y-6 text-[17px] text-[#5F6B73] font-light leading-relaxed">
          <p>
            <Editable as="span" id="entlastung.intro.paragraph">Pflegebedürftige Menschen und ihre Angehörigen stehen im Alltag oft vor großen Herausforderungen. Um sie gezielt zu entlasten, gibt es eine finanzielle Unterstützung der Pflegekasse – die sogenannten Entlastungsleistungen. Diese zusätzliche finanzielle Unterstützung soll die Lebensqualität verbessern und eine selbstbestimmte Lebensführung im häuslichen Umfeld fördern.</Editable>
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#F8FEFF]/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <h2 className="cura-reveal cura-reveal-up text-3xl font-medium tracking-tight text-[#111111] mb-4 text-center" style={jakarta}>
            <Editable as="span" id="entlastung.services.title">Unser Betreuungsdienst – Ihr starker Partner im Alltag</Editable>
          </h2>
          <p className="cura-reveal cura-reveal-up text-[#5F6B73] font-light text-center max-w-3xl mx-auto mb-12">
            <Editable as="span" id="entlastung.services.intro">Als anerkannter Anbieter bieten wir Ihnen eine Vielzahl an haushaltsnahen Dienstleistungen und Betreuungsangeboten, die über den Entlastungsbetrag finanziert werden können:</Editable>
          </p>
          <div className="cura-reveal cura-reveal-up grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              "Unterstützung im Haushalt (Reinigung, Wäsche, Einkäufe)",
              "Begleitung bei Arztbesuchen und Erledigungen",
              "Alltagsbegleitung und soziale Aktivierung",
              "Betreuung von Menschen mit Demenz",
              "Entlastung pflegender Angehöriger",
            ].map((v, i) => (
              <div key={i} className="cura-card-glow bg-white p-5 rounded-2xl border border-[#E5F4F5] flex items-start gap-3">
                <CheckCircle size={20} className="text-[#6FD3D1] mt-0.5 shrink-0" />
                <span className="text-[#5F6B73] font-light"><Editable as="span" id={`entlastung.services.${i}`}>{v}</Editable></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/80">
        <div className="max-w-4xl mx-auto px-6">
          <div className="cura-reveal cura-reveal-up cura-card-glow bg-[#F8FEFF] p-8 lg:p-10 rounded-3xl border border-[#E5F4F5]">
            <h3 className="text-2xl font-medium text-[#111111] mb-6" style={jakarta}><Editable as="span" id="entlastung.benefits.title">Das bedeutet für Sie:</Editable></h3>
            <ul className="space-y-3 text-[#5F6B73] font-light">
              {[
                "Unsere Leistungen können direkt über die Pflegekasse abgerechnet werden",
                "Sie erhalten Unterstützung ohne zusätzliche Kosten (im Rahmen des Budgets). Sie können aber mehr Gelder in Anspruch nehmen, mehr unter Verhinderungspflege und Umwandlung von Pflegesachleistungen",
                "Persönliche Betreuung durch geschultes, vertrauensvolles Personal",
                "Flexible, individuelle Gestaltung je nach Bedarf",
                "Wir helfen Ihnen auch bei Fragen zur Abrechnung oder Antragstellung",
              ].map((v, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-[#6FD3D1] mt-0.5 shrink-0" />
                  <span><Editable as="span" id={`entlastung.benefits.${i}`}>{v}</Editable></span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[#5F6B73] font-light italic">
              <Editable as="span" id="entlastung.benefits.footnote">Nehmen Sie Kontakt mit uns auf – wir beraten Sie gerne persönlich und unverbindlich.</Editable>
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F8FEFF]/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 space-y-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <HelpCircle size={24} className="text-[#6FD3D1]" />
              <h2 className="text-2xl font-medium tracking-tight text-[#111111]" style={jakarta}><Editable as="span" id="entlastung.faq.what.title">Was sind Entlastungsleistungen?</Editable></h2>
            </div>
            <p className="text-[#5F6B73] font-light leading-relaxed">
              <Editable as="span" id="entlastung.faq.what.text" rich>Entlastungsleistungen sind Gelder in Höhe von monatlich <strong>131&nbsp;Euro</strong>, die Pflegebedürftigen der Pflegegrade 1 bis 5 zur Verfügung stehen. Sie dienen der Entlastung pflegender Angehöriger sowie der Förderung der Selbstständigkeit Pflegebedürftiger.</Editable>
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <Info size={24} className="text-[#6FD3D1]" />
              <h2 className="text-2xl font-medium tracking-tight text-[#111111]" style={jakarta}><Editable as="span" id="entlastung.faq.usage.title">Wofür können die Entlastungsleistungen genutzt werden?</Editable></h2>
            </div>
            <p className="text-[#5F6B73] font-light leading-relaxed mb-4">
              <Editable as="span" id="entlastung.faq.usage.intro">Die 131 Euro monatlich können für verschiedene anerkannte Angebote eingesetzt werden – dazu zählen insbesondere:</Editable>
            </p>
            <ul className="space-y-3 text-[#5F6B73] font-light">
              <li className="flex items-start gap-3"><CheckCircle size={18} className="text-[#6FD3D1] mt-1 shrink-0" /><span><Editable as="span" id="entlastung.faq.usage.item.0" rich><strong>Alltagsbegleitung:</strong> Unterstützung bei alltäglichen Aufgaben wie Einkaufen, Kochen, Spazierengehen oder Begleitung zu Arztterminen.</Editable></span></li>
              <li className="flex items-start gap-3"><CheckCircle size={18} className="text-[#6FD3D1] mt-1 shrink-0" /><span><Editable as="span" id="entlastung.faq.usage.item.1" rich><strong>Betreuungsangebote:</strong> Aktivitäten zur Förderung sozialer Kontakte und geistiger Fähigkeiten (z. B. gemeinsames Spielen, Vorlesen oder Gedächtnistraining).</Editable></span></li>
              <li className="flex items-start gap-3"><CheckCircle size={18} className="text-[#6FD3D1] mt-1 shrink-0" /><span><Editable as="span" id="entlastung.faq.usage.item.2" rich><strong>Haushaltsnahe Dienstleistungen:</strong> Hilfe im Haushalt wie Reinigung der Wohnung/des Hauses, Wäsche waschen.</Editable></span></li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck size={24} className="text-[#6FD3D1]" />
              <h2 className="text-2xl font-medium tracking-tight text-[#111111]" style={jakarta}><Editable as="span" id="entlastung.faq.provider.title">Wer kann die Leistungen erbringen?</Editable></h2>
            </div>
            <p className="text-[#5F6B73] font-light leading-relaxed">
              <Editable as="span" id="entlastung.faq.provider.text">Die Entlastungsleistungen dürfen nur durch anerkannte Anbieter erbracht werden. Dies können zum Beispiel ambulante Pflegedienste und Betreuungsdienste sein, die von der zuständigen Pflegekasse oder dem Landesamt zugelassen sind.</Editable>
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <FileText size={24} className="text-[#6FD3D1]" />
              <h2 className="text-2xl font-medium tracking-tight text-[#111111]" style={jakarta}><Editable as="span" id="entlastung.faq.billing.title">Wie wird der Entlastungsbetrag abgerechnet?</Editable></h2>
            </div>
            <p className="text-[#5F6B73] font-light leading-relaxed mb-3">
              <Editable as="span" id="entlastung.faq.billing.text1">Die Abrechnung erfolgt in der Regel direkt über den anerkannten Anbieter mit der Pflegekasse. Alternativ können pflegebedürftige Personen die Kosten selbst tragen und sich den Betrag anschließend erstatten lassen – vorausgesetzt, die Leistung wurde durch einen anerkannten Anbieter erbracht.</Editable>
            </p>
            <p className="text-[#5F6B73] font-light leading-relaxed">
              <Editable as="span" id="entlastung.faq.billing.text2">Nicht verbrauchte Beträge können bis zum 30. Juni des Folgejahres angespart und nachträglich verwendet werden.</Editable>
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/80">
        <div className="max-w-4xl mx-auto px-6">
          <div className="cura-reveal cura-reveal-up cura-card-glow bg-[#F8FEFF] p-8 lg:p-10 rounded-3xl border border-[#E5F4F5]">
            <h2 className="text-2xl font-medium tracking-tight text-[#111111] mb-4" style={jakarta}>
              <Editable as="span" id="entlastung.offer.title">Unser Angebot – individuelle Entlastung im Alltag</Editable>
            </h2>
            <p className="text-[#5F6B73] font-light leading-relaxed mb-4">
              <Editable as="span" id="entlastung.offer.text1">Ob stundenweise Unterstützung oder regelmäßige Begleitung – wir sind für Sie da. Lassen Sie sich unverbindlich beraten und erfahren Sie, wie Sie den Entlastungsbetrag sinnvoll nutzen können.</Editable>
            </p>
            <p className="text-[#5F6B73] font-light leading-relaxed">
              <Editable as="span" id="entlastung.offer.text2">Kontaktieren Sie uns direkt – wir unterstützen Sie gerne bei der Beantragung und Abrechnung der Entlastungsleistungen.</Editable>
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F8FEFF]/80">
        <div className="max-w-4xl mx-auto px-6">
          <div className="cura-reveal cura-reveal-up cura-card-glow bg-white p-8 lg:p-10 rounded-3xl border border-[#E5F4F5] text-center">
            <ShieldCheck size={40} strokeWidth={1.2} className="text-[#6FD3D1] mx-auto mb-4" />
            <h2 className="text-2xl font-medium tracking-tight text-[#111111] mb-4" style={jakarta}><Editable as="span" id="entlastung.service.title">Unser Service für Sie</Editable></h2>
            <p className="text-[#5F6B73] font-light leading-relaxed max-w-2xl mx-auto">
              <Editable as="span" id="entlastung.service.text">Wir sind ein nach § 45b SGB XI anerkannter Anbieter von allen Pflegekassen für Betreuungs- und Entlastungsleistungen. Gern unterstützen wir Sie im Alltag – individuell, zuverlässig und auf Ihre Bedürfnisse abgestimmt. Kontaktieren Sie uns für ein persönliches Beratungsgespräch!</Editable>
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 text-center">
          <Link to="/kontakt" className="inline-flex items-center gap-2 bg-[#0F7C77] text-white hover:bg-[#0E6E6A] px-8 py-4 rounded-full text-base font-normal transition-all shadow-sm">
            <Phone size={20} /> <Editable as="span" id="entlastung.cta.button">Jetzt kostenlos beraten lassen</Editable>
          </Link>
        </div>
      </section>
    </>
  );
}
