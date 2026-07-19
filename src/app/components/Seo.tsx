// Head-Manager fuer die SPA: setzt pro Route Title, Meta-Description, OG-/Twitter-
// Tags und den Canonical-Link. Reihenfolge der Quellen: Betreiber-Override
// (seo:current, editierbar) > Code-Default (lib/seo) > bei dynamischen Seiten der
// Seiten-Titel. Googlebot rendert JS und liest diese Werte; die Basis-Meta +
// das LocalBusiness-Schema stehen statisch in index.html fuer Crawler ohne JS.
import { useEffect } from "react";
import { useLocation } from "react-router";
import { SEO_BY_PATH, SEO_DEFAULT } from "../../lib/seo";
import { useContent } from "../../lib/content";

const SITE = "https://curadoma.de";
const DEFAULT_IMG = `${SITE}/favicon.png`; // wie in index.html

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function Seo() {
  const { pathname } = useLocation();
  const { getSeo, getPages } = useContent();
  const seo = getSeo();
  const pages = getPages();

  useEffect(() => {
    const key = pathname.replace(/\/+$/, "") || "/";
    const base = SEO_BY_PATH[key] ?? SEO_DEFAULT;
    const ov = seo[key];
    // Dynamische Seite (kein Code-Default): ohne Override-Titel den Seiten-Titel nehmen.
    const dyn = pages.find((p) => `/${p.slug}` === key);
    const title = ov?.title || (dyn ? `${dyn.label} – Cura Doma` : base.title);
    const description = ov?.description || base.description;
    const image = ov?.image || DEFAULT_IMG;
    const url = SITE + (key === "/" ? "/" : key);

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", image);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);
    upsertMeta("name", "twitter:card", ov?.image ? "summary_large_image" : "summary");
    upsertCanonical(url);
  }, [pathname, seo, pages]);

  return null;
}
