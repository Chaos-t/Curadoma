import { useState, useRef } from "react";
import { Link } from "react-router";
import { Phone, Mail, MapPin, Clock, Heart, Send, CheckCircle, Navigation, ExternalLink, AlertCircle } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import {
  validateName,
  validateEmail,
  validatePhone,
  validateMessage,
  validateSubject,
  validateConsent,
  looksLikeBotSubmit,
  Limits,
} from "../../lib/validation";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const img = "https://images.unsplash.com/photo-1758518725921-1eb74ed293be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllbmRseSUyMGNvbnN1bHRhdGlvbiUyMG9mZmljZSUyMG1lZXRpbmclMjB3YXJtfGVufDF8fHx8MTc3NTMxNDQ5MXww&ixlib=rb-4.1.0&q=80&w=1080";

const ADDRESS = "Süntelhang 9, 31787 Hameln";
const PHONE = "05151 7107093";
const PHONE_LINK = "tel:+4951517107093";
const GOOGLE_MAPS_EMBED = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2440.5!2d9.3567!3d52.1037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zU8O8bnRlbGhhbmcgOSwgMzE3ODcgSGFtZWxu!5e0!3m2!1sde!2sde!4v1700000000000!5m2!1sde!2sde";
const GOOGLE_MAPS_URL = "https://www.google.com/maps/search/?api=1&query=S%C3%BCntelhang+9%2C+31787+Hameln%2C+Germany";

function getMapsUrl() {
  const encoded = encodeURIComponent("Süntelhang 9, 31787 Hameln, Germany");
  // On iOS/Android, geo: and maps: protocols try native apps
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return `maps://maps.apple.com/?q=${encoded}`;
  }
  if (/Android/i.test(ua)) {
    return `geo:0,0?q=${encoded}`;
  }
  return GOOGLE_MAPS_URL;
}

export function KontaktPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    consent: false,
    // Honeypot — must stay empty. Real users won't see this field; bots
    // typically autofill any input they recognise.
    website: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Time the form was first rendered — used to filter out instant
  // (sub-2.5s) bot submissions.
  const openedAtRef = useRef<number>(Date.now());

  const update = (key: keyof typeof form, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const validateAll = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    const firstNameErr = validateName(form.firstName, "Vornamen");
    const lastNameErr = validateName(form.lastName, "Nachnamen");
    if (firstNameErr) errs.firstName = firstNameErr;
    if (lastNameErr) errs.lastName = lastNameErr;
    const emailErr = validateEmail(form.email);
    if (emailErr) errs.email = emailErr;
    const phoneErr = validatePhone(form.phone, false);
    if (phoneErr) errs.phone = phoneErr;
    const subjectErr = validateSubject(form.subject);
    if (subjectErr) errs.subject = subjectErr;
    const messageErr = validateMessage(form.message);
    if (messageErr) errs.message = messageErr;
    const consentErr = validateConsent(form.consent);
    if (consentErr) errs.consent_privacy = consentErr;
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Honeypot tripped → silently pretend success. Don't tell the bot which
    // field gave it away.
    if (form.website) {
      setSubmitted(true);
      return;
    }

    const errs = validateAll();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    if (looksLikeBotSubmit(openedAtRef.current)) {
      setError("Bitte versuchen Sie es in ein paar Sekunden noch einmal.");
      return;
    }

    setSubmitting(true);
    try {
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ec6100a6/contact-messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            name: fullName,
            email: form.email.trim(),
            phone: form.phone.trim() || null,
            subject: form.subject || null,
            message: form.message.trim(),
            page_source: typeof window !== "undefined" ? window.location.pathname : "/kontakt",
            consent_privacy: form.consent,
          }),
        },
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.log("Kontaktformular: Server lehnte ab:", res.status, data);
        if (data?.fields) setFieldErrors(data.fields);
        setError(data?.error ?? `Anfrage konnte nicht gesendet werden (Status ${res.status}).`);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.log("Kontaktformular: Netzwerkfehler beim Senden:", err);
      setError(`Verbindungsfehler beim Senden der Anfrage: ${err}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenMaps = () => {
    window.open(getMapsUrl(), "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Hero */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
        <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-[#BFEAF2] opacity-15 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/3"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#6FD3D1] mb-6 uppercase tracking-wider">
            Kontakt aufnehmen
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-6" style={jakarta}>
            Wir sind <span className="text-[#6FD3D1]">für Sie da</span>
          </h1>
          <p className="text-lg text-[#5F6B73] leading-relaxed max-w-2xl mx-auto font-light">
            Nehmen Sie Kontakt auf für ein kostenfreies Erstgespräch. Wir nehmen uns Zeit für Sie, beantworten alle Fragen und finden gemeinsam die beste Lösung für Ihre Situation.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-white/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form */}
          <div>
            <h2 className="text-2xl font-medium tracking-tight text-[#111111] mb-6" style={jakarta}>
              Schreiben Sie uns
            </h2>

            {submitted ? (
              <div className="bg-[#F8FEFF] p-8 rounded-3xl border border-[#E5F4F5] text-center">
                <CheckCircle size={48} className="text-[#6FD3D1] mx-auto mb-4" />
                <h3 className="text-xl font-medium text-[#111111] mb-2" style={jakarta}>Vielen Dank für Ihre Anfrage.</h3>
                <p className="text-[15px] text-[#5F6B73] font-light">Wir melden uns schnellstmöglich bei Ihnen.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Honeypot — hidden from sighted users + screen readers, but
                    present in the DOM so naive bots autofill it. */}
                <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
                  <label>
                    Website (bitte freilassen)
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={(e) => update("website", e.target.value)}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-1.5" htmlFor="kontakt-firstName">Vorname *</label>
                    <input
                      id="kontakt-firstName"
                      type="text"
                      autoComplete="given-name"
                      maxLength={Limits.NAME_MAX}
                      required
                      aria-invalid={!!fieldErrors.firstName}
                      value={form.firstName}
                      onChange={(e) => update("firstName", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#E5F4F5] bg-[#F8FEFF] text-sm font-light text-[#111111] focus:outline-none focus:border-[#6FD3D1] focus:ring-1 focus:ring-[#6FD3D1] transition-colors"
                      placeholder="Max"
                    />
                    {fieldErrors.firstName && <p className="text-xs text-red-500 mt-1">{fieldErrors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-1.5" htmlFor="kontakt-lastName">Nachname *</label>
                    <input
                      id="kontakt-lastName"
                      type="text"
                      autoComplete="family-name"
                      maxLength={Limits.NAME_MAX}
                      required
                      aria-invalid={!!fieldErrors.lastName}
                      value={form.lastName}
                      onChange={(e) => update("lastName", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#E5F4F5] bg-[#F8FEFF] text-sm font-light text-[#111111] focus:outline-none focus:border-[#6FD3D1] focus:ring-1 focus:ring-[#6FD3D1] transition-colors"
                      placeholder="Mustermann"
                    />
                    {fieldErrors.lastName && <p className="text-xs text-red-500 mt-1">{fieldErrors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-1.5" htmlFor="kontakt-email">E-Mail-Adresse *</label>
                  <input
                    id="kontakt-email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    maxLength={Limits.EMAIL_MAX}
                    required
                    aria-invalid={!!fieldErrors.email}
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5F4F5] bg-[#F8FEFF] text-sm font-light text-[#111111] focus:outline-none focus:border-[#6FD3D1] focus:ring-1 focus:ring-[#6FD3D1] transition-colors"
                    placeholder="max@beispiel.de"
                  />
                  {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-1.5" htmlFor="kontakt-phone">Telefonnummer</label>
                  <input
                    id="kontakt-phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={25}
                    aria-invalid={!!fieldErrors.phone}
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5F4F5] bg-[#F8FEFF] text-sm font-light text-[#111111] focus:outline-none focus:border-[#6FD3D1] focus:ring-1 focus:ring-[#6FD3D1] transition-colors"
                    placeholder="05151 7107093"
                  />
                  {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-1.5" htmlFor="kontakt-subject">Betreff</label>
                  <select id="kontakt-subject" value={form.subject} onChange={(e) => update("subject", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#E5F4F5] bg-[#F8FEFF] text-sm font-light text-[#5F6B73] focus:outline-none focus:border-[#6FD3D1] focus:ring-1 focus:ring-[#6FD3D1] transition-colors">
                    <option value="">Bitte wählen...</option>
                    <option>Alltagsbegleitung</option>
                    <option>Hilfe im Haushalt</option>
                    <option>Demenzbetreuung</option>
                    <option>Entlastung für Angehörige</option>
                    <option>Beratung zu Pflegekasse</option>
                    <option>Sonstiges</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-1.5" htmlFor="kontakt-message">
                    Ihre Nachricht *
                    <span className="text-[11px] font-light text-[#9AA3A8] ml-2">{form.message.length}/{Limits.MESSAGE_MAX}</span>
                  </label>
                  <textarea
                    id="kontakt-message"
                    rows={5}
                    maxLength={Limits.MESSAGE_MAX}
                    required
                    aria-invalid={!!fieldErrors.message}
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5F4F5] bg-[#F8FEFF] text-sm font-light text-[#111111] focus:outline-none focus:border-[#6FD3D1] focus:ring-1 focus:ring-[#6FD3D1] transition-colors resize-none"
                    placeholder="Beschreiben Sie kurz Ihre Situation oder Ihr Anliegen..."
                  />
                  {fieldErrors.message && <p className="text-xs text-red-500 mt-1">{fieldErrors.message}</p>}
                </div>
                <label className="flex items-start gap-3 text-sm text-[#5F6B73] font-light leading-relaxed">
                  <input type="checkbox" checked={form.consent} onChange={(e) => update("consent", e.target.checked)} className="mt-1 w-4 h-4 accent-[#6FD3D1] shrink-0" />
                  <span>
                    Ich habe die <Link to="/datenschutz" className="text-[#6FD3D1] underline hover:text-[#5BC2C0]">Datenschutzerklärung</Link> gelesen und stimme zu, dass meine Angaben zur Bearbeitung meiner Anfrage verarbeitet werden.
                  </span>
                </label>
                {fieldErrors.consent_privacy && <p className="text-xs text-red-500 -mt-3">{fieldErrors.consent_privacy}</p>}

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={submitting} className="w-full sm:w-auto bg-[#6FD3D1] text-white hover:bg-[#5BC2C0] disabled:opacity-60 disabled:cursor-not-allowed px-8 py-3.5 rounded-full text-base font-normal transition-all shadow-[0_8px_20px_rgb(111,211,209,0.25)] flex items-center justify-center gap-2">
                  <Send size={18} /> {submitting ? "Wird gesendet…" : "Nachricht senden"}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <div className="rounded-3xl overflow-hidden shadow-[0_20px_60px_rgb(191,234,242,0.3)] border-4 border-white mb-8">
              <img src={img} alt="Beratungsgespräch" className="w-full aspect-[4/3] object-cover" />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-medium tracking-tight text-[#111111]" style={jakarta}>Direkt erreichen</h3>

              <a href={PHONE_LINK} className="cura-card-glow flex items-center gap-4 p-4 rounded-2xl bg-[#F8FEFF] border border-[#E5F4F5] hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#DFF7F8] rounded-full flex items-center justify-center text-[#6FD3D1] shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="text-base font-medium text-[#111111]">{PHONE}</div>
                  <div className="text-sm text-[#5F6B73] font-light">Rufen Sie uns direkt an</div>
                </div>
              </a>

              <a href="mailto:info@curadoma.de" className="cura-card-glow flex items-center gap-4 p-4 rounded-2xl bg-[#F8FEFF] border border-[#E5F4F5] hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#DFF7F8] rounded-full flex items-center justify-center text-[#6FD3D1] shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="text-base font-medium text-[#111111]">info@curadoma.de</div>
                  <div className="text-sm text-[#5F6B73] font-light">Schreiben Sie uns jederzeit</div>
                </div>
              </a>

              <button
                onClick={handleOpenMaps}
                className="cura-card-glow w-full flex items-center gap-4 p-4 rounded-2xl bg-[#F8FEFF] border border-[#E5F4F5] hover:shadow-md transition-shadow text-left cursor-pointer"
              >
                <div className="w-12 h-12 bg-[#DFF7F8] rounded-full flex items-center justify-center text-[#6FD3D1] shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-base font-medium text-[#111111]">{ADDRESS}</div>
                  <div className="text-sm text-[#5F6B73] font-light">Einsatzgebiet: Hameln, Springe & Umgebung</div>
                </div>
                <ExternalLink size={16} className="text-[#6FD3D1] shrink-0" />
              </button>

              <div className="cura-card-glow flex items-center gap-4 p-4 rounded-2xl bg-[#F8FEFF] border border-[#E5F4F5]">
                <div className="w-12 h-12 bg-[#DFF7F8] rounded-full flex items-center justify-center text-[#6FD3D1] shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="text-base font-medium text-[#111111]">Mo–Fr: 8:00 – 18:00 Uhr</div>
                  <div className="text-sm text-[#5F6B73] font-light">Antwort innerhalb von 24 Stunden</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map & Location Section */}
      <section className="py-24 bg-[#F8FEFF]/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#DFF7F8] text-[#6FD3D1] mb-6">
              <MapPin size={24} />
            </div>
            <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-4" style={jakarta}>
              Hier finden Sie uns
            </h2>
            <p className="text-lg text-[#5F6B73] font-light max-w-2xl mx-auto">
              Besuchen Sie uns in Hameln oder kontaktieren Sie uns für einen Hausbesuch in Ihrem Zuhause.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map */}
            <div className="lg:col-span-2">
              <div
                className="rounded-3xl overflow-hidden border border-[#E5F4F5] shadow-[0_10px_40px_rgb(191,234,242,0.2)] cursor-pointer relative group"
                onClick={handleOpenMaps}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") handleOpenMaps(); }}
                aria-label="Standort in Google Maps öffnen"
              >
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent("Süntelhang 9, 31787 Hameln, Germany")}&output=embed&z=15`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: 400 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Cura Doma Standort – Süntelhang 9, 31787 Hameln"
                  className="w-full aspect-[16/10] lg:aspect-auto lg:h-full pointer-events-auto"
                ></iframe>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#6FD3D1]/0 group-hover:bg-[#6FD3D1]/5 transition-colors pointer-events-none"></div>
              </div>
            </div>

            {/* Contact block beside map */}
            <div className="flex flex-col gap-6">
              <div className="cura-card-glow bg-white/90 backdrop-blur-sm p-8 rounded-3xl border border-[#E5F4F5] shadow-sm flex-1">
                <h3 className="text-xl font-medium tracking-tight text-[#111111] mb-6" style={jakarta}>
                  Kontakt & Standort
                </h3>

                <div className="space-y-5">
                  <button
                    onClick={handleOpenMaps}
                    className="w-full flex items-start gap-4 text-left group/addr cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-[#DFF7F8] rounded-xl flex items-center justify-center text-[#6FD3D1] shrink-0 mt-0.5">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <div className="text-base font-medium text-[#111111] group-hover/addr:text-[#6FD3D1] transition-colors">Süntelhang 9</div>
                      <div className="text-sm text-[#5F6B73] font-light">31787 Hameln, Germany</div>
                    </div>
                  </button>

                  <a href={PHONE_LINK} className="flex items-start gap-4 group/phone">
                    <div className="w-10 h-10 bg-[#DFF7F8] rounded-xl flex items-center justify-center text-[#6FD3D1] shrink-0 mt-0.5">
                      <Phone size={18} />
                    </div>
                    <div>
                      <div className="text-base font-medium text-[#111111] group-hover/phone:text-[#6FD3D1] transition-colors">{PHONE}</div>
                      <div className="text-sm text-[#5F6B73] font-light">Direkt anrufen</div>
                    </div>
                  </a>

                  <a href="mailto:info@curadoma.de" className="flex items-start gap-4 group/mail">
                    <div className="w-10 h-10 bg-[#DFF7F8] rounded-xl flex items-center justify-center text-[#6FD3D1] shrink-0 mt-0.5">
                      <Mail size={18} />
                    </div>
                    <div>
                      <div className="text-base font-medium text-[#111111] group-hover/mail:text-[#6FD3D1] transition-colors">info@curadoma.de</div>
                      <div className="text-sm text-[#5F6B73] font-light">E-Mail schreiben</div>
                    </div>
                  </a>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#DFF7F8] rounded-xl flex items-center justify-center text-[#6FD3D1] shrink-0 mt-0.5">
                      <Clock size={18} />
                    </div>
                    <div>
                      <div className="text-base font-medium text-[#111111]">Mo–Fr: 8:00 – 18:00</div>
                      <div className="text-sm text-[#5F6B73] font-light">Termine nach Vereinbarung</div>
                    </div>
                  </div>
                </div>

                {/* Open in Maps button */}
                <button
                  onClick={handleOpenMaps}
                  className="mt-8 w-full bg-[#6FD3D1] text-white hover:bg-[#5BC2C0] px-6 py-3.5 rounded-full text-base font-normal transition-all shadow-[0_8px_20px_rgb(111,211,209,0.25)] flex items-center justify-center gap-2"
                >
                  <Navigation size={18} />
                  Route ansehen
                </button>

                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full bg-white text-[#5F6B73] border border-[#E5F4F5] hover:bg-[#F8FEFF] hover:text-[#111111] px-6 py-3 rounded-full text-sm font-normal transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink size={16} />
                  In Google Maps öffnen
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promise */}
      <section className="py-20 bg-white/80">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Heart size={48} strokeWidth={1} className="text-[#BFEAF2] mb-6 mx-auto" />
          <h2 className="text-2xl lg:text-3xl font-medium tracking-tight text-[#111111] mb-4" style={jakarta}>
            Unser Versprechen an Sie
          </h2>
          <p className="text-lg text-[#5F6B73] font-light max-w-2xl mx-auto">
            Jede Anfrage wird persönlich und vertraulich behandelt. Wir nehmen uns Zeit für ein ausführliches Erstgespräch, beraten Sie zu allen Möglichkeiten der Kostenübernahme und erstellen einen individuellen Betreuungsplan – alles kostenfrei und unverbindlich.
          </p>
        </div>
      </section>
    </>
  );
}
