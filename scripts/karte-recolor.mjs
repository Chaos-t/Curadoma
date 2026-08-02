// Färbt das generierte Landkarten-SVG so um, dass es als Hintergrund taugt.
//
// Das Modell hat die Marken-Palette gut getroffen, aber Baumkonturen und
// Stämme in kräftigem Dunkelgrau gezeichnet. Direkt unter den weißen
// Ortsschildchen der Route ist das zu viel Kontrast. Statt einzelne Farben
// von Hand zu ersetzen (es gibt ~19 Varianten, davon 15 Einzelvorkommen),
// entscheidet die Luminanz: alles Dunkle wandert Richtung Mint, alles
// Helle bleibt exakt wie es ist.
//
// Aufruf:  node scripts/karte-recolor.mjs
// Ergebnis: src/assets-src/karte-c2-hell.svg

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/** Wahrgenommene Helligkeit (Rec. 709). Grün wiegt am schwersten. */
export function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Alles unterhalb dieser Luminanz gilt als "zu dunkel für einen Hintergrund". */
export const THRESHOLD = 140;
/** Wie weit eine dunkle Farbe Richtung TARGET geschoben wird. */
export const MIX = 0.72;
/** Zielton #DFF7F8 (Mint-Fläche der Marke). */
export const TARGET = [223, 247, 248];

const lerp = (a, b, t) => Math.round(a + (b - a) * t);

export function remapColor(r, g, b) {
  if (luminance(r, g, b) >= THRESHOLD) return [r, g, b];
  return [lerp(r, TARGET[0], MIX), lerp(g, TARGET[1], MIX), lerp(b, TARGET[2], MIX)];
}

export function recolorSvg(svg) {
  return svg.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, (_m, r, g, b) => {
    const [nr, ng, nb] = remapColor(Number(r), Number(g), Number(b));
    return `rgb(${nr},${ng},${nb})`;
  });
}

// Nur ausführen, wenn direkt aufgerufen — nicht beim Import aus dem Test.
if (process.argv[1] && process.argv[1].endsWith("karte-recolor.mjs")) {
  const here = dirname(fileURLToPath(import.meta.url));
  const src = join(here, "..", "src", "assets-src", "karte-c2.svg");
  const out = join(here, "..", "src", "assets-src", "karte-c2-hell.svg");
  const before = readFileSync(src, "utf8");
  const after = recolorSvg(before);
  writeFileSync(out, after, "utf8");
  const dunkel = [...before.matchAll(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g)]
    .filter((m) => luminance(+m[1], +m[2], +m[3]) < THRESHOLD).length;
  console.log(`karte-recolor: ${dunkel} dunkle Farbangaben aufgehellt -> ${out}`);
}
