import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./components/HomePage";
import { LeistungenPage } from "./components/LeistungenPage";
import { EntlastungPage } from "./components/EntlastungPage";
import { DemenzPage } from "./components/DemenzPage";
import { HaushaltPage } from "./components/HaushaltPage";
import { VerhinderungspflegePage } from "./components/VerhinderungspflegePage";
import { UmwandlungPage } from "./components/UmwandlungPage";
import { EinzugsgebietPage } from "./components/EinzugsgebietPage";
import { KontaktPage } from "./components/KontaktPage";
import { ImpressumPage } from "./components/ImpressumPage";
import { DatenschutzPage } from "./components/DatenschutzPage";
import { KarrierePage } from "./components/KarrierePage";

// import.meta.env.BASE_URL is "/Curadoma/" on Pages, "/" in dev. Strip the
// trailing slash so React Router treats it as a basename.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "leistungen", Component: LeistungenPage },
      { path: "entlastung", Component: EntlastungPage },
      { path: "demenzbetreuung", Component: DemenzPage },
      { path: "haushaltsnahe-dienstleistungen", Component: HaushaltPage },
      { path: "verhinderungspflege", Component: VerhinderungspflegePage },
      { path: "umwandlung-sachleistungen", Component: UmwandlungPage },
      { path: "einzugsgebiet", Component: EinzugsgebietPage },
      { path: "kontakt", Component: KontaktPage },
      { path: "impressum", Component: ImpressumPage },
      { path: "datenschutz", Component: DatenschutzPage },
      { path: "karriere", Component: KarrierePage },
      {
        path: "*",
        Component: () => (
          <div className="py-32 text-center">
            <h1 className="text-4xl font-medium text-[#111111] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Seite nicht gefunden
            </h1>
            <p className="text-lg text-[#5F6B73] font-light">Die gewünschte Seite existiert leider nicht.</p>
          </div>
        ),
      },
    ],
  },
], { basename });
