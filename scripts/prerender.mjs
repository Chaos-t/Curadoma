// Post-Build Pre-Rendering fuer GitHub Pages (SPA).
//
// Problem: Eine client-gerenderte SPA hat auf GitHub Pages keine echten Dateien
// fuer /entlastung, /leistungen, ... -> GitHub liefert die 404.html mit HTTP 404
// aus. Google indexiert 404-Seiten nicht.
//
// Loesung: Fuer jede Route erzeugen wir hier eine echte HTML-Datei
// (dist/entlastung.html usw.). GitHub Pages liefert /entlastung dann als
// entlastung.html mit HTTP 200 aus -> crawl- und indexierbar. In jede Datei wird
// zusaetzlich der routenspezifische Titel/Description/Canonical/OG statisch
// eingesetzt (SEO auch ohne JS korrekt). Die SPA bootet normal und rendert die Seite.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { SEO_BY_PATH } from "../src/lib/seo.data.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, "..", "dist");
const SITE = "https://curadoma.de";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const template = readFileSync(join(dist, "index.html"), "utf8");

// Sicherstellen, dass die zu ersetzenden Tags im Template vorhanden sind.
const required = [/<title>[\s\S]*?<\/title>/, /<meta name="description" content="/, /<link rel="canonical" href="/];
for (const re of required) {
  if (!re.test(template)) {
    console.error("prerender: erwartetes Tag nicht in dist/index.html gefunden:", re);
    process.exit(1);
  }
}

let count = 0;
for (const [path, meta] of Object.entries(SEO_BY_PATH)) {
  if (path === "/") continue; // ist bereits dist/index.html (HTTP 200)
  const url = SITE + path;
  const t = esc(meta.title);
  const d = esc(meta.description);
  const html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`)
    .replace(/(<meta name="description" content=")[\s\S]*?("\s*\/?>)/, `$1${d}$2`)
    .replace(/(<link rel="canonical" href=")[\s\S]*?("\s*\/?>)/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[\s\S]*?("\s*\/?>)/, `$1${t}$2`)
    .replace(/(<meta property="og:description" content=")[\s\S]*?("\s*\/?>)/, `$1${d}$2`)
    .replace(/(<meta property="og:url" content=")[\s\S]*?("\s*\/?>)/, `$1${url}$2`);
  // dist/<route>.html (einstufige Routen, keine Unterordner noetig)
  const file = join(dist, path.replace(/^\//, "") + ".html");
  writeFileSync(file, html, "utf8");
  count++;
}
console.log(`prerender: ${count} Routen-HTML-Dateien erzeugt (HTTP-200-Unterseiten fuer die Indexierung).`);
