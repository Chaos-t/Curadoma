import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

const container = document.getElementById("root")!;

// Beim Build wird jede Route vorab zu echtem HTML gerendert (scripts/prerender.mjs).
// Ist also schon Inhalt da, wird er HYDRIERT statt neu aufgebaut — der Text ist
// dadurch sofort sichtbar, ohne auf React zu warten. Fallback: normales Rendern
// (z. B. im Dev-Server, wo nichts vorab gerendert wird).
if (container.firstElementChild) {
  hydrateRoot(container, <App />, {
    // Zeigt bei einem Hydrations-Konflikt, WELCHE Komponente abweicht.
    // Ohne das nennt die Produktionsfassung nur "React error #418".
    onRecoverableError: (error, info) => {
      console.warn("[Hydration]", error, info?.componentStack);
    },
  });
} else {
  createRoot(container).render(<App />);
}
