import { useState, useRef } from "react";
import { Link } from "react-router";
import { Briefcase, ArrowRight, CheckCircle, AlertCircle, Send, Heart, Users, Clock } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import {
  validateName,
  validateEmail,
  validatePhone,
  validateMessage,
  validateConsent,
  looksLikeBotSubmit,
  Limits,
} from "../../lib/validation";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

const JOB_TITLE = "Alltagsbegleiter/Haushaltshilfe (m/w/d)";

const jobBullets = [
  "Unterstützung im Alltag",
  "Hilfe im Haushalt",
  "Begleitung bei Einkäufen und Terminen",
  "Freundlicher Umgang mit betreuungsbedürftigen Menschen",
  "Zuverlässigkeit und Verantwortungsbewusstsein",
  "Flexible Arbeitszeiten nach Absprache",
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  city: string;
  working_hours: string;
  earliest_start: string;
  experience_household: "ja" | "nein" | "";
  experience_household_text: string;
  experience_care: "ja" | "nein" | "";
  experience_care_text: string;
  drivers_license: "ja" | "nein" | "";
  has_car: "ja" | "nein" | "";
  motivation: string;
  cv_filename: string;
  consent_privacy: boolean;
  /** Honeypot — must stay empty. */
  website: string;
};

const initial: FormState = {
  name: "",
  email: "",
  phone: "",
  city: "",
  working_hours: "",
  earliest_start: "",
  experience_household: "",
  experience_household_text: "",
  experience_care: "",
  experience_care_text: "",
  drivers_license: "",
  has_car: "",
  motivation: "",
  cv_filename: "",
  consent_privacy: false,
  website: "",
};

export function KarrierePage() {
  const [showDetail, setShowDetail] = useState(false);
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const openedAtRef = useRef<number>(Date.now());

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Honeypot tripped → silently "succeed".
    if (form.website) {
      setSubmitted(true);
      return;
    }

    const errs: Record<string, string> = {};
    const nameErr = validateName(form.name, "Namen");
    const emailErr = validateEmail(form.email);
    const phoneErr = validatePhone(form.phone, true);
    const consentErr = validateConsent(form.consent_privacy);
    if (nameErr) errs.name = nameErr;
    if (emailErr) errs.email = emailErr;
    if (phoneErr) errs.phone = phoneErr;
    if (consentErr) errs.consent_privacy = consentErr;
    // City is optional but if filled, sanity-check length
    if (form.city.trim() && form.city.trim().length > 60) {
      errs.city = "Wohnort darf höchstens 60 Zeichen haben.";
    }
    // Motivation is optional but cap length
    if (form.motivation.trim()) {
      const mErr = validateMessage(form.motivation);
      if (mErr && mErr.includes("zu lang")) errs.motivation = mErr;
    }
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
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ec6100a6/job-applications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            // Strip honeypot — don't send "website" upstream.
            ...(({ website: _hp, ...rest }) => rest)(form),
            experience_household: form.experience_household === "ja",
            experience_care: form.experience_care === "ja",
            drivers_license: form.drivers_license === "ja",
            has_car: form.has_car === "ja",
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.log("Bewerbung: Server lehnte ab:", res.status, data);
        if (data?.fields) setFieldErrors(data.fields);
        setError(
          data?.error ??
            "Ihre Bewerbung konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.",
        );
        return;
      }
      setSubmitted(true);
    } catch (err) {
      console.log("Bewerbung: Netzwerkfehler:", err);
      setError(
        `Ihre Bewerbung konnte leider nicht gesendet werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt. (${err})`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#BFEAF2] opacity-15 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#6FD3D1] mb-6 uppercase tracking-wider">
            <Briefcase size={14} /> Karriere
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-6" style={jakarta}>
            Karriere bei <span className="text-[#6FD3D1]">Cura Doma</span>
          </h1>
          <p className="text-lg text-[#5F6B73] leading-relaxed max-w-2xl mx-auto font-light mb-8">
            Wir suchen engagierte Unterstützung für unser Team im Bereich Betreuung und Haushaltshilfe.
          </p>
          <a
            href="#bewerben"
            className="inline-flex items-center gap-2 bg-[#6FD3D1] text-white hover:bg-[#5BC2C0] px-8 py-3.5 rounded-full text-base font-normal transition-all shadow-[0_8px_20px_rgb(111,211,209,0.25)]"
          >
            Jetzt bewerben <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* Job offers */}
      <section className="py-20 bg-[#EFFBFB]/70">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium tracking-tight text-[#111111] mb-3" style={jakarta}>
              Offene Stellen
            </h2>
            <p className="text-[#5F6B73] font-light">
              Aktuell suchen wir Verstärkung für unser Team rund um Hameln.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E5F4F5] shadow-[0_18px_50px_rgb(191,234,242,0.3)] p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#DFF7F8] text-[11px] font-medium text-[#6FD3D1] mb-3 uppercase tracking-wider">
                Festanstellung · Teilzeit · Minijob · flexibel
              </div>
              <h3 className="text-xl font-medium text-[#111111] mb-2" style={jakarta}>
                {JOB_TITLE}
              </h3>
              <p className="text-[15px] text-[#5F6B73] font-light leading-relaxed max-w-lg">
                Werden Sie Teil unseres Teams und unterstützen Sie pflegebedürftige Menschen in
                ihrem Alltag — mit Empathie, Verlässlichkeit und Herz.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDetail((v) => !v)}
              className="shrink-0 inline-flex items-center gap-2 bg-[#6FD3D1] text-white hover:bg-[#5BC2C0] px-6 py-3 rounded-full text-sm font-normal transition-all shadow-[0_8px_20px_rgb(111,211,209,0.25)]"
            >
              zum Stellenangebot <ArrowRight size={16} />
            </button>
          </div>

          {showDetail && (
            <div className="mt-8 bg-white rounded-3xl border border-[#E5F4F5] p-8 sm:p-10">
              <h3 className="text-xl font-medium text-[#111111] mb-5" style={jakarta}>
                {JOB_TITLE} — Aufgaben & Profil
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {jobBullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-[15px] text-[#5F6B73] font-light">
                    <CheckCircle size={16} className="text-[#6FD3D1] mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-4 text-xs text-[#5F6B73] font-light">
                <span className="inline-flex items-center gap-1.5"><Heart size={14} className="text-[#6FD3D1]" /> Wertschätzendes Team</span>
                <span className="inline-flex items-center gap-1.5"><Clock size={14} className="text-[#6FD3D1]" /> Flexible Zeitmodelle</span>
                <span className="inline-flex items-center gap-1.5"><Users size={14} className="text-[#6FD3D1]" /> Sinnvolle Tätigkeit</span>
              </div>
              <a
                href="#bewerben"
                className="inline-flex items-center gap-2 mt-8 bg-[#6FD3D1] text-white hover:bg-[#5BC2C0] px-6 py-3 rounded-full text-sm font-normal transition-all shadow-[0_8px_20px_rgb(111,211,209,0.25)]"
              >
                Jetzt bewerben <ArrowRight size={16} />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Application form */}
      <section id="bewerben" className="py-20 bg-white/80 scroll-mt-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-medium tracking-tight text-[#111111] mb-3" style={jakarta}>
              Ihre Bewerbung
            </h2>
            <p className="text-[#5F6B73] font-light">
              Position: <span className="text-[#111111]">{JOB_TITLE}</span>
            </p>
          </div>

          {submitted ? (
            <div className="bg-[#F8FEFF] p-8 rounded-3xl border border-[#E5F4F5] text-center">
              <CheckCircle size={48} className="text-[#6FD3D1] mx-auto mb-4" />
              <h3 className="text-xl font-medium text-[#111111] mb-2" style={jakarta}>
                Vielen Dank!
              </h3>
              <p className="text-[15px] text-[#5F6B73] font-light">
                Ihre Bewerbung wurde erfolgreich übermittelt.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5 bg-[#F8FEFF] rounded-3xl border border-[#E5F4F5] p-6 sm:p-8" noValidate>
              {/* Honeypot field — must stay empty */}
              <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
                <label>
                  Website (bitte freilassen)
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => set("website", e.target.value)}
                  />
                </label>
              </div>

              <Field label="Vollständiger Name *" error={fieldErrors.name}>
                <input type="text" autoComplete="name" maxLength={Limits.NAME_MAX} required aria-invalid={!!fieldErrors.name} value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder="Vor- und Nachname" />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="E-Mail-Adresse *" error={fieldErrors.email}>
                  <input type="email" autoComplete="email" inputMode="email" maxLength={Limits.EMAIL_MAX} required aria-invalid={!!fieldErrors.email} value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} placeholder="name@beispiel.de" />
                </Field>
                <Field label="Telefonnummer *" error={fieldErrors.phone}>
                  <input type="tel" autoComplete="tel" inputMode="tel" maxLength={25} required aria-invalid={!!fieldErrors.phone} value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} placeholder="05151 7107093" />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Wohnort" error={fieldErrors.city}>
                  <input type="text" autoComplete="address-level2" maxLength={60} value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls} placeholder="Hameln" />
                </Field>
                <Field label="Gewünschte Arbeitszeit">
                  <select value={form.working_hours} onChange={(e) => set("working_hours", e.target.value)} className={inputCls}>
                    <option value="">Bitte wählen…</option>
                    <option>Vollzeit</option>
                    <option>Teilzeit</option>
                    <option>Minijob</option>
                    <option>flexibel</option>
                  </select>
                </Field>
              </div>

              <Field label="Frühestmögliches Eintrittsdatum">
                <input type="date" value={form.earliest_start} onChange={(e) => set("earliest_start", e.target.value)} className={inputCls} />
              </Field>

              <YesNoBlock
                label="Haben Sie Erfahrung in der Haushaltsunterstützung?"
                value={form.experience_household}
                onChange={(v) => set("experience_household", v)}
                detail={form.experience_household_text}
                onDetail={(v) => set("experience_household_text", v)}
              />

              <YesNoBlock
                label="Haben Sie Erfahrung in der Senioren- bzw. Alltagsbetreuung?"
                value={form.experience_care}
                onChange={(v) => set("experience_care", v)}
                detail={form.experience_care_text}
                onDetail={(v) => set("experience_care_text", v)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Führerschein vorhanden?">
                  <RadioRow value={form.drivers_license} onChange={(v) => set("drivers_license", v)} name="drivers_license" />
                </Field>
                <Field label="Eigenes Auto verfügbar?">
                  <RadioRow value={form.has_car} onChange={(v) => set("has_car", v)} name="has_car" />
                </Field>
              </div>

              <Field label="Kurze Motivation" error={fieldErrors.motivation}>
                <textarea
                  value={form.motivation}
                  onChange={(e) => set("motivation", e.target.value)}
                  rows={4}
                  maxLength={Limits.MESSAGE_MAX}
                  className={`${inputCls} resize-none`}
                  placeholder="Warum möchten Sie bei Cura Doma arbeiten?"
                />
              </Field>

              <Field label="Lebenslauf / Unterlagen (optional)">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(e) => set("cv_filename", e.target.files?.[0]?.name ?? "")}
                  className="block w-full text-sm text-[#5F6B73] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-[#DFF7F8] file:text-[#6FD3D1] hover:file:bg-[#BFEAF2] cursor-pointer"
                />
                {form.cv_filename && (
                  <p className="text-xs text-[#5F6B73] font-light mt-1">Ausgewählt: {form.cv_filename}</p>
                )}
              </Field>

              <label className="flex items-start gap-3 text-sm text-[#5F6B73] font-light leading-relaxed">
                <input type="checkbox" checked={form.consent_privacy} onChange={(e) => set("consent_privacy", e.target.checked)} className="mt-1 w-4 h-4 accent-[#6FD3D1] shrink-0" />
                <span>
                  Ich habe die <Link to="/datenschutz" className="text-[#6FD3D1] underline hover:text-[#5BC2C0]">Datenschutzerklärung</Link> gelesen und stimme zu, dass meine Angaben zur Bearbeitung meiner Bewerbung verarbeitet werden.
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
                <Send size={18} /> {submitting ? "Wird gesendet…" : "Bewerbung absenden"}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-[#E5F4F5] bg-white text-sm font-light text-[#111111] focus:outline-none focus:border-[#6FD3D1] focus:ring-1 focus:ring-[#6FD3D1] transition-colors";

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#111111] mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function RadioRow({ value, onChange, name }: { value: "ja" | "nein" | ""; onChange: (v: "ja" | "nein") => void; name: string }) {
  return (
    <div className="flex gap-4">
      {(["ja", "nein"] as const).map((opt) => (
        <label key={opt} className="inline-flex items-center gap-2 text-sm text-[#5F6B73] font-light cursor-pointer">
          <input type="radio" name={name} checked={value === opt} onChange={() => onChange(opt)} className="accent-[#6FD3D1]" />
          {opt === "ja" ? "Ja" : "Nein"}
        </label>
      ))}
    </div>
  );
}

function YesNoBlock({
  label,
  value,
  onChange,
  detail,
  onDetail,
}: {
  label: string;
  value: "ja" | "nein" | "";
  onChange: (v: "ja" | "nein") => void;
  detail: string;
  onDetail: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#111111] mb-1.5">{label}</label>
      <RadioRow value={value} onChange={onChange} name={label} />
      {value === "ja" && (
        <textarea
          value={detail}
          onChange={(e) => onDetail(e.target.value)}
          rows={2}
          className={`${inputCls} resize-none mt-3`}
          placeholder="Bitte kurz beschreiben (optional)"
        />
      )}
    </div>
  );
}
