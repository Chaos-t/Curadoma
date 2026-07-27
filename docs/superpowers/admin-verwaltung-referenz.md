# Backoffice / Verwaltung — Bau-Referenz & Änderungsprotokoll

> **Zweck dieses Dokuments:** genau festhalten, *wie* das Verwaltungssystem (Backoffice)
> gebaut wurde, *warum* welche Entscheidung fiel, und *was* bei jeder späteren Optimierung
> geändert wird. So bleibt der Bau nachvollziehbar und als Muster wiederverwendbar.
> **Regel: Bei jeder Änderung am Admin/Backoffice unten im Änderungsprotokoll (§10) einen Eintrag ergänzen.**

- **Erstellt:** 2026-07-18 (Runde 1 — Backoffice)
- **Spec:** [specs/2026-07-18-admin-panel-ausbau-design.md](specs/2026-07-18-admin-panel-ausbau-design.md)
- **Plan:** [plans/2026-07-18-admin-panel-runde1-backoffice.md](plans/2026-07-18-admin-panel-runde1-backoffice.md)

---

## 1. Was das Backoffice ist (in einem Satz)

Ein passwortgeschützter Bereich unter `/admin`, in dem der Betreiber die bereits im
Supabase-KV liegenden **Kontaktanfragen, Bewerbungen und Terminanfragen** sieht und
verwaltet (Status, interne Notiz, Archivieren, Löschen, CV-Download, CSV-Export) —
plus die bestehende „Seite bearbeiten"-Funktion (Inline-Editor).

**Motivation:** Vorher lagen alle Einsendungen zwar im KV, waren aber nur per E-Mail
sichtbar. Eine verlorene Mail = verlorene Anfrage. Das Backoffice macht sie durchsuchbar
und nachverfolgbar.

## 2. Vorgehen (der Prozess, Schritt für Schritt)

1. **Analyse zuerst.** Gesamten Code + Backend gelesen; 5 parallele Analyse-Agenten
   (Admin-Lücke, Sicherheit/DSGVO, Code-Qualität, SEO/Perf/A11y, Feature-Ideen) über das
   ganze Projekt laufen lassen. Ergebnis: der Inline-Editor war gut, aber es fehlte ein
   Betreiber-Backoffice — größte echte Lücke.
2. **Design (Spec) + Freigabe.** Architektur-Ansätze abgewogen, Datenmodell/Endpunkte/UI
   entworfen, als Spec dokumentiert, vom Nutzer freigeben lassen.
3. **Plan.** Bite-sized Umsetzungsplan (11 Tasks) mit Tests je Task.
4. **Bauen — 1 kohärenter Schritt pro Runde, jeder getestet.** Reihenfolge:
   reine Helfer → Endpunkte → Provider → Komponenten → Routing → Politur.
5. **Adversariales Audit.** Nach dem Bau: parallele Reviewer (Server/Client/UX) + jeder
   Fund von einem unabhängigen Skeptiker gegengeprüft. Nur bestätigte Funde behoben.
6. **Lokal vorführen** (Demo-Modus mit Beispieldaten), dann **deployen** (Function → E2E →
   Frontend nach `main` → Pages).

## 3. Architektur-Entscheidung

**Ansatz A — bestehende Edge Function + SPA erweitern, Passwort-Muster wiederverwenden.**
(Verworfen: Supabase-Auth/Konten = zu großer Bruch; rohes Supabase-Dashboard = für
Betreiber unbrauchbar.)

- **Ein Backend** (`supabase/functions/make-server-ec6100a6`) = einzige Vertrauensgrenze.
- Neue **authentifizierte** Routen, Auth **identisch** zum bestehenden Editor
  (`site-content/save`): `EDIT_PASSWORD`-Gate → Rate-Limit (fail-closed) → konstant-Zeit-
  Vergleich `ctEq`.
- Service-Role liest/schreibt KV serverseitig; das Frontend hält nur den anon key +
  (im Speicher) das eingegebene Passwort.

## 4. Sicherheitsmodell (der wiederverwendbare Kern)

Gilt für **alle** `/admin/*`-Routen — beim Kopieren in andere Projekte 1:1 mitnehmen:

- **PII nie ohne bestandene Passwortprüfung.** Jede Route ruft zuerst `adminGate()`:
  `EDIT_PW` gesetzt? → sonst 503 · Rate-Limit (fail-**closed**, d. h. bei KV-Fehler 429) →
  sonst 429 · `ctEq(password, EDIT_PW)` → sonst `editBumpFail` + 600 ms Delay + 401.
- **`type` streng aus `contact|job|appointment`** → feste KV-Prefixe (keine Prefix-Injection).
- **`id` per UUID-Regex** geprüft, **bevor** ein KV-Key gebaut wird (keine Key-Traversal).
  → Live verifiziert: `id="../../../etc"` bei falschem Passwort = 401 am Gate, erreicht die
  DB nie.
- **Termin-`token` (Aktions-Secret) wird aus JEDER Antwort entfernt** (`publicAdminRecord`)
  — auch bei `update`.
- **`admin_note` wird als Klartext gespeichert** (nur ≤ 2000 Zeichen), **nicht** HTML-escaped.
  Grund: Ausgabe-Sicherheit passiert beim *Rendern* (React escapt Textknoten automatisch,
  Textarea-Value ist sicher, CSV via `csvCell`). HTML-Escaping beim Speichern würde normale
  Notizen mit `<`, `&`, `"` bei jedem erneuten Speichern doppelt verfälschen. **Kein
  `dangerouslySetInnerHTML` im Admin.**
- **CSV-Export mit Formel-Injection-Schutz**: `csvCell()` setzt ein `'` vor Zellen, die mit
  `= + - @ \t \r` beginnen, plus RFC-4180-Quoting; UTF-8-BOM für Excel.
- **CORS** steht noch auf `*` (öffentliches Formular-Backend) — auf der DSGVO/Härtungs-Liste;
  das Passwort-Gate schützt die Admin-Routen origin-unabhängig.

## 5. Datenmodell (nicht-brechend)

Bestehende KV-Datensätze (`contact_message:*`, `job_application:*`, `appointment:*`) werden
um **Betreiber-Felder** ergänzt (bei erster Aktion gesetzt; fehlen = Default):

| Feld | Werte | Default |
|---|---|---|
| `admin_status` | `neu` · `in_bearbeitung` · `erledigt` | `neu` |
| `admin_note` | String (≤ 2000, Klartext) | `""` |
| `admin_archived` | boolean | `false` |
| `admin_updated_at` | ISO-Zeitstempel | — |

`admin_status` ist **getrennt** vom bestehenden `status` (bei Terminen die Buchungslogik
`pending/confirmed/declined`) — die Buchung bleibt unberührt.

## 6. Dateien (Landkarte)

**Server** (`supabase/functions/make-server-ec6100a6/`)
- `admin_util.ts` — **reine, importfreie Helfer** (Typen, `isUuid`, `isAdminStatus`,
  `sanitizeNote`, `csvCell`/`buildCsv`, `CSV_COLUMNS`). Bewusst ohne Deno-Imports, damit
  sie sowohl Deno (die Function) als auch Node (`node --test`) importieren können.
- `admin_util.test.ts` — Unit-Tests dazu (`node --test`).
- `index.ts` — Block „Backoffice (Admin)" vor `Deno.serve`: `adminGate`, `publicAdminRecord`,
  `loadSorted` + 5 Routen.

**Frontend** (`src/`)
- `lib/admin.tsx` — `AdminProvider` (Passwort im Speicher) + Daten-Client (`list/update/
  remove/cvUrl/exportCsv`) + `adminErrorText()` (präzise Fehlermeldungen).
- `app/components/admin/AdminArea.tsx` — Route-Element für `/admin`: `noindex`,
  Auth-Gate, **eigener seitenfüllender Rahmen** (bewusst NICHT im öffentlichen Layout).
- `AdminLoginForm.tsx` — animierter Login (Eintritt, Schloss-Pop, Glow-Orbs, Wackeln bei
  Fehlpasswort; alles `prefers-reduced-motion`-sicher).
- `AdminDashboard.tsx` — Kacheln mit „neu"-Zähler + „Seite bearbeiten" + Abmelden.
- `AdminInbox.tsx` — Liste + Status-Filter + Suche + CSV-Export; öffnet `AdminDetail`.
- `AdminDetail.tsx` — Slide-over-Panel: Status/Notiz/Archiv/Löschen/CV/Antworten/Anrufen;
  Modal-Fokus (Fokus rein, Tab-Falle, Esc, Fokus-Rückgabe); `h-dvh` (volle Höhe).
- `fields.tsx` — pro-Typ-Metadaten (Listenspalten, Detailfelder, Status-Labels/-Farben).
- `app/routes.tsx` — `/admin` als **eigenständige Top-Level-Route** (nicht Layout-Kind).
- `app/App.tsx` — `<AdminProvider>` um `<ContentProvider>`.

## 7. Endpunkt-Vertrag

Alle POST, alle durch `adminGate`. `type ∈ {contact,job,appointment}`.
- `POST /admin/list` `{password,type,includeArchived?}` → `{items:[…]}` (Datum desc, PII, ohne `token`).
- `POST /admin/update` `{password,type,id,admin_status?,admin_note?,admin_archived?}` → `{ok,item}`.
- `POST /admin/delete` `{password,type,id}` → `{ok}` (idempotent; bei `job` auch CV-Datei aus Storage).
- `POST /admin/cv-url` `{password,id}` (nur job) → `{url}` (kurzlebiger Signed-Link, ~10 min).
- `POST /admin/export` `{password,type,includeArchived?}` → `text/csv` (BOM + Injection-Schutz).

## 8. Test- & Deploy-Methodik

- **Reine Helfer:** `node --test "supabase/functions/make-server-ec6100a6/admin_util.test.ts"`
  — Node 24 strippt TS-Typen, importiert `./admin_util.ts` (gleiche Import-Schreibweise wie
  Deno). Null neue Abhängigkeit. (Deno ist lokal nicht installiert → reine Logik so testen.)
- **Frontend-Build:** `npm run build` (kein tsconfig/tsc — Verifikation im Browser).
- **Endpunkte live (Ablehnungs-Pfade ohne Passwort):** curl gegen die deployte Function —
  falsches/kein Passwort → 401, böse `id` → 401 am Gate. **Erfolgspfade nur der Betreiber**
  (Passwort), nie der Assistent.
- **Visuelle Vorführung:** temporärer Demo-Modus (`?demo` → Beispieldaten im `AdminProvider`),
  Screenshots, danach **sofort per `git checkout` entfernt** (nie committet).
- **Deploy-Reihenfolge:** `npx supabase functions deploy make-server-ec6100a6 --no-verify-jwt
  --project-ref <ref>` → curl-E2E → Branch nach `main` mergen → GitHub Actions baut Pages
  (~1 Min Build + ~10 Min Cache). **`--no-verify-jwt` ist Pflicht** (sonst 401 auf die
  E-Mail-Links von `/appointment-action`).

## 9. Adversariales Audit (Runde 1) — Ergebnis

Server-Review: **0 Funde**. 6 bestätigte Client-Funde (UX/A11y/Robustheit), alle behoben:
1. `downloadCv` ohne try/catch/finally → hängendes Panel bei Netzfehler.
2. Detail-Panel ohne Fokus-Management trotz `aria-modal` → Fokus rein/Tab-Falle/Rückgabe ergänzt.
3. Login-Enter umging Busy-Schutz → `if (busy) return;` + Input während busy gesperrt.
4. Kleintext-Labels `#9AA3A8` unter WCAG-Kontrast → auf `#5F6B73` abgedunkelt.
5. Schließen während laufender Aktion konnte Panel wieder öffnen → `onChanged`-Guard.
6. Fehlende A11y-Namen (Passwort, Notiz, Login-Status) → `aria-label` + `role=status`.

## 10. Wichtige Entscheidungen & Fallen (fürs Wiederverwenden)

- **Admin bewusst AUSSERHALB des öffentlichen Layout** (eigene Top-Level-Route). Sonst
  überdeckt der Seiten-Footer das Detail-Panel und der Bereich wirkt „mittendrin".
- **Passwort nur im Speicher** (kein sessionStorage): Reload = Logout. Sicher; niemand kann
  per gesetztem Flag rein.
- **Detail-Panel `h-dvh`**, nicht `h-full` — robuste volle Höhe (auch mobil).
- **Präzise Fehlermeldungen** (`adminErrorText`): „neu anmelden" NUR bei echtem 401; 404 =
  „Route/Backoffice nicht gefunden" (z. B. Function noch nicht deployt), sonst Netz/Server.
- **Reine Helfer in eigene, importfreie Datei** → mit `node --test` testbar, ohne Deno.

## 11. Änderungsprotokoll

| Datum | Was geändert | Warum | Dateien |
|---|---|---|---|
| 2026-07-20 | **PageSpeed/Lighthouse-Optimierung (Performance + A11y + Best Practices).** Ausgangslage: Desktop 65 / A11y 91 / BP 96, mobil **NO_LCP** (kein LCP/TBT messbar), 1 MB JS in EINEM Chunk. (1) **NO_LCP behoben** — Ursache: `curaHeroEnterLeft/Right` starteten bei `opacity: 0` mit fill-mode `both`, der Hero-Text war ab dem ersten Frame unsichtbar → kein LCP-Kandidat. Keyframes animieren jetzt **nur `transform`** (zusätzlich compositor-freundlich). (2) **Start-Bundle 275 → ~114 KB gzip (−58 %)**: `three.js` (128 KB gzip, nur dekorativer Hintergrund) per `lazy` + `requestIdleCallback` nachgeladen; **Route-Splitting** für alle Seiten + den kompletten `/admin`-Bereich (react-router `lazy`); Editor-Oberfläche (`EditorChrome`, `SeoPanel`, `BlockPalette`) lädt **nur im Bearbeitungsmodus** (Gate VOR dem Rendern — sonst holt `React.lazy` den Chunk trotzdem); `react-vendor`-Chunk für besseres Caching. (3) **Render-Blocking weg**: Google Fonts aus dem CSS-`@import` (serielle Kette!) in den `<head>` als `media="print"`+onload + `preconnect`; ungenutzte Familie **Lora** entfernt; `preconnect` zu images.unsplash.com (Hero = LCP). (4) **Bilder**: Hero `loading=eager` + `fetchpriority=high` (kleingeschrieben — React 18!) + `width/height`; alle übrigen `loading=lazy` + `decoding=async`; Logo-`<img>` mit `width/height`. (5) **Konsolenfehler weg**: `/reviews` (502) und `/instagram-posts` (503) liefern bei fehlenden Secrets jetzt **HTTP 200 + leere Liste** (Client fällt ohnehin zurück; 5xx erzeugte auf JEDER Seite einen roten Konsolenfehler). (6) **A11y**: `aria-prohibited-attr` behoben (`Stars`-Div bekam `role="img"`), `aria-controls` nur wenn das Menü im DOM ist, **alle Überschriften-Sprünge** beseitigt (Footer h4→h3, HomePage h2→h4 ×2, sr-only h2 auf /leistungen + /einzugsgebiet), **Kontrast site-weit**: helles Türkis #6FD3D1 war als Text/Buttonfläche nur 1,6–1,8:1 → Text/Links/Badges auf **#0F7C77** bzw. **#0E6E6A** (auf Mint), Buttons auf #0F7C77, Grau #9AA3A8 → #5F6B73, Logo-Wortmarke/Tagline, Amber-Badge, deaktivierter Button. **#6FD3D1 bleibt bewusst für Icons/Rahmen/Flächen** (Kontrastregel gilt nur für Text) — Marken-Look erhalten. (7) **Nicht-komponierte Animation**: Logo-Wisch von `clip-path` auf `transform` (overflow-Clip + innerer Span). Verifiziert: Hero ab Frame 1 sichtbar, 0 Konsolenfehler, 0 Textelemente mit hellem Türkis/Grau, alle Buttons #0F7C77, keine Überschriften-Sprünge auf 5 Seiten, Build grün. | Betreiber wollte die PageSpeed-Befunde umfassend behoben haben; Lesbarkeit ist bei der Senioren-Zielgruppe besonders wichtig | `index.html`, `vite.config.ts`, `routes.tsx`, `App.tsx`, `BackgroundScene.tsx`, `editor/EditorChrome.tsx` (neu), `Layout.tsx`, `HomePage.tsx`, `CuraDomaLogo.tsx`, `GoogleReviews.tsx`, `EditableImage.tsx`, `styles/fonts.css`, `supabase/.../index.ts`, +Kontrast-Sweep über alle öffentlichen Seiten |
| 2026-07-20 | **Batch 2 — SEO pro Seite (Titel + Meta + Social + Schema).** Betreiber-editierbares Overlay über die statischen Code-Defaults (`lib/seo`). Server: `seo:current`-Store, `GET /seo` (öffentlich) + `POST /admin/seo/save`; `validateSeo` (Klartext-only: ganze Tags raus, Whitespace geglättet, Titel≤120/Beschr.≤320 gedeckelt; OG-Bild nur absolute http(s) via `safeHref`; Key-Regex `^/[a-z0-9-/]*`; 80er-Deckel), +Unit-Test (14 grün). Client: `ContentProvider` lädt `/seo` + `getSeo`/`saveSeo`; **`<Seo/>`** mischt Override>Code-Default>Seiten-Titel und setzt Title, Description, `og:title/description/url/image`, `twitter:title/description/image/card`, Canonical pro Route (og:image fällt ohne Override auf den Default zurück). **`SeoPanel`** (Modal via `OPEN_SEO_EVENT` aus der Bearbeiten-Leiste, „🔍 SEO & Titel"): Titel/Beschreibung/OG-Bild der AKTUELLEN Seite + Zeichenzähler + **Google-Vorschau**, speichert direkt. `DynamicPage` setzt den Title nicht mehr selbst (macht jetzt `<Seo/>`). LocalBusiness-JSON-LD steht weiter statisch in `index.html`. E2E: Backend sanitisiert (`<script>` raus, `javascript:`-Bild verworfen), Panel füllt/speichert, `document.title`+Meta live aktualisiert, öffentlicher Aufruf wendet Override an. **Adversariales Multi-Agenten-Review** vor Deploy. | Betreiber steuert Google-/Browser-Titel, Meta-Beschreibung und Teilen-Vorschau pro Seite selbst | `admin_util.ts`+Test, `index.ts`, `lib/content.tsx`, `Seo.tsx`, `editor/SeoPanel.tsx` (neu), `Layout.tsx`, `editor/EditToolbar.tsx`, `DynamicPage.tsx` |
| 2026-07-20 | **„Verlassen" → Landingpage + Seiten-Löschen räumt Bilddateien mit auf.** (1) **Verlassen** im Edit-Panel ruft jetzt zusätzlich `router.navigate("/")` (Data-Router-Instanz, da `EditToolbar` außerhalb des `RouterProvider` liegt) → man landet auf der Startseite und ist raus aus dem Bearbeitungsmodus. (2) **Seite löschen entfernt jetzt auch ihre Bilddateien** aus dem Storage: `content.getPageImagePaths(slug)` liest die `img/…`-Pfade aus den `page.<slug>.*`-Overrides (Regex auf die Storage-URL), `AdminPages.del` sichert vorher die Bytes (`fetchAsBase64`) und löscht die Dateien (`mediaDelete(path, force)`); die **Session-Rückgängig-Funktion lädt sie per `media/restore` wieder hoch** (+ Struktur + Seite). So bleibt nach dem Löschen nichts Ungenutztes in der Mediathek liegen — reversibel bis zum Verlassen/Reload. E2E lokal: Verlassen→„/" & Edit aus; Seite mit Bild löschen→Bilddatei weg (media/list leer)→Rückgängig→Seite + Bild zurück (Backend geprüft). Frontend only. | Betreiber will nach „Verlassen" auf der Website landen (nicht im Edit-Modus) und beim Seiten-Löschen keine verwaisten Bilddateien zurücklassen | `editor/EditToolbar.tsx`, `lib/content.tsx`, `admin/AdminPages.tsx` |
| 2026-07-19 | **Bearbeiten-Leiste als linkes Edge-Panel + Palette-Hover-Dynamik + Block-„+" auf festen Seiten.** (1) **`EditToolbar`** von der unteren Querleiste zu einem **linken, vertikalen Panel** umgebaut: normal eingeklappt (nur ein 36 px-Griff mit **rot pulsierendem Marker** — `animate-ping` — ragt heraus), fährt bei Hover/Tap per `translate-x` aus. Skaliert für künftige Optionen, nicht dauerhaft im Weg. (2) **Palette wieder enger** (Radius 190→156 → Abstand ~73 px) + **dynamischer Hover**: die berührte Kachel wächst (scale 1.26, z-30) nach vorn, die anderen weichen zurück (scale 0.84) — per JS-`hovered`-State + inline `transform` (Eintritt nur noch Opacity, damit sich Scale/transform nicht mit dem translate-Centering beißt). (3) **`PageBlocks`** (neu) im `Layout` nach dem `Outlet`: ein frei baubarer Block-Bereich am Ende der **festen Inhaltsseiten** (Home/Leistungen/Einzugsgebiet/Kontakt/Karriere + Leistungs-Unterseiten; Pfad→`site.<key>.blocks`), Besuchern nur mit Inhalt sichtbar — so gibt es die „+"-Palette auch dort, nicht nur auf selbst angelegten Seiten. E2E lokal: Griff links + Marker, Panel klappt auf (aria-expanded/translate-x-0), Palette Symmetrie 0 & Abstand 73, Home-Block anlegen→speichern→öffentlich sichtbar. (Rein Frontend, keine Function-Änderung.) | de-Vries-Ästhetik: Leiste weg vom Inhalt (links, Edge-Panel, pulsierender Hinweis), Palette enger+lebendiger, und Blöcke auch auf bestehenden Seiten | `editor/EditToolbar.tsx`, `editor/BlockPalette.tsx`, `editor/PageBlocks.tsx` (neu), `Layout.tsx` |
| 2026-07-19 | **Clean-System (Löschen mit Session-Undo) + Palette-Politur.** (1) **Mediathek — falsches „in Verwendung" gefixt:** `inUse` zählte JEDEN Override-Wert, auch **verwaiste Referenzen gelöschter Seiten** (`site-content/save` merged nur, entfernte nie Keys) → ungenutzte Bilder ließen sich nicht löschen. Neuer Server-Helfer `liveUsedImageUrls()` ignoriert `page.<slug>.*`-Referenzen, deren Seite nicht mehr in `pages:current` steht. Zusätzlich **`force`-Löschen** (trotzdem löschen) + Button immer aktiv. (2) **Session-Undo für Löschungen:** In-Memory-Papierkorb im `AdminProvider` (`trash`/`pushTrash`/`clearTrash`) + `<TrashToast>` mit „Rückgängig" — nur in der Sitzung, nach Reload endgültig. **Seite löschen** entfernt jetzt auch Blöcke+Zonen (`content.deletePageStructure`, Overrides bleiben — für Undo + von inUse ignoriert) und bietet Undo (`restorePageStructure` + Seite zurück). **Bild löschen** sichert vorher die Bytes und kann per neuem `POST /admin/media/restore` (Magic-Bytes/Größe/Pfad geprüft, upsert an denselben Pfad) wiederhergestellt werden. **⚠️ Undo re-schreibt keine Overrides** (die sind schon server-sanitisiert → erneutes Speichern würde `&`/`<` doppelt escapen) — nur Struktur; Overrides bleiben ohnehin erhalten. **⚠️ Undo holt den Seitenstand frisch** (`pagesList()`), nicht aus einer veralteten `getPages`-Closure (sonst wird die Seite nicht wieder eingetragen). (3) **Palette:** Radius 140→190 → **gleichmäßiger Abstand ~89 px, kein Stapeln mehr**; **Hover-Kachel scale 1.16 + z-10** (nach vorn); **kein hektisches Schließen** mehr beim Wegfahren (open bleibt bis Klick daneben/Esc/Scroll/Auswahl). E2E lokal verifiziert (Symmetrie 0, Abstände 89, Bild delete→restore, Seite delete→undo inkl. Backend). | Betreiber will „richtig löschen" (bleibt gelöscht) mit Session-Rückgängig, ungenutzte Bilder löschbar, und die Palette weniger gestapelt/robuster | `index.ts` (media/delete `force`, media/restore neu, `liveUsedImageUrls`), `lib/admin.tsx`, `lib/content.tsx`, `admin/AdminPages.tsx`, `admin/AdminMedia.tsx`, `admin/AdminArea.tsx`, `admin/TrashToast.tsx` (neu), `editor/BlockPalette.tsx` |
| 2026-07-19 | **Block-Power-ups (Batch 1): Palette-Zentrierung + echte Platzhalter + Ausrichtung + Typen.** (1) **Palette exakt symmetrisch:** Bug war, dass Tailwind v4 `-translate-x/y-1/2` in die eigene `translate`-CSS-Property kompiliert, während der Pop-Keyframe ZUSÄTZLICH `transform: translate(-50%,-50%)` setzte → beide addieren sich (−100% statt −50%) → Kacheln 42 px (halbe Kachel) daneben. Fix: Keyframe animiert nur noch `scale`, Zentrierung macht allein `translate`. Zusätzlich robuste Geometrie (Radius wählt sich so, dass der ganze Bogen in den Viewport passt, statt einzelne Kacheln zu klammern → immer zentriert). E2E: Mittelkachel exakt auf „+" (Offset 0). (2) **Echte Platzhalter** (`<Editable placeholder>` + `[data-ph]:empty::before` in globals.css): jeder Block zeigt im Editor einen grauen Funktions-Hinweis, der beim Tippen verschwindet, NIE als Inhalt gespeichert wird (leeres Feld bleibt leer) und Besuchern nicht angezeigt wird. (3) **Ausrichtung L/M/R pro Block** (`align` am Block, serverseitig geprüft, `left`=Default nicht gespeichert; `setBlockAlign`; L·M·R-Leiste oben links am Block). (4) **Neue Typen: Titel (H2), Zitat (blockquote+Quelle), Linie (hr).** Server: `BLOCK_TYPES` += title/quote/divider, `align` in validateBlocks, +Unit-Tests (13 grün). E2E lokal: 7 Kacheln, Platzhalter erscheint/verschwindet, Ausrichtung wirkt+persistiert, leere Blöcke für Besucher ausgeblendet, Speichern→Neuladen ok. | „Live-Bearbeiten wie de Vries" mit vielen Einstell-Möglichkeiten: symmetrischer Bogen, selbsterklärende Blöcke ohne Löschen, Ausrichtung, mehr Typen | `admin_util.ts`+Test, `editor/BlockPalette.tsx`, `editor/Editable.tsx`, `editor/BlockArea.tsx`, `editor/EditableList.tsx`, `lib/content.tsx`, `styles/globals.css`+`index.css` |
| 2026-07-19 | **de-Vries-Bausteine + Footer-Fix (Portal) + „Karte"-Block + freie Stichpunkte.** (1) **Radiale „+"-Palette** (`BlockPalette`): rundes „+", das die Typen **Text·Bild·Button·Karte** im **Bogen** auffächert (gestaffelte Animation). **Per Portal an `<body>`** gerendert → verlässt den Stacking-Kontext von `<main>` (`z-10`) und liegt mit `z-[300]` **garantiert über Footer & Bearbeiten-Leiste** — das war die eigentliche Ursache, warum `fixed z-[200]` vorher nicht half. Bogen nach oben, sonst nach unten; Positionen viewport-geklammert; Touch-tauglich (Tap öffnet/schließt). (2) **Neuer Block-Typ `card`** (Überschrift + Stichpunkt-Liste) auf eigenen Seiten. (3) **`EditableList`** — wiederverwendbare Stichpunkt-Liste, die auf dem **validierten Zonen-System** aufsetzt (Struktur = Zone `…/<key>.bullets` in `zones:current`, Text über `<Editable>`); genutzt von `card` UND den Leistungs-Karten → dort sind Stichpunkte jetzt **frei hinzufügbar/entfernbar** (vorher feste Anzahl). Server: `BLOCK_TYPES` += `card`, `ZONE_ID_RE` 64→120 (verschachtelte Listen-IDs), +2 Unit-Tests (13 grün). E2E lokal verifiziert: Palette öffnet 4 Kacheln, portaliert (z-300 > Footer z-10, `elementFromPoint` = Kachel oben), Karte anlegen + Stichpunkt +/−, Speichern→Backend (`card`-Block + Bullet-Zone + Texte) →Neuladen rendert; Leistungen unverändert lauffähig. Testreste entfernt. | Live-Bearbeiten im de-Vries-Stil; Footer verdeckt die Palette nie mehr; bestehende Karten (Leistungen) frei erweiterbar | `admin_util.ts`+Test, `editor/BlockPalette.tsx` (neu), `editor/EditableList.tsx` (neu), `editor/BlockArea.tsx`, `lib/content.tsx`, `LeistungenPage.tsx` |
| 2026-07-19 | **Fix — eigene Seiten gingen verloren + „Seite nicht gefunden" + Footer zu weit oben.** (1) **Datenverlust-Ursache:** `pagesList()` lieferte bei jedem Fetch-Fehler still `[]`, und `AdminPages.persist()` speicherte auf dieser leeren Basis → beim nächsten Speichern wurden gespeicherte Seiten in `pages:current` **überschrieben/gelöscht**. Fix: `pagesList` **wirft** jetzt bei Fehler; `AdminPages` nutzt den **ContentProvider (`getPages`) als einzige Quelle der Wahrheit** (kein separater, fehleranfälliger Fetch) und speichert **nie** vor `structureLoaded`. (2) **Falsches „Seite nicht gefunden":** `DynamicPage` zeigte 404, bevor `/pages` geladen war → neues Flag `structureLoaded` (im `ContentProvider`, gesetzt wenn der erste `/pages`-Abruf durch ist); solange `false` → „lädt …" statt 404. (3) **Footer zu weit oben:** `Layout` jetzt `flex flex-col` + `main flex-1`, `DynamicPage`-Section `min-h-[78vh]` → Footer sitzt unten statt unter kurzem Hero. E2E lokal verifiziert: anlegen→persistiert, 2. Seite überschreibt die 1. NICHT, Direktaufruf rendert (kein 404-Blitz), Footer bei 692/720 px. | Betreiber verlor angelegte Seiten (Datenverlust) und konnte sie nicht erreichen/bearbeiten; leere Seite wirkte kaputt | `content.tsx`, `admin.tsx`, `admin/AdminPages.tsx`, `DynamicPage.tsx`, `Layout.tsx` |
| 2026-07-18 | Runde 1: Backoffice komplett (5 Endpunkte, Dashboard/Inbox/Detail, Login-Animation, Admin aus Layout gelöst) + Audit-Fixes; Function + Frontend live | Betreiber-Backoffice als größte Funktionslücke schließen | siehe §6 |
| 2026-07-18 | Fix — **eigene Seiten bearbeiten**: In „Seiten & Menü" pro Seite ein **„Bearbeiten"-Knopf**, der client-seitig direkt in den Bearbeitungsmodus auf die Seite springt (`enterEditMode` + `navigate` — URL-Aufruf würde neu laden und den Edit-Modus verlieren). `content.reloadStructure()` synchronisiert Seiten/Zonen/Blöcke nach Admin-Änderungen sofort (kein Voll-Reload nötig, neue Seite erscheint gleich im Menü/DynamicPage). Ursache: „Seite bearbeiten" führte nur auf „/", und frisch angelegte Seiten kannte der Renderer erst nach Reload. | Betreiber konnte angelegte Seiten nicht erreichen/bearbeiten | `content.tsx`, `admin/AdminPages.tsx` |
| 2026-07-18 | Runde 6 — **Block-Palette** auf eigenen Seiten: „+ Block hinzufügen" → **Textblock / Button / Bild** (wie bei de-Vries). Typisierte Blöcke `{k, t, href?}` als validierte Struktur (`blocks:current`; `validateBlocks`: Typ-Whitelist + Key-Regex + **Button-`href` über `safeHref`**, unit-getestet); Endpunkte `GET /blocks` + `POST /admin/blocks/save`. Client: `content.tsx` blocks-State + get/add/remove/move/setBlockHref (Save integriert, ehrliche Teil-Fehler); `BlockArea` (Palette + ↑↓🗑️; Button im Editor als `<div>`, live als `<a href>`; Bild via `EditableImage`); `DynamicPage` nutzt jetzt die BlockArea. Palette + Textblock im Browser verifiziert. | Betreiber baut eigene Seiten frei aus Text/Button/Bild — genau die vermisste de-Vries-Funktion | `admin_util.ts`+Test, `index.ts`, `content.tsx`, `editor/BlockArea.tsx` (neu), `DynamicPage.tsx` |
| 2026-07-18 | Runde 5 — **Struktur: dynamische Seiten + Menüpunkte**. Endpunkte `GET /pages` + `POST /admin/pages/save` (`validatePages`: Slug-Regex `^[a-z][a-z0-9-]{1,40}$` + **Reserved-Whitelist** bestehender Routen + Deckel, unit-getestet). Client: `content.tsx` pages-State + `getPages`; `DynamicPage` (`:slug` → editierbarer Titel + Fließtext, sonst 404); `Layout` injiziert `inMenu`-Seiten in Desktop- & Mobile-Navi; `AdminPages`-Verwaltung (anlegen/löschen/ins Menü) + Dashboard-Kachel „Seiten & Menü". Für Besucher unverändert, bis eine Seite angelegt wird. | Betreiber legt eigene Seiten (Über uns/Team/Info) + Menüpunkte selbst an — voller de-Vries-Umfang | `admin_util.ts`+Test, `index.ts`, `content.tsx`, `admin.tsx`, `DynamicPage.tsx` (neu), `admin/AdminPages.tsx` (neu), `Layout.tsx`, `routes.tsx`, `AdminDashboard.tsx` |
| 2026-07-18 | Runde 4 — **Block-Zonen** (Struktur editierbar): Einträge einer Zone **hinzufügen/entfernen/sortieren**. Trennung Struktur↔Inhalt: nur die geordnete Key-Liste je Zone liegt validiert in `zones:current` (Endpunkte `GET /zones` + `POST /admin/zones/save`, `validateZones` mit Regex/Deckel, unit-getestet); Feld-Inhalt bleibt in der sanitisierten `<Editable>`-Pipeline. Client: `useZone`-Hook + `ZoneItemControls`/`ZoneAddButton`, in `content.tsx` integriert (getZone/add/remove/move, Save schreibt Struktur mit, ehrliche Teil-Fehler). Erste Zone: die Leistungs-Karten (`leistungen.services`) — inkl. „+ Leistung hinzufügen" mit Platzhalter-Karte. Add lokal im Browser verifiziert. | Betreiber kann Karten/Einträge selbst anlegen/löschen/umsortieren, nicht nur umtexten | `admin_util.ts`+Test, `.../index.ts`, `lib/content.tsx`, `editor/Zone.tsx` (neu), `LeistungenPage.tsx` |
| 2026-07-18 | Runde 3 — **Mediathek**: 2 Endpunkte `/admin/media/list` (Bucket-Dateien + `inUse` aus `site_content:current` abgeleitet) und `/admin/media/delete` (Pfad-Whitelist `^img/[\w.-]+$`, **Nutzungs-Schutz** → 409 bei Verwendung); Dashboard-Kachel „Mediathek" + `AdminMedia`-Grid (Vorschau, „in Verwendung"-Badge, Filter, Löschen nur für ungenutzte Bilder). | Bildverwaltung: Übersicht + verwaiste Bilder aufräumen ohne benutzte zu gefährden | `supabase/functions/.../index.ts`, `lib/admin.tsx`, `admin/AdminMedia.tsx` (neu), `admin/AdminDashboard.tsx`, `routes.tsx` |
| 2026-07-18 | Runde 2 — **Inhalts-Editor**-Politur (nicht Backoffice): beforeunload-Schutz + Strg+S + Dirty-Marker pro Feld + Bildgrößen-Check + ID-Tooltip-Fix (Batch 1); schwebende Format-Leiste Fett/Kursiv/Link auf Rich-Feldern (Batch 2); Onboarding-Overlay + „❓ Hilfe" + auto-ausblendende Statusmeldung (Batch 3); **echtes Client-Undo/Redo** — Schnappschuss-Stack des `pending`-Objekts, 700 ms-Debounce, Strg+Z/Umschalt+Z/Y, DOM-Reapply für contentEditable + State-Reaktivität für Bilder, Baseline-Registrierung je Feld (Batch 4). Undo/Redo im Browser verifiziert. | Editor auf de-Vries-Niveau: Schutz vor Datenverlust, angenehmere Bedienung, Formatierung, echtes Rückgängig | `src/lib/content.tsx`, `editor/Editable.tsx`, `editor/EditToolbar.tsx`, `editor/EditFormatToolbar.tsx` (neu), `editor/EditOnboarding.tsx` (neu), `app/App.tsx` |
