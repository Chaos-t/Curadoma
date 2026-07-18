import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { FN_BASE, FN_ANON } from "./booking";

type Pending = Record<string, { v: string; rich: boolean }>;
type Ctx = {
  get: (id: string) => string | undefined;
  /** Committed value only (ignores unsaved pending) — used to seed edit mode
   *  so un-sanitized pending HTML can never seed a dangerouslySetInnerHTML. */
  getStored: (id: string) => string | undefined;
  editMode: boolean;
  dirtyCount: number;
  /** True, wenn dieses Feld ungespeicherte Änderungen hat (für den Dirty-Marker). */
  isDirty: (id: string) => boolean;
  saving: boolean;
  status: string | null;
  error: string | null;
  setPending: (id: string, v: string, rich: boolean) => void;
  uploadImage: (id: string, file: File) => Promise<void>;
  save: () => Promise<void>;
  discard: () => void;
  exit: () => void;
  restore: () => Promise<void>;
  enterEditMode: (pw: string) => void;
};
const ContentContext = createContext<Ctx | null>(null);
export function useContent(): Ctx {
  const c = useContext(ContentContext);
  if (!c) throw new Error("useContent must be used within <ContentProvider>");
  return c;
}
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
}
export function ContentProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [pending, setPendingState] = useState<Pending>({});
  // Editier-Status NUR im Speicher (kein sessionStorage): der Bearbeitungsmodus
  // geht ausschliesslich ueber das Admin-Dashboard („Seite bearbeiten", nach
  // Passwort-Login im AdminProvider) an und ist nach jedem Reload/neuen Besuch
  // wieder aus. So kann niemand ohne Login editieren — auch nicht per manuell
  // gesetztem Flag in den DevTools.
  const [editMode, setEditMode] = useState<boolean>(false);
  const pwRef = useRef<string>("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`${FN_BASE}/site-content`, { headers: { Authorization: `Bearer ${FN_ANON}` } })
      .then((r) => (r.ok ? r.json() : { content: {} }))
      .then((d) => { if (alive) setOverrides((d && d.content) || {}); })
      .catch(() => {}); // Supabase weg -> Defaults aus dem Code greifen
    return () => { alive = false; };
  }, []);

  const get = useCallback((id: string) => {
    if (id in pending) return pending[id].v;
    if (id in overrides) return overrides[id];
    return undefined;
  }, [pending, overrides]);

  const getStored = useCallback((id: string) => (id in overrides ? overrides[id] : undefined), [overrides]);

  const setPending = useCallback((id: string, v: string, rich: boolean) => {
    setPendingState((p) => ({ ...p, [id]: { v, rich } }));
  }, []);

  const pw = () => pwRef.current;

  const uploadImage = useCallback(async (id: string, file: File) => {
    // Client-seitiger Größen-Check (spiegelt das Server-Limit MAX_IMG_BYTES = 3 MB):
    // sofortige, verständliche Meldung statt Warten auf den Upload + Server-Fehler.
    if (file.size > 3 * 1024 * 1024) {
      setError("Bild ist zu groß (max. 3 MB). Bitte ein kleineres Bild wählen.");
      return;
    }
    setStatus("Bild wird hochgeladen …"); setError(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await fetch(`${FN_BASE}/site-content/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${FN_ANON}` },
        body: JSON.stringify({ password: pw(), id, dataBase64: dataUrl, mimetype: file.type }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.url) { setError("Bild-Upload fehlgeschlagen (" + (d.error || res.status) + ")."); return; }
      setPending(id, d.url, false);
      setStatus("Bild ersetzt — nicht vergessen zu speichern.");
    } catch { setError("Bild-Upload: Verbindungsfehler."); }
  }, [setPending]);

  const save = useCallback(async () => {
    const ids = Object.keys(pending);
    if (!ids.length) return;
    setSaving(true); setError(null); setStatus("Speichern …");
    try {
      const overridesOut: Record<string, string> = {};
      const rich: string[] = [];
      for (const id of ids) { overridesOut[id] = pending[id].v; if (pending[id].rich) rich.push(id); }
      const res = await fetch(`${FN_BASE}/site-content/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${FN_ANON}` },
        body: JSON.stringify({ password: pw(), action: "save", overrides: overridesOut, rich }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError("Speichern fehlgeschlagen (" + (d.error || res.status) + ")."); return; }
      setOverrides((o) => ({ ...o, ...overridesOut }));
      setPendingState({});
      setStatus("Gespeichert ✓ — in 1–2 Min überall live.");
    } catch { setError("Speichern: Verbindungsfehler."); } finally { setSaving(false); }
  }, [pending]);

  const discard = useCallback(() => { setPendingState({}); setStatus("Änderungen verworfen."); setError(null); }, []);
  const exit = useCallback(() => {
    pwRef.current = "";
    setEditMode(false); setPendingState({}); setStatus(null); setError(null);
  }, []);
  const restore = useCallback(async () => {
    setSaving(true); setError(null); setStatus("Setze zurück …");
    try {
      const res = await fetch(`${FN_BASE}/site-content/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${FN_ANON}` },
        body: JSON.stringify({ password: pw(), action: "restore" }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError("Rückgängig fehlgeschlagen (" + (d.error || res.status) + ")."); return; }
      const r2 = await fetch(`${FN_BASE}/site-content`, { headers: { Authorization: `Bearer ${FN_ANON}` } });
      const c2 = await r2.json().catch(() => ({ content: {} }));
      setOverrides((c2 && c2.content) || {});
      setStatus("Letzter Stand wiederhergestellt.");
    } catch { setError("Rückgängig: Verbindungsfehler."); } finally { setSaving(false); }
  }, []);
  const enterEditMode = useCallback((p: string) => {
    // Wird vom Admin-Dashboard („Seite bearbeiten") mit dem im AdminProvider
    // gehaltenen Passwort aufgerufen. Passwort bleibt nur im Speicher der Sitzung.
    pwRef.current = p;
    setEditMode(true);
  }, []);

  const isDirty = useCallback((id: string) => id in pending, [pending]);

  // Schutz vor Datenverlust: Browser-Warnung beim Verlassen/Neuladen, solange es
  // ungespeicherte Änderungen gibt (nur im Bearbeitungsmodus).
  useEffect(() => {
    if (!editMode || Object.keys(pending).length === 0) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [editMode, pending]);

  // Strg+S / Cmd+S speichert (statt den Browser-Speichern-Dialog zu öffnen).
  useEffect(() => {
    if (!editMode) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        if (Object.keys(pending).length > 0) void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editMode, pending, save]);

  // Statusmeldungen (z. B. „Gespeichert ✓") nach ein paar Sekunden ausblenden,
  // damit sie nicht dauerhaft stehen bleiben. Fehler (`error`) bleiben bestehen.
  useEffect(() => {
    if (!status) return;
    const t = window.setTimeout(() => setStatus(null), 4000);
    return () => window.clearTimeout(t);
  }, [status]);

  const value: Ctx = {
    get, getStored, editMode, dirtyCount: Object.keys(pending).length, isDirty, saving, status, error,
    setPending, uploadImage, save, discard, exit, restore, enterEditMode,
  };
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}
