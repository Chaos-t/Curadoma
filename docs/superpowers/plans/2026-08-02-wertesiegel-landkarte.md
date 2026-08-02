# Wertesiegel + Landkarte — Umsetzungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein langsam rotierendes Wertesiegel überlappt halb hinter dem Hero-Bild der Startseite, und eine statische gezeichnete Landkarte liegt hinter beiden Stationen-Routen im Einzugsgebiet.

**Architecture:** Zwei unabhängige Features ohne gemeinsame Datei. Teil 1 ist eine neue, in sich geschlossene Komponente plus eine dreizeilige Änderung an der Stapelreihenfolge in `HomePage.tsx`. Teil 2 besteht aus einer einmaligen, aber eingecheckten Asset-Pipeline (SVG umfärben → per Chrome zu WebP rastern) und dem Einbau des fertigen Bildes in `CityRoadmap.tsx`.

**Tech Stack:** React 18 + Vite 6, Tailwind v4 (arbiträre Hex-Werte), lucide-react, SVG `textPath`, `node --test` für reine Logik, Chrome-Canvas für die WebP-Erzeugung.

**Spec:** [../specs/2026-08-02-wertesiegel-landkarte-design.md](../specs/2026-08-02-wertesiegel-landkarte-design.md)

## Global Constraints

Diese gelten für **jede** Aufgabe, auch wenn sie dort nicht wiederholt werden:

- **Inline-CSS ausschließlich über `<Css>{…}</Css>`** (`src/app/components/Css.tsx`). Niemals `<style>{…}</style>` — das bricht die Hydration, sobald das CSS `"`, `&` oder `<` enthält.
- **Kein `window`-Zugriff beim ersten Render**, keine JS-Breakpoints. Größen- und Deckkraftunterschiede laufen über CSS-Media-Queries. Grund: Die Seiten werden beim Build vorab gerendert; ein abweichender Client-Erstrender bricht die Hydration (React-Fehler #418).
- **Mobile-Variante im selben Commit** wie die Desktop-Variante, nie als Nachzügler. Breakpoint 768 px.
- **Kontrastregel:** `#6FD3D1` niemals für Text oder Buttonflächen. Textfarben sind `#0F7C77` bzw. `#0E6E6A` auf Mint.
- **Animationen:** nur `transform`/`opacity`, `cura`-Präfix bei Keyframe-Namen, immer ein `@media (prefers-reduced-motion: reduce)`-Gegenstück.
- **Schrift-Stapel immer mit Fallback-Eintrag:** `'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif`. Der Fallback ist metrisch angepasst und verhindert Layout-Verschiebung.
- **Harte Grenze Bildgröße:** `public/karte-einzugsgebiet.webp` ≤ 80 KB.
- **Kein `tsc`, kein Linter, kein Frontend-Test-Runner.** `npm run build` fängt Parse- und SSR-Renderfehler, sonst wird im Browser verifiziert.
- Es gibt **keine** neue npm-Abhängigkeit in diesem Plan. Falls eine nötig erscheint: anhalten und fragen.

---

## Dateien im Überblick

| Datei | Art | Zuständigkeit |
|---|---|---|
| `src/app/components/ValueSeal.tsx` | neu | Das rotierende Kreis-Siegel. Kennt nur sich selbst, keine Seitenlogik. |
| `src/app/components/HomePage.tsx` | ändern | Siegel einhängen + Stapelreihenfolge der Hero-Bildspalte. |
| `scripts/karte-recolor.mjs` | neu | Reine Farb-Umrechnung + SVG-Ersetzung. Exportiert testbare Funktionen. |
| `scripts/karte-recolor.test.mjs` | neu | `node --test` für die Umrechnung. |
| `scripts/karte-raster.mjs` | neu | Einmal-Pipeline: SVG → Chrome-Canvas → `public/karte-einzugsgebiet.webp`. |
| `src/assets-src/karte-c2.svg` | neu | Das Roh-SVG von Higgsfield, eingecheckt für Reproduzierbarkeit. |
| `public/karte-einzugsgebiet.webp` | neu | Das ausgelieferte Bild. |
| `src/app/components/CityRoadmap.tsx` | ändern | Karte hinter Schlangenlinie (Desktop) und Zeitleiste (mobil). |
| `CLAUDE.md` | ändern | Nachtrag laut Spec §7. |

`src/assets-src/` ist neu und bewusst **außerhalb** von `src/imports/` (das gehört Figma Make und wird von dort synchronisiert) und außerhalb von `public/` (das Roh-SVG soll nicht ausgeliefert werden).

---

## Task 1: Wertesiegel bauen und einhängen

**Files:**
- Create: `src/app/components/ValueSeal.tsx`
- Modify: `src/app/components/HomePage.tsx` (Import-Block oben; Hero-Bildspalte, aktuell Zeilen 175–187)

**Interfaces:**
- Produces: `export function ValueSeal({ className, idSuffix }: { className?: string; idSuffix?: string }): JSX.Element`
- Consumes: `Css` aus `./Css`, `HandHeart` aus `lucide-react`

Komponente und Einbau gehören in **eine** Aufgabe: Eine Komponente, die niemand rendert, lässt sich nicht verifizieren.

- [ ] **Step 1: Komponente anlegen**

`src/app/components/ValueSeal.tsx`:

```tsx
import { HandHeart } from "lucide-react";
import { Css } from "./Css";

// Die vier Begriffe stehen bewusst FEST IM CODE und sind nicht über den
// Inhalts-Editor änderbar — wie der Axion-Studio-Credit im Footer.
// Grund: Der Text läuft in einem SVG-<textPath> an einer Kurve entlang.
// contentEditable ist dort unzuverlässig (der Cursor springt), und jede
// Textänderung verändert die Bogenlänge, sodass die Schriftgröße neu
// bestimmt werden müsste, damit der Kreis weiterhin genau aufgeht.
const WORDS = ["MIT HERZ", "ZUVERLÄSSIG", "RESPEKTVOLL", "ZUHAUSE BETREUT"];

// Radius in viewBox-Einheiten. Umfang = 2 * PI * 76 ≈ 477.5 — daran muss
// sich die Schriftgröße orientieren, siehe Step 4.
const R = 76;

export function ValueSeal({ className, idSuffix = "" }: { className?: string; idSuffix?: string }) {
  // Eigene id je Instanz: Würde das Siegel zweimal auf einer Seite stehen,
  // zeigten sonst beide <textPath> auf denselben Pfad.
  const pathId = `cura-seal-path${idSuffix}`;
  const text = WORDS.join(" · ") + " · ";

  return (
    // aria-hidden: Die Begriffe sind dekorative Wiederholung — die Sektion
    // "Warum sich Familien für uns entscheiden" nennt dieselben Werte weiter
    // unten als echten Inhalt. Ein zweites Vorlesen wäre nur Lärm.
    <div className={`cura-seal ${className ?? ""}`} aria-hidden="true">
      <svg viewBox="0 0 200 200" className="cura-seal__ring block w-full h-full">
        <defs>
          <path
            id={pathId}
            fill="none"
            d={`M 100,100 m -${R},0 a ${R},${R} 0 1,1 ${R * 2},0 a ${R},${R} 0 1,1 -${R * 2},0`}
          />
        </defs>
        <text
          fill="#0F7C77"
          style={{
            fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif",
            fontWeight: 500,
            fontSize: 11.5,
            letterSpacing: "0.16em",
          }}
        >
          <textPath href={`#${pathId}`} startOffset="0">{text}</textPath>
        </text>
      </svg>

      <span className="cura-seal__core absolute inset-0 flex items-center justify-center text-[#6FD3D1]">
        <HandHeart className="w-1/4 h-1/4" strokeWidth={1.5} />
      </span>

      <Css>{`
        /* Nur der Ring dreht sich, das Herz in der Mitte steht still. */
        .cura-seal { position: relative; pointer-events: none; }
        .cura-seal__ring { animation: curaSealSpin 30s linear infinite; will-change: transform; }
        @keyframes curaSealSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cura-seal__ring { animation: none; }
        }
      `}</Css>
    </div>
  );
}
```

- [ ] **Step 2: Siegel in der Hero-Bildspalte einhängen**

In `src/app/components/HomePage.tsx` den Import ergänzen (zu den bestehenden Komponenten-Importen, nach `import { Css } from "./Css";`):

```tsx
import { ValueSeal } from "./ValueSeal";
```

Dann die Hero-Bildspalte ändern. **Vorher:**

```tsx
          <div className="cura-hero-image flex-1 w-full max-w-lg lg:max-w-none relative">
            <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_60px_rgb(191,234,242,0.4)] border-4 border-white">
```

**Nachher:**

```tsx
          <div className="cura-hero-image flex-1 w-full max-w-lg lg:max-w-none relative">
            {/* Halb hinter dem Bild: Das entsteht AUSSCHLIESSLICH über die
                Stapelreihenfolge — Siegel z-0, Bildrahmen relative z-10.
                Kein Clipping, keine Maske. Der Rahmen hat overflow-hidden,
                rounded-3xl und 4px weißen Rand, darunter verschwindet das
                Siegel sauber. Oben LINKS, weil unten links schon die
                "Anerkannter Partner"-Karte sitzt. */}
            <ValueSeal className="absolute -top-6 -left-6 lg:-top-10 lg:-left-10 z-0 w-[110px] h-[110px] lg:w-[170px] lg:h-[170px]" />
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgb(191,234,242,0.4)] border-4 border-white">
```

Der Rest der Spalte bleibt unverändert. Die „Anerkannter Partner"-Karte darunter braucht **keine** Änderung: Sie hat keinen `z-index`, liegt aber im DOM nach dem Bildrahmen und damit ohnehin darüber.

- [ ] **Step 3: Build muss durchlaufen**

```bash
npm run build
```

Erwartet: `✓ built in …` und als letzte Zeile `prerender: 12 Routen vorab gerendert, 0 als Huelle, 12 Dateien geschrieben.`

Die **0** ist die eigentliche Prüfung: Wäre in `ValueSeal` etwas serverseitig nicht renderbar (z. B. ein `window`-Zugriff), stünde hier `1 als Huelle` und die Startseite käme ohne Vorab-Inhalt.

- [ ] **Step 4: Im Browser messen, ob der Text den Kreis genau füllt**

Dev-Server starten und `http://localhost:5173/` öffnen. Dann in der Konsole:

```js
const tp = document.querySelector('.cura-seal text textPath');
const p  = document.querySelector('.cura-seal defs path');
console.log('Text:', tp.getComputedTextLength().toFixed(1), 'Pfad:', p.getTotalLength().toFixed(1));
```

Erwartet: Der Textwert liegt zwischen **90 % und 100 %** des Pfadwerts (Pfad ≈ 477,5).

- Ist der Text **länger** als der Pfad, wird das Ende abgeschnitten → `fontSize` in `ValueSeal.tsx` in 0,5er-Schritten senken.
- Ist er **kürzer als 90 %**, klafft eine sichtbare Lücke → `fontSize` erhöhen oder `letterSpacing` anheben.

Laufweite entlang eines Pfades rendert je Engine unterschiedlich — deshalb wird hier gemessen und nicht geraten. Nach dem Anpassen erneut messen.

- [ ] **Step 5: Überlappung und Drehung prüfen**

In derselben Konsole:

```js
const seal = document.querySelector('.cura-seal');
const frame = seal.nextElementSibling;
const s = seal.getBoundingClientRect(), f = frame.getBoundingClientRect();
console.log('überlappt:', s.right > f.left && s.bottom > f.top);
console.log('z-index Siegel:', getComputedStyle(seal).zIndex, '/ Rahmen:', getComputedStyle(frame).zIndex);
console.log('Animation:', getComputedStyle(document.querySelector('.cura-seal__ring')).animationName);
```

Erwartet: `überlappt: true`, `z-index Siegel: 0 / Rahmen: 10`, `Animation: curaSealSpin`.

Zusätzlich mit den Augen: Das Siegel muss sichtbar **hinter** dem weißen Rahmen verschwinden, nicht davor liegen. Die Konsole muss frei von `[Hydration]`-Warnungen sein.

- [ ] **Step 6: Mobil prüfen**

DevTools auf 375 × 812 stellen, Seite neu laden.

```js
const r = document.querySelector('.cura-seal').getBoundingClientRect();
console.log('Breite:', r.width, 'links:', r.left);
console.log('Seitwärts-Scroll:', document.documentElement.scrollWidth - document.documentElement.clientWidth);
```

Erwartet: Breite `110`, `links` ≥ 0 (das Siegel darf nicht aus dem Bild herauslaufen), Seitwärts-Scroll `0`.

- [ ] **Step 7: Reduced-Motion prüfen**

DevTools → Rendering → „Emulate CSS media feature prefers-reduced-motion" auf `reduce`.

```js
console.log(getComputedStyle(document.querySelector('.cura-seal__ring')).animationName);
```

Erwartet: `none`. Danach die Emulation zurücksetzen.

- [ ] **Step 8: Committen**

```bash
git add src/app/components/ValueSeal.tsx src/app/components/HomePage.tsx
git commit -m "feat(home): rotierendes Wertesiegel halb hinter dem Hero-Bild"
```

---

## Task 2: Umfärb-Funktion mit Test

**Files:**
- Create: `src/assets-src/karte-c2.svg` (Roh-SVG, heruntergeladen)
- Create: `scripts/karte-recolor.mjs`
- Create: `scripts/karte-recolor.test.mjs`

**Interfaces:**
- Produces: `luminance(r,g,b): number`, `remapColor(r,g,b): [number,number,number]`, `recolorSvg(svg: string): string`, Konstanten `THRESHOLD`, `MIX`, `TARGET`
- Consumes: nichts

Hier greift echtes TDD: reine Funktion, keine DOM-Abhängigkeit, mit `node --test` prüfbar — genau das Muster von `supabase/functions/make-server-ec6100a6/admin_util.ts`.

- [ ] **Step 1: Roh-SVG ablegen**

```bash
mkdir -p src/assets-src
curl -sS -o src/assets-src/karte-c2.svg \
  "https://d8j0ntlcm91z4.cloudfront.net/user_3DzW2mCJqgH5KvfxCkmsalwYZBD/hf_20260802_003637_b47d8d3f-2268-467e-936a-95992479c084.svg"
ls -la src/assets-src/karte-c2.svg
```

Erwartet: ca. 1,3 MB.

Sollte die URL nicht mehr erreichbar sein: Das Bild liegt zusätzlich im Scratchpad dieser Sitzung unter `karte/C2.svg`. Herkunft: Higgsfield, Modell `recraft_v4_1`, `model_type: "vector"`, Job `b47d8d3f-2268-467e-936a-95992479c084`.

- [ ] **Step 2: Den fehlschlagenden Test schreiben**

`scripts/karte-recolor.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { luminance, remapColor, recolorSvg, THRESHOLD } from "./karte-recolor.mjs";

test("luminance gewichtet Grün am stärksten", () => {
  assert.ok(luminance(0, 255, 0) > luminance(255, 0, 0));
  assert.equal(luminance(0, 0, 0), 0);
  assert.equal(Math.round(luminance(255, 255, 255)), 255);
});

test("helle Markenfarben bleiben unangetastet", () => {
  // Diese vier tragen die Zeichnung und dürfen sich nicht verändern.
  assert.deepEqual(remapColor(168, 220, 211), [168, 220, 211]); // #A8DCD3, 1206x
  assert.deepEqual(remapColor(111, 211, 209), [111, 211, 209]); // #6FD3D1, 115x
  assert.deepEqual(remapColor(191, 234, 242), [191, 234, 242]); // #BFEAF2, 98x
  assert.deepEqual(remapColor(248, 254, 255), [248, 254, 255]); // #F8FEFF, 58x
});

test("dunkle Baumkonturen werden deutlich aufgehellt", () => {
  for (const [r, g, b] of [[83, 109, 103], [65, 91, 86], [92, 119, 113], [86, 88, 86]]) {
    const out = remapColor(r, g, b);
    assert.ok(luminance(...out) > luminance(r, g, b) + 60,
      `rgb(${r},${g},${b}) wurde nicht ausreichend aufgehellt: ${out}`);
    assert.ok(out.every((v) => v >= 0 && v <= 255), "Kanal außerhalb 0..255");
  }
});

test("die Schwelle ist die Entscheidungsgrenze", () => {
  const dunkel = [40, 40, 40];
  const hell = [230, 240, 240];
  assert.ok(luminance(...dunkel) < THRESHOLD);
  assert.ok(luminance(...hell) >= THRESHOLD);
  assert.notDeepEqual(remapColor(...dunkel), dunkel);
  assert.deepEqual(remapColor(...hell), hell);
});

test("recolorSvg ersetzt nur rgb()-Angaben und lässt den Rest in Ruhe", () => {
  const vorher = '<path fill="rgb(65,91,86)" d="M0,0"/><stop stop-color="rgb(168,220,211)"/>';
  const nachher = recolorSvg(vorher);
  assert.ok(nachher.includes('rgb(168,220,211)'), "helle Farbe wurde verändert");
  assert.ok(!nachher.includes('rgb(65,91,86)'), "dunkle Farbe wurde nicht ersetzt");
  assert.ok(nachher.includes('d="M0,0"'), "Pfaddaten wurden angefasst");
});

test("recolorSvg verträgt Leerzeichen in rgb()", () => {
  assert.ok(!recolorSvg('rgb(65, 91, 86)').includes("65, 91, 86"));
});
```

- [ ] **Step 3: Test laufen lassen, er MUSS fehlschlagen**

```bash
node --test scripts/karte-recolor.test.mjs
```

Erwartet: Fehlschlag mit `Cannot find module …karte-recolor.mjs`.

- [ ] **Step 4: Minimale Implementierung**

`scripts/karte-recolor.mjs`:

```js
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
```

- [ ] **Step 5: Test laufen lassen, er MUSS bestehen**

```bash
node --test scripts/karte-recolor.test.mjs
```

Erwartet: `pass 6`, `fail 0`.

- [ ] **Step 6: Umgefärbtes SVG erzeugen**

```bash
node scripts/karte-recolor.mjs
```

Erwartet: eine Zeile wie `karte-recolor: 296 dunkle Farbangaben aufgehellt -> …/karte-c2-hell.svg`. Die Zahl muss **deutlich über 250** liegen (178 + 75 + 39 sind allein die drei häufigsten dunklen Töne). Steht dort `0`, hat die Regex nicht gegriffen — dann `head -c 300 src/assets-src/karte-c2.svg` prüfen.

- [ ] **Step 7: Ergebnis mit den Augen prüfen**

`src/assets-src/karte-c2-hell.svg` im Browser öffnen:

```bash
start "" "src/assets-src/karte-c2-hell.svg"
```

Erwartet: Dieselbe Zeichnung wie vorher, aber ohne dunkelgraue Baumkonturen — alles in Mint- und Salbeitönen.

**Wenn die mittleren Graugrün-Töne noch zu kräftig wirken:** `rgb(119,154,149)` (126 Vorkommen) hat Luminanz 146 und liegt damit knapp **über** der Schwelle von 140. Das ist der einzige vorgesehene Stellschraubenwert: `THRESHOLD` auf `150` anheben, Step 5 und 6 wiederholen. Die Spec nennt 140 als Ausgangswert; eine Anhebung ist eine bewusste Abweichung und gehört in die Commit-Nachricht.

- [ ] **Step 8: Committen**

```bash
git add src/assets-src/karte-c2.svg scripts/karte-recolor.mjs scripts/karte-recolor.test.mjs
git commit -m "feat(karte): Umfaerb-Funktion fuer das Landkarten-SVG (+ Tests)"
```

`karte-c2-hell.svg` wird **nicht** committet — es ist ein Zwischenprodukt und jederzeit reproduzierbar.

---

## Task 3: WebP erzeugen

**Files:**
- Create: `scripts/karte-raster.mjs`
- Create: `public/karte-einzugsgebiet.webp`
- Modify: `.gitignore` (Zwischenprodukt ausschließen)

**Interfaces:**
- Consumes: `src/assets-src/karte-c2-hell.svg` aus Task 2
- Produces: `public/karte-einzugsgebiet.webp`, 768 × 1344 px, ≤ 80 KB

**Warum dieser Umweg:** Lokal ist kein Rasterizer installiert (`cwebp`, ImageMagick, Inkscape, `sharp` fehlen; das `convert` im `PATH` ist die Windows-Dateisystem-Konvertierung, **nicht** ImageMagick). Chrome kann WebP nativ encodieren. Der Kniff ist, das Ergebnis **nicht** als Base64-String zurückzureichen, sondern die Bytes direkt vom Browser an einen kleinen lokalen Server zu schicken, der sie schreibt.

- [ ] **Step 1: Pipeline-Skript anlegen**

`scripts/karte-raster.mjs`:

```js
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
```

- [ ] **Step 2: Zwischenprodukt aus der Versionskontrolle nehmen**

Ans Ende von `.gitignore`:

```
# Zwischenprodukt der Karten-Pipeline (aus karte-c2.svg reproduzierbar)
src/assets-src/karte-c2-hell.svg
```

- [ ] **Step 3: Pipeline ausführen**

```bash
node scripts/karte-raster.mjs
```

Dann `http://localhost:5178/` im Browser öffnen. Die Seite zeigt kurz „rastere …", danach „fertig: NN KB".

Erwartet in der Konsole: `karte-raster: …/public/karte-einzugsgebiet.webp geschrieben, NN KB (im Budget)` und Exit-Code 0.

**Wenn „UEBER BUDGET" erscheint:** `QUALITY` in `scripts/karte-raster.mjs` auf `0.72` senken und erneut ausführen. Bringt das nicht genug, zusätzlich `W`/`H` auf `640 × 1120` reduzieren — das Seitenverhältnis 4:7 dabei **beibehalten**.

**Wenn „FEHLER: SVG nicht ladbar" erscheint:** Task 2 Step 6 wurde nicht ausgeführt, `karte-c2-hell.svg` fehlt.

- [ ] **Step 4: Ergebnis prüfen**

```bash
ls -la public/karte-einzugsgebiet.webp
```

Erwartet: Datei existiert, ≤ 80 KB.

Zusätzlich mit den Augen öffnen: Die Karte muss dasselbe Motiv wie das SVG zeigen, in derselben Stauchung — **nicht** breiter oder schmaler gezogen.

- [ ] **Step 5: Committen**

```bash
git add scripts/karte-raster.mjs public/karte-einzugsgebiet.webp .gitignore
git commit -m "feat(karte): Landkarte als WebP erzeugen (Chrome-Canvas-Pipeline)"
```

---

## Task 4: Karte hinter beiden Routen einbauen

**Files:**
- Modify: `src/app/components/CityRoadmap.tsx` (Import-Block; `RouteSnake` ab Zeile 199; `RouteTimelineMobile` ab Zeile 307)

**Interfaces:**
- Consumes: `public/karte-einzugsgebiet.webp` aus Task 3; `EditableImage` aus `./editor/EditableImage`; `Css` aus `./Css`
- Produces: nichts für spätere Aufgaben

Desktop- und Mobil-Variante gehören zwingend in **dieselbe** Aufgabe und denselben Commit.

- [ ] **Step 1: Importe und gemeinsame Kartenkomponente ergänzen**

Oben in `src/app/components/CityRoadmap.tsx` zu den bestehenden Importen:

```tsx
import { EditableImage } from "./editor/EditableImage";
import { Css } from "./Css";
```

Direkt unter `const jakarta = …` einfügen:

```tsx
// Dekorative Landkarte hinter der Route. Bewusst STATISCH — die Bewegung
// liefert allein das scrollgesteuerte Auto.
//
// Als EditableImage eingebunden, damit der Betreiber sie im Bearbeitungs-
// modus selbst austauschen kann, und zwar je Route getrennt.
//
// Bei Paderborn wird dieselbe Datei gespiegelt gezeigt: Das liest sich als
// zweite Gegend, kostet aber keine zusätzlichen Bytes.
const KARTE = "/karte-einzugsgebiet.webp";

function RouteMap({ idBase }: { idBase: string }) {
  return (
    <EditableImage
      id={`einzugsgebiet.roadmap.${idBase}.map`}
      src={KARTE}
      alt=""
      aria-hidden="true"
      className={`cura-route-map absolute inset-0 w-full h-full object-cover ${idBase === "paderborn" ? "scale-x-[-1] object-[60%_50%]" : "object-[40%_50%]"}`}
    />
  );
}
```

`EditableImage` setzt `loading="lazy"` und `decoding="async"` bereits selbst — die Sektion liegt weit unter der Falz.

- [ ] **Step 2: Karte in die Desktop-Schlangenlinie einhängen**

In `RouteSnake`, **vorher**:

```tsx
    <div className="relative w-full max-w-[460px] mx-auto" style={{ aspectRatio: `${vbWidth} / ${vbHeight}` }}>
      <svg
        viewBox={`0 0 ${vbWidth} ${vbHeight}`}
```

**Nachher:**

```tsx
    <div className="relative w-full max-w-[460px] mx-auto" style={{ aspectRatio: `${vbWidth} / ${vbHeight}` }}>
      <RouteMap idBase={route.idBase} />
      <svg
        viewBox={`0 0 ${vbWidth} ${vbHeight}`}
```

Die Karte ist damit das erste Kind und liegt hinter SVG, Schildchen und Auto — alle drei folgen im DOM.

- [ ] **Step 3: Karte in die mobile Zeitleiste einhängen**

Die Karte darf **nicht** direktes Kind von `<ol>` werden: Dort sind nur `<li>` erlaubt, und `EditableImage` hängt im Bearbeitungsmodus zusätzlich ein `<input type=file>` ein. Deshalb bekommt die Zeitleiste einen umschließenden `<div>`.

In `RouteTimelineMobile`, **vorher**:

```tsx
  return (
    <ol className="relative max-w-md mx-auto pl-12">
      {/* Road line */}
```

**Nachher:**

```tsx
  return (
    <div className="relative">
      <RouteMap idBase={route.idBase} />
      <ol className="relative max-w-md mx-auto pl-12">
      {/* Road line */}
```

Und am Ende derselben Komponente das schließende Tag ergänzen — **vorher**:

```tsx
      })}
    </ol>
  );
}
```

**Nachher:**

```tsx
      })}
      </ol>
    </div>
  );
}
```

Der neue `<div>` braucht `relative`, weil `RouteMap` sich mit `absolute inset-0` daran ausrichtet. Die Einrückung der `<ol>`-Kinder bleibt unverändert — sie umzuformatieren würde den Diff unnötig aufblähen.

- [ ] **Step 4: Deckkraft und Kantenabschluss ergänzen**

Am Ende von `CityRoadmap` — die Komponente gibt bisher nur `<section>…</section>` zurück, das wird zu einem Fragment:

**Vorher:**

```tsx
export function CityRoadmap() {
  return (
    <section className="relative w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-10">
        {ROUTES.map((r) => (
          <SingleRoute key={r.hub} route={r} />
        ))}
      </div>
    </section>
  );
}
```

**Nachher:**

```tsx
export function CityRoadmap() {
  return (
    <>
      <section className="relative w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-10">
          {ROUTES.map((r) => (
            <SingleRoute key={r.hub} route={r} />
          ))}
        </div>
      </section>

      <Css>{`
        /* Deckkraft per Media-Query, NICHT per JS-Breakpoint: Die Seiten
           werden vorab gerendert, ein abweichender Erstrender im Client
           bricht die Hydration. Mobil schwächer, damit die Ortsschildchen
           auf schmalen Displays klar bleiben. */
        .cura-route-map {
          opacity: 0.3;
          -webkit-mask-image: linear-gradient(to bottom, transparent, #000 6%, #000 94%, transparent);
                  mask-image: linear-gradient(to bottom, transparent, #000 6%, #000 94%, transparent);
        }
        @media (min-width: 768px) {
          .cura-route-map { opacity: 0.45; }
        }
      `}</Css>
    </>
  );
}
```

- [ ] **Step 5: Build muss durchlaufen**

```bash
npm run build
```

Erwartet: `prerender: 12 Routen vorab gerendert, 0 als Huelle, 12 Dateien geschrieben.`

- [ ] **Step 6: Desktop prüfen**

`http://localhost:5173/einzugsgebiet` öffnen, zur Routen-Sektion scrollen.

```js
const maps = document.querySelectorAll('.cura-route-map');
console.log('Anzahl:', maps.length);
console.log('Deckkraft:', getComputedStyle(maps[0]).opacity);
console.log('Paderborn gespiegelt:', getComputedStyle(maps[1]).transform);
console.log('geladen:', [...maps].every(m => m.complete && m.naturalWidth > 0));
```

Erwartet: `Anzahl: 2`, `Deckkraft: 0.45`, bei Paderborn eine Matrix mit `-1` als erstem Wert, `geladen: true`.

Mit den Augen: Die Karte liegt hinter der Route, blendet oben und unten weich aus, und **alle Ortsschildchen bleiben klar lesbar**. Ist Letzteres nicht der Fall, `opacity` in der Media-Query auf `0.35` senken.

- [ ] **Step 7: Mobil prüfen**

DevTools auf 375 × 812, Seite neu laden, zur Sektion scrollen.

```js
const m = document.querySelector('.cura-route-map');
console.log('Deckkraft:', getComputedStyle(m).opacity);
console.log('Zeitleiste statt Schlange:', !!document.querySelector('ol .cura-route-map'));
console.log('Seitwärts-Scroll:', document.documentElement.scrollWidth - document.documentElement.clientWidth);
```

Erwartet: `Deckkraft: 0.3`, `Zeitleiste statt Schlange: true`, `Seitwärts-Scroll: 0`.

- [ ] **Step 8: Committen**

```bash
git add src/app/components/CityRoadmap.tsx
git commit -m "feat(einzugsgebiet): statische Landkarte hinter beiden Routen (Desktop + mobil)"
```

---

## Task 5: Dokumentation und Abschlussprüfung

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: alles aus Task 1–4
- Produces: nichts

- [ ] **Step 1: Dateikarte ergänzen**

In `CLAUDE.md`, Abschnitt „Layout of the repo", nach der Zeile zu `CuraDomaLogo.tsx`:

```
  ValueSeal.tsx           rotierendes Wertesiegel am Hero-Bild; Text fest im Code (SVG textPath)
```

Und nach der `public/`-Zeile:

```
src/assets-src/         Roh-Bildmaterial, das NICHT ausgeliefert wird (Quelle der Landkarte)
scripts/karte-*.mjs     Einmal-Pipeline: Landkarten-SVG umfaerben -> WebP (siehe unten)
```

- [ ] **Step 2: Ausnahme bei den Styling-Konventionen festhalten**

In `CLAUDE.md`, Abschnitt „Styling conventions", an Punkt 5 (Animationen) anhängen:

```
   **Eine bewusste Ausnahme von der Zurückhaltung bei Dauer-Animationen:** das
   Wertesiegel (`ValueSeal.tsx`) dreht sich endlos. Vertretbar, weil genau ein
   kleines Element und ausschließlich `transform` animiert wird — das läuft auf
   dem Compositor, nicht im Hauptthread, wie die zwei Drift-Ebenen in
   `BackgroundScene`. Das ist KEIN Freibrief für weitere Dauer-Animationen.
```

- [ ] **Step 3: Herkunft der Landkarte dokumentieren**

In `CLAUDE.md`, Abschnitt „Things that look like problems but aren't", als neuen Punkt:

```
- **`src/assets-src/karte-c2.svg` ist 1,3 MB gross und wird nirgends importiert.** Das ist
  die QUELLE der Landkarte hinter den Einzugsgebiet-Routen, kein Ausliefer-Asset. Erzeugt
  mit Higgsfield (`recraft_v4_1`, `model_type: "vector"`, Job `b47d8d3f-2268-467e-936a-95992479c084`).
  `scripts/karte-recolor.mjs` hellt daraus alle Farben mit Luminanz < 140 um 72 % Richtung
  `#DFF7F8` auf (die dunklen Baumkonturen), `scripts/karte-raster.mjs` rastert das Ergebnis
  ueber ein Chrome-Canvas zu `public/karte-einzugsgebiet.webp`. Als SVG waere die Karte 412 KB
  gzip bei 1.951 Pfaden — mehr als der gesamte App-Chunk. Neu erzeugen: beide Skripte
  nacheinander laufen lassen. Das SVG hat `preserveAspectRatio="none"` und ist ABSICHTLICH
  horizontal gestaucht; beim Rastern muss das Verhaeltnis 4:7 erhalten bleiben.
```

- [ ] **Step 4: Gesamtprüfung**

```bash
npm run build
node --test scripts/karte-recolor.test.mjs
ls -la public/karte-einzugsgebiet.webp
git status --short
```

Erwartet:
- `prerender: 12 Routen vorab gerendert, 0 als Huelle, 12 Dateien geschrieben.`
- `pass 6`, `fail 0`
- WebP ≤ 80 KB
- `git status` zeigt nur noch `CLAUDE.md` als geändert

- [ ] **Step 5: Durchklicken**

Startseite und `/einzugsgebiet` je einmal auf Desktop **und** 375 × 812:

- Siegel überlappt und dreht sich, verschwindet hinter dem Bildrahmen
- Karte hinter beiden Routen, Ortsschildchen lesbar
- Konsole **komplett ohne Warnungen**, insbesondere ohne `[Hydration]`
- kein Seitwärts-Scrollen

- [ ] **Step 6: Committen**

```bash
git add CLAUDE.md
git commit -m "docs: Wertesiegel und Karten-Pipeline in CLAUDE.md nachtragen"
```

---

## Selbstprüfung des Plans

**Spec-Abdeckung**

| Spec | Aufgabe |
|---|---|
| §2.1 Inhalt (vier Begriffe) | Task 1 Step 1 |
| §2.2 Komponente, eindeutige Pfad-id | Task 1 Step 1 |
| §2.3 Typografie/Farbe | Task 1 Step 1, Laufweite gemessen in Step 4 |
| §2.4 Platzierung + Stapelreihenfolge | Task 1 Step 2, geprüft in Step 5 |
| §2.5 Größe, Rotation, Reduced Motion, A11y | Task 1 Steps 1, 6, 7 |
| §2.6 nicht editierbar | Task 1 Step 1 (im Code begründet) |
| §3.1 Herkunft | Task 2 Step 1, Task 5 Step 3 |
| §3.2 Umfärben | Task 2 |
| §3.2 Rastern, 4:7, 80-KB-Grenze | Task 3 |
| §3.3 Einbau, Deckkraft, Maske, Spiegelung, lazy | Task 4 |
| §3.4 Editierbarkeit als EditableImage | Task 4 Step 1 |
| §4 Randbedingungen | Global Constraints |
| §5 Verifikation | Task 1 Steps 3–7, Task 4 Steps 5–7, Task 5 Steps 4–5 |
| §7 Nachtrag CLAUDE.md | Task 5 |

Keine Lücke.

**Platzhalter:** keine. Jeder Code-Schritt enthält vollständigen Code, jeder Prüfschritt einen ausführbaren Befehl mit erwarteter Ausgabe. Die drei Stellen mit Spielraum (Schriftgröße, Umfärb-Schwelle, Deckkraft) sind keine Platzhalter, sondern Messschritte mit benanntem Ausgangswert, Messverfahren und Korrekturrichtung.

**Typkonsistenz:** `remapColor`/`luminance`/`recolorSvg`/`THRESHOLD` werden in Task 2 definiert und im Test identisch verwendet. `RouteMap({ idBase })` wird in Task 4 Step 1 definiert und in Steps 2 und 3 mit derselben Signatur aufgerufen. Die Klasse `.cura-route-map` wird in Step 1 vergeben und in Step 4 sowie den Prüfschritten identisch verwendet. `ValueSeal({ className, idSuffix })` wird in Task 1 Step 1 definiert und in Step 2 nur mit `className` aufgerufen — `idSuffix` hat einen Default.

**Offene Abhängigkeit:** Task 4 setzt `public/karte-einzugsgebiet.webp` aus Task 3 voraus. Task 1 ist von Task 2–5 vollständig unabhängig und könnte auch zuerst oder allein umgesetzt werden.
