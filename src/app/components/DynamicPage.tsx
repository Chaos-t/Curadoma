import { useParams } from "react-router";
import { useContent } from "../../lib/content";
import { Editable } from "./editor/Editable";
import { BlockArea } from "./editor/BlockArea";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

// Rendert eine dynamisch angelegte Seite (Titel + Fließtext, editierbar). Ist der
// Slug keine bekannte Seite, wird die normale 404-Ansicht gezeigt.
export function DynamicPage() {
  const { slug } = useParams();
  const { getPages, structureLoaded } = useContent();
  const page = getPages().find((p) => p.slug === slug);
  // Title/SEO übernimmt der zentrale <Seo/>-Head-Manager (nutzt Override oder Seiten-Titel).

  if (!page) {
    // Solange die Seitenliste noch nicht vom Server da ist, KEIN „nicht gefunden"
    // zeigen — sonst blitzt es beim Direktaufruf (/eigene-seite) auf, bevor
    // /pages geladen ist, und wirkt, als gäbe es die Seite nicht.
    if (!structureLoaded) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center" style={jakarta}>
          <p className="text-sm text-[#5F6B73] font-light">lädt …</p>
        </div>
      );
    }
    return (
      <div className="min-h-[60vh] py-32 text-center">
        <h1 className="text-4xl font-medium text-[#111111] mb-4" style={jakarta}>Seite nicht gefunden</h1>
        <p className="text-lg text-[#5F6B73] font-light">Die gewünschte Seite existiert leider nicht.</p>
      </div>
    );
  }

  const base = `page.${slug}`;
  return (
    <section className="max-w-3xl mx-auto px-6 py-16 sm:py-24 min-h-[78vh]">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#0E6E6A] mb-6 uppercase tracking-wider">
        <Editable as="span" id={`${base}.eyebrow`}>Cura Doma</Editable>
      </div>
      <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-8" style={jakarta}>
        <Editable as="span" id={`${base}.title`}>{page.label}</Editable>
      </h1>
      {/* Frei aus Blöcken baubar: Text, Button, Bild (im Bearbeitungsmodus „+ Block hinzufügen"). */}
      <BlockArea areaId={`${base}.blocks`} />
    </section>
  );
}
