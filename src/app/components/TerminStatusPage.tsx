import { useSearchParams, Link } from "react-router";
import { CheckCircle, XCircle, AlertTriangle, Info, CalendarDays } from "lucide-react";

const jakarta = { fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif" };

type Variant = "ok" | "warn" | "error";
type Entry = { variant: Variant; title: string; desc: string };

// This page is the landing target for the operator's confirm/decline links
// (the Edge Function 302-redirects here with ?s=…). Messages are operator-facing.
const STATUS: Record<string, Entry> = {
  confirmed: { variant: "ok", title: "Termin bestätigt", desc: "Der Zeit-Slot ist jetzt reserviert und gesperrt. Die anfragende Person wurde automatisch per E-Mail informiert." },
  declined: { variant: "warn", title: "Termin abgelehnt", desc: "Die Anfrage wurde abgelehnt. Die anfragende Person wurde automatisch per E-Mail informiert und kann einen neuen Termin wählen." },
  "already-confirmed": { variant: "warn", title: "Bereits bestätigt", desc: "Dieser Termin wurde zuvor schon bestätigt. Es wurde nichts geändert." },
  "already-declined": { variant: "warn", title: "Bereits abgelehnt", desc: "Diese Anfrage wurde zuvor schon abgelehnt. Es wurde nichts geändert." },
  taken: { variant: "warn", title: "Zeit-Slot inzwischen vergeben", desc: "Für diesen Tag und diese Uhrzeit wurde bereits ein anderer Termin bestätigt. Diese Anfrage wurde nicht bestätigt." },
  notfound: { variant: "error", title: "Anfrage nicht gefunden", desc: "Diese Terminanfrage existiert nicht (mehr). Möglicherweise wurde sie bereits entfernt." },
  invalid: { variant: "error", title: "Ungültiger Link", desc: "Der Link ist ungültig oder unvollständig. Bitte öffnen Sie ihn direkt aus der Benachrichtigungs-E-Mail." },
};

const ICONS: Record<Variant, React.ReactNode> = {
  ok: <CheckCircle size={52} strokeWidth={1.5} className="text-[#6FD3D1]" />,
  warn: <AlertTriangle size={52} strokeWidth={1.5} className="text-[#E0A02F]" />,
  error: <XCircle size={52} strokeWidth={1.5} className="text-[#D9534F]" />,
};

export function TerminStatusPage() {
  const [params] = useSearchParams();
  const s = params.get("s") ?? "";
  const entry: Entry = STATUS[s] ?? {
    variant: "warn",
    title: "Kein Status",
    desc: "Es wurde kein Status übergeben. Diese Seite öffnet sich normalerweise automatisch nach dem Bestätigen oder Ablehnen eines Termins.",
  };

  return (
    <section className="min-h-[60vh] flex items-center py-20 bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
      <div className="max-w-lg mx-auto px-6 w-full">
        <div className="bg-white rounded-3xl border border-[#E5F4F5] shadow-[0_20px_60px_rgb(191,234,242,0.3)] p-8 sm:p-10 text-center">
          <div className="mb-5">{ICONS[entry.variant]}<span className="sr-only">{entry.variant}</span></div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#0E6E6A] mb-5 uppercase tracking-wider">
            <CalendarDays size={14} /> Terminstatus
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-[#111111] mb-3" style={jakarta}>{entry.title}</h1>
          <p className="text-[15px] text-[#5F6B73] font-light leading-relaxed mb-8">{entry.desc}</p>
          <div className="flex items-center justify-center gap-2 text-xs text-[#5F6B73] font-light">
            <Info size={14} /> Cura Doma — Terminverwaltung
          </div>
          <Link to="/" className="inline-flex items-center justify-center mt-6 text-sm font-medium text-[#0F7C77] hover:text-[#5BC2C0] transition-colors">
            Zur Startseite
          </Link>
        </div>
      </div>
    </section>
  );
}
