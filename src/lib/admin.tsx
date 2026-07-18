import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { FN_BASE, FN_ANON } from "./booking";

export type AdminType = "contact" | "job" | "appointment";
export type LoginResult = "ok" | "bad" | "rate" | "unconfigured" | "error";

function post(path: string, body: unknown): Promise<Response> {
  return fetch(`${FN_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${FN_ANON}` },
    body: JSON.stringify(body),
  });
}

type Patch = Partial<{ admin_status: string; admin_note: string; admin_archived: boolean }>;
type AdminCtx = {
  authed: boolean;
  login: (pw: string) => Promise<LoginResult>;
  logout: () => void;
  pw: () => string;
  list: (type: AdminType, includeArchived?: boolean) => Promise<any[]>;
  update: (type: AdminType, id: string, patch: Patch) => Promise<any>;
  remove: (type: AdminType, id: string) => Promise<void>;
  cvUrl: (id: string) => Promise<string | null>;
  exportCsv: (type: AdminType, includeArchived?: boolean) => Promise<void>;
};

const Ctx = createContext<AdminCtx | null>(null);
export function useAdmin(): AdminCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAdmin must be used within <AdminProvider>");
  return c;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  // Passwort NUR im Speicher (kein sessionStorage): nach Reload wieder abgemeldet,
  // niemand kann sich per manuell gesetztem Flag Zugriff verschaffen.
  const pwRef = useRef("");
  const [authed, setAuthed] = useState(false);

  const login = useCallback(async (p: string): Promise<LoginResult> => {
    try {
      const res = await post("/site-content/save", { password: p, action: "__check" });
      if (res.status === 401) return "bad";
      if (res.status === 429) return "rate";
      if (res.status === 503) return "unconfigured";
      if (res.ok) { pwRef.current = p; setAuthed(true); return "ok"; }
      return "error";
    } catch { return "error"; }
  }, []);

  const logout = useCallback(() => { pwRef.current = ""; setAuthed(false); }, []);
  const pw = useCallback(() => pwRef.current, []);

  const list = useCallback(async (type: AdminType, includeArchived = false) => {
    const res = await post("/admin/list", { password: pwRef.current, type, includeArchived });
    if (!res.ok) throw new Error(String(res.status));
    return ((await res.json()).items ?? []) as any[];
  }, []);

  const update = useCallback(async (type: AdminType, id: string, patch: Patch) => {
    const res = await post("/admin/update", { password: pwRef.current, type, id, ...patch });
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()).item;
  }, []);

  const remove = useCallback(async (type: AdminType, id: string) => {
    const res = await post("/admin/delete", { password: pwRef.current, type, id });
    if (!res.ok) throw new Error(String(res.status));
  }, []);

  const cvUrl = useCallback(async (id: string) => {
    const res = await post("/admin/cv-url", { password: pwRef.current, id });
    if (!res.ok) return null;
    return ((await res.json()).url ?? null) as string | null;
  }, []);

  const exportCsv = useCallback(async (type: AdminType, includeArchived = false) => {
    const res = await post("/admin/export", { password: pwRef.current, type, includeArchived });
    if (!res.ok) throw new Error(String(res.status));
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `cura-doma-${type}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <Ctx.Provider value={{ authed, login, logout, pw, list, update, remove, cvUrl, exportCsv }}>
      {children}
    </Ctx.Provider>
  );
}
