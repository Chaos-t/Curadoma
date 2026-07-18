import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.ts";
import {
  isAdminType, isAdminStatus, isUuid, keyFor, prefixFor,
  sanitizeNote, buildCsv, CSV_COLUMNS, yesNo, type AdminType,
} from "./admin_util.ts";

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

// --- Email helper (raw SMTP over TLS) ---------------------------------------
// Sends a SINGLE-PART text/html email via Strato SMTP using a minimal
// hand-rolled SMTP conversation. We deliberately DO NOT use a mailer library:
// denomailer 1.6.0 ALWAYS wraps the body in multipart/mixed > multipart/
// alternative (boundaries "attachment100"/"message100"), and that nested
// structure renders as raw MIME source in Strato webmail. A single text/html
// part (base64-encoded, no boundary) renders correctly in every client.
//
// Config via secrets: SMTP_USER / SMTP_PASS (login), SMTP_HOST (default
// smtp.strato.de), SMTP_PORT (default 465 = implicit TLS; 587 = STARTTLS),
// MAIL_FROM (default "Cura Doma <SMTP_USER>"; Strato rejects foreign senders).

// Strip CR/LF/null so user-controlled values can't inject extra SMTP headers.
const headerSafe = (s: string): string => String(s ?? "").replace(/[\r\n\0]/g, " ").trim();

const base64Utf8 = (s: string): string => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};

// Split base64 into 76-char lines (RFC 2045) joined with CRLF.
const chunk76 = (s: string): string => (s.match(/.{1,76}/g) ?? []).join("\r\n");

const extractEmail = (addr: string): string => {
  const m = String(addr).match(/<([^>]+)>/);
  return (m ? m[1] : String(addr)).trim();
};

const rfc2822Date = (d: Date): string => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const p = (n: number) => String(n).padStart(2, "0");
  return `${days[d.getUTCDay()]}, ${p(d.getUTCDate())} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()} ` +
    `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} +0000`;
};

// Build the full RFC822 message (headers + base64 body + terminating dot) for
// the SMTP DATA command. SINGLE-PART text/html — no multipart, no boundary.
function buildRawMessage(
  fromHeader: string,
  toList: string[],
  replyTo: string,
  subject: string,
  html: string,
): string {
  const subjectHeader = `=?UTF-8?B?${base64Utf8(headerSafe(subject))}?=`;
  const body = chunk76(base64Utf8(html))
    .split("\r\n")
    .map((l) => (l.startsWith(".") ? "." + l : l)) // SMTP dot-stuffing (guard)
    .join("\r\n");
  const headers = [
    `From: ${fromHeader}`,
    `To: ${toList.join(", ")}`,
    replyTo ? `Reply-To: ${replyTo}` : null,
    `Subject: ${subjectHeader}`,
    `Date: ${rfc2822Date(new Date())}`,
    `Message-ID: <${crypto.randomUUID()}@curadoma.de>`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
  ].filter(Boolean).join("\r\n");
  return `${headers}\r\n\r\n${body}\r\n.\r\n`;
}

async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  reply_to?: string;
}): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const user = Deno.env.get("SMTP_USER");
  const pass = Deno.env.get("SMTP_PASS");
  if (!user || !pass) return { ok: false, error: "SMTP_USER/SMTP_PASS sind nicht konfiguriert." };

  const toList = (Array.isArray(opts.to) ? opts.to : [opts.to])
    .filter(Boolean)
    .map((a) => extractEmail(headerSafe(a)));
  if (toList.length === 0) return { ok: false, error: "Kein Empfänger konfiguriert (CONTACT_TO/MAIL_TO/SMTP_USER)." };

  const hostname = Deno.env.get("SMTP_HOST") ?? "smtp.strato.de";
  const port = Number(Deno.env.get("SMTP_PORT") ?? "465");
  const fromHeader = headerSafe(Deno.env.get("MAIL_FROM") ?? `Cura Doma <${user}>`);
  const fromEmail = extractEmail(fromHeader);
  const replyTo = opts.reply_to ? extractEmail(headerSafe(opts.reply_to)) : "";

  let conn: Deno.Conn | null = null;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const readBuf = new Uint8Array(8192);

  // Read a full SMTP reply (handles multi-line replies: continuation lines use
  // "250-", the final line uses "250 ").
  const readResponse = async (): Promise<{ code: number; text: string }> => {
    let data = "";
    while (true) {
      const n = await conn!.read(readBuf);
      if (n === null) break;
      data += decoder.decode(readBuf.subarray(0, n));
      const lines = data.split("\n").map((l) => l.replace(/\r$/, "")).filter((l) => l.length > 0);
      const last = lines[lines.length - 1] ?? "";
      if (/^\d{3} /.test(last)) break;
    }
    const m = data.match(/(\d{3})/);
    return { code: m ? Number(m[1]) : 0, text: data.trim() };
  };
  const write = (line: string) => conn!.write(encoder.encode(line + "\r\n"));
  const expect = (res: { code: number; text: string }, ok: number[]) => {
    if (!ok.includes(res.code)) throw new Error(`SMTP ${res.code}: ${res.text.slice(0, 200)}`);
  };

  try {
    conn = port === 465
      ? await Deno.connectTls({ hostname, port })
      : await Deno.connect({ hostname, port });
    expect(await readResponse(), [220]);
    await write(`EHLO ${hostname}`);
    expect(await readResponse(), [250]);

    if (port !== 465) {
      await write("STARTTLS");
      expect(await readResponse(), [220]);
      conn = await Deno.startTls(conn as Deno.TcpConn, { hostname });
      await write(`EHLO ${hostname}`);
      expect(await readResponse(), [250]);
    }

    await write("AUTH LOGIN");
    expect(await readResponse(), [334]);
    await write(base64Utf8(user));
    expect(await readResponse(), [334]);
    await write(base64Utf8(pass));
    expect(await readResponse(), [235]);

    await write(`MAIL FROM:<${fromEmail}>`);
    expect(await readResponse(), [250]);
    for (const rcpt of toList) {
      await write(`RCPT TO:<${rcpt}>`);
      expect(await readResponse(), [250, 251]);
    }
    await write("DATA");
    expect(await readResponse(), [354]);

    await conn.write(encoder.encode(buildRawMessage(fromHeader, toList, replyTo, opts.subject, opts.html)));
    expect(await readResponse(), [250]);

    await write("QUIT");
    try { await readResponse(); } catch (_) { /* ignore */ }
    try { conn.close(); } catch (_) { /* ignore */ }
    return { ok: true };
  } catch (err) {
    try { conn?.close(); } catch (_) { /* ignore */ }
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
  // Mobile: viewport meta + slim paddings so the card uses the full phone
  // width; content tables wrap (see rowsTable) so nothing is clipped.
  return `<!doctype html><html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
  <body style="margin:0;padding:14px;background:#F4FBFC;font-family:Inter,Arial,sans-serif;color:#2F3A40;-webkit-text-size-adjust:100%;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E5F4F5;border-radius:20px;overflow:hidden;">
    <div style="padding:20px;border-bottom:1px solid #E5F4F5;background:#F4FBFC;" bgcolor="#F4FBFC">
      <div style="font-family:'Lora',Georgia,serif;font-size:22px;color:#6FBDB8;letter-spacing:0.4px;">Cura Doma</div>
      <div style="font-size:10px;letter-spacing:3px;color:#9AA3A8;margin-top:4px;">AMBULANTER BETREUUNGSDIENST</div>
    </div>
    <div style="padding:20px;">
      <h1 style="font-size:18px;margin:0 0 16px;color:#111111;font-weight:500;">${escapeHtml(title)}</h1>
      ${bodyHtml}
    </div>
    <div style="padding:16px 20px;border-top:1px solid #E5F4F5;font-size:11px;color:#9AA3A8;">
      Diese Nachricht wurde automatisch über die Cura Doma Website gesendet.
    </div>
  </div></body></html>`;
}

// Format an ISO timestamp as a readable German date/time in Europe/Berlin.
function fmtDateDe(iso: string): string {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      timeZone: "Europe/Berlin",
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso)) + " Uhr";
  } catch {
    return iso;
  }
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
  // table-layout:fixed + word-break makes the table exactly as wide as the
  // card and forces long values (phone, e-mail, timestamps, long titles) to
  // wrap instead of overflowing off the right edge on small screens.
  const cell = "padding:7px 0;vertical-align:top;word-break:break-word;overflow-wrap:anywhere;";
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;table-layout:fixed;">
    ${rows
      .filter(([, v]) => v !== null && v !== undefined && String(v).length > 0)
      .map(
        ([k, v]) =>
          `<tr><td style="${cell}padding-right:10px;width:42%;color:#5F6B73;">${escapeHtml(k)}</td><td style="${cell}color:#111111;">${escapeHtml(String(v))}</td></tr>`,
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

// --- CV upload (Supabase Storage) -------------------------------------------
// The applicant's CV is base64-encoded by the frontend and uploaded here to a
// PRIVATE Storage bucket. The operator email then carries a signed download
// link (private bucket → not publicly guessable, GDPR-friendly). Everything is
// FAIL-SOFT: if the upload fails the application is still stored and the email
// still goes out (with a note), so a CV problem never loses an application.

const CV_BUCKET = "bewerbungen";
const MAX_CV_BYTES = 5 * 1024 * 1024; // 5 MB (keeps the JSON payload well within limits)
const ALLOWED_CV_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const CV_SIGNED_URL_TTL_S = 60 * 60 * 24 * 90; // 90 days

function sanitizeFilename(name: string): string {
  const cleaned = String(name ?? "")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[._]+/, "")
    .slice(0, 120);
  return cleaned || "lebenslauf";
}

function decodeBase64(b64: string): Uint8Array {
  // Accept raw base64 or a data URL ("data:application/pdf;base64,....").
  const payload = b64.includes(",") ? b64.slice(b64.indexOf(",") + 1) : b64;
  const bin = atob(payload.trim());
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function uploadCv(
  id: string,
  base64: string,
  filename: string,
  mimetype: string,
): Promise<{ url: string; path: string } | { error: string }> {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return { error: "Storage nicht konfiguriert (SUPABASE_URL/SERVICE_ROLE_KEY fehlt)." };
    if (mimetype && !ALLOWED_CV_TYPES.has(mimetype)) return { error: `Dateityp nicht erlaubt: ${mimetype}` };
    // Reject oversized payloads BEFORE decoding so a hostile client can't make
    // us allocate a huge buffer (base64 is ~1.37× the binary size).
    if (base64.length > Math.ceil(MAX_CV_BYTES * 1.4)) return { error: "Datei zu groß (max. 5 MB)." };

    const bytes = decodeBase64(base64);
    if (bytes.length === 0) return { error: "Leere Datei." };
    if (bytes.length > MAX_CV_BYTES) return { error: "Datei zu groß (max. 5 MB)." };

    const supabase = createClient(url, key);
    // Ensure the private bucket exists (errors harmlessly if already present).
    await supabase.storage.createBucket(CV_BUCKET, { public: false });

    const path = `${id}/${sanitizeFilename(filename)}`;
    const { error: upErr } = await supabase.storage
      .from(CV_BUCKET)
      .upload(path, bytes, { contentType: mimetype || "application/octet-stream", upsert: true });
    if (upErr) return { error: upErr.message };

    const { data: signed, error: sErr } = await supabase.storage
      .from(CV_BUCKET)
      // `download` makes the link save the file (Content-Disposition: attachment)
      // with the original name, instead of rendering inline in the browser.
      .createSignedUrl(path, CV_SIGNED_URL_TTL_S, { download: filename || true });
    if (sErr || !signed?.signedUrl) return { error: sErr?.message ?? "Signierte URL fehlgeschlagen." };

    return { url: signed.signedUrl, path };
  } catch (e) {
    return { error: String((e as Error)?.message ?? e) };
  }
}

// --- Job applications -------------------------------------------------------
// Stored under key prefix `job_application:<id>`. The operator notification is
// sent via Strato SMTP (see sendEmail). The uploaded CV is stored in Supabase
// Storage and linked from the email (see uploadCv above).

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

    // CV upload (fail-soft): store the uploaded file in Storage and keep a
    // signed download link. A failure here never blocks the application.
    const cvFilename = String(body.cv_filename ?? "").trim() || null;
    const cvBase64 = typeof body.cv_base64 === "string" ? body.cv_base64 : "";
    const cvMimetype = String(body.cv_mimetype ?? "").trim();
    let cvUrl: string | null = null;
    let cvPath: string | null = null;
    let cvError: string | null = null;
    if (cvBase64) {
      const up = await uploadCv(id, cvBase64, cvFilename ?? "lebenslauf", cvMimetype);
      if ("url" in up) {
        cvUrl = up.url;
        cvPath = up.path;
      } else {
        cvError = up.error;
        console.log("CV upload failed:", up.error);
      }
    }

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
      cv_filename: cvFilename,
      cv_path: cvPath,
      cv_mimetype: cvMimetype || null,
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
      ["Eingegangen", fmtDateDe(created_at)],
    ];

    // CV section for the email — a real download button when the upload
    // succeeded, otherwise an honest status line.
    const cvHtml = cvUrl
      ? `<p style="margin-top:18px;"><a href="${cvUrl}" style="display:inline-block;background:#6FBDB8;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;font-size:14px;">Lebenslauf herunterladen</a></p>
         <p style="margin-top:8px;font-size:12px;color:#9AA3A8;">Datei: ${escapeHtml(cvFilename ?? "Lebenslauf")} · Link 90&nbsp;Tage gültig.</p>`
      : cvFilename
        ? `<p style="margin-top:14px;font-size:13px;color:#9AA3A8;">Lebenslauf „${escapeHtml(cvFilename)}" wurde hochgeladen, konnte aber nicht gespeichert werden${cvError ? ` (${escapeHtml(cvError)})` : ""}. Bitte ggf. beim Bewerber anfordern.</p>`
        : `<p style="margin-top:14px;font-size:13px;color:#9AA3A8;">Es wurde kein Lebenslauf hochgeladen.</p>`;
    const cvText = cvUrl
      ? `\n\nLebenslauf (${cvFilename ?? "Datei"}) herunterladen:\n${cvUrl}\n(Link 90 Tage gültig.)`
      : cvFilename
        ? `\n\nHinweis: Lebenslauf "${cvFilename}" konnte nicht gespeichert werden${cvError ? ` (${cvError})` : ""} — bitte beim Bewerber anfordern.`
        : `\n\nHinweis: Es wurde kein Lebenslauf hochgeladen.`;

    const emailRes = (await globalMailCapReached())
      ? { ok: false as const, error: "Tägliches Mail-Limit erreicht." }
      : await sendEmail({
      to: jobRecipient,
      reply_to: email,
      subject: `Neue Bewerbung: ${record.job} — ${name}`,
      text: rows
        .filter(([, v]) => v !== null && v !== undefined && String(v).length > 0)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n") + `\n\nMotivation:\n${message || "—"}` + cvText,
      html: curaEmailLayout(
        "Neue Bewerbung",
        `${rowsTable(rows)}<div style="margin-top:18px;padding:14px 16px;background:#F4FBFC;border-radius:12px;color:#2F3A40;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;font-size:14px;line-height:1.55;"><strong style="display:block;margin-bottom:6px;color:#111111;">Motivation</strong>${escapeHtml(message || "—")}</div>${cvHtml}`,
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

// --- Appointment booking ----------------------------------------------------
// Visitors request a slot (status 'pending'); the operator confirms/declines
// via tokenized links in the notification email. Confirming locks the slot.
// Stored as `appointment:<id>` in the KV store (same pattern as the other
// forms). Slot availability is computed by scanning confirmed appointments.

const APPT_SERVICES = [
  "Kostenloses Erstgespräch",
  "Entlastungsleistungen",
  "Demenz- & Seniorenbetreuung",
  "Haushaltsnahe Dienstleistungen",
  "Verhinderungspflege",
];
const APPT_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
const APPT_TZ = "Europe/Berlin";

function todayBerlinISO(): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APPT_TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}
function isPastISO(d: string): boolean {
  return d < todayBerlinISO();
}
function isWeekdayISO(d: string): boolean {
  // noon UTC avoids any date shift; getUTCDay 1..5 = Mon..Fri
  const dow = new Date(`${d}T12:00:00Z`).getUTCDay();
  return dow >= 1 && dow <= 5;
}
function fmtApptDate(dateISO: string): string {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      timeZone: APPT_TZ, weekday: "short", day: "2-digit", month: "long", year: "numeric",
    }).format(new Date(`${dateISO}T12:00:00`));
  } catch {
    return dateISO;
  }
}

function apptOperatorEmail(o: {
  service: string; dateDe: string; time: string; name: string; phone: string;
  email: string; message: string; funcBase: string; token: string;
}) {
  const confirmUrl = `${o.funcBase}/appointment-action?token=${o.token}&action=confirm`;
  const declineUrl = `${o.funcBase}/appointment-action?token=${o.token}&action=decline`;
  const rows: Array<[string, string | null | undefined]> = [
    ["Leistung", o.service],
    ["Datum", o.dateDe],
    ["Uhrzeit", `${o.time} Uhr`],
    ["Name", o.name],
    ["Telefon", o.phone],
    ["E-Mail", o.email],
    ["Nachricht", o.message || null],
  ];
  return curaEmailLayout(
    "Neue Terminanfrage",
    `${rowsTable(rows)}
     <p style="margin:18px 0 10px;font-size:14px;line-height:1.55;color:#2F3A40;">Bitte bestätigen oder ablehnen — die anfragende Person wird automatisch per E-Mail informiert:</p>
     <p style="margin:0 0 8px;"><a href="${confirmUrl}" style="display:inline-block;background:#6FBDB8;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;font-size:14px;">Termin bestätigen</a></p>
     <p style="margin:0;"><a href="${declineUrl}" style="display:inline-block;background:#ffffff;color:#5F6B73;border:1px solid #E5F4F5;text-decoration:none;font-weight:600;padding:11px 22px;border-radius:999px;font-size:14px;">Ablehnen</a></p>
     <p style="margin-top:14px;font-size:12px;color:#9AA3A8;">Erst mit „Bestätigen" wird der Zeit-Slot gesperrt.</p>`,
  );
}
function apptReceivedEmail(o: { service: string; dateDe: string; time: string; name: string }) {
  const rows: Array<[string, string | null | undefined]> = [
    ["Leistung", o.service],
    ["Wunschtermin", `${o.dateDe}, ${o.time} Uhr`],
  ];
  return curaEmailLayout(
    "Ihre Terminanfrage ist eingegangen",
    `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#2F3A40;">Hallo ${escapeHtml(o.name)},<br><br>vielen Dank für Ihre Terminanfrage. Wir prüfen Ihren Wunschtermin und bestätigen ihn in Kürze per E-Mail. <strong>Erst mit unserer Bestätigung ist der Termin verbindlich.</strong></p>
     ${rowsTable(rows)}
     <p style="margin-top:16px;font-size:13px;color:#5F6B73;">Falls es dringend ist, erreichen Sie uns telefonisch unter <a href="tel:+4951517107093" style="color:#6FBDB8;text-decoration:none;">05151 7107093</a>.</p>`,
  );
}
function apptConfirmedEmail(o: { service: string; dateDe: string; time: string; name: string }) {
  const rows: Array<[string, string | null | undefined]> = [
    ["Leistung", o.service],
    ["Termin", `${o.dateDe}, ${o.time} Uhr`],
  ];
  return curaEmailLayout(
    "Ihr Termin ist bestätigt",
    `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#2F3A40;">Hallo ${escapeHtml(o.name)},<br><br>Ihr Termin ist <strong>bestätigt</strong>. Wir freuen uns auf das Gespräch mit Ihnen.</p>
     ${rowsTable(rows)}
     <p style="margin-top:16px;font-size:13px;color:#5F6B73;">Sollten Sie den Termin nicht wahrnehmen können, geben Sie uns bitte kurz Bescheid: <a href="tel:+4951517107093" style="color:#6FBDB8;text-decoration:none;">05151 7107093</a> oder <a href="mailto:info@curadoma.de" style="color:#6FBDB8;text-decoration:none;">info@curadoma.de</a>.</p>`,
  );
}
function apptDeclinedEmail(o: { service: string; dateDe: string; time: string; name: string }) {
  const rows: Array<[string, string | null | undefined]> = [
    ["Leistung", o.service],
    ["Angefragt", `${o.dateDe}, ${o.time} Uhr`],
  ];
  return curaEmailLayout(
    "Zu Ihrer Terminanfrage",
    `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#2F3A40;">Hallo ${escapeHtml(o.name)},<br><br>leider können wir Ihren Wunschtermin nicht bestätigen. Bitte wählen Sie auf unserer Website einen anderen Termin oder rufen Sie uns an — wir finden gemeinsam eine passende Zeit.</p>
     ${rowsTable(rows)}
     <p style="margin-top:16px;"><a href="https://curadoma.de/termin" style="display:inline-block;background:#6FBDB8;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;font-size:14px;">Neuen Termin wählen</a></p>
     <p style="margin-top:12px;font-size:13px;color:#5F6B73;">Oder telefonisch: <a href="tel:+4951517107093" style="color:#6FBDB8;text-decoration:none;">05151 7107093</a>.</p>`,
  );
}

// GET /booked-slots — confirmed slots only (date + time, NO personal data).
app.get("/make-server-ec6100a6/booked-slots", async (c) => {
  try {
    const today = todayBerlinISO();
    const all = (await kv.getByPrefix("appointment:")) as Array<Record<string, unknown>>;
    const slots = all
      .filter((a) => a?.status === "confirmed" && typeof a.appt_date === "string" && (a.appt_date as string) >= today)
      .map((a) => ({ date: a.appt_date, time: a.appt_time }));
    return c.json({ slots });
  } catch (e) {
    console.log("booked-slots error:", e);
    return c.json({ slots: [] }); // fail-open
  }
});

// POST /appointments — create a pending request, notify operator + visitor.
app.post("/make-server-ec6100a6/appointments", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return c.json({ error: "Ungültige Anfrage: Body fehlt oder ist kein JSON." }, 400);
    }
    if (isHoneypotTripped(body)) {
      console.log("Honeypot tripped on appointments endpoint");
      return c.json({ ok: true, id: crypto.randomUUID() }, 201);
    }
    const rlKey = `ratelimit:appt:${clientIp(c)}`;
    const rl = await rateLimitState(rlKey);
    if (rl.count >= RL_MAX) {
      return c.json({ error: "Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut." }, 429);
    }
    await bumpRateLimit(rlKey, rl);

    const service = String(body.service ?? "").trim();
    const dateISO = String(body.date_iso ?? "").trim();
    const time = String(body.time ?? "").trim();
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim();
    const message = String(body.message ?? "").trim().slice(0, LIMITS.MESSAGE_MAX);
    const consent_privacy = Boolean(body.consent_privacy);

    const errors: Record<string, string> = {};
    if (!APPT_SERVICES.includes(service)) errors.service = "Bitte wählen Sie eine Leistung.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO) || isPastISO(dateISO) || !isWeekdayISO(dateISO)) {
      errors.date = "Bitte wählen Sie einen gültigen Werktag (Mo–Fr, nicht in der Vergangenheit).";
    }
    if (!APPT_SLOTS.includes(time)) errors.time = "Bitte wählen Sie eine gültige Uhrzeit.";
    if (!name) errors.name = "Bitte geben Sie Ihren Namen an.";
    else if (!isValidName(name)) errors.name = "Bitte geben Sie einen echten Namen ein.";
    if (!phone) errors.phone = "Bitte geben Sie eine Telefonnummer an.";
    else if (!isValidPhone(phone)) errors.phone = "Bitte geben Sie eine gültige Telefonnummer an.";
    if (!email) errors.email = "Bitte geben Sie Ihre E-Mail-Adresse an.";
    else if (!isValidEmail(email)) errors.email = "Bitte geben Sie eine gültige E-Mail-Adresse an.";
    if (!consent_privacy) errors.consent_privacy = "Bitte stimmen Sie der Datenschutzerklärung zu.";
    if (Object.keys(errors).length > 0) {
      return c.json({ error: "Validierung fehlgeschlagen.", fields: errors }, 422);
    }

    // Double-booking: block only against CONFIRMED appointments (like de Vries).
    const existing = (await kv.getByPrefix("appointment:")) as Array<Record<string, unknown>>;
    const taken = existing.some(
      (a) => a?.status === "confirmed" && a.appt_date === dateISO && a.appt_time === time,
    );
    if (taken) return c.json({ error: "slot_taken" }, 409);

    const id = crypto.randomUUID();
    const token = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const record = {
      id, created_at, service, appt_date: dateISO, appt_time: time,
      name, phone, email, message: message || null, consent_privacy,
      status: "pending", token, status_changed_at: null,
    };
    await kv.set(`appointment:${id}`, record);

    const apptRecipient = envRecipient("APPT_TO", "JOB_TO", "MAIL_TO", "SMTP_USER");
    const funcBase = `${Deno.env.get("SUPABASE_URL")}/functions/v1/make-server-ec6100a6`;
    const dateDe = fmtApptDate(dateISO);

    if (!(await globalMailCapReached())) {
      // Operator notification (with confirm/decline links)
      const opRes = await sendEmail({
        to: apptRecipient,
        reply_to: email,
        subject: `Neue Terminanfrage: ${service} — ${dateDe} ${time} Uhr`,
        text: "",
        html: apptOperatorEmail({ service, dateDe, time, name, phone, email, message, funcBase, token }),
      });
      if (!opRes.ok) console.log("Appointment operator email failed:", opRes.error);
      // Visitor "request received"
      const visRes = await sendEmail({
        to: email,
        subject: `Ihre Terminanfrage bei Cura Doma — ${dateDe} ${time} Uhr`,
        text: "",
        html: apptReceivedEmail({ service, dateDe, time, name }),
      });
      if (!visRes.ok) console.log("Appointment visitor email failed:", visRes.error);
    }

    return c.json({ ok: true, id, created_at }, 201);
  } catch (error) {
    console.log("Error while storing appointment:", error);
    return c.json({ error: `Serverfehler beim Speichern der Terminanfrage: ${error}` }, 500);
  }
});

// GET /appointment-action — operator confirm/decline from the email link.
// Opened directly from an email (no auth header), so the function must be
// deployed with --no-verify-jwt. Always 302-redirects to the SPA status page.
app.get("/make-server-ec6100a6/appointment-action", async (c) => {
  const siteUrl = Deno.env.get("SITE_URL") ?? "https://curadoma.de";
  const redirect = (s: string) => c.redirect(`${siteUrl}/termin-status?s=${s}`, 302);
  const token = String(c.req.query("token") ?? "");
  const action = String(c.req.query("action") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(token) || (action !== "confirm" && action !== "decline")) {
    return redirect("invalid");
  }
  try {
    const all = (await kv.getByPrefix("appointment:")) as Array<Record<string, unknown>>;
    const appt = all.find((a) => a?.token === token) as Record<string, unknown> | undefined;
    if (!appt) return redirect("notfound");
    if (appt.status === "confirmed") return redirect("already-confirmed");
    if (appt.status === "declined") return redirect("already-declined");

    const dateDe = fmtApptDate(String(appt.appt_date));
    const mailArgs = {
      service: String(appt.service), dateDe, time: String(appt.appt_time), name: String(appt.name),
    };
    if (action === "confirm") {
      // Race guard: another booking may have just been confirmed for this slot.
      const taken = all.some(
        (a) => a?.status === "confirmed" && a.appt_date === appt.appt_date && a.appt_time === appt.appt_time,
      );
      if (taken) return redirect("taken");
      appt.status = "confirmed";
      appt.status_changed_at = new Date().toISOString();
      await kv.set(`appointment:${appt.id}`, appt);
      if (!(await globalMailCapReached())) {
        await sendEmail({
          to: String(appt.email),
          subject: `Ihr Termin bei Cura Doma ist bestätigt — ${dateDe} ${appt.appt_time} Uhr`,
          text: "",
          html: apptConfirmedEmail(mailArgs),
        });
      }
      return redirect("confirmed");
    } else {
      appt.status = "declined";
      appt.status_changed_at = new Date().toISOString();
      await kv.set(`appointment:${appt.id}`, appt);
      if (!(await globalMailCapReached())) {
        await sendEmail({
          to: String(appt.email),
          subject: "Zu Ihrer Terminanfrage bei Cura Doma",
          text: "",
          html: apptDeclinedEmail(mailArgs),
        });
      }
      return redirect("declined");
    }
  } catch (error) {
    console.log("appointment-action error:", error);
    return redirect("invalid");
  }
});

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
  // Same-origin relative paths only: reject a second leading slash so a
  // protocol-relative "//evil.com" (external host) can't pass as "relative".
  return /^https?:\/\//i.test(h) || /^mailto:/i.test(h) || /^tel:/i.test(h) || /^\/(?!\/)[\w./-]*$/.test(h) || /^#[\w-]+$/.test(h);
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
// Editor-Client-IP: bevorzugt plattform-gesetzte, vom Client NICHT faelschbare
// Header (cf-connecting-ip / x-real-ip) VOR X-Forwarded-For. So kann ein Angreifer
// die per-IP-Sperre nicht durch selbst gesetzte XFF-Eintraege umgehen. Faellt auf
// den rechtesten XFF-Eintrag zurueck, falls kein Plattform-Header vorhanden ist.
function editorClientIp(c: { req: { header: (k: string) => string | undefined } }): string {
  const real = c.req.header("cf-connecting-ip") ?? c.req.header("x-real-ip");
  if (real && real.trim()) return real.trim();
  const fwd = c.req.header("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return "unknown";
}
// Editor-Rate-Limit: nur bei FEHLERN hochzählen (per IP + global); Fenster = RL_WINDOW_MS.
// Anders als bei den oeffentlichen Endpunkten faellt der Editor bei KV-Lesefehlern
// CLOSED (429) statt open — lieber eine kurze Login-Sperre bei KV-Ausfall als eine
// ausgefallene Brute-Force-Bremse (Editor = Low-Traffic-Admin; Speichern waere bei
// KV-Ausfall ohnehin nicht moeglich).
async function editRateCount(key: string): Promise<number> {
  const now = Date.now();
  // wirft bei KV-Lesefehler -> Aufrufer faellt closed
  const rec = (await kv.get(key)) as { count: number; resetAt: number } | undefined;
  return rec && now <= rec.resetAt ? rec.count : 0;
}
async function editRateLimited(ip: string): Promise<boolean> {
  try {
    const perIp = await editRateCount(`edit_rl:ip:${ip}`);
    const glob = await editRateCount(`edit_rl:global`);
    return perIp >= 10 || glob >= 60;
  } catch (e) {
    console.log("edit rate-limit read failed (failing closed):", e);
    return true;
  }
}
async function editBumpFail(ip: string): Promise<void> {
  await bumpRateLimit(`edit_rl:ip:${ip}`, await rateLimitState(`edit_rl:ip:${ip}`));
  await bumpRateLimit(`edit_rl:global`, await rateLimitState(`edit_rl:global`));
}

app.get("/make-server-ec6100a6/site-content", async (c) => {
  try {
    const content = (await kv.get(CONTENT_KEY)) as Record<string, string> | undefined;
    return c.json({ content: content ?? {} });
  } catch {
    return c.json({ content: {} });
  }
});

app.post("/make-server-ec6100a6/site-content/save", async (c) => {
  if (!EDIT_PW) return c.json({ error: "not_configured" }, 503);
  const ip = editorClientIp(c);
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
  // JEDEN Wert unbedingt sanitisieren — nicht nur die client-gemeldeten `rich`-IDs.
  // Sonst koennte ein (authentifizierter) Client rohes HTML unter einer IM FRONTEND
  // rich-gerenderten ID speichern, ohne sie in `rich` zu listen -> Stored XSS.
  // Plain-Text ueberlebt sanitizeRich als escapetes HTML; der Client rendert Overrides
  // konsequent per dangerouslySetInnerHTML (siehe Editable.tsx), daher kein Doppel-Escape.
  for (const id of ids) next[id] = sanitizeRich(overrides[id]);
  await kv.set(CONTENT_KEY, next);
  return c.json({ ok: true, count: ids.length });
});

app.post("/make-server-ec6100a6/site-content/image", async (c) => {
  if (!EDIT_PW) return c.json({ error: "not_configured" }, 503);
  const ip = editorClientIp(c);
  if (await editRateLimited(ip)) return c.json({ error: "rate_limited" }, 429);

  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ error: "bad_json" }, 400); }
  if (typeof body.password !== "string" || !ctEq(body.password, EDIT_PW)) {
    await editBumpFail(ip); await new Promise((r) => setTimeout(r, 600));
    return c.json({ error: "unauthorized" }, 401);
  }
  const id = body.id as string, data = body.dataBase64 as string;
  if (!ID_RE.test(id || "")) return c.json({ error: "bad_id" }, 400);
  if (typeof data !== "string" || data.length > Math.ceil(MAX_IMG_BYTES * 1.4)) return c.json({ error: "image_too_big" }, 400);

  const bytes = decodeBase64(data);
  if (bytes.length === 0 || bytes.length > MAX_IMG_BYTES) return c.json({ error: "image_too_big" }, 400);
  const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  // WebP = "RIFF"(0-3) .... "WEBP"(8-11) — beide Marker pruefen.
  const isWebp = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
                 bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  if (!(isJpg || isPng || isWebp)) return c.json({ error: "not_image" }, 400);
  const ext = isPng ? "png" : isWebp ? "webp" : "jpg";

  const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return c.json({ error: "storage_not_configured" }, 503);
  const supabase = createClient(url, key);
  await supabase.storage.createBucket(CONTENT_BUCKET, { public: true }).catch(() => {});
  const path = `img/${sanitizeFilename(id)}-${Date.now()}.${ext}`;
  // Content-Type aus den GESNIFFTEN Bytes ableiten, NICHT aus dem Client-Wert:
  // sonst könnte ein Editor eine Bild/HTML-Polyglot-Datei (besteht den Magic-Byte-
  // Check) mit mimetype "text/html" hochladen -> im public Bucket als HTML
  // ausgeliefert = Stored XSS. `ext` stammt aus isJpg/isPng/isWebp.
  const { error: upErr } = await supabase.storage.from(CONTENT_BUCKET)
    .upload(path, bytes, { contentType: `image/${ext}`, upsert: true });
  if (upErr) { console.log("site-content image upload failed:", upErr.message); return c.json({ error: "upload_failed" }, 500); }
  const { data: pub } = supabase.storage.from(CONTENT_BUCKET).getPublicUrl(path);
  return c.json({ ok: true, url: pub.publicUrl });
});

// --- Backoffice (Admin) -----------------------------------------------------
// Passwortgeschützte Verwaltung der im KV liegenden Anfragen/Bewerbungen/Termine.
// Auth-Gate identisch zu site-content/save: EDIT_PW → Rate-Limit(fail-closed) → ctEq.

// Gibt bei Erfolg {body}, sonst {res} (sofort zurückgeben).
async function adminGate(c: any): Promise<{ body: any } | { res: Response }> {
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

// Felder entfernen, die der Admin-Client nie erhalten darf (Termin-Aktions-Token).
function publicAdminRecord(type: AdminType, r: any): any {
  if (type === "appointment" && r && typeof r === "object") {
    const { token: _token, ...rest } = r;
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
  await kv.del(key); // idempotent: löscht auch, wenn rec fehlt
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

// --- Mediathek (Bildverwaltung) --------------------------------------------
// Listet die Bilder im öffentlichen Content-Bucket und markiert, welche aktuell
// verwendet werden (ihre öffentliche URL steht als Wert in site_content:current).
// „inUse" schützt vor versehentlichem Löschen benutzter Bilder.

app.post("/make-server-ec6100a6/admin/media/list", async (c) => {
  const g = await adminGate(c);
  if ("res" in g) return g.res;
  const url = Deno.env.get("SUPABASE_URL"), sk = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !sk) return c.json({ error: "storage_not_configured" }, 503);
  const supabase = createClient(url, sk);
  const { data: files, error } = await supabase.storage.from(CONTENT_BUCKET)
    .list("img", { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
  if (error) { console.log("media list failed:", error.message); return c.json({ error: "list_failed" }, 500); }
  const content = ((await kv.get(CONTENT_KEY)) as Record<string, string> | undefined) ?? {};
  const usedUrls = new Set(Object.values(content));
  const items = (files ?? [])
    .filter((f) => f.name && !f.name.startsWith("."))
    .map((f) => {
      const path = `img/${f.name}`;
      const pub = supabase.storage.from(CONTENT_BUCKET).getPublicUrl(path).data.publicUrl;
      return {
        path,
        url: pub,
        name: f.name,
        size: (f as { metadata?: { size?: number } }).metadata?.size ?? null,
        updatedAt: f.updated_at ?? f.created_at ?? null,
        inUse: usedUrls.has(pub),
      };
    });
  return c.json({ items });
});

app.post("/make-server-ec6100a6/admin/media/delete", async (c) => {
  const g = await adminGate(c);
  if ("res" in g) return g.res;
  const path = String(g.body.path ?? "");
  // Nur Dateien im img/-Ordner des Content-Buckets, kein Path-Traversal.
  if (!/^img\/[\w.\-]+$/.test(path)) return c.json({ error: "bad_path" }, 400);
  const url = Deno.env.get("SUPABASE_URL"), sk = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !sk) return c.json({ error: "storage_not_configured" }, 503);
  const supabase = createClient(url, sk);
  const pub = supabase.storage.from(CONTENT_BUCKET).getPublicUrl(path).data.publicUrl;
  const content = ((await kv.get(CONTENT_KEY)) as Record<string, string> | undefined) ?? {};
  // Nutzungs-Schutz: benutzte Bilder nicht löschen.
  if (Object.values(content).includes(pub)) return c.json({ error: "in_use" }, 409);
  const { error } = await supabase.storage.from(CONTENT_BUCKET).remove([path]);
  if (error) { console.log("media delete failed:", error.message); return c.json({ error: "delete_failed" }, 500); }
  return c.json({ ok: true });
});

Deno.serve(app.fetch);
