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

// The internal note is stored as PLAIN text (only length-capped). It is never
// rendered via dangerouslySetInnerHTML — output contexts escape it themselves:
// React auto-escapes text nodes, the edit textarea shows it as a raw value, and
// CSV export runs it through csvCell(). HTML-escaping at storage time would
// corrupt ordinary notes containing <, & or " on every re-save (double-escape).
export const MAX_NOTE = 2000;
export function sanitizeNote(s: unknown): string {
  return String(s ?? "").slice(0, MAX_NOTE);
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
    ["Leistung", "service"], ["Standort", "location"], ["Datum", "appt_date"], ["Uhrzeit", "appt_time"],
    ["Name", "name"], ["E-Mail", "email"], ["Telefon", "phone"],
    ["Nachricht", "message"], ["Notiz", "admin_note"],
  ],
};

// --- Block-Zonen: Bestand + Reihenfolge von Einträgen je Zone ----------------
// Gespeichert wird NUR die Struktur (Zone-ID -> geordnete Liste sicherer Keys),
// kein HTML. Die Keys werden Teil von <Editable>-IDs (zone.key.field), daher
// nur [a-z0-9]. Feld-INHALTE laufen weiter durch die sanitisierte Overrides-Pipeline.
// Länge großzügig: verschachtelte Listen-Zonen (z. B. die Stichpunkte einer
// Karte: `page.<slug>.blocks.<key>.bullets`) werden länger als eine flache Zone.
export const ZONE_ID_RE = /^[a-z0-9.\-]{1,120}$/;
export const ZONE_KEY_RE = /^[a-z0-9]{1,16}$/;
export const MAX_ZONES = 80;
export const MAX_ZONE_ITEMS = 60;

export function isZoneKey(s: unknown): boolean {
  return typeof s === "string" && ZONE_KEY_RE.test(s);
}

// --- Typisierte Inhalts-Blöcke (Text/Button/Bild/Karte) ---------------------
// Struktur je Bereich: geordnete Liste von Blöcken {k, t, href?}. Nur Metadaten
// (Typ + validiertes Link-Ziel) — kein HTML. Text/Bild-Inhalt läuft über die
// sanitisierte <Editable>/<EditableImage>-Pipeline. „card" (Überschrift +
// Stichpunkt-Liste) speichert seine Stichpunkte als eigene, validierte Zone
// (`<area>.<key>.bullets`) — die Liste ist Struktur, der Text bleibt Inhalt.
export const BLOCK_TYPES = ["text", "button", "image", "card", "title", "quote", "divider"] as const;
export function isBlockType(t: unknown): boolean {
  return typeof t === "string" && (BLOCK_TYPES as readonly string[]).includes(t);
}
export const MAX_BLOCK_AREAS = 60;
export const MAX_BLOCKS_PER_AREA = 60;
// Ausrichtung je Block (Struktur, kein Inhalt). „left" ist Default und wird nicht
// gespeichert; nur „center"/„right" werden vermerkt.
export const BLOCK_ALIGNS = ["left", "center", "right"] as const;
export function isBlockAlign(a: unknown): a is "center" | "right" {
  return a === "center" || a === "right";
}

// Erlaubte Link-Ziele (identisch zur safeHref-Prüfung der Rich-Text-Links):
// http(s), mailto, tel, seiteninterne /-Pfade (kein //), #anker. Blockt u. a.
// javascript: und protokoll-relative //fremdhost.
export function safeHref(h: unknown): boolean {
  const s = String(h ?? "").trim();
  return /^https?:\/\//i.test(s) || /^mailto:/i.test(s) || /^tel:/i.test(s) ||
    /^\/(?!\/)[\w./-]*$/.test(s) || /^#[\w-]+$/.test(s);
}

export type Block = { k: string; t: string; href?: string; align?: "center" | "right" };

export function validateBlocks(input: unknown):
  { ok: true; blocks: Record<string, Block[]> } | { ok: false; error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, error: "bad_blocks" };
  const entries = Object.entries(input as Record<string, unknown>);
  if (entries.length > MAX_BLOCK_AREAS) return { ok: false, error: "too_many_areas" };
  const out: Record<string, Block[]> = {};
  for (const [areaId, val] of entries) {
    if (!ZONE_ID_RE.test(areaId)) return { ok: false, error: "bad_area_id" };
    if (!Array.isArray(val)) return { ok: false, error: "bad_area_value" };
    if (val.length > MAX_BLOCKS_PER_AREA) return { ok: false, error: "too_many_blocks" };
    const arr: Block[] = [];
    const seen = new Set<string>();
    for (const b of val) {
      if (!b || typeof b !== "object") return { ok: false, error: "bad_block" };
      const k = (b as { k?: unknown }).k;
      const t = (b as { t?: unknown }).t;
      if (!isZoneKey(k)) return { ok: false, error: "bad_block_key" };
      if (!isBlockType(t)) return { ok: false, error: "bad_block_type" };
      if (seen.has(k as string)) return { ok: false, error: "dup_block_key" };
      seen.add(k as string);
      const block: Block = { k: k as string, t: t as string };
      if (t === "button") {
        const href = String((b as { href?: unknown }).href ?? "").trim();
        block.href = safeHref(href) ? href : "#"; // ungültiges Ziel -> No-op statt Fehler
      }
      const align = (b as { align?: unknown }).align;
      if (isBlockAlign(align)) block.align = align; // nur center/right (left = Default)
      arr.push(block);
    }
    out[areaId] = arr;
  }
  return { ok: true, blocks: out };
}

// --- Struktur: dynamische Seiten + Menüpunkte -------------------------------
// Nur Metadaten (slug, label, inMenu) — kein HTML. Der Inhalt der Seite läuft
// über die sanitisierte <Editable>-Pipeline (page.<slug>.title/body/image).
export const PAGE_SLUG_RE = /^[a-z][a-z0-9-]{1,40}$/;
export const MAX_PAGES = 30;
export const MAX_PAGE_LABEL = 40;
// Reservierte Slugs: bestehende Routen + technische Pfade dürfen nicht überschrieben werden.
export const RESERVED_SLUGS = new Set([
  "leistungen", "entlastung", "demenzbetreuung", "haushaltsnahe-dienstleistungen",
  "verhinderungspflege", "umwandlung-sachleistungen", "einzugsgebiet", "kontakt",
  "impressum", "datenschutz", "karriere", "termin", "termin-status", "admin",
  "standort-hameln", "standort-paderborn",
  "api", "assets", "src", "index",
]);

export type DynPage = { slug: string; label: string; inMenu: boolean };

export function validatePages(input: unknown):
  { ok: true; pages: DynPage[] } | { ok: false; error: string } {
  if (!Array.isArray(input)) return { ok: false, error: "bad_pages" };
  if (input.length > MAX_PAGES) return { ok: false, error: "too_many_pages" };
  const out: DynPage[] = [];
  const seen = new Set<string>();
  for (const p of input) {
    if (!p || typeof p !== "object") return { ok: false, error: "bad_page" };
    const slug = String((p as { slug?: unknown }).slug ?? "");
    const label = String((p as { label?: unknown }).label ?? "").trim();
    const inMenu = Boolean((p as { inMenu?: unknown }).inMenu);
    if (!PAGE_SLUG_RE.test(slug) || RESERVED_SLUGS.has(slug)) return { ok: false, error: "bad_slug" };
    if (seen.has(slug)) return { ok: false, error: "dup_slug" };
    if (!label || label.length > MAX_PAGE_LABEL) return { ok: false, error: "bad_label" };
    seen.add(slug);
    out.push({ slug, label: label.slice(0, MAX_PAGE_LABEL), inMenu });
  }
  return { ok: true, pages: out };
}

// --- SEO: pro Route editierbare Meta (Titel/Beschreibung/OG-Bild) ------------
// Overlay über die statischen Defaults (lib/seo.ts). NUR Klartext (keine Tags),
// gedeckelt; das OG-Bild muss eine absolute http(s)-URL sein (z. B. Storage).
export const SEO_KEY_RE = /^\/([a-z0-9-]{1,60}(\/[a-z0-9-]{1,60})*)?$/; // "/", "/leistungen", "/ueber-uns"
export const MAX_SEO_ENTRIES = 80;
export const MAX_SEO_TITLE = 120;
export const MAX_SEO_DESC = 320;
export type SeoEntry = { title?: string; description?: string; image?: string };

function seoPlain(s: unknown, max: number): string {
  // Klartext: erst ganze Tags entfernen, dann evtl. übrige Winkelklammern, dann
  // Whitespace glätten und deckeln (kein HTML in <title>/<meta>).
  return String(s ?? "").replace(/<[^>]*>/g, "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function validateSeo(input: unknown):
  { ok: true; seo: Record<string, SeoEntry> } | { ok: false; error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, error: "bad_seo" };
  const entries = Object.entries(input as Record<string, unknown>);
  if (entries.length > MAX_SEO_ENTRIES) return { ok: false, error: "too_many_seo" };
  const out: Record<string, SeoEntry> = {};
  for (const [key, val] of entries) {
    if (!SEO_KEY_RE.test(key)) return { ok: false, error: "bad_seo_key" };
    if (!val || typeof val !== "object" || Array.isArray(val)) return { ok: false, error: "bad_seo_entry" };
    const v = val as { title?: unknown; description?: unknown; image?: unknown };
    const title = seoPlain(v.title, MAX_SEO_TITLE);
    const description = seoPlain(v.description, MAX_SEO_DESC);
    const imageRaw = String(v.image ?? "").trim();
    // OG-Bild muss absolut sein; safeHref sperrt javascript:/data: etc.
    const image = /^https?:\/\//i.test(imageRaw) && safeHref(imageRaw) ? imageRaw : "";
    const entry: SeoEntry = {};
    if (title) entry.title = title;
    if (description) entry.description = description;
    if (image) entry.image = image;
    if (Object.keys(entry).length) out[key] = entry; // leere Einträge weglassen
  }
  return { ok: true, seo: out };
}

export function validateZones(input: unknown):
  { ok: true; zones: Record<string, string[]> } | { ok: false; error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, error: "bad_zones" };
  const entries = Object.entries(input as Record<string, unknown>);
  if (entries.length > MAX_ZONES) return { ok: false, error: "too_many_zones" };
  const out: Record<string, string[]> = {};
  for (const [zoneId, val] of entries) {
    if (!ZONE_ID_RE.test(zoneId)) return { ok: false, error: "bad_zone_id" };
    if (!Array.isArray(val)) return { ok: false, error: "bad_zone_value" };
    if (val.length > MAX_ZONE_ITEMS) return { ok: false, error: "too_many_items" };
    const keys: string[] = [];
    const seen = new Set<string>();
    for (const k of val) {
      if (!isZoneKey(k)) return { ok: false, error: "bad_zone_key" };
      if (seen.has(k as string)) return { ok: false, error: "dup_zone_key" };
      seen.add(k as string);
      keys.push(k as string);
    }
    out[zoneId] = keys;
  }
  return { ok: true, zones: out };
}
