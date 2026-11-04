import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams, Link } from "react-router";
import { CalendarDays, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { FN_BASE, FN_ANON, apptIcsUrl, apptGcalUrl } from "../../lib/booking";

const jakarta = { fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif" };

// Zwischenseite fuer die Buttons "Bestaetigen"/"Ablehnen" aus der Betreiber-Mail
// (Vorbild de Vries). Die Mail-Links (GET) aendern nichts, damit Mail-Scanner, die
// Links automatisch oeffnen, keinen Termin versehentlich bestaetigen. Erst der Knopf
// hier schickt die Aktion per POST an die Edge Function; die leitet danach auf
// /termin-status weiter (bei "bestaetigt" mit Kalender-Knopf). Wird nicht vorab
// gerendert (kein Eintrag in seo.data.js) — liest die URL deshalb gefahrlos direkt.

type ApptInfo = {
  status: string;
  id?: string;
  service?: string;
  location?: string | null;
  date_de?: string;
  time?: string;
  name?: string;
};

const TOKEN_RE = /^[0-9a-f-]{36}$/i;

function Card({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="min-h-[60vh] flex items-center py-20 bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
      <div className="max-w-lg mx-auto px-6 w-full">
        <div className="bg-white rounded-3xl border border-[#E5F4F5] shadow-[0_20px_60px_rgb(191,234,242,0.3)] p-8 sm:p-10 text-center">
          <div className="mb-5 flex justify-center">{icon}</div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#0E6E6A] mb-5 uppercase tracking-wider">
            <CalendarDays size={14} /> Terminverwaltung
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-[#111111] mb-3" style={jakarta}>{title}</h1>
          {children}
          <div className="flex items-center justify-center gap-2 text-xs text-[#5F6B73] font-light mt-8">
            <Info size={14} /> Cura Doma — Terminverwaltung
          </div>
        </div>
      </div>
    </section>
  );
}

const iconOk = <CheckCircle size={52} strokeWidth={1.5} className="text-[#6FD3D1]" />;
const iconWarn = <AlertTriangle size={52} strokeWidth={1.5} className="text-[#E0A02F]" />;
const iconErr = <XCircle size={52} strokeWidth={1.5} className="text-[#D9534F]" />;
const pText = "text-[15px] text-[#5F6B73] font-light leading-relaxed";
const btnPrimary = "w-full inline-flex items-center justify-center gap-2 bg-[#0F7C77] text-white hover:bg-[#0E6E6A] px-6 py-3.5 rounded-full text-base font-normal transition-colors";
const btnSecondary = "w-full inline-flex items-center justify-center gap-2 bg-white text-[#5F6B73] border border-[#E5F4F5] hover:text-[#111111] hover:border-[#BFEAF2] px-6 py-3 rounded-full text-sm font-normal transition-colors";

export function CalendarButton({ id }: { id: string }) {
  return (
    <div className="mt-6 space-y-3">
      <a href={apptIcsUrl(id, true)} className={btnPrimary}>
        <CalendarDays size={18} strokeWidth={1.5} /> In Kalender eintragen
      </a>
      <a href={apptGcalUrl(id, true)} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
        In Google Kalender eintragen
      </a>
      <p className="text-xs text-[#5F6B73]">Erster Knopf: iPhone, Outlook oder Mac. Zweiter Knopf: Google-Kalender.</p>
    </div>
  );
}

export function TerminBestaetigenPage() {
  const [params] = useSearchParams();
  const token = (params.get("token") ?? "").trim();
  const action: "confirm" | "decline" = params.get("action") === "decline" ? "decline" : "confirm";
  const valid = TOKEN_RE.test(token);
  const [info, setInfo] = useState<ApptInfo | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const sending = useRef(false);

  useEffect(() => {
    if (!valid) return;
    fetch(`${FN_BASE}/appointment-info?token=${encodeURIComponent(token)}`, {
      headers: { Authorization: `Bearer ${FN_ANON}` },
    })
      .then(async (r) => {
        const d = (await r.json().catch(() => null)) as ApptInfo | null;
        // Nur bekannte Antworten uebernehmen. Server-/Netzfehler sind KEIN "nicht
        // gefunden": dann das Formular trotzdem zeigen, der Server prueft erneut.
        if (d && ["pending", "confirmed", "declined", "notfound"].includes(d.status)) setInfo(d);
        else setLoadFailed(true);
      })
      .catch(() => setLoadFailed(true));
  }, [token, valid]);

  // "Zurueck" nach dem Absenden (iPhone-Wischgeste): der Browser zeigt die Seite aus
  // dem Zwischenspeicher mit veraltetem Stand -> neu laden, dann steht dort
  // "Bereits bestaetigt" samt Kalender-Knoepfen.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) window.location.reload(); };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  if (!valid) {
    return (
      <Card icon={iconErr} title="Ungültiger Link">
        <p className={pText}>Der Link ist ungültig oder unvollständig. Bitte öffnen Sie ihn direkt aus der Benachrichtigungs-E-Mail.</p>
      </Card>
    );
  }
  if (!info && !loadFailed) {
    return (
      <Card icon={<CalendarDays size={52} strokeWidth={1.5} className="text-[#6FD3D1]" />} title="Einen Moment …">
        <p className={pText}>Die Terminanfrage wird geladen.</p>
      </Card>
    );
  }
  if (info?.status === "confirmed") {
    return (
      <Card icon={iconOk} title="Bereits bestätigt">
        <p className={pText}>Dieser Termin ist bestätigt. Sie können ihn hier in Ihren Kalender eintragen.</p>
        {info.id && TOKEN_RE.test(info.id) && <CalendarButton id={info.id} />}
      </Card>
    );
  }
  if (info?.status === "declined") {
    return (
      <Card icon={iconWarn} title="Bereits abgelehnt">
        <p className={pText}>Diese Anfrage wurde schon abgelehnt. Es wurde nichts geändert.</p>
      </Card>
    );
  }
  if (info?.status === "notfound") {
    return (
      <Card icon={iconErr} title="Anfrage nicht gefunden">
        <p className={pText}>Diese Terminanfrage existiert nicht (mehr). Möglicherweise wurde sie bereits entfernt.</p>
      </Card>
    );
  }

  const confirm = action === "confirm";
  const rows: Array<[string, string | null | undefined]> = info
    ? [
        ["Leistung", info.service],
        ["Standort", info.location],
        ["Datum", info.date_de],
        ["Uhrzeit", info.time ? `${info.time} Uhr` : null],
        ["Name", info.name],
      ]
    : [];

  return (
    <Card icon={confirm ? iconOk : iconWarn} title={confirm ? "Termin bestätigen?" : "Termin ablehnen?"}>
      <p className={pText}>
        {confirm
          ? "Der Zeit-Slot wird dann auf der Website gesperrt, und die anfragende Person erhält eine Bestätigung mit Kalender-Eintrag."
          : "Die anfragende Person wird per E-Mail informiert; der Zeit-Slot bleibt frei."}
      </p>
      {loadFailed && (
        <p className="text-xs text-[#5F6B73] mt-3">Die Details konnten gerade nicht geladen werden – sie stehen in Ihrer E-Mail.</p>
      )}
      {rows.some(([, v]) => v) && (
        <dl className="mt-6 text-sm text-left bg-[#F8FEFF] border border-[#E5F4F5] rounded-2xl p-4 space-y-2">
          {rows.filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-[#5F6B73] font-light">{k}</dt>
              <dd className="text-[#111111] font-medium text-right">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <form
        method="POST"
        action={`${FN_BASE}/appointment-action`}
        className="mt-6 space-y-3"
        onSubmit={(e) => {
          if (sending.current) e.preventDefault(); // Doppelklick: nur einmal absenden
          sending.current = true;
        }}
      >
        <input type="hidden" name="token" value={token} />
        {/* Zwei Absende-Knoepfe mit name="action": geschickt wird der angeklickte. */}
        <button type="submit" name="action" value={action} className={btnPrimary} style={jakarta}>
          {confirm ? "Ja, Termin bestätigen" : "Ja, Termin ablehnen"}
        </button>
        <button type="submit" name="action" value={confirm ? "decline" : "confirm"} className={btnSecondary}>
          {confirm ? "Stattdessen ablehnen" : "Stattdessen bestätigen"}
        </button>
      </form>
      <p className="text-xs text-[#5F6B73] mt-4">
        Zur Sicherheit lösen Sie die Aktion hier per Klick aus – automatische E-Mail-Scanner können so nichts auslösen.
      </p>
      <Link to="/" className="inline-flex items-center justify-center mt-4 text-sm font-medium text-[#0F7C77] hover:text-[#5BC2C0] transition-colors">
        Abbrechen
      </Link>
    </Card>
  );
}
