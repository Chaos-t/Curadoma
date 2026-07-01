import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ContentProvider } from "../lib/content";
import { EditToolbar } from "./components/editor/EditToolbar";

export default function App() {
  return (
    <ContentProvider>
      <RouterProvider router={router} />
      <EditToolbar />
    </ContentProvider>
  );
}
