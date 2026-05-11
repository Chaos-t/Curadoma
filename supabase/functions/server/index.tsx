import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get("/make-server-ec6100a6/health", (c) => c.json({ status: "ok" }));

// --- Resend email helper ----------------------------------------------------
// Sends transactional emails via the Resend API using the RESEND_API_KEY
// secret configured on the Edge Function. The sender address must be a
// verified domain in Resend; until a custom domain is verified we fall back
// to the shared `onboarding@resend.dev` address that Resend ships for
// development. Override via the RESEND_FROM secret once the domain is set up.

async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  reply_to?: string;
}): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not configured." };
  }
  const from = Deno.env.get("RESEND_FROM") ?? "Cura Doma <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        reply_to: opts.reply_to,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.log("Resend API rejected request:", res.status, data);
      return { ok: false, error: `Resend status ${res.status}: ${JSON.stringify(data)}` };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    console.log("Resend network error:", err);
    return { ok: false, error: `Resend network error: ${err}` };
  }
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function curaEmailLayout(title: string, bodyHtml: string) {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#F4FBFC;font-family:Inter,Arial,sans-serif;color:#2F3A40;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E5F4F5;border-radius:20px;overflow:hidden;">
    <div style="padding:24px 28px;border-bottom:1px solid #E5F4F5;background:linear-gradient(180deg,#FBFEFE,#F4FBFC);">
      <div style="font-family:'Lora',Georgia,serif;font-size:22px;color:#6FBDB8;letter-spacing:0.4px;">Cura Doma</div>
      <div style="font-size:10px;letter-spacing:3px;color:#9AA3A8;margin-top:4px;">AMBULANTER BETREUUNGSDIENST</div>
    </div>
    <div style="padding:24px 28px;">
      <h1 style="font-size:18px;margin:0 0 16px;color:#111111;font-weight:500;">${escapeHtml(title)}</h1>
      ${bodyHtml}
    </div>
    <div style="padding:16px 28px;border-top:1px solid #E5F4F5;font-size:11px;color:#9AA3A8;">
      Diese Nachricht wurde automatisch über die Cura Doma Website gesendet.
    </div>
  </div></body></html>`;
}

function rowsTable(rows: Array<[string, string | null | undefined]>) {
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;">
    ${rows
      .filter(([, v]) => v !== null && v !== undefined && String(v).length > 0)
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 0;color:#5F6B73;width:40%;vertical-align:top;">${escapeHtml(k)}</td><td style="padding:6px 0;color:#111111;">${escapeHtml(String(v))}</td></tr>`,
      )
      .join("")}
  </table>`;
}

// --- Contact messages -------------------------------------------------------
// Stored under key prefix `contact_message:<id>`. Equivalent schema to a
// dedicated `contact_messages` table:
//   id, created_at, name, email, phone, subject, message,
//   page_source, consent_privacy, status
// Anonymous clients only call POST (insert). Reading/updating/deleting
// requires the service-role key which is never exposed to the frontend.

// --- Validation (mirror of src/lib/validation.ts) ---------------------------
// Defense in depth: the frontend already enforces these rules, but a hostile
// client can edit the request, so we re-check everything server-side.

const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
const PHONE_CHARS_RE = /^[+0-9 ()\/\-.]+$/;
const URL_LIKE_RE = /(https?:\/\/|www\.|\.(?:com|de|net|org|info|ru|cn|biz)(?:\b|\/))/i;
const HAS_LETTER_RE = /\p{L}/u;
const REPEAT_CHARS_RE = /(.)\1{3,}/u;

const LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 60,
  MESSAGE_MIN: 10,
  MESSAGE_MAX: 2500,
  SUBJECT_MAX: 120,
  EMAIL_MAX: 254,
  PHONE_MAX: 25,
} as const;

function isValidName(v: string): boolean {
  return v.length >= LIMITS.NAME_MIN
    && v.length <= LIMITS.NAME_MAX
    && HAS_LETTER_RE.test(v)
    && !URL_LIKE_RE.test(v)
    && !REPEAT_CHARS_RE.test(v);
}
function isValidEmail(v: string): boolean {
  return v.length > 0 && v.length <= LIMITS.EMAIL_MAX && EMAIL_RE.test(v);
}
function isValidPhone(v: string): boolean {
  if (v.length === 0 || v.length > LIMITS.PHONE_MAX) return false;
  if (!PHONE_CHARS_RE.test(v)) return false;
  const digits = v.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

app.post("/make-server-ec6100a6/contact-messages", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return c.json({ error: "Ungültige Anfrage: Body fehlt oder ist kein JSON." }, 400);
    }

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = body.phone ? String(body.phone).trim() : null;
    const subject = body.subject ? String(body.subject).trim() : null;
    const message = String(body.message ?? "").trim();
    const page_source = body.page_source ? String(body.page_source).trim() : null;
    const consent_privacy = Boolean(body.consent_privacy);

    const errors: Record<string, string> = {};
    if (!name) errors.name = "Bitte geben Sie Ihren Namen an.";
    else if (!isValidName(name)) errors.name = "Bitte geben Sie einen echten Namen ein.";
    if (!email) errors.email = "Bitte geben Sie Ihre E-Mail-Adresse an.";
    else if (!isValidEmail(email)) errors.email = "Bitte geben Sie eine gültige E-Mail-Adresse an.";
    if (phone && !isValidPhone(phone)) errors.phone = "Bitte geben Sie eine gültige Telefonnummer an.";
    if (subject && subject.length > LIMITS.SUBJECT_MAX) errors.subject = "Der Betreff ist zu lang.";
    if (!message) errors.message = "Bitte schreiben Sie eine Nachricht.";
    else if (message.length < LIMITS.MESSAGE_MIN) errors.message = "Bitte schreiben Sie etwas mehr.";
    else if (message.length > LIMITS.MESSAGE_MAX) errors.message = "Die Nachricht ist zu lang.";
    if (!consent_privacy) errors.consent_privacy = "Bitte stimmen Sie der Datenschutzerklärung zu.";

    if (Object.keys(errors).length > 0) {
      return c.json({ error: "Validierung fehlgeschlagen.", fields: errors }, 422);
    }

    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const record = {
      id,
      created_at,
      name,
      email,
      phone,
      subject,
      message,
      page_source,
      consent_privacy,
      status: "new",
    };

    await kv.set(`contact_message:${id}`, record);

    const emailRes = await sendEmail({
      to: "info@curadoma.de",
      reply_to: email,
      subject: `Neue Anfrage von ${name}${subject ? ` — ${subject}` : ""}`,
      text: `Neue Kontaktanfrage über curadoma.de\n\nName: ${name}\nE-Mail: ${email}\nTelefon: ${phone ?? "—"}\nBetreff: ${subject ?? "—"}\nSeite: ${page_source ?? "—"}\nEingegangen: ${created_at}\n\nNachricht:\n${message}`,
      html: curaEmailLayout(
        "Neue Kontaktanfrage",
        `${rowsTable([
          ["Name", name],
          ["E-Mail", email],
          ["Telefon", phone],
          ["Betreff", subject],
          ["Seite", page_source],
          ["Eingegangen", created_at],
        ])}<div style="margin-top:18px;padding:14px 16px;background:#F4FBFC;border-radius:12px;color:#2F3A40;white-space:pre-wrap;font-size:14px;line-height:1.55;">${escapeHtml(message)}</div>`,
      ),
    });
    if (!emailRes.ok) console.log("Contact email send failed:", emailRes.error);

    return c.json({ ok: true, id, created_at, email_sent: emailRes.ok }, 201);
  } catch (error) {
    console.log("Error while storing contact message:", error);
    return c.json({ error: `Serverfehler beim Speichern der Anfrage: ${error}` }, 500);
  }
});

// --- Job applications -------------------------------------------------------
// Stored under key prefix `job_application:<id>`. Email notifications to
// Tolunay.u@outlook.de require an external email provider (Resend / SendGrid /
// Brevo / SMTP). The API key must be supplied via a Supabase Edge Function
// environment variable, e.g. `RESEND_API_KEY`, and never shipped to the
// frontend.

app.post("/make-server-ec6100a6/job-applications", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return c.json({ error: "Ungültige Anfrage: Body fehlt oder ist kein JSON." }, 400);
    }

    const errors: Record<string, string> = {};
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const city = String(body.city ?? "").trim();
    const message = String(body.motivation ?? "").trim();
    const consent_privacy = Boolean(body.consent_privacy);

    if (!name) errors.name = "Bitte geben Sie Ihren Namen an.";
    else if (!isValidName(name)) errors.name = "Bitte geben Sie einen echten Namen ein.";
    if (!email) errors.email = "Bitte geben Sie Ihre E-Mail-Adresse an.";
    else if (!isValidEmail(email)) errors.email = "Bitte geben Sie eine gültige E-Mail-Adresse an.";
    if (!phone) errors.phone = "Bitte geben Sie eine Telefonnummer an.";
    else if (!isValidPhone(phone)) errors.phone = "Bitte geben Sie eine gültige Telefonnummer an.";
    if (city.length > LIMITS.NAME_MAX) errors.city = "Wohnort ist zu lang.";
    if (message.length > LIMITS.MESSAGE_MAX) errors.motivation = "Die Motivation ist zu lang.";
    if (!consent_privacy) errors.consent_privacy = "Bitte stimmen Sie der Datenschutzerklärung zu.";
    if (Object.keys(errors).length > 0) {
      return c.json({ error: "Validierung fehlgeschlagen.", fields: errors }, 422);
    }

    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const record = {
      id,
      created_at,
      job: "Alltagsbegleiter/Haushaltshilfe (m/w/d)",
      name,
      email,
      phone,
      city,
      working_hours: body.working_hours ?? null,
      earliest_start: body.earliest_start ?? null,
      experience_household: Boolean(body.experience_household),
      experience_household_text: String(body.experience_household_text ?? "").trim() || null,
      experience_care: Boolean(body.experience_care),
      experience_care_text: String(body.experience_care_text ?? "").trim() || null,
      drivers_license: Boolean(body.drivers_license),
      has_car: Boolean(body.has_car),
      motivation: message,
      cv_filename: body.cv_filename ?? null,
      consent_privacy,
      status: "new",
      target_email: "Tolunay.u@outlook.de",
    };

    await kv.set(`job_application:${id}`, record);

    const yn = (v: boolean) => (v ? "Ja" : "Nein");
    const rows: Array<[string, string | null | undefined]> = [
      ["Position", record.job],
      ["Name", name],
      ["E-Mail", email],
      ["Telefon", phone],
      ["Wohnort", city],
      ["Arbeitszeit", record.working_hours],
      ["Frühester Beginn", record.earliest_start],
      ["Erfahrung Haushalt", `${yn(record.experience_household)}${record.experience_household_text ? ` — ${record.experience_household_text}` : ""}`],
      ["Erfahrung Pflege/Betreuung", `${yn(record.experience_care)}${record.experience_care_text ? ` — ${record.experience_care_text}` : ""}`],
      ["Führerschein", yn(record.drivers_license)],
      ["Eigener PKW", yn(record.has_car)],
      ["Lebenslauf (Dateiname)", record.cv_filename],
      ["Eingegangen", created_at],
    ];

    const emailRes = await sendEmail({
      to: "Tolunay.u@outlook.de",
      reply_to: email,
      subject: `Neue Bewerbung: ${record.job} — ${name}`,
      text: rows
        .filter(([, v]) => v !== null && v !== undefined && String(v).length > 0)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n") + `\n\nMotivation:\n${message || "—"}\n\nHinweis: Die hochgeladene Datei wurde nicht als Anhang übertragen — bitte ggf. beim Bewerber anfordern.`,
      html: curaEmailLayout(
        "Neue Bewerbung",
        `${rowsTable(rows)}<div style="margin-top:18px;padding:14px 16px;background:#F4FBFC;border-radius:12px;color:#2F3A40;white-space:pre-wrap;font-size:14px;line-height:1.55;"><strong style="display:block;margin-bottom:6px;color:#111111;">Motivation</strong>${escapeHtml(message || "—")}</div><p style="margin-top:14px;font-size:12px;color:#9AA3A8;">Hinweis: Die hochgeladene Datei wurde nicht als Anhang übertragen — bitte ggf. beim Bewerber anfordern.</p>`,
      ),
    });
    if (!emailRes.ok) console.log("Job application email send failed:", emailRes.error);

    return c.json({ ok: true, id, created_at, email_sent: emailRes.ok }, 201);
  } catch (error) {
    console.log("Error while storing job application:", error);
    return c.json({ error: `Serverfehler beim Speichern der Bewerbung: ${error}` }, 500);
  }
});

Deno.serve(app.fetch);
