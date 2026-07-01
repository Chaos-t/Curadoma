# Inhalts-Editor („à la de Vries", angepasst an React) — Design

- **Datum:** 2026-07-01
- **Status:** Freigegeben (Design), Umsetzung folgt
- **Referenz:** de-Vries-Editor (`C:\Users\Tolun\Rene\admin\index.html` + `supabase/functions/devries-edit`)

## 1. Ziel

Der Betreiber von Cura Doma soll **Texte und Bilder aller Hauptseiten selbst
ändern können — ohne Code, ohne GitHub-Konto, nur mit einem Passwort**. Bedien-
Erfahrung wie beim de-Vries-Projekt: `/admin` → Passwort → Website öffnet sich im
Bearbeitungsmodus → änderbare Stellen sind rot umrandet → anklicken & tippen bzw.
Bild ersetzen → „Speichern" → live.

## 2. Kern-Unterschied zu de Vries (der die Architektur bestimmt)

de Vries ist eine **statische HTML/Jekyll-Seite** auf GitHub Pages — der Editor
schreibt per GitHub-Token direkt in die `.html`-Dateien, GitHub-Pages baut neu.

Cura Doma ist eine **React/Vite-SPA** (client-gerendert, GitHub Pages + 404.html-
Fallback). Inhalte stecken in `.tsx`-Komponenten. Regex-Ersetzung im JSX-Quelltext
wäre fragil, und ein Rebuild dauert.

**Entscheidung (vom Nutzer bestätigt): Variante A — Live-Speicher über Supabase.**
Änderungen liegen im vorhandenen Supabase-KV-Store, werden zur Laufzeit über die
im Code fest verdrahteten Standardtexte gelegt und sind **sofort live** (kein
Rebuild, kein GitHub-Token). Kein neues Backend — die bestehende Edge Function
`make-server-ec6100a6` (Hono + `kv_store_ec6100a6` + KV-Rate-Limiter + Supabase-
Client) wird um Editor-Routen erweitert.

## 3. Nicht-Ziele (YAGNI)

- **Keine** Bearbeitung von Struktur/Layout, Icons, Menü-/Routen-Verdrahtung,
  Komponenten-Reihenfolge. Nur **Texte und Bilder**, genau wie de Vries.
- **Kein** Multi-User-/Rollen-System, keine Konten, kein WYSIWYG-Blockeditor.
- **Kein** GitHub-Token, keine Git-Versionierung der Inhalte (stattdessen eigene
  KV-Historie, siehe §9).
- **Keine** serverseitige Vorab-Renderung/SSG (die Seite bleibt client-gerendert
  wie heute; SEO-Status ändert sich dadurch nicht).

## 4. Architektur-Überblick

```
Öffentlicher Besucher                 Betreiber (Bearbeitungsmodus)
─────────────────────                 ─────────────────────────────
App-Start                             /admin  → Passwort
  └─ ContentProvider                    └─ POST /site-content/save (Vorabprüfung)
       GET /site-content  ◀── KV           → sessionStorage: edit=1, pw
       (Override-Map)                    → redirect "/"
  Seiten rendern:                       Provider erkennt edit=1:
   <Editable> = Override ?? Default       - <Editable> → contentEditable + rote Umrandung
   <EditableImage> = OverrideURL ?? src   - <EditableImage> → klick = Upload
                                          - EditToolbar (Speichern/Rückgängig/Verlassen)
                                        Speichern:
                                          POST /site-content/save { pw, overrides }
                                          POST /site-content/image { pw, id, dataBase64 }
```

**Leitprinzip:** Die **Standardtexte/-bilder bleiben im Code** (als `children` bzw.
`src`-Prop). Der KV-Store hält **nur die Deltas** (geänderte Felder). Folgen:
- Die Seite funktioniert vollständig, auch wenn Supabase nicht erreichbar ist
  (zeigt dann die Code-Version).
- Es muss **keine** komplette Inhalts-JSON gepflegt werden — der Code *ist* die
  Quelle der Standardwerte.
- Beim öffentlichen Laden erscheint kurz der Standard; nur **tatsächlich
  geänderte** Felder wechseln nach dem Fetch auf den neuen Wert (minimales
  Flackern nur an geänderten Stellen — akzeptiert).

## 5. Frontend-Komponenten

Neue Dateien (Vorschlag):
- `src/lib/content.tsx` — `ContentProvider`, `useContent()`, Fetch + State.
- `src/app/components/editor/Editable.tsx` — Text-Feld (`plain` + `rich`).
- `src/app/components/editor/EditableImage.tsx` — Bild-Slot.
- `src/app/components/editor/EditToolbar.tsx` — schwebende Leiste.
- `src/app/components/AdminLoginPage.tsx` — `/admin`-Route.

### 5.1 `ContentProvider` / `useContent()`
- Beim Mount **einmal** `GET /site-content` → `overrides: Record<id, string>`
  (Text-Overrides + Bild-URLs). Fehlgeschlagener Fetch = leere Map (Defaults
  greifen).
- State: `overrides`, `editMode` (aus `sessionStorage`), `pending` (im Modus
  gesammelte, noch nicht gespeicherte Änderungen), `dirty`-Zähler.
- API: `get(id) → override ?? undefined`, `setPending(id, value)`,
  `save()`, `discard()`, `exit()`, `restorePrevious()`.
- Wird in `App.tsx` um den `RouterProvider` gelegt (umschließt alle Seiten +
  das `Layout`).

### 5.2 `<Editable>`
```tsx
<Editable id="home.hero.line1">Sie können nicht immer da sein.</Editable>
<Editable id="home.intro.body" rich>… Text mit <strong>Fettung</strong> …</Editable>
```
- **Anzeige-Modus:** `override` vorhanden → rendert Override
  (plain: als Text via React-Escaping; `rich`: `dangerouslySetInnerHTML` mit dem
  **server-seitig sanitisierten** Wert). Sonst rendert es die `children` (Default).
- **Bearbeitungs-Modus:** wird zu `contentEditable`, rot gestrichelte Umrandung,
  `onInput`/`onBlur` → `setPending(id, innerText|innerHTML)`.
- Prop `as` steuert das Wrapper-Element (`span` inline, `div`/`p`/`h2` block),
  damit Layout/Flow erhalten bleibt. Default `span`.

### 5.3 `<EditableImage>`
```tsx
<EditableImage id="home.hero" src={heroImage} alt="…" className="…" />
```
- Anzeige: `overrideUrl ?? src`.
- Modus: Overlay „Bild ersetzen", Klick → Datei-Dialog → sofortiger lokaler
  Preview (Object-URL) + `POST /site-content/image` → gespeicherte URL landet in
  `pending`.

### 5.4 `EditToolbar`
- Nur im Modus sichtbar (fixed unten, mittig, `z-[100]`, `noindex`-irrelevant).
- Zeigt Anzahl offener Änderungen; Buttons **Speichern**, **Rückgängig**
  (letzter Snapshot), **Verlassen** (mit Warnung bei ungespeicherten Änderungen).
- Statusmeldungen (Speichern…, gespeichert, Fehler).

### 5.5 `/admin` (`AdminLoginPage`)
- Passwort-Eingabe → `POST /site-content/save` mit `action:"__check"` (leere
  Overrides) → 401 = falsch, 429 = gesperrt, 503 = nicht eingerichtet, sonst OK.
- Bei OK: `sessionStorage.setItem("cd_edit","1")` + `cd_edit_pw` (nur diese
  Sitzung) → `navigate("/")`.
- Route mit `noindex`-Meta; nicht in Navigation/Sitemap verlinkt.

## 6. Content-ID-Schema

`<seite>.<abschnitt>.<feld>`, Zeichen `^[a-z0-9.-]{1,64}$`. Beispiele:
- `home.hero.badge`, `home.hero.line1`, `home.hero.line2`, `home.hero.lead`
- `home.intro.title`, `home.intro.body`
- `leistungen.…`, `demenz.…`, `haushalt.…`, `verhinderung.…`, `umwandlung.…`,
  `entlastung.…`, `kontakt.…`, `karriere.…`, `einzugsgebiet.…`
- **Geteilte Felder** (überall gleich, ein ID-Namensraum `shared.*`):
  `shared.tel`, `shared.tel_display`, `shared.email`, `shared.address`,
  `shared.hours` → eine Änderung greift auf allen Seiten (weil alle dieselbe ID
  rendern).

Die vollständige ID-Inventarliste je Seite wird im Umsetzungsplan erstellt
(pro Seite ein Durchgang), nicht in dieser Spec.

## 7. Backend — neue Routen in `make-server-ec6100a6`

Alle unter dem bestehenden Präfix `/make-server-ec6100a6`.

### 7.1 `GET /site-content`
- Liest KV `site_content:current` (ein Objekt `{ [id]: string }`).
- Öffentlich lesbar (nur veröffentlichte Inhalte), kurz gecached wie die anderen
  Endpunkte. Leeres Objekt, wenn noch nie gespeichert.

### 7.2 `POST /site-content/save`
- Body: `{ password, action?, overrides?: Record<id,string>, rich?: string[] }`
  (`rich` = Liste der IDs, deren Wert als Rich-HTML zu behandeln/sanitisieren ist).
- **Passwort**: konstante-Zeit-Vergleich gegen `EDIT_PASSWORD` (Secret).
- **Rate-Limit**: vorhandenes KV-Muster — pro IP (letzter `X-Forwarded-For`) und
  global, Fehlversuche in Zeitfenster → 429. Fehlversuche werden protokolliert.
- **Validierung**: jede ID `^[a-z0-9.-]{1,64}$`; plain-Wert ≤ 3000 Zeichen;
  rich-Wert ≤ 8000; max. Anzahl IDs pro Save (z. B. 200); Gesamt-Payload-Grenze.
- **Sanitisierung** der rich-Werte: Escape-First-Allowlist (nur `strong/b/em/i/br/a`
  mit sicheren `href`), 1:1 aus de Vries übernommen. Plain-Werte werden als reiner
  Text gespeichert (Anzeige via React-Escaping).
- **Speichern**: aktuellen Stand als Snapshot in Historie schieben (§9), dann
  `overrides` in `site_content:current` mergen (`set`).
- `action:"__check"` → nur Passwort/Setup prüfen, nichts schreiben (für `/admin`).
- Antworten: `200 {ok}`, `400` (bad_field/too_long), `401` (unauthorized),
  `429` (rate_limited), `503` (not_configured, wenn `EDIT_PASSWORD` fehlt).

### 7.3 `POST /site-content/image`
- Body: `{ password, id, dataBase64, mimetype }`.
- Passwort + Rate-Limit wie oben.
- **Magic-Byte-Check** (JPG/PNG/WebP) + Größenlimit (~3 MB Base64).
- Upload in **Supabase Storage** Bucket `site-content` (öffentlich lesbar), Pfad
  `img/<id>-<zeitstempel>.<ext>`. Gibt öffentliche URL zurück; Aufrufer legt sie
  als Override der ID in `pending` und speichert sie beim nächsten `save()` mit.

### 7.4 KV-Schlüssel & Storage
- `site_content:current` — aktuelles Override-Objekt.
- `site_content:history` — Liste der letzten ~20 Snapshots `{ ts, data }`.
- Storage-Bucket `site-content` (public) — für hochgeladene Bilder.

## 8. Sicherheit (Übernahme + Anpassung von de Vries)

- Passwort **nur server-seitig** (Secret `EDIT_PASSWORD`), konstante-Zeit-Vergleich.
  Im Browser nur `sessionStorage` während der aktiven Bearbeitungs-Sitzung, **nie
  im Code/Bundle** und nicht in `localStorage` (endet mit dem Tab).
- **Rate-Limit** gegen Brute-Force (pro IP + global), vorhandenes Muster.
- **Eingabe-Validierung**: ID-Format, Feld-Längen, Payload-/Anzahl-Grenzen.
  *Unterschied zu de Vries:* keine exakte Feld-Whitelist, sondern Format+Länge —
  begründet: unbekannte IDs sind wirkungslos (nur im Code gerenderte IDs werden je
  angezeigt), und Schreiben erfordert das Passwort. Kein Datei-/Pfad-Zugriff
  möglich (nur KV + fester Storage-Bucket).
- **XSS**: plain-Felder werden als Text gerendert (React-Escaping); rich-Felder
  server-seitig sanitisiert (Escape-First-Allowlist) und nur diese sanitisierten
  Werte gespeichert; sichere `href`-Prüfung.
- **Bild-Upload**: Magic-Byte-Prüfung, Größenlimit, fester public Bucket, keine
  beliebigen Pfade.
- **Edge Function** läuft bereits mit `verify_jwt = false` (Passwort ist die
  Zugangskontrolle) — konsistent mit den Termin-Links.
- **`/admin`** und Editor-UI auf `noindex`, nicht verlinkt.
- **CORS**: bleibt wie gehabt (`*`), da nur Passwort-geschützte Schreibrouten.

## 9. Historie / Rückgängig

- Jedes erfolgreiche `save()` schiebt den *vorherigen* `site_content:current` als
  Snapshot (`{ ts, data }`) in `site_content:history` (Deckel ~20, älteste raus).
- „Rückgängig" (`restorePrevious`) im Toolbar: setzt `current` auf den letzten
  Snapshot zurück (eigener passwortgeschützter Aufruf `action:"restore"`).
- Kein vollwertiges Versions-UI in v1 (YAGNI) — nur „einen Schritt zurück".

## 10. Umfang (alle Hauptseiten)

Editierbar verdrahtet werden die sichtbaren **Texte** (Überschriften, Absätze,
Badges, Button-/Link-Beschriftungen) und die zentralen **Bilder** auf:
Start, Leistungen, Entlastung, Demenz, Haushalt, Verhinderungspflege, Umwandlung,
Einzugsgebiet, Kontakt, Karriere, Impressum, Datenschutz. Termin-Seiten
(funktionale Formulare) bleiben vorerst außen vor. Menü/Footer-Beschriftungen und
Kontaktdaten/Öffnungszeiten laufen über `shared.*`-IDs.

Struktur, Icons, Layout, Routen und Formular-Logik bleiben unverändert.

## 11. Fehlerbehandlung / Edge-Cases

- **Supabase nicht erreichbar (öffentlich):** Fetch schlägt fehl → Defaults aus
  dem Code werden angezeigt. Kein Fehler für den Besucher.
- **Supabase nicht erreichbar (Speichern):** Toolbar zeigt Fehler, `pending`
  bleibt erhalten, erneuter Versuch möglich.
- **Rich-Feld ohne Formatierung** vs. **plain-Feld mit HTML:** Der Aufrufer
  markiert rich-IDs (`rich`-Liste); alles andere ist plain und wird escaped.
- **Flackern (FOUC):** Defaults sofort, Overrides nach Fetch — nur geänderte
  Felder wechseln. Akzeptiert; keine Blank-Phase für unveränderten Inhalt.
- **Ungespeicherte Änderungen beim Verlassen/Navigieren:** Warnhinweis.
- **Bild-Upload zu groß/falscher Typ:** 400, verständliche Meldung, altes Bild
  bleibt.

## 12. Einmalige Einrichtung

- Secret setzen: `supabase secrets set EDIT_PASSWORD=<stark>` (nur server-seitig).
- Storage-Bucket `site-content` (public) anlegen (per CLI/Dashboard oder idempotent
  beim ersten Upload).
- Edge Function neu deployen (Routen). `verify_jwt=false` ist in `config.toml`
  bereits gepinnt.

## 13. Testkriterien (Definition of Done)

- `/admin` mit richtigem Passwort → Bearbeitungsmodus; falsches Passwort → Fehler;
  10 Fehlversuche → 429/Sperre.
- Text auf mehreren Seiten ändern → Speichern → nach Reload live (auch in einem
  frischen Inkognito-Fenster, ohne `sessionStorage`).
- Bild ersetzen → Upload → live nach Reload.
- Geteiltes Feld (`shared.tel`) ändern → auf allen Seiten geändert.
- Supabase-Ausfall simulieren (Fetch blocken) → Seite zeigt Code-Defaults, keine
  Fehler.
- „Rückgängig" stellt letzten Stand wieder her.
- `npm run build` grün; Verifikation im Browser (Desktop + Mobile) via Playwright.
- Rich-Feld mit `<script>` o. Ä. → wird neutralisiert (kein XSS).

