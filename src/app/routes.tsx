import { Layout } from "./components/Layout";
import { HomePage } from "./components/HomePage";

// Code-Splitting: NUR Layout + Startseite liegen im Haupt-Bundle. Alle
// weiteren Seiten — und vor allem der komplette /admin-Bereich, den Besucher
// nie brauchen — werden per `lazy` erst beim Aufruf nachgeladen. Das war der
// groesste Posten im 1-MB-Bundle („Reduziere nicht verwendetes JavaScript").
// react-router 7 laedt das Modul beim Navigieren selbst nach (kein Suspense noetig).

export const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

// NUR die Routen-Beschreibung — bewusst OHNE createBrowserRouter, damit
// dieses Modul auch beim Vorab-Rendern in Node importierbar bleibt
// (createBrowserRouter greift auf window.history zu). Der Browser-Router
// entsteht in ./router.ts, der Server-Router in src/entry-server.tsx.
export const routes = [
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "leistungen", lazy: async () => ({ Component: (await import("./components/LeistungenPage")).LeistungenPage }) },
      { path: "entlastung", lazy: async () => ({ Component: (await import("./components/EntlastungPage")).EntlastungPage }) },
      { path: "demenzbetreuung", lazy: async () => ({ Component: (await import("./components/DemenzPage")).DemenzPage }) },
      { path: "haushaltsnahe-dienstleistungen", lazy: async () => ({ Component: (await import("./components/HaushaltPage")).HaushaltPage }) },
      { path: "verhinderungspflege", lazy: async () => ({ Component: (await import("./components/VerhinderungspflegePage")).VerhinderungspflegePage }) },
      { path: "umwandlung-sachleistungen", lazy: async () => ({ Component: (await import("./components/UmwandlungPage")).UmwandlungPage }) },
      { path: "einzugsgebiet", lazy: async () => ({ Component: (await import("./components/EinzugsgebietPage")).EinzugsgebietPage }) },
      { path: "standort-hameln", lazy: async () => { const { StandortPage } = await import("./components/StandortPage"); return { Component: () => <StandortPage location="hameln" /> }; } },
      { path: "standort-paderborn", lazy: async () => { const { StandortPage } = await import("./components/StandortPage"); return { Component: () => <StandortPage location="paderborn" /> }; } },
      { path: "kontakt", lazy: async () => ({ Component: (await import("./components/KontaktPage")).KontaktPage }) },
      { path: "impressum", lazy: async () => ({ Component: (await import("./components/ImpressumPage")).ImpressumPage }) },
      { path: "datenschutz", lazy: async () => ({ Component: (await import("./components/DatenschutzPage")).DatenschutzPage }) },
      { path: "karriere", lazy: async () => ({ Component: (await import("./components/KarrierePage")).KarrierePage }) },
      { path: "termin", lazy: async () => ({ Component: (await import("./components/TerminPage")).TerminPage }) },
      { path: "termin-status", lazy: async () => ({ Component: (await import("./components/TerminStatusPage")).TerminStatusPage }) }, // Landeseite der Bestaetigungs-Mails
      { path: ":slug", lazy: async () => ({ Component: (await import("./components/DynamicPage")).DynamicPage }) }, // dynamisch angelegte Seiten (sonst 404)
      {
        path: "*",
        Component: () => (
          <div className="py-32 text-center">
            <h1 className="text-4xl font-medium text-[#111111] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif" }}>
              Seite nicht gefunden
            </h1>
            <p className="text-lg text-[#5F6B73] font-light">Die gewünschte Seite existiert leider nicht.</p>
          </div>
        ),
      },
    ],
  },
  // Admin/Verwaltung: BEWUSST außerhalb des Layout (kein öffentlicher Navi/Footer),
  // damit der Footer nicht das Detail-Panel überdeckt und der Bereich clean wirkt.
  // Komplett lazy — Besucher laden davon kein einziges Byte.
  {
    path: "/admin",
    lazy: async () => ({ Component: (await import("./components/admin/AdminArea")).AdminArea }),
    children: [
      { index: true, lazy: async () => ({ Component: (await import("./components/admin/AdminDashboard")).AdminDashboard }) },
      { path: "anfragen", lazy: async () => { const { AdminInbox } = await import("./components/admin/AdminInbox"); return { Component: () => <AdminInbox type="contact" /> }; } },
      { path: "bewerbungen", lazy: async () => { const { AdminInbox } = await import("./components/admin/AdminInbox"); return { Component: () => <AdminInbox type="job" /> }; } },
      { path: "termine", lazy: async () => { const { AdminInbox } = await import("./components/admin/AdminInbox"); return { Component: () => <AdminInbox type="appointment" /> }; } },
      { path: "mediathek", lazy: async () => ({ Component: (await import("./components/admin/AdminMedia")).AdminMedia }) },
      { path: "seiten", lazy: async () => ({ Component: (await import("./components/admin/AdminPages")).AdminPages }) },
    ],
  },
];
