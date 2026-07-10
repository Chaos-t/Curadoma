// Per-Route SEO-Konfiguration (Title + Description). Wird vom <Seo/>-Head-Manager
// (src/app/components/Seo.tsx) beim Routenwechsel in <head> gesetzt. Lokale
// Keywords (Hameln/Paderborn + Leistung) bewusst pro Seite eingewoben.
//
// WICHTIG: Bei neuen Routen hier UND in public/sitemap.xml ergaenzen.

export type SeoMeta = { title: string; description: string };

export const SEO_DEFAULT: SeoMeta = {
  title: "Cura Doma – Ambulanter Betreuungsdienst Hameln & Paderborn",
  description:
    "Cura Doma: liebevolle ambulante Betreuung – Demenz- & Seniorenbetreuung, Verhinderungspflege und haushaltsnahe Dienstleistungen in Hameln, Paderborn und Umgebung. Kostenlos & unverbindlich beraten lassen.",
};

export const SEO_BY_PATH: Record<string, SeoMeta> = {
  "/": SEO_DEFAULT,
  "/leistungen": {
    title: "Leistungen – Ambulante Betreuung & Pflege | Cura Doma Hameln",
    description:
      "Alle Betreuungsleistungen von Cura Doma in Hameln, Paderborn & Umgebung: Demenzbetreuung, Verhinderungspflege, Entlastungsleistungen, Haushaltshilfe und Alltagsbegleitung.",
  },
  "/entlastung": {
    title: "Entlastungsleistungen § 45a/45b SGB XI in Hameln | Cura Doma",
    description:
      "Monatlich 131 € Entlastungsbetrag (§ 45a/45b SGB XI) nutzen: Alltagsbegleitung & Haushaltshilfe in Hameln, Paderborn & Umgebung – direkt mit der Pflegekasse abgerechnet.",
  },
  "/demenzbetreuung": {
    title: "Demenz- & Seniorenbetreuung Hameln & Paderborn | Cura Doma",
    description:
      "Einfühlsame Demenz- und Seniorenbetreuung zu Hause in Hameln, Paderborn & Umgebung – mit Empathie, Geduld und fachlicher Kompetenz für ein würdevolles Leben daheim.",
  },
  "/haushaltsnahe-dienstleistungen": {
    title: "Haushaltsnahe Dienstleistungen Hameln & Paderborn | Cura Doma",
    description:
      "Reinigung, Wäsche, Einkaufshilfe und Zubereitung von Mahlzeiten in Hameln, Paderborn & Umgebung – haushaltsnahe Dienstleistungen von Cura Doma, damit Sie sich zu Hause wohlfühlen.",
  },
  "/verhinderungspflege": {
    title: "Verhinderungspflege Hameln & Paderborn | Cura Doma",
    description:
      "Verhinderungspflege in Hameln, Paderborn & Umgebung: bis zu 3.539 € pro Jahr (gemeinsamer Jahresbetrag mit Kurzzeitpflege), wenn die private Pflegeperson eine Pause braucht.",
  },
  "/umwandlung-sachleistungen": {
    title: "Umwandlung von Pflegesachleistungen | Cura Doma Hameln",
    description:
      "Bis zu 40 % ungenutzter Pflegesachleistungen (ab Pflegegrad 2) in konkrete Betreuung umwandeln – mehr Alltagshilfe in Hameln, Paderborn & Umgebung mit Cura Doma.",
  },
  "/einzugsgebiet": {
    title: "Einzugsgebiet Hameln, Paderborn & Umgebung | Cura Doma",
    description:
      "Cura Doma betreut in Hameln, Paderborn, Emmerthal, Hessisch Oldendorf, Aerzen, Bad Münder, Springe, Delbrück, Geseke, Salzkotten und Umgebung. Finden Sie Ihren Ort.",
  },
  "/kontakt": {
    title: "Kontakt – Kostenlose Beratung | Cura Doma Hameln & Paderborn",
    description:
      "Kontakt zu Cura Doma: kostenloses, unverbindliches Erstgespräch zur ambulanten Betreuung in Hameln, Paderborn & Umgebung. Telefon 05151 7107093, info@curadoma.de.",
  },
  "/karriere": {
    title: "Karriere & Stellenangebote | Cura Doma Hameln",
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
