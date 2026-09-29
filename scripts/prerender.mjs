// Vorab-Rendern (SSG) fuer GitHub Pages.
//
// Zwei Aufgaben:
//
// 1. ECHTE HTML-DATEIEN pro Route. Eine client-gerenderte SPA hat auf GitHub
//    Pages keine Datei fuer /leistungen usw. -> GitHub liefert die 404.html mit
//    HTTP 404. Google indexiert 404-Seiten nicht. Jede Route bekommt daher eine
//    eigene Datei (dist/leistungen.html) samt routenspezifischem
//    Titel/Description/Canonical/OG.
//
// 2. VORAB GERENDERTER INHALT. Frueher enthielten diese Dateien nur eine leere
//    Huelle — der Text kam erst, wenn React geladen und ausgefuehrt war.
//    Lighthouse mass mobil fuer das LCP-Element (den Hero-TEXT) 4.710 ms
//    "Render Delay" bei 0 ms Ladezeit. Jetzt wird der Seitenbaum hier mit
//    react-dom/server zu echtem HTML gerendert und in <div id="root"> gelegt;
//    der Browser hydriert ihn nur noch (siehe src/main.tsx).
//
// Faellt das Rendern einer Route aus, wird fuer sie die bisherige leere Huelle
// geschrieben — die Seite funktioniert dann wie zuvor (nur ohne Vorab-Inhalt).
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { build } from "vite";
import { SEO_BY_PATH } from "../src/lib/seo.data.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dist = join(root, "dist");
const ssrOut = join(root, ".ssr-tmp");
const SITE = "https://curadoma.de";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const template = readFileSync(join(dist, "index.html"), "utf8");

for (const re of [/<title>[\s\S]*?<\/title>/, /<meta name="description" content="/, /<link rel="canonical" href="/]) {
  if (!re.test(template)) {
    console.error("prerender: erwartetes Tag nicht in dist/index.html gefunden:", re);
    process.exit(1);
  }
}
if (!/<div id="root"><\/div>/.test(template)) {
  console.error('prerender: <div id="root"></div> nicht gefunden — Template unerwartet.');
  process.exit(1);
}

// --- 1) SSR-Bundle bauen (nur fuer diesen Schritt; landet nicht im dist)
let render = null;
try {
  await build({
    root,
    logLevel: "error",
    build: {
      ssr: join(root, "src", "entry-server.tsx"),
      outDir: ssrOut,
      emptyOutDir: true,
      rollupOptions: { output: { entryFileNames: "entry-server.mjs" } },
    },
  });
  ({ render } = await import(new URL("../.ssr-tmp/entry-server.mjs", import.meta.url).href));
} catch (err) {
  console.warn("prerender: SSR-Bundle fehlgeschlagen — es werden nur leere Huellen erzeugt.\n", err?.message || err);
}

// --- 2) Pro Route: rendern + Meta setzen + Datei schreiben
const routes = ["/", ...Object.keys(SEO_BY_PATH).filter((p) => p !== "/")];
let rendered = 0, shells = 0;

for (const path of routes) {
  const meta = SEO_BY_PATH[path];
  const url = SITE + (path === "/" ? "/" : path);
  let html = template;

  if (meta) {
    const t = esc(meta.title), d = esc(meta.description);
    html = html
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`)
      .replace(/(<meta name="description" content=")[\s\S]*?("\s*\/?>)/, `$1${d}$2`)
      .replace(/(<link rel="canonical" href=")[\s\S]*?("\s*\/?>)/, `$1${url}$2`)
      .replace(/(<meta property="og:title" content=")[\s\S]*?("\s*\/?>)/, `$1${t}$2`)
      .replace(/(<meta property="og:description" content=")[\s\S]*?("\s*\/?>)/, `$1${d}$2`)
      .replace(/(<meta property="og:url" content=")[\s\S]*?("\s*\/?>)/, `$1${url}$2`);
    // Standortseiten ausserhalb Hamelns bringen eigene geo-Signale mit (seo.data.js).
    if (meta.geo) {
      const g = { region: esc(meta.geo.region), place: esc(meta.geo.placename), pos: esc(meta.geo.position) };
      html = html
        .replace(/(<meta name="geo.region" content=")[^"]*/, `$1${g.region}`)
        .replace(/(<meta name="geo.placename" content=")[^"]*/, `$1${g.place}`)
        .replace(/(<meta name="geo.position" content=")[^"]*/, `$1${g.pos}`)
        .replace(/(<meta name="ICBM" content=")[^"]*/, `$1${g.pos.replace(";", ", ")}`);
    }
  }

  if (render) {
    try {
      const body = await render(path);
      html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
      rendered++;
    } catch (err) {
      console.warn(`prerender: ${path} nicht gerendert (${err?.message || err}) — leere Huelle.`);
      shells++;
    }
  } else {
    shells++;
  }

  const file = path === "/" ? join(dist, "index.html") : join(dist, path.replace(/^\//, "") + ".html");
  writeFileSync(file, html, "utf8");
}

// SPA-Fallback: GitHub Pages liefert 404.html fuer alles, wofuer es keine Datei
// gibt (/admin, dynamisch angelegte Seiten, echte Tippfehler-URLs). Diese Datei
// bekommt BEWUSST die leere Huelle — waere sie eine Kopie der vorab gerenderten
// Startseite, blitzte auf jeder unbekannten URL kurz der Startseiten-Inhalt auf,
// bevor der Router die richtige Ansicht zeigt.
writeFileSync(join(dist, "404.html"), template, "utf8");

// SSR-Zwischenbuild aufraeumen (gehoert nicht zur Veroeffentlichung)
try { rmSync(ssrOut, { recursive: true, force: true }); } catch { /* egal */ }

console.log(`prerender: ${rendered} Routen vorab gerendert, ${shells} als Huelle, ${routes.length} Dateien geschrieben.`);
