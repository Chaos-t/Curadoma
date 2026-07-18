import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ContentProvider } from "../lib/content";
import { AdminProvider } from "../lib/admin";
import { EditToolbar } from "./components/editor/EditToolbar";

export default function App() {
  return (
    <AdminProvider>
      <ContentProvider>
        <RouterProvider router={router} />
        <EditToolbar />
      </ContentProvider>
    </AdminProvider>
  );
}
