// Per-Route SEO-Konfiguration (Title + Description). Die eigentlichen Werte liegen
// in ./seo.data.js (SSOT) – so nutzen App UND das Build-Pre-Render-Script
// (scripts/prerender.mjs) exakt dieselben Meta-Daten. Der <Seo/>-Head-Manager
// (src/app/components/Seo.tsx) setzt sie beim Routenwechsel in <head>.
// WICHTIG: Bei neuen Routen in seo.data.js UND public/sitemap.xml ergaenzen.
import { SEO_DEFAULT as _DEFAULT, SEO_BY_PATH as _BY_PATH } from "./seo.data.js";

export type SeoMeta = {
  title: string;
  description: string;
  /** Optional: ueberschreibt geo.region/geo.placename/geo.position/ICBM (nur Pre-Render). */
  geo?: { region: string; placename: string; position: string };
};

export const SEO_DEFAULT: SeoMeta = _DEFAULT;
export const SEO_BY_PATH: Record<string, SeoMeta> = _BY_PATH;
