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
// Aufruf:
//   node scripts/karte-raster.mjs
//   -> danach http://localhost:5178/ im Browser öffnen
//   Das Skript schreibt die Datei und beendet sich von selbst.

import { createServer } from "node:http";
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const SVG = join(here, "..", "src", "assets-src", "karte-c2-hell.svg");
const OUT = join(here, "..", "public", "karte-einzugsgebiet.webp");
const PORT = 5178;

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

const server = createServer((req, res) => {
  if (req.method === "POST" && req.url === "/save") {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const buf = Buffer.concat(chunks);
      writeFileSync(OUT, buf);
      const kb = Math.round(statSync(OUT).size / 1024);
      const ok = kb <= 80;
      console.log(`karte-raster: ${OUT} geschrieben, ${kb} KB ${ok ? "(im Budget)" : "(UEBER BUDGET, max 80 KB)"}`);
      res.end(`fertig: ${kb} KB${ok ? "" : " — UEBER BUDGET"}`);
      server.close();
      process.exit(ok ? 0 : 1);
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

server.listen(PORT, () => console.log(`karte-raster: bitte http://localhost:${PORT}/ oeffnen`));
