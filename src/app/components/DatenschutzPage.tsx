import { Shield, Phone, Mail, MapPin } from "lucide-react";
import { Editable } from "./editor/Editable";
import { EditableImage } from "./editor/EditableImage";
import { PhoneText, EmailText, AddressBlock } from "./editor/Shared";
import { Css } from "./Css";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const heroImg =
  "https://images.unsplash.com/photo-1633265486064-086b219458ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export function DatenschutzPage() {
  return (
    <>
      <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 overflow-hidden bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#0E6E6A] mb-6 uppercase tracking-wider">
            <Shield size={14} /> <Editable as="span" id="datenschutz.hero.badge">Datenschutz</Editable>
          </div>
          <h1 className="text-[clamp(1.5rem,8vw,3rem)] font-medium tracking-tight text-[#111111] leading-[1.15] mb-4 break-words" style={jakarta}>
            <Editable as="span" id="datenschutz.hero.h1" style={jakarta}>Datenschutzerklärung</Editable>
          </h1>
          <p className="text-lg text-[#5F6B73] font-light">
            <Editable as="span" id="datenschutz.hero.intro">Der Schutz Ihrer persönlichen Daten ist uns sehr wichtig.</Editable>
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-10">
          <div className="rounded-3xl overflow-hidden shadow-[0_20px_60px_rgb(191,234,242,0.3)] border-4 border-white opacity-0 translate-y-4 motion-safe:animate-[curaFadeUp_750ms_ease-out_forwards]">
            <EditableImage id="datenschutz.hero.image" src={heroImg} alt="Datenschutz und Vertrauen" className="w-full aspect-[16/7] object-cover" />
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white/70">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          <Section title={<Editable as="span" id="datenschutz.section1.title">1. Allgemeine Hinweise</Editable>}>
            <p>
              <Editable as="span" id="datenschutz.section1.text">
                Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Wir verarbeiten Ihre personenbezogenen
                Daten ausschließlich auf Grundlage der geltenden datenschutzrechtlichen Bestimmungen, insbesondere der
                Datenschutz-Grundverordnung (DSGVO) und des Bundesdatenschutzgesetzes (BDSG).
              </Editable>
            </p>
          </Section>

          <Section title={<Editable as="span" id="datenschutz.section2.title">2. Verantwortliche Stelle</Editable>}>
            <p><Editable as="span" id="datenschutz.section2.name">Cura Doma — Ambulanter Betreuungsdienst</Editable></p>
            <p className="flex items-start gap-2"><MapPin size={16} className="mt-1 text-[#6FD3D1] shrink-0" /><AddressBlock variant="inline" country /></p>
            <p className="flex items-center gap-2"><Phone size={16} className="text-[#6FD3D1]" /><PhoneText className="hover:text-[#0F7C77]" /></p>
            <p className="flex items-center gap-2"><Mail size={16} className="text-[#6FD3D1]" /><EmailText className="hover:text-[#0F7C77]" /></p>
          </Section>

          <Section title={<Editable as="span" id="datenschutz.section3.title">3. Erhebung und Verarbeitung personenbezogener Daten</Editable>}>
            <p>
              <Editable as="span" id="datenschutz.section3.text">
                Personenbezogene Daten werden nur dann verarbeitet, wenn Sie uns über das Kontaktformular, per E-Mail,
                per Telefon oder durch eine andere Interaktion mit unserer Website kontaktieren. Eine Verarbeitung
                erfolgt ausschließlich zur Bearbeitung Ihres Anliegens.
              </Editable>
            </p>
          </Section>

          <Section title={<Editable as="span" id="datenschutz.section4.title">4. Kontaktformular / Anfrageformular</Editable>}>
            <p>
              <Editable as="span" id="datenschutz.section4.text">
                Die im Kontaktformular eingegebenen Daten (Name, E-Mail-Adresse, ggf. Telefonnummer, Betreff und Ihre
                Nachricht) werden ausschließlich zur Bearbeitung Ihrer Anfrage und einer möglichen Rückkontaktaufnahme
                verwendet. Eine Weitergabe an Dritte erfolgt nicht.
              </Editable>
            </p>
          </Section>

          <Section title={<Editable as="span" id="datenschutz.section5.title">5. Supabase als Backend-Dienst</Editable>}>
            <p>
              <Editable as="span" id="datenschutz.section5.text">
                Für die technische Verarbeitung von Kontaktanfragen kann Supabase als Backend-Dienst eingesetzt werden.
                Die übermittelten Daten werden ausschließlich zur Bearbeitung der Anfrage verwendet und sicher gespeichert.
                Der Zugriff auf gespeicherte Anfragen ist auf berechtigte Personen mit entsprechenden Zugangsdaten beschränkt.
              </Editable>
            </p>
          </Section>

          <Section title={<Editable as="span" id="datenschutz.section6.title">6. Google Maps</Editable>}>
            <p>
              <Editable as="span" id="datenschutz.section6.text">
                Zur Darstellung von Standorten und zur Routenplanung kann Google Maps eingebunden werden. Beim Aufruf
                entsprechender Inhalte können Daten (z. B. IP-Adresse) an Google übertragen werden. Weitere Informationen
                finden Sie in der Datenschutzerklärung von Google.
              </Editable>
            </p>
          </Section>

          <Section title={<Editable as="span" id="datenschutz.section7.title">7. Cookies und lokale Speicherung</Editable>}>
            <p>
              <Editable as="span" id="datenschutz.section7.text">
                Wir verwenden ausschließlich technisch notwendige Speichermechanismen, die für den ordnungsgemäßen
                Betrieb der Website erforderlich sind. Tracking- oder Marketing-Cookies werden nicht eingesetzt.
              </Editable>
            </p>
          </Section>

          <Section title={<Editable as="span" id="datenschutz.section8.title">8. Ihre Rechte</Editable>}>
            <ul className="list-disc pl-5 space-y-1">
              <li><Editable as="span" id="datenschutz.section8.rights.0">Recht auf Auskunft</Editable></li>
              <li><Editable as="span" id="datenschutz.section8.rights.1">Recht auf Berichtigung</Editable></li>
              <li><Editable as="span" id="datenschutz.section8.rights.2">Recht auf Löschung</Editable></li>
              <li><Editable as="span" id="datenschutz.section8.rights.3">Recht auf Einschränkung der Verarbeitung</Editable></li>
              <li><Editable as="span" id="datenschutz.section8.rights.4">Recht auf Widerspruch</Editable></li>
              <li><Editable as="span" id="datenschutz.section8.rights.5">Recht auf Datenübertragbarkeit</Editable></li>
              <li><Editable as="span" id="datenschutz.section8.rights.6">Beschwerderecht bei einer Aufsichtsbehörde</Editable></li>
            </ul>
          </Section>

          <Section title={<Editable as="span" id="datenschutz.section9.title">9. Kontakt für Datenschutzanfragen</Editable>}>
            <p className="flex items-center gap-2"><Mail size={16} className="text-[#6FD3D1]" /><EmailText className="hover:text-[#0F7C77]" /></p>
          </Section>
        </div>
      </section>

      <Css>{`@keyframes curaFadeUp { to { opacity: 1; transform: translateY(0); } }`}</Css>
    </>
  );
}

function Section({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="cura-reveal cura-reveal-up bg-[#F8FEFF] rounded-2xl border border-[#E5F4F5] p-6 sm:p-8">
      <h2 className="text-lg font-medium text-[#111111] mb-3" style={jakarta}>{title}</h2>
      <div className="text-[15px] text-[#5F6B73] font-light leading-relaxed space-y-2">{children}</div>
    </div>
  );
}
