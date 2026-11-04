// Shared appointment-booking config + helpers. Mirrors the whitelist used by
// the Edge Function (APPT_SERVICES / APPT_SLOTS in supabase/.../index.ts) — keep
// the two in sync.
import { projectId, publicAnonKey } from "/utils/supabase/info";

export const BOOKING_SERVICES = [
  "Kostenloses Erstgespräch",
  "Entlastungsleistungen",
  "Demenz- & Seniorenbetreuung",
  "Haushaltsnahe Dienstleistungen",
  "Verhinderungspflege",
] as const;

/** Vorlaufzeit: frueheste Buchung = heute + so viele Tage. Spiegel von
 *  APPT_LEAD_DAYS in der Edge Function — synchron halten. */
export const BOOKING_LEAD_DAYS = 7;

export const BOOKING_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",
] as const;

/** Standort der Anfrage. Die Keys sind die Whitelist APPT_LOCATIONS in der
 *  Edge Function (dort steht auch das Label fuer Mails/Backoffice) — synchron halten. */
export const BOOKING_LOCATIONS = [
  { key: "hameln", label: "Hameln & Umgebung" },
  { key: "paderborn", label: "Paderborn & Umgebung" },
] as const;
export type BookingLocation = (typeof BOOKING_LOCATIONS)[number]["key"];

export const FN_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-ec6100a6`;
export const FN_ANON = publicAnonKey;

/** Local date → "YYYY-MM-DD" without any timezone shift. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isWeekend(d: Date): boolean {
  const g = d.getDay();
  return g === 0 || g === 6;
}

/** Today at local midnight (for "no past date" comparisons). */
export function startOfToday(): Date {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

export function formatGermanDate(d: Date): string {
  return d.toLocaleDateString("de-DE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export type BookedSlot = { date: string; time: string };

/** Fetch confirmed (taken) slots → map of ISO-date → [times]. Fails to {}. */
export async function fetchBookedMap(): Promise<Record<string, string[]>> {
  try {
    const res = await fetch(`${FN_BASE}/booked-slots`, {
      headers: { Authorization: `Bearer ${FN_ANON}` },
    });
    if (!res.ok) return {};
    const data = (await res.json()) as { slots?: BookedSlot[] };
    const map: Record<string, string[]> = {};
    for (const s of data.slots ?? []) {
      (map[s.date] ??= []).push(s.time);
    }
    return map;
  } catch {
    return {};
  }
}
