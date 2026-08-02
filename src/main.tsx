import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { router } from "./app/router";
import "./styles/index.css";

const container = document.getElementById("root")!;

let montiert = false;

function mount() {
  // Genau einmal mounten. Ohne diese Sperre koennten Sicherheitsnetz (Timeout)
  // und Router-Abo beide feuern — das ergaebe ZWEI React-Wurzeln im selben
  // Container und damit genau die Verdopplung, die hier behoben wird.
  if (montiert) return;
  montiert = true;

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
}

// ERST mounten, wenn der Router die aktuelle Route aufgeloest hat.
//
// WARUM: Ausser der Startseite wird jede Seite per `lazy` nachgeladen
// (siehe app/routes.tsx). Solange der Router die Komponente noch nicht hat,
// rendert er NICHTS. Wird in diesem Moment hydriert, beansprucht React keinen
// einzigen der vorab gerenderten Knoten — es meldet nicht einmal einen
// Konflikt, denn "nichts rendern" widerspricht dem Server-HTML formal nicht.
// Das vorab gerenderte DOM bleibt daraufhin verwaist stehen, und sobald das
// lazy-Modul da ist, haengt React seinen Baum DANEBEN: die komplette Seite
// erschien doppelt (Navigation, Inhalt, Footer, dann alles noch einmal).
// Betroffen waren 11 der 12 Seiten — die Startseite nicht, weil HomePage
// direkt importiert wird und der erste Client-Render deshalb sofort passt.
//
// `createBrowserRouter` ruft `initialize()` bereits beim Erzeugen auf, das
// Nachladen laeuft also schon. Wir warten hier nur dessen Ende ab.
if (router.state.initialized) {
  mount();
} else {
  // Sicherheitsnetz: Sollte die Initialisierung haengen bleiben (z. B. ein
  // nicht ladbarer Chunk), wird trotzdem gemountet. Schlimmstenfalls ist das
  // Verhalten dann das alte — besser als eine leere Seite.
  const notfall = window.setTimeout(mount, 3000);
  const abmelden = router.subscribe((state) => {
    if (!state.initialized) return;
    window.clearTimeout(notfall);
    abmelden();
    mount();
  });
}
