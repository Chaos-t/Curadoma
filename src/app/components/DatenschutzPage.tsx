import { Shield, Phone, Mail, MapPin } from "lucide-react";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const heroImg =
  "https://images.unsplash.com/photo-1633265486064-086b219458ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export function DatenschutzPage() {
  return (
    <>
      <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 overflow-hidden bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#6FD3D1] mb-6 uppercase tracking-wider">
            <Shield size={14} /> Datenschutz
          </div>
          <h1 className="text-[clamp(1.5rem,8vw,3rem)] font-medium tracking-tight text-[#111111] leading-[1.15] mb-4 break-words" style={jakarta}>
            Datenschutzerklärung
          </h1>
          <p className="text-lg text-[#5F6B73] font-light">
            Der Schutz Ihrer persönlichen Daten ist uns sehr wichtig.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-10">
          <div className="rounded-3xl overflow-hidden shadow-[0_20px_60px_rgb(191,234,242,0.3)] border-4 border-white opacity-0 translate-y-4 motion-safe:animate-[curaFadeUp_750ms_ease-out_forwards]">
            <img src={heroImg} alt="Datenschutz und Vertrauen" className="w-full aspect-[16/7] object-cover" />
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white/70">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          <Section title="1. Allgemeine Hinweise">
            <p>
              Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Wir verarbeiten Ihre personenbezogenen
              Daten ausschließlich auf Grundlage der geltenden datenschutzrechtlichen Bestimmungen, insbesondere der
              Datenschutz-Grundverordnung (DSGVO) und des Bundesdatenschutzgesetzes (BDSG).
            </p>
          </Section>

          <Section title="2. Verantwortliche Stelle">
            <p>Cura Doma — Ambulanter Betreuungsdienst</p>
            <p className="flex items-start gap-2"><MapPin size={16} className="mt-1 text-[#6FD3D1] shrink-0" /><span>Süntelhang 9, 31787 Hameln, Deutschland</span></p>
            <p className="flex items-center gap-2"><Phone size={16} className="text-[#6FD3D1]" /><a href="tel:+4951517107093" className="hover:text-[#6FD3D1]">05151 7107093</a></p>
            <p className="flex items-center gap-2"><Mail size={16} className="text-[#6FD3D1]" /><a href="mailto:info@curadoma.de" className="hover:text-[#6FD3D1]">info@curadoma.de</a></p>
          </Section>

          <Section title="3. Erhebung und Verarbeitung personenbezogener Daten">
            <p>
              Personenbezogene Daten werden nur dann verarbeitet, wenn Sie uns über das Kontaktformular, per E-Mail,
              per Telefon oder durch eine andere Interaktion mit unserer Website kontaktieren. Eine Verarbeitung
              erfolgt ausschließlich zur Bearbeitung Ihres Anliegens.
            </p>
          </Section>

          <Section title="4. Kontaktformular / Anfrageformular">
            <p>
              Die im Kontaktformular eingegebenen Daten (Name, E-Mail-Adresse, ggf. Telefonnummer, Betreff und Ihre
              Nachricht) werden ausschließlich zur Bearbeitung Ihrer Anfrage und einer möglichen Rückkontaktaufnahme
              verwendet. Eine Weitergabe an Dritte erfolgt nicht.
            </p>
          </Section>

          <Section title="5. Supabase als Backend-Dienst">
            <p>
              Für die technische Verarbeitung von Kontaktanfragen kann Supabase als Backend-Dienst eingesetzt werden.
              Die übermittelten Daten werden ausschließlich zur Bearbeitung der Anfrage verwendet und sicher gespeichert.
              Der Zugriff auf gespeicherte Anfragen ist auf berechtigte Personen mit entsprechenden Zugangsdaten beschränkt.
            </p>
          </Section>

          <Section title="6. Google Maps">
            <p>
              Zur Darstellung von Standorten und zur Routenplanung kann Google Maps eingebunden werden. Beim Aufruf
              entsprechender Inhalte können Daten (z. B. IP-Adresse) an Google übertragen werden. Weitere Informationen
              finden Sie in der Datenschutzerklärung von Google.
            </p>
          </Section>

          <Section title="7. Cookies und lokale Speicherung">
            <p>
              Wir verwenden ausschließlich technisch notwendige Speichermechanismen, die für den ordnungsgemäßen
              Betrieb der Website erforderlich sind. Tracking- oder Marketing-Cookies werden nicht eingesetzt.
            </p>
          </Section>

          <Section title="8. Ihre Rechte">
            <ul className="list-disc pl-5 space-y-1">
              <li>Recht auf Auskunft</li>
              <li>Recht auf Berichtigung</li>
              <li>Recht auf Löschung</li>
              <li>Recht auf Einschränkung der Verarbeitung</li>
              <li>Recht auf Widerspruch</li>
              <li>Recht auf Datenübertragbarkeit</li>
              <li>Beschwerderecht bei einer Aufsichtsbehörde</li>
            </ul>
          </Section>

          <Section title="9. Kontakt für Datenschutzanfragen">
            <p className="flex items-center gap-2"><Mail size={16} className="text-[#6FD3D1]" /><a href="mailto:info@curadoma.de" className="hover:text-[#6FD3D1]">info@curadoma.de</a></p>
          </Section>

          <p className="cura-reveal cura-reveal-up text-xs text-[#9AA3A8] font-light italic pt-4 border-t border-[#E5F4F5]">
            Hinweis: Diese Datenschutzerklärung ist eine Vorlage und sollte vor Veröffentlichung rechtlich geprüft
            und an die tatsächlich eingesetzten Dienste angepasst werden.
          </p>
        </div>
      </section>

      <style>{`@keyframes curaFadeUp { to { opacity: 1; transform: translateY(0); } }`}</style>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="cura-reveal cura-reveal-up bg-[#F8FEFF] rounded-2xl border border-[#E5F4F5] p-6 sm:p-8">
      <h2 className="text-lg font-medium text-[#111111] mb-3" style={jakarta}>{title}</h2>
      <div className="text-[15px] text-[#5F6B73] font-light leading-relaxed space-y-2">{children}</div>
    </div>
  );
}
