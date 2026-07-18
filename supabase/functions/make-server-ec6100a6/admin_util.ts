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
    ["Leistung", "service"], ["Datum", "appt_date"], ["Uhrzeit", "appt_time"],
    ["Name", "name"], ["E-Mail", "email"], ["Telefon", "phone"],
    ["Nachricht", "message"], ["Notiz", "admin_note"],
  ],
};
