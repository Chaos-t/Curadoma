import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import * as kv from "./kv_store.ts";

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

// --- External-API cache helpers --------------------------------------------
// Both /reviews and /instagram-posts call rate-limited upstream APIs. We
// cache responses in kv_store_ec6100a6 with a per-key TTL so the upstream
// only gets hit once every TTL window, regardless of how many users hit
// the site. The cache also acts as a stale-while-error fallback.

type CacheRecord<T> = { data: T; fetchedAt: number };

async function cachedFetch<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<{ data: T; cached: boolean; stale: boolean }> {
  const now = Date.now();
  let cached: CacheRecord<T> | undefined;
  try {
    cached = (await kv.get(`cache:${key}`)) as CacheRecord<T> | undefined;
  } catch (e) {
    console.log(`cache get failed for ${key}:`, e);
  }

  if (cached && now - cached.fetchedAt < ttlMs) {
    return { data: cached.data, cached: true, stale: false };
  }

  try {
    const fresh = await fetcher();
    try {
      await kv.set(`cache:${key}`, { data: fresh, fetchedAt: now });
    } catch (e) {
      console.log(`cache set failed for ${key}:`, e);
    }
    return { data: fresh, cached: false, stale: false };
  } catch (err) {
    // Upstream failed — serve last known good if we have one
    if (cached) {
      console.log(`upstream ${key} failed, serving stale cache:`, err);
      return { data: cached.data, cached: true, stale: true };
    }
    throw err;
  }
}

// --- Google Places: real reviews -------------------------------------------
// Only one required secret: GOOGLE_PLACES_API_KEY.
// The Place ID is discovered automatically from the business address using
// the Find Place from Text API, then cached for 7 days so we don't burn a
// quota call on every request. If you ever want to override the discovered
// ID (e.g. there are multiple matches and we picked the wrong one), set
// the GOOGLE_PLACE_ID env var and it wins.
//
// Google Places Details API returns up to 5 reviews per call — Google's
// hard cap, not ours. Reviews are cached for 6 hours.

const PLACE_DISCOVERY_QUERY = "Cura Doma Hameln";
// Hameln centre — used as locationbias so Google ranks nearby matches first.
const HAMELN_LAT = 52.1037;
const HAMELN_LNG = 9.3567;
const PLACE_DISCOVERY_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
// Bumped from v1 → v2 so the previous wrong cache entry (curahumana) is
// ignored without manually clearing the KV store.
const PLACE_DISCOVERY_CACHE_KEY = "discovered_place_id_v2";
const REQUIRED_NAME_FRAGMENT = "cura doma";

type GoogleReview = {
  author_name: string;
  author_url?: string;
  language?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
};

type ReviewsResponse = {
  reviews: GoogleReview[];
  rating?: number;
  total?: number;
  placeUrl?: string;
};

/** Resolve a place_id by searching for the business by text. Caches the
 *  result in KV for 7 days under `discovered_place_id`. */
async function resolvePlaceId(apiKey: string): Promise<string> {
  // 1. Manual override wins.
  const override = Deno.env.get("GOOGLE_PLACE_ID");
  if (override) return override;

  // 2. Check KV cache (v2 key — see comment near the constant).
  type Cached = { id: string; fetchedAt: number };
  let cached: Cached | undefined;
  try {
    cached = (await kv.get(PLACE_DISCOVERY_CACHE_KEY)) as Cached | undefined;
  } catch (e) {
    console.log("place-id cache read failed:", e);
  }
  if (cached && Date.now() - cached.fetchedAt < PLACE_DISCOVERY_TTL_MS) {
    return cached.id;
  }

  const saveCache = async (id: string) => {
    try {
      await kv.set(PLACE_DISCOVERY_CACHE_KEY, { id, fetchedAt: Date.now() });
    } catch (e) {
      console.log("place-id cache write failed:", e);
    }
  };

  // 3. First try Find Place from Text — cheap, returns one candidate. Bias
  //    the search to Hameln so similar-name competitors in other cities
  //    (e.g. "curahumana") are de-ranked.
  const findUrl = new URL("https://maps.googleapis.com/maps/api/place/findplacefromtext/json");
  findUrl.searchParams.set("input", PLACE_DISCOVERY_QUERY);
  findUrl.searchParams.set("inputtype", "textquery");
  findUrl.searchParams.set("fields", "place_id,name,formatted_address");
  findUrl.searchParams.set("locationbias", `circle:5000@${HAMELN_LAT},${HAMELN_LNG}`);
  findUrl.searchParams.set("language", "de");
  findUrl.searchParams.set("key", apiKey);

  const findRes = await fetch(findUrl.toString());
  const findJson = await findRes.json();
  if (findJson.status === "OK" && findJson.candidates?.[0]) {
    const candidate = findJson.candidates[0];
    const name = String(candidate.name ?? "").toLowerCase();
    if (name.includes(REQUIRED_NAME_FRAGMENT)) {
      await saveCache(candidate.place_id);
      return candidate.place_id;
    }
    console.log(
      `Find Place returned "${candidate.name}" (place_id ${candidate.place_id}) — name does not contain "${REQUIRED_NAME_FRAGMENT}", falling back to Text Search.`,
    );
  }

  // 4. Fallback: Text Search returns up to 20 results. Pick the first one
  //    whose name actually contains "cura doma" (and not "curahumana").
  const tsUrl = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  tsUrl.searchParams.set("query", "Cura Doma Hameln Betreuungsdienst");
  tsUrl.searchParams.set("location", `${HAMELN_LAT},${HAMELN_LNG}`);
  tsUrl.searchParams.set("radius", "10000");
  tsUrl.searchParams.set("language", "de");
  tsUrl.searchParams.set("key", apiKey);

  const tsRes = await fetch(tsUrl.toString());
  const tsJson = await tsRes.json();
  if (tsJson.status === "OK" && Array.isArray(tsJson.results)) {
    const match = tsJson.results.find((r: { name?: string }) => {
      const n = String(r.name ?? "").toLowerCase();
      // Insist on "cura doma" — and rule out near-collisions like "curahumana"
      // by requiring a word boundary after "cura".
      return /\bcura\s+doma\b/i.test(n);
    });
    if (match?.place_id) {
      await saveCache(match.place_id);
      return match.place_id;
    }
  }

  throw new Error(
    `Could not resolve a place_id for "${PLACE_DISCOVERY_QUERY}" — neither Find Place nor Text Search returned a match with "${REQUIRED_NAME_FRAGMENT}" in its name. Set GOOGLE_PLACE_ID as a Supabase secret to override.`,
  );
}

app.get("/make-server-ec6100a6/reviews", async (c) => {
  const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
  if (!apiKey) {
    return c.json(
      { error: "GOOGLE_PLACES_API_KEY is not set as a Supabase secret.", missing: ["GOOGLE_PLACES_API_KEY"] },
      503,
    );
  }

  try {
    const placeId = await resolvePlaceId(apiKey);

    const { data, cached, stale } = await cachedFetch<ReviewsResponse>(
      `reviews:${placeId}`,
      6 * 60 * 60 * 1000, // 6 hours
      async () => {
        const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
        url.searchParams.set("place_id", placeId);
        url.searchParams.set("fields", "reviews,rating,user_ratings_total,url");
        url.searchParams.set("language", "de");
        url.searchParams.set("reviews_sort", "newest");
        url.searchParams.set("key", apiKey);

        const res = await fetch(url.toString());
        const json = await res.json();
        if (json.status !== "OK") {
          throw new Error(`Places API status ${json.status}: ${json.error_message ?? "unknown"}`);
        }
        const result = json.result ?? {};
        return {
          reviews: (result.reviews ?? []) as GoogleReview[],
          rating: result.rating,
          total: result.user_ratings_total,
          placeUrl: result.url,
        };
      },
    );
    return c.json({ ...data, cached, stale });
  } catch (err) {
    console.log("reviews fetch failed:", err);
    return c.json({ error: String(err) }, 502);
  }
});

// --- Instagram Graph API: latest media -------------------------------------
// Requires two Edge Function secrets:
//   INSTAGRAM_ACCESS_TOKEN          — long-lived Page access token (60 days,
//                                      refresh via the Graph API refresh
//                                      endpoint before expiry)
//   INSTAGRAM_BUSINESS_ACCOUNT_ID   — IG Business/Creator account ID
//                                      (numeric, from Meta Business Suite)
// Cache TTL: 30 minutes — Instagram updates are time-sensitive but the
// API is also more rate-limited than Places.

type IGPost = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
};

app.get("/make-server-ec6100a6/instagram-posts", async (c) => {
  const token = Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
  const igId = Deno.env.get("INSTAGRAM_BUSINESS_ACCOUNT_ID");

  if (!token || !igId) {
    const missing: string[] = [];
    if (!token) missing.push("INSTAGRAM_ACCESS_TOKEN");
    if (!igId) missing.push("INSTAGRAM_BUSINESS_ACCOUNT_ID");
    return c.json(
      {
        error: "Instagram secrets are not set. Add them as Supabase Edge Function secrets.",
        missing,
      },
      503,
    );
  }

  try {
    const { data, cached, stale } = await cachedFetch<{ posts: IGPost[] }>(
      `instagram:${igId}`,
      30 * 60 * 1000, // 30 minutes
      async () => {
        const url = new URL(`https://graph.facebook.com/v18.0/${igId}/media`);
        url.searchParams.set(
          "fields",
          "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp",
        );
        url.searchParams.set("limit", "12");
        url.searchParams.set("access_token", token);

        const res = await fetch(url.toString());
        const json = await res.json();
        if (!res.ok || json.error) {
          throw new Error(
            `Graph API ${res.status}: ${json.error?.message ?? JSON.stringify(json)}`,
          );
        }
        return { posts: (json.data ?? []) as IGPost[] };
      },
    );
    return c.json({ ...data, cached, stale });
  } catch (err) {
    console.log("instagram fetch failed:", err);
    return c.json({ error: String(err) }, 502);
  }
});

// --- Email helper (Strato SMTP) ---------------------------------------------
// Sends transactional emails via Strato's SMTP server (denomailer). The
// mailbox login comes from the SMTP_USER / SMTP_PASS secrets; host/port
// default to smtp.strato.de:465 (implicit TLS) and can be overridden via
// SMTP_HOST / SMTP_PORT. The From address must be the authenticated mailbox
// (Strato rejects foreign senders) — defaults to "Cura Doma <SMTP_USER>",
// override via MAIL_FROM.

// Strip CR/LF/null so user-controlled values can't inject extra SMTP headers.
const headerSafe = (s: string): string => String(s ?? "").replace(/[\r\n\0]/g, " ").trim();

async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  reply_to?: string;
}): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const user = Deno.env.get("SMTP_USER");
  const pass = Deno.env.get("SMTP_PASS");
  if (!user || !pass) {
    return { ok: false, error: "SMTP_USER/SMTP_PASS sind nicht konfiguriert." };
  }
  const to = Array.isArray(opts.to) ? opts.to.filter(Boolean) : opts.to;
  if (!to || (Array.isArray(to) && to.length === 0)) {
    return { ok: false, error: "Kein Empfänger konfiguriert (CONTACT_TO/MAIL_TO/SMTP_USER)." };
  }
  const hostname = Deno.env.get("SMTP_HOST") ?? "smtp.strato.de";
  const port = Number(Deno.env.get("SMTP_PORT") ?? "465");
  const from = Deno.env.get("MAIL_FROM") ?? `Cura Doma <${user}>`;

  const client = new SMTPClient({
    connection: {
      hostname,
      port,
      tls: port === 465, // implicit TLS on 465; denomailer upgrades via STARTTLS on 587
      auth: { username: user, password: pass },
    },
  });

  try {
    await client.send({
      from: headerSafe(from),
      to,
      replyTo: opts.reply_to ? headerSafe(opts.reply_to) : undefined,
      subject: headerSafe(opts.subject),
      // Send the HTML body base64-encoded (not quoted-printable) so no "=20"
      // / "=" artefacts can leak into mail clients or inbox previews.
      mimeContent: [
        { mimeType: "text/html; charset=utf-8", content: opts.html, transferEncoding: "base64" },
      ],
    });
    await client.close();
    return { ok: true };
  } catch (err) {
    try { await client.close(); } catch (_) { /* ignore */ }
    console.log("SMTP send error:", err);
    return { ok: false, error: `SMTP-Fehler: ${(err as Error)?.message ?? err}` };
  }
}

// --- Anti-spam: honeypot + per-IP rate limit --------------------------------
// The public form endpoints have no auth beyond the anon key, so we add two
// cheap guards: a hidden "website" honeypot field (real users never fill it)
// and a per-IP rate limit backed by the KV store. Both fail OPEN on KV errors
// so a storage hiccup never blocks a genuine submission.

const RL_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RL_MAX = 8; // per-IP cap per window (best-effort; X-Forwarded-For is spoofable)
const GLOBAL_DAILY_MAX = Number(Deno.env.get("MAIL_DAILY_MAX") ?? "200"); // hard daily send cap

// X-Forwarded-For can be forged by a direct caller; the trusted Supabase edge
// APPENDS the real client IP, so the RIGHTMOST entry is the least spoofable.
function clientIp(c: { req: { header: (k: string) => string | undefined } }): string {
  const fwd = c.req.header("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return c.req.header("cf-connecting-ip") ?? c.req.header("x-real-ip") ?? "unknown";
}

function isHoneypotTripped(body: Record<string, unknown>): boolean {
  return typeof body.website === "string" && body.website.trim() !== "";
}

async function rateLimitState(key: string): Promise<{ count: number; resetAt: number }> {
  const now = Date.now();
  try {
    const rec = (await kv.get(key)) as { count: number; resetAt: number } | undefined;
    if (rec && now <= rec.resetAt) return rec;
  } catch (e) {
    console.log("rate-limit read failed (failing open):", e);
  }
  return { count: 0, resetAt: now + RL_WINDOW_MS };
}

async function bumpRateLimit(key: string, state: { count: number; resetAt: number }): Promise<void> {
  try {
    await kv.set(key, { count: state.count + 1, resetAt: state.resetAt });
  } catch (e) {
    console.log("rate-limit write failed:", e);
  }
}

// Un-spoofable backstop: a global per-day send counter that bounds total
// outbound mail regardless of source IP, protecting the SMTP quota. Returns
// true (cap reached) WITHOUT incrementing; otherwise increments and returns
// false. The KV has no atomic increment, so under heavy concurrency this may
// overshoot slightly — acceptable for a coarse safety cap.
async function globalMailCapReached(): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  const key = `ratelimit:global:mail:${day}`;
  let count = 0;
  try {
    count = ((await kv.get(key)) as number | undefined) ?? 0;
  } catch (e) {
    console.log("global cap read failed (failing open):", e);
  }
  if (count >= GLOBAL_DAILY_MAX) return true;
  try {
    await kv.set(key, count + 1);
  } catch (e) {
    console.log("global cap write failed:", e);
  }
  return false;
}

const envRecipient = (...keys: string[]): string => {
  for (const k of keys) {
    const v = Deno.env.get(k);
    if (v && v.trim()) return v.trim();
  }
  return "";
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function curaEmailLayout(title: string, bodyHtml: string) {
  // Generic fallback layout used by the job-application notification.
  // The contact-form notification has its own dedicated, full-design
  // template via contactNotificationEmail() below.
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#F4FBFC;font-family:Inter,Arial,sans-serif;color:#2F3A40;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E5F4F5;border-radius:20px;overflow:hidden;">
    <div style="padding:24px 28px;border-bottom:1px solid #E5F4F5;background:#F4FBFC;" bgcolor="#F4FBFC">
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

// Logo URL hosted on a public Supabase Storage bucket. Stable, embeddable
// in emails without auth.
const CURA_LOGO_URL =
  "https://gjcleedoysndaagtsqjb.supabase.co/storage/v1/object/public/Logo/ChatGPT%20Image%202.%20Mai%202026,%2016_07_38.png";

/** Build the rich operator-notification email for a new contact-form
 *  submission. Replaces template placeholders with HTML-escaped data;
 *  optional fields (phone, subject) get sensible defaults so the
 *  rendered email never has gaps. */
function contactNotificationEmail(opts: {
  name: string;
  phone: string | null;
  email: string;
  subject: string | null;
  message: string;
}) {
  const name = escapeHtml(opts.name);
  const email = escapeHtml(opts.email);
  const phoneRaw = opts.phone?.trim();
  const phone = phoneRaw ? escapeHtml(phoneRaw) : null;
  const subject = opts.subject?.trim() ? escapeHtml(opts.subject.trim()) : "Allgemeine Anfrage";
  // Preserve user-entered line breaks in the message body.
  const message = escapeHtml(opts.message).replace(/\n/g, "<br>");

  // Telephone block is only rendered if a phone number was provided.
  const phoneRow = phone
    ? `<tr>
         <td style="padding:12px 0; border-bottom:1px solid #e5e7eb; color:#6b7280;">Telefon</td>
         <td style="padding:12px 0; border-bottom:1px solid #e5e7eb;">${phone}</td>
       </tr>`
    : "";
  const phoneFooter = phone
    ? `<p style="margin:18px 0 0 0; font-size:14px; line-height:1.6; color:#6b7280;">
         Alternativ kann die Person telefonisch unter <strong>${phone}</strong> kontaktiert werden.
       </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cura Doma Anfrage</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f7f6; font-family:Arial, Helvetica, sans-serif; color:#1f2933;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f7f6" style="background-color:#f4f7f6; padding:30px 12px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:650px; background-color:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 8px 28px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td bgcolor="#e7f8f5" style="background-color:#e7f8f5; padding:30px; text-align:center; border-bottom:1px solid #d9f1ed;">
                <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                  <tr>
                    <td valign="middle" style="padding-right:14px;">
                      <img src="${CURA_LOGO_URL}" alt="Cura Doma Logo" width="55" style="display:block; width:55px; max-width:55px; height:auto; border:0;" />
                    </td>
                    <td valign="middle" style="text-align:left;">
                      <div style="font-size:30px; font-weight:700; color:#3f4548; line-height:1.1; letter-spacing:0.3px;">
                        Cura <span style="font-weight:400; color:#14b8a6;">Doma</span>
                      </div>
                      <div style="margin-top:6px; font-size:14px; color:#4b5563; letter-spacing:0.3px;">Ambulanter Betreuungsdienst</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Intro -->
            <tr>
              <td style="padding:36px 34px 20px 34px;">
                <h1 style="margin:0 0 14px 0; font-size:26px; line-height:1.3; color:#0f3f3a;">
                  Neue Anfrage über die Cura Doma Webseite
                </h1>
                <p style="margin:0; font-size:16px; line-height:1.7; color:#4b5563;">
                  Über das Kontaktformular der Cura Doma Webseite wurde eine neue Anfrage übermittelt.
                  Die Kontaktdaten und die Nachricht der anfragenden Person finden Sie unten.
                </p>
              </td>
            </tr>

            <!-- Hinweisbox -->
            <tr>
              <td style="padding:18px 34px 8px 34px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ecfdf9" style="background-color:#ecfdf9; border-left:5px solid #14b8a6; border-radius:12px;">
                  <tr>
                    <td style="padding:20px;">
                      <p style="margin:0; font-size:15px; line-height:1.6; color:#134e4a;">
                        <strong>Hinweis:</strong><br />
                        Bitte prüfen Sie die Anfrage und nehmen Sie zeitnah Kontakt mit der Person auf.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Kontaktdaten -->
            <tr>
              <td style="padding:26px 34px 10px 34px;">
                <h2 style="margin:0 0 16px 0; font-size:20px; color:#0f3f3a;">Kontaktdaten der Anfrage</h2>
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; font-size:15px; color:#374151;">
                  <tr>
                    <td style="padding:12px 0; border-bottom:1px solid #e5e7eb; width:35%; color:#6b7280;">Name</td>
                    <td style="padding:12px 0; border-bottom:1px solid #e5e7eb;">${name}</td>
                  </tr>
                  ${phoneRow}
                  <tr>
                    <td style="padding:12px 0; border-bottom:1px solid #e5e7eb; color:#6b7280;">E-Mail</td>
                    <td style="padding:12px 0; border-bottom:1px solid #e5e7eb;"><a href="mailto:${email}" style="color:#14b8a6; text-decoration:none;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0; border-bottom:1px solid #e5e7eb; color:#6b7280;">Anliegen</td>
                    <td style="padding:12px 0; border-bottom:1px solid #e5e7eb;">${subject}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Nachricht -->
            <tr>
              <td style="padding:22px 34px 10px 34px;">
                <h2 style="margin:0 0 12px 0; font-size:20px; color:#0f3f3a;">Nachricht</h2>
                <div style="background-color:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:18px; font-size:15px; line-height:1.7; color:#374151;">
                  ${message}
                </div>
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td align="center" style="padding:32px 34px 34px 34px;">
                <a href="mailto:${email}" style="display:inline-block; background-color:#14b8a6; color:#ffffff; text-decoration:none; font-size:15px; font-weight:700; padding:14px 28px; border-radius:999px;">
                  Direkt per E-Mail antworten
                </a>
                ${phoneFooter}
              </td>
            </tr>

            <!-- Trennlinie -->
            <tr>
              <td style="padding:0 34px;"><div style="height:1px; background-color:#e5e7eb;"></div></td>
            </tr>

            <!-- Cura Doma Kontaktdaten -->
            <tr>
              <td style="padding:26px 34px; background-color:#ffffff;">
                <h2 style="margin:0 0 14px 0; font-size:18px; color:#0f3f3a;">Cura Doma Kontaktdaten</h2>
                <p style="margin:0; font-size:15px; line-height:1.8; color:#4b5563;">
                  <strong style="color:#0f3f3a;">Cura Doma</strong><br />
                  Ambulanter Betreuungsdienst<br /><br />
                  Telefon: <a href="tel:+4951517107093" style="color:#14b8a6; text-decoration:none;">05151 710 7093</a><br />
                  E-Mail: <a href="mailto:info@curadoma.de" style="color:#14b8a6; text-decoration:none;">info@curadoma.de</a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td bgcolor="#3f4548" style="background-color:#3f4548; padding:22px 30px; text-align:center;">
                <p style="margin:0 0 8px 0; font-size:13px; line-height:1.6; color:#e5f7f4;">
                  Diese E-Mail wurde automatisch über die Cura Doma Webseite versendet.
                </p>
                <p style="margin:0; font-size:12px; line-height:1.6; color:#b6e7df;">
                  © 2026 Cura Doma – Ambulanter Betreuungsdienst. Alle Rechte vorbehalten.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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

    // Honeypot: pretend success so bots don't retry, but do nothing.
    if (isHoneypotTripped(body)) {
      console.log("Honeypot tripped on contact endpoint");
      return c.json({ ok: true, id: crypto.randomUUID(), created_at: new Date().toISOString(), email_sent: true }, 201);
    }

    // Per-IP rate limit (checked here, incremented only once we store a row).
    const rlKey = `ratelimit:contact:${clientIp(c)}`;
    const rl = await rateLimitState(rlKey);
    if (rl.count >= RL_MAX) {
      return c.json({ error: "Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut." }, 429);
    }
    await bumpRateLimit(rlKey, rl); // count up-front so bursts/invalid payloads also throttle

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

    const emailRes = (await globalMailCapReached())
      ? { ok: false as const, error: "Tägliches Mail-Limit erreicht." }
      : await sendEmail({
      // Recipient via secret: CONTACT_TO → MAIL_TO → the SMTP mailbox itself.
      to: envRecipient("CONTACT_TO", "MAIL_TO", "SMTP_USER"),
      reply_to: email,
      subject: `Neue Anfrage von ${name}${subject ? ` — ${subject}` : ""}`,
      text: `Neue Kontaktanfrage über curadoma.de\n\nName: ${name}\nE-Mail: ${email}\nTelefon: ${phone ?? "—"}\nBetreff: ${subject ?? "—"}\nSeite: ${page_source ?? "—"}\nEingegangen: ${created_at}\n\nNachricht:\n${message}`,
      html: contactNotificationEmail({ name, phone, email, subject, message }),
    });
    if (!emailRes.ok) console.log("Contact email send failed:", emailRes.error);

    return c.json(
      {
        ok: true,
        id,
        created_at,
        email_sent: emailRes.ok,
        // Surface the upstream error so the operator can see *why* an
        // email didn't go out (e.g. Resend domain-not-verified) without
        // having to dig through Supabase function logs.
        email_error: emailRes.ok ? undefined : emailRes.error,
      },
      201,
    );
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

    if (isHoneypotTripped(body)) {
      console.log("Honeypot tripped on job-applications endpoint");
      return c.json({ ok: true, id: crypto.randomUUID(), created_at: new Date().toISOString(), email_sent: true }, 201);
    }

    const rlKey = `ratelimit:job:${clientIp(c)}`;
    const rl = await rateLimitState(rlKey);
    if (rl.count >= RL_MAX) {
      return c.json({ error: "Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut." }, 429);
    }
    await bumpRateLimit(rlKey, rl); // count up-front so bursts/invalid payloads also throttle
    const jobRecipient = envRecipient("JOB_TO", "MAIL_TO", "SMTP_USER");

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
      target_email: jobRecipient,
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

    const emailRes = (await globalMailCapReached())
      ? { ok: false as const, error: "Tägliches Mail-Limit erreicht." }
      : await sendEmail({
      to: jobRecipient,
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

    return c.json(
      {
        ok: true,
        id,
        created_at,
        email_sent: emailRes.ok,
        email_error: emailRes.ok ? undefined : emailRes.error,
      },
      201,
    );
  } catch (error) {
    console.log("Error while storing job application:", error);
    return c.json({ error: `Serverfehler beim Speichern der Bewerbung: ${error}` }, 500);
  }
});

Deno.serve(app.fetch);
