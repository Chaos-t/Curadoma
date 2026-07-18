# Admin-Panel Runde 1 — Backoffice · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dem Betreiber ein passwortgeschütztes Backoffice geben, das die bereits im KV liegenden Kontaktanfragen, Bewerbungen und Terminanfragen sichtbar und verwaltbar macht (Status, Notiz, Archiv, Löschen, CV-Download, CSV-Export).

**Architecture:** Ansatz A aus der Spec — die bestehende Edge Function `make-server-ec6100a6` bekommt fünf neue **authentifizierte** Routen (Auth-Muster identisch zu `site-content/save`); die SPA bekommt einen `AdminProvider` (Passwort im Speicher) und einen Dashboard-Bereich unter `/admin`. Sicherheitskritische, reine Logik wird in ein importierbares Modul `admin_util.ts` ausgelagert und mit Nodes eingebautem Test-Runner unit-getestet.

**Tech Stack:** React 18 + react-router 7 + Vite 6 + Tailwind v4 (Inline-Hex, kein Token-System) · Supabase Edge Function (Deno + Hono) · `kv_store_ec6100a6` · Node 24 built-in test runner (`node --test`, Type-Stripping) für reine Helfer.

## Global Constraints

- **UI-Texte deutsch** (Labels, Buttons, Fehlermeldungen, Status).
- **Markenpalette (Hex-Literale in Tailwind arbitrary values):** Primär `#6FD3D1`, Hover `#5BC2C0`, Mint-Fläche `#DFF7F8`, Mint-Rand `#BFEAF2`, Karten-Rand `#E5F4F5`, Seiten-BG `#F8FEFF`, Text `#111111`, Muted `#5F6B73`, Hinweis `#9AA3A8`, Warn/Rot `#d7120a`. **Für Text/Icons im Admin lesbareres Türkis `#0F7C77` statt `#6FD3D1`** (Kontrast).
- **Headings:** `style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}` (Konstante `jakarta`). Body erbt Inter aus dem Layout.
- **Lucide-Icons:** `strokeWidth={1.5}`.
- **Kein** shadcn/ui in neue Seiten ziehen; rohe `<button>`/`<div>` + Tailwind.
- **Kein** tsconfig / kein `tsc`-Schritt — Verifikation im Browser, nicht per Typecheck.
- **Nicht anfassen:** `utils/supabase/info.tsx`, Route-Slugs, der Figma-Make-Vertrag.
- **Function-Verzeichnisname muss `make-server-ec6100a6` bleiben** (Routing-Präfix).
- **`/admin/appointment-action` bleibt `--no-verify-jwt`-deploybar** — an der Deploy-Weise nichts ändern.
- **Auth-Muster für ALLE neuen Routen (verbindlich):** `EDIT_PW`-Gate → 503 wenn leer; `editRateLimited(editorClientIp)` fail-closed → 429; `ctEq(password, EDIT_PW)` sonst `editBumpFail` + 600 ms Delay + 401. PII **nie** ohne bestandene Passwortprüfung.
- **`type` streng aus `contact|job|appointment`** (feste Prefixe), **`id` per UUID-Regex** vor KV-Key-Bau, **`admin_note` escaped + ≤ 2000**, **`admin_status` strenges Enum**, **CSV mit Formel-Injection-Schutz**, **`token` (Termine) nie an den Client zurückgeben**.
- **Commits lokal auf Feature-Branch** `feature/admin-backoffice`; **push/Function-Deploy nur nach ausdrücklicher Freigabe des Nutzers** (Live-Seite curadoma.de).

## Testing & Umgebung (verbindlich lesen)

- **Reine Helfer** (`admin_util.ts`): `node --test "supabase/functions/make-server-ec6100a6/admin_util.test.ts"` — Node 24 strippt Typen, importiert `./admin_util.ts`. Läuft ohne neue Abhängigkeit und ohne Deno.
- **Endpunkte (E2E):** curl gegen die Function. Lokal via `supabase functions serve` **falls Docker verfügbar**, sonst gegen die (pro Runde freigegebene) Deploy-URL. Angriffs-Suite je Route unten. Test-Datensätze werden am Ende über die eigene `/admin/delete`-Route wieder entfernt.
- **Frontend:** `npm run dev` (Port 5173) + Browser. Login mit einem Test-`EDIT_PASSWORD`. Round-trip prüfen (Aktion → neu laden → Zustand korrekt).
- **`FN_BASE`** in curl-Beispielen = `https://gjcleedoysndaagtsqjb.supabase.co/functions/v1/make-server-ec6100a6` (oder `http://localhost:54321/functions/v1/make-server-ec6100a6` bei `functions serve`). **`$ANON`** = anon key aus `utils/supabase/info.tsx`. **`$PW`** = Test-`EDIT_PASSWORD`.

---

### Task 1: Reine Server-Helfer + Unit-Tests (`admin_util.ts`)

**Files:**
- Create: `supabase/functions/make-server-ec6100a6/admin_util.ts`
- Test: `supabase/functions/make-server-ec6100a6/admin_util.test.ts`

**Interfaces:**
- Produces: `type AdminType = "contact"|"job"|"appointment"`, `ADMIN_TYPES`, `isAdminType(t): t is AdminType`, `prefixFor(t): string`, `keyFor(t,id): string`, `isUuid(s): boolean`, `ADMIN_STATUSES`, `isAdminStatus(s): boolean`, `sanitizeNote(s): string` (escape + ≤2000), `yesNo(v): string`, `csvCell(v): string`, `buildCsv(headers: string[], rows: string[][]): string`, `CSV_COLUMNS: Record<AdminType, Array<[string,string]>>`.

- [ ] **Step 1: Write the failing tests** — `admin_util.test.ts`

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_TYPES, isAdminType, prefixFor, keyFor, isUuid,
  ADMIN_STATUSES, isAdminStatus, sanitizeNote, yesNo, csvCell, buildCsv, CSV_COLUMNS,
} from "./admin_util.ts";

test("type guard + prefixes + key", () => {
  assert.deepEqual(ADMIN_TYPES, ["contact", "job", "appointment"]);
  assert.ok(isAdminType("contact"));
  assert.ok(!isAdminType("evil"));
  assert.ok(!isAdminType(123));
  assert.equal(prefixFor("job"), "job_application:");
  assert.equal(keyFor("appointment", "abc"), "appointment:abc");
});

test("uuid validation", () => {
  assert.ok(isUuid("123e4567-e89b-12d3-a456-426614174000"));
  assert.ok(!isUuid("123e4567"));
  assert.ok(!isUuid("../../secret"));
  assert.ok(!isUuid(undefined));
});

test("admin status enum", () => {
  assert.deepEqual([...ADMIN_STATUSES], ["neu", "in_bearbeitung", "erledigt"]);
  assert.ok(isAdminStatus("erledigt"));
  assert.ok(!isAdminStatus("gelöscht"));
});

test("sanitizeNote escapes html and caps length", () => {
  assert.equal(sanitizeNote("<script>alert(1)</script>"), "&lt;script&gt;alert(1)&lt;/script&gt;");
  assert.equal(sanitizeNote('a"b&c'), "a&quot;b&amp;c");
  assert.equal(sanitizeNote("x".repeat(3000)).length, 2000);
  assert.equal(sanitizeNote(null), "");
});

test("csvCell guards formula injection and quotes", () => {
  assert.equal(csvCell("=SUM(A1)"), "'=SUM(A1)");
  assert.equal(csvCell("+49 5151"), "'+49 5151");
  assert.equal(csvCell("-1"), "'-1");
  assert.equal(csvCell("@x"), "'@x");
  assert.equal(csvCell("normal"), "normal");
  assert.equal(csvCell('a,"b"\nc'), '"a,""b""\nc"');
  assert.equal(csvCell(null), "");
});

test("buildCsv joins with CRLF and escapes", () => {
  const out = buildCsv(["A", "B"], [["1", "=2"], ["x,y", "z"]]);
  assert.equal(out, 'A,B\r\n1,\'=2\r\n"x,y",z');
});

test("yesNo + column specs", () => {
  assert.equal(yesNo(true), "Ja");
  assert.equal(yesNo(false), "Nein");
  assert.ok(CSV_COLUMNS.contact.length > 0);
  assert.ok(CSV_COLUMNS.job.some(([h]) => h === "Lebenslauf"));
  assert.ok(!JSON.stringify(CSV_COLUMNS.appointment).includes("token"));
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd "C:/Users/Tolun/CuraDoma/Curadoma" && node --test "supabase/functions/make-server-ec6100a6/admin_util.test.ts"`
Expected: FAIL — `Cannot find module './admin_util.ts'`.

- [ ] **Step 3: Write `admin_util.ts`** (pure, NO runtime imports)

```ts
// Pure, dependency-free helpers for the admin backoffice routes.
// No runtime imports → importable by both Deno (index.ts) and Node (tests).

export type AdminType = "contact" | "job" | "appointment";
export const ADMIN_TYPES: AdminType[] = ["contact", "job", "appointment"];

const PREFIX: Record<AdminType, string> = {
  contact: "contact_message:",
  job: "job_application:",
  appointment: "appointment:",
};

export function isAdminType(t: unknown): t is AdminType {
  return typeof t === "string" && (ADMIN_TYPES as string[]).includes(t);
}
export function prefixFor(t: AdminType): string { return PREFIX[t]; }
export function keyFor(t: AdminType, id: string): string { return PREFIX[t] + id; }

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(s: unknown): s is string {
  return typeof s === "string" && UUID_RE.test(s);
}

export const ADMIN_STATUSES = ["neu", "in_bearbeitung", "erledigt"] as const;
export function isAdminStatus(s: unknown): boolean {
  return typeof s === "string" && (ADMIN_STATUSES as readonly string[]).includes(s);
}

export const MAX_NOTE = 2000;
export function sanitizeNote(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .slice(0, MAX_NOTE);
}

export function yesNo(v: unknown): string { return v ? "Ja" : "Nein"; }

// CSV (RFC 4180) with spreadsheet formula-injection guard.
export function csvCell(v: unknown): string {
  const s = String(v ?? "");
  const guarded = /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
  return /[",\n\r]/.test(guarded) ? '"' + guarded.replace(/"/g, '""') + '"' : guarded;
}
export function buildCsv(headers: string[], rows: string[][]): string {
  return [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
}

// Per-type CSV columns: [Header, recordKey]. Sensitive/internal fields
// (appointment `token`) are intentionally excluded.
export const CSV_COLUMNS: Record<AdminType, Array<[string, string]>> = {
  contact: [
    ["Eingegangen", "created_at"], ["Status", "admin_status"], ["Name", "name"],
    ["E-Mail", "email"], ["Telefon", "phone"], ["Betreff", "subject"],
    ["Nachricht", "message"], ["Seite", "page_source"], ["Notiz", "admin_note"],
  ],
  job: [
    ["Eingegangen", "created_at"], ["Status", "admin_status"], ["Position", "job"],
    ["Name", "name"], ["E-Mail", "email"], ["Telefon", "phone"], ["Wohnort", "city"],
    ["Arbeitszeit", "working_hours"], ["Frühester Beginn", "earliest_start"],
    ["Führerschein", "drivers_license"], ["Eigener PKW", "has_car"],
    ["Motivation", "motivation"], ["Lebenslauf", "cv_filename"], ["Notiz", "admin_note"],
  ],
  appointment: [
    ["Eingegangen", "created_at"], ["Buchungsstatus", "status"], ["Status", "admin_status"],
    ["Leistung", "service"], ["Datum", "appt_date"], ["Uhrzeit", "appt_time"],
    ["Name", "name"], ["E-Mail", "email"], ["Telefon", "phone"],
    ["Nachricht", "message"], ["Notiz", "admin_note"],
  ],
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test "supabase/functions/make-server-ec6100a6/admin_util.test.ts"`
Expected: PASS — `pass 7  fail 0`.

- [ ] **Step 5: Commit**

```bash
git checkout -b feature/admin-backoffice   # only if not already on it
git add supabase/functions/make-server-ec6100a6/admin_util.ts supabase/functions/make-server-ec6100a6/admin_util.test.ts
git commit -m "feat(admin): pure backoffice helpers (types, uuid, note, csv) + tests"
```

---

### Task 2: `adminGate` + `POST /admin/list`

**Files:**
- Modify: `supabase/functions/make-server-ec6100a6/index.ts` (Import oben ergänzen; Block vor `Deno.serve(app.fetch)` einfügen)

**Interfaces:**
- Consumes (bereits vorhanden in index.ts): `EDIT_PW`, `ctEq`, `editorClientIp`, `editRateLimited`, `editBumpFail`, `createClient`, `CV_BUCKET`, `fmtDateDe`, `kv`.
- Produces: `adminGate(c)` → `{body}` | `{res}`; `publicAdminRecord(type, r)`; Route `POST /make-server-ec6100a6/admin/list`.

- [ ] **Step 1: Import ergänzen** — oben in `index.ts` bei den Imports:

```ts
import {
  isAdminType, isAdminStatus, isUuid, keyFor, prefixFor,
  sanitizeNote, buildCsv, CSV_COLUMNS, yesNo, type AdminType,
} from "./admin_util.ts";
```

- [ ] **Step 2: Auth-Gate + list-Route** — direkt VOR `Deno.serve(app.fetch);` einfügen:

```ts
// --- Backoffice (Admin) -----------------------------------------------------
// Auth-Gate wie site-content/save: EDIT_PW → Rate-Limit(fail-closed) → ctEq.
// Gibt bei Erfolg {body}, sonst {res} (sofort zurückgeben).
async function adminGate(
  c: Parameters<Parameters<typeof app.post>[1]>[0],
): Promise<{ body: any } | { res: Response }> {
  if (!EDIT_PW) return { res: c.json({ error: "not_configured" }, 503) };
  const ip = editorClientIp(c);
  if (await editRateLimited(ip)) return { res: c.json({ error: "rate_limited" }, 429) };
  let body: any;
  try { body = await c.req.json(); } catch { return { res: c.json({ error: "bad_json" }, 400) }; }
  if (typeof body.password !== "string" || !ctEq(body.password, EDIT_PW)) {
    await editBumpFail(ip);
    await new Promise((r) => setTimeout(r, 600));
    return { res: c.json({ error: "unauthorized" }, 401) };
  }
  return { body };
}

// Strip fields the admin client must never receive (appointment action token).
function publicAdminRecord(type: AdminType, r: any): any {
  if (type === "appointment" && r && typeof r === "object") {
    const { token, ...rest } = r;
    return rest;
  }
  return r;
}

async function loadSorted(type: AdminType, includeArchived: boolean): Promise<any[]> {
  let items = (await kv.getByPrefix(prefixFor(type))) as any[];
  if (!includeArchived) items = items.filter((r) => !r?.admin_archived);
  items.sort((a, b) => String(b?.created_at ?? "").localeCompare(String(a?.created_at ?? "")));
  return items;
}

app.post("/make-server-ec6100a6/admin/list", async (c) => {
  const g = await adminGate(c);
  if ("res" in g) return g.res;
  const type = g.body.type;
  if (!isAdminType(type)) return c.json({ error: "bad_type" }, 400);
  const items = await loadSorted(type, Boolean(g.body.includeArchived));
  return c.json({ items: items.map((r) => publicAdminRecord(type, r)) });
});
```

- [ ] **Step 3: Syntax-Check der Function**

Run: `cd "C:/Users/Tolun/CuraDoma/Curadoma" && node --check "supabase/functions/make-server-ec6100a6/admin_util.ts" && echo "admin_util OK"`
(Die `index.ts` selbst nutzt Deno-`npm:`/`jsr:`-Imports und ist mit `node --check` nicht prüfbar; sie wird per `functions serve`/Deploy geladen. Reine-Helfer-Datei prüfen genügt hier.)
Expected: `admin_util OK`.

- [ ] **Step 4: E2E — list-Route (nach `functions serve` ODER freigegebenem Deploy)**

Vorbereitung: ein Test-Datensatz existiert (z. B. via bestehendem Kontaktformular auf `/kontakt` einen Testeintrag senden, oder direkt einen `contact_message:<uuid>` ins KV schreiben). Dann:

```bash
# korrekt:
curl -s -X POST "$FN_BASE/admin/list" -H "Authorization: Bearer $ANON" \
  -H "Content-Type: application/json" -d "{\"password\":\"$PW\",\"type\":\"contact\"}" | head -c 400
# → {"items":[ ... ]}   (bei Terminen: kein "token" im JSON!)

# Angriffe:
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$FN_BASE/admin/list" -H "Authorization: Bearer $ANON" \
  -H "Content-Type: application/json" -d '{"password":"falsch","type":"contact"}'          # → 401 (nach ~600ms)
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$FN_BASE/admin/list" -H "Authorization: Bearer $ANON" \
  -H "Content-Type: application/json" -d "{\"password\":\"$PW\",\"type\":\"evil\"}"          # → 400
curl -s -X POST "$FN_BASE/admin/list" -H "Authorization: Bearer $ANON" \
  -H "Content-Type: application/json" -d '{"type":"contact"}' | head -c 80                   # → 401 (kein Passwort)
```
Expected: korrekt = `{"items":[…]}` ohne `token`; falsch = `401`; evil = `400`; ohne PW = `401`.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/make-server-ec6100a6/index.ts
git commit -m "feat(admin): authenticated /admin/list endpoint + adminGate"
```

---

### Task 3: `POST /admin/update`

**Files:**
- Modify: `supabase/functions/make-server-ec6100a6/index.ts` (nach der list-Route)

**Interfaces:**
- Consumes: `adminGate`, `publicAdminRecord`, `isAdminType`, `isUuid`, `isAdminStatus`, `sanitizeNote`, `keyFor`, `kv`.
- Produces: Route `POST /make-server-ec6100a6/admin/update`.

- [ ] **Step 1: Route einfügen**

```ts
app.post("/make-server-ec6100a6/admin/update", async (c) => {
  const g = await adminGate(c);
  if ("res" in g) return g.res;
  const { type, id } = g.body;
  if (!isAdminType(type)) return c.json({ error: "bad_type" }, 400);
  if (!isUuid(id)) return c.json({ error: "bad_id" }, 400);
  const key = keyFor(type, id);
  const rec = await kv.get(key);
  if (!rec) return c.json({ error: "not_found" }, 404);
  if ("admin_status" in g.body) {
    if (!isAdminStatus(g.body.admin_status)) return c.json({ error: "bad_status" }, 400);
    rec.admin_status = g.body.admin_status;
  }
  if ("admin_note" in g.body) rec.admin_note = sanitizeNote(g.body.admin_note);
  if ("admin_archived" in g.body) rec.admin_archived = Boolean(g.body.admin_archived);
  rec.admin_updated_at = new Date().toISOString();
  await kv.set(key, rec);
  return c.json({ ok: true, item: publicAdminRecord(type, rec) });
});
```

- [ ] **Step 2: E2E — update**

```bash
ID="<existierende-uuid>"
curl -s -X POST "$FN_BASE/admin/update" -H "Authorization: Bearer $ANON" -H "Content-Type: application/json" \
  -d "{\"password\":\"$PW\",\"type\":\"contact\",\"id\":\"$ID\",\"admin_status\":\"in_bearbeitung\",\"admin_note\":\"<b>Test</b>\"}" | head -c 300
# → {"ok":true,"item":{... "admin_status":"in_bearbeitung","admin_note":"&lt;b&gt;Test&lt;/b&gt;" ...}}

# Angriffe:
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$FN_BASE/admin/update" -H "Authorization: Bearer $ANON" \
  -H "Content-Type: application/json" -d "{\"password\":\"$PW\",\"type\":\"contact\",\"id\":\"nope\"}"                       # → 400 (bad_id)
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$FN_BASE/admin/update" -H "Authorization: Bearer $ANON" \
  -H "Content-Type: application/json" -d "{\"password\":\"$PW\",\"type\":\"contact\",\"id\":\"$ID\",\"admin_status\":\"x\"}" # → 400 (bad_status)
```
Expected: Notiz kommt **escaped** zurück; ungültige id/status → 400.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/make-server-ec6100a6/index.ts
git commit -m "feat(admin): /admin/update (status, note, archive) with validation"
```

---

### Task 4: `POST /admin/delete` + `POST /admin/cv-url`

**Files:**
- Modify: `supabase/functions/make-server-ec6100a6/index.ts`

**Interfaces:**
- Consumes: `adminGate`, `isAdminType`, `isUuid`, `keyFor`, `kv`, `createClient`, `CV_BUCKET`.
- Produces: Routen `POST /admin/delete`, `POST /admin/cv-url`.

- [ ] **Step 1: Routen einfügen**

```ts
app.post("/make-server-ec6100a6/admin/delete", async (c) => {
  const g = await adminGate(c);
  if ("res" in g) return g.res;
  const { type, id } = g.body;
  if (!isAdminType(type)) return c.json({ error: "bad_type" }, 400);
  if (!isUuid(id)) return c.json({ error: "bad_id" }, 400);
  const key = keyFor(type, id);
  const rec = await kv.get(key);
  if (rec && type === "job" && rec.cv_path) {
    try {
      const url = Deno.env.get("SUPABASE_URL"), sk = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (url && sk) await createClient(url, sk).storage.from(CV_BUCKET).remove([rec.cv_path]);
    } catch (e) { console.log("CV delete failed:", e); }
  }
  await kv.del(key);            // idempotent: löscht auch, wenn rec fehlt
  return c.json({ ok: true });
});

app.post("/make-server-ec6100a6/admin/cv-url", async (c) => {
  const g = await adminGate(c);
  if ("res" in g) return g.res;
  const { id } = g.body;
  if (!isUuid(id)) return c.json({ error: "bad_id" }, 400);
  const rec = await kv.get(keyFor("job", id));
  if (!rec || !rec.cv_path) return c.json({ error: "no_cv" }, 404);
  const url = Deno.env.get("SUPABASE_URL"), sk = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !sk) return c.json({ error: "storage_not_configured" }, 503);
  const { data, error } = await createClient(url, sk).storage.from(CV_BUCKET)
    .createSignedUrl(rec.cv_path, 600, { download: rec.cv_filename || true }); // 10 min
  if (error || !data?.signedUrl) return c.json({ error: "sign_failed" }, 500);
  return c.json({ url: data.signedUrl });
});
```

- [ ] **Step 2: E2E — cv-url + delete (Reihenfolge: erst cv-url testen, dann löschen)**

```bash
JOBID="<bewerbung-uuid-mit-cv>"
curl -s -X POST "$FN_BASE/admin/cv-url" -H "Authorization: Bearer $ANON" -H "Content-Type: application/json" \
  -d "{\"password\":\"$PW\",\"id\":\"$JOBID\"}" | head -c 200   # → {"url":"https://…/object/sign/…"}  (Link ~10 min)

DELID="<throwaway-uuid>"
curl -s -X POST "$FN_BASE/admin/delete" -H "Authorization: Bearer $ANON" -H "Content-Type: application/json" \
  -d "{\"password\":\"$PW\",\"type\":\"contact\",\"id\":\"$DELID\"}"   # → {"ok":true}
# erneut löschen → weiterhin {"ok":true} (idempotent)
```
Expected: gültiger Signed-Link; delete idempotent `{"ok":true}`.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/make-server-ec6100a6/index.ts
git commit -m "feat(admin): /admin/delete (KV + CV file) and /admin/cv-url (short-lived)"
```

---

### Task 5: `POST /admin/export` (CSV)

**Files:**
- Modify: `supabase/functions/make-server-ec6100a6/index.ts`

**Interfaces:**
- Consumes: `adminGate`, `isAdminType`, `loadSorted`, `CSV_COLUMNS`, `buildCsv`, `yesNo`, `fmtDateDe`.
- Produces: Route `POST /admin/export` → `text/csv`.

- [ ] **Step 1: Route einfügen**

```ts
app.post("/make-server-ec6100a6/admin/export", async (c) => {
  const g = await adminGate(c);
  if ("res" in g) return g.res;
  const type = g.body.type;
  if (!isAdminType(type)) return c.json({ error: "bad_type" }, 400);
  const items = await loadSorted(type, Boolean(g.body.includeArchived));
  const cols = CSV_COLUMNS[type];
  const boolKeys = new Set(["drivers_license", "has_car"]);
  const headers = cols.map(([h]) => h);
  const rows = items.map((r) => cols.map(([, k]) => {
    if (k === "created_at") return r[k] ? fmtDateDe(String(r[k])) : "";
    if (k === "admin_status") return String(r[k] ?? "neu");
    if (boolKeys.has(k)) return yesNo(r[k]);
    return r[k] == null ? "" : String(r[k]);
  }));
  const csv = "﻿" + buildCsv(headers, rows); // UTF-8 BOM für Excel
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cura-doma-${type}.csv"`,
    },
  });
});
```

- [ ] **Step 2: E2E — Export inkl. Injection-Probe**

Vorher einen Test-Kontakt mit Name `=HYPERLINK("http://evil")` senden (über `/kontakt` scheitert Namensvalidierung — daher direkt ins KV schreiben oder Feld `subject` nutzen). Dann:

```bash
curl -s -X POST "$FN_BASE/admin/export" -H "Authorization: Bearer $ANON" -H "Content-Type: application/json" \
  -d "{\"password\":\"$PW\",\"type\":\"contact\"}" | head -c 300
```
Expected: erste Bytes = BOM + `Eingegangen,Status,Name,…`; die Formel-Zelle beginnt mit `'=HYPERLINK…` (führendes Apostroph); Kommas/Anführungszeichen korrekt gequotet.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/make-server-ec6100a6/index.ts
git commit -m "feat(admin): /admin/export CSV with BOM + formula-injection guard"
```

---

### Task 6: Frontend-Lib `AdminProvider` (`src/lib/admin.tsx`) + App-Einbindung

**Files:**
- Create: `src/lib/admin.tsx`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes: `FN_BASE`, `FN_ANON` aus `src/lib/booking.ts`.
- Produces: `useAdmin()` → `{ authed, login, logout, pw, list, update, remove, cvUrl, exportCsv }`; `AdminProvider`; `type AdminType`.

- [ ] **Step 1: `src/lib/admin.tsx` schreiben**

```tsx
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { FN_BASE, FN_ANON } from "./booking";

export type AdminType = "contact" | "job" | "appointment";
export type LoginResult = "ok" | "bad" | "rate" | "unconfigured" | "error";

function post(path: string, body: unknown): Promise<Response> {
  return fetch(`${FN_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${FN_ANON}` },
    body: JSON.stringify(body),
  });
}

type Patch = Partial<{ admin_status: string; admin_note: string; admin_archived: boolean }>;
type AdminCtx = {
  authed: boolean;
  login: (pw: string) => Promise<LoginResult>;
  logout: () => void;
  pw: () => string;
  list: (type: AdminType, includeArchived?: boolean) => Promise<any[]>;
  update: (type: AdminType, id: string, patch: Patch) => Promise<any>;
  remove: (type: AdminType, id: string) => Promise<void>;
  cvUrl: (id: string) => Promise<string | null>;
  exportCsv: (type: AdminType, includeArchived?: boolean) => Promise<void>;
};
const Ctx = createContext<AdminCtx | null>(null);
export function useAdmin(): AdminCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAdmin must be used within <AdminProvider>");
  return c;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const pwRef = useRef("");
  const [authed, setAuthed] = useState(false);

  const login = useCallback(async (p: string): Promise<LoginResult> => {
    try {
      const res = await post("/site-content/save", { password: p, action: "__check" });
      if (res.status === 401) return "bad";
      if (res.status === 429) return "rate";
      if (res.status === 503) return "unconfigured";
      if (res.ok) { pwRef.current = p; setAuthed(true); return "ok"; }
      return "error";
    } catch { return "error"; }
  }, []);

  const logout = useCallback(() => { pwRef.current = ""; setAuthed(false); }, []);
  const pw = useCallback(() => pwRef.current, []);

  const list = useCallback(async (type: AdminType, includeArchived = false) => {
    const res = await post("/admin/list", { password: pwRef.current, type, includeArchived });
    if (!res.ok) throw new Error(String(res.status));
    return ((await res.json()).items ?? []) as any[];
  }, []);

  const update = useCallback(async (type: AdminType, id: string, patch: Patch) => {
    const res = await post("/admin/update", { password: pwRef.current, type, id, ...patch });
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()).item;
  }, []);

  const remove = useCallback(async (type: AdminType, id: string) => {
    const res = await post("/admin/delete", { password: pwRef.current, type, id });
    if (!res.ok) throw new Error(String(res.status));
  }, []);

  const cvUrl = useCallback(async (id: string) => {
    const res = await post("/admin/cv-url", { password: pwRef.current, id });
    if (!res.ok) return null;
    return ((await res.json()).url ?? null) as string | null;
  }, []);

  const exportCsv = useCallback(async (type: AdminType, includeArchived = false) => {
    const res = await post("/admin/export", { password: pwRef.current, type, includeArchived });
    if (!res.ok) throw new Error(String(res.status));
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `cura-doma-${type}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <Ctx.Provider value={{ authed, login, logout, pw, list, update, remove, cvUrl, exportCsv }}>
      {children}
    </Ctx.Provider>
  );
}
```

- [ ] **Step 2: `src/app/App.tsx` — AdminProvider um ContentProvider legen**

```tsx
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ContentProvider } from "../lib/content";
import { AdminProvider } from "../lib/admin";
import { EditToolbar } from "./components/editor/EditToolbar";

export default function App() {
  return (
    <AdminProvider>
      <ContentProvider>
        <RouterProvider router={router} />
        <EditToolbar />
      </ContentProvider>
    </AdminProvider>
  );
}
```

- [ ] **Step 3: Build-Check**

Run: `cd "C:/Users/Tolun/CuraDoma/Curadoma" && npm run build`
Expected: Build erfolgreich (kein Import-Fehler).

- [ ] **Step 4: Commit**

```bash
git add src/lib/admin.tsx src/app/App.tsx
git commit -m "feat(admin): AdminProvider (in-memory password) + data client, wired into App"
```

---

### Task 7: Routing + `AdminArea` + `AdminLoginForm`

**Files:**
- Create: `src/app/components/admin/AdminArea.tsx`
- Create: `src/app/components/admin/AdminLoginForm.tsx`
- Modify: `src/app/routes.tsx`
- Delete: `src/app/components/AdminLoginPage.tsx` (ersetzt)

**Interfaces:**
- Consumes: `useAdmin()`.
- Produces: `AdminArea` (Route-Element für `path:"admin"`, setzt noindex, gated), `AdminLoginForm`.

- [ ] **Step 1: `AdminLoginForm.tsx`** (aus AdminLoginPage abgeleitet, nutzt `useAdmin().login`)

```tsx
import { useState } from "react";
import { useAdmin } from "../../../lib/admin";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export function AdminLoginForm() {
  const { login } = useAdmin();
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function go() {
    if (!pw) { setMsg("Bitte Passwort eingeben."); return; }
    setBusy(true); setMsg("Prüfe Passwort …");
    const r = await login(pw);
    if (r === "ok") return;                       // AdminArea rendert danach das Dashboard
    setBusy(false);
    setMsg(
      r === "bad" ? "Falsches Passwort." :
      r === "rate" ? "Zu viele Versuche — bitte später erneut." :
      r === "unconfigured" ? "Verwaltung ist noch nicht eingerichtet." :
      "Verbindungsfehler.",
    );
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-[#E5F4F5] shadow-[0_20px_60px_rgb(191,234,242,0.3)] p-8" style={jakarta}>
        <h1 className="text-2xl font-medium text-[#111111] mb-1">Verwaltung</h1>
        <p className="text-sm text-[#5F6B73] font-light mb-6">Passwort eingeben, um Anfragen, Bewerbungen und Termine zu verwalten.</p>
        <input type="password" value={pw} autoComplete="current-password"
          onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-xl border border-[#E5F4F5] bg-[#F8FEFF] mb-3 outline-none focus:border-[#6FD3D1]" />
        <button onClick={go} disabled={busy}
          className="w-full bg-[#0F7C77] text-white hover:bg-[#0c6a66] disabled:opacity-50 py-3 rounded-full font-medium transition-colors">
          Anmelden
        </button>
        <p className="text-xs mt-3 min-h-[1.2em] text-[#5F6B73]">{msg}</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: `AdminArea.tsx`** (noindex + Auth-Gate)

```tsx
import { useEffect } from "react";
import { Outlet } from "react-router";
import { useAdmin } from "../../../lib/admin";
import { AdminLoginForm } from "./AdminLoginForm";

export function AdminArea() {
  const { authed } = useAdmin();
  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex,nofollow";
    document.head.appendChild(m);
    return () => { document.head.removeChild(m); };
  }, []);
  return authed ? <Outlet /> : <AdminLoginForm />;
}
```

- [ ] **Step 3: `routes.tsx` umstellen** — Import `AdminLoginPage` entfernen, neue Admin-Imports + verschachtelte Route:

```tsx
// entfernen: import { AdminLoginPage } from "./components/AdminLoginPage";
import { AdminArea } from "./components/admin/AdminArea";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminInbox } from "./components/admin/AdminInbox";
```
Den bisherigen Eintrag `{ path: "admin", Component: AdminLoginPage }` ersetzen durch:

```tsx
      {
        path: "admin",
        Component: AdminArea,
        children: [
          { index: true, Component: AdminDashboard },
          { path: "anfragen", element: <AdminInbox type="contact" /> },
          { path: "bewerbungen", element: <AdminInbox type="job" /> },
          { path: "termine", element: <AdminInbox type="appointment" /> },
        ],
      },
```
*(Hinweis: `AdminDashboard`/`AdminInbox` entstehen in Task 8/9 — bis dahin bleibt der Build rot, wenn diese Dateien fehlen. Daher Task 7→9 zügig hintereinander umsetzen oder in Step 3 vorerst Platzhalter-Exporte anlegen.)*

- [ ] **Step 4: `AdminLoginPage.tsx` löschen** und temporäre Platzhalter anlegen, damit der Build grün ist, bis Task 8/9 sie füllen:

```bash
git rm src/app/components/AdminLoginPage.tsx
```
Platzhalter (werden in Task 8/9 ersetzt):
```tsx
// src/app/components/admin/AdminDashboard.tsx
export function AdminDashboard() { return <div className="p-8">Dashboard folgt</div>; }
```
```tsx
// src/app/components/admin/AdminInbox.tsx
import type { AdminType } from "../../../lib/admin";
export function AdminInbox({ type }: { type: AdminType }) { return <div className="p-8">Inbox {type} folgt</div>; }
```

- [ ] **Step 5: Browser-Verifikation**

Run: `npm run dev` → `http://localhost:5173/admin`
- Ohne Login: Login-Formular „Verwaltung" erscheint; `<meta name="robots" content="noindex,nofollow">` im `<head>` (DevTools prüfen).
- Falsches Passwort → „Falsches Passwort." (nach ~600 ms).
- Korrektes Test-Passwort → „Dashboard folgt" erscheint (Platzhalter).
- `/admin/anfragen` ohne Login → Login-Formular.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/admin/ src/app/routes.tsx
git commit -m "feat(admin): /admin area with noindex + auth gate, nested routes, login form"
```

---

### Task 8: `AdminDashboard` (Kacheln + Zähler + „Seite bearbeiten")

**Files:**
- Modify: `src/app/components/admin/AdminDashboard.tsx` (Platzhalter ersetzen)

**Interfaces:**
- Consumes: `useAdmin()` (`list`, `logout`, `pw`), `useContent()` (`enterEditMode`), `useNavigate`, `Link`.

- [ ] **Step 1: Dashboard implementieren**

```tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Inbox, FileText, CalendarDays, Pencil, LogOut } from "lucide-react";
import { useAdmin, type AdminType } from "../../../lib/admin";
import { useContent } from "../../../lib/content";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

const TILES: Array<{ type: AdminType; to: string; label: string; Icon: typeof Inbox; unit: string }> = [
  { type: "contact", to: "/admin/anfragen", label: "Anfragen", Icon: Inbox, unit: "neu" },
  { type: "job", to: "/admin/bewerbungen", label: "Bewerbungen", Icon: FileText, unit: "neu" },
  { type: "appointment", to: "/admin/termine", label: "Termine", Icon: CalendarDays, unit: "neu" },
];

export function AdminDashboard() {
  const { list, logout, pw } = useAdmin();
  const { enterEditMode } = useContent();
  const navigate = useNavigate();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let alive = true;
    Promise.all(TILES.map(async (t) => {
      try { const items = await list(t.type); return [t.type, items.filter((r) => (r.admin_status ?? "neu") === "neu").length] as const; }
      catch { return [t.type, -1] as const; }
    })).then((pairs) => { if (alive) setCounts(Object.fromEntries(pairs)); });
    return () => { alive = false; };
  }, [list]);

  return (
    <section className="max-w-5xl mx-auto px-6 py-14" style={jakarta}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.16em] uppercase text-[#9AA3A8] mb-1">Cura Doma</p>
          <h1 className="text-3xl font-medium text-[#111111]">Verwaltung</h1>
        </div>
        <button onClick={logout} className="inline-flex items-center gap-2 text-sm text-[#5F6B73] hover:text-[#111111] px-4 py-2 rounded-full border border-[#E5F4F5]">
          <LogOut size={16} strokeWidth={1.5} /> Abmelden
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TILES.map(({ type, to, label, Icon, unit }) => (
          <Link key={type} to={to}
            className="group bg-white rounded-2xl border border-[#E5F4F5] shadow-[0_10px_30px_rgb(191,234,242,0.25)] p-6 hover:border-[#6FD3D1] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#DFF7F8] text-[#0F7C77]"><Icon size={20} strokeWidth={1.5} /></span>
              <span className="text-lg font-medium text-[#111111]">{label}</span>
            </div>
            <div className="text-sm text-[#5F6B73]">
              {counts[type] === undefined ? "lädt …" : counts[type] < 0 ? "—" : <><span className="text-[#0F7C77] font-semibold">{counts[type]}</span> {unit}</>}
            </div>
          </Link>
        ))}

        <button
          onClick={() => { enterEditMode(pw()); navigate("/"); }}
          className="text-left bg-white rounded-2xl border border-[#E5F4F5] shadow-[0_10px_30px_rgb(191,234,242,0.25)] p-6 hover:border-[#6FD3D1] transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#DFF7F8] text-[#0F7C77]"><Pencil size={20} strokeWidth={1.5} /></span>
            <span className="text-lg font-medium text-[#111111]">Seite bearbeiten</span>
          </div>
          <div className="text-sm text-[#5F6B73]">Texte &amp; Bilder direkt auf der Website ändern</div>
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Browser-Verifikation**

`/admin` (eingeloggt): drei Kacheln mit „neu"-Zähler + „Seite bearbeiten". Klick auf „Anfragen" → `/admin/anfragen` (Platzhalter). Klick „Seite bearbeiten" → Startseite im Bearbeitungsmodus (rote Umrandungen, EditToolbar). „Abmelden" → zurück zum Login.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/admin/AdminDashboard.tsx
git commit -m "feat(admin): dashboard hub with new-count tiles + edit-site action"
```

---

### Task 9: `AdminInbox` — Liste, Filter, CSV-Export + `fields`-Konfiguration

**Files:**
- Create: `src/app/components/admin/fields.tsx` (Anzeige-Metadaten je Typ)
- Modify: `src/app/components/admin/AdminInbox.tsx` (Platzhalter ersetzen)

**Interfaces:**
- Produces: `TYPE_META: Record<AdminType, { title: string; columns: Col[]; detail: Field[] }>`; `AdminInbox` rendert Liste + Filter + Export und öffnet `AdminDetail` (Task 10).
- Consumes: `useAdmin()` (`list`, `exportCsv`).

- [ ] **Step 1: `fields.tsx`** (welche Spalten/Detailfelder je Typ)

```tsx
import type { AdminType } from "../../../lib/admin";

export type Col = { key: string; label: string };
export type Field = { key: string; label: string; kind?: "bool" | "date" | "long" };

type Meta = { title: string; columns: Col[]; detail: Field[] };

export const TYPE_META: Record<AdminType, Meta> = {
  contact: {
    title: "Anfragen",
    columns: [
      { key: "created_at", label: "Datum" },
      { key: "name", label: "Name" },
      { key: "subject", label: "Betreff" },
    ],
    detail: [
      { key: "created_at", label: "Eingegangen", kind: "date" },
      { key: "name", label: "Name" }, { key: "email", label: "E-Mail" },
      { key: "phone", label: "Telefon" }, { key: "subject", label: "Betreff" },
      { key: "message", label: "Nachricht", kind: "long" },
      { key: "page_source", label: "Seite" },
    ],
  },
  job: {
    title: "Bewerbungen",
    columns: [
      { key: "created_at", label: "Datum" },
      { key: "name", label: "Name" },
      { key: "city", label: "Wohnort" },
    ],
    detail: [
      { key: "created_at", label: "Eingegangen", kind: "date" },
      { key: "job", label: "Position" }, { key: "name", label: "Name" },
      { key: "email", label: "E-Mail" }, { key: "phone", label: "Telefon" },
      { key: "city", label: "Wohnort" }, { key: "working_hours", label: "Arbeitszeit" },
      { key: "earliest_start", label: "Frühester Beginn" },
      { key: "experience_household_text", label: "Erfahrung Haushalt", kind: "long" },
      { key: "experience_care_text", label: "Erfahrung Pflege", kind: "long" },
      { key: "drivers_license", label: "Führerschein", kind: "bool" },
      { key: "has_car", label: "Eigener PKW", kind: "bool" },
      { key: "motivation", label: "Motivation", kind: "long" },
    ],
  },
  appointment: {
    title: "Termine",
    columns: [
      { key: "created_at", label: "Datum" },
      { key: "name", label: "Name" },
      { key: "service", label: "Leistung" },
    ],
    detail: [
      { key: "created_at", label: "Eingegangen", kind: "date" },
      { key: "status", label: "Buchungsstatus" },
      { key: "service", label: "Leistung" }, { key: "appt_date", label: "Datum" },
      { key: "appt_time", label: "Uhrzeit" }, { key: "name", label: "Name" },
      { key: "email", label: "E-Mail" }, { key: "phone", label: "Telefon" },
      { key: "message", label: "Nachricht", kind: "long" },
    ],
  },
};

export const STATUS_LABELS: Record<string, string> = {
  neu: "neu", in_bearbeitung: "in Bearbeitung", erledigt: "erledigt",
};
export const STATUS_STYLE: Record<string, string> = {
  neu: "bg-[#E1F0F4] text-[#1B6478]",
  in_bearbeitung: "bg-[#FBEFD8] text-[#94620A]",
  erledigt: "bg-[#DFF1E5] text-[#256E45]",
};
export function fmtDate(iso?: string): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  } catch { return iso; }
}
```

- [ ] **Step 2: `AdminInbox.tsx`** (Liste + Filter + Export; Detail via Task 10)

```tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Download, Search } from "lucide-react";
import { useAdmin, type AdminType } from "../../../lib/admin";
import { TYPE_META, STATUS_LABELS, STATUS_STYLE, fmtDate } from "./fields";
import { AdminDetail } from "./AdminDetail";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const STATUS_FILTERS = ["alle", "neu", "in_bearbeitung", "erledigt", "archiviert"] as const;

export function AdminInbox({ type }: { type: AdminType }) {
  const { list, exportCsv } = useAdmin();
  const meta = TYPE_META[type];
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("alle");
  const [selected, setSelected] = useState<any | null>(null);

  const reload = () => {
    setLoading(true); setErr(null);
    list(type, true) // inkl. archivierte; clientseitig filtern
      .then((rows) => setItems(rows))
      .catch(() => setErr("Konnte nicht laden — bitte neu anmelden."))
      .finally(() => setLoading(false));
  };
  useEffect(reload, [type]); // eslint kennt reload nicht; type als Trigger genügt

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((r) => {
      const st = r.admin_status ?? "neu";
      if (status === "archiviert") { if (!r.admin_archived) return false; }
      else { if (r.admin_archived) return false; if (status !== "alle" && st !== status) return false; }
      if (!needle) return true;
      return JSON.stringify(r).toLowerCase().includes(needle);
    });
  }, [items, q, status]);

  return (
    <section className="max-w-5xl mx-auto px-6 py-10" style={jakarta}>
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-[#5F6B73] hover:text-[#111111] mb-4">
        <ArrowLeft size={16} strokeWidth={1.5} /> Übersicht
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-2xl font-medium text-[#111111]">{meta.title}</h1>
        <button onClick={() => exportCsv(type, true).catch(() => setErr("Export fehlgeschlagen."))}
          className="inline-flex items-center gap-2 text-sm text-[#0F7C77] hover:text-white hover:bg-[#0F7C77] border border-[#0F7C77] px-4 py-2 rounded-full transition-colors">
          <Download size={16} strokeWidth={1.5} /> CSV-Export
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA3A8]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suchen …"
            className="pl-9 pr-3 py-2 rounded-full border border-[#E5F4F5] bg-white text-sm outline-none focus:border-[#6FD3D1]" />
        </div>
        {STATUS_FILTERS.map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${status === s ? "bg-[#0F7C77] text-white border-[#0F7C77]" : "border-[#E5F4F5] text-[#5F6B73] hover:border-[#6FD3D1]"}`}>
            {s === "in_bearbeitung" ? "in Bearbeitung" : s === "alle" ? "alle" : s === "archiviert" ? "archiviert" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {err && <p className="text-sm text-[#d7120a] mb-3">{err}</p>}
      {loading ? <p className="text-sm text-[#5F6B73]">lädt …</p> : (
        <div className="bg-white rounded-2xl border border-[#E5F4F5] overflow-hidden">
          {filtered.length === 0 ? <p className="p-6 text-sm text-[#5F6B73]">Keine Einträge.</p> : (
            <ul className="divide-y divide-[#E5F4F5]">
              {filtered.map((r) => {
                const st = r.admin_status ?? "neu";
                return (
                  <li key={r.id}>
                    <button onClick={() => setSelected(r)} className="w-full text-left px-5 py-3.5 hover:bg-[#F8FEFF] flex items-center gap-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${r.admin_archived ? "bg-[#E9EDEC] text-[#5C6B69]" : STATUS_STYLE[st]}`}>
                        {r.admin_archived ? "archiviert" : STATUS_LABELS[st]}
                      </span>
                      {meta.columns.map((c) => (
                        <span key={c.key} className="text-sm text-[#111111] truncate flex-1 min-w-0">
                          {c.key === "created_at" ? fmtDate(r[c.key]) : (r[c.key] || "—")}
                        </span>
                      ))}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {selected && (
        <AdminDetail
          type={type} record={selected}
          onClose={() => setSelected(null)}
          onChanged={(updated) => { setItems((xs) => xs.map((x) => x.id === updated.id ? updated : x)); setSelected(updated); }}
          onDeleted={(id) => { setItems((xs) => xs.filter((x) => x.id !== id)); setSelected(null); }}
        />
      )}
    </section>
  );
}
```

- [ ] **Step 3: Browser-Verifikation (Detail folgt in Task 10 — hier Liste/Filter/Export)**

`/admin/anfragen`: Liste lädt, Status-Badges sichtbar, Suche filtert, Status-Filter schaltet, „CSV-Export" lädt eine `.csv` herunter, die in Excel korrekt (BOM, Umlaute) öffnet. *(Detail-Panel erst nach Task 10 funktional — bis dahin importiert `AdminInbox` `AdminDetail`; lege in Step davor einen Minimal-Stub an, falls Task 10 noch nicht existiert.)*

- [ ] **Step 4: Commit**

```bash
git add src/app/components/admin/fields.tsx src/app/components/admin/AdminInbox.tsx
git commit -m "feat(admin): inbox list with status filter, search, CSV export"
```

---

### Task 10: `AdminDetail` — Panel mit Aktionen (Status, Notiz, Archiv, Löschen, CV, Kontakt)

**Files:**
- Create: `src/app/components/admin/AdminDetail.tsx`

**Interfaces:**
- Consumes: `useAdmin()` (`update`, `remove`, `cvUrl`), `TYPE_META`, `STATUS_LABELS`, `fmtDate`.
- Props: `{ type: AdminType; record: any; onClose(): void; onChanged(updated): void; onDeleted(id): void }`.

- [ ] **Step 1: `AdminDetail.tsx` implementieren**

```tsx
import { useState } from "react";
import { X, Mail, Phone, Download, Archive, Trash2 } from "lucide-react";
import { useAdmin, type AdminType } from "../../../lib/admin";
import { TYPE_META, STATUS_LABELS, fmtDate } from "./fields";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const STATUSES = ["neu", "in_bearbeitung", "erledigt"] as const;

export function AdminDetail({ type, record, onClose, onChanged, onDeleted }: {
  type: AdminType; record: any; onClose: () => void;
  onChanged: (u: any) => void; onDeleted: (id: string) => void;
}) {
  const { update, remove, cvUrl } = useAdmin();
  const meta = TYPE_META[type];
  const [note, setNote] = useState<string>(record.admin_note ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const patch = async (p: any, tag: string) => {
    setBusy(tag); setErr(null);
    try { onChanged(await update(type, record.id, p)); }
    catch { setErr("Aktion fehlgeschlagen — ggf. neu anmelden."); }
    finally { setBusy(null); }
  };

  const del = async () => {
    if (!confirm("Diesen Eintrag endgültig löschen? Das kann nicht rückgängig gemacht werden.")) return;
    setBusy("del"); setErr(null);
    try { await remove(type, record.id); onDeleted(record.id); }
    catch { setErr("Löschen fehlgeschlagen."); setBusy(null); }
  };

  const downloadCv = async () => {
    setBusy("cv"); setErr(null);
    const url = await cvUrl(record.id);
    setBusy(null);
    if (url) window.open(url, "_blank", "noopener");
    else setErr("Kein Lebenslauf vorhanden.");
  };

  const st = record.admin_status ?? "neu";

  return (
    <div className="fixed inset-0 z-[120] flex" style={jakarta}>
      <div className="flex-1 bg-black/30" onClick={onClose} aria-hidden="true" />
      <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-[-20px_0_60px_rgb(0,0,0,0.18)] p-6" role="dialog" aria-label="Detail">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium text-[#111111]">{meta.title.replace(/n$/, "")} · Detail</h2>
          <button onClick={onClose} aria-label="Schließen" className="text-[#5F6B73] hover:text-[#111111]"><X size={20} strokeWidth={1.5} /></button>
        </div>

        {/* Status */}
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wide text-[#9AA3A8] mb-2">Status</p>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button key={s} disabled={busy !== null} onClick={() => patch({ admin_status: s }, "st-" + s)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${st === s ? "bg-[#0F7C77] text-white border-[#0F7C77]" : "border-[#E5F4F5] text-[#5F6B73] hover:border-[#6FD3D1]"}`}>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Felder */}
        <dl className="mb-5 space-y-2">
          {meta.detail.map((f) => {
            const v = f.kind === "bool" ? (record[f.key] ? "Ja" : "Nein") : f.kind === "date" ? fmtDate(record[f.key]) : record[f.key];
            if (v == null || v === "") return null;
            return (
              <div key={f.key} className="grid grid-cols-[40%_1fr] gap-2">
                <dt className="text-sm text-[#5F6B73]">{f.label}</dt>
                <dd className={`text-sm text-[#111111] break-words ${f.kind === "long" ? "whitespace-pre-wrap" : ""}`}>{String(v)}</dd>
              </div>
            );
          })}
        </dl>

        {/* Kontakt-Schnellaktionen */}
        <div className="flex flex-wrap gap-2 mb-5">
          {record.email && <a href={`mailto:${record.email}`} className="inline-flex items-center gap-1.5 text-sm text-[#0F7C77] border border-[#0F7C77] px-3 py-1.5 rounded-full hover:bg-[#0F7C77] hover:text-white transition-colors"><Mail size={15} strokeWidth={1.5} /> Antworten</a>}
          {record.phone && <a href={`tel:${String(record.phone).replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 text-sm text-[#0F7C77] border border-[#0F7C77] px-3 py-1.5 rounded-full hover:bg-[#0F7C77] hover:text-white transition-colors"><Phone size={15} strokeWidth={1.5} /> Anrufen</a>}
          {type === "job" && record.cv_path && <button onClick={downloadCv} disabled={busy === "cv"} className="inline-flex items-center gap-1.5 text-sm text-[#0F7C77] border border-[#0F7C77] px-3 py-1.5 rounded-full hover:bg-[#0F7C77] hover:text-white transition-colors"><Download size={15} strokeWidth={1.5} /> {busy === "cv" ? "…" : "Lebenslauf"}</button>}
        </div>

        {/* Notiz */}
        <div className="mb-5">
          <p className="text-xs uppercase tracking-wide text-[#9AA3A8] mb-2">Interne Notiz</p>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={2000}
            className="w-full px-3 py-2 rounded-xl border border-[#E5F4F5] bg-[#F8FEFF] text-sm outline-none focus:border-[#6FD3D1]" />
          <button onClick={() => patch({ admin_note: note }, "note")} disabled={busy !== null}
            className="mt-2 text-sm bg-[#0F7C77] text-white px-4 py-1.5 rounded-full hover:bg-[#0c6a66] disabled:opacity-50">
            {busy === "note" ? "…" : "Notiz speichern"}
          </button>
        </div>

        {err && <p className="text-sm text-[#d7120a] mb-3">{err}</p>}

        {/* Archiv + Löschen */}
        <div className="flex items-center gap-2 pt-4 border-t border-[#E5F4F5]">
          <button onClick={() => patch({ admin_archived: !record.admin_archived }, "arch")} disabled={busy !== null}
            className="inline-flex items-center gap-1.5 text-sm text-[#5F6B73] border border-[#E5F4F5] px-3 py-1.5 rounded-full hover:border-[#6FD3D1]">
            <Archive size={15} strokeWidth={1.5} /> {record.admin_archived ? "Aus Archiv holen" : "Archivieren"}
          </button>
          <button onClick={del} disabled={busy !== null}
            className="inline-flex items-center gap-1.5 text-sm text-[#d7120a] border border-[#f3c2bf] px-3 py-1.5 rounded-full hover:bg-[#fdeceb] ml-auto">
            <Trash2 size={15} strokeWidth={1.5} /> {busy === "del" ? "…" : "Löschen"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Browser-Verifikation (End-to-End Round-trip)**

`/admin/anfragen` → Eintrag öffnen:
- Status auf „in Bearbeitung" klicken → Badge in der Liste wechselt; **neu laden** → Status bleibt.
- Notiz eingeben + „Notiz speichern" → neu laden → Notiz bleibt; im Feld erscheint sie **escaped** (kein aktives HTML, wenn `<b>` eingegeben wurde).
- „Antworten"/„Anrufen" öffnen Mail/Tel. Bei Bewerbung: „Lebenslauf" öffnet den Signed-Download.
- „Archivieren" → verschwindet aus „alle", erscheint unter „archiviert".
- „Löschen" → Bestätigung → Eintrag weg; **neu laden** → bleibt weg.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/admin/AdminDetail.tsx
git commit -m "feat(admin): detail panel — status, note, archive, delete, CV, contact actions"
```

---

### Task 11: Abschluss-Audit + Aufräumen

**Files:**
- Review: alle in Runde 1 berührten Dateien (Client + Server).

- [ ] **Step 1: Adversariales Audit** (Dimensionen: Datenverlust/Korrektheit · Sicherheit · UX/Touch/A11y · Edge-Cases). Jeden Fund gegenprüfen (Default: nicht real). Prüfliste:
  - Server: PII nie ohne bestandene Passwortprüfung (alle 5 Routen laufen durch `adminGate`)? `token` nie im Response? `id` überall UUID-geprüft vor KV-Key? Notiz escaped + gedeckelt? CSV-Formel-Guard greift? Rate-Limit fail-closed?
  - Client: falsches/abgelaufenes Passwort → verständliche Meldung, keine Endlos-Spinner? `exportCsv`/`cvUrl`-Fehler sauber abgefangen? Löschen nur mit `confirm`? Reload = Logout (kein Passwort persistiert)?
  - A11y: Detail-Panel per Tastatur schließbar (Esc optional), Fokus sichtbar, Buttons beschriftet.
- [ ] **Step 2: Test-Datensätze entfernen** (die zum Testen angelegten Einträge über `/admin/delete` bzw. das Detail-Panel löschen). KV-Reste prüfen.
- [ ] **Step 3: Reiner Helfer-Test grün + Build grün**

Run: `node --test "supabase/functions/make-server-ec6100a6/admin_util.test.ts" && npm run build`
Expected: Tests PASS, Build erfolgreich.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(admin): backoffice round 1 audit fixes + cleanup"
```

---

## Deploy (erst nach ausdrücklicher Freigabe des Nutzers)

1. **Function deployen:** `npx supabase functions deploy make-server-ec6100a6 --no-verify-jwt --project-ref gjcleedoysndaagtsqjb`
2. **Frontend:** `feature/admin-backoffice` → PR/Merge nach `main`; GitHub Actions (`.github/workflows/deploy.yml`) baut & deployt Pages. HTML hat keinen Cache-Buster → dem Nutzer ~10 Min Vorlauf nennen.
3. **Rauchtest live:** `/admin` Login, eine Liste, eine Statusänderung, ein CSV-Export.

## Self-Review (durchgeführt)

- **Spec-Abdeckung:** Datenmodell §6.1 → Task 3/5; Endpunkte §6.2 (list/update/delete/cv-url/export) → Task 2–5; Auth-Modell §4 → `adminGate` (Task 2); Frontend §6.3 (admin.ts, Provider, Dashboard, Inbox, Routing, noindex) → Task 6–10; Termine-Sonderfall §6.4 → `type:"appointment"` überall, `token` gestrippt; Erfolgskriterien §6.5 → Task 8/10-Verifikationen; Tests §11 → node --test + curl-Suite + Browser. Keine offene Spec-Anforderung ohne Task.
- **Platzhalter:** keine „TBD/TODO"; jeder Code-Schritt zeigt vollständigen Code. (Die Platzhalter-Exporte in Task 7 sind ein bewusster Build-Grün-Zwischenschritt, in Task 8/9 ersetzt.)
- **Typ-Konsistenz:** `AdminType`, `adminGate`, `publicAdminRecord`, `loadSorted`, `keyFor/prefixFor`, `isUuid/isAdminType/isAdminStatus`, `sanitizeNote`, `buildCsv/CSV_COLUMNS`, `TYPE_META`, `useAdmin`-Signaturen sind über Tasks hinweg identisch benannt und verwendet.
