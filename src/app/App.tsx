import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ContentProvider } from "../lib/content";
import { AdminProvider } from "../lib/admin";
import { EditorChrome } from "./components/editor/EditorChrome";

export default function App() {
  return (
    <AdminProvider>
      <ContentProvider>
        <RouterProvider router={router} />
        {/* Editor-Oberflaeche: laedt sich erst im Bearbeitungsmodus nach. */}
        <EditorChrome />
      </ContentProvider>
    </AdminProvider>
  );
}
