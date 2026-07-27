import { lazy, Suspense } from "react";
import { useContent } from "../../../lib/content";

// Die Editor-Oberflaeche (Leiste, Format-Leiste, Onboarding) sieht NUR der
// Betreiber im Bearbeitungsmodus. Fuer Besucher waere sie totes Gewicht,
// deshalb: erst wenn `editMode` an ist, wird der Code ueberhaupt geladen
// (dynamic import). Wichtig ist die Bedingung VOR dem Rendern — sonst wuerde
// React.lazy den Chunk trotzdem bei jedem Seitenaufruf anfordern.
const EditToolbar = lazy(() => import("./EditToolbar").then((m) => ({ default: m.EditToolbar })));
const EditFormatToolbar = lazy(() => import("./EditFormatToolbar").then((m) => ({ default: m.EditFormatToolbar })));
const EditOnboarding = lazy(() => import("./EditOnboarding").then((m) => ({ default: m.EditOnboarding })));

export function EditorChrome() {
  const { editMode } = useContent();
  if (!editMode) return null;
  return (
    <Suspense fallback={null}>
      <EditToolbar />
      <EditFormatToolbar />
      <EditOnboarding />
    </Suspense>
  );
}
