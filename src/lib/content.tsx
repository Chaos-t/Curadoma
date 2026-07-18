import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { FN_BASE, FN_ANON } from "./booking";

type Pending = Record<string, { v: string; rich: boolean }>;
export type Block = { k: string; t: string; href?: string };
type Ctx = {
  get: (id: string) => string | undefined;
  /** Committed value only (ignores unsaved pending) — used to seed edit mode
   *  so un-sanitized pending HTML can never seed a dangerouslySetInnerHTML. */
  getStored: (id: string) => string | undefined;
  editMode: boolean;
  dirtyCount: number;
  /** True, wenn dieses Feld ungespeicherte Änderungen hat (für den Dirty-Marker). */
  isDirty: (id: string) => boolean;
  /** Editable meldet beim Mounten seinen Ausgangswert (für Undo-Rücksetzung). */
  registerField: (id: string, initial: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
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
  getZone: (zoneId: string, defaultKeys: string[]) => string[];
  addZoneItem: (zoneId: string, defaultKeys: string[]) => void;
  removeZoneItem: (zoneId: string, key: string, defaultKeys: string[]) => void;
  moveZoneItem: (zoneId: string, key: string, dir: -1 | 1, defaultKeys: string[]) => void;
  /** Dynamisch angelegte Seiten (für Menü-Injektion + DynamicPage-Auflösung). */
  getPages: () => Array<{ slug: string; label: string; inMenu: boolean }>;
  /** Typisierte Inhalts-Blöcke (Text/Button/Bild) je Bereich. */
  getBlocks: (areaId: string) => Block[];
  addBlock: (areaId: string, type: "text" | "button" | "image") => void;
  removeBlock: (areaId: string, key: string) => void;
  moveBlock: (areaId: string, key: string, dir: -1 | 1) => void;
  setBlockHref: (areaId: string, key: string, href: string) => void;
  /** Struktur (Seiten/Zonen/Blöcke) neu vom Server laden — z. B. nach dem Anlegen einer Seite. */
  reloadStructure: () => Promise<void>;
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
// Zwei Pending-Schnappschüsse inhaltlich vergleichen (für die Undo-Historie).
function samePending(a: Pending, b: Pending): boolean {
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (!(k in b) || a[k].v !== b[k].v || a[k].rich !== b[k].rich) return false;
  }
  return true;
}
export function ContentProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [pending, setPendingState] = useState<Pending>({});
  // Block-Zonen: Bestand/Reihenfolge je Zone (aus dem Server) + ungespeicherte Änderungen.
  const [zones, setZones] = useState<Record<string, string[]>>({});
  const [pendingZones, setPendingZones] = useState<Record<string, string[]>>({});
  // Dynamisch angelegte Seiten (aus dem Server) — für Menü + DynamicPage.
  const [pages, setPages] = useState<Array<{ slug: string; label: string; inMenu: boolean }>>([]);
  // Typisierte Inhalts-Blöcke je Bereich (aus dem Server) + ungespeicherte Änderungen.
  const [blocks, setBlocks] = useState<Record<string, Block[]>>({});
  const [pendingBlocks, setPendingBlocks] = useState<Record<string, Block[]>>({});
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

  // --- Undo/Redo-Historie -------------------------------------------------
  // Schnappschüsse des gesamten `pending`-Objekts. baseRef = Stand am letzten
  // Checkpoint; Tipp-Bursts werden per Debounce zu einem Schritt gruppiert.
  const pendingRef = useRef<Pending>({});
  useEffect(() => { pendingRef.current = pending; }, [pending]);
  const baselineRef = useRef<Map<string, string>>(new Map()); // Ausgangswert je Feld
  const undoRef = useRef<Pending[]>([]);
  const redoRef = useRef<Pending[]>([]);
  const baseRef = useRef<Pending>({});
  const histTimerRef = useRef<number | undefined>(undefined);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const syncHist = useCallback(() => {
    setCanUndo(undoRef.current.length > 0);
    setCanRedo(redoRef.current.length > 0);
  }, []);

  useEffect(() => {
    let alive = true;
    fetch(`${FN_BASE}/site-content`, { headers: { Authorization: `Bearer ${FN_ANON}` } })
      .then((r) => (r.ok ? r.json() : { content: {} }))
      .then((d) => { if (alive) setOverrides((d && d.content) || {}); })
      .catch(() => {}); // Supabase weg -> Defaults aus dem Code greifen
    fetch(`${FN_BASE}/zones`, { headers: { Authorization: `Bearer ${FN_ANON}` } })
      .then((r) => (r.ok ? r.json() : { zones: {} }))
      .then((d) => { if (alive) setZones((d && d.zones) || {}); })
      .catch(() => {}); // Zonen weg -> Code-Defaults greifen
    fetch(`${FN_BASE}/pages`, { headers: { Authorization: `Bearer ${FN_ANON}` } })
      .then((r) => (r.ok ? r.json() : { pages: [] }))
      .then((d) => { if (alive) setPages(Array.isArray(d?.pages) ? d.pages : []); })
      .catch(() => {}); // Seiten weg -> keine dynamischen Seiten
    fetch(`${FN_BASE}/blocks`, { headers: { Authorization: `Bearer ${FN_ANON}` } })
      .then((r) => (r.ok ? r.json() : { blocks: {} }))
      .then((d) => { if (alive) setBlocks((d && d.blocks) || {}); })
      .catch(() => {}); // Blöcke weg -> keine Blöcke
    return () => { alive = false; };
  }, []);

  const get = useCallback((id: string) => {
    if (id in pending) return pending[id].v;
    if (id in overrides) return overrides[id];
    return undefined;
  }, [pending, overrides]);

  const getStored = useCallback((id: string) => (id in overrides ? overrides[id] : undefined), [overrides]);

  // Einen Pending-Schnappschuss anwenden: contentEditable-Texte direkt ins DOM
  // zurückschreiben (React fasst das stabile `seed` nicht an, wie beim Tippen);
  // Bilder aktualisieren sich über den State (EditableImage liest get(id)) selbst.
  const applyPending = useCallback((target: Pending) => {
    if (typeof document !== "undefined") {
      document.querySelectorAll<HTMLElement>("[data-ed-id]").forEach((el) => {
        const id = el.getAttribute("data-ed-id");
        if (!id) return;
        const rich = el.getAttribute("data-ed-rich") === "true";
        const val = id in target ? target[id].v : baselineRef.current.get(id);
        if (val === undefined) return;
        if (rich) { if (el.innerHTML !== val) el.innerHTML = val; }
        else { if (el.textContent !== val) el.textContent = val; }
      });
    }
    setPendingState(target);
  }, []);

  const commitCheckpoint = useCallback(() => {
    const cur = pendingRef.current;
    if (samePending(cur, baseRef.current)) return;
    undoRef.current.push(baseRef.current);
    if (undoRef.current.length > 100) undoRef.current.shift(); // Deckel
    baseRef.current = { ...cur };
    redoRef.current = [];
    syncHist();
  }, [syncHist]);

  const scheduleCheckpoint = useCallback(() => {
    if (histTimerRef.current) window.clearTimeout(histTimerRef.current);
    histTimerRef.current = window.setTimeout(() => { histTimerRef.current = undefined; commitCheckpoint(); }, 700);
  }, [commitCheckpoint]);

  const flushCheckpoint = useCallback(() => {
    if (histTimerRef.current) { window.clearTimeout(histTimerRef.current); histTimerRef.current = undefined; }
    commitCheckpoint();
  }, [commitCheckpoint]);

  const resetHistory = useCallback(() => {
    if (histTimerRef.current) { window.clearTimeout(histTimerRef.current); histTimerRef.current = undefined; }
    undoRef.current = []; redoRef.current = []; baseRef.current = {};
    syncHist();
  }, [syncHist]);

  const setPending = useCallback((id: string, v: string, rich: boolean) => {
    setPendingState((p) => ({ ...p, [id]: { v, rich } }));
    scheduleCheckpoint();
  }, [scheduleCheckpoint]);

  const registerField = useCallback((id: string, initial: string) => {
    if (!baselineRef.current.has(id)) baselineRef.current.set(id, initial);
  }, []);

  const undo = useCallback(() => {
    flushCheckpoint(); // laufenden Tipp-Burst zuerst als Schritt festhalten
    if (undoRef.current.length === 0) return;
    redoRef.current.push(baseRef.current);
    const prev = undoRef.current.pop() as Pending;
    baseRef.current = prev;
    applyPending(prev);
    syncHist();
  }, [applyPending, flushCheckpoint, syncHist]);

  const redo = useCallback(() => {
    if (redoRef.current.length === 0) return;
    undoRef.current.push(baseRef.current);
    const next = redoRef.current.pop() as Pending;
    baseRef.current = next;
    applyPending(next);
    syncHist();
  }, [applyPending, syncHist]);

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
    const zoneIds = Object.keys(pendingZones);
    const blockAreas = Object.keys(pendingBlocks);
    if (!ids.length && !zoneIds.length && !blockAreas.length) return;
    setSaving(true); setError(null); setStatus("Speichern …");
    let failed = false;
    try {
      // 1) Texte/Bilder (site-content)
      if (ids.length) {
        const overridesOut: Record<string, string> = {};
        const rich: string[] = [];
        for (const id of ids) { overridesOut[id] = pending[id].v; if (pending[id].rich) rich.push(id); }
        const res = await fetch(`${FN_BASE}/site-content/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${FN_ANON}` },
          body: JSON.stringify({ password: pw(), action: "save", overrides: overridesOut, rich }),
        });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) { setError("Texte/Bilder speichern fehlgeschlagen (" + (d.error || res.status) + ")."); failed = true; }
        else {
          for (const id of ids) baselineRef.current.set(id, overridesOut[id]);
          setOverrides((o) => ({ ...o, ...overridesOut }));
          setPendingState({});
          resetHistory();
        }
      }
      // 2) Struktur (Block-Zonen) — nur wenn Teil 1 nicht fehlschlug
      if (zoneIds.length && !failed) {
        const nextZones = { ...zones, ...pendingZones };
        const res = await fetch(`${FN_BASE}/admin/zones/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${FN_ANON}` },
          body: JSON.stringify({ password: pw(), zones: nextZones }),
        });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) { setError("Struktur speichern fehlgeschlagen (" + (d.error || res.status) + ")."); failed = true; }
        else { setZones(nextZones); setPendingZones({}); }
      }
      // 3) Inhalts-Blöcke (Text/Button/Bild)
      if (blockAreas.length && !failed) {
        const nextBlocks = { ...blocks, ...pendingBlocks };
        const res = await fetch(`${FN_BASE}/admin/blocks/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${FN_ANON}` },
          body: JSON.stringify({ password: pw(), blocks: nextBlocks }),
        });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) { setError("Blöcke speichern fehlgeschlagen (" + (d.error || res.status) + ")."); failed = true; }
        else { setBlocks(nextBlocks); setPendingBlocks({}); }
      }
      if (!failed) setStatus("Gespeichert ✓ — in 1–2 Min überall live.");
    } catch { setError("Speichern: Verbindungsfehler."); } finally { setSaving(false); }
  }, [pending, pendingZones, zones, pendingBlocks, blocks, resetHistory]);

  const discard = useCallback(() => {
    applyPending({}); // DOM zurück auf die Ausgangswerte, dann Historie leeren
    setPendingZones({}); // Zonen-Struktur reagiert von selbst (getZone re-liest)
    setPendingBlocks({});
    resetHistory();
    setStatus("Änderungen verworfen."); setError(null);
  }, [applyPending, resetHistory]);

  const exit = useCallback(() => {
    pwRef.current = "";
    setEditMode(false); setPendingState({}); setPendingZones({}); setPendingBlocks({}); setStatus(null); setError(null);
    if (histTimerRef.current) { window.clearTimeout(histTimerRef.current); histTimerRef.current = undefined; }
    undoRef.current = []; redoRef.current = []; baseRef.current = {}; baselineRef.current = new Map();
    syncHist();
  }, [syncHist]);

  const restore = useCallback(async () => {
    setSaving(true); setError(null); setStatus("Setze zurück …");
    try {
      const res = await fetch(`${FN_BASE}/site-content/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${FN_ANON}` },
        body: JSON.stringify({ password: pw(), action: "restore" }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError("Zurücksetzen fehlgeschlagen (" + (d.error || res.status) + ")."); return; }
      const r2 = await fetch(`${FN_BASE}/site-content`, { headers: { Authorization: `Bearer ${FN_ANON}` } });
      const c2 = await r2.json().catch(() => ({ content: {} }));
      setOverrides((c2 && c2.content) || {});
      setStatus("Letzter veröffentlichter Stand wiederhergestellt — Seite neu laden.");
    } catch { setError("Zurücksetzen: Verbindungsfehler."); } finally { setSaving(false); }
  }, []);

  const enterEditMode = useCallback((p: string) => {
    // Wird vom Admin-Dashboard („Seite bearbeiten") mit dem im AdminProvider
    // gehaltenen Passwort aufgerufen. Passwort bleibt nur im Speicher der Sitzung.
    pwRef.current = p;
    undoRef.current = []; redoRef.current = []; baseRef.current = {}; baselineRef.current = new Map();
    setPendingZones({});
    syncHist();
    setEditMode(true);
  }, [syncHist]);

  const isDirty = useCallback((id: string) => id in pending, [pending]);

  // --- Block-Zonen ---------------------------------------------------------
  const getZone = useCallback((zoneId: string, defaultKeys: string[]) => {
    if (zoneId in pendingZones) return pendingZones[zoneId];
    if (zoneId in zones) return zones[zoneId];
    return defaultKeys;
  }, [pendingZones, zones]);

  const curZone = (zoneId: string, defaultKeys: string[]) =>
    zoneId in pendingZones ? pendingZones[zoneId] : zoneId in zones ? zones[zoneId] : defaultKeys;

  const addZoneItem = useCallback((zoneId: string, defaultKeys: string[]) => {
    const key = ("x" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)).slice(0, 16);
    setPendingZones((p) => ({ ...p, [zoneId]: [...curZone(zoneId, defaultKeys), key] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingZones, zones]);

  const removeZoneItem = useCallback((zoneId: string, key: string, defaultKeys: string[]) => {
    setPendingZones((p) => ({ ...p, [zoneId]: curZone(zoneId, defaultKeys).filter((k) => k !== key) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingZones, zones]);

  const moveZoneItem = useCallback((zoneId: string, key: string, dir: -1 | 1, defaultKeys: string[]) => {
    const arr = curZone(zoneId, defaultKeys).slice();
    const i = arr.indexOf(key);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setPendingZones((p) => ({ ...p, [zoneId]: arr }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingZones, zones]);

  const getPages = useCallback(() => pages, [pages]);

  // Struktur frisch vom Server holen (nach Änderungen im Admin, ohne Voll-Reload).
  const reloadStructure = useCallback(async () => {
    const j = (path: string, fallback: unknown) =>
      fetch(`${FN_BASE}${path}`, { headers: { Authorization: `Bearer ${FN_ANON}` } })
        .then((r) => (r.ok ? r.json() : fallback)).catch(() => fallback);
    const [z, p, b] = await Promise.all([
      j("/zones", { zones: {} }) as Promise<{ zones?: Record<string, string[]> }>,
      j("/pages", { pages: [] }) as Promise<{ pages?: Array<{ slug: string; label: string; inMenu: boolean }> }>,
      j("/blocks", { blocks: {} }) as Promise<{ blocks?: Record<string, Block[]> }>,
    ]);
    setZones(z?.zones || {});
    setPages(Array.isArray(p?.pages) ? p.pages : []);
    setBlocks(b?.blocks || {});
  }, []);

  // --- Typisierte Inhalts-Blöcke -----------------------------------------
  const curBlocks = (areaId: string) =>
    areaId in pendingBlocks ? pendingBlocks[areaId] : areaId in blocks ? blocks[areaId] : [];
  const getBlocks = useCallback((areaId: string) => curBlocks(areaId), [pendingBlocks, blocks]);

  const addBlock = useCallback((areaId: string, type: "text" | "button" | "image") => {
    const k = ("b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)).slice(0, 16);
    const block: Block = type === "button" ? { k, t: type, href: "#" } : { k, t: type };
    setPendingBlocks((p) => ({ ...p, [areaId]: [...curBlocks(areaId), block] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingBlocks, blocks]);

  const removeBlock = useCallback((areaId: string, key: string) => {
    setPendingBlocks((p) => ({ ...p, [areaId]: curBlocks(areaId).filter((b) => b.k !== key) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingBlocks, blocks]);

  const moveBlock = useCallback((areaId: string, key: string, dir: -1 | 1) => {
    const arr = curBlocks(areaId).slice();
    const i = arr.findIndex((b) => b.k === key);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setPendingBlocks((p) => ({ ...p, [areaId]: arr }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingBlocks, blocks]);

  const setBlockHref = useCallback((areaId: string, key: string, href: string) => {
    setPendingBlocks((p) => ({ ...p, [areaId]: curBlocks(areaId).map((b) => (b.k === key ? { ...b, href } : b)) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingBlocks, blocks]);

  // Schutz vor Datenverlust: Browser-Warnung beim Verlassen/Neuladen, solange es
  // ungespeicherte Änderungen gibt (nur im Bearbeitungsmodus).
  useEffect(() => {
    if (!editMode || Object.keys(pending).length === 0) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [editMode, pending]);

  // Tastenkürzel im Bearbeitungsmodus: Strg+S speichern, Strg+Z rückgängig,
  // Strg+Umschalt+Z / Strg+Y wiederholen.
  useEffect(() => {
    if (!editMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === "s") {
        e.preventDefault();
        if (Object.keys(pendingRef.current).length > 0) void save();
      } else if (k === "z" && !e.shiftKey) {
        e.preventDefault(); undo();
      } else if ((k === "z" && e.shiftKey) || k === "y") {
        e.preventDefault(); redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editMode, save, undo, redo]);

  // Statusmeldungen (z. B. „Gespeichert ✓") nach ein paar Sekunden ausblenden,
  // damit sie nicht dauerhaft stehen bleiben. Fehler (`error`) bleiben bestehen.
  useEffect(() => {
    if (!status) return;
    const t = window.setTimeout(() => setStatus(null), 4000);
    return () => window.clearTimeout(t);
  }, [status]);

  const value: Ctx = {
    get, getStored, editMode,
    dirtyCount: Object.keys(pending).length + Object.keys(pendingZones).length + Object.keys(pendingBlocks).length,
    isDirty, registerField, undo, redo, canUndo, canRedo,
    getZone, addZoneItem, removeZoneItem, moveZoneItem, getPages,
    getBlocks, addBlock, removeBlock, moveBlock, setBlockHref, reloadStructure,
    saving, status, error,
    setPending, uploadImage, save, discard, exit, restore, enterEditMode,
  };
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}
