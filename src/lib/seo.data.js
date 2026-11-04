// SSOT der Per-Route-SEO-Meta (Title + Description). Bewusst als plain .js, damit
// SOWOHL die App (via src/lib/seo.ts) ALS AUCH das Build-Script
// scripts/prerender.mjs dieselben Werte nutzen (kein Doppel-Pflegen).
// Bei neuen Routen hier UND in public/sitemap.xml ergaenzen.

export const SEO_DEFAULT = {
  title: "Cura Doma – Ambulanter Betreuungsdienst Hameln & Paderborn",
  description:
    "Cura Doma: liebevolle ambulante Betreuung – Demenzbetreuung, Verhinderungspflege und Haushaltshilfe in Hameln, Paderborn & Umgebung. Kostenlos beraten lassen.",
};

export const SEO_BY_PATH = {
  "/": SEO_DEFAULT,
  "/leistungen": {
    title: "Leistungen – Betreuung in Hameln & Paderborn | Cura Doma",
    description:
      "Alle Betreuungsleistungen von Cura Doma in Hameln, Paderborn & Umgebung: Demenzbetreuung, Verhinderungspflege, Entlastung, Haushaltshilfe & Alltagsbegleitung.",
  },
  "/entlastung": {
    title: "Entlastungsleistungen § 45a/45b SGB XI in Hameln | Cura Doma",
    description:
      "Monatlich 131 € Entlastungsbetrag (§ 45b SGB XI): Alltagsbegleitung & Haushaltshilfe in Hameln, Paderborn & Umgebung – direkt mit der Pflegekasse abgerechnet.",
  },
  "/demenzbetreuung": {
    title: "Demenz- & Seniorenbetreuung Hameln & Paderborn | Cura Doma",
    description:
      "Einfühlsame Demenz- und Seniorenbetreuung zu Hause in Hameln, Paderborn & Umgebung – mit Empathie, Geduld und Fachkompetenz für ein würdevolles Leben daheim.",
  },
  "/haushaltsnahe-dienstleistungen": {
    title: "Haushaltsnahe Dienstleistungen Hameln & Paderborn | Cura Doma",
    description:
      "Reinigung, Wäsche, Einkaufshilfe und Mahlzeiten in Hameln, Paderborn & Umgebung – haushaltsnahe Dienstleistungen, damit Sie sich zu Hause wohlfühlen.",
  },
  "/verhinderungspflege": {
    title: "Verhinderungspflege Hameln & Paderborn | Cura Doma",
    description:
      "Verhinderungspflege in Hameln, Paderborn & Umgebung: bis zu 3.539 € pro Jahr (gemeinsam mit der Kurzzeitpflege), wenn die Pflegeperson eine Pause braucht.",
  },
  "/umwandlung-sachleistungen": {
    title: "Umwandlung von Pflegesachleistungen | Cura Doma Hameln",
    description:
      "Bis zu 40 % ungenutzter Pflegesachleistungen (ab Pflegegrad 2) in Betreuung umwandeln – mehr Alltagshilfe in Hameln, Paderborn & Umgebung mit Cura Doma.",
  },
  "/einzugsgebiet": {
    title: "Einzugsgebiet Hameln, Paderborn & Umgebung | Cura Doma",
    description:
      "Cura Doma betreut Hameln, Paderborn, Emmerthal, Hessisch Oldendorf, Aerzen, Bad Münder, Springe, Delbrück, Geseke, Salzkotten & Umgebung. Ist Ihr Ort dabei?",
  },
  "/standort-hameln": {
    title: "Ambulanter Betreuungsdienst Hameln | Cura Doma",
    description:
      "Cura Doma in Hameln: Alltagsbegleitung, Demenzbetreuung, Haushaltshilfe & Verhinderungspflege für Hameln, Emmerthal, Aerzen, Springe & Umgebung.",
  },
  "/standort-paderborn": {
    title: "Ambulanter Betreuungsdienst Paderborn | Cura Doma",
    description:
      "Cura Doma im Kreis Paderborn: Alltagsbegleitung, Demenzbetreuung & Haushaltshilfe für Paderborn, Delbrück, Geseke, Salzkotten & Umgebung.",
    // Ersetzt beim Vorab-Rendern die globalen geo.*-/ICBM-Tags aus index.html
    // (die gelten fuer Hameln). Werte = LOCATIONS.paderborn in src/lib/locations.ts.
    geo: { region: "DE-NW", placename: "Salzkotten", position: "51.70813;8.59807" },
  },
  "/kontakt": {
    title: "Kontakt – Kostenlose Beratung | Cura Doma Hameln & Paderborn",
    description:
      "Kontakt zu Cura Doma: kostenloses, unverbindliches Erstgespräch zur Betreuung in Hameln, Paderborn & Umgebung. Telefon 05151 7107093, info@curadoma.de.",
  },
  "/termin": {
    title: "Termin online vereinbaren | Cura Doma Hameln & Paderborn",
    description:
      "Kostenloses Erstgespräch oder Beratung online anfragen: Wunschtermin wählen, wir bestätigen per E-Mail. Cura Doma in Hameln, Paderborn & Umgebung.",
  },
  "/karriere": {
    title: "Karriere & Jobs in Hameln & Paderborn | Cura Doma",
    description:
      "Werden Sie Teil von Cura Doma in Hameln & Paderborn: Stellen in der ambulanten Betreuung & Alltagsbegleitung. Jetzt bewerben – wir freuen uns auf Sie.",
  },
  "/impressum": {
    title: "Impressum | Cura Doma",
    description: "Impressum und Anbieterkennzeichnung nach § 5 TMG von Cura Doma, ambulanter Betreuungsdienst in Hameln.",
  },
  "/datenschutz": {
    title: "Datenschutz | Cura Doma",
    description: "Datenschutzerklärung von Cura Doma – Informationen zur Verarbeitung personenbezogener Daten nach DSGVO.",
  },
};
