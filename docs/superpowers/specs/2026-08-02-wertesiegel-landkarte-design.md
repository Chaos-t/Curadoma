# Wertesiegel + Landkarte hinter der Route — Design

- **Datum:** 2026-08-02
- **Anlass:** Der Betreiber hat zwei Elemente von andreasdevries.de als Vorbild geschickt: ein rotierendes Kreis-Textrad, das halb hinter einem Bild liegt, und eine gezeichnete Landkarte hinter der Stationen-Route.
- **Status:** freigegeben (Design), Umsetzungsplan folgt

Zwei **unabhängige** Features. Sie teilen keine Datei außer `CLAUDE.md`/dieser Spec und können getrennt gebaut, getestet und zurückgerollt werden.

---

## 1. Ziele

| | Ziel |
|---|---|
| **Teil 1** | Ein langsam rotierendes Kreis-Siegel mit vier Wertebegriffen, das die obere linke Ecke des Hero-Bilds auf der Startseite überlappt und dabei **teilweise dahinter** liegt. |
| **Teil 2** | Eine statische, gezeichnete Landkarte als Hintergrund hinter beiden Stationen-Routen im Einzugsgebiet. |

### Nicht-Ziele

- Keine Animation der Landkarte. Der Betreiber hat sich ausdrücklich für **statisch** entschieden; die Bewegung liefert weiterhin allein das scrollgesteuerte Auto.
- Kein Parallax, keine ziehenden Wolken, kein WebGL. (Siehe Leistungs-Randbedingungen.)
- Das Siegel wird **nicht** über den Inhalts-Editor bearbeitbar (Begründung in §2.6).
- Keine Änderung an Route, Ortsliste, Scroll-Logik oder mobiler Zeitleisten-Umschaltung.

---

## 2. Teil 1 — Wertesiegel

### 2.1 Inhalt

Umlaufend, in Großbuchstaben, durch `·` getrennt:

```
MIT HERZ · ZUVERLÄSSIG · RESPEKTVOLL · ZUHAUSE BETREUT ·
```

Der Text wird so oft wiederholt, dass der Kreis lückenlos gefüllt ist (bei der gewählten Geometrie einmal; die tatsächliche Anzahl wird beim Bauen im Browser bestimmt, nicht geraten).

In der Mitte ein `HandHeart`-Icon (lucide, `strokeWidth={1.5}`, `#6FD3D1`) — dasselbe Icon, das schon im Hero-Badge sitzt.

### 2.2 Neue Komponente

`src/app/components/ValueSeal.tsx` — eine Datei, ein Zweck, keine Abhängigkeit außer `lucide-react` und `<Css>`.

```
<ValueSeal className="…" />
```

Aufbau: ein `<svg viewBox="0 0 200 200">` mit
- einem unsichtbaren Kreispfad (`<path id="cura-seal-path" d="M 100,100 m -76,0 a 76,76 0 1,1 152,0 a 76,76 0 1,1 -152,0" fill="none">`),
- einem `<text><textPath href="#cura-seal-path">…</textPath></text>`,
- optional einem Haarlinien-Ring in `#E5F4F5` als Abschluss (Entscheidung am lebenden Objekt).

**Die Pfad-`id` muss eindeutig bleiben.** Wird das Siegel je zweimal auf einer Seite gerendert, kollidieren die IDs und beide `textPath` zeigen auf denselben Pfad. Für v1 wird es genau einmal eingesetzt; die Komponente nimmt trotzdem eine optionale `idSuffix`-Prop, damit das nicht zur Falle wird.

### 2.3 Typografie und Farbe

| | Wert |
|---|---|
| Schrift | `'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif`, `font-weight: 500` |
| Größe | `font-size: 13` (SVG-Einheiten, skaliert mit dem viewBox) |
| Laufweite | `letter-spacing: 0.18em` — **im Browser nachjustieren**, Laufweite entlang eines Pfades rendert je Engine unterschiedlich |
| Farbe Text | `#0F7C77` (kontrastsicher, siehe Kontrastregel in CLAUDE.md) |
| Farbe Icon | `#6FD3D1` |

`#6FD3D1` wird bewusst **nicht** für den Text verwendet — auf Weiß nur ~1,6:1.

### 2.4 Platzierung und Stapelreihenfolge (der eigentliche Trick)

In [HomePage.tsx](../../../src/app/components/HomePage.tsx), Hero-Bildspalte:

```
<div className="cura-hero-image flex-1 … relative">     ← bleibt
  <ValueSeal className="absolute -top-6 -left-6 lg:-top-10 lg:-left-10 z-0 …" />   ← NEU, Geschwister
  <div className="relative z-10 rounded-3xl overflow-hidden … border-4 border-white">  ← + relative z-10
    <EditableImage id="home.hero.image" … />
  </div>
  <div className="cura-card-glow absolute -bottom-6 -left-4 …">…</div>   ← bleibt (z-Auto > z-0)
</div>
```

Der Effekt entsteht **ausschließlich** über `z-0` am Siegel und `relative z-10` am Bildrahmen — kein Clipping, keine Maske. Weil der Rahmen `overflow-hidden`, `rounded-3xl` und einen 4 px weißen Rand hat, verschwindet das Siegel sauber darunter.

Position oben **links**: unten links sitzt bereits die „Anerkannter Partner"-Karte.

Geprüft: `-left-10` = 2,5 rem ragt in den 4-rem-`gap` zwischen Text- und Bildspalte, kollidiert also nicht mit der Textspalte. Die umgebende `<section>` hat `overflow-hidden`, das Siegel ist aber weit von der Sektionskante entfernt.

### 2.5 Größe, Bewegung, Barrierefreiheit

- **Größe:** `w-[110px] h-[110px] lg:w-[170px] lg:h-[170px]`. Mobil deutlich kleiner, sonst erschlägt es das Bild. Reine CSS-Media-Query über Tailwind — **kein JS-Breakpoint** (SSG, siehe CLAUDE.md „Pre-rendering").
- **Rotation:** `animation: curaSealSpin 30s linear infinite` auf dem `<svg>`, Keyframe nur `transform: rotate(0 → 360deg)`.
  - Das ist bewusst eine **Dauer-Animation**, die wir sonst meiden. Vertretbar, weil genau ein kleines Element und ausschließlich `transform` animiert wird → läuft auf dem Compositor, nicht im Hauptthread. Dieselbe Kategorie wie die zwei bestehenden Hintergrund-Drifts in `BackgroundScene` (38 s / 52 s). CLAUDE.md erlaubt zeitbasierte Bewegung ausdrücklich für „ambientes Schleifen".
  - `@media (prefers-reduced-motion: reduce) { animation: none; }`.
- **Keyframes über `<Css>`**, nie `<style>{…}</style>` (Hydrations-Regel).
- **A11y:** `aria-hidden="true"`. Die Begriffe sind dekorative Wiederholung — die Sektion „Warum sich Familien für uns entscheiden" nennt weiter unten dieselben Werte als echten Inhalt. Ein zweites Vorlesen wäre Lärm.

### 2.6 Warum nicht editierbar

Entscheidung des Betreibers, mit dieser Begründung: Der Text läuft in einem SVG-`textPath` an einer Kurve entlang. `contentEditable` ist dort unzuverlässig (Cursor springt), und jede Textänderung verändert die Bogenlänge, sodass die Wiederholungszahl neu berechnet werden müsste. Die Werte stehen daher **fest im Code**, wie der Axion-Studio-Credit im Footer.

Nachziehbar, falls später gewünscht: ein Feld-Trio im Admin-Bereich (nicht Direkt-Klick auf dem Siegel). Ausdrücklich außerhalb dieser Spec.

---

## 3. Teil 2 — Landkarte hinter der Route

### 3.1 Herkunft des Bildmaterials

Erzeugt über Higgsfield, Modell `recraft_v4_1`, `model_type: "vector"` — liefert echtes SVG. Ausgewählter Kandidat: Job `b47d8d3f-2268-467e-936a-95992479c084` („C2"), gezeichneter Landkarten-Look mit Hügelketten, Baumreihen auf den Kämmen, Höhenlinien, Dörfern mit Kirchtürmen, Fluss und Kompassrose.

Rohzustand: 1.286 KB SVG, 1.951 Pfade, dunkelgraue Baumkonturen.

### 3.2 Aufbereitung (einmalig, Ergebnis wird eingecheckt)

**Schritt 1 — Umfärben.** Die dunklen Töne sind eine kleine, klar abgegrenzte Gruppe:

| Farbe | Vorkommen | Rolle |
|---|---|---|
| `rgb(83,109,103)` | 178 | Baumkonturen / Stämme |
| `rgb(119,154,149)` | 126 | mittleres Graugrün |
| `rgb(65,91,86)` | 75 | dunkelste Konturen |
| `rgb(92,119,113)` | 39 | Konturen |
| ~15 Einzelfarben | je 1 | Verläufe |

Regel: jede Farbe mit Luminanz < 140 wird zu 72 % Richtung `#DFF7F8` verschoben (`lerp`), Rest bleibt unangetastet. Dadurch bleibt die Zeichnung strukturell erhalten, verliert aber den harten Kontrast. Die Marken-Töne `#A8DCD3`, `#6FD3D1`, `#BFEAF2`, `#F8FEFF` bleiben unverändert.

**Schritt 2 — Rastern.** Das umgefärbte SVG wird in Chrome geladen, auf ein Canvas gezeichnet und per `canvas.toDataURL('image/webp', 0.82)` encodiert; die Bytes werden nach `public/karte-einzugsgebiet.webp` geschrieben.

Warum nicht als SVG ausliefern: 412 KB gzip und 1.951 DOM-Pfade, mal zwei Routen. Zum Vergleich: der gesamte App-Chunk ist 39 KB gzip. Als WebP unter der Falz sind es erwartete 40–60 KB.

Warum dieser Weg: lokal ist **kein** Rasterizer vorhanden (`cwebp`, ImageMagick, Inkscape, `sharp` fehlen alle; `convert` im `PATH` ist die Windows-Dateisystem-Konvertierung, nicht ImageMagick). Chrome ist bereits verbunden und kann WebP nativ encodieren — keine neue Projekt-Abhängigkeit.

**Achtung beim Rastern:** Das SVG hat `viewBox="0 0 2688 2688"` bei `width="1536" height="2688"` und `preserveAspectRatio="none"` — die Grafik ist **absichtlich horizontal gestaucht**. Genau dieses Seitenverhältnis (1536 : 2688 ≈ 4 : 7) muss beim Rastern erhalten bleiben, sonst sieht die Karte anders aus als im freigegebenen Entwurf.

**Zielgröße:** 768 × 1344 px — halbe Kantenlänge des Originals, gleiches Seitenverhältnis. Das Bild muss **nicht** zum `viewBox` der Route (800 × 1900) passen: im Layout liegt es unter `object-fit: cover` und wird ohnehin beschnitten. Ein Anpassen an 800 × 1900 würde die Grafik ein zweites Mal stauchen.

**Harte Grenze:** > 80 KB ⇒ Qualität/Größe senken, nicht durchwinken.

*Rückfallebenen, falls der Chrome-Canvas-Weg scheitert:* (a) `sharp` einmalig **außerhalb** des Projekts installieren und das Bild dort erzeugen — vorher fragen, weil es eine neue Abhängigkeit wäre; (b) das von Higgsfield gelieferte `_min.webp` verkleinern und auf das Umfärben verzichten — nur als Notnagel, weil genau dieses Umfärben der Grund für die Wahl von C2 war.

### 3.3 Einbau

In [CityRoadmap.tsx](../../../src/app/components/CityRoadmap.tsx):

- **`RouteSnake` (Desktop):** ein einfaches, rein dekoratives `<img>` als erstes Kind des Wrappers, `absolute inset-0`, `object-cover`, hinter dem Routen-SVG. Der Wrapper hat bereits `relative`.
- **`RouteTimelineMobile`:** dieselbe Karte, aber schwächer (siehe Deckkraft), damit die Ortsschildchen auf schmalen Displays klar bleiben. Mobile-first ist Pflicht — die mobile Fassung kommt im **selben** Commit.
- **Deckkraft:** `opacity: .45` Desktop, `opacity: .30` mobil (CSS-Media-Query, kein JS).
- **Kantenabschluss:** `mask-image: linear-gradient(to bottom, transparent, #000 6%, #000 94%, transparent)`, damit die Karte oben und unten ausblendet statt hart abzuschneiden.
- **Paderborn gespiegelt:** `scale-x-[-1]` plus leicht verschobene `object-position`, damit die zweite Route nicht als Kopie der ersten liest. Kostet keine zusätzlichen Bytes.
- **Ladeverhalten:** `loading="lazy"`, `decoding="async"`, `aria-hidden="true"`. Die Sektion liegt weit unter der Falz.

### 3.4 Editierbarkeit

**Entscheidung des Betreibers (Nachtrag Abschlussreview, 2026-08-02): bewusst NICHT editierbar.** Ursprünglich als `EditableImage` eingebunden, aber das funktioniert nicht:

- **Nicht anklickbar.** Die Routen-Grafik (SVG, Ortsschildchen, Auto) liegt lückenlos über der Karte. Im Bearbeitungsmodus bleibt an keiner Stelle eine Klickfläche frei, über die sich das Bild ersetzen ließe.
- **A11y-Konflikt.** `EditableImage` hängt im Bearbeitungsmodus zusätzlich `role="button" tabIndex={0}` an dasselbe Element, das gleichzeitig `aria-hidden="true"` trägt — ein fokussierbarer, aber für Screenreader stummer Knoten.

Die Karte ist daher ein schlichtes `<img aria-hidden="true" loading="lazy" decoding="async">` ohne Editor-Anbindung. Ein Austausch läuft über die eingecheckte Pipeline (§3.2, beide Skripte unter `scripts/`), nicht über den Inhalts-Editor.

---

## 4. Randbedingungen, die beide Teile betreffen

Aus [CLAUDE.md](../../../CLAUDE.md), keine davon ist verhandelbar:

1. **Inline-CSS nur über `<Css>`.** `<style>{…}</style>` bricht die Hydration, sobald das CSS ein Anführungszeichen, `&` oder `<` enthält.
2. **Kein `window`-Zugriff beim ersten Render.** Größen- und Deckkraft-Unterschiede laufen über Media-Queries, nicht über JS-Breakpoints.
3. **Mobile-Variante im selben Commit**, nicht als Nachzügler.
4. **Kontrastregel:** `#6FD3D1` nie für Text; Textfarben `#0F7C77` / `#0E6E6A`.
5. **Leistungsbudget:** Das neue Bild ist das einzige zusätzliche Netzgewicht und liegt unter der Falz. Kein zusätzliches JavaScript außer der Siegel-Komponente (< 2 KB).

---

## 5. Verifikation

Ohne diese Schritte gilt nichts als fertig:

1. `npm run build` → Zeile `prerender: 12 Routen vorab gerendert, **0 als Huelle**`.
2. Größe prüfen: `public/karte-einzugsgebiet.webp` ≤ 80 KB.
3. Browser, Desktop:
   - Siegel überlappt die obere linke Bildecke und verschwindet sichtbar **hinter** dem weißen Rahmen.
   - Siegel dreht sich; Konsole ohne `[Hydration]`-Warnung.
   - Einzugsgebiet: Karte liegt hinter beiden Routen, Paderborn erkennbar gespiegelt, Ortsschildchen und Auto klar lesbar.
4. Browser, 375 × 812:
   - Siegel kleiner, kein Überlauf, keine Seitwärts-Scrollleiste.
   - Zeitleiste statt Schlangenlinie, Karte schwächer, Schildchen lesbar.
5. `prefers-reduced-motion: reduce` erzwingen → Siegel steht still.
6. Konsole komplett ohne Warnungen.

---

## 6. Risiken

| Risiko | Umgang |
|---|---|
| Chrome-Canvas-Weg zum WebP erweist sich als umständlich | Zwei benannte Rückfallebenen in §3.2 |
| Laufweite im `textPath` rendert je Browser anders | Am lebenden Objekt justieren, nicht im Code raten; in Chrome **und** Firefox ansehen |
| Karte bei 45 % stört mobil doch die Schildchen | Deckkraft ist ein einzelner Wert — im Browser nachziehen |
| Bild sprengt das Budget | Harte Grenze 80 KB in §3.2, sonst Qualität senken |

---

## 7. Nachtrag beim Bauen

Nach der Umsetzung ist [CLAUDE.md](../../../CLAUDE.md) zu ergänzen:

- unter „Layout of the repo": `ValueSeal.tsx` und `public/karte-einzugsgebiet.webp`,
- unter „Styling conventions": das Siegel als Ausnahme von der Zurückhaltung bei Dauer-Animationen, mit Begründung,
- Herkunft der Karte (Higgsfield `recraft_v4_1`, Job-ID, Umfärb-Regel), damit sie später reproduzierbar neu erzeugt werden kann.

Kein Eintrag in [admin-verwaltung-referenz.md](../admin-verwaltung-referenz.md) §11 — das Protokoll dort betrifft nur Admin, Editor und Edge Function; hier ist nichts davon berührt.
