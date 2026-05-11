// Shared input validators for the contact and career forms.
//
// All validators return `null` when the value is valid, otherwise a German
// error message ready to show to the user. The same rules are mirrored
// server-side in supabase/functions/server/index.tsx so a malicious client
// cannot bypass them by editing the request.

const NAME_MIN = 2;
const NAME_MAX = 60;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2500;
const SUBJECT_MAX = 120;
const EMAIL_MAX = 254;

// Permissive ASCII email — same shape as RFC 5322 lite. Accepts the vast
// majority of real addresses (incl. tags like `foo+bar@`), rejects obvious
// typos like "max@beispiel" (missing TLD) or "max @ beispiel.de" (spaces).
const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

// German / international phone numbers: must reduce to 7–15 digits and may
// start with +49, 0049 or a leading 0. Allow spaces, dashes, slashes, parens
// in the display form. Examples that must pass:
//   05151 7107093  · +49 5151 7107093  · 0049 (5151) 710-7093
const PHONE_ALLOWED_CHARS_RE = /^[+0-9 ()\/\-.]+$/;

// Disallow URLs / typical bot payloads embedded in the name field.
const URL_LIKE_RE = /(https?:\/\/|www\.|\.(?:com|de|net|org|info|ru|cn|biz)(?:\b|\/))/i;

// At least one Unicode letter (so "1234" or "----" is rejected).
const HAS_LETTER_RE = /\p{L}/u;

// Spam patterns: 4+ identical chars in a row, or "aaaaaaaa" gibberish.
const REPEAT_CHARS_RE = /(.)\1{3,}/u;

export type ValidationResult = string | null;

export function validateName(raw: string, label = "Name"): ValidationResult {
  const v = raw.trim();
  if (!v) return `Bitte geben Sie Ihren ${label} an.`;
  if (v.length < NAME_MIN) return `Bitte geben Sie einen vollständigen ${label} an (mind. ${NAME_MIN} Zeichen).`;
  if (v.length > NAME_MAX) return `${label} darf höchstens ${NAME_MAX} Zeichen haben.`;
  if (!HAS_LETTER_RE.test(v)) return `Bitte geben Sie einen echten ${label} ein.`;
  if (URL_LIKE_RE.test(v)) return "Bitte verzichten Sie auf Links im Namensfeld.";
  if (REPEAT_CHARS_RE.test(v)) return "Bitte geben Sie einen echten Namen ein.";
  return null;
}

export function validateEmail(raw: string): ValidationResult {
  const v = raw.trim();
  if (!v) return "Bitte geben Sie Ihre E-Mail-Adresse an.";
  if (v.length > EMAIL_MAX) return "Die E-Mail-Adresse ist zu lang.";
  if (!EMAIL_RE.test(v)) return "Bitte geben Sie eine gültige E-Mail-Adresse an (z. B. max@beispiel.de).";
  return null;
}

/**
 * required = phone must be present; otherwise empty is allowed.
 * Returns null when the value is empty (and not required) or syntactically OK.
 */
export function validatePhone(raw: string, required = false): ValidationResult {
  const v = raw.trim();
  if (!v) return required ? "Bitte geben Sie eine Telefonnummer an." : null;
  if (!PHONE_ALLOWED_CHARS_RE.test(v)) return "Die Telefonnummer enthält ungültige Zeichen.";
  const digits = v.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) {
    return "Bitte geben Sie eine gültige Telefonnummer an.";
  }
  return null;
}

export function validateMessage(raw: string): ValidationResult {
  const v = raw.trim();
  if (!v) return "Bitte schreiben Sie eine Nachricht.";
  if (v.length < MESSAGE_MIN) return `Bitte schreiben Sie etwas mehr (mind. ${MESSAGE_MIN} Zeichen).`;
  if (v.length > MESSAGE_MAX) return `Die Nachricht ist zu lang (max. ${MESSAGE_MAX} Zeichen).`;
  return null;
}

export function validateSubject(raw: string): ValidationResult {
  const v = raw.trim();
  if (!v) return null; // optional
  if (v.length > SUBJECT_MAX) return `Der Betreff ist zu lang (max. ${SUBJECT_MAX} Zeichen).`;
  return null;
}

export function validateConsent(checked: boolean): ValidationResult {
  return checked ? null : "Bitte stimmen Sie der Datenschutzerklärung zu.";
}

/**
 * Bots typically submit a form in well under a second. Real users take 5–60s
 * to fill in fields. We accept a 2.5s minimum and silently flag anything
 * faster as suspected automated submission.
 */
export function looksLikeBotSubmit(formOpenedAt: number, now = Date.now()): boolean {
  return now - formOpenedAt < 2500;
}

export const Limits = {
  NAME_MIN, NAME_MAX,
  MESSAGE_MIN, MESSAGE_MAX,
  SUBJECT_MAX, EMAIL_MAX,
} as const;
