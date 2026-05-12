// Google Reviews data.
//
// THE PLACEHOLDER REVIEWS BELOW ARE EXAMPLES ONLY.
// They are clearly marked with `isPlaceholder: true` and must be
// replaced before the site goes live with real visitors.
//
// Two ways to put REAL reviews here:
//
// 1) Manual paste (simplest, no API key needed):
//    - Open https://www.google.com/maps and search for "Cura Doma Hameln"
//    - Copy each review (author, rating, text, date) into the array below
//    - Set `isPlaceholder: false`
//    - Commit + push
//
// 2) Google Places API (auto-updating; recommended once you have many
//    reviews):
//    - Get a Place ID from https://developers.google.com/maps/documentation/places/web-service/place-id
//    - Get an API key with the Places API enabled
//    - Store the key as a Supabase Edge Function secret
//      (NOT in this repo — keys committed to client code become public)
//    - Add a `GET /reviews` endpoint to supabase/functions/server/index.ts
//      that calls https://maps.googleapis.com/maps/api/place/details/json
//      with fields=reviews and returns the JSON to the client
//    - In GoogleReviews.tsx, fetch from that endpoint on mount and
//      fall back to this static list if the fetch fails.
//
//    Note: the Places API returns max 5 reviews per call (Google's
//    cap). For more reviews use a paid service like Trustpilot, or
//    paste manually.

export type Review = {
  author: string;
  /** 1–5 */
  rating: number;
  /** Free text */
  text: string;
  /** "vor 3 Wochen" / "April 2026" — whatever Google shows */
  date: string;
  /** Author's location, optional */
  location?: string;
  /** Letter for the avatar circle when there's no photo */
  initial: string;
  /** SET TO FALSE for real reviews. Placeholders display a banner. */
  isPlaceholder: boolean;
};

export const reviews: Review[] = [
  {
    author: "Beispiel — bitte ersetzen",
    rating: 5,
    text: "Liebevolle und zuverlässige Betreuung meiner Mutter. Das Team von Cura Doma nimmt sich Zeit, hört zu und geht individuell auf ihre Wünsche ein. Wir fühlen uns rundum gut aufgehoben.",
    date: "vor 2 Wochen",
    location: "Hameln",
    initial: "M",
    isPlaceholder: true,
  },
  {
    author: "Beispiel — bitte ersetzen",
    rating: 5,
    text: "Sehr professionelle Beratung und kompetente Unterstützung im Alltag. Besonders die Demenzbetreuung ist mit viel Geduld und Einfühlungsvermögen durchgeführt worden.",
    date: "vor 1 Monat",
    location: "Bad Pyrmont",
    initial: "P",
    isPlaceholder: true,
  },
  {
    author: "Beispiel — bitte ersetzen",
    rating: 5,
    text: "Pünktlich, freundlich und immer ein offenes Ohr. Die Mitarbeiter sind herzlich und mein Vater freut sich jedes Mal auf den Besuch. Wir können Cura Doma uneingeschränkt empfehlen.",
    date: "vor 3 Monaten",
    location: "Springe",
    initial: "K",
    isPlaceholder: true,
  },
  {
    author: "Beispiel — bitte ersetzen",
    rating: 5,
    text: "Die Abrechnung über die Pflegekasse hat super geklappt — wir wurden von Anfang an gut beraten. Die Hauswirtschaftsleistungen sind eine echte Entlastung im Familienalltag.",
    date: "vor 4 Monaten",
    location: "Aerzen",
    initial: "S",
    isPlaceholder: true,
  },
  {
    author: "Beispiel — bitte ersetzen",
    rating: 5,
    text: "Endlich ein Pflegedienst, bei dem man als Angehöriger ernst genommen wird. Die Verhinderungspflege war für uns ein Segen. Vielen Dank an das gesamte Team!",
    date: "vor 5 Monaten",
    location: "Coppenbrügge",
    initial: "T",
    isPlaceholder: true,
  },
  {
    author: "Beispiel — bitte ersetzen",
    rating: 5,
    text: "Wir hatten zuerst Bedenken, fremde Menschen ins Haus zu lassen. Aber die Betreuer von Cura Doma sind ein Teil der Familie geworden. Riesigen Dank!",
    date: "vor 6 Monaten",
    location: "Hessisch Oldendorf",
    initial: "A",
    isPlaceholder: true,
  },
];

export const reviewSummary = {
  count: reviews.length,
  average: reviews.reduce((s, r) => s + r.rating, 0) / reviews.length,
};
