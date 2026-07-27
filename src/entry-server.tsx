// Server-Einstiegspunkt fuer das Vorab-Rendern (SSG) beim Build.
//
// WARUM: Die Seite wurde bisher komplett im Browser aufgebaut. Lighthouse mass
// mobil fuer das LCP-Element (den Hero-TEXT) 4.710 ms „Render Delay" bei 0 ms
// Ladezeit — es wurde also auf nichts gewartet ausser auf React. Mit echtem
// Vorab-Rendern steht der Text schon im HTML und erscheint sofort.
//
// Es laeuft NUR beim Build (Node), nie im Browser. Der Client uebernimmt
// danach per hydrateRoot (siehe src/main.tsx).
import { renderToString } from "react-dom/server";
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from "react-router";
import { routes } from "./app/routes";
import { AdminProvider } from "./lib/admin";
import { ContentProvider } from "./lib/content";

const ORIGIN = "https://curadoma.de";

export async function render(pathname: string): Promise<string> {
  // WICHTIG: `dataRoutes` verwenden, NICHT die urspruengliche `routes`-Liste.
  // query() loest die `lazy`-Routen auf und legt das Ergebnis in dataRoutes ab;
  // mit den unaufgeloesten Routen haette der Static-Router keine Component und
  // wuerde einen leeren Rumpf rendern (nur Layout, kein Seiteninhalt).
  const { query, dataRoutes } = createStaticHandler(routes);
  const context = await query(new Request(ORIGIN + pathname));

  // Bei einer Weiterleitung/Response statt Kontext: nichts vorab rendern,
  // der Client-Router uebernimmt (der Aufrufer faellt auf die Huelle zurueck).
  if (context instanceof Response) {
    throw new Error(`unerwartete Response fuer ${pathname} (Status ${context.status})`);
  }

  const router = createStaticRouter(dataRoutes, context);

  // Providers wie im Client (App.tsx). EditorChrome bleibt bewusst weg: es
  // rendert ohne Bearbeitungsmodus ohnehin null und braucht den Browser-Router.
  return renderToString(
    <AdminProvider>
      <ContentProvider>
        {/* hydrate={false}: sonst haengt StaticRouterProvider ZUSAETZLICH ein
            <script> mit Router-Hydrationsdaten in den Baum. Unser Client baut
            den Router aber selbst per createBrowserRouter auf und braucht die
            Daten nicht — das Extra-Element fuehrte zu unterschiedlicher
            Kinderzahl in #root (Server 2, Client 1) und damit zum
            Hydration-Abbruch (React-Fehler #418). */}
        <StaticRouterProvider router={router} context={context} hydrate={false} />
      </ContentProvider>
    </AdminProvider>,
  );
}
