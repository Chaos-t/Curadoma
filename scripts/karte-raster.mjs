// Rastert das umgefärbte Landkarten-SVG zu public/karte-einzugsgebiet.webp.
//
// Einmal-Schritt, aber eingecheckt, damit die Karte reproduzierbar bleibt.
//
// WARUM ÜBER DEN BROWSER: Lokal gibt es keinen Rasterizer (cwebp,
// ImageMagick, Inkscape, sharp fehlen alle; das "convert" im PATH ist die
// Windows-Dateisystemkonvertierung). Chrome kann WebP nativ encodieren.
// Der Server hier liefert eine Seite aus, die das SVG auf ein Canvas malt
// und die fertigen Bytes per POST zurückschickt — so wandert das Bild nie
// als Base64-Text durch eine Werkzeugausgabe.
//
// VORAUSSETZUNG: src/assets-src/karte-c2-hell.svg muss existieren. Falls
// nicht, zuerst erzeugen mit:
//   node scripts/karte-recolor.mjs
//
// Aufruf:
//   node scripts/karte-raster.mjs
//   -> danach http://localhost:5178/ im Browser öffnen
//   Das Skript schreibt die Datei und beendet sich von selbst (spätestens
//   nach 120s Gesamt-Timeout, auch wenn der Browser-Durchlauf ausbleibt).

import { createServer } from "node:http";
import { readFileSync, writeFileSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const SVG = join(here, "..", "src", "assets-src", "karte-c2-hell.svg");
const OUT = join(here, "..", "public", "karte-einzugsgebiet.webp");
const PORT = 5178;
const HOST = "127.0.0.1";
const OVERALL_TIMEOUT_MS = 120_000;
const MAX_BODY_BYTES = 5 * 1024 * 1024; // 5 MB

// Quell-SVG muss vor dem Start existieren — sonst reißt readFileSync im
// Request-Handler mit einem rohen Stack-Trace ab statt einer brauchbaren
// Meldung.
if (!existsSync(SVG)) {
  console.error(
    `karte-raster: FEHLER — Quell-SVG fehlt: ${SVG}\n` +
      `Bitte zuerst erzeugen mit: node scripts/karte-recolor.mjs`
  );
  process.exit(1);
}

// Seitenverhältnis des Originals: width=1536 height=2688 (4:7).
// Das SVG hat viewBox 2688x2688 mit preserveAspectRatio="none" — die
// Grafik ist ABSICHTLICH horizontal gestaucht. Halbe Kantenlänge behält
// genau dieses Verhältnis bei.
const W = 768, H = 1344, QUALITY = 0.82;

const PAGE = `<!doctype html><meta charset=utf-8><title>rastern</title>
<body style="font:14px system-ui;padding:24px">
<p id=s>rastere …</p>
<script>
const img = new Image();
img.onload = async () => {
  const c = document.createElement('canvas');
  c.width = ${W}; c.height = ${H};
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, ${W}, ${H});
  const blob = await new Promise(r => c.toBlob(r, 'image/webp', ${QUALITY}));
  if (!blob) { document.getElementById('s').textContent = 'FEHLER: WebP wird nicht unterstuetzt'; return; }
  const res = await fetch('/save', { method: 'POST', body: blob });
  document.getElementById('s').textContent = await res.text();
};
img.onerror = () => { document.getElementById('s').textContent = 'FEHLER: SVG nicht ladbar'; };
img.src = '/karte.svg';
<\/script>`;

// Stellt sicher, dass der Prozess sich unter allen Umständen genau einmal
// beendet — egal ob durch erfolgreichen Durchlauf, Anfrage-Abbruch, Fehler
// oder Gesamt-Timeout. Ohne dieses Gate könnte z. B. der Timeout nach einem
// bereits erfolgten Exit noch feuern.
let finished = false;
function finishOnce(code) {
  if (finished) return;
  finished = true;
  clearTimeout(overallTimeout);
  try {
    server.close();
  } catch {
    // Server evtl. schon zu — irrelevant, wir beenden den Prozess ohnehin.
  }
  process.exit(code);
}

// Gesamt-Timeout: Falls nie ein vollständiger /save-Request eintrifft (Tab
// nicht geöffnet, Browser hängt, o. ä.), soll das Skript sich trotzdem
// beenden statt endlos zu laufen — siehe Kopfkommentar ("beendet sich von
// selbst").
const overallTimeout = setTimeout(() => {
  console.error(
    `karte-raster: FEHLER — Zeitueberschreitung nach ${OVERALL_TIMEOUT_MS / 1000}s. ` +
      `Kein abgeschlossener Rasterungs-Durchlauf. Bitte http://localhost:${PORT}/ im Browser oeffnen und die Konsole dort auf Fehler pruefen.`
  );
  finishOnce(1);
}, OVERALL_TIMEOUT_MS);

const server = createServer((req, res) => {
  if (req.method === "POST" && req.url === "/save") {
    const chunks = [];
    let size = 0;

    req.on("data", (c) => {
      if (finished) return;
      size += c.length;
      if (size > MAX_BODY_BYTES) {
        console.error(
          `karte-raster: FEHLER — Anfragerumpf ueberschreitet Limit von ${Math.round(MAX_BODY_BYTES / 1024 / 1024)} MB, Abbruch.`
        );
        res.writeHead(413, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Rumpf zu gross (Limit 5 MB)");
        finishOnce(1);
        req.destroy();
        return;
      }
      chunks.push(c);
    });

    // Bricht die Anfrage vorzeitig ab (Tab geschlossen, Netzwerkfehler),
    // feuert 'end' nie — ohne diesen Zweig würde der Prozess endlos laufen.
    req.on("aborted", () => {
      if (finished) return;
      console.error(
        "karte-raster: FEHLER — Anfrage abgebrochen (z. B. Tab geschlossen oder Netzwerkfehler), bevor die Datei geschrieben wurde."
      );
      finishOnce(1);
    });

    req.on("error", (err) => {
      if (finished) return;
      console.error(`karte-raster: FEHLER bei der Anfrage — ${err.message}`);
      finishOnce(1);
    });

    req.on("end", () => {
      if (finished) return;
      const buf = Buffer.concat(chunks);
      writeFileSync(OUT, buf);
      const kb = Math.round(statSync(OUT).size / 1024);
      const ok = kb <= 80;
      console.log(`karte-raster: ${OUT} geschrieben, ${kb} KB ${ok ? "(im Budget)" : "(UEBER BUDGET, max 80 KB)"}`);
      res.end(`fertig: ${kb} KB${ok ? "" : " — UEBER BUDGET"}`);
      finishOnce(ok ? 0 : 1);
    });
    return;
  }
  if (req.url === "/karte.svg") {
    res.setHeader("Content-Type", "image/svg+xml");
    res.end(readFileSync(SVG));
    return;
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(PAGE);
});

server.listen(PORT, HOST, () => console.log(`karte-raster: bitte http://localhost:${PORT}/ oeffnen`));
