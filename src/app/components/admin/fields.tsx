import type { AdminType } from "../../../lib/admin";

export type Col = { key: string; label: string };
export type Field = { key: string; label: string; kind?: "bool" | "date" | "long" };
type Meta = { title: string; singular: string; columns: Col[]; detail: Field[] };

export const TYPE_META: Record<AdminType, Meta> = {
  contact: {
    title: "Anfragen",
    singular: "Anfrage",
    columns: [
      { key: "created_at", label: "Datum" },
      { key: "name", label: "Name" },
      { key: "subject", label: "Betreff" },
    ],
    detail: [
      { key: "created_at", label: "Eingegangen", kind: "date" },
      { key: "name", label: "Name" },
      { key: "email", label: "E-Mail" },
      { key: "phone", label: "Telefon" },
      { key: "subject", label: "Betreff" },
      { key: "message", label: "Nachricht", kind: "long" },
      { key: "page_source", label: "Seite" },
    ],
  },
  job: {
    title: "Bewerbungen",
    singular: "Bewerbung",
    columns: [
      { key: "created_at", label: "Datum" },
      { key: "name", label: "Name" },
      { key: "city", label: "Wohnort" },
    ],
    detail: [
      { key: "created_at", label: "Eingegangen", kind: "date" },
      { key: "job", label: "Position" },
      { key: "name", label: "Name" },
      { key: "email", label: "E-Mail" },
      { key: "phone", label: "Telefon" },
      { key: "city", label: "Wohnort" },
      { key: "working_hours", label: "Arbeitszeit" },
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
    singular: "Termin",
    columns: [
      { key: "created_at", label: "Datum" },
      { key: "name", label: "Name" },
      { key: "service", label: "Leistung" },
      { key: "location", label: "Standort" },
    ],
    detail: [
      { key: "created_at", label: "Eingegangen", kind: "date" },
      { key: "status", label: "Buchungsstatus" },
      { key: "service", label: "Leistung" },
      { key: "location", label: "Standort" },
      { key: "appt_date", label: "Datum" },
      { key: "appt_time", label: "Uhrzeit" },
      { key: "name", label: "Name" },
      { key: "email", label: "E-Mail" },
      { key: "phone", label: "Telefon" },
      { key: "message", label: "Nachricht", kind: "long" },
    ],
  },
};

export const STATUS_LABELS: Record<string, string> = {
  neu: "neu",
  in_bearbeitung: "in Bearbeitung",
  erledigt: "erledigt",
};

export const STATUS_STYLE: Record<string, string> = {
  neu: "bg-[#E1F0F4] text-[#1B6478]",
  in_bearbeitung: "bg-[#FBEFD8] text-[#94620A]",
  erledigt: "bg-[#DFF1E5] text-[#256E45]",
};

export function fmtDate(iso?: string): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
