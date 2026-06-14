import { Phone, Mail, MapPin, FileText } from "lucide-react";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const heroImg =
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export function ImpressumPage() {
  return (
    <>
      <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 overflow-hidden bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#6FD3D1] mb-6 uppercase tracking-wider">
            <FileText size={14} /> Rechtliches
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-4" style={jakarta}>
            Impressum
          </h1>
          <p className="text-lg text-[#5F6B73] font-light">Angaben gemäß § 5 TMG</p>
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-10">
          <div
            className="rounded-3xl overflow-hidden shadow-[0_20px_60px_rgb(191,234,242,0.3)] border-4 border-white opacity-0 translate-y-4 motion-safe:animate-[curaFadeUp_700ms_ease-out_forwards]"
          >
            <img src={heroImg} alt="Büro mit Unterlagen" className="w-full aspect-[16/7] object-cover" />
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white/70">
        <div className="max-w-3xl mx-auto px-6 space-y-10">
          <Block title="Anbieter">
            <p>Cura Doma</p>
            <p>Ambulanter Betreuungsdienst</p>
          </Block>

          <Block title="Anschrift">
            <p className="flex items-start gap-2"><MapPin size={16} className="mt-1 text-[#6FD3D1] shrink-0" />
              <span>Süntelhang 9<br />31787 Hameln<br />Deutschland</span>
            </p>
          </Block>

          <Block title="Kontakt">
            <p className="flex items-center gap-2"><Phone size={16} className="text-[#6FD3D1]" /> <a href="tel:+4951517107093" className="hover:text-[#6FD3D1]">05151 7107093</a></p>
            <p className="flex items-center gap-2"><Mail size={16} className="text-[#6FD3D1]" /> <a href="mailto:info@curadoma.de" className="hover:text-[#6FD3D1]">info@curadoma.de</a></p>
          </Block>

          <Block title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
            <p>Cura Doma</p>
            <p>Süntelhang 9, 31787 Hameln</p>
          </Block>

          <Block title="Unternehmensangaben">
            <ul className="space-y-2 text-[#5F6B73]">
              <li><span className="text-[#111111]">Vertreten durch:</span> Marilena Linde</li>
              <li><span className="text-[#111111]">Rechtsform:</span> Einzelunternehmen</li>
              <li><span className="text-[#111111]">Steuernummer:</span> 22/127/01564</li>
              <li><span className="text-[#111111]">Aufsichtsbehörde / zuständige Stelle:</span> Niedersächsisches Landesamt für Soziales, Jugend und Familie (LS), Regionalstelle Hildesheim</li>
              <li><span className="text-[#111111]">Berufsrechtliche Angaben:</span> Anerkanntes Angebot zur Unterstützung im Alltag gemäß § 45a SGB XI nach den Vorschriften des Landes Niedersachsen.</li>
            </ul>
          </Block>
        </div>
      </section>

      <style>{`@keyframes curaFadeUp { to { opacity: 1; transform: translateY(0); } }`}</style>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#F8FEFF] rounded-2xl border border-[#E5F4F5] p-6 sm:p-8">
      <h2 className="text-lg font-medium text-[#111111] mb-3" style={jakarta}>{title}</h2>
      <div className="text-[15px] text-[#5F6B73] font-light leading-relaxed space-y-1">{children}</div>
    </div>
  );
}
