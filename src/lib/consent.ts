// Centralised cookie-consent state. Persisted in localStorage.
//
// Two categories:
//   essential  — always true. Site can't function without these (form
//                submissions to the Supabase Edge Function — though it
//                doesn't actually set browser cookies, the Authorization
//                header carries the public anon key).
//   external   — Google Maps embeds (sets Google cookies), Google Fonts
//                (transmits IP to Google's CDN), Instagram CDN images.
//                Off by default; user can enable via banner.
//
// We expose a tiny pub-sub so that components reading the consent (e.g.
// the EinzugsgebietSection's Google Maps iframe) re-render when the
// user changes the choice without a page reload.

export type ConsentState = {
  essential: true;
  external: boolean;
  /** ISO timestamp of when the user made the choice */
  decidedAt: string;
};

const STORAGE_KEY = "curaConsent.v1";

function read(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (typeof parsed.external !== "boolean" || typeof parsed.decidedAt !== "string") {
      return null;
    }
    return { ...parsed, essential: true };
  } catch {
    return null;
  }
}

function write(state: ConsentState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage might be unavailable (private mode, full disk). Don't crash.
  }
}

type Listener = (state: ConsentState | null) => void;
const listeners = new Set<Listener>();

function notify() {
  const state = read();
  listeners.forEach((l) => l(state));
}

export const consent = {
  get(): ConsentState | null {
    return read();
  },
  hasDecided(): boolean {
    return read() !== null;
  },
  externalAllowed(): boolean {
    return read()?.external === true;
  },
  acceptAll() {
    write({ essential: true, external: true, decidedAt: new Date().toISOString() });
    notify();
  },
  rejectNonEssential() {
    write({ essential: true, external: false, decidedAt: new Date().toISOString() });
    notify();
  },
  reset() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    notify();
  },
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

// Custom event so other tabs / a Datenschutz-page button can prompt
// the banner to re-open ("Cookie-Einstellungen ändern").
export const REOPEN_BANNER_EVENT = "curadoma-reopen-cookie-banner";

export function requestReopenBanner() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(REOPEN_BANNER_EVENT));
}
