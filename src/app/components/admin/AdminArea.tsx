import { useEffect } from "react";
import { Outlet } from "react-router";
import { useAdmin } from "../../../lib/admin";
import { AdminLoginForm } from "./AdminLoginForm";

export function AdminArea() {
  const { authed } = useAdmin();

  // Der gesamte /admin-Bereich ist noindex,nofollow.
  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex,nofollow";
    document.head.appendChild(m);
    return () => { document.head.removeChild(m); };
  }, []);

  return authed ? <Outlet /> : <AdminLoginForm />;
}
