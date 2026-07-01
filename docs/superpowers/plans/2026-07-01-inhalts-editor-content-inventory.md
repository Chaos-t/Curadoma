<!-- Auto-generiert aus dem Inventar-Workflow (wf_5ef0c34e-498) am 2026-07-01. Companion zum Umsetzungsplan. -->

# CuraDoma – Inhalts-Editor Manifest

## (a) Gesamt-Zusammenfassung

- **Seiten/Komponenten:** 16
- **Editierbare Items gesamt:** 558
- **Groesste Seiten:** HomePage (76), KarrierePage (57), LeistungenPage & DemenzPage (je 55), KontaktPage (53), UmwandlungPage (52)
- **Kleinste:** EinzugsgebietPage (3), GoogleReviews (5), InstagramFeed (7)
- **Shared-Layer (Layout.tsx, prefix `shared`):** 31 Items – Menue, Utility-Leiste, Footer.

**Wichtigste Erkenntnis – Kontaktdaten sind stark dupliziert und aktuell NICHT zentralisiert:**
| Datum | Wert | Vorkommen | Seiten |
|---|---|---|---|
| Telefon | `05151 7107093` | 8x | Kontakt, Karriere, Impressum, Datenschutz, Layout |
| E-Mail | `info@curadoma.de` | 7x | Kontakt, Impressum, Datenschutz, Layout |
| Adresse | `Süntelhang 9 … 31787 Hameln` | 7x (5 Textformate) | Einzugsgebiet-Section, Kontakt, Impressum, Datenschutz, Layout |
| Oeffnungszeiten | `Mo–Fr: 8:00 – 17:00` | 2x (mit/ohne „Uhr") | Kontakt |

Empfehlung: Diese Werte unter `shared.tel`, `shared.tel_display`, `shared.email`, `shared.address.*`, `shared.hours` buendeln; alle Seiten referenzieren die Single Source of Truth. Menue-/Footer-Labels sind bereits unter `shared.*` gefuehrt, aber innerhalb von Layout.tsx zwischen Desktop-Nav und Mobile-Nav/Footer teilweise doppelt gepflegt.

---

## shared.* (seitenuebergreifend)

Die folgende Tabelle listet (1) die bereits als `shared` gefuehrten Layout-Items und (2) empfohlene neue `shared.*`-Buendel fuer wortgleiche Kontakt-/UI-Texte, die heute pro Seite dupliziert sind.

| shared-ID (Vorschlag) | Wert (gekuerzt) | verwendet auf / dupliziert in | Hinweis |
|---|---|---|---|
| shared.tel | 05151 7107093 (tel:+4951517107093) | Kontakt (3x), Karriere (Placeholder), Impressum, Datenschutz, Layout Utility+Footer | 8 Vorkommen; tel:-Ziel separat, nur Anzeigetext buendeln |
| shared.tel_display | 05151 7107093 | siehe oben | Anzeige-Variante der Nummer (identisch zu shared.tel-Text) |
| shared.email | info@curadoma.de (mailto:) | Kontakt (2x), Impressum, Datenschutz (2x), Layout Utility+Footer | 7 Vorkommen |
| shared.address | Süntelhang 9, 31787 Hameln (+ ggf. Deutschland) | Einzugsgebiet-Section (Hameln), Kontakt (Info+LocationCard), Impressum (Anschrift+Verantwortlich), Datenschutz, Layout Footer | 7 Vorkommen in 5 Textformaten (`<br/>` vs Komma vs mit/ohne Land) → besser strukturiert (street/zip/city/country) |
| shared.hours | Mo–Fr: 8:00 – 17:00 (Uhr) | Kontakt Info + LocationCard | 2 Varianten (Suffix „Uhr" nur einmal) |
| shared.leistungenmenu.0.label | Alle Leistungen | Layout Dropdown + Mobile + Footer (.map, 3 Render-Stellen) | Menue/Footer-Label |
| shared.leistungenmenu.1.label | Entlastungsleistungen | Layout (3x) + inhaltlich home.services.0.title | Menue-Label; Wortlaut mit Home-Karte synchron halten |
| shared.leistungenmenu.2.label | Demenz- & Seniorenbetreuung | Layout (3x) + home.services.1.title | Menue-Label |
| shared.leistungenmenu.3.label | Haushaltsnahe Dienstleistungen | Layout (3x) + home.services.2.title + haushalt.hero.title | Menue-Label; 3 Seiten |
| shared.leistungenmenu.4.label | Verhinderungspflege | Layout (3x) + home.services.4.title + verhinderung.hero.title | Menue-Label; 3 Seiten |
| shared.leistungenmenu.5.label | Umwandlung in Sachleistungen | Layout (3x) + home.services.3.title | Menue-Label |
| shared.topnav.0.label | Startseite | Layout Mobile-Nav + Desktop shared.nav.startseite | doppelt in Layout |
| shared.topnav.1.label | Einzugsgebiet | Layout Mobile + Desktop nav.einzugsgebiet + einzugsgebiet.hero.badge | doppelt in Layout, 2 Seiten |
| shared.topnav.2.label | Karriere | Layout Mobile + Desktop nav.karriere + karriere.hero.badge | doppelt in Layout, 2 Seiten |
| shared.topnav.3.label | Kontakt | Layout Mobile + Desktop nav.kontakt + footer.kontakt.heading + impressum.kontakt.title | mehrdeutig (Nav/Ueberschrift/Seitentitel) |
| shared.topnav.4.label | Termin vereinbaren | Layout Mobile; Desktop zeigt abweichend nur „Termin" (shared.nav.termin) | bewusste Abweichung |
| shared.utilitybar.phone | 05151 7107093 | Utility-Leiste | = shared.tel |
| shared.utilitybar.email | info@curadoma.de | Utility-Leiste | = shared.email |
| shared.utilitybar.slogan | Wir beraten Sie gerne kostenlos | Utility-Leiste | mit Heart-Icon |
| shared.nav.startseite | Startseite | Desktop-Nav | = shared.topnav.0 |
| shared.nav.leistungen | Leistungen | Desktop-Dropdown-Trigger + Mobile-Submenu-Button | Dropdown-Trigger |
| shared.nav.einzugsgebiet | Einzugsgebiet | Desktop-Nav | = shared.topnav.1 |
| shared.nav.karriere | Karriere | Desktop-Nav | = shared.topnav.2 |
| shared.nav.kontakt | Kontakt | Desktop-Nav | = shared.topnav.3 |
| shared.nav.termin | Termin | Desktop-Nav | Mobile nutzt „Termin vereinbaren" |
| shared.nav.cta | Kostenlos beraten lassen | Desktop-Nav-CTA + Mobile-CTA + home.hero.cta-primary | CTA-Button |
| shared.footer.description | Ihr würdevoller, ambulanter Betreuungsdienst. … | Footer | Einleitung |
| shared.footer.leistungen.heading | Leistungen | Footer-Spalte | h4 |
| shared.footer.kontakt.heading | Kontakt | Footer-Spalte | h4 |
| shared.footer.phone | 05151 7107093 | Footer | = shared.tel |
| shared.footer.email | info@curadoma.de | Footer | = shared.email |
| shared.footer.address | Süntelhang 9<br />31787 Hameln | Footer | = shared.address |
| shared.footer.copyright | © 2026 Cura Doma. Alle Rechte vorbehalten. | Footer | Jahr enthalten |
| shared.footer.impressum | Impressum | Footer-Rechtslink + impressum.hero.title | 2 Seiten |
| shared.footer.datenschutz | Datenschutz | Footer-Rechtslink + datenschutz.hero.badge | 2 Seiten |
| shared.footer.credit | Designed by Axion Studio | Footer | rich: eingebetteter `<a>` |

**Weitere wortgleiche, aber inhaltlich getrennte Texte (Hinweis, KEIN Zwangs-Merge):** „Verlässliche Übernahme der Betreuung …" (home.services.5.desc == leistungen.services.4.desc); Einzugsgebiet-Intro (einzugsgebiet.hero.intro == einzugsgebiet-section.intro.text); „Als anerkannter Betreuungsdienst …" (demenz.intro.p2 ~ haushalt.intro.paragraph1); Buttons „Jetzt anfragen", „Route ansehen", „In Google Maps öffnen", „Wird gesendet…", Label „E-Mail-Adresse *", Ueberschrift „Ihre Vorteile auf einen Blick".

---

### HomePage.tsx (76 Items, prefix `home`)

| ID | kind | element | Aktueller Text (~80 Zeichen) | Notiz |
|---|---|---|---|---|
| home.hero.badge | plain | span-badge | Vertrauensvolle Betreuung im eigenen Zuhause | Eyebrow, HandHeart-Icon |
| home.hero.title | rich | h1 | Sie können nicht immer da sein. Wir können es. | `<br>` + farbiger `<span>` „Wir können es." |
| home.hero.subtitle | plain | p | Liebevolle und individuelle Unterstützung für pflegebedürftige Menschen … | Hero-Fliesstext |
| home.hero.cta-primary | plain | a-button | Kostenlos beraten lassen | → /kontakt; = shared.nav.cta |
| home.hero.cta-secondary | plain | a-button | Unsere Leistungen | → /leistungen; = leistungen.hero.badge |
| home.hero.trust.0 | plain | span | Anerkannter Anbieter | Trust-Badge |
| home.hero.trust.1 | plain | span | Abrechnung über Pflegekasse möglich | Trust-Badge |
| home.hero.trust.2 | plain | span | Persönliche Betreuung | Trust-Badge |
| home.hero.image | image | img | heroImage (Unsplash) | Bildvariable Z.125 |
| home.hero.image-alt | plain | img-alt | Betreuerin hält die Hände einer älteren Dame | alt-Text |
| home.hero.card.title | plain | div-card-title | Anerkannter Partner | Floating-Card, ShieldCheck |
| home.hero.card.desc | plain | div-card-desc | Abrechnung mit der Pflegekasse | Floating-Card |
| home.intro.title | plain | h2 | Der Mensch im Mittelpunkt | |
| home.intro.text | plain | p | Cura Doma ist Ihr anerkannter ambulanter Betreuungsdienst. … | |
| home.services.title | plain | h2 | Wie wir Sie unterstützen können | |
| home.services.intro | plain | p | Individuelle Leistungen, die sich sanft in Ihren Alltag einfügen. | |
| home.services.0.title | plain | h3 | Entlastungsleistungen | .map 6 Karten; = shared.leistungenmenu.1 |
| home.services.0.desc | plain | p | Monatlich 131 € nach § 45a SGB XI für Alltagsbegleitung … | Betrag periodisch pruefen |
| home.services.1.title | plain | h3 | Demenz- & Seniorenbetreuung | = shared.leistungenmenu.2 |
| home.services.1.desc | plain | p | Einfühlsame, strukturierte Begleitung mit Empathie, Geduld … | |
| home.services.2.title | plain | h3 | Haushaltsnahe Dienstleistungen | = shared.leistungenmenu.3 |
| home.services.2.desc | plain | p | Reinigung, Wäschepflege, Einkaufshilfe und Zubereitung … | |
| home.services.3.title | plain | h3 | Umwandlung in Sachleistungen | = shared.leistungenmenu.5 |
| home.services.3.desc | plain | p | Bis zu 40 % Ihres Pflegegeldes (ab Pflegegrad 2) … | |
| home.services.4.title | plain | h3 | Verhinderungspflege | = shared.leistungenmenu.4 |
| home.services.4.desc | plain | p | Bis zu 1.612 € pro Jahr (ab Pflegegrad 2) … | Betrag |
| home.services.5.title | plain | h3 | Entlastung für Angehörige | Text auch 3x anderswo |
| home.services.5.desc | plain | p | Verlässliche Übernahme der Betreuung, damit pflegende … | = leistungen.services.4.desc |
| home.services.card-link | plain | span-link | Mehr erfahren | wiederkehrend auf allen 6 Karten |
| home.services.all-link | plain | a-link | Alle Leistungen im Detail ansehen | → /leistungen |
| home.pflegekasse.title | plain | h2 | Ihre Ansprüche bei der Pflegekasse | |
| home.pflegekasse.text | rich | p | Wussten Sie schon? Ab Pflegegrad 1 … Entlastungsbetrag von 131 Euro … | `<strong>` |
| home.pflegekasse.box.title | plain | h4 | Weitere Möglichkeiten | Info-Icon |
| home.pflegekasse.box.0 | rich | li | Verhinderungspflege: Fällt die private Pflegeperson aus … | `<strong>`-Label |
| home.pflegekasse.box.1 | rich | li | Umwandlung von Pflegesachleistungen: Nutzen Sie ungenutzte … | `<strong>`-Label |
| home.pflegekasse.link | plain | a-link | Mehr zu Ihren Ansprüchen erfahren | → /entlastung |
| home.steps.title | plain | h3 | Einfach und unkompliziert | |
| home.steps.0.title | plain | h4 | Beratung | .map 3 Schritte; Nr. dekorativ |
| home.steps.0.desc | plain | p | Wir besprechen Ihre individuelle Situation … | |
| home.steps.1.title | plain | h4 | Antrag & Organisation | |
| home.steps.1.desc | plain | p | Wir helfen Ihnen bei der Beantragung der Leistungen … | |
| home.steps.2.title | plain | h4 | Direkte Abrechnung | |
| home.steps.2.desc | plain | p | Sobald alles bewilligt ist, rechnen wir … direkt mit Ihrer Pflegekasse ab. | |
| home.demenz.image | image | img | demenzImage (Unsplash) | Z.126 |
| home.demenz.image-alt | plain | img-alt | Betreuerin liest Seniorin vor | |
| home.demenz.badge | plain | span-badge | Spezialisierte Betreuung | = demenz.hero.badge |
| home.demenz.title | plain | h2 | Senioren- und Demenzbetreuung mit Herz | |
| home.demenz.text | plain | p | Menschen mit demenziellen Veränderungen benötigen … | |
| home.demenz.0.title | plain | li-title | Tagesstruktur & Orientierung | = demenz.ansatz.0.title; Sun-Icon |
| home.demenz.0.desc | plain | li-desc | Feste Rhythmen und vertraute Rituale geben Sicherheit im Alltag. | |
| home.demenz.1.title | plain | li-title | Biografiearbeit & Gespräche | MessageCircle-Icon |
| home.demenz.1.desc | plain | li-desc | Wir knüpfen an Lebensgeschichten an und aktivieren positive Erinnerungen. | |
| home.demenz.link | plain | a-link | Mehr zur Demenzbetreuung | → /demenzbetreuung |
| home.why.title | plain | h2 | Warum sich Familien für uns entscheiden | |
| home.why.0 | plain | h4 | Individuell | .map 4 Werte; Heart-Icon |
| home.why.1 | plain | h4 | Zuverlässig | Clock-Icon |
| home.why.2 | plain | h4 | Respektvoll | Handshake-Icon |
| home.why.3 | plain | h4 | Vertrauensvoll | ShieldCheck-Icon |
| home.partners.badge | plain | span-badge | Unsere Partner | Handshake-Icon |
| home.partners.title | plain | h2 | Gemeinsam stark für Sie | |
| home.partners.text | plain | p | Wir arbeiten vertrauensvoll mit Beratungs- und Versorgungspartnern … | |
| home.partners.eyebrow-label | plain | div-label | Partner | Label pro Karte |
| home.partners.0.name | plain | div-card-title | Verbund Pflegehilfe | .map partners; extern |
| home.partners.0.tagline | plain | div-card-desc | Bundesweite Pflegeberatung | |
| home.partners.0.logo | image | img | pflegehilfe.org apple-touch-icon | hot-linked CDN |
| home.partners.1.name | plain | div-card-title | PflegeHelfer24 | |
| home.partners.1.tagline | plain | div-card-desc | Hausnotruf & Pflegehilfen | |
| home.partners.1.logo | image | img | storyblok ph24 icon | hot-linked CDN |
| home.partners.2.name | plain | div-card-title | Pflegehilfe Hameln | |
| home.partners.2.tagline | plain | div-card-desc | Regional vor Ort | |
| home.partners.2.logo | image | img | pflegehilfe-hameln logo | hot-linked CDN |
| home.cta.title | rich | h2 | Interesse an einer kostenlosen und unverbindlichen Beratung? | `<br>` |
| home.cta.text | plain | p | Wir nehmen uns Zeit für Sie und beantworten alle Fragen … | |
| home.cta.button-anfrage | plain | a-button | Jetzt anfragen | → /kontakt; Mail-Icon; = haushalt.cta.button |
| home.cta.button-anruf | plain | a-button | Anrufen: 05151 7107093 | tel-Ziel separat; enthaelt shared.tel |
| home.cta.note | plain | div | Wir melden uns in der Regel innerhalb von 24 Stunden bei Ihnen. | Clock-Icon |

---

### LeistungenPage.tsx (55 Items, prefix `leistungen`)

| ID | kind | element | Aktueller Text (~80 Zeichen) | Notiz |
|---|---|---|---|---|
| leistungen.hero.badge | plain | div-badge | Unsere Leistungen | = home.hero.cta-secondary |
| leistungen.hero.title | rich | h1 | Individuelle Unterstützung, die Ihren Alltag bereichert | `<br>` + farbiger `<span>` |
| leistungen.hero.intro | plain | p | Unser Angebot umfasst vielfältige Leistungen … | |
| leistungen.hero.image | image | img | img1 (Unsplash) | alt „Seniorenpaar im Garten" |
| leistungen.services.0.title | plain | h3 | Alltagsbegleitung | .map 6; = kontakt.subject.option.0 |
| leistungen.services.0.desc | plain | p | Zuhören, Vorlesen, gemeinsame Spaziergänge oder Kochen. … | |
| leistungen.services.0.details.0 | plain | li | Gemeinsame Spaziergänge und Ausflüge | .map details (4) |
| leistungen.services.0.details.1 | plain | li | Vorlesen, Spielen und kreative Beschäftigung | |
| leistungen.services.0.details.2 | plain | li | Begleitung bei Hobbys und Interessen | |
| leistungen.services.0.details.3 | plain | li | Gesellschaft und Gespräche gegen Einsamkeit | |
| leistungen.services.1.title | plain | h3 | Hilfe im Haushalt | Text auch 3x anderswo |
| leistungen.services.1.desc | plain | p | Unterstützung bei der Reinigung der Wohnung, Wäschepflege … | |
| leistungen.services.1.details.0 | plain | li | Reinigung und Pflege der Wohnräume | |
| leistungen.services.1.details.1 | plain | li | Wäsche waschen, bügeln und einräumen | |
| leistungen.services.1.details.2 | plain | li | Einkaufen und Besorgungen erledigen | |
| leistungen.services.1.details.3 | plain | li | Blumen- und Pflanzenpflege | |
| leistungen.services.2.title | plain | h3 | Begleitung zu Terminen | = verhinderung.leistungen.2 |
| leistungen.services.2.desc | plain | p | Sichere Begleitung zu Ärzten, Behörden oder Veranstaltungen. … | |
| leistungen.services.2.details.0 | plain | li | Arztbesuche und Therapietermine | |
| leistungen.services.2.details.1 | plain | li | Behördengänge und Amtsbesuche | |
| leistungen.services.2.details.2 | plain | li | Begleitung zu kulturellen Veranstaltungen | |
| leistungen.services.2.details.3 | plain | li | Fahrdienst-Organisation und Begleitung | |
| leistungen.services.3.title | plain | h3 | Demenzbetreuung | = kontakt.subject.option.2 |
| leistungen.services.3.desc | plain | p | Fachkundige, einfühlsame Betreuung, die Struktur gibt … | |
| leistungen.services.3.details.0 | plain | li | Individuelle Tagesstrukturierung | |
| leistungen.services.3.details.1 | plain | li | Gedächtnistraining und Biografiearbeit | |
| leistungen.services.3.details.2 | plain | li | Validation und einfühlsame Kommunikation | |
| leistungen.services.3.details.3 | plain | li | Sichere und vertraute Umgebung schaffen | |
| leistungen.services.4.title | plain | h3 | Entlastung für Angehörige | Text 4x |
| leistungen.services.4.desc | plain | p | Verlässliche Übernahme der Betreuung, damit pflegende … | = home.services.5.desc |
| leistungen.services.4.details.0 | plain | li | Stundenweise Betreuungsübernahme | |
| leistungen.services.4.details.1 | plain | li | Regelmäßige feste Betreuungszeiten | |
| leistungen.services.4.details.2 | plain | li | Flexible Einsatzplanung nach Ihren Bedürfnissen | |
| leistungen.services.4.details.3 | plain | li | Vertrauensvolle Bezugspersonen für Ihre Liebsten | |
| leistungen.services.5.title | plain | h3 | Alltagsorganisation | |
| leistungen.services.5.desc | plain | p | Hilfe beim Schriftverkehr, Organisieren von Mahlzeitendiensten … | |
| leistungen.services.5.details.0 | plain | li | Hilfe beim Schriftverkehr und Post | |
| leistungen.services.5.details.1 | plain | li | Organisation von Mahlzeitendiensten | |
| leistungen.services.5.details.2 | plain | li | Wochenplanung und Terminkoordination | |
| leistungen.services.5.details.3 | plain | li | Unterstützung bei Anträgen und Formularen | |
| leistungen.fahrzeug.badge | plain | div-badge | Mobil für Sie unterwegs | |
| leistungen.fahrzeug.title | plain | h2 | Wir kommen zu Ihnen nach Hause | |
| leistungen.fahrzeug.intro | plain | p | Mit unserem Cura Doma Fahrzeug sind wir flexibel im gesamten … | `&nbsp;`, Gedankenstrich |
| leistungen.fahrzeug.image.0 | image | img | carSide (lokaler Import) | alt im Note |
| leistungen.fahrzeug.image.1 | image | img | carRear (lokaler Import) | alt im Note |
| leistungen.fahrzeug.image.2 | image | img | carDriver (lokaler Import) | alt im Note |
| leistungen.imagetext.image | image | img | img2 (Unsplash) | alt „Gepflegtes Zuhause" |
| leistungen.imagetext.title | plain | h2 | Für ein Zuhause, das sich wie Zuhause anfühlt | |
| leistungen.imagetext.paragraph.0 | plain | p | Wir glauben daran, dass ein gepflegtes, ordentliches Umfeld … | |
| leistungen.imagetext.paragraph.1 | plain | p | Dabei respektieren wir stets Ihre persönlichen Gewohnheiten … | |
| leistungen.imagetext.cta-primary | plain | a-button | Jetzt beraten lassen | → /kontakt |
| leistungen.imagetext.cta-secondary | plain | a-button | Kostenübernahme prüfen | → /entlastung |
| leistungen.trust.title | plain | h2 | Anerkannt und vertrauensvoll | ShieldCheck |
| leistungen.trust.paragraph | plain | p | Als zugelassener Betreuungsdienst nach § 45b SGB XI … | |
| leistungen.trust.cta | plain | a-button | Kostenloses Erstgespräch vereinbaren | → /kontakt; Phone-Icon |

---

### EntlastungPage.tsx (38 Items, prefix `entlastung`)

| ID | kind | element | Aktueller Text (~80 Zeichen) | Notiz |
|---|---|---|---|---|
| entlastung.hero.badge | plain | div-badge | § 45a / § 45b SGB XI | |
| entlastung.hero.title | rich | h1 | Entlastungsleistungen nach § 45a SGB XI | `<br>` + farbiger `<span>` |
| entlastung.hero.subtitle | plain | p | Unterstützung im Alltag für Pflegebedürftige und Angehörige … | |
| entlastung.hero.image | image | img | img (Unsplash) | Z.5 |
| entlastung.hero.image.alt | plain | img-alt | Dokumente und Unterlagen | Namensform `image.alt` |
| entlastung.intro.paragraph | plain | p | Pflegebedürftige Menschen und ihre Angehörigen stehen im Alltag … | |
| entlastung.services.title | plain | h2 | Unser Betreuungsdienst – Ihr starker Partner im Alltag | |
| entlastung.services.intro | plain | p | Als anerkannter Anbieter bieten wir Ihnen eine Vielzahl … | |
| entlastung.services.0 | plain | span-card | Unterstützung im Haushalt (Reinigung, Wäsche, Einkäufe) | .map 5 Strings |
| entlastung.services.1 | plain | span-card | Begleitung bei Arztbesuchen und Erledigungen | |
| entlastung.services.2 | plain | span-card | Alltagsbegleitung und soziale Aktivierung | |
| entlastung.services.3 | plain | span-card | Betreuung von Menschen mit Demenz | |
| entlastung.services.4 | plain | span-card | Entlastung pflegender Angehöriger | |
| entlastung.benefits.title | plain | h3 | Das bedeutet für Sie: | |
| entlastung.benefits.0 | plain | li | Unsere Leistungen können direkt über die Pflegekasse abgerechnet … | .map 5 |
| entlastung.benefits.1 | plain | li | Sie erhalten Unterstützung ohne zusätzliche Kosten (im Rahmen …) | langer Eintrag |
| entlastung.benefits.2 | plain | li | Persönliche Betreuung durch geschultes, vertrauensvolles Personal | |
| entlastung.benefits.3 | plain | li | Flexible, individuelle Gestaltung je nach Bedarf | |
| entlastung.benefits.4 | plain | li | Wir helfen Ihnen auch bei Fragen zur Abrechnung oder Antragstellung | |
| entlastung.benefits.footnote | plain | p | Nehmen Sie Kontakt mit uns auf – wir beraten Sie gerne … | kursiv |
| entlastung.faq.what.title | plain | h2 | Was sind Entlastungsleistungen? | |
| entlastung.faq.what.text | rich | p | Entlastungsleistungen sind Gelder in Höhe von monatlich 131 Euro … | `<strong>`, `&nbsp;` |
| entlastung.faq.usage.title | plain | h2 | Wofür können die Entlastungsleistungen genutzt werden? | |
| entlastung.faq.usage.intro | plain | p | Die 131 Euro monatlich können für verschiedene anerkannte Angebote … | |
| entlastung.faq.usage.item.0 | rich | li | Alltagsbegleitung: Unterstützung bei alltäglichen Aufgaben … | statisch; `<strong>` |
| entlastung.faq.usage.item.1 | rich | li | Betreuungsangebote: Aktivitäten zur Förderung sozialer Kontakte … | `<strong>` |
| entlastung.faq.usage.item.2 | rich | li | Haushaltsnahe Dienstleistungen: Hilfe im Haushalt … | `<strong>` |
| entlastung.faq.provider.title | plain | h2 | Wer kann die Leistungen erbringen? | |
| entlastung.faq.provider.text | plain | p | Die Entlastungsleistungen dürfen nur durch anerkannte Anbieter … | |
| entlastung.faq.billing.title | plain | h2 | Wie wird der Entlastungsbetrag abgerechnet? | |
| entlastung.faq.billing.text1 | plain | p | Die Abrechnung erfolgt in der Regel direkt über den anerkannten … | |
| entlastung.faq.billing.text2 | plain | p | Nicht verbrauchte Beträge können bis zum 30. Juni des Folgejahres … | |
| entlastung.offer.title | plain | h2 | Unser Angebot – individuelle Entlastung im Alltag | |
| entlastung.offer.text1 | plain | p | Ob stundenweise Unterstützung oder regelmäßige Begleitung … | |
| entlastung.offer.text2 | plain | p | Kontaktieren Sie uns direkt – wir unterstützen Sie gerne … | |
| entlastung.service.title | plain | h2 | Unser Service für Sie | |
| entlastung.service.text | plain | p | Wir sind ein nach § 45b SGB XI anerkannter Anbieter … | |
| entlastung.cta.button | plain | a-button | Jetzt kostenlos beraten lassen | → /kontakt; Phone-Icon |

---

### DemenzPage.tsx (55 Items, prefix `demenz`)

| ID | kind | element | Aktueller Text (~80 Zeichen) | Notiz |
|---|---|---|---|---|
| demenz.hero.badge | plain | div-badge | Spezialisierte Betreuung | = home.demenz.badge |
| demenz.hero.title | rich | h1 | Senioren- und Demenzbetreuung mit Herz und Verstand | `<br>` + farbiger `<span>` |
| demenz.hero.subtitle | plain | p | Demenz verändert das Leben – für Betroffene und ihre Angehörigen. … | |
| demenz.hero.image | image | img | img1 (Unsplash) | Z.8 |
| demenz.hero.image.alt | plain | img-alt | Betreuerin mit Seniorin | |
| demenz.intro.title | plain | h2 | Demenz und Seniorenbetreuung – Mit Herz und Kompetenz an Ihrer Seite | |
| demenz.intro.p1 | plain | p | Mit zunehmendem Alter stehen viele Menschen vor besonderen … | |
| demenz.intro.p2 | plain | p | Als anerkannter Betreuungsdienst haben wir es uns zur Aufgabe … | ~ haushalt.intro.paragraph1 |
| demenz.leistungen.title | plain | h2 | Unsere Leistungen im Überblick | |
| demenz.leistungen.0.title | plain | li-title | Individuelle Alltagsbegleitung | .map 4 |
| demenz.leistungen.0.desc | plain | li-desc | Unterstützung bei täglichen Aufgaben wie Kochen, Einkaufen … | |
| demenz.leistungen.1.title | plain | li-title | Betreuung bei Demenz | |
| demenz.leistungen.1.desc | plain | li-desc | Unsere Betreuungskräfte sorgen für eine einfühlsame … | |
| demenz.leistungen.2.title | plain | li-title | Entlastung für Angehörige | Text 4x |
| demenz.leistungen.2.desc | plain | li-desc | Wir schaffen Freiräume für pflegende Angehörige … | |
| demenz.leistungen.3.title | plain | li-title | Förderung sozialer Kontakte | |
| demenz.leistungen.3.desc | plain | li-desc | Durch gemeinsame Aktivitäten und Gespräche helfen wir … | |
| demenz.ansatz.title | plain | h2 | Unser Ansatz in der Demenzbetreuung | |
| demenz.ansatz.intro | plain | p | Jeder Mensch mit Demenz hat eine einzigartige Geschichte. … | |
| demenz.ansatz.0.title | plain | h3-card | Tagesstruktur & Orientierung | .map 6; = home.demenz.0.title |
| demenz.ansatz.0.desc | plain | p-card | Feste Rhythmen und vertraute Rituale geben Sicherheit. … | |
| demenz.ansatz.1.title | plain | h3-card | Biografiearbeit | |
| demenz.ansatz.1.desc | plain | p-card | Wir knüpfen an Lebensgeschichten an, aktivieren positive … | |
| demenz.ansatz.2.title | plain | h3-card | Gedächtnistraining | |
| demenz.ansatz.2.desc | plain | p-card | Spielerische Übungen, die kognitiv fordern, ohne zu überfordern. … | |
| demenz.ansatz.3.title | plain | h3-card | Validation | |
| demenz.ansatz.3.desc | plain | p-card | Wir begegnen jedem Gefühl mit Akzeptanz und Wertschätzung. … | |
| demenz.ansatz.4.title | plain | h3-card | Emotionale Begleitung | |
| demenz.ansatz.4.desc | plain | p-card | Bei Ängsten, Unruhe oder Verwirrtheit sind wir da … | |
| demenz.ansatz.5.title | plain | h3-card | Sicherheit im Alltag | |
| demenz.ansatz.5.desc | plain | p-card | Wir achten auf potenzielle Gefahren und helfen, das Zuhause … | |
| demenz.angehoerige.title | plain | h2 | Unterstützung auch für Angehörige | |
| demenz.angehoerige.intro | plain | p | Die Pflege eines Menschen mit Demenz ist eine große Herausforderung. … | |
| demenz.angehoerige.0.title | plain | li-title | Entlastungsstunden | .map 4 |
| demenz.angehoerige.0.desc | plain | li-desc | Verlässliche Betreuungszeiten, in denen Sie neue Kraft schöpfen … | |
| demenz.angehoerige.1.title | plain | li-title | Beratung & Schulung | |
| demenz.angehoerige.1.desc | plain | li-desc | Wir erklären Ihnen den Umgang mit typischen Verhaltensweisen … | |
| demenz.angehoerige.2.title | plain | li-title | Emotionaler Beistand | |
| demenz.angehoerige.2.desc | plain | li-desc | Manchmal braucht man jemanden, der zuhört und versteht. … | |
| demenz.angehoerige.3.title | plain | li-title | Flexible Betreuungszeiten | |
| demenz.angehoerige.3.desc | plain | li-desc | Ob regelmäßig oder bei akutem Bedarf – wir passen uns … | |
| demenz.angehoerige.image | image | img | img2 (Unsplash) | Z.9 |
| demenz.angehoerige.image.alt | plain | img-alt | Demenzbetreuung | = kontakt.subject.option.2 (Text) |
| demenz.qualifikation.title | plain | h2 | Fachlich geschult, menschlich überzeugt | Brain-Icon |
| demenz.qualifikation.intro | plain | p | Unsere Betreuungskräfte sind speziell für die Arbeit … | |
| demenz.qualifikation.0.num | plain | stat-num | 100+ | .map 3 Stats |
| demenz.qualifikation.0.label | plain | stat-label | Stunden Fachschulung pro Mitarbeiter | |
| demenz.qualifikation.1.num | plain | stat-num | 24h | |
| demenz.qualifikation.1.label | plain | stat-label | Erreichbarkeit bei Notfällen | |
| demenz.qualifikation.2.num | plain | stat-num | 100% | |
| demenz.qualifikation.2.label | plain | stat-label | Herz bei jeder Begegnung | |
| demenz.cta.title | plain | h2 | Wir sind für Sie und Ihre Liebsten da | |
| demenz.cta.text | plain | p | Lassen Sie uns gemeinsam einen Weg finden, der Geborgenheit … | |
| demenz.cta.button-primary | plain | a-button | Kostenloses Beratungsgespräch | → /kontakt; Phone-Icon |
| demenz.cta.button-secondary | plain | a-button | Alle Leistungen ansehen | → /leistungen |

---

### HaushaltPage.tsx (23 Items, prefix `haushalt`)

| ID | kind | element | Aktueller Text (~80 Zeichen) | Notiz |
|---|---|---|---|---|
| haushalt.hero.badge | plain | div-badge | § 45a SGB XI | |
| haushalt.hero.title | rich | h1 | Haushaltsnahe Dienstleistungen | farbiger `<span>` um „Dienstleistungen" |
| haushalt.hero.subtitle | plain | p | Unterstützung im Alltag nach § 45a SGB XI – zuverlässig, individuell … | |
| haushalt.intro.paragraph0 | plain | p | Der Alltag kann im Alter oder bei gesundheitlichen Einschränkungen … | |
| haushalt.intro.paragraph1 | plain | p | Als anerkannter Betreuungsdienst unterstützen wir Sie oder Ihre … | ~ demenz.intro.p2 |
| haushalt.services.heading | plain | h2 | Unsere haushaltsnahen Dienstleistungen im Überblick | |
| haushalt.services.0.title | plain | h3-card-title | Unterstützung bei der Reinigung der Wohnung | Array `leistungen`, .map 4 |
| haushalt.services.0.desc | plain | p-card-desc | Staubsaugen, Wischen, Bad- und Küchenreinigung. | |
| haushalt.services.1.title | plain | h3-card-title | Wäschepflege | |
| haushalt.services.1.desc | plain | p-card-desc | Waschen, Trocknen, Bügeln und Zusammenlegen, Betten ab- und beziehen. | |
| haushalt.services.2.title | plain | h3-card-title | Einkaufshilfe | |
| haushalt.services.2.desc | plain | p-card-desc | Begleitung zum Supermarkt oder komplette Erledigung des Einkaufs … | |
| haushalt.services.3.title | plain | h3-card-title | Zubereitung kleiner Mahlzeiten | |
| haushalt.services.3.desc | plain | p-card-desc | Unterstützung beim Kochen oder Bereitstellung einfacher Speisen. | |
| haushalt.vorteile.heading | plain | h2 | Ihre Vorteile auf einen Blick | = umwandlung.vorteile.title |
| haushalt.vorteile.0 | plain | li | Entlastung für Pflegebedürftige und Angehörige | Array `vorteile`, .map 5 |
| haushalt.vorteile.1 | plain | li | Mehr Zeit für das Wesentliche im Leben | |
| haushalt.vorteile.2 | plain | li | Vertrauensvolle, geschulte Mitarbeitende | |
| haushalt.vorteile.3 | plain | li | Unterstützung im gewohnten Umfeld | |
| haushalt.vorteile.4 | plain | li | Anerkannt nach § 45a SGB XI vom Landesamt für Soziales | |
| haushalt.cta.heading | plain | h2 | Lassen Sie sich kostenlos beraten | |
| haushalt.cta.text | plain | p | Wir zeigen Ihnen, wie Sie unsere haushaltsnahen Dienstleistungen … | |
| haushalt.cta.button | plain | a-button | Jetzt anfragen | → /kontakt; = home.cta.button-anfrage |

---

### VerhinderungspflegePage.tsx (27 Items, prefix `verhinderung`)

| ID | kind | element | Aktueller Text (~80 Zeichen) | Notiz |
|---|---|---|---|---|
| verhinderung.hero.badge | plain | div-badge | § 39 SGB XI | |
| verhinderung.hero.title | plain | h1 > span | Verhinderungspflege | Text in farbigem span; = shared.leistungenmenu.4 |
| verhinderung.hero.subtitle | plain | p | So können Sie es über uns nutzen – wenn pflegende Angehörige … | |
| verhinderung.intro.paragraph | plain | p | Wenn pflegende Angehörige einmal eine Pause brauchen – … | |
| verhinderung.intro.heading | plain | h2 | Was ist Verhinderungspflege? | |
| verhinderung.intro.definition | plain | p | Die Verhinderungspflege ist eine Leistung der Pflegeversicherung … | |
| verhinderung.voraussetzungen.title | plain | h3 | Voraussetzungen | linke Karte |
| verhinderung.voraussetzungen.0 | plain | li | Der oder die Pflegebedürftige hat Pflegegrad 2 oder höher. | .map 3 |
| verhinderung.voraussetzungen.1 | plain | li | Die reguläre Pflegeperson hat den Pflegebedürftigen bereits … | |
| verhinderung.voraussetzungen.2 | plain | li | Die Pflegeperson ist vorübergehend verhindert (z. B. durch …) | |
| verhinderung.leistungen.title | plain | h3 | Welche Leistungen übernehmen wir für Sie? | rechte Karte |
| verhinderung.leistungen.0 | plain | li | Alltagsbegleitung und Betreuung | .map 5 |
| verhinderung.leistungen.1 | plain | li | Hilfe im Haushalt | Text 4x |
| verhinderung.leistungen.2 | plain | li | Begleitung zu Terminen | = leistungen.services.2.title |
| verhinderung.leistungen.3 | plain | li | Aktivierende Gespräche und Beschäftigung | |
| verhinderung.leistungen.4 | plain | li | Unterstützung bei der Organisation des Alltags | |
| verhinderung.leistungen.footnote | plain | p | Wir betreuen Ihre Angehörigen zuverlässig, empathisch … | |
| verhinderung.pflegekasse.heading | plain | h2 | Wie viel übernimmt die Pflegekasse? | |
| verhinderung.pflegekasse.0.value | plain | div-value | 1.612 € | .map 3; Betrag |
| verhinderung.pflegekasse.0.desc | plain | p-desc | pro Kalenderjahr für Verhinderungspflege | |
| verhinderung.pflegekasse.1.value | plain | div-value | + 806 € | Betrag |
| verhinderung.pflegekasse.1.desc | plain | p-desc | zusätzlich aus nicht genutzter Kurzzeitpflege (gesamt bis zu 2.418 …) | |
| verhinderung.pflegekasse.2.value | plain | div-value | 42 Tage | |
| verhinderung.pflegekasse.2.desc | plain | p-desc | Nutzung pro Jahr möglich | |
| verhinderung.abrechnung.heading | plain | h2 | Wie funktioniert die Abrechnung mit der Pflegekasse? | |
| verhinderung.abrechnung.paragraph | plain | p | Damit Sie sich um möglichst wenig kümmern müssen … | |
| verhinderung.cta.button | plain | a-button | Beratung vereinbaren | → /kontakt |

---

### UmwandlungPage.tsx (52 Items, prefix `umwandlung`)

| ID | kind | element | Aktueller Text (~80 Zeichen) | Notiz |
|---|---|---|---|---|
| umwandlung.hero.badge | plain | div-badge | Pflegekasse | |
| umwandlung.hero.title | rich | h1 | Umwandlung von Geldleistungen in Sachleistungen | `<br>` + farbiger `<span>` |
| umwandlung.hero.subtitle | plain | p | Mehr praktische Hilfe im Alltag – kombinieren Sie finanzielle … | |
| umwandlung.intro.paragraph | plain | p | Wer Pflegegrad 2 hat und zu Hause von Angehörigen gepflegt wird … | |
| umwandlung.intro.heading | plain | h2 | Was bedeutet das für Sie? | |
| umwandlung.intro.paragraph2 | plain | p | Statt das Pflegegeld vollständig selbst zu verwenden … | |
| umwandlung.vorteile.title | plain | h3 | Ihre Vorteile auf einen Blick | = haushalt.vorteile.heading |
| umwandlung.vorteile.0 | plain | li | Sie behalten einen Teil Ihres Pflegegeldes und nutzen … | .map 4 |
| umwandlung.vorteile.1 | plain | li | Die Leistungen werden direkt mit der Pflegekasse abgerechnet … | |
| umwandlung.vorteile.2 | plain | li | Sie erhalten qualifizierte Unterstützung im Haushalt … | |
| umwandlung.vorteile.3 | plain | li | Angehörige werden entlastet – Sie gewinnen mehr Zeit … | |
| umwandlung.angebot.title | plain | h3 | Was wir Ihnen bieten können | |
| umwandlung.angebot.0 | plain | li | Unterstützung bei Hausarbeit und Einkäufen | .map 5 |
| umwandlung.angebot.1 | plain | li | Begleitung zu Terminen oder Spaziergängen | |
| umwandlung.angebot.2 | plain | li | Entlastung und Betreuung bei Demenz | |
| umwandlung.angebot.3 | plain | li | Individuelle Betreuung im gewohnten Umfeld | |
| umwandlung.angebot.4 | plain | li | Verlässliche Hilfe – regelmäßig oder flexibel | |
| umwandlung.funktion.heading | plain | h2 | Wie funktioniert die Umwandlung? | Repeat-Icon |
| umwandlung.funktion.paragraph | plain | p | Die Pflegekasse erlaubt es, bis zu 40 % des Pflegegeldes … | |
| umwandlung.funktion.fazit | rich | p | Fazit: Sie kombinieren finanzielle Unterstützung mit konkreter … | `<strong>` |
| umwandlung.tabelle.heading | rich | h2 | Beispiele: Pflegegeld & Umwandlung in Sachleistungen | `&amp;` |
| umwandlung.tabelle.intro | rich | p | Übersicht der maximalen Umwandlung von 40 % des Pflegegeldes. | `&nbsp;` |
| umwandlung.tabelle.head.grad | plain | th | Pflegegrad | |
| umwandlung.tabelle.head.geld | plain | th | Pflegegeld pro Monat | |
| umwandlung.tabelle.head.umw | plain | th | Max. Umwandlungsbetrag (40 %) | |
| umwandlung.tabelle.head.rest | plain | th | Verbleibendes Pflegegeld | |
| umwandlung.tabelle.head.services | plain | th | Mögliche Sachleistungen | |
| umwandlung.tabelle.rows.0.grad | plain | td | Pflegegrad 2 | tableRows[0] |
| umwandlung.tabelle.rows.0.geld | plain | td | 316 € | Betrag, periodisch pruefen |
| umwandlung.tabelle.rows.0.umw | plain | td | 126,40 € | Betrag |
| umwandlung.tabelle.rows.0.rest | plain | td | 189,60 € | Betrag |
| umwandlung.tabelle.rows.0.services | plain | td | z. B. Haushaltshilfe, Begleitung, Betreuung | |
| umwandlung.tabelle.rows.1.grad | plain | td | Pflegegrad 3 | |
| umwandlung.tabelle.rows.1.geld | plain | td | 545 € | Betrag |
| umwandlung.tabelle.rows.1.umw | plain | td | 218 € | Betrag |
| umwandlung.tabelle.rows.1.rest | plain | td | 327 € | Betrag |
| umwandlung.tabelle.rows.1.services | plain | td | z. B. Demenzbetreuung, Alltagshilfe | |
| umwandlung.tabelle.rows.2.grad | plain | td | Pflegegrad 4 | |
| umwandlung.tabelle.rows.2.geld | plain | td | 728 € | Betrag |
| umwandlung.tabelle.rows.2.umw | plain | td | 291,20 € | Betrag |
| umwandlung.tabelle.rows.2.rest | plain | td | 436,80 € | Betrag |
| umwandlung.tabelle.rows.2.services | plain | td | z. B. stundenweise Betreuung zur Entlastung | |
| umwandlung.tabelle.rows.3.grad | plain | td | Pflegegrad 5 | |
| umwandlung.tabelle.rows.3.geld | plain | td | 901 € | Betrag |
| umwandlung.tabelle.rows.3.umw | plain | td | 360,40 € | Betrag |
| umwandlung.tabelle.rows.3.rest | plain | td | 540,60 € | Betrag |
| umwandlung.tabelle.rows.3.services | plain | td | z. B. umfassende Unterstützung im Alltag | |
| umwandlung.tabelle.mobile.label.geld | plain | dt | Pflegegeld / Monat | Mobile-Label = head.geld |
| umwandlung.tabelle.mobile.label.umw | plain | dt | Max. Umwandlung (40 %) | Mobile-Label = head.umw |
| umwandlung.tabelle.mobile.label.rest | plain | dt | Verbleibendes Pflegegeld | Mobile-Label = head.rest |
| umwandlung.tabelle.mobile.label.services | plain | dt | Mögliche Sachleistungen | Mobile-Label = head.services |
| umwandlung.cta.button | plain | a-button | Persönlich beraten lassen | → /kontakt; Phone-Icon |

---

### EinzugsgebietPage.tsx (3 Items, prefix `einzugsgebiet`)

| ID | kind | element | Aktueller Text (~80 Zeichen) | Notiz |
|---|---|---|---|---|
| einzugsgebiet.hero.badge | plain | div-badge | Einzugsgebiet | = shared.topnav.1 |
| einzugsgebiet.hero.title | rich | h1 | Wo wir für Sie da sind | farbiger `<span>` „für Sie da sind" |
| einzugsgebiet.hero.intro | plain | p | Unser Betreuungsdienst ist im Raum Springe, Hameln, Paderborn … | = einzugsgebiet-section.intro.text |

---

### EinzugsgebietSection.tsx (18 Items, prefix `einzugsgebiet-section`)

| ID | kind | element | Aktueller Text (~80 Zeichen) | Notiz |
|---|---|---|---|---|
| einzugsgebiet-section.map-placeholder.title | plain | p | Karte ausgeblendet | Consent-Platzhalter |
| einzugsgebiet-section.map-placeholder.desc | plain | p | Beim Laden der Google-Maps-Karte werden Daten an Google übertragen. … | |
| einzugsgebiet-section.map-placeholder.button | plain | button | Karte zulassen | |
| einzugsgebiet-section.intro.heading | plain | h2 | Unser Einzugsgebiet | nur bei Prop heading=true |
| einzugsgebiet-section.intro.text | rich | p | Unser Betreuungsdienst ist im Raum Springe, Hameln, Paderborn … | `<strong>`; = einzugsgebiet.hero.intro |
| einzugsgebiet-section.hameln.badge | plain | span-badge | Aktiv | Clock-Icon |
| einzugsgebiet-section.hameln.title | plain | h3 | Standort Hameln | |
| einzugsgebiet-section.hameln.address | rich | p | Süntelhang 9 / 31787 Hameln | `<br />`; = shared.footer.address |
| einzugsgebiet-section.hameln.route-button | plain | a-button | Route ansehen | = kontakt.locationcard.button.route |
| einzugsgebiet-section.hameln.maps-button | plain | a-button | In Google Maps öffnen | = kontakt.locationcard.button.maps |
| einzugsgebiet-section.paderborn.map-title | plain | div | Paderborn | Platzhalterbereich |
| einzugsgebiet-section.paderborn.map-note | plain | div | Karte folgt – Adresse wird in Kürze ergänzt. | |
| einzugsgebiet-section.paderborn.badge | plain | span-badge | Bald verfügbar | Clock-Icon |
| einzugsgebiet-section.paderborn.title | plain | h3 | Standort Paderborn | |
| einzugsgebiet-section.paderborn.address | rich | p | Adresse folgt / 33098 Paderborn (Region) | `<br />`; Platzhalter |
| einzugsgebiet-section.paderborn.route-button | plain | button | Route folgt | disabled |
| einzugsgebiet-section.paderborn.contact-button | plain | a-button | Anfrage senden | → /kontakt |
| einzugsgebiet-section.cta.text | rich | p | Ihr Ort ist nicht dabei? Fragen Sie uns gerne – wir prüfen … | 3 JSX-Teile (before/link/after) |

---

### KontaktPage.tsx (53 Items, prefix `kontakt`)

| ID | kind | element | Aktueller Text (~80 Zeichen) | Notiz |
|---|---|---|---|---|
| kontakt.hero.badge | plain | div-badge | Kontakt aufnehmen | |
| kontakt.hero.title | rich | h1 | Wir sind für Sie da | farbiger `<span>` |
| kontakt.hero.subtitle | plain | p | Nehmen Sie Kontakt auf für ein kostenfreies Erstgespräch. … | |
| kontakt.form.heading | plain | h2 | Schreiben Sie uns | |
| kontakt.form.success.title | plain | h3 | Vielen Dank für Ihre Anfrage. | submitted=true |
| kontakt.form.success.text | plain | p | Wir melden uns schnellstmöglich bei Ihnen. | |
| kontakt.form.label.firstname | plain | label | Vorname * | |
| kontakt.form.placeholder.firstname | plain | input-placeholder | Max | |
| kontakt.form.label.lastname | plain | label | Nachname * | |
| kontakt.form.placeholder.lastname | plain | input-placeholder | Mustermann | |
| kontakt.form.label.email | plain | label | E-Mail-Adresse * | = karriere.form.field.email.label |
| kontakt.form.placeholder.email | plain | input-placeholder | max@beispiel.de | |
| kontakt.form.label.phone | plain | label | Telefonnummer | optional |
| kontakt.form.placeholder.phone | plain | input-placeholder | 05151 7107093 | = shared.tel (Text) |
| kontakt.form.label.subject | plain | label | Betreff | |
| kontakt.form.subject.option.placeholder | plain | option | Bitte wählen... | |
| kontakt.form.subject.option.0 | plain | option | Alltagsbegleitung | = leistungen.services.0.title |
| kontakt.form.subject.option.1 | plain | option | Hilfe im Haushalt | Text 4x |
| kontakt.form.subject.option.2 | plain | option | Demenzbetreuung | Text 3x |
| kontakt.form.subject.option.3 | plain | option | Entlastung für Angehörige | Text 4x |
| kontakt.form.subject.option.4 | plain | option | Beratung zu Pflegekasse | |
| kontakt.form.subject.option.5 | plain | option | Sonstiges | |
| kontakt.form.label.message | plain | label | Ihre Nachricht * | + Zeichenzaehler (nicht editierbar) |
| kontakt.form.placeholder.message | plain | textarea-placeholder | Beschreiben Sie kurz Ihre Situation oder Ihr Anliegen... | |
| kontakt.form.consent | rich | span | Ich habe die Datenschutzerklärung gelesen und stimme zu … | eingebetteter `<Link>` /datenschutz |
| kontakt.form.submit.default | plain | button | Nachricht senden | |
| kontakt.form.submit.loading | plain | button | Wird gesendet… | = karriere.form.submit.loading |
| kontakt.info.image | image | img | img (Unsplash) | Z.17 |
| kontakt.info.image.alt | plain | img-alt | Beratungsgespräch | |
| kontakt.info.heading | plain | h3 | Direkt erreichen | |
| kontakt.info.phone.value | plain | div-value | 05151 7107093 | Konstante PHONE; = shared.tel |
| kontakt.info.phone.desc | plain | div-desc | Rufen Sie uns direkt an | |
| kontakt.info.email.value | plain | div-value | info@curadoma.de | = shared.email |
| kontakt.info.email.desc | plain | div-desc | Schreiben Sie uns jederzeit | |
| kontakt.info.address.value | plain | div-value | Süntelhang 9, 31787 Hameln | Konstante ADDRESS; = shared.address |
| kontakt.info.address.desc | plain | div-desc | Einsatzgebiet: Hameln, Springe & Umgebung | |
| kontakt.info.hours.value | plain | div-value | Mo–Fr: 8:00 – 17:00 Uhr | = shared.hours (mit „Uhr") |
| kontakt.info.hours.desc | plain | div-desc | Antwort innerhalb von 24 Stunden | |
| kontakt.map.heading | plain | h2 | Hier finden Sie uns | |
| kontakt.map.subtitle | plain | p | Besuchen Sie uns in Hameln oder kontaktieren Sie uns … | |
| kontakt.locationcard.heading | plain | h3 | Kontakt & Standort | |
| kontakt.locationcard.address.line1 | plain | div-value | Süntelhang 9 | = shared.address (Strasse) |
| kontakt.locationcard.address.line2 | plain | div-desc | 31787 Hameln, Germany | „Germany" statt „Deutschland" |
| kontakt.locationcard.phone.value | plain | div-value | 05151 7107093 | Konstante PHONE; = shared.tel |
| kontakt.locationcard.phone.desc | plain | div-desc | Direkt anrufen | |
| kontakt.locationcard.email.value | plain | div-value | info@curadoma.de | = shared.email |
| kontakt.locationcard.email.desc | plain | div-desc | E-Mail schreiben | |
| kontakt.locationcard.hours.value | plain | div-value | Mo–Fr: 8:00 – 17:00 | = shared.hours (ohne „Uhr") |
| kontakt.locationcard.hours.desc | plain | div-desc | Termine nach Vereinbarung | |
| kontakt.locationcard.button.route | plain | button | Route ansehen | = einzugsgebiet-section.hameln.route-button |
| kontakt.locationcard.button.maps | plain | a-button | In Google Maps öffnen | |
| kontakt.promise.heading | plain | h2 | Unser Versprechen an Sie | |
| kontakt.promise.text | plain | p | Jede Anfrage wird persönlich und vertraulich behandelt. … | |

---

### KarrierePage.tsx (57 Items, prefix `karriere`)

| ID | kind | element | Aktueller Text (~80 Zeichen) | Notiz |
|---|---|---|---|---|
| karriere.hero.badge | plain | span-badge | Karriere | = shared.topnav.2 |
| karriere.hero.title | rich | h1 | Karriere bei Cura Doma | farbiger `<span>` „Cura Doma" |
| karriere.hero.subtitle | plain | p | Wir suchen engagierte Unterstützung für unser Team … | |
| karriere.hero.cta | plain | a-button | Jetzt bewerben | Anker #bewerben |
| karriere.jobs.title | plain | h2 | Offene Stellen | |
| karriere.jobs.intro | plain | p | Aktuell suchen wir Verstärkung für unser Team rund um Hameln. | |
| karriere.jobs.card.badge | plain | span-badge | Festanstellung · Teilzeit · Minijob · flexibel | |
| karriere.job.title | plain | h3 | Alltagsbegleiter/Haushaltshilfe (m/w/d) | const JOB_TITLE, mehrfach genutzt |
| karriere.jobs.card.desc | plain | p | Werden Sie Teil unseres Teams und unterstützen Sie … | |
| karriere.jobs.card.cta | plain | a-button | zum Stellenangebot | Toggle Detailbereich |
| karriere.job.detail.title | rich | h3 | {JOB_TITLE} — Aufgaben & Profil | nur Zusatz „ — Aufgaben & Profil" editierbar |
| karriere.job.bullets.0 | plain | li | Unterstützung im Alltag | .map jobBullets (6) |
| karriere.job.bullets.1 | plain | li | Hilfe im Haushalt | Text 4x |
| karriere.job.bullets.2 | plain | li | Begleitung bei Einkäufen und Terminen | |
| karriere.job.bullets.3 | plain | li | Freundlicher Umgang mit betreuungsbedürftigen Menschen | |
| karriere.job.bullets.4 | plain | li | Zuverlässigkeit und Verantwortungsbewusstsein | |
| karriere.job.bullets.5 | plain | li | Flexible Arbeitszeiten nach Absprache | |
| karriere.job.perk.0 | plain | span | Wertschätzendes Team | Heart-Icon |
| karriere.job.perk.1 | plain | span | Flexible Zeitmodelle | Clock-Icon |
| karriere.job.perk.2 | plain | span | Sinnvolle Tätigkeit | Users-Icon |
| karriere.job.detail.cta | plain | a-button | Jetzt bewerben | Anker #bewerben |
| karriere.form.title | plain | h2 | Ihre Bewerbung | |
| karriere.form.position.label | rich | p | Position: {JOB_TITLE} | nur „Position:" editierbar |
| karriere.form.success.title | plain | h3 | Vielen Dank! | submitted=true |
| karriere.form.success.text | plain | p | Ihre Bewerbung wurde erfolgreich übermittelt. | |
| karriere.form.field.name.label | plain | label | Vollständiger Name * | |
| karriere.form.field.name.placeholder | plain | input-placeholder | Vor- und Nachname | |
| karriere.form.field.email.label | plain | label | E-Mail-Adresse * | = kontakt.form.label.email |
| karriere.form.field.email.placeholder | plain | input-placeholder | name@beispiel.de | |
| karriere.form.field.phone.label | plain | label | Telefonnummer * | Pflichtfeld (in Kontakt optional) |
| karriere.form.field.phone.placeholder | plain | input-placeholder | 05151 7107093 | = shared.tel (Text) |
| karriere.form.field.city.label | plain | label | Wohnort | |
| karriere.form.field.city.placeholder | plain | input-placeholder | Hameln | |
| karriere.form.field.workinghours.label | plain | label | Gewünschte Arbeitszeit | |
| karriere.form.field.workinghours.option.placeholder | plain | option | Bitte wählen… | |
| karriere.form.field.workinghours.option.0 | plain | option | Vollzeit | |
| karriere.form.field.workinghours.option.1 | plain | option | Teilzeit | |
| karriere.form.field.workinghours.option.2 | plain | option | Minijob | |
| karriere.form.field.workinghours.option.3 | plain | option | flexibel | |
| karriere.form.field.earlieststart.label | plain | label | Frühestmögliches Eintrittsdatum | |
| karriere.form.field.experiencehousehold.label | plain | label | Haben Sie Erfahrung in der Haushaltsunterstützung? | auch radio-group name |
| karriere.form.field.experiencecare.label | plain | label | Haben Sie Erfahrung in der Senioren- bzw. Alltagsbetreuung? | auch radio-group name |
| karriere.form.yesno.detail.placeholder | plain | textarea-placeholder | Bitte kurz beschreiben (optional) | bei beiden YesNoBlocks |
| karriere.form.field.driverslicense.label | plain | label | Führerschein vorhanden? | |
| karriere.form.field.hascar.label | plain | label | Eigenes Auto verfügbar? | |
| karriere.form.radio.yes | plain | label | Ja | alle Ja/Nein-Felder |
| karriere.form.radio.no | plain | label | Nein | alle Ja/Nein-Felder |
| karriere.form.field.motivation.label | plain | label | Kurze Motivation | |
| karriere.form.field.motivation.placeholder | plain | textarea-placeholder | Warum möchten Sie bei Cura Doma arbeiten? | |
| karriere.form.field.cv.label | plain | label | Lebenslauf / Unterlagen (optional) | |
| karriere.form.field.cv.selected-prefix | rich | p | Ausgewählt: {form.cv_filename} | nur „Ausgewählt:" editierbar |
| karriere.form.field.cv.hint | rich | p | PDF, Word oder Bild · max. 5 MB | `&nbsp;` |
| karriere.form.consent.text | rich | span | Ich habe die Datenschutzerklärung gelesen und stimme zu … | `<Link>` /datenschutz |
| karriere.form.submit | plain | button | Bewerbung absenden | Send-Icon |
| karriere.form.submit.loading | plain | button | Wird gesendet… | = kontakt.form.submit.loading |
| karriere.form.error.generic | plain | span | Ihre Bewerbung konnte leider nicht gesendet werden. … | nur im Fehlerfall |
| karriere.form.error.ratelimit | plain | span | Bitte versuchen Sie es in ein paar Sekunden noch einmal. | Bot-Schutz |

---

### ImpressumPage.tsx (26 Items, prefix `impressum`)

| ID | kind | element | Aktueller Text (~80 Zeichen) | Notiz |
|---|---|---|---|---|
| impressum.hero.badge | plain | span-badge | Rechtliches | FileText-Icon |
| impressum.hero.title | plain | h1 | Impressum | = shared.footer.impressum |
| impressum.hero.subtitle | plain | p | Angaben gemäß § 5 TMG | |
| impressum.hero.image | image | img | heroImg (Unsplash) | alt „Büro mit Unterlagen" nur im Note |
| impressum.anbieter.title | plain | h2 | Anbieter | Block-title-Prop |
| impressum.anbieter.line1 | plain | p | Cura Doma | |
| impressum.anbieter.line2 | plain | p | Ambulanter Betreuungsdienst | |
| impressum.anschrift.title | plain | h2 | Anschrift | |
| impressum.anschrift.address | rich | span | Süntelhang 9 / 31787 Hameln / Deutschland | `<br />`; = shared.address (+ Land) |
| impressum.kontakt.title | plain | h2 | Kontakt | mehrdeutig (auch Nav/Footer) |
| impressum.kontakt.phone | plain | a | 05151 7107093 | tel-Ziel separat; = shared.tel |
| impressum.kontakt.email | plain | a | info@curadoma.de | = shared.email |
| impressum.verantwortlich.title | plain | h2 | Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV | |
| impressum.verantwortlich.line1 | plain | p | Cura Doma | |
| impressum.verantwortlich.line2 | plain | p | Süntelhang 9, 31787 Hameln | = kontakt.info.address.value |
| impressum.unternehmensangaben.title | plain | h2 | Unternehmensangaben | |
| impressum.unternehmensangaben.0.label | plain | li-label | Vertreten durch: | |
| impressum.unternehmensangaben.0.value | plain | li-value | Marilena Linde | |
| impressum.unternehmensangaben.1.label | plain | li-label | Rechtsform: | |
| impressum.unternehmensangaben.1.value | plain | li-value | Einzelunternehmen | |
| impressum.unternehmensangaben.2.label | plain | li-label | Steuernummer: | |
| impressum.unternehmensangaben.2.value | plain | li-value | 22/127/01564 | sensibel |
| impressum.unternehmensangaben.3.label | plain | li-label | Aufsichtsbehörde / zuständige Stelle: | |
| impressum.unternehmensangaben.3.value | plain | li-value | Niedersächsisches Landesamt für Soziales, Jugend und Familie (LS) … | |
| impressum.unternehmensangaben.4.label | plain | li-label | Berufsrechtliche Angaben: | |
| impressum.unternehmensangaben.4.value | plain | li-value | Anerkanntes Angebot zur Unterstützung im Alltag gemäß § 45a SGB XI … | |

---

### DatenschutzPage.tsx (32 Items, prefix `datenschutz`)

| ID | kind | element | Aktueller Text (~80 Zeichen) | Notiz |
|---|---|---|---|---|
| datenschutz.hero.badge | plain | span-badge | Datenschutz | Shield-Icon; = shared.footer.datenschutz |
| datenschutz.hero.h1 | plain | h1 | Datenschutzerklärung | |
| datenschutz.hero.intro | plain | p | Der Schutz Ihrer persönlichen Daten ist uns sehr wichtig. | |
| datenschutz.hero.image | image | img | heroImg (Unsplash) | alt „Datenschutz und Vertrauen" nur im Note |
| datenschutz.section1.title | plain | h2 | 1. Allgemeine Hinweise | Section-Prop |
| datenschutz.section1.text | plain | p | Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. … | |
| datenschutz.section2.title | plain | h2 | 2. Verantwortliche Stelle | |
| datenschutz.section2.name | plain | p | Cura Doma — Ambulanter Betreuungsdienst | |
| datenschutz.section2.address | plain | span | Süntelhang 9, 31787 Hameln, Deutschland | = shared.address (+ Land) |
| datenschutz.section2.phone | plain | a-link | 05151 7107093 | = shared.tel |
| datenschutz.section2.email | plain | a-link | info@curadoma.de | = shared.email |
| datenschutz.section3.title | plain | h2 | 3. Erhebung und Verarbeitung personenbezogener Daten | |
| datenschutz.section3.text | plain | p | Personenbezogene Daten werden nur dann verarbeitet, wenn Sie uns … | |
| datenschutz.section4.title | plain | h2 | 4. Kontaktformular / Anfrageformular | |
| datenschutz.section4.text | plain | p | Die im Kontaktformular eingegebenen Daten (Name, E-Mail-Adresse …) | |
| datenschutz.section5.title | plain | h2 | 5. Supabase als Backend-Dienst | |
| datenschutz.section5.text | plain | p | Für die technische Verarbeitung von Kontaktanfragen kann Supabase … | |
| datenschutz.section6.title | plain | h2 | 6. Google Maps | |
| datenschutz.section6.text | plain | p | Zur Darstellung von Standorten und zur Routenplanung kann Google … | |
| datenschutz.section7.title | plain | h2 | 7. Cookies und lokale Speicherung | |
| datenschutz.section7.text | plain | p | Wir verwenden ausschließlich technisch notwendige Speichermechanismen … | |
| datenschutz.section8.title | plain | h2 | 8. Ihre Rechte | |
| datenschutz.section8.rights.0 | plain | li | Recht auf Auskunft | 7 li einzeln |
| datenschutz.section8.rights.1 | plain | li | Recht auf Berichtigung | |
| datenschutz.section8.rights.2 | plain | li | Recht auf Löschung | |
| datenschutz.section8.rights.3 | plain | li | Recht auf Einschränkung der Verarbeitung | |
| datenschutz.section8.rights.4 | plain | li | Recht auf Widerspruch | |
| datenschutz.section8.rights.5 | plain | li | Recht auf Datenübertragbarkeit | |
| datenschutz.section8.rights.6 | plain | li | Beschwerderecht bei einer Aufsichtsbehörde | |
| datenschutz.section9.title | plain | h2 | 9. Kontakt für Datenschutzanfragen | |
| datenschutz.section9.email | plain | a-link | info@curadoma.de | = section2.email = shared.email |
| datenschutz.footer.hinweis | plain | p | Hinweis: Diese Datenschutzerklärung ist eine Vorlage und sollte … | kursiv; Vorlage-Warnung |

---

### GoogleReviews.tsx (5 Items, prefix `reviews`)

| ID | kind | element | Aktueller Text (~80 Zeichen) | Notiz |
|---|---|---|---|---|
| reviews.header.badge | plain | div-badge | Bewertungen auf Google | Google-G-Icon |
| reviews.header.title | plain | h2 | Stimmen unserer Kundinnen und Kunden | |
| reviews.header.count-suffix | plain | span | aus {summary.count} Bewertungen | Zahl dynamisch, nur Text editierbar |
| reviews.header.intro | plain | p | Was Angehörige und pflegebedürftige Menschen über unsere Arbeit sagen. | |
| reviews.header.cta-all-reviews | plain | a-link | Alle Bewertungen auf Google ansehen → | nur wenn placeUrl gesetzt |

---

### InstagramFeed.tsx (7 Items, prefix `instagram`)

| ID | kind | element | Aktueller Text (~80 Zeichen) | Notiz |
|---|---|---|---|---|
| instagram.header.badge | plain | div-badge | Aktuelles aus dem Alltag | Instagram-Icon |
| instagram.header.title | plain | h2 | Folgen Sie uns auf Instagram | |
| instagram.header.subtitle | plain | p | Einblicke in unsere Arbeit, Aktionen und das Leben in der Cura-Doma-Familie. | |
| instagram.card.type-video | plain | span-badge | Video | Typ-Badge (media_type VIDEO) |
| instagram.card.type-album | plain | span-badge | Album | Typ-Badge (CAROUSEL_ALBUM) |
| instagram.card.type-photo | plain | span-badge | Foto | Typ-Badge (Default IMAGE) |
| instagram.card.img-alt-fallback | plain | img-alt | Instagram-Beitrag | Fallback-Alt; Bild-src dynamisch (nicht editierbar) |

---

### Layout.tsx (31 Items, prefix `shared`)

Alle Items dieser Datei sind seitenuebergreifend (siehe Abschnitt „shared.* (seitenuebergreifend)" oben). Kurzform:

| ID | kind | element | Aktueller Text (~80 Zeichen) | Notiz |
|---|---|---|---|---|
| shared.leistungenmenu.0.label | plain | a-link | Alle Leistungen | .map an 3 Stellen (Dropdown/Mobile/Footer) |
| shared.leistungenmenu.1.label | plain | a-link | Entlastungsleistungen | |
| shared.leistungenmenu.2.label | plain | a-link | Demenz- & Seniorenbetreuung | |
| shared.leistungenmenu.3.label | plain | a-link | Haushaltsnahe Dienstleistungen | |
| shared.leistungenmenu.4.label | plain | a-link | Verhinderungspflege | |
| shared.leistungenmenu.5.label | plain | a-link | Umwandlung in Sachleistungen | |
| shared.topnav.0.label | plain | a-link | Startseite | Mobile; Desktop nutzt shared.nav.startseite |
| shared.topnav.1.label | plain | a-link | Einzugsgebiet | |
| shared.topnav.2.label | plain | a-link | Karriere | |
| shared.topnav.3.label | plain | a-link | Kontakt | |
| shared.topnav.4.label | plain | a-link | Termin vereinbaren | Desktop zeigt „Termin" |
| shared.utilitybar.phone | plain | a-tel | 05151 7107093 | = shared.footer.phone; tel-Ziel separat |
| shared.utilitybar.email | plain | a-mailto | info@curadoma.de | = shared.footer.email |
| shared.utilitybar.slogan | plain | span-badge | Wir beraten Sie gerne kostenlos | Heart-Icon |
| shared.nav.startseite | plain | a-link | Startseite | Desktop-Nav |
| shared.nav.leistungen | plain | button-dropdown | Leistungen | Dropdown-Trigger + Mobile-Submenu |
| shared.nav.einzugsgebiet | plain | a-link | Einzugsgebiet | |
| shared.nav.karriere | plain | a-link | Karriere | |
| shared.nav.kontakt | plain | a-link | Kontakt | |
| shared.nav.termin | plain | a-link | Termin | Mobile: „Termin vereinbaren" |
| shared.nav.cta | plain | a-button | Kostenlos beraten lassen | Desktop + Mobile CTA; = home.hero.cta-primary |
| shared.footer.description | plain | p | Ihr würdevoller, ambulanter Betreuungsdienst. Wir unterstützen Senioren … | |
| shared.footer.leistungen.heading | plain | h4 | Leistungen | |
| shared.footer.kontakt.heading | plain | h4 | Kontakt | |
| shared.footer.phone | plain | a-tel | 05151 7107093 | = shared.tel |
| shared.footer.email | plain | a-mailto | info@curadoma.de | = shared.email |
| shared.footer.address | rich | a-address | Süntelhang 9 / 31787 Hameln | `<br />`; = shared.address |
| shared.footer.copyright | plain | p | © 2026 Cura Doma. Alle Rechte vorbehalten. | Jahr |
| shared.footer.impressum | plain | a-link | Impressum | → /impressum |
| shared.footer.datenschutz | plain | a-link | Datenschutz | → /datenschutz |
| shared.footer.credit | rich | p | Designed by Axion Studio | eingebetteter `<a>` |


---

## Konsolidierungs-Hinweise (aus der Synthese)

1. Kontaktdaten sind massiv dupliziert und NICHT verlinkt: Telefon '05151 7107093' liegt an 8 Stellen (5 Seiten), E-Mail 'info@curadoma.de' an 7 Stellen (4 Seiten). Kandidaten fuer shared.tel / shared.email. Aendert man die Nummer in einer Seite, drohen inkonsistente Angaben. Empfehlung: eine Quelle (shared.tel / shared.email), alle Seiten referenzieren.

2. Adresse liegt in 5 verschiedenen Textformaten an 7 Stellen vor: 'Süntelhang 9<br />31787 Hameln' (Footer, Einzugsgebiet-Hameln), 'Süntelhang 9, 31787 Hameln' (Kontakt-Info, Impressum-Verantwortlich), 'Süntelhang 9<br />31787 Hameln<br />Deutschland' (Impressum-Anschrift), 'Süntelhang 9, 31787 Hameln, Deutschland' (Datenschutz), 'Süntelhang 9' + '31787 Hameln, Germany' getrennt (Kontakt-LocationCard). Semantisch identisch, aber Text/Trenner/Land unterschiedlich -> lassen sich nicht 1:1 unter shared.address buendeln; besser shared.address als strukturierte Felder (street/zip/city/country) mit seiten-spezifischem Rendering.

3. Oeffnungszeiten in 2 Varianten: 'Mo–Fr: 8:00 – 17:00 Uhr' (kontakt.info.hours.value) vs 'Mo–Fr: 8:00 – 17:00' (kontakt.locationcard.hours.value) — inhaltlich gleich, nur 'Uhr'-Suffix unterschiedlich. Kandidat fuer shared.hours; Suffix vereinheitlichen.

4. Menue-/Nav-Beschriftungen sind innerhalb von Layout.tsx doppelt gepflegt: Desktop nutzt feste Links (shared.nav.*), Mobile nutzt die Arrays (shared.topnav.*). 'Startseite' (topnav.0 + nav.startseite), 'Einzugsgebiet' (topnav.1 + nav.einzugsgebiet), 'Karriere' (topnav.2 + nav.karriere), 'Kontakt' (topnav.3 + nav.kontakt) sind je doppelt. Abweichung: Mobile 'Termin vereinbaren' (topnav.4) vs Desktop nur 'Termin' (nav.termin) — bewusster Unterschied, aber fehleranfaellig.

5. Leistungs-Titel sind zwischen Seiten-Inhalt und Menue/Footer dupliziert: 'Entlastungsleistungen', 'Demenz- & Seniorenbetreuung', 'Haushaltsnahe Dienstleistungen', 'Verhinderungspflege', 'Umwandlung in Sachleistungen' erscheinen jeweils als home.services.*.title UND als shared.leistungenmenu.*.label (Menue/Footer). Menue-Labels sind bereits korrekt unter shared.* — Home-Karten sind eigene Inhalte, aber Wortlaut sollte synchron bleiben.

6. Wortgleiche, aber KONTEXTUELL getrennte Texte (kein shared, nur Hinweis fuer QA-Konsistenz): 'Entlastung für Angehörige' (4x: home/leistungen/demenz/kontakt-option), 'Hilfe im Haushalt' (4x: leistungen/verhinderung/kontakt-option/karriere-bullet), 'Alltagsbegleitung' (2x), 'Begleitung zu Terminen' (2x), 'Demenzbetreuung' (2x inkl. kontakt-option und demenz img-alt), 'Tagesstruktur & Orientierung' (home + demenz), 'Spezialisierte Betreuung' Badge (home + demenz).

7. Zwei laengere Fliesstexte sind woertlich identisch dupliziert: (a) 'Verlässliche Übernahme der Betreuung, damit pflegende Familienmitglieder beruhigt neue Kraft schöpfen können.' in home.services.5.desc und leistungen.services.4.desc; (b) der komplette Einzugsgebiet-Intro in einzugsgebiet.hero.intro und einzugsgebiet-section.intro.text (letzterer mit <strong>). Kandidaten fuer geteilte Bausteine.

8. Button-/UI-Beschriftungen doppelt: 'Kostenlos beraten lassen' (home.hero.cta-primary + shared.nav.cta), 'Jetzt anfragen' (home + haushalt), 'Route ansehen' (einzugsgebiet-section + kontakt), 'In Google Maps öffnen' (einzugsgebiet-section + kontakt), 'Wird gesendet…' (kontakt + karriere), 'E-Mail-Adresse *' (kontakt + karriere), 'Ihre Vorteile auf einen Blick' (haushalt + umwandlung). Kandidaten fuer shared UI-Strings (z. B. shared.ui.*), sofern Aenderungen ueberall gleich sein sollen.

9. Mehrdeutige/kollidierende Element-Semantik bei gleichem Text: 'Kontakt' erscheint als Seitentitel (impressum.kontakt.title, h2), als Nav-Link (shared.topnav.3 / shared.nav.kontakt) und als Footer-Spaltenueberschrift (shared.footer.kontakt.heading, h4) — gleicher Wortlaut, voellig unterschiedliche Rollen; bei Uebersetzung/Umbenennung getrennt behandeln.

10. Grosse Rich-/Struktur-Bloecke, die beim Editieren Inline-Markup bewahren muessen: alle Hero-H1 mit <br>+farbigem <span> (home/leistungen/entlastung/demenz/haushalt/umwandlung/einzugsgebiet/kontakt/karriere), Consent-Texte mit eingebettetem <Link> (kontakt.form.consent, karriere.form.consent.text), Footer-Credit mit <a> (shared.footer.credit), sowie Texte mit gemischtem statischem Praefix + Variable ({JOB_TITLE}: karriere.job.detail.title / karriere.form.position.label; {form.cv_filename}: karriere.form.field.cv.selected-prefix; {summary.count}: reviews.header.count-suffix). Nur die statischen Teile sind editierbar.

11. Umwandlungs-Tabelle enthaelt 20 reine Betrags-/Datenzellen (umwandlung.tabelle.rows.*) plus 4 Mobile-Labels, die die Desktop-th-Werte 1:1 spiegeln (mobile.label.geld/umw/rest/services == head.geld/umw/rest/services). Redundanz Desktop-Kopf vs Mobile-Label + periodisch zu aktualisierende Geldbetraege (316/545/728/901 €). Sollte als strukturierte Daten (nicht Einzeltexte) gepflegt werden.

12. Seiten mit sehr wenig / grenzwertigem editierbaren Text: EinzugsgebietPage.tsx hat nur 3 Items (Rest kommt aus der eingebetteten EinzugsgebietSection). InstagramFeed.tsx und GoogleReviews.tsx bestehen fast nur aus dynamischen API-Daten; editierbar sind nur Header/Badges und feste UI-Labels ('Video'/'Album'/'Foto', 'Instagram-Beitrag'). Bild-/Media-Quellen dort sind NICHT editierbar.

13. Alt-Texte werden uneinheitlich erfasst: teils als eigenes Item mit kind 'plain' und element 'img-alt' (z. B. home.hero.image-alt, demenz.hero.image.alt), teils nur als Notiz am image-Item vermerkt (z. B. impressum.hero.image / datenschutz.hero.image / leistungen Fahrzeugbilder — alt nur im Note). Fuer konsistente Pflege sollten alle Alt-Texte als eigenes editierbares Feld gefuehrt werden.

14. ID-Namenskonvention leicht inkonsistent zwischen 'image-alt' (Bindestrich, HomePage) und 'image.alt' (Punkt, DemenzPage/EntlastungPage/KontaktPage). Innerhalb einer Seite keine Duplikate gefunden, aber die alt-Namensform sollte projektweit vereinheitlicht werden (Empfehlung: '<...>.image.alt').

---

## shared.* IDs (seitenuebergreifend)

- `shared.tel`
- `shared.tel_display`
- `shared.email`
- `shared.address`
- `shared.address.street`
- `shared.address.zip`
- `shared.address.city`
- `shared.address.country`
- `shared.hours`
- `shared.leistungenmenu.0.label`
- `shared.leistungenmenu.1.label`
- `shared.leistungenmenu.2.label`
- `shared.leistungenmenu.3.label`
- `shared.leistungenmenu.4.label`
- `shared.leistungenmenu.5.label`
- `shared.topnav.0.label`
- `shared.topnav.1.label`
- `shared.topnav.2.label`
- `shared.topnav.3.label`
- `shared.topnav.4.label`
- `shared.utilitybar.phone`
- `shared.utilitybar.email`
- `shared.utilitybar.slogan`
- `shared.nav.startseite`
- `shared.nav.leistungen`
- `shared.nav.einzugsgebiet`
- `shared.nav.karriere`
- `shared.nav.kontakt`
- `shared.nav.termin`
- `shared.nav.cta`
- `shared.footer.description`
- `shared.footer.leistungen.heading`
- `shared.footer.kontakt.heading`
- `shared.footer.phone`
- `shared.footer.email`
- `shared.footer.address`
- `shared.footer.copyright`
- `shared.footer.impressum`
- `shared.footer.datenschutz`
- `shared.footer.credit`
