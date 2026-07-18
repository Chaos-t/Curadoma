# Admin-Panel-Ausbau auf de-Vries-Niveau — Design

- **Datum:** 2026-07-18
- **Status:** Design in Freigabe
- **Referenz:** de-Vries-Blueprint (Admin-Panel-Rezept), bestehende Editor-Spec `docs/superpowers/specs/2026-07-01-inhalts-editor-design.md`, Edge Function `supabase/functions/make-server-ec6100a6/index.ts`
- **Auftrag des Nutzers:** Den bestehenden Inhalts-Editor auf das volle de-Vries-Niveau ausbauen. Reihenfolge frei gewählt (Start: Backoffice). Vorerst **keine** neuen Business-Features, DSGVO-Härtung in einem **separaten** Durchgang.

## 1. Ziel

Aus dem heutigen reinen **Inline-Text/Bild-Editor** ein vollwertiges **Admin-Panel** machen, mit dem der (nicht-technische) Betreiber die Website und den Betrieb selbst steuert — nur mit Passwort, ohne Code, ohne GitHub:

1. **Backoffice**: eingegangene Kontaktanfragen, Bewerbungen und Terminanfragen sehen, mit Status/Notiz verwalten, archivieren, löschen, CV herunterladen, als CSV exportieren.
2. **Editor-Politur**: echtes Undo/Redo, Strg+S, Schutz vor Datenverlust, Format-Leiste, Onboarding/Hilfe.
3. **Mediathek**: Bilder verwalten, wiederverwenden, löschen (mit Nutzungs-Schutz).
4. **Block-Zonen**: Karten/FAQ/Leistungen/Listen hinzufügen/entfernen/sortieren.
5. **Struktur**: neue Seiten und Menüpunkte anlegen.

## 2. Ausgangslage (Ist-Stand, verifiziert)

- **Editor vorhanden & sicher:** 366 `<Editable>` (18 Dateien) + 14 `<EditableImage>` (7 Dateien) decken praktisch jeden Text/jedes Bild ab. Server-Absicherung solide: konstant-Zeit-Passwortvergleich (`ctEq`), Escape-First-`sanitizeRich`, `safeHref` (blockt Fremdhosts + protokoll-relative URLs), Magic-Byte-Bildprüfung, `editRateLimited` (fail-closed), Längen-/ID-Whitelists.
- **Backend = eine Edge Function** `make-server-ec6100a6` (Deno + Hono), einzige Vertrauensgrenze; `kv_store_ec6100a6` als Speicher; Service-Role nur serverseitig; Frontend nutzt nur den anon key.
- **Leads liegen bereits im KV**, sind aber nur per E-Mail sichtbar: `contact_message:<uuid>`, `job_application:<uuid>`, `appointment:<uuid>`.
- **`/admin`** = `AdminLoginPage` → prüft Passwort gegen `POST /site-content/save {action:"__check"}` → bei 200 `enterEditMode(pw)` + `navigate("/")`. Passwort bleibt **nur im Speicher** (kein sessionStorage) — nach Reload aus.
- **Termin-Buchung ist temporär deaktiviert** (`routes.tsx` und `Layout.tsx` auskommentiert); das Backend (`/appointments`, `/booked-slots`, `/appointment-action`) ist intakt.

## 3. Nicht-Ziele (YAGNI)

- **Keine** neuen Business-Features in diesem Vorhaben (Rechner, FAQ-Schema, Termin-Reaktivierung, mehrere Stellen … kommen später, separat).
- **Kein** DSGVO-/Rechts-Durchgang hier (Google-Fonts self-hosten, Consent-Gates, Lösch-Automatik, Datenschutztexte, CORS-Einschränkung) — **eigener Durchgang**. Das Lösch-**Fundament** aus Runde 1 wird aber so gebaut, dass die spätere automatische Löschfrist darauf aufsetzen kann.
- **Kein** Multi-User-/Rollen-/Konten-System, kein Supabase-Auth-Umbau, kein 2FA (Einzelbetreiber, geteiltes Passwort bleibt).
- **Kein** SSR/Prerendering-Umbau (SEO-Status bleibt unverändert).
- **Keine** Änderung an Route-Slugs, an `utils/supabase/info.tsx` oder am Figma-Make-Vertrag.

## 4. Architektur-Entscheidung: Ansatz A

**Bestehende Edge Function + SPA erweitern; das bewährte Passwort-Muster wiederverwenden.** (Verworfen: B = Supabase-Auth/RLS/Konten — zu großer Bruch; C = rohes Supabase-Dashboard — für Betreiber unbrauchbar.)

- Neue **authentifizierte** Admin-Routen in derselben Function.
- **Auth-Muster identisch zu `site-content/save`:** `ctEq(password, EDIT_PASSWORD)` + `editRateLimited(editorClientIp)` (fail-closed) + 600 ms Delay bei Fehlpasswort (`editBumpFail`) + `503` wenn `EDIT_PASSWORD` nicht gesetzt.
- Service-Role liest/schreibt KV (`kv.getByPrefix`, wie in `/booked-slots`); Passwort verlässt den Server nie.
- Frontend: `/admin` wird nach Login ein **Dashboard**; der heutige „direkt in den Edit-Modus"-Sprung wird **eine Kachel** („Seite bearbeiten") darin. Passwort bleibt weiter **nur im Speicher** (Context), Reload = Login — bewusst so (sicher).

**Sicherheitsmodell (verbindlich, gilt für alle neuen Routen):**
- Admin-Routen geben **PII zurück → niemals ohne Passwort**, niemals als öffentlicher GET.
- `type` streng aus `contact | job | appointment` → fest gemappte KV-Prefixe (keine Prefix-Injection).
- `id` per UUID-Regex geprüft, bevor ein KV-Key gebaut wird (keine Key-Traversal).
- `admin_note` serverseitig escaped + Längenlimit; `admin_status` strenges Enum.
- CSV-Export mit **Formel-Injection-Schutz** (führende `= + - @ \t` neutralisieren) + RFC-4180-Quoting.
- CORS bleibt vorerst `*` (steht auf der DSGVO/Härtungs-Liste); das Passwort-Gate schützt die Admin-Routen origin-unabhängig.

## 5. Reihenfolge (iterativ — 1 kohärente Runde, jede getestet & einzeln freigegeben/deployt)

| Runde | Inhalt | Aufwand |
|---|---|---|
| 1 | Backoffice (Dashboard + Anfragen/Bewerbungen/Termine verwalten) | groß |
| 2 | Editor-Politur (Undo/Redo, Strg+S, beforeunload, Format-Leiste, Onboarding, Toasts) | mittel |
| 3 | Mediathek (Bildverwaltung mit Nutzungs-Schutz) | mittel |
| 4 | Block-Zonen (Einträge hinzufügen/entfernen/sortieren) | groß |
| 5 | Struktur (neue Seiten + Menüpunkte via JSON + Runtime-Injektion) | groß |

Nach jeder Runde: bauen → testen (3 Ebenen, §11) → **erst nach ausdrücklicher Freigabe** committen/pushen/Function-deployen.

## 6. Runde 1 — Backoffice (Detail)

### 6.1 Datenmodell (nicht-brechend, keine Migration)

Pro Datensatz zusätzlich (werden bei erster Betreiber-Aktion gesetzt; fehlen = Defaults):

| Feld | Werte | Default wenn fehlt |
|---|---|---|
| `admin_status` | `neu` \| `in_bearbeitung` \| `erledigt` | `neu` |
| `admin_note` | String (escaped, ≤ 2000) | `""` |
| `admin_archived` | boolean | `false` |
| `admin_updated_at` | ISO-Zeitstempel | — |

`admin_status` ist **getrennt** vom bestehenden `status` (bei Terminen die Buchungs-Zustandsmaschine `pending/confirmed/declined`) — die Buchungslogik bleibt unberührt.

### 6.2 Endpunkte (neu, alle passwortgeschützt)

Alle: `EDIT_PW`-Gate + `editRateLimited` (fail-closed) + Fehlpasswort → 600 ms Delay + 401. Kein `EDIT_PW` gesetzt → 503.

- **`POST /admin/list`** `{password, type, includeArchived?}` → `{items:[…]}` (nach `created_at` desc). Voller Datensatz inkl. PII. Bewerbungen: **kein** eingebetteter CV-Link (separat via `/admin/cv-url`).
- **`POST /admin/update`** `{password, type, id, admin_status?, admin_note?, admin_archived?}` → validiert Enum/Länge/UUID, setzt `admin_updated_at`, `kv.set`.
- **`POST /admin/delete`** `{password, type, id}` → `kv.del(key)`; bei `job` zusätzlich `cv_path` aus dem privaten Bucket `bewerbungen` löschen (Storage-Aufräumung). Idempotent.
- **`POST /admin/cv-url`** `{password, id}` (nur `job`) → frischer **kurzlebiger** Signed-URL (z. B. 10 min) auf `cv_path` (statt des alten 90-Tage-Links).
- **`POST /admin/export`** `{password, type, includeArchived?}` → `text/csv` mit UTF-8-BOM (Excel), RFC-4180-Quoting, Formel-Injection-Schutz.

Optionaler Helfer **`POST /admin/counts`** `{password}` → `{contact:{neu,gesamt}, job:{…}, appointment:{…}}` für die Dashboard-Badges (oder aus `list` abgeleitet — Implementierungsdetail).

### 6.3 Frontend

- **`src/lib/admin.ts`** — Fetch-Helfer analog `content.tsx`: postet das im Speicher gehaltene Passwort an die `/admin/*`-Routen; einheitliche Fehlerbehandlung (401 → „abgelaufen, bitte neu anmelden").
- **Auth-State** im `ContentProvider` (oder schlanker eigener `AdminProvider`): `adminMode` + Passwort im Speicher. `AdminLoginPage` navigiert nach Erfolg zum Dashboard statt in den Edit-Modus. Guard: ohne Passwort → zurück zum Login.
- **`AdminDashboard.tsx`** — Hub: Kacheln Anfragen / Bewerbungen / Termine (je mit „n neu"-Badge) + „Seite bearbeiten" (startet den bestehenden Inline-Editor) + „Abmelden". Alle Admin-Seiten `noindex`.
- **`AdminInbox.tsx`** — wiederverwendbar für alle drei Typen: Filterleiste (Status, Freitext-Suche, Datum) + CSV-Export-Button; Tabelle mit Status-Badge; Zeile klicken → **Detail-Panel** (Drawer/Modal) mit allen Feldern + Aktionen: Status-Dropdown, Notiz-Feld (Speichern), Archivieren, **Löschen (Sicherheitsabfrage)**, „Per E-Mail antworten" (mailto), „Anrufen" (tel), bei Bewerbung „Lebenslauf herunterladen" (holt `cv-url`).
- **Routing:** `/admin` (Dashboard), `/admin/anfragen`, `/admin/bewerbungen`, `/admin/termine` — alle `noindex`, alle hinter dem Auth-Guard.
- **Optik:** Markenpalette (`#6FD3D1` etc.) + Plus Jakarta Sans + abgerundete Karten wie die Website, aber mit gut lesbaren Kontrasten (Betreiber-Ansicht, kein öffentliches A11y-Risiko).

### 6.4 Termine-Sonderfall

Buchung ist deaktiviert → keine neuen Termine. Vorhandene werden angezeigt und verwaltbar (Status/Notiz/Archiv/Löschen); Bestätigen/Ablehnen läuft weiter über die Mail-Links (`/appointment-action`). Eine Dashboard-Bestätigung ist bewusst nicht Teil dieser Runde.

### 6.5 Erfolgskriterien Runde 1

- Betreiber meldet sich unter `/admin` an und sieht Anzahl neuer Anfragen/Bewerbungen/Termine.
- Kann jeden Eintrag öffnen, Status/Notiz setzen, archivieren, löschen; CV einer Bewerbung herunterladen; Liste als CSV exportieren.
- Falsches Passwort → 401 + Delay + Rate-Limit; ohne PII-Leak.
- Öffentliche Nutzer erreichen keine Admin-Route und keine PII.

## 7. Runde 2 — Editor-Politur (Kurzdesign)

- **beforeunload-Schutz** bei `dirtyCount>0` (`content.tsx`), **Strg+S** = speichern, **restore()** nur bei `dirtyCount===0` bzw. mit klarer Warnung.
- **Client-Undo/Redo**: Schnappschuss-Stack im Edit-Modus (`beforeinput`-basiert, ~800 ms-Abschnitte), gemeinsames `apply()`, wiederhergestellte Elemente neu verdrahten; Strg+Z / Strg+Y.
- **Format-Leiste** am fokussierten `contentEditable` (Fett/Kursiv/Link) — Server erlaubt die Tags bereits (`sanitizeRich`/`safeHref`); nur die Bedien-UI fehlt. Editierbare Link-/CTA-Ziele via eigenes href-Feld (über `safeHref`).
- **Dirty-Marker pro Feld** (geänderte Felder sichtbar abheben), **Toasts** mit Auto-Dismiss statt einzeiliger Status.
- **Onboarding-Overlay** beim ersten Start + „❓ Hilfe" jederzeit (Hilfetext bei UI-Änderungen mitpflegen).
- Kleinfixes: `title={id}`-Leak entfernen/ersetzen, **client-seitige Bildgrößen-Prüfung** vor Upload, mehrzeilige Plain-Felder / rich-innerHTML normalisieren.

## 8. Runde 3 — Mediathek (Kurzdesign)

- **Bild-Index im KV** (`media:index` o. ä.): pro Upload Eintrag {url, path, alt, uploadedAt, usedBy:[ids]}.
- Mediathek-Ansicht im Dashboard: Grid aller Bilder, Wiederverwendung (statt Neu-Upload), Alt-Text pflegen, **Löschen nur wenn ungenutzt** (Nutzungs-Schutz), verwaiste Alt-Versionen aufräumbar.
- `EditableImage` kann aus der Mediathek wählen; Nutzungs-Referenzen werden gepflegt.

## 9. Runde 4 — Block-Zonen (Kurzdesign)

- **Datenmodell** für Zonen (z. B. `zone:leistungen.services`) als validierte JSON-Liste im KV; der bestehende `<Editable>`-Ansatz bleibt für Feldtexte.
- **Server rendert die Zone komplett aus validierten Daten neu** (Sicherheits-Eckpfeiler; kein HTML-Durchreichen), balancierter Ansatz bei verschachtelten Tags.
- Client-UI: Einträge **hinzufügen/entfernen/sortieren** (Karten/FAQ/Leistungen/Listen), designkonform gerendert (neue Kachel exakt wie die eingebauten).
- Betrifft u. a. `LeistungenPage.services`, FAQ-Blöcke, HomePage-Karten.

## 10. Runde 5 — Struktur (Kurzdesign)

- **Veröffentlichte Struktur-JSON** (Seiten + Menüpunkte); Client-**Runtime-Injektion** beim Boot (spart pro-Seite-HTML-Chirurgie).
- Neue Seite anlegen/duplizieren/löschen (reservierte Slugs schützen), neuer Menüpunkt in `topNav`/`leistungenLinks`.
- Riskanteste Runde → zuletzt; strenge Slug-/Reserved-Whitelist.

## 11. Test- & Deploy-Methodik (pro Runde, nach Blueprint)

1. **Statisch:** `node -c` / `new Function` bzw. `npm run build` fehlerfrei.
2. **Browser:** `npm run dev` → Feature real durchklicken (Dashboard-Login, Listen, Aktionen), Round-trip prüfen (speichern → neu laden → erneut).
3. **Server-E2E mit echtem Test-Passwort inkl. Angriffen:** Fehlpasswort (401+Delay+Rate-Limit), falscher `type`/`id` (400), Notiz-XSS, CSV-Formel-Injection, PII-Zugriff ohne Passwort (muss scheitern). **Testreste immer entfernen.**
4. **Abschluss-Audit** der berührten Client+Server-Teile (Datenverlust/Korrektheit · Sicherheit · UX/Touch/A11y · Edge-Cases), Funde adversarial gegengeprüft.
5. **Deploy nur nach ausdrücklicher Freigabe:** Branch statt direkt `main`; Function deployen → ggf. Cache-Buster → commit → push → Build beobachten. Der Nutzer wird vor jedem Deploy gefragt (Live-Seite curadoma.de).

## 12. Spätere Anknüpfung (nicht Teil dieses Vorhabens)

- **DSGVO-Durchgang** setzt auf `/admin/delete` auf: automatische Löschfristen (Cron/Cleanup per Prefix), kürzere CV-Signed-URL, Consent-Gates für Fonts/Maps/Reviews/IG, CORS auf curadoma.de, Datenschutztexte.
- Business-Features (Entlastungsbetrag-Rechner, FAQ-Schema, Termin-Reaktivierung, mehrere Stellen) als eigene Spec-Zyklen.
