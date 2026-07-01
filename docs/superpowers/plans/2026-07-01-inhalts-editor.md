# Inhalts-Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein passwortgeschützter In-Place-Editor, mit dem der Cura-Doma-Betreiber Texte & Bilder aller Hauptseiten selbst ändert — Änderungen sofort live über Supabase, ohne Rebuild und ohne GitHub-Token.

**Architecture:** Standardtexte/-bilder bleiben im Code (als `children`/`src` der Editable-Wrapper); Supabase-KV hält nur die geänderten Deltas. Zur Laufzeit legt ein `ContentProvider` die Overrides über die Defaults. Bearbeitung läuft über `contentEditable` in-place; Speichern schreibt passwortgeschützt in die bestehende Edge Function `make-server-ec6100a6`.

**Tech Stack:** React 18.3 + Vite 6 + react-router 7 + Tailwind v4 (config-less); Supabase Edge Function (Deno + Hono, KV-Store `kv_store_ec6100a6`, Supabase Storage). Inhalts-Inventar (Feldliste): `docs/superpowers/plans/2026-07-01-inhalts-editor-content-inventory.md`.

## Global Constraints

- **Kein Test-Framework im Repo** (kein vitest/jest, kein `tsc`-Step). Verifikation erfolgt über: `npm run build` (muss exit 0 sein), Playwright-Browser-Checks (Desktop **und** Mobile), und `curl`/`fetch` gegen die Edge Function. **Keine Unit-Test-Dateien erfinden** — die „Test"-Schritte unten sind Build-/Browser-/HTTP-Checks.
- **Marken-Farben als hartcodierte Hex-Tailwind-Klassen** exakt übernehmen: Teal `#6FD3D1`, Hover `#5BC2C0`, Logo `#6FBDB8`, Mint `#DFF7F8`/`#BFEAF2`, Rahmen `#E5F4F5`, BG `#F8FEFF`, Text `#111111`/`#5F6B73`/`#9AA3A8`. Editor-Rot (Umrandung) `#d7120a` (wie de Vries).
- **Font** via `style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}` (der `jakarta`-Const-Stil bestehender Dateien).
- **Content-ID-Format:** `^[a-z0-9.-]{1,64}$`. IDs kommen aus dem Inventar-Dokument.
- **Edge Function** läuft mit `verify_jwt = false` (in `config.toml` gepinnt) und wird per Supabase-CLI deployt (`supabase functions deploy make-server-ec6100a6`) — **nicht** über GitHub Pages.
- **Frontend-Deploy:** Push auf `main` → GitHub-Action baut & deployt (curadoma.de). Push/Deploy nur auf ausdrückliches „deploy" des Nutzers.
- **Sicherheit:** Passwort nur server-seitig (Secret `EDIT_PASSWORD`), konstante-Zeit-Vergleich; Rate-Limit; ID/Längen-Validierung; Rich-Sanitizer (Escape-First-Allowlist); Bild-Magic-Byte-Check; `/admin` + Editor-UI `noindex`.
- **DRY:** Frontend nutzt `FN_BASE`/`FN_ANON` aus `src/lib/booking.ts`. Backend nutzt vorhandene Helfer `clientIp`, `rateLimitState`/`bumpRateLimit`, `decodeBase64`, `sanitizeFilename`, `createClient`, `kv`.

---

## Wrapping-Regeln (gelten für alle Seiten-Tasks 6–18)

Diese Regeln bestimmen, wie eine Textstelle aus dem Inventar in Code verdrahtet wird. **Struktur bleibt im Code, nur Inhalt wird editierbar.**

1. **plain** (Standardfall): `<Editable id="…" as="span|h2|p|…">Aktueller Text</Editable>`. Der aktuelle Text bleibt als `children` (= Default/Fallback).
2. **rich** — **nur** für Fließtexte, deren Hervorhebung (`<strong>`/`<em>`) der Betreiber kontrollieren soll:
   `<Editable id="…" as="p" rich>Text mit <strong>Betonung</strong>.</Editable>`. Erlaubte Inline-Tags: `strong,b,em,i,br,a` (sichere href). Sonst nichts.
3. **Strukturelles Inline-Markup NIEMALS in editierbaren Inhalt aufnehmen.** Das betrifft:
   - **Farbige `<span className="text-[#6FD3D1]">`** in Hero-H1: span als Struktur behalten, den Text darin als eigenes `plain`-Editable. Beispiel siehe Task 6.
   - **Layout-`<br>`**: bleibt zwischen zwei getrennten `plain`-Editables stehen.
   - **React-Router `<Link>` / `<a>` mit Route** (z. B. in Consent-Texten): Link bleibt Struktur; die statischen Textteile davor/danach werden je ein eigenes `plain`-Editable; der Link-Text selbst ein `plain`-Editable **innerhalb** des `<Link>`.
   - **Icons (Lucide), Zähler-Variablen (`{JOB_TITLE}`, `{count}`), `to=`/`href=`-Ziele**: nicht editierbar.
4. **Bilder:** `<img src={X} … />` → `<EditableImage id="…" src={X} alt="…" className="…" />`. Dekorative Gradients/SVG-Icons bleiben unangetastet.
5. **Alt-Texte:** als eigenes `plain`-Editable-Prop führen, wo im Inventar mit `element=img-alt` vermerkt (siehe EditableImage `altId`-Prop).
6. **shared.\*** (Kontaktdaten, Menü, Footer): NICHT pro Seite als eigene ID, sondern über die shared-Komponenten aus Task 5 (`<PhoneText/>`, `<EmailText/>`, `<AddressBlock/>`, `<HoursText/>`, Nav/Footer-Labels). Eine Änderung greift überall.

---

## Task 1: Backend — Editor-Routen in der Edge Function

**Files:**
- Modify: `supabase/functions/make-server-ec6100a6/index.ts` (Helfer + 4 Routen ergänzen, vor `Deno.serve(app.fetch)`)

**Interfaces:**
- Produces (HTTP, alle unter Präfix `/make-server-ec6100a6`):
  - `GET /site-content` → `{ content: Record<string,string> }`
  - `POST /site-content/save` Body `{ password, action?: "save"|"restore"|"__check", overrides?: Record<string,string>, rich?: string[] }` → `{ ok: true }` | Fehlerobjekt
  - `POST /site-content/image` Body `{ password, id, dataBase64, mimetype }` → `{ ok: true, url }` | Fehler
- Secret: `EDIT_PASSWORD`. KV-Keys: `site_content:current`, `site_content:history`. Storage-Bucket: `site-content` (public).

- [ ] **Step 1: Helfer + Konstanten ergänzen** (nach den bestehenden Helfern, vor den Routen):

```ts
// --- Inhalts-Editor -------------------------------------------------------
const EDIT_PW = Deno.env.get("EDIT_PASSWORD") || "";
const CONTENT_KEY = "site_content:current";
const CONTENT_HISTORY_KEY = "site_content:history";
const CONTENT_BUCKET = "site-content";
const MAX_PLAIN = 3000, MAX_RICH = 8000, MAX_IDS_PER_SAVE = 300, MAX_IMG_BYTES = 3 * 1024 * 1024;
const ID_RE = /^[a-z0-9.\-]{1,64}$/;

// Passwortvergleich in konstanter Zeit (gegen Timing-Angriffe)
function ctEq(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a), eb = new TextEncoder().encode(b);
  const n = Math.max(ea.length, eb.length);
  let r = ea.length ^ eb.length;
  for (let i = 0; i < n; i++) r |= (ea[i] || 0) ^ (eb[i] || 0);
  return r === 0;
}
function safeHref(h: string): boolean {
  h = (h || "").trim();
  return /^https?:\/\//i.test(h) || /^mailto:/i.test(h) || /^tel:/i.test(h) || /^\/[\w./-]*$/.test(h) || /^#[\w-]+$/.test(h);
}
// Escape-First-Allowlist: erst ALLES neutralisieren, dann nur wenige sichere Inline-Tags zurück.
function sanitizeRich(html: string): string {
  let s = html
    .replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, "&amp;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  s = s.replace(/&lt;(\/?)(strong|b|em|i)&gt;/gi, "<$1$2>");
  s = s.replace(/&lt;br\s*\/?&gt;/gi, "<br>");
  s = s.replace(/&lt;a\b[\s\S]*?&gt;/gi, (m) => {
    const hm = m.match(/href=(?:&quot;|&#39;)([\s\S]*?)(?:&quot;|&#39;)/i);
    const href = hm ? hm[1] : "";
    return safeHref(href) ? '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' : "";
  });
  s = s.replace(/&lt;\/a&gt;/gi, "</a>");
  s = s.replace(/&lt;\/?[a-z][\s\S]*?&gt;/gi, "");
  return s;
}
// Editor-Rate-Limit: nur bei FEHLERN hochzählen (per IP + global), 15-Min-Fenster.
async function editRateLimited(ip: string): Promise<boolean> {
  const perIp = await rateLimitState(`edit_rl:ip:${ip}`);
  const glob = await rateLimitState(`edit_rl:global`);
  return perIp.count >= 10 || glob.count >= 60;
}
async function editBumpFail(ip: string): Promise<void> {
  await bumpRateLimit(`edit_rl:ip:${ip}`, await rateLimitState(`edit_rl:ip:${ip}`));
  await bumpRateLimit(`edit_rl:global`, await rateLimitState(`edit_rl:global`));
}
```

- [ ] **Step 2: `GET /site-content` ergänzen:**

```ts
app.get("/make-server-ec6100a6/site-content", async (c) => {
  try {
    const content = (await kv.get(CONTENT_KEY)) as Record<string, string> | undefined;
    return c.json({ content: content ?? {} });
  } catch {
    return c.json({ content: {} });
  }
});
```

- [ ] **Step 3: `POST /site-content/save` ergänzen** (Passwort + Rate-Limit + Validierung + Sanitize + History):

```ts
app.post("/make-server-ec6100a6/site-content/save", async (c) => {
  if (!EDIT_PW) return c.json({ error: "not_configured" }, 503);
  const ip = clientIp(c);
  if (await editRateLimited(ip)) return c.json({ error: "rate_limited" }, 429);

  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ error: "bad_json" }, 400); }

  if (typeof body.password !== "string" || !ctEq(body.password, EDIT_PW)) {
    await editBumpFail(ip);
    await new Promise((r) => setTimeout(r, 600));
    return c.json({ error: "unauthorized" }, 401);
  }
  if (body.action === "__check") return c.json({ ok: true });

  if (body.action === "restore") {
    const hist = ((await kv.get(CONTENT_HISTORY_KEY)) as Array<{ ts: number; data: Record<string, string> }> | undefined) ?? [];
    if (!hist.length) return c.json({ error: "no_history" }, 400);
    const prev = hist[hist.length - 1];
    await kv.set(CONTENT_KEY, prev.data);
    await kv.set(CONTENT_HISTORY_KEY, hist.slice(0, -1));
    return c.json({ ok: true, restored: prev.ts });
  }

  const overrides = (body.overrides || {}) as Record<string, string>;
  const richIds = new Set<string>(Array.isArray(body.rich) ? body.rich : []);
  const ids = Object.keys(overrides);
  if (!ids.length) return c.json({ error: "empty" }, 400);
  if (ids.length > MAX_IDS_PER_SAVE) return c.json({ error: "too_many" }, 400);
  for (const id of ids) {
    if (!ID_RE.test(id)) return c.json({ error: "bad_id", id }, 400);
    const v = overrides[id];
    if (typeof v !== "string") return c.json({ error: "bad_value", id }, 400);
    if (richIds.has(id)) { if (v.length > MAX_RICH) return c.json({ error: "too_long", id }, 400); }
    else if (v.length > MAX_PLAIN) return c.json({ error: "too_long", id }, 400);
  }

  const current = ((await kv.get(CONTENT_KEY)) as Record<string, string> | undefined) ?? {};
  // History-Snapshot des vorherigen Standes (Deckel 20)
  const hist = ((await kv.get(CONTENT_HISTORY_KEY)) as Array<{ ts: number; data: Record<string, string> }> | undefined) ?? [];
  hist.push({ ts: Date.now(), data: current });
  await kv.set(CONTENT_HISTORY_KEY, hist.slice(-20));

  const next = { ...current };
  for (const id of ids) next[id] = richIds.has(id) ? sanitizeRich(overrides[id]) : overrides[id];
  await kv.set(CONTENT_KEY, next);
  return c.json({ ok: true, count: ids.length });
});
```

- [ ] **Step 4: `POST /site-content/image` ergänzen** (Passwort + Magic-Byte + public Bucket + `getPublicUrl`):

```ts
app.post("/make-server-ec6100a6/site-content/image", async (c) => {
  if (!EDIT_PW) return c.json({ error: "not_configured" }, 503);
  const ip = clientIp(c);
  if (await editRateLimited(ip)) return c.json({ error: "rate_limited" }, 429);

  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ error: "bad_json" }, 400); }
  if (typeof body.password !== "string" || !ctEq(body.password, EDIT_PW)) {
    await editBumpFail(ip); await new Promise((r) => setTimeout(r, 600));
    return c.json({ error: "unauthorized" }, 401);
  }
  const id = body.id as string, data = body.dataBase64 as string, mimetype = (body.mimetype as string) || "";
  if (!ID_RE.test(id || "")) return c.json({ error: "bad_id" }, 400);
  if (typeof data !== "string" || data.length > Math.ceil(MAX_IMG_BYTES * 1.4)) return c.json({ error: "image_too_big" }, 400);

  const bytes = decodeBase64(data);
  if (bytes.length === 0 || bytes.length > MAX_IMG_BYTES) return c.json({ error: "image_too_big" }, 400);
  const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isWebp = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50; // "WEBP"
  if (!(isJpg || isPng || isWebp)) return c.json({ error: "not_image" }, 400);
  const ext = isPng ? "png" : isWebp ? "webp" : "jpg";

  const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return c.json({ error: "storage_not_configured" }, 503);
  const supabase = createClient(url, key);
  await supabase.storage.createBucket(CONTENT_BUCKET, { public: true }).catch(() => {});
  const path = `img/${sanitizeFilename(id)}-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage.from(CONTENT_BUCKET)
    .upload(path, bytes, { contentType: mimetype || `image/${ext}`, upsert: true });
  if (upErr) return c.json({ error: upErr.message }, 500);
  const { data: pub } = supabase.storage.from(CONTENT_BUCKET).getPublicUrl(path);
  return c.json({ ok: true, url: pub.publicUrl });
});
```

- [ ] **Step 5: Secret setzen + Bucket + Deploy**

```bash
cd c/Users/Tolun/CuraDoma/Curadoma
npx supabase secrets set EDIT_PASSWORD='<STARKES-PASSWORT-16+>' --project-ref gjcleedoysndaagtsqjb
npx supabase functions deploy make-server-ec6100a6 --project-ref gjcleedoysndaagtsqjb
```
Expected: „Deployed Function make-server-ec6100a6". (Der Bucket wird beim ersten Bild-Upload idempotent angelegt.)

- [ ] **Step 6: Endpunkte prüfen (curl)**

```bash
BASE=https://gjcleedoysndaagtsqjb.supabase.co/functions/v1/make-server-ec6100a6
ANON='<publicAnonKey aus src/utils/supabase/info>'
curl -s "$BASE/site-content" -H "Authorization: Bearer $ANON"        # -> {"content":{}}
curl -s -X POST "$BASE/site-content/save" -H "Authorization: Bearer $ANON" -H 'Content-Type: application/json' -d '{"password":"FALSCH","action":"__check"}'   # -> 401 unauthorized
curl -s -X POST "$BASE/site-content/save" -H "Authorization: Bearer $ANON" -H 'Content-Type: application/json' -d '{"password":"<RICHTIG>","action":"__check"}' # -> {"ok":true}
curl -s -X POST "$BASE/site-content/save" -H "Authorization: Bearer $ANON" -H 'Content-Type: application/json' -d '{"password":"<RICHTIG>","overrides":{"home.intro.title":"TESTTITEL"}}'  # -> {"ok":true,...}
curl -s "$BASE/site-content" -H "Authorization: Bearer $ANON"        # -> enthält "home.intro.title":"TESTTITEL"
# XSS: rich mit <script> muss neutralisiert werden
curl -s -X POST "$BASE/site-content/save" -H "Authorization: Bearer $ANON" -H 'Content-Type: application/json' -d '{"password":"<RICHTIG>","overrides":{"x.y.z":"<script>alert(1)</script><strong>ok</strong>"},"rich":["x.y.z"]}'
curl -s "$BASE/site-content" -H "Authorization: Bearer $ANON"        # x.y.z -> "&lt;script&gt;alert(1)&lt;/script&gt;<strong>ok</strong>"
```
Danach die Test-Keys wieder entfernen (erneuter save mit korrigierten Werten oder KV-Eintrag löschen).

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/make-server-ec6100a6/index.ts
git commit -m "Editor-Backend: /site-content GET/save/image (Passwort, Rate-Limit, Sanitizer, Storage)"
```

---

## Task 2: Frontend — ContentProvider (`src/lib/content.tsx`)

**Files:**
- Create: `src/lib/content.tsx`

**Interfaces:**
- Produces: `ContentProvider`, `useContent()` → `{ get(id): string|undefined, editMode, dirtyCount, saving, status, error, setPending(id,value,rich), uploadImage(id,file), save(), discard(), exit(), restore(), enterEditMode(pw) }`.
- Consumes: `FN_BASE`, `FN_ANON` aus `./booking`.

- [ ] **Step 1: Datei anlegen**

```tsx
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { FN_BASE, FN_ANON } from "./booking";

type Pending = Record<string, { v: string; rich: boolean }>;
type Ctx = {
  get: (id: string) => string | undefined;
  editMode: boolean;
  dirtyCount: number;
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
  const [editMode, setEditMode] = useState<boolean>(
    () => typeof sessionStorage !== "undefined" && sessionStorage.getItem("cd_edit") === "1",
  );
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

  const setPending = useCallback((id: string, v: string, rich: boolean) => {
    setPendingState((p) => ({ ...p, [id]: { v, rich } }));
  }, []);

  const pw = () => (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("cd_edit_pw") || "" : "");

  const uploadImage = useCallback(async (id: string, file: File) => {
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
    if (typeof sessionStorage !== "undefined") { sessionStorage.removeItem("cd_edit"); sessionStorage.removeItem("cd_edit_pw"); }
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
    if (typeof sessionStorage !== "undefined") { sessionStorage.setItem("cd_edit", "1"); sessionStorage.setItem("cd_edit_pw", p); }
    setEditMode(true);
  }, []);

  const value: Ctx = {
    get, editMode, dirtyCount: Object.keys(pending).length, saving, status, error,
    setPending, uploadImage, save, discard, exit, restore, enterEditMode,
  };
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}
```

- [ ] **Step 2: Build-Check**

Run: `npm run build`
Expected: exit 0 (Datei kompiliert; noch nicht eingebunden).

- [ ] **Step 3: Commit** — `git add src/lib/content.tsx && git commit -m "Editor: ContentProvider (Overrides-Fetch, edit-mode, save/restore/upload)"`

---

## Task 3: Frontend — `<Editable>` (`src/app/components/editor/Editable.tsx`)

**Files:**
- Create: `src/app/components/editor/Editable.tsx`

**Interfaces:**
- Consumes: `useContent`.
- Produces: `Editable({ id, as?, rich?, className?, children })`. Default: `override ?? children`. Edit-Modus: `contentEditable`, rote Umrandung, schreibt `innerText` (plain) bzw. `innerHTML` (rich) in `setPending`. **Stabiler Seed** (Ref, einmal beim Aktivieren des Edit-Modus erfasst), damit React die Nutzereingabe während des Tippens nicht überschreibt.

- [ ] **Step 1: Datei anlegen**

```tsx
import { createElement, useRef, type ReactNode } from "react";
import { useContent } from "../../../lib/content";

type Tag = keyof JSX.IntrinsicElements;
export function Editable({ id, children, as = "span", rich = false, className, style }: {
  id: string; children: ReactNode; as?: Tag; rich?: boolean; className?: string; style?: React.CSSProperties;
}) {
  const { get, editMode, setPending } = useContent();
  const override = get(id);
  // Seed nur einmal bei aktivem Edit-Modus erfassen; bei Verlassen zurücksetzen.
  const seed = useRef<ReactNode | undefined>(undefined);
  if (editMode) {
    if (seed.current === undefined) {
      seed.current = override != null
        ? (rich ? <span dangerouslySetInnerHTML={{ __html: override }} /> : override)
        : children;
    }
  } else {
    seed.current = undefined;
  }

  if (!editMode) {
    if (override != null) {
      return rich
        ? createElement(as, { className, style, dangerouslySetInnerHTML: { __html: override } })
        : createElement(as, { className, style }, override);
    }
    return createElement(as, { className, style }, children);
  }

  const editClass = `${className ?? ""} outline outline-1 outline-dashed outline-[#d7120a] outline-offset-2 rounded-sm cursor-text focus:outline-2 focus:outline-solid`.trim();
  const onInput = (e: React.FormEvent<HTMLElement>) => {
    const el = e.currentTarget;
    setPending(id, rich ? el.innerHTML : (el.innerText ?? ""), rich);
  };
  return createElement(
    as,
    { "data-ed-id": id, contentEditable: true, suppressContentEditableWarning: true, className: editClass, style, onInput, title: id },
    seed.current,
  );
}
```

- [ ] **Step 2: Ein Feld als Proof verdrahten** — in `src/app/components/HomePage.tsx` die Intro-Überschrift ersetzen:

Vorher:
```tsx
<h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-6" style={jakarta}>
  Der Mensch im Mittelpunkt
</h2>
```
Nachher (Import oben ergänzen: `import { Editable } from "./editor/Editable";`; das `style`-Prop aus Step 1 erhält den `jakarta`-Font):
```tsx
<Editable as="h2" id="home.intro.title" style={jakarta} className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-6">
  Der Mensch im Mittelpunkt
</Editable>
```
(`jakarta` ist die bestehende Font-Const der Datei. Alle Überschriften, die bisher `style={jakarta}` trugen, behalten es so.)

- [ ] **Step 3: Build-Check** — `npm run build` → exit 0.

- [ ] **Step 4: Commit** — `git add src/app/components/editor/Editable.tsx src/app/components/HomePage.tsx && git commit -m "Editor: <Editable> Komponente + erstes Feld (home.intro.title)"`

---

## Task 4: Frontend — `<EditToolbar>` + `<EditableImage>`, App-Einbindung, `/admin`

**Files:**
- Create: `src/app/components/editor/EditToolbar.tsx`, `src/app/components/editor/EditableImage.tsx`, `src/app/components/AdminLoginPage.tsx`
- Modify: `src/app/App.tsx`, `src/app/routes.tsx`

**Interfaces:**
- Produces: `EditToolbar` (fixed Leiste, nur im Edit-Modus), `EditableImage({ id, src, alt?, altId?, className?, ...img })`, `AdminLoginPage` (Route `/admin`).
- Consumes: `useContent`, `ContentProvider`.

- [ ] **Step 1: `EditToolbar.tsx`**

```tsx
import { useContent } from "../../../lib/content";

export function EditToolbar() {
  const { editMode, dirtyCount, saving, status, error, save, discard, exit, restore } = useContent();
  if (!editMode) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[min(92vw,640px)] bg-white/95 backdrop-blur border border-[#E5F4F5] shadow-[0_20px_60px_rgb(0,0,0,0.18)] rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <span className="inline-flex items-center gap-2 text-sm font-medium text-[#111111]">
        <span className="w-2 h-2 rounded-full bg-[#d7120a]" /> Bearbeitungsmodus
      </span>
      <span className="text-xs text-[#5F6B73]">{dirtyCount} Änderung{dirtyCount === 1 ? "" : "en"}</span>
      <div className="flex-1" />
      {(status || error) && <span className={`text-xs ${error ? "text-[#d7120a]" : "text-[#5F6B73]"}`}>{error || status}</span>}
      <button onClick={save} disabled={saving || dirtyCount === 0}
        className="bg-[#6FD3D1] text-white hover:bg-[#5BC2C0] disabled:opacity-40 px-4 py-2 rounded-full text-sm font-medium transition-colors">
        {saving ? "…" : "Speichern"}
      </button>
      <button onClick={discard} disabled={dirtyCount === 0}
        className="text-[#5F6B73] hover:text-[#111111] disabled:opacity-40 px-3 py-2 rounded-full text-sm">Verwerfen</button>
      <button onClick={() => { if (confirm("Letzte gespeicherte Änderung rückgängig machen?")) restore(); }}
        className="text-[#5F6B73] hover:text-[#111111] px-3 py-2 rounded-full text-sm">Rückgängig</button>
      <button onClick={() => { if (dirtyCount === 0 || confirm("Ungespeicherte Änderungen verwerfen und verlassen?")) exit(); }}
        className="text-[#d7120a] hover:underline px-3 py-2 rounded-full text-sm">Verlassen</button>
    </div>
  );
}
```

- [ ] **Step 2: `EditableImage.tsx`** (kein Wrapper → kein Layout-Bruch; alt-Text optional via `altId`):

```tsx
import { useRef } from "react";
import { useContent } from "../../../lib/content";
import { Editable } from "./Editable";

export function EditableImage({ id, src, alt = "", altId, className, ...img }: {
  id: string; src: string; alt?: string; altId?: string; className?: string;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  const { get, editMode, uploadImage } = useContent();
  const url = get(id) ?? src;
  const altVal = altId ? (get(altId) ?? alt) : alt;
  const inputRef = useRef<HTMLInputElement>(null);
  if (!editMode) return <img src={url} alt={altVal} className={className} {...img} />;
  return (
    <>
      <img src={url} alt={altVal} title="Klicken, um Bild zu ersetzen" onClick={() => inputRef.current?.click()}
        className={`${className ?? ""} outline outline-2 outline-dashed outline-[#d7120a] outline-offset-2 cursor-pointer`} {...img} />
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden
        onChange={async (e) => { const f = e.target.files?.[0]; if (f) await uploadImage(id, f); e.currentTarget.value = ""; }} />
    </>
  );
}
```
(Alt-Text-Bearbeitung: Wo ein alt editierbar sein soll, wird er separat als `<Editable>` im Fließtext o. Ä. nicht sinnvoll — stattdessen `altId` setzen; die Bearbeitung des alt-Textes erfolgt vorerst NICHT inline, sondern der alt bleibt als Default. **YAGNI:** alt-Inline-Bearbeitung ist v1 nicht nötig; `altId` ist vorbereitet, aber der Betreiber bearbeitet zunächst nur sichtbare Bilder/Texte.)

- [ ] **Step 3: `AdminLoginPage.tsx`** (Route `/admin`, `noindex` per `useEffect`):

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useContent } from "../../lib/content";
import { FN_BASE, FN_ANON } from "../../lib/booking";

export function AdminLoginPage() {
  const { enterEditMode } = useContent();
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex,nofollow";
    document.head.appendChild(m);
    return () => { document.head.removeChild(m); };
  }, []);

  async function go() {
    if (!pw) { setMsg("Bitte Passwort eingeben."); return; }
    setBusy(true); setMsg("Prüfe Passwort …");
    try {
      const r = await fetch(`${FN_BASE}/site-content/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${FN_ANON}` },
        body: JSON.stringify({ password: pw, action: "__check" }),
      });
      if (r.status === 401) { setMsg("Falsches Passwort."); setBusy(false); return; }
      if (r.status === 429) { setMsg("Zu viele Versuche — bitte später erneut."); setBusy(false); return; }
      if (r.status === 503) { setMsg("Editor ist noch nicht eingerichtet."); setBusy(false); return; }
      enterEditMode(pw);
      navigate("/");
    } catch { setMsg("Verbindungsfehler."); setBusy(false); }
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-[#E5F4F5] shadow-[0_20px_60px_rgb(191,234,242,0.3)] p-8"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <h1 className="text-2xl font-medium text-[#111111] mb-1">Seite bearbeiten</h1>
        <p className="text-sm text-[#5F6B73] font-light mb-6">Passwort eingeben — danach kannst du Texte &amp; Bilder direkt auf der Seite ändern.</p>
        <input type="password" value={pw} autoComplete="current-password"
          onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-[#E5F4F5] bg-[#F8FEFF] mb-3 outline-none focus:border-[#6FD3D1]" />
        <button onClick={go} disabled={busy}
          className="w-full bg-[#6FD3D1] text-white hover:bg-[#5BC2C0] disabled:opacity-50 py-3 rounded-full font-medium transition-colors">
          Bearbeitungsmodus starten
        </button>
        <p className="text-xs mt-3 min-h-[1.2em] text-[#5F6B73]">{msg}</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: App + Route einbinden**

`src/app/App.tsx`:
```tsx
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ContentProvider } from "../lib/content";
import { EditToolbar } from "./components/editor/EditToolbar";

export default function App() {
  return (
    <ContentProvider>
      <RouterProvider router={router} />
      <EditToolbar />
    </ContentProvider>
  );
}
```
`src/app/routes.tsx` — Import + Route ergänzen:
```tsx
import { AdminLoginPage } from "./components/AdminLoginPage";
// … innerhalb children, vor der "*"-Route:
{ path: "admin", Component: AdminLoginPage },
```

- [ ] **Step 5: Build + Browser-Verifikation (End-to-End)**

Run: `npm run build` → exit 0. Dann `npm run dev` und mit Playwright:
1. `/admin` öffnen → falsches Passwort → „Falsches Passwort."; richtiges → Redirect auf `/`, Toolbar unten sichtbar.
2. `home.intro.title` (aus Task 3) rot umrandet → hineinklicken, Text ändern → **Cursor bleibt stabil (kein Zurückspringen)** → Toolbar zeigt „1 Änderung".
3. „Speichern" → „Gespeichert ✓". Seite neu laden (Edit-Modus via sessionStorage noch aktiv) → geänderter Text bleibt.
4. **Frisches Inkognito-Fenster** (kein sessionStorage) → geänderter Text ist öffentlich sichtbar. Danach zurücksetzen (Toolbar „Rückgängig").
5. „Verlassen" → Toolbar weg, Umrandungen weg.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "Editor: Toolbar, EditableImage, /admin-Login, App-Einbindung"`

---

## Task 5: Frontend — shared.* (Layout: Menü, Utility-Leiste, Footer, Kontaktdaten)

**Files:**
- Create: `src/app/components/editor/Shared.tsx` (Kontakt-Bausteine)
- Modify: `src/app/components/Layout.tsx`

**Interfaces:**
- Produces: `PhoneText`, `EmailText`, `HoursText`, `AddressBlock` (lesen `shared.*`, im Edit-Modus editierbar). Nav-/Footer-Labels via `<Editable>` mit `shared.*`-IDs.
- Referenz: `shared.*`-Tabelle im Inventar-Dokument.

- [ ] **Step 1: `Shared.tsx`** (SSOT-Bausteine für die 5 Adressformate + Telefon/E-Mail/Zeiten):

```tsx
import { useContent } from "../../../lib/content";
import { Editable } from "./Editable";

// Sichtbarer Telefontext; href wird aus dem Text abgeleitet (0… -> +49…).
function telHref(display: string) {
  const digits = display.replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? `tel:${digits}` : `tel:+49${digits.replace(/^0/, "")}`;
}
export function PhoneText({ id = "shared.tel_display", def = "05151 7107093", className }: { id?: string; def?: string; className?: string }) {
  const { get } = useContent();
  const display = get(id) ?? def;
  return <a href={telHref(display)} className={className}><Editable as="span" id={id}>{def}</Editable></a>;
}
export function EmailText({ id = "shared.email", def = "info@curadoma.de", className }: { id?: string; def?: string; className?: string }) {
  const { get } = useContent();
  const val = get(id) ?? def;
  return <a href={`mailto:${val}`} className={className}><Editable as="span" id={id}>{def}</Editable></a>;
}
export function HoursText({ withSuffix = true, className }: { withSuffix?: boolean; className?: string }) {
  return <span className={className}><Editable as="span" id="shared.hours">Mo–Fr: 8:00 – 17:00</Editable>{withSuffix ? " Uhr" : ""}</span>;
}
// Adresse strukturiert; `variant` steuert das Rendering (br / inline / inline-country).
export function AddressBlock({ variant = "br", country = false, className }: { variant?: "br" | "inline"; country?: boolean; className?: string }) {
  const street = <Editable as="span" id="shared.address.street">Süntelhang 9</Editable>;
  const zipcity = <><Editable as="span" id="shared.address.zip">31787</Editable> <Editable as="span" id="shared.address.city">Hameln</Editable></>;
  const land = country ? <Editable as="span" id="shared.address.country">Deutschland</Editable> : null;
  if (variant === "inline") return <span className={className}>{street}, {zipcity}{land ? <>, {land}</> : null}</span>;
  return <span className={className}>{street}<br />{zipcity}{land ? <><br />{land}</> : null}</span>;
}
```

- [ ] **Step 2: `Layout.tsx` verdrahten** — laut Inventar-Abschnitt „Layout.tsx (31 Items)" + „shared.\*"-Tabelle:
  - Desktop-Nav-Labels und Mobile-Nav-Array-Labels → **dieselben** `<Editable>`-IDs (`shared.nav.startseite`, `shared.nav.einzugsgebiet`, `shared.nav.karriere`, `shared.nav.kontakt`, `shared.nav.leistungen`, `shared.nav.termin`, `shared.nav.cta`). Wo Desktop „Termin" / Mobile „Termin vereinbaren" bewusst abweichen: zwei IDs (`shared.nav.termin`, `shared.nav.termin_mobile`).
  - Leistungs-Dropdown/Footer-Labels (`.map`): `shared.leistungenmenu.0..5.label`.
  - Utility-Leiste: Telefon → `<PhoneText id="shared.tel_display"/>`, E-Mail → `<EmailText/>`, Slogan → `<Editable id="shared.utilitybar.slogan">`.
  - Footer: `shared.footer.description` (Editable), Spaltenüberschriften `shared.footer.leistungen.heading`/`shared.footer.kontakt.heading`, Telefon `<PhoneText/>`, E-Mail `<EmailText/>`, Adresse `<AddressBlock variant="br"/>`, `shared.footer.copyright`, Rechtslinks-Texte `shared.footer.impressum`/`shared.footer.datenschutz`, Credit `shared.footer.credit` (rich, `<a>` bleibt struktur → Text „Axion Studio" als eigenes `<Editable>` innerhalb des `<a>`; „Designed by " als `plain` davor).

  Beispiel (Footer-Telefon vorher/nachher):
  ```tsx
  // vorher: <a href="tel:+4951517107093" className="…">05151 7107093</a>
  // nachher:
  <PhoneText id="shared.tel_display" className="…" />
  ```

- [ ] **Step 3: Build + Browser** — `npm run build` → exit 0. Im Edit-Modus in der Fußzeile `shared.tel_display` ändern → Speichern → prüfen, dass die Nummer **im Footer UND in der Utility-Leiste** (beide Vorkommen) gleich ist. `AddressBlock` in Footer ändern → Adresse konsistent.

- [ ] **Step 4: Commit** — `git add -A && git commit -m "Editor: shared.* (Layout Menü/Utility/Footer, Kontakt-SSOT-Bausteine)"`

---

## Tasks 6–18: Seiten-Verdrahtung (eine Task pro Seite)

**Für jede Seite gilt dieselbe Prozedur** (unten). Die exakte Feldliste (ID · kind · element · aktueller Text · Notiz) steht je Seite im Inventar-Dokument `docs/superpowers/plans/2026-07-01-inhalts-editor-content-inventory.md` unter der jeweiligen `### <Datei>`-Überschrift. **Reihenfolge & Item-Zahl:**

| Task | Datei | Items | prefix |
|---|---|---|---|
| 6 | HomePage.tsx | 76 | `home` |
| 7 | LeistungenPage.tsx | 55 | `leistungen` |
| 8 | EntlastungPage.tsx | 38 | `entlastung` |
| 9 | DemenzPage.tsx | 55 | `demenz` |
| 10 | HaushaltPage.tsx | 23 | `haushalt` |
| 11 | VerhinderungspflegePage.tsx | 27 | `verhinderung` |
| 12 | UmwandlungPage.tsx | 52 | `umwandlung` |
| 13 | EinzugsgebietPage.tsx + EinzugsgebietSection.tsx | 3 + 18 | `einzugsgebiet` / `einzugsgebiet-section` |
| 14 | KontaktPage.tsx | 53 | `kontakt` |
| 15 | KarrierePage.tsx | 57 | `karriere` |
| 16 | ImpressumPage.tsx | 26 | `impressum` |
| 17 | DatenschutzPage.tsx | 32 | `datenschutz` |
| 18 | GoogleReviews.tsx + InstagramFeed.tsx | 5 + 7 | `reviews` / `instagram` |

**Prozedur pro Seiten-Task:**

- [ ] **Step 1:** Datei lesen + zugehörige Inventar-Tabelle lesen. Import ergänzen: `import { Editable } from "./editor/Editable";` und bei Bildern `import { EditableImage } from "./editor/EditableImage";`. Kontaktdaten/Menü-Vorkommen auf dieser Seite → shared-Bausteine aus Task 5 (`PhoneText`/`EmailText`/`AddressBlock`/`HoursText`) statt seiten-eigener IDs.
- [ ] **Step 2:** Jede Inventar-Zeile nach den **Wrapping-Regeln** verdrahten:
  - `plain` → `<Editable as="<element>" id="<id>" className="<bisherige Klassen>" style={jakarta falls vorhanden}>Text</Editable>`
  - `rich` → zusätzlich `rich`, nur bei echten `<strong>/<em>`-Betonungen.
  - Hero-H1 mit farbigem span → **splitten** (siehe Beispiel unten).
  - `image` → `<EditableImage id="<id>" src={…} alt="…" altId="<…image.alt falls vorhanden>" className="…" />`.
  - `.map`-Arrays → das gerenderte JSX pro Item mit indizierten IDs umschließen (`…​.<i>.title`). Die Array-Daten selbst bleiben; nur die im JSX ausgegebenen Strings werden zu `<Editable>` mit der Item-ID.
- [ ] **Step 3:** `npm run build` → exit 0.
- [ ] **Step 4:** Playwright: Seite im Edit-Modus öffnen → 3–4 Stichproben-Felder (inkl. 1 Bild, 1 rich-Feld falls vorhanden) ändern → Speichern → Reload → bleibt. Keine Layout-Verschiebung durch die Umrandungen.
- [ ] **Step 5:** Commit — `git add -A && git commit -m "Editor: <Seite> editierbar verdrahtet (<n> Felder)"`

**Konkretes Muster — Hero-H1 mit farbigem Span** (gilt für home/leistungen/entlastung/demenz/haushalt/umwandlung/einzugsgebiet/kontakt/karriere):
```tsx
// vorher:
<h1 className="… leading-[1.15] mb-6" style={jakarta}>
  Sie können nicht immer da sein. <br className="hidden lg:block" />
  <span className="text-[#6FD3D1]">Wir können es.</span>
</h1>
// nachher (span bleibt Struktur; zwei plain-Editables):
<h1 className="… leading-[1.15] mb-6" style={jakarta}>
  <Editable as="span" id="home.hero.line1">Sie können nicht immer da sein.</Editable> <br className="hidden lg:block" />
  <span className="text-[#6FD3D1]"><Editable as="span" id="home.hero.line2">Wir können es.</Editable></span>
</h1>
```

**Konkretes Muster — Consent-Text mit `<Link>`** (kontakt.form.consent, karriere.form.consent.text):
```tsx
// vorher: … Ich stimme der <Link to="/datenschutz">Datenschutzerklärung</Link> zu. …
// nachher:
<Editable as="span" id="kontakt.form.consent.pre">Ich stimme der </Editable>
<Link to="/datenschutz"><Editable as="span" id="kontakt.form.consent.linktext">Datenschutzerklärung</Editable></Link>
<Editable as="span" id="kontakt.form.consent.post"> zu.</Editable>
```

**Konkretes Muster — `.map`-Karten** (home.services.0..5):
```tsx
{[...].map((service, i) => (
  <Link key={i} to={service.link} className="…">
    <div className="…">{service.icon}</div>
    <Editable as="h3" id={`home.services.${i}.title`} className="…" style={jakarta}>{service.title}</Editable>
    <Editable as="p" id={`home.services.${i}.desc`} className="…">{service.desc}</Editable>
    <span className="…">Mehr erfahren <ArrowRight size={16} /></span>
  </Link>
))}
```
(Die `id` nutzt den Map-Index `i`; `service.title`/`service.desc` bleiben Default. Icons/Links bleiben Struktur.)

**Umwandlungs-Tabelle (Task 12):** Die 20 Betrags-/Datenzellen + 4 Mobile-Labels laut Inventar mit `umwandlung.tabelle.*`-IDs als `plain`-Editables verdrahten (Zahlen sind Text). Desktop-`th` und Mobile-Label teilen sich je eine ID, damit Kopf & Mobile-Label synchron bleiben.

---

## Task 19: Gesamt-Verifikation, Doku, Deploy

**Files:**
- Modify: `CLAUDE.md` (Routing-Tabelle + Backend-Routen + Editor-Abschnitt), evtl. `docs/`.

- [ ] **Step 1: Voller Build** — `npm run build` → exit 0, keine Warnungen zu fehlenden Imports.
- [ ] **Step 2: Sicherheits-Checks (Browser + curl)**
  - XSS: rich-Feld mit `<script>` speichern → im öffentlichen Render als Text sichtbar, **nicht** ausgeführt (Konsole ohne Alert).
  - Supabase-Ausfall: im Devtools `/site-content` blocken → Seite zeigt Code-Defaults, keine Fehler/Blank.
  - Rate-Limit: 10× falsches Passwort auf `/admin` → 429/Sperre.
  - `/admin` `noindex`-Meta vorhanden (Devtools `<head>`).
- [ ] **Step 3: Cross-Page-Konsistenz** — `shared.tel_display` ändern → auf Home, Kontakt, Impressum, Footer, Utility-Leiste identisch. `shared.address.*` ändern → alle 7 Vorkommen konsistent.
- [ ] **Step 4: Mobile-Browser-Check** (Playwright viewport 390×844) — Toolbar bedienbar, Umrandungen sichtbar, keine horizontale Verschiebung.
- [ ] **Step 5: Doku** — `CLAUDE.md`: neue Route `/admin`, Backend-Routen `/site-content` (GET/save/image), Secret `EDIT_PASSWORD`, Bucket `site-content`, KV-Keys. Kurzanleitung „Bedienen" (wie SETUP-CMS.md bei de Vries, an CuraDoma angepasst).
- [ ] **Step 6: Deploy (nur auf „deploy" des Nutzers)** — Edge Function ist aus Task 1 bereits deployt; Frontend: `git push` → GitHub-Action → live prüfen (curadoma.de: `/admin`, ein Feld ändern, Reload, Inkognito).
- [ ] **Step 7: Memory** — Feedback-Memory ergänzen: „React-SPA-Inhalts-Editor via Supabase-Overlay (Defaults im Code, Deltas in KV, shared.* für Kontaktdaten)".

---

## Self-Review-Notiz

Spec-Abdeckung geprüft: Bedien-Ablauf (Task 4), Frontend-Bausteine (2–5), Backend-Routen (1), ID-Schema/Inventar (Companion-Doc), Sicherheit (1 + 19), Historie/Rückgängig (1 restore + Toolbar), Umfang alle Seiten (6–18), shared.* (5), Einrichtung/Secret/Bucket (1), Testkriterien (4/5/19). Kein Test-Framework → Verifikation als Build/Browser/curl (in Global Constraints begründet). Offener bewusster YAGNI-Punkt: alt-Text-Inline-Bearbeitung (in EditableImage vorbereitet via `altId`, aber v1 nicht aktiv bearbeitbar).
