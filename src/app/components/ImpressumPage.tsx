import { Phone, Mail, MapPin, FileText } from "lucide-react";
import { Editable } from "./editor/Editable";
import { EditableImage } from "./editor/EditableImage";
import { PhoneText, EmailText, AddressBlock } from "./editor/Shared";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const heroImg =
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export function ImpressumPage() {
  return (
    <>
      <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 overflow-hidden bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#6FD3D1] mb-6 uppercase tracking-wider">
            <FileText size={14} /> <Editable as="span" id="impressum.hero.badge">Rechtliches</Editable>
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-4" style={jakarta}>
            <Editable as="span" id="impressum.hero.title" style={jakarta}>Impressum</Editable>
          </h1>
          <p className="text-lg text-[#5F6B73] font-light"><Editable as="span" id="impressum.hero.subtitle">Angaben gemäß § 5 TMG</Editable></p>
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-10">
          <div
            className="rounded-3xl overflow-hidden shadow-[0_20px_60px_rgb(191,234,242,0.3)] border-4 border-white opacity-0 translate-y-4 motion-safe:animate-[curaFadeUp_700ms_ease-out_forwards]"
          >
            <EditableImage id="impressum.hero.image" src={heroImg} alt="Büro mit Unterlagen" className="w-full aspect-[16/7] object-cover" />
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white/70">
        <div className="max-w-3xl mx-auto px-6 space-y-10">
          <Block title={<Editable as="span" id="impressum.anbieter.title">Anbieter</Editable>}>
            <p><Editable as="span" id="impressum.anbieter.line1">Cura Doma</Editable></p>
            <p><Editable as="span" id="impressum.anbieter.line2">Ambulanter Betreuungsdienst</Editable></p>
          </Block>

          <Block title={<Editable as="span" id="impressum.anschrift.title">Anschrift</Editable>}>
            <p className="flex items-start gap-2"><MapPin size={16} className="mt-1 text-[#6FD3D1] shrink-0" />
              <AddressBlock variant="br" country />
            </p>
          </Block>

          <Block title={<Editable as="span" id="impressum.kontakt.title">Kontakt</Editable>}>
            <p className="flex items-center gap-2"><Phone size={16} className="text-[#6FD3D1]" /> <PhoneText className="hover:text-[#6FD3D1]" /></p>
            <p className="flex items-center gap-2"><Mail size={16} className="text-[#6FD3D1]" /> <EmailText className="hover:text-[#6FD3D1]" /></p>
          </Block>

          <Block title={<Editable as="span" id="impressum.verantwortlich.title">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</Editable>}>
            <p><Editable as="span" id="impressum.verantwortlich.line1">Cura Doma</Editable></p>
            <p><AddressBlock variant="inline" /></p>
          </Block>

          <Block title={<Editable as="span" id="impressum.unternehmensangaben.title">Unternehmensangaben</Editable>}>
            <ul className="space-y-2 text-[#5F6B73]">
              <li><span className="text-[#111111]"><Editable as="span" id="impressum.unternehmensangaben.0.label">Vertreten durch:</Editable></span> <Editable as="span" id="impressum.unternehmensangaben.0.value">Marilena Linde</Editable></li>
              <li><span className="text-[#111111]"><Editable as="span" id="impressum.unternehmensangaben.1.label">Rechtsform:</Editable></span> <Editable as="span" id="impressum.unternehmensangaben.1.value">Einzelunternehmen</Editable></li>
              <li><span className="text-[#111111]"><Editable as="span" id="impressum.unternehmensangaben.2.label">Steuernummer:</Editable></span> <Editable as="span" id="impressum.unternehmensangaben.2.value">22/127/01564</Editable></li>
              <li><span className="text-[#111111]"><Editable as="span" id="impressum.unternehmensangaben.3.label">Aufsichtsbehörde / zuständige Stelle:</Editable></span> <Editable as="span" id="impressum.unternehmensangaben.3.value">Niedersächsisches Landesamt für Soziales, Jugend und Familie (LS), Regionalstelle Hildesheim</Editable></li>
              <li><span className="text-[#111111]"><Editable as="span" id="impressum.unternehmensangaben.4.label">Berufsrechtliche Angaben:</Editable></span> <Editable as="span" id="impressum.unternehmensangaben.4.value">Anerkanntes Angebot zur Unterstützung im Alltag gemäß § 45a SGB XI nach den Vorschriften des Landes Niedersachsen.</Editable></li>
            </ul>
          </Block>
        </div>
      </section>

      <style>{`@keyframes curaFadeUp { to { opacity: 1; transform: translateY(0); } }`}</style>
    </>
  );
}

function Block({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="cura-reveal cura-reveal-up bg-[#F8FEFF] rounded-2xl border border-[#E5F4F5] p-6 sm:p-8">
      <h2 className="text-lg font-medium text-[#111111] mb-3" style={jakarta}>{title}</h2>
      <div className="text-[15px] text-[#5F6B73] font-light leading-relaxed space-y-1">{children}</div>
    </div>
  );
}
