import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  CalendarDays, Clock, ChevronLeft, ChevronRight, CheckCircle, Phone,
  ArrowRight, AlertCircle, MessageSquare, Sparkles,
} from "lucide-react";
import {
  BOOKING_SERVICES, BOOKING_SLOTS, FN_BASE, FN_ANON,
  toISODate, isWeekend, startOfToday, formatGermanDate, fetchBookedMap,
} from "../../lib/booking";
import {
  validateName, validateEmail, validatePhone, validateConsent, looksLikeBotSubmit, Limits,
} from "../../lib/validation";

const jakarta = { fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif" };

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function Calendar({ selected, onSelect }: { selected: Date | null; onSelect: (d: Date) => void }) {
  const today = startOfToday();
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
        <div className="text-sm font-medium text-[#111111] capitalize" style={jakarta}>{monthLabel}</div>
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
          const disabled = isWeekend(d) || d < today;
          const isSel = !!selected && toISODate(d) === toISODate(selected);
          const isToday = toISODate(d) === toISODate(today);
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
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

function StepCard({ n, title, icon, children }: { n: number; title: string; icon: React.ReactNode; children: React.ReactNode }) {
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

export function TerminPage() {
  const [service, setService] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "", consent: false, website: "" });
  const [bookedMap, setBookedMap] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const openedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    fetchBookedMap().then(setBookedMap);
  }, []);

  const set = (key: keyof typeof form, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const selISO = date ? toISODate(date) : "";
  const takenTimes = selISO ? (bookedMap[selISO] ?? []) : [];

  const pickDate = (d: Date) => {
    setDate(d);
    const iso = toISODate(d);
    if (time && (bookedMap[iso] ?? []).includes(time)) setTime("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.website) { setSubmitted(true); return; } // honeypot

    const errs: Record<string, string> = {};
    if (!service) errs.service = "Bitte wählen Sie eine Leistung.";
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
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
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
        if (data?.fields) setFieldErrors(data.fields);
        setError(data?.error ?? "Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder rufen Sie uns an.");
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setError(`Verbindungsfehler beim Senden. Bitte versuchen Sie es erneut oder rufen Sie uns an. (${err})`);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-[#E5F4F5] bg-white text-[#111111] text-sm placeholder:text-[#5F6B73] focus:outline-none focus:ring-2 focus:ring-[#6FD3D1] focus:border-transparent transition-shadow";

  return (
    <>
      {/* Hero */}
      <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 overflow-hidden bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#BFEAF2] opacity-15 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#0E6E6A] mb-6 uppercase tracking-wider">
            <CalendarDays size={14} /> Termin vereinbaren
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-6" style={jakarta}>
            Ihren Termin <span className="text-[#0F7C77]">online anfragen</span>
          </h1>
          <p className="text-lg text-[#5F6B73] leading-relaxed max-w-2xl mx-auto font-light">
            Wählen Sie Leistung, Tag und Uhrzeit. Wir bestätigen Ihren Wunschtermin zeitnah per E-Mail. Unverbindlich und kostenlos.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-white/70">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          {submitted ? (
            <div className="cura-reveal cura-reveal-up max-w-xl mx-auto bg-[#F8FEFF] p-8 sm:p-10 rounded-3xl border border-[#E5F4F5] text-center">
              <CheckCircle size={52} className="text-[#6FD3D1] mx-auto mb-5" strokeWidth={1.5} />
              <h2 className="text-2xl font-medium tracking-tight text-[#111111] mb-3" style={jakarta}>Anfrage gesendet!</h2>
              <p className="text-[15px] text-[#5F6B73] font-light leading-relaxed mb-2">
                Vielen Dank. Wir haben Ihnen eine Bestätigungs-E-Mail geschickt und melden uns zeitnah, um Ihren Termin verbindlich zu bestätigen.
              </p>
              <p className="text-sm text-[#5F6B73] font-light mb-6">Erst mit unserer Bestätigung ist der Termin fix.</p>
              <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#0F7C77] hover:text-[#5BC2C0] transition-colors">
                Zurück zur Startseite <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
              {/* Honeypot */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website}
                onChange={(e) => set("website", e.target.value)}
                className="absolute -left-[9999px] w-px h-px opacity-0" aria-hidden="true" />

              <div className="lg:col-span-2 space-y-6">
                {/* Step 1: Service */}
                <StepCard n={1} title="Leistung" icon={<Sparkles size={18} strokeWidth={1.8} />}>
                  <div className="flex flex-wrap gap-2.5">
                    {BOOKING_SERVICES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { setService(s); setFieldErrors((p) => { const { service: _s, ...r } = p; return r; }); }}
                        className={`px-4 py-2.5 rounded-full text-sm font-light border transition-all ${
                          service === s
                            ? "bg-[#0F7C77] text-white border-[#6FD3D1] shadow-[0_4px_14px_rgb(111,211,209,0.3)]"
                            : "bg-white text-[#5F6B73] border-[#E5F4F5] hover:border-[#BFEAF2] hover:text-[#111111]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {fieldErrors.service && <p className="text-xs text-red-500 mt-3">{fieldErrors.service}</p>}
                </StepCard>

                {/* Step 2: Date */}
                <StepCard n={2} title="Tag" icon={<CalendarDays size={18} strokeWidth={1.8} />}>
                  <Calendar selected={date} onSelect={pickDate} />
                  <p className="text-xs text-[#5F6B73] font-light mt-4">Termine Mo–Fr. Wochenenden und vergangene Tage sind nicht wählbar.</p>
                  {fieldErrors.date && <p className="text-xs text-red-500 mt-2">{fieldErrors.date}</p>}
                </StepCard>

                {/* Step 3: Time */}
                <StepCard n={3} title="Uhrzeit" icon={<Clock size={18} strokeWidth={1.8} />}>
                  {!date ? (
                    <p className="text-sm text-[#5F6B73] font-light">Bitte wählen Sie zuerst einen Tag.</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                        {BOOKING_SLOTS.map((t) => {
                          const taken = takenTimes.includes(t);
                          const sel = time === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              disabled={taken}
                              onClick={() => { setTime(t); setFieldErrors((p) => { const { time: _t, ...r } = p; return r; }); }}
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
                      <p className="text-xs text-[#5F6B73] font-light mt-4">Durchgestrichene Zeiten sind bereits vergeben.</p>
                    </>
                  )}
                  {fieldErrors.time && <p className="text-xs text-red-500 mt-2">{fieldErrors.time}</p>}
                </StepCard>

                {/* Step 4: Contact */}
                <StepCard n={4} title="Ihre Kontaktdaten" icon={<MessageSquare size={18} strokeWidth={1.8} />}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-[#5F6B73] font-light mb-1.5">Vollständiger Name *</label>
                      <input type="text" autoComplete="name" maxLength={Limits.NAME_MAX} value={form.name}
                        onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder="Vor- und Nachname" />
                      {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[#5F6B73] font-light mb-1.5">Telefon *</label>
                        <input type="tel" autoComplete="tel" inputMode="tel" maxLength={25} value={form.phone}
                          onChange={(e) => set("phone", e.target.value)} className={inputCls} placeholder="05151 7107093" />
                        {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>}
                      </div>
                      <div>
                        <label className="block text-sm text-[#5F6B73] font-light mb-1.5">E-Mail *</label>
                        <input type="email" autoComplete="email" inputMode="email" maxLength={Limits.EMAIL_MAX} value={form.email}
                          onChange={(e) => set("email", e.target.value)} className={inputCls} placeholder="name@beispiel.de" />
                        {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-[#5F6B73] font-light mb-1.5">Nachricht (optional)</label>
                      <textarea rows={3} maxLength={Limits.MESSAGE_MAX} value={form.message}
                        onChange={(e) => set("message", e.target.value)} className={`${inputCls} resize-none`}
                        placeholder="Worum geht es? Gibt es etwas, das wir vorab wissen sollten?" />
                    </div>
                  </div>
                </StepCard>
              </div>

              {/* Summary / submit */}
              <aside className="lg:sticky lg:top-28">
                <div className="cura-reveal cura-reveal-right bg-[#F8FEFF] rounded-3xl border border-[#E5F4F5] p-6 sm:p-7">
                  <h2 className="text-lg font-medium tracking-tight text-[#111111] mb-5" style={jakarta}>Ihre Auswahl</h2>
                  <dl className="space-y-3 text-sm mb-6">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-[#5F6B73] font-light shrink-0">Leistung</dt>
                      <dd className="text-[#111111] text-right font-medium">{service || <span className="text-[#5F6B73] font-light">—</span>}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-[#5F6B73] font-light shrink-0">Tag</dt>
                      <dd className="text-[#111111] text-right font-medium">{date ? formatGermanDate(date) : <span className="text-[#5F6B73] font-light">—</span>}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-[#5F6B73] font-light shrink-0">Uhrzeit</dt>
                      <dd className="text-[#111111] text-right font-medium">{time ? `${time} Uhr` : <span className="text-[#5F6B73] font-light">—</span>}</dd>
                    </div>
                  </dl>

                  <label className="flex items-start gap-2.5 mb-4 cursor-pointer">
                    <input type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#6FD3D1] shrink-0" />
                    <span className="text-xs text-[#5F6B73] font-light leading-relaxed">
                      Ich stimme der Verarbeitung meiner Daten gemäß der{" "}
                      <Link to="/datenschutz" className="text-[#0F7C77] underline hover:text-[#5BC2C0]">Datenschutzerklärung</Link> zu. *
                    </span>
                  </label>
                  {fieldErrors.consent_privacy && <p className="text-xs text-red-500 -mt-2 mb-3">{fieldErrors.consent_privacy}</p>}

                  {error && (
                    <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button type="submit" disabled={submitting}
                    className="w-full bg-[#0F7C77] text-white hover:bg-[#0E6E6A] disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3.5 rounded-full text-base font-normal transition-all shadow-[0_8px_20px_rgb(111,211,209,0.25)] flex items-center justify-center gap-2"
                    style={jakarta}>
                    {submitting ? "Wird gesendet…" : <>Termin anfragen <ArrowRight size={18} /></>}
                  </button>

                  <p className="text-xs text-[#5F6B73] font-light text-center mt-4">
                    Unverbindlich. Lieber telefonisch?{" "}
                    <a href="tel:+4951517107093" className="text-[#0F7C77] hover:text-[#5BC2C0] whitespace-nowrap">05151 7107093</a>
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
            <h2 className="text-2xl lg:text-3xl font-medium tracking-tight text-[#111111] mb-3" style={jakarta}>So einfach geht's</h2>
            <p className="text-[15px] text-[#5F6B73] font-light">In drei Schritten zu Ihrem Termin.</p>
          </div>
          <div className="cura-reveal cura-reveal-up grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <CalendarDays size={26} strokeWidth={1.5} />, title: "1 · Anfragen", desc: "Leistung, Tag und Uhrzeit wählen und das kurze Formular absenden." },
              { icon: <CheckCircle size={26} strokeWidth={1.5} />, title: "2 · Wir bestätigen", desc: "Wir prüfen Ihren Wunschtermin und bestätigen ihn zeitnah per E-Mail." },
              { icon: <Phone size={26} strokeWidth={1.5} />, title: "3 · Wir sind für Sie da", desc: "Zum bestätigten Termin melden wir uns – telefonisch oder bei Ihnen vor Ort." },
            ].map((s, i) => (
              <div key={i} className="cura-card-glow bg-white rounded-3xl border border-[#E5F4F5] p-7 text-center">
                <div className="w-14 h-14 bg-[#DFF7F8] rounded-2xl flex items-center justify-center text-[#0E6E6A] mx-auto mb-5">{s.icon}</div>
                <h3 className="text-lg font-medium tracking-tight text-[#111111] mb-2" style={jakarta}>{s.title}</h3>
                <p className="text-sm text-[#5F6B73] font-light leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
