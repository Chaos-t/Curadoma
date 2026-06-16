import { Link } from "react-router";
import { CheckCircle, Phone, Euro, ShieldCheck, FileText, HelpCircle, Heart, Users, Info } from "lucide-react";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const img = "https://images.unsplash.com/photo-1632152133952-98b268dc4b86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGglMjBpbnN1cmFuY2UlMjBkb2N1bWVudCUyMHBhcGVyd29yayUyMGRlc2t8ZW58MXx8fHwxNzc1MzE0NDk1fDA&ixlib=rb-4.1.0&q=80&w=1080";

export function EntlastungPage() {
  return (
    <>
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#DFF7F8] opacity-20 rounded-full blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/3"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#6FD3D1] mb-6 uppercase tracking-wider">
              § 45a / § 45b SGB XI
            </div>
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-6" style={jakarta}>
              Entlastungsleistungen <br className="hidden lg:block" />
              <span className="text-[#6FD3D1]">nach § 45a SGB XI</span>
            </h1>
            <p className="text-lg text-[#5F6B73] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
              Unterstützung im Alltag für Pflegebedürftige und Angehörige – finanziert über die Pflegekasse.
            </p>
          </div>
          <div className="flex-1 w-full max-w-md lg:max-w-none">
            <div className="rounded-3xl overflow-hidden shadow-[0_20px_60px_rgb(191,234,242,0.3)] border-4 border-white">
              <img src={img} alt="Dokumente und Unterlagen" className="w-full aspect-[4/3] object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/80">
        <div className="max-w-4xl mx-auto px-6 space-y-6 text-[17px] text-[#5F6B73] font-light leading-relaxed">
          <p>
            Pflegebedürftige Menschen und ihre Angehörigen stehen im Alltag oft vor großen Herausforderungen. Um sie gezielt zu entlasten, gibt es eine finanzielle Unterstützung der Pflegekasse – die sogenannten Entlastungsleistungen. Diese zusätzliche finanzielle Unterstützung soll die Lebensqualität verbessern und eine selbstbestimmte Lebensführung im häuslichen Umfeld fördern.
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#F8FEFF]/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <h2 className="text-3xl font-medium tracking-tight text-[#111111] mb-4 text-center" style={jakarta}>
            Unser Betreuungsdienst – Ihr starker Partner im Alltag
          </h2>
          <p className="text-[#5F6B73] font-light text-center max-w-3xl mx-auto mb-12">
            Als anerkannter Anbieter bieten wir Ihnen eine Vielzahl an haushaltsnahen Dienstleistungen und Betreuungsangeboten, die über den Entlastungsbetrag finanziert werden können:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              "Unterstützung im Haushalt (Reinigung, Wäsche, Einkäufe)",
              "Begleitung bei Arztbesuchen und Erledigungen",
              "Alltagsbegleitung und soziale Aktivierung",
              "Betreuung von Menschen mit Demenz",
              "Entlastung pflegender Angehöriger",
            ].map((v, i) => (
              <div key={i} className="cura-card-glow bg-white p-5 rounded-2xl border border-[#E5F4F5] flex items-start gap-3">
                <CheckCircle size={20} className="text-[#6FD3D1] mt-0.5 shrink-0" />
                <span className="text-[#5F6B73] font-light">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/80">
        <div className="max-w-4xl mx-auto px-6">
          <div className="cura-card-glow bg-[#F8FEFF] p-8 lg:p-10 rounded-3xl border border-[#E5F4F5]">
            <h3 className="text-2xl font-medium text-[#111111] mb-6" style={jakarta}>Das bedeutet für Sie:</h3>
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
                  <span>{v}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[#5F6B73] font-light italic">
              Nehmen Sie Kontakt mit uns auf – wir beraten Sie gerne persönlich und unverbindlich.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F8FEFF]/80">
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <HelpCircle size={24} className="text-[#6FD3D1]" />
              <h2 className="text-2xl font-medium tracking-tight text-[#111111]" style={jakarta}>Was sind Entlastungsleistungen?</h2>
            </div>
            <p className="text-[#5F6B73] font-light leading-relaxed">
              Entlastungsleistungen sind Gelder in Höhe von monatlich <strong>131&nbsp;Euro</strong>, die Pflegebedürftigen der Pflegegrade 1 bis 5 zur Verfügung stehen. Sie dienen der Entlastung pflegender Angehöriger sowie der Förderung der Selbstständigkeit Pflegebedürftiger.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <Info size={24} className="text-[#6FD3D1]" />
              <h2 className="text-2xl font-medium tracking-tight text-[#111111]" style={jakarta}>Wofür können die Entlastungsleistungen genutzt werden?</h2>
            </div>
            <p className="text-[#5F6B73] font-light leading-relaxed mb-4">
              Die 131 Euro monatlich können für verschiedene anerkannte Angebote eingesetzt werden – dazu zählen insbesondere:
            </p>
            <ul className="space-y-3 text-[#5F6B73] font-light">
              <li className="flex items-start gap-3"><CheckCircle size={18} className="text-[#6FD3D1] mt-1 shrink-0" /><span><strong>Alltagsbegleitung:</strong> Unterstützung bei alltäglichen Aufgaben wie Einkaufen, Kochen, Spazierengehen oder Begleitung zu Arztterminen.</span></li>
              <li className="flex items-start gap-3"><CheckCircle size={18} className="text-[#6FD3D1] mt-1 shrink-0" /><span><strong>Betreuungsangebote:</strong> Aktivitäten zur Förderung sozialer Kontakte und geistiger Fähigkeiten (z. B. gemeinsames Spielen, Vorlesen oder Gedächtnistraining).</span></li>
              <li className="flex items-start gap-3"><CheckCircle size={18} className="text-[#6FD3D1] mt-1 shrink-0" /><span><strong>Haushaltsnahe Dienstleistungen:</strong> Hilfe im Haushalt wie Reinigung der Wohnung/des Hauses, Wäsche waschen.</span></li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck size={24} className="text-[#6FD3D1]" />
              <h2 className="text-2xl font-medium tracking-tight text-[#111111]" style={jakarta}>Wer kann die Leistungen erbringen?</h2>
            </div>
            <p className="text-[#5F6B73] font-light leading-relaxed">
              Die Entlastungsleistungen dürfen nur durch anerkannte Anbieter erbracht werden. Dies können zum Beispiel ambulante Pflegedienste und Betreuungsdienste sein, die von der zuständigen Pflegekasse oder dem Landesamt zugelassen sind.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <FileText size={24} className="text-[#6FD3D1]" />
              <h2 className="text-2xl font-medium tracking-tight text-[#111111]" style={jakarta}>Wie wird der Entlastungsbetrag abgerechnet?</h2>
            </div>
            <p className="text-[#5F6B73] font-light leading-relaxed mb-3">
              Die Abrechnung erfolgt in der Regel direkt über den anerkannten Anbieter mit der Pflegekasse. Alternativ können pflegebedürftige Personen die Kosten selbst tragen und sich den Betrag anschließend erstatten lassen – vorausgesetzt, die Leistung wurde durch einen anerkannten Anbieter erbracht.
            </p>
            <p className="text-[#5F6B73] font-light leading-relaxed">
              Nicht verbrauchte Beträge können bis zum 30. Juni des Folgejahres angespart und nachträglich verwendet werden.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/80">
        <div className="max-w-4xl mx-auto px-6">
          <div className="cura-card-glow bg-[#F8FEFF] p-8 lg:p-10 rounded-3xl border border-[#E5F4F5]">
            <h2 className="text-2xl font-medium tracking-tight text-[#111111] mb-4" style={jakarta}>
              Unser Angebot – individuelle Entlastung im Alltag
            </h2>
            <p className="text-[#5F6B73] font-light leading-relaxed mb-4">
              Ob stundenweise Unterstützung oder regelmäßige Begleitung – wir sind für Sie da. Lassen Sie sich unverbindlich beraten und erfahren Sie, wie Sie den Entlastungsbetrag sinnvoll nutzen können.
            </p>
            <p className="text-[#5F6B73] font-light leading-relaxed">
              Kontaktieren Sie uns direkt – wir unterstützen Sie gerne bei der Beantragung und Abrechnung der Entlastungsleistungen.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F8FEFF]/80">
        <div className="max-w-4xl mx-auto px-6">
          <div className="cura-card-glow bg-white p-8 lg:p-10 rounded-3xl border border-[#E5F4F5] text-center">
            <ShieldCheck size={40} strokeWidth={1.2} className="text-[#6FD3D1] mx-auto mb-4" />
            <h2 className="text-2xl font-medium tracking-tight text-[#111111] mb-4" style={jakarta}>Unser Service für Sie</h2>
            <p className="text-[#5F6B73] font-light leading-relaxed max-w-2xl mx-auto">
              Wir sind ein nach § 45b SGB XI anerkannter Anbieter von allen Pflegekassen für Betreuungs- und Entlastungsleistungen. Gern unterstützen wir Sie im Alltag – individuell, zuverlässig und auf Ihre Bedürfnisse abgestimmt. Kontaktieren Sie uns für ein persönliches Beratungsgespräch!
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/80">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Link to="/kontakt" className="inline-flex items-center gap-2 bg-[#6FD3D1] text-white hover:bg-[#5BC2C0] px-8 py-4 rounded-full text-base font-normal transition-all shadow-sm">
            <Phone size={20} /> Jetzt kostenlos beraten lassen
          </Link>
        </div>
      </section>
    </>
  );
}
