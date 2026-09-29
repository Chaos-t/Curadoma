// Single Source of Truth fuer beide Standorte.
//
// Wird genutzt von: Standortseiten, Einzugsgebiet-Karten, Routen (CityRoadmap),
// Kontaktseite, Footer und dem Structured Data. Aendert sich ein Standort,
// wird er HIER gepflegt, nicht an den einzelnen Stellen.
//
// Die ADRESSE ist zusaetzlich im Inhalts-Editor aenderbar (IDs unter
// `addressId`). Die Werte hier sind die Code-Standards; was der Betreiber im
// Editor eintraegt, gewinnt. Siehe `useAddress` in editor/Shared.tsx.
//
// Koordinaten: am 2026-09-29 per OpenStreetMap/Nominatim auf Gebaeudeebene
// ermittelt. Vorher stand im Structured Data die Hamelner INNENSTADT
// (52.1037, 9.3567) — rund 6 km neben dem tatsaechlichen Standort.

export type LocationKey = "hameln" | "paderborn";

export type Location = {
  key: LocationKey;
  /** Pfad der Standortseite */
  path: string;
  /** Anzeigename, bewusst mit der Region, nicht mit dem Ort der Adresse */
  name: string;
  /** Wie der Standort im Fliesstext heisst ("in Hameln", "im Kreis Paderborn") */
  regionPhrase: string;
  street: string;
  zip: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  /** Praefix der editierbaren Adressfelder (street/zip/city) */
  addressId: string;
  /** Angefahrene Orte in Routenreihenfolge (erste = Station). Quelle fuer
   *  die Route auf /einzugsgebiet UND die Ortsliste der Standortseite. */
  routeStops: string[];
  /** Gemeinden fuer `areaServed` im Structured Data (nur echte Gemeinden,
   *  keine Ortsteile — die stehen im sichtbaren Text). */
  areaServedCities: string[];
};

export const LOCATIONS: Record<LocationKey, Location> = {
  hameln: {
    key: "hameln",
    path: "/standort-hameln",
    name: "Standort Hameln",
    regionPhrase: "in Hameln",
    street: "Süntelhang 9",
    zip: "31787",
    city: "Hameln",
    state: "Niedersachsen",
    lat: 52.15819,
    lng: 9.38297,
    // Bestehende IDs beibehalten — sie werden schon im Footer, im Impressum
    // und im Datenschutz genutzt.
    addressId: "shared.address",
    routeStops: [
      "Hameln",
      "Afferde/Hastenbeck",
      "Tündern/Emmerthal",
      "Hessisch Oldendorf/Fischbeck",
      "Klein Berkel/Groß Berkel",
      "Aerzen",
      "Sünteltal",
      "Bad Münder/Altenhagen",
      "Springe",
      "Völksen",
      "Bennigsen",
      "Gehrden",
    ],
    areaServedCities: ["Hameln", "Emmerthal", "Hessisch Oldendorf", "Aerzen", "Bad Münder", "Springe", "Gehrden"],
  },
  paderborn: {
    key: "paderborn",
    path: "/standort-paderborn",
    // Die Adresse liegt in SALZKOTTEN (Kreis Paderborn). Der Name nennt die
    // Region, die Adresse bleibt ueberall die echte — eine vorgetaeuschte
    // Paderborner Adresse wuerde Google beim Abgleich mit dem Unternehmens-
    // profil negativ werten.
    name: "Standort Paderborn",
    regionPhrase: "im Kreis Paderborn",
    street: "Bachstraße 13",
    zip: "33154",
    city: "Salzkotten",
    state: "Nordrhein-Westfalen",
    lat: 51.70813,
    lng: 8.59807,
    addressId: "shared.address-paderborn",
    // Reihenfolge bewusst wie bisher, Paderborn vorn: Salzkotten ist nur der
    // Sitz des Bueros, nicht der Schwerpunkt der Tour (Wunsch des Betreibers).
    routeStops: ["Paderborn", "Delbrück", "Geseke", "Salzkotten", "Thüle", "Wewer", "Borchen", "Wewelsburg"],
    areaServedCities: ["Paderborn", "Salzkotten", "Delbrück", "Geseke", "Borchen"],
  },
};

export const LOCATION_LIST: Location[] = [LOCATIONS.hameln, LOCATIONS.paderborn];

/** "Süntelhang 9, 31787 Hameln" */
export function oneLineAddress(a: { street: string; zip: string; city: string }): string {
  return `${a.street}, ${a.zip} ${a.city}`;
}

/** Google-Maps-Links aus einer Adresse. Bewusst ohne API-Schluessel — die
 *  oeffentlichen Such-/Routen-URLs genuegen und laden nichts vorab. */
export function mapsLinks(address: string) {
  const q = encodeURIComponent(`${address}, Deutschland`);
  return {
    search: `https://www.google.com/maps/search/?api=1&query=${q}`,
    directions: `https://www.google.com/maps/dir/?api=1&destination=${q}`,
    embed: `https://www.google.com/maps?q=${q}&output=embed&z=15`,
  };
}
