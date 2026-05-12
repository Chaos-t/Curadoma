// Fallback Google Reviews data.
//
// THE WIRED-UP FLOW: `GoogleReviews.tsx` fetches `/reviews` from the
// Supabase Edge Function on mount, which calls Google Places Details
// API server-side and returns real reviews. The data here is only used
// when that fetch fails (missing secrets, upstream down, etc.) so the
// home page never goes empty.
//
// To make live reviews work in production:
//
// 1) Set `GOOGLE_PLACES_API_KEY` (Places API enabled) in Supabase
//    Dashboard → Edge Functions → server → Secrets.
// 2) Redeploy the function (`supabase functions deploy server` or via
//    the dashboard). The Edge Function auto-discovers the Place ID by
//    searching for the business address — no second secret needed.
//
// Optional: if Google's text search returns the wrong listing (e.g.
// you have multiple matching names), set `GOOGLE_PLACE_ID` as a secret
// to override the discovery.
//
// Note: Google Places Details API caps reviews at 5 per call. That's
// an upstream limit, not a bug here.
//
// The reviews below are REAL — manually copied from the Cura Doma
// Google Maps listing on 2026-05-12. They serve as the offline
// fallback if the live API is unreachable, so the social proof on the
// home page never disappears.

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
    author: "Laura Aliu",
    rating: 5,
    text: "Ein äußerst zuverlässiger Betreuungsdienst! Die Mitarbeiter sind immer pünktlich, arbeiten sehr sauber und gehen einfühlsam auf individuelle Bedürfnisse ein. Absolut empfehlenswert!",
    date: "vor 5 Monaten",
    initial: "L",
    isPlaceholder: false,
  },
  {
    author: "Michelle",
    rating: 5,
    text: "Ich bin absolut begeistert vom Betreuungsdienst – sowohl von der Chefin als auch vom gesamten Team. Man spürt in jedem Kontakt die Herzlichkeit, Kompetenz und Verlässlichkeit, mit der hier gearbeitet wird. Die Betreuung ist durchweg professionell, einfühlsam und engagiert. Was besonders hervorsticht: Man kann sich jederzeit auf das Team verlassen. Termine werden zuverlässig eingehalten, Anliegen werden ernst genommen und es wird immer nach individuellen Lösungen gesucht. Ein großes Dankeschön an alle – hier wird großartige Arbeit geleistet!",
    date: "vor 11 Monaten",
    initial: "M",
    isPlaceholder: false,
  },
  {
    author: "Jocelyne .Del.",
    rating: 5,
    text: "Ich kann den Betreuungsdienst von Cura Doma nur wärmstens empfehlen! Die Betreuung ist stets von großer Herzlichkeit, Pünktlichkeit und Gewissenhaftigkeit geprägt. Die Mitarbeiter gehen liebevoll auf die Bedürfnisse der älteren Menschen ein und sorgen dafür, dass sie sich gut aufgehoben und umsorgt fühlen. Cura Doma schafft es, mit viel Engagement und Herz den Alltag älterer Menschen zu bereichern. Vielen Dank für die großartige Arbeit!",
    date: "vor 11 Monaten",
    location: "Local Guide",
    initial: "J",
    isPlaceholder: false,
  },
  {
    author: "Paula K",
    rating: 5,
    text: "Ein sehr guter Betreuungsdienst! Die Chefin ist immer mit viel Herz, Freundlichkeit, Einfühlsamkeit und Professionalität im Einsatz. Ein Dienst auf den man sich immer verlassen und freuen kann. Sie machen ihre Arbeit sehr gut und für ein paar liebe Worte finden sie auch immer Zeit. Könnte ich mehr als 5 Sterne vergeben, würde ich 10 geben! Vielen Dank an das Team!!",
    date: "vor einem Jahr",
    initial: "P",
    isPlaceholder: false,
  },
  {
    author: "Bauchgefühl",
    rating: 5,
    text: "Unser erster Eindruck von Cura Doma war äußerst positiv! Schon beim ersten Gespräch zeigte sich das Team als äußerst freundlich und fachlich kompetent. Wir schätzen die Pünktlichkeit, Höflichkeit und Zuverlässigkeit, die das Team bei jeder Betreuungssitzung an den Tag legt. Die Abwicklung mit der Krankenkasse verlief reibungslos, und wir erhielten wertvolle Tipps und Unterstützung bei all unseren Fragen. Wir können Cura Doma uneingeschränkt weiterempfehlen!",
    date: "vor einem Jahr",
    location: "Local Guide",
    initial: "B",
    isPlaceholder: false,
  },
  {
    author: "Jonatan Urra",
    rating: 5,
    text: "Die Inhaberin ist super nett und zuverlässig, meine Eltern haben nur gutes von den Leistungen des Betreuungsdienstes erzählt.",
    date: "vor 6 Monaten",
    initial: "J",
    isPlaceholder: false,
  },
  {
    author: "Astrid Günther",
    rating: 5,
    text: "Sehr hilfsbereit, freundlich und flexibel. Hier zählen die Bedürfnisse des Menschen und nicht nur das Geld. Ein Dienst, der seine Arbeit nicht nur als Beruf, sondern als Berufung ansieht. Kann ich wirklich empfehlen.",
    date: "vor 11 Monaten",
    initial: "A",
    isPlaceholder: false,
  },
];

export const reviewSummary = {
  // Real Google data as of 2026-05-12: 9 reviews total, 5.0 ★ — two
  // reviews are rating-only with no text (Kimberly Mori, René de Vries)
  // and are intentionally not rendered here.
  count: 9,
  average: 5.0,
};
