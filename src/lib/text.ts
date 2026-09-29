// Macht aus einem (server-sanitisierten) Editor-Wert reinen Text.
//
// Editor-Overrides kommen als escaptes HTML zurueck (`&amp;`, `<strong>` …).
// Fuer Structured Data, URLs oder Attribute braucht es Klartext. Nur die
// Entitaeten, die sanitizeRich im Backend erzeugt, plus numerische.
// Ungueltige Codepoints (> U+10FFFF) wuerden in fromCodePoint werfen und damit
// das Rendern der ganzen Seite abbrechen — lieber still weglassen.
function codePoint(n: number): string {
  return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : "";
}

export function plainText(v: string | undefined | null): string {
  if (!v) return "";
  return v
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&#(\d{1,7});/g, (_, n) => codePoint(Number(n)))
    .replace(/&#x([0-9a-f]{1,6});/gi, (_, h) => codePoint(parseInt(h, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** JSON sicher in ein <script type="application/ld+json"> einbetten.
 *  `<` wird maskiert, damit ein "</script>" im Inhalt das Skript-Tag nie
 *  beenden kann (sonst: HTML-Injection ueber Editor-Texte). U+2028/2029 sind
 *  in JSON erlaubt, in JS-Kontexten aber Zeilenumbrueche — ebenfalls maskieren. */
export function jsonLd(data: unknown): string {
  // Doppelter Backslash ist Absicht: eingesetzt werden die SECHS Zeichen
  // "\u003c", nicht das Zeichen selbst (sonst waere es ein No-op).
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
