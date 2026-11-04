import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  CalendarDays, Clock, ChevronLeft, ChevronRight, CheckCircle, Phone,
  ArrowRight, AlertCircle, MessageSquare, Sparkles,
} from "lucide-react";
import {
  BOOKING_SERVICES, BOOKING_SLOTS, BOOKING_LOCATIONS, FN_BASE, FN_ANON,
  toISODate, isWeekend, startOfToday, formatGermanDate, fetchBookedMap,
  type BookingLocation,
} from "../../lib/booking";
import {
  validateName, validateEmail, validatePhone, validateConsent, looksLikeBotSubmit, Limits,
} from "../../lib/validation";
import { Editable } from "./editor/Editable";
import { PhoneText } from "./editor/Shared";

const jakarta = { fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif" };

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

// WICHTIG (Vorab-Rendern): Der Kalender haengt vom HEUTIGEN Datum ab. Wuerde er
// schon beim Build gerendert, waere er auf das Build-Datum eingefroren und die
// Hydration im Browser liefe auseinander. Deshalb kennt die Seite "heute" erst
// nach dem Mounten (useEffect); bis dahin steht ein gleich grosser Platzhalter da.
function CalendarSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9" />
        <div className="h-4 w-32 rounded bg-[#E5F4F5]" />
        <div className="w-9 h-9" />
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[11px] font-medium text-[#5F6B73] py-1">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }, (_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-[#F8FEFF]" />
        ))}
      </div>
    </div>
  );
}

// Heute nur noch Zeiten mit mindestens 60 Minuten Vorlauf; die Server-Pruefung
// (POST /appointments) lehnt zusaetzlich alles ab, was bereits vorbei ist.
const LEAD_MINUTES = 60;
const slotMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
function isSlotTooLate(t: string, now: Date) {
  return slotMinutes(t) < now.getHours() * 60 + now.getMinutes() + LEAD_MINUTES;
}
const noSlotLeftToday = (now: Date) => BOOKING_SLOTS.every((t) => isSlotTooLate(t, now));

function Calendar({ today, selected, onSelect }: { today: Date; selected: Date | null; onSelect: (d: Date) => void }) {
  const [view, setView] = useState(() => {
    const base = selected ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const year = view.getFullYear();
  const month = view.getMonth();
  const monthLabel = view.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const offset = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-based
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  const todayFull = noSlotLeftToday(new Date()); // nach 15 Uhr ist heute nichts mehr frei

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setView(new Date(year, month - 1, 1))}
          disabled={isCurrentMonth}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#5F6B73] hover:bg-[#F8FEFF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Voriger Monat"
        >
          <ChevronLeft size={18} strokeWidth={1.8} />
        </button>
        <div className="text-sm font-medium text-[#111111] capitalize" style={jakarta} aria-live="polite">{monthLabel}</div>
        <button
          type="button"
          onClick={() => setView(new Date(year, month + 1, 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#5F6B73] hover:bg-[#F8FEFF] transition-colors"
          aria-label="Nächster Monat"
        >
          <ChevronRight size={18} strokeWidth={1.8} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[11px] font-medium text-[#5F6B73] py-1">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isToday = toISODate(d) === toISODate(today);
          const disabled = isWeekend(d) || d < today || (isToday && todayFull);
          const isSel = !!selected && toISODate(d) === toISODate(selected);
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              aria-pressed={isSel}
              aria-label={formatGermanDate(d)}
              onClick={() => onSelect(d)}
              className={`aspect-square rounded-xl text-sm transition-colors ${
                disabled
                  ? "text-[#C9D2D6] cursor-not-allowed"
                  : isSel
                    ? "bg-[#0F7C77] text-white font-medium shadow-[0_4px_12px_rgb(111,211,209,0.4)]"
                    : "text-[#111111] hover:bg-[#DFF7F8]"
              } ${isToday && !isSel ? "ring-1 ring-[#6FD3D1]" : ""}`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepCard({ n, title, icon, children }: { n: number; title: ReactNode; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="cura-reveal cura-reveal-up bg-white/90 backdrop-blur-sm rounded-3xl border border-[#E5F4F5] p-6 sm:p-7">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-full bg-[#0F7C77] text-white flex items-center justify-center text-sm font-medium shrink-0" style={jakarta}>{n}</div>
        <h2 className="text-lg font-medium tracking-tight text-[#111111] flex items-center gap-2" style={jakarta}>
          <span className="text-[#0F7C77]">{icon}</span>{title}
        </h2>
      </div>
      {children}
    </div>
  );
}

const pillCls = (active: boolean) =>
  `px-4 py-2.5 rounded-full text-sm font-light border transition-all ${
    active
      ? "bg-[#0F7C77] text-white border-[#6FD3D1] shadow-[0_4px_14px_rgb(111,211,209,0.3)]"
      : "bg-white text-[#5F6B73] border-[#E5F4F5] hover:border-[#BFEAF2] hover:text-[#111111]"
  }`;

// Fehlermeldung unter einem Feld. data-field-error dient als Sprungziel, wenn
// das Absenden an der Pruefung scheitert (die Felder liegen mobil weit oben).
function FieldError({ msg, className = "" }: { msg?: string; className?: string }) {
  if (!msg) return null;
  return <p data-field-error className={`text-xs text-red-700 ${className}`}>{msg}</p>;
}

const HOW_STEPS = [
  { icon: <CalendarDays size={26} strokeWidth={1.5} />, title: "1 · Anfragen", desc: "Leistung, Standort, Tag und Uhrzeit wählen und das kurze Formular absenden." },
  { icon: <CheckCircle size={26} strokeWidth={1.5} />, title: "2 · Wir bestätigen", desc: "Wir prüfen Ihren Wunschtermin und bestätigen ihn zeitnah per E-Mail." },
  { icon: <Phone size={26} strokeWidth={1.5} />, title: "3 · Wir sind für Sie da", desc: "Zum bestätigten Termin melden wir uns – telefonisch oder bei Ihnen vor Ort." },
];

export function TerminPage() {
  const [today, setToday] = useState<Date | null>(null);
  const [service, setService] = useState("");
  const [location, setLocation] = useState<BookingLocation | "">("");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "", consent: false, website: "" });
  const [bookedMap, setBookedMap] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mailFailed, setMailFailed] = useState(false); // gespeichert, aber Betreiber-Mail nicht raus
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const openedAtRef = useRef<number>(Date.now());
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setToday(startOfToday()); // erst im Browser, siehe Kommentar ueber CalendarSkeleton
    fetchBookedMap().then(setBookedMap);
  }, []);

  // Nach dem Absenden ersetzt die Erfolgsmeldung das (viel hoehere) Formular —
  // ohne Sprung laege sie oberhalb des sichtbaren Bereichs.
  useEffect(() => {
    if (!submitted || !successRef.current) return;
    // Bewusst ohne "smooth": das Formular schrumpft im selben Moment, und ein
    // weicher Bildlauf wurde dabei im Test abgebrochen -> direkter Sprung.
    successRef.current.scrollIntoView({ block: "center" });
    successRef.current.focus({ preventScroll: true });
  }, [submitted]);

  // Nach einer gescheiterten Pruefung zum ersten markierten Feld springen. Als
  // Effekt (nach dem Rendern der Meldungen), nicht per requestAnimationFrame.
  const [errorJump, setErrorJump] = useState(0);
  useEffect(() => {
    if (errorJump) document.querySelector("[data-field-error]")?.scrollIntoView({ block: "center" });
  }, [errorJump]);

  const showErrors = (errs: Record<string, string>) => {
    setFieldErrors(errs);
    setError("Bitte prüfen Sie die markierten Angaben.");
    setErrorJump((n) => n + 1);
  };

  const set = (key: keyof typeof form, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));
  const clearErr = (key: string) => setFieldErrors((p) => { const { [key]: _x, ...r } = p; return r; });

  const selISO = date ? toISODate(date) : "";
  const isTodaySel = !!today && selISO === toISODate(today);
  // Belegte UND (heute) zu knappe Zeiten sind nicht waehlbar. Nur im Browser
  // relevant: ein Tag ist erst nach dem Mounten waehlbar (siehe CalendarSkeleton).
  const now = isTodaySel ? new Date() : null;
  const takenTimes = selISO ? (bookedMap[selISO] ?? []) : [];
  const unavailable = (t: string) => takenTimes.includes(t) || (!!now && isSlotTooLate(t, now));
  const locationLabel = BOOKING_LOCATIONS.find((l) => l.key === location)?.label ?? "";

  const pickDate = (d: Date) => {
    setDate(d);
    clearErr("date");
    const iso = toISODate(d);
    const tooLate = !!today && iso === toISODate(today) && !!time && isSlotTooLate(time, new Date());
    if (time && ((bookedMap[iso] ?? []).includes(time) || tooLate)) setTime("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.website) { setSubmitted(true); return; } // honeypot

    const errs: Record<string, string> = {};
    if (!service) errs.service = "Bitte wählen Sie eine Leistung.";
    if (!location) errs.location = "Bitte wählen Sie einen Standort.";
    if (!date) errs.date = "Bitte wählen Sie ein Datum.";
    if (!time) errs.time = "Bitte wählen Sie eine Uhrzeit.";
    const nameErr = validateName(form.name, "Namen");
    const phoneErr = validatePhone(form.phone, true);
    const emailErr = validateEmail(form.email);
    const consentErr = validateConsent(form.consent);
    if (nameErr) errs.name = nameErr;
    if (phoneErr) errs.phone = phoneErr;
    if (emailErr) errs.email = emailErr;
    if (consentErr) errs.consent_privacy = consentErr;
    if (Object.keys(errs).length > 0) { showErrors(errs); return; }
    setFieldErrors({});

    if (looksLikeBotSubmit(openedAtRef.current)) {
      setError("Bitte versuchen Sie es in ein paar Sekunden noch einmal.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${FN_BASE}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${FN_ANON}` },
        body: JSON.stringify({
          service,
          location,
          date_iso: selISO,
          time,
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          message: form.message.trim() || null,
          consent_privacy: form.consent,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setError("Dieser Termin wurde gerade vergeben. Bitte wählen Sie eine andere Uhrzeit.");
        setTime("");
        fetchBookedMap().then(setBookedMap);
        return;
      }
      if (!res.ok) {
        if (res.status === 422 && data?.fields) { showErrors(data.fields); return; }
        setError(
          res.status === 429 && data?.error
            ? data.error
            : "Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder rufen Sie uns an.",
        );
        return;
      }
      setMailFailed(data?.email_sent === false);
      setSubmitted(true);
    } catch {
      setError("Verbindungsfehler beim Senden. Bitte versuchen Sie es erneut oder rufen Sie uns an.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-[#E5F4F5] bg-white text-[#111111] text-sm placeholder:text-[#5F6B73] focus:outline-none focus:ring-2 focus:ring-[#6FD3D1] focus:border-transparent transition-shadow";
  const labelCls = "block text-sm text-[#5F6B73] font-light mb-1.5";
  const emptyDd = <span className="text-[#5F6B73] font-light">—</span>;

  return (
    <>
      {/* Hero */}
      <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 overflow-hidden bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#BFEAF2] opacity-15 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#0E6E6A] mb-6 uppercase tracking-wider">
            <CalendarDays size={14} /> <Editable as="span" id="termin.hero.badge">Termin vereinbaren</Editable>
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-6" style={jakarta}>
            <Editable as="span" id="termin.hero.title">Ihren Termin</Editable>{" "}
            <span className="text-[#0F7C77]"><Editable as="span" id="termin.hero.title-highlight">online anfragen</Editable></span>
          </h1>
          <p className="text-lg text-[#5F6B73] leading-relaxed max-w-2xl mx-auto font-light">
            <Editable as="span" id="termin.hero.subtitle">Wählen Sie Leistung, Standort, Tag und Uhrzeit. Wir bestätigen Ihren Wunschtermin zeitnah per E-Mail. Unverbindlich und kostenlos.</Editable>
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-white/70">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          {submitted ? (
            <div ref={successRef} tabIndex={-1} className="max-w-xl mx-auto bg-[#F8FEFF] p-8 sm:p-10 rounded-3xl border border-[#E5F4F5] text-center outline-none scroll-mt-28" role="status">
              <CheckCircle size={52} className="text-[#6FD3D1] mx-auto mb-5" strokeWidth={1.5} />
              <h2 className="text-2xl font-medium tracking-tight text-[#111111] mb-3" style={jakarta}>
                <Editable as="span" id="termin.success.title">Anfrage gesendet!</Editable>
              </h2>
              {mailFailed ? (
                <p className="text-[15px] text-[#5F6B73] font-light leading-relaxed mb-2">
                  <Editable as="span" id="termin.success.text-fallback">Ihre Anfrage ist bei uns gespeichert. Damit wir Ihren Termin sicher bestätigen können, rufen Sie uns bitte kurz an:</Editable>{" "}
                  <PhoneText className="text-[#0F7C77] font-medium whitespace-nowrap" />
                </p>
              ) : (
                <p className="text-[15px] text-[#5F6B73] font-light leading-relaxed mb-2">
                  <Editable as="span" id="termin.success.text">Vielen Dank. Wir haben Ihnen eine Bestätigungs-E-Mail geschickt und melden uns zeitnah, um Ihren Termin verbindlich zu bestätigen.</Editable>
                </p>
              )}
              <p className="text-sm text-[#5F6B73] font-light mb-6">
                <Editable as="span" id="termin.success.note">Erst mit unserer Bestätigung ist der Termin fix.</Editable>
              </p>
              <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#0F7C77] hover:text-[#5BC2C0] transition-colors">
                <Editable as="span" id="termin.success.back">Zurück zur Startseite</Editable> <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
              {/* Honeypot */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website}
                onChange={(e) => set("website", e.target.value)}
                className="absolute -left-[9999px] w-px h-px opacity-0" aria-hidden="true" />

              <div className="lg:col-span-2 space-y-6">
                {/* Step 1: Leistung + Standort */}
                <StepCard n={1} title={<Editable as="span" id="termin.step.1.title">Leistung & Standort</Editable>} icon={<Sparkles size={18} strokeWidth={1.8} />}>
                  <div className="flex flex-wrap gap-2.5" role="group" aria-label="Leistung">
                    {BOOKING_SERVICES.map((s) => (
                      <button key={s} type="button" aria-pressed={service === s}
                        onClick={() => { setService(s); clearErr("service"); }}
                        className={pillCls(service === s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <FieldError msg={fieldErrors.service} className="mt-3" />

                  <p className="text-sm text-[#111111] font-normal mt-6 mb-3">
                    <Editable as="span" id="termin.standort.label">Für welchen Standort?</Editable>
                  </p>
                  <div className="flex flex-wrap gap-2.5" role="group" aria-label="Standort">
                    {BOOKING_LOCATIONS.map((l) => (
                      <button key={l.key} type="button" aria-pressed={location === l.key}
                        onClick={() => { setLocation(l.key); clearErr("location"); }}
                        className={pillCls(location === l.key)}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                  <FieldError msg={fieldErrors.location} className="mt-3" />
                </StepCard>

                {/* Step 2: Date */}
                <StepCard n={2} title={<Editable as="span" id="termin.step.2.title">Tag</Editable>} icon={<CalendarDays size={18} strokeWidth={1.8} />}>
                  {today ? <Calendar today={today} selected={date} onSelect={pickDate} /> : <CalendarSkeleton />}
                  <p className="text-xs text-[#5F6B73] font-light mt-4">
                    <Editable as="span" id="termin.tag.hint">Termine Mo–Fr. Wochenenden und vergangene Tage sind nicht wählbar.</Editable>
                  </p>
                  <FieldError msg={fieldErrors.date} className="mt-2" />
                </StepCard>

                {/* Step 3: Time */}
                <StepCard n={3} title={<Editable as="span" id="termin.step.3.title">Uhrzeit</Editable>} icon={<Clock size={18} strokeWidth={1.8} />}>
                  {!date ? (
                    <p className="text-sm text-[#5F6B73] font-light">
                      <Editable as="span" id="termin.uhrzeit.empty">Bitte wählen Sie zuerst einen Tag.</Editable>
                    </p>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5" role="group" aria-label="Uhrzeit">
                        {BOOKING_SLOTS.map((t) => {
                          const taken = unavailable(t);
                          const sel = time === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              disabled={taken}
                              aria-pressed={sel}
                              aria-label={taken ? `${t} Uhr – nicht verfügbar` : `${t} Uhr`}
                              onClick={() => { setTime(t); clearErr("time"); }}
                              className={`py-2.5 rounded-xl text-sm border transition-all ${
                                taken
                                  ? "bg-[#F8FEFF] text-[#C9D2D6] border-[#E5F4F5] line-through cursor-not-allowed"
                                  : sel
                                    ? "bg-[#0F7C77] text-white border-[#6FD3D1] font-medium shadow-[0_4px_14px_rgb(111,211,209,0.3)]"
                                    : "bg-white text-[#111111] border-[#E5F4F5] hover:border-[#BFEAF2]"
                              }`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-[#5F6B73] font-light mt-4">
                        <Editable as="span" id="termin.uhrzeit.hint">Durchgestrichene Zeiten sind bereits vergeben oder zu kurzfristig.</Editable>
                      </p>
                    </>
                  )}
                  <FieldError msg={fieldErrors.time} className="mt-2" />
                </StepCard>

                {/* Step 4: Contact */}
                <StepCard n={4} title={<Editable as="span" id="termin.step.4.title">Ihre Kontaktdaten</Editable>} icon={<MessageSquare size={18} strokeWidth={1.8} />}>
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls} htmlFor="termin-name"><Editable as="span" id="termin.form.label.name">Vollständiger Name *</Editable></label>
                      <input id="termin-name" type="text" autoComplete="name" maxLength={Limits.NAME_MAX} value={form.name}
                        onChange={(e) => { set("name", e.target.value); clearErr("name"); }} className={inputCls} placeholder="Vor- und Nachname"
                        aria-invalid={!!fieldErrors.name} />
                      <FieldError msg={fieldErrors.name} className="mt-1" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls} htmlFor="termin-phone"><Editable as="span" id="termin.form.label.phone">Telefon *</Editable></label>
                        <input id="termin-phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={25} value={form.phone}
                          onChange={(e) => { set("phone", e.target.value); clearErr("phone"); }} className={inputCls} placeholder="z. B. 0151 23456789"
                          aria-invalid={!!fieldErrors.phone} />
                        <FieldError msg={fieldErrors.phone} className="mt-1" />
                      </div>
                      <div>
                        <label className={labelCls} htmlFor="termin-email"><Editable as="span" id="termin.form.label.email">E-Mail *</Editable></label>
                        <input id="termin-email" type="email" autoComplete="email" inputMode="email" maxLength={Limits.EMAIL_MAX} value={form.email}
                          onChange={(e) => { set("email", e.target.value); clearErr("email"); }} className={inputCls} placeholder="name@beispiel.de"
                          aria-invalid={!!fieldErrors.email} />
                        <FieldError msg={fieldErrors.email} className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="termin-message"><Editable as="span" id="termin.form.label.message">Nachricht (optional)</Editable></label>
                      <textarea id="termin-message" rows={3} maxLength={Limits.MESSAGE_MAX} value={form.message}
                        onChange={(e) => set("message", e.target.value)} className={`${inputCls} resize-none`}
                        placeholder="Worum geht es? Gibt es etwas, das wir vorab wissen sollten?" />
                    </div>
                  </div>
                </StepCard>
              </div>

              {/* Summary / submit */}
              <aside className="lg:sticky lg:top-28">
                <div className="cura-reveal cura-reveal-right bg-[#F8FEFF] rounded-3xl border border-[#E5F4F5] p-6 sm:p-7">
                  <h2 className="text-lg font-medium tracking-tight text-[#111111] mb-5" style={jakarta}>
                    <Editable as="span" id="termin.summary.title">Ihre Auswahl</Editable>
                  </h2>
                  <dl className="space-y-3 text-sm mb-6">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-[#5F6B73] font-light shrink-0"><Editable as="span" id="termin.summary.leistung">Leistung</Editable></dt>
                      <dd className="text-[#111111] text-right font-medium">{service || emptyDd}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-[#5F6B73] font-light shrink-0"><Editable as="span" id="termin.summary.standort">Standort</Editable></dt>
                      <dd className="text-[#111111] text-right font-medium">{locationLabel || emptyDd}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-[#5F6B73] font-light shrink-0"><Editable as="span" id="termin.summary.tag">Tag</Editable></dt>
                      <dd className="text-[#111111] text-right font-medium">{date ? formatGermanDate(date) : emptyDd}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-[#5F6B73] font-light shrink-0"><Editable as="span" id="termin.summary.uhrzeit">Uhrzeit</Editable></dt>
                      <dd className="text-[#111111] text-right font-medium">{time ? `${time} Uhr` : emptyDd}</dd>
                    </div>
                  </dl>

                  <label className="flex items-start gap-2.5 mb-4 cursor-pointer">
                    <input type="checkbox" checked={form.consent} onChange={(e) => { set("consent", e.target.checked); clearErr("consent_privacy"); }}
                      className="mt-0.5 w-4 h-4 accent-[#6FD3D1] shrink-0" aria-invalid={!!fieldErrors.consent_privacy} />
                    <span className="text-xs text-[#5F6B73] font-light leading-relaxed">
                      <Editable as="span" id="termin.consent.text">Ich stimme der Verarbeitung meiner Daten gemäß der</Editable>{" "}
                      <Link to="/datenschutz" className="text-[#0F7C77] underline hover:text-[#5BC2C0]"><Editable as="span" id="termin.consent.link">Datenschutzerklärung</Editable></Link> zu. *
                    </span>
                  </label>
                  <FieldError msg={fieldErrors.consent_privacy} className="-mt-2 mb-3" />

                  {error && (
                    <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700" role="alert">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button type="submit" disabled={submitting}
                    className="w-full bg-[#0F7C77] text-white hover:bg-[#0E6E6A] disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3.5 rounded-full text-base font-normal transition-all shadow-[0_8px_20px_rgb(111,211,209,0.25)] flex items-center justify-center gap-2"
                    style={jakarta}>
                    {submitting ? "Wird gesendet…" : <><Editable as="span" id="termin.submit">Termin anfragen</Editable> <ArrowRight size={18} /></>}
                  </button>

                  <p className="text-xs text-[#5F6B73] font-light text-center mt-4">
                    <Editable as="span" id="termin.phone-hint">Unverbindlich. Lieber telefonisch?</Editable>{" "}
                    <PhoneText className="text-[#0F7C77] hover:text-[#5BC2C0] whitespace-nowrap" />
                  </p>
                </div>
              </aside>
            </form>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 lg:py-20 bg-[#F8FEFF]/80">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="cura-reveal cura-reveal-up text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl lg:text-3xl font-medium tracking-tight text-[#111111] mb-3" style={jakarta}>
              <Editable as="span" id="termin.how.title">So einfach geht's</Editable>
            </h2>
            <p className="text-[15px] text-[#5F6B73] font-light">
              <Editable as="span" id="termin.how.intro">In drei Schritten zu Ihrem Termin.</Editable>
            </p>
          </div>
          <div className="cura-reveal cura-reveal-up grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_STEPS.map((s, i) => (
              <div key={i} className="cura-card-glow bg-white rounded-3xl border border-[#E5F4F5] p-7 text-center">
                <div className="w-14 h-14 bg-[#DFF7F8] rounded-2xl flex items-center justify-center text-[#0E6E6A] mx-auto mb-5">{s.icon}</div>
                <h3 className="text-lg font-medium tracking-tight text-[#111111] mb-2" style={jakarta}>
                  <Editable as="span" id={`termin.how.${i}.title`}>{s.title}</Editable>
                </h3>
                <p className="text-sm text-[#5F6B73] font-light leading-relaxed">
                  <Editable as="span" id={`termin.how.${i}.desc`}>{s.desc}</Editable>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
