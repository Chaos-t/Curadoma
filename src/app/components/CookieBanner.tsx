// First-visit cookie banner. Sits in a fixed bottom-position card,
// fades in once we know there's no existing consent record. Two buttons:
//   - "Alle akzeptieren"   → enables external embeds (Google Maps, IG)
//   - "Nur essenzielle"    → blocks them; the Maps card on Einzugsgebiet
//                            shows a placeholder until consent changes
//
// The banner also re-opens itself on a custom event so a future
// "Cookie-Einstellungen ändern"-link in the footer or Datenschutz page
// can prompt the user without a full page reload.

import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Cookie, X } from "lucide-react";
import { consent, REOPEN_BANNER_EVENT } from "../../lib/consent";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export function CookieBanner() {
  // `null` while we don't know yet (avoids a flash of banner during SSR /
  // pre-mount hydration). Resolves on mount to true/false.
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    setOpen(!consent.hasDecided());
    const onReopen = () => setOpen(true);
    window.addEventListener(REOPEN_BANNER_EVENT, onReopen);
    return () => window.removeEventListener(REOPEN_BANNER_EVENT, onReopen);
  }, []);

  if (open !== true) return null;

  const accept = () => {
    consent.acceptAll();
    setOpen(false);
  };
  const reject = () => {
    consent.rejectNonEssential();
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-5"
      role="dialog"
      aria-labelledby="cura-cookie-title"
      aria-describedby="cura-cookie-desc"
    >
      <div className="mx-auto max-w-3xl bg-white border border-[#E5F4F5] rounded-2xl shadow-[0_20px_50px_rgb(0,0,0,0.12)] p-5 sm:p-6 motion-safe:animate-[curaCookieIn_360ms_cubic-bezier(0.22,1,0.36,1)_both]">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#DFF7F8] text-[#6FD3D1] flex items-center justify-center shrink-0">
            <Cookie size={22} strokeWidth={1.7} />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="cura-cookie-title"
              className="text-base font-medium text-[#111111] mb-1.5"
              style={jakarta}
            >
              Wir respektieren Ihre Privatsphäre
            </h2>
            <p
              id="cura-cookie-desc"
              className="text-[13px] sm:text-sm text-[#5F6B73] font-light leading-relaxed mb-4"
            >
              Diese Website benötigt nur technisch erforderliche Daten, um zu
              funktionieren. Mit Ihrer Zustimmung laden wir zusätzlich
              eingebettete Inhalte von Google Maps und Instagram, um Ihnen
              unseren Standort und aktuelle Beiträge direkt zu zeigen. Mehr
              Details in unserer{" "}
              <Link
                to="/datenschutz"
                className="text-[#6FD3D1] underline hover:text-[#5BC2C0]"
              >
                Datenschutzerklärung
              </Link>
              .
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={accept}
                className="order-1 sm:order-2 flex-1 sm:flex-none bg-[#6FD3D1] hover:bg-[#5BC2C0] text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors shadow-[0_8px_20px_rgb(111,211,209,0.25)]"
                style={jakarta}
              >
                Alle akzeptieren
              </button>
              <button
                type="button"
                onClick={reject}
                className="order-2 sm:order-1 flex-1 sm:flex-none bg-white hover:bg-[#F8FEFF] text-[#5F6B73] hover:text-[#111111] border border-[#E5F4F5] text-sm font-medium px-6 py-2.5 rounded-full transition-colors"
                style={jakarta}
              >
                Nur essenzielle
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={reject}
            aria-label="Banner schließen (essenzielle Cookies erlauben)"
            className="shrink-0 -mr-1 -mt-1 p-1.5 text-[#9AA3A8] hover:text-[#5F6B73] hover:bg-[#F8FEFF] rounded-full transition-colors"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>
      <style>{`
        @keyframes curaCookieIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
