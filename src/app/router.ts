import { createBrowserRouter } from "react-router";
import { routes, basename } from "./routes";

// Browser-Router: NUR hier, weil createBrowserRouter window.history braucht.
// Beim Vorab-Rendern (Node) wird stattdessen der Static-Router in
// src/entry-server.tsx aus denselben `routes` gebaut.
export const router = createBrowserRouter(routes, { basename });
