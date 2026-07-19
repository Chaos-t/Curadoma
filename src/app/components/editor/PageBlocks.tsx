import { useLocation } from "react-router";
import { useContent } from "../../../lib/content";
import { BlockArea } from "./BlockArea";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

// Feste Inhaltsseiten, die einen frei baubaren Block-Bereich am Seitenende
// bekommen (Pfad -> stabiler Bereichs-Schlüssel). Rechtsseiten (Impressum/
// Datenschutz), Status- und Admin-Seiten sowie dynamische Seiten (die haben
// schon ihren eigenen BlockArea) sind bewusst ausgenommen.
const BUILTIN: Record<string, string> = {
  "/": "home",
  "/leistungen": "leistungen",
  "/entlastung": "entlastung",
  "/demenzbetreuung": "demenz",
  "/haushaltsnahe-dienstleistungen": "haushalt",
  "/verhinderungspflege": "verhinderung",
  "/umwandlung-sachleistungen": "umwandlung",
  "/einzugsgebiet": "einzugsgebiet",
  "/kontakt": "kontakt",
  "/karriere": "karriere",
};

/** Frei baubarer Bereich am Ende der festen Seiten — damit der Betreiber auch
 *  dort (nicht nur auf selbst angelegten Seiten) Blöcke hinzufügen kann. Für
 *  Besucher nur sichtbar, wenn wirklich Blöcke drin sind. */
export function PageBlocks() {
  const { pathname } = useLocation();
  const { editMode, getBlocks } = useContent();
  const key = BUILTIN[pathname];
  if (!key) return null;
  const areaId = `site.${key}.blocks`;
  const blocks = getBlocks(areaId);
  if (!editMode && blocks.length === 0) return null;
  return (
    <section className="max-w-4xl mx-auto px-6 py-14" style={jakarta}>
      {editMode && (
        <p className="text-center text-sm text-[#5F6B73] mb-5 font-light">
          Eigener Bereich — hier kannst du dieser Seite unten weitere Blöcke hinzufügen.
        </p>
      )}
      <BlockArea areaId={areaId} />
    </section>
  );
}
