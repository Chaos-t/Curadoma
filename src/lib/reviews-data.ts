// Fallback Google Reviews data.
//
// THE WIRED-UP FLOW: `GoogleReviews.tsx` fetches `/reviews` from the
// Supabase Edge Function on mount, which calls Google Places Details
// API server-side and returns real reviews. The data here is only used
// when that fetch fails (missing secrets, upstream down, etc.) so the
// home page never goes empty.
//
// The fallback reviews are clearly marked with `isPlaceholder: true`
// and the UI shows a warning banner whenever they are rendered.
//
// To make live reviews work in production:
//
// 1) Find your Place ID: https://developers.google.com/maps/documentation/places/web-service/place-id
// 2) In Supabase Dashboard → Edge Functions → server → Secrets, set
//    `GOOGLE_PLACES_API_KEY` (Places API enabled) and `GOOGLE_PLACE_ID`.
// 3) Redeploy the function (`supabase functions deploy server` or via
//    the dashboard). The frontend will start showing live data on the
//    next page load.
//
// Note: Google Places Details API caps reviews at 5 per call. That's
// an upstream limit, not a bug here.

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
