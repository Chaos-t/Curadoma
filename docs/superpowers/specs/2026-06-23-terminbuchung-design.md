# Cura Doma — Terminbuchung (Design / Spec)

Status: approved (2026-06-23). Approach **A** — extend existing Edge Function + KV store.
Reference: de Vries booking system (`Chaos20140/de-vries-website`), adapted to Cura Doma's React/Vite + Supabase (`make-server-ec6100a6`) + Strato-SMTP stack.

## Goal
A "Termin vereinbaren" page where visitors request an appointment slot. Operator confirms/declines via email buttons; confirming locks the slot. Full two-way email flow.

## Flow
1. Visitor at `/termin`: pick **service** (chip) → **date** (calendar, Mon–Fri only, no past) → **time** (slot) → **contact** (name, phone, email, optional message) + privacy consent → submit.
2. `POST /appointments` stores `status: pending` (slot NOT yet locked).
3. Operator email: all data + **Bestätigen / Ablehnen** buttons (token links). Visitor email: "Anfrage erhalten".
4. Operator **confirm** → slot locked (`confirmed`), visitor gets "bestätigt". **decline** → `declined`, visitor gets "nicht möglich".
5. Operator redirected to `/termin-status?s=…`.

## Config (single source: `src/lib/booking.ts`, mirrored in the Edge Function)
- **Services** (flat select, like de Vries): `Kostenloses Erstgespräch`, `Entlastungsleistungen`, `Demenz- & Seniorenbetreuung`, `Haushaltsnahe Dienstleistungen`, `Verhinderungspflege`.
- **Days**: Mon–Fri.
- **Slots**: hourly `08:00`–`16:00` (9 slots). Last appointment 16:00 (within 8–17 opening hours).
- **Lead**: no past dates; today selectable; unlimited forward.
- Slot capacity: 1 (a slot is "taken" once one **confirmed** booking exists for that date+time).

## Frontend (React, brand-styled, mobile-first, scroll-reveal)
- `TerminPage.tsx` → route `/termin`. Self-built calendar (no library, matches site style), service chips, slot grid, contact fields, live summary. Client validation mirrors Kontakt/Karriere. On load: `GET /booked-slots` → grey out taken slots.
- `TerminStatusPage.tsx` → route `/termin-status`. Reads `?s=…` → icon + message (`confirmed`/`declined`/`already-confirmed`/`already-declined`/`taken`/`notfound`/`invalid`). `noindex`.
- `routes.tsx`: add both routes. `Layout.tsx`: add nav item **"Termin vereinbaren"** (desktop + mobile). Existing "Kostenlos beraten lassen" CTAs stay → `/kontakt`.

## Backend (new routes in `make-server-ec6100a6`)
- `POST /appointments` — Body `{service, date_iso, time, name, phone, email, message?, consent_privacy, website?(honeypot)}`. Server validation: service ∈ whitelist; `date_iso` `^\d{4}-\d{2}-\d{2}$` + Mon–Fri + not past; `time` ∈ SLOTS whitelist; name/phone valid + length caps; email regex; consent true. Honeypot + per-IP rate limit + global daily cap (reuse existing helpers). Double-booking check vs **confirmed** → `409 slot_taken`. Store `appointment:<id>` `{status:'pending', token:<uuid>, …}`. Send operator email (confirm/decline links) + visitor "received" email. Fail-soft on mail. Returns `{ok, id}`.
- `GET /booked-slots` — `{slots:[{date,time}]}` from KV prefix scan, only `status==='confirmed'` and `appt_date >= today`. **No PII.** Fail-open → `{slots:[]}`.
- `GET /appointment-action?token=…&action=confirm|decline` — token regex-validated; load by token; idempotent (`pending`→`confirmed`/`declined`); on confirm re-check slot free (race guard, else `s=taken`); send visitor confirmed/declined email; **302 redirect** to `${SITE_URL}/termin-status?s=…`.

## Data (`appointment:<id>` in KV)
`{ id, created_at, service, appt_date, appt_time, name, phone, email, message, consent_privacy, status: 'pending'|'confirmed'|'declined', token, status_changed_at }`

## Emails (4, all single-part HTML via existing `sendEmail`, `curaEmailLayout`)
1. Operator "Neue Terminanfrage" + data + Bestätigen/Ablehnen buttons.
2. Visitor "Anfrage erhalten" (slot not yet fixed).
3. Visitor "Termin bestätigt".
4. Visitor "Termin leider nicht möglich" (suggest new attempt / phone).

## Error handling
- 409 → "Slot inzwischen vergeben, bitte andere Zeit".
- 422 → field errors. Network/server → fallback + phone number.
- `/booked-slots` KV error → empty slots (fail-open).
- Mail error → request still saved (fail-soft).

## Security (better than de Vries)
Honeypot + rate-limit + daily cap (important: visitor emails now go out → abuse guard). Token (UUID) for actions, regex-validated, operator-only. HTML-escaping in all emails; CRLF-safe headers. `/booked-slots` never returns PII. KV stays service-role-only (frontend uses anon key + the function).

## Known limitation (accepted, like de Vries)
A slot only locks on **confirm**; two pending requests for the same slot are possible until one is confirmed. Fits the "request → operator confirms" model.
