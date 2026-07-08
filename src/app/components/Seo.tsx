// Head-Manager fuer die SPA: setzt pro Route Title, Meta-Description, OG-Title/
// -Description/-URL und den Canonical-Link. Googlebot rendert JS und liest diese
// pro-Route-Werte; das statische index.html traegt die Basis-Meta fuer Crawler,
// die kein JS ausfuehren. Rendert nichts (nur Seiteneffekt in <head>).
import { useEffect } from "react";
import { useLocation } from "react-router";
import { SEO_BY_PATH, SEO_DEFAULT } from "../../lib/seo";

const SITE = "https://curadoma.de";

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
  useEffect(() => {
    const key = pathname.replace(/\/+$/, "") || "/";
    const meta = SEO_BY_PATH[key] ?? SEO_DEFAULT;
    const url = SITE + (key === "/" ? "/" : key);
    document.title = meta.title;
    upsertMeta("name", "description", meta.description);
    upsertMeta("property", "og:title", meta.title);
    upsertMeta("property", "og:description", meta.description);
    upsertMeta("property", "og:url", url);
    upsertCanonical(url);
  }, [pathname]);
  return null;
}
