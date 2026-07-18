import { useEffect } from "react";
import { useParams } from "react-router";
import { useContent } from "../../lib/content";
import { Editable } from "./editor/Editable";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

// Rendert eine dynamisch angelegte Seite (Titel + Fließtext, editierbar). Ist der
// Slug keine bekannte Seite, wird die normale 404-Ansicht gezeigt.
export function DynamicPage() {
  const { slug } = useParams();
  const { getPages } = useContent();
  const page = getPages().find((p) => p.slug === slug);

  useEffect(() => {
    if (page) document.title = `${page.label} – Cura Doma`;
  }, [page]);

  if (!page) {
    return (
      <div className="py-32 text-center">
        <h1 className="text-4xl font-medium text-[#111111] mb-4" style={jakarta}>Seite nicht gefunden</h1>
        <p className="text-lg text-[#5F6B73] font-light">Die gewünschte Seite existiert leider nicht.</p>
      </div>
    );
  }

  const base = `page.${slug}`;
  return (
    <section className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#6FD3D1] mb-6 uppercase tracking-wider">
        <Editable as="span" id={`${base}.eyebrow`}>Cura Doma</Editable>
      </div>
      <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-8" style={jakarta}>
        <Editable as="span" id={`${base}.title`}>{page.label}</Editable>
      </h1>
      <div className="text-lg text-[#5F6B73] leading-relaxed font-light space-y-4 [&_a]:text-[#6FD3D1] [&_a:hover]:underline [&_strong]:text-[#111111] [&_strong]:font-medium">
        <Editable as="div" id={`${base}.body`} rich>
          Hier steht der Inhalt dieser Seite. Im Bearbeitungsmodus diesen Text anklicken und ändern — Text markieren für Fett/Kursiv/Link.
        </Editable>
      </div>
    </section>
  );
}
