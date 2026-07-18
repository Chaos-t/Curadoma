import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Inbox, FileText, CalendarDays, Pencil, LogOut } from "lucide-react";
import { useAdmin, type AdminType } from "../../../lib/admin";
import { useContent } from "../../../lib/content";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

const TILES: Array<{ type: AdminType; to: string; label: string; Icon: typeof Inbox; unit: string }> = [
  { type: "contact", to: "/admin/anfragen", label: "Anfragen", Icon: Inbox, unit: "neu" },
  { type: "job", to: "/admin/bewerbungen", label: "Bewerbungen", Icon: FileText, unit: "neu" },
  { type: "appointment", to: "/admin/termine", label: "Termine", Icon: CalendarDays, unit: "neu" },
];

export function AdminDashboard() {
  const { list, logout, pw } = useAdmin();
  const { enterEditMode } = useContent();
  const navigate = useNavigate();
  const [counts, setCounts] = useState<Record<string, number | undefined>>({});

  useEffect(() => {
    let alive = true;
    Promise.all(
      TILES.map(async (t) => {
        try {
          const items = await list(t.type);
          return [t.type, items.filter((r) => (r.admin_status ?? "neu") === "neu").length] as const;
        } catch {
          return [t.type, -1] as const;
        }
      }),
    ).then((pairs) => { if (alive) setCounts(Object.fromEntries(pairs)); });
    return () => { alive = false; };
  }, [list]);

  return (
    <section className="max-w-5xl mx-auto px-6 py-14" style={jakarta}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.16em] uppercase text-[#5F6B73] mb-1">Cura Doma</p>
          <h1 className="text-3xl font-medium text-[#111111]">Verwaltung</h1>
        </div>
        <button onClick={logout}
          className="inline-flex items-center gap-2 text-sm text-[#5F6B73] hover:text-[#111111] px-4 py-2 rounded-full border border-[#E5F4F5]">
          <LogOut size={16} strokeWidth={1.5} /> Abmelden
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TILES.map(({ type, to, label, Icon, unit }) => (
          <Link key={type} to={to}
            className="group bg-white rounded-2xl border border-[#E5F4F5] shadow-[0_10px_30px_rgb(191,234,242,0.25)] p-6 hover:border-[#6FD3D1] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#DFF7F8] text-[#0F7C77]">
                <Icon size={20} strokeWidth={1.5} />
              </span>
              <span className="text-lg font-medium text-[#111111]">{label}</span>
            </div>
            <div className="text-sm text-[#5F6B73]">
              {counts[type] === undefined ? "lädt …"
                : counts[type]! < 0 ? "—"
                : <><span className="text-[#0F7C77] font-semibold">{counts[type]}</span> {unit}</>}
            </div>
          </Link>
        ))}

        <button onClick={() => { enterEditMode(pw()); navigate("/"); }}
          className="text-left bg-white rounded-2xl border border-[#E5F4F5] shadow-[0_10px_30px_rgb(191,234,242,0.25)] p-6 hover:border-[#6FD3D1] transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#DFF7F8] text-[#0F7C77]">
              <Pencil size={20} strokeWidth={1.5} />
            </span>
            <span className="text-lg font-medium text-[#111111]">Seite bearbeiten</span>
          </div>
          <div className="text-sm text-[#5F6B73]">Texte &amp; Bilder direkt auf der Website ändern</div>
        </button>
      </div>
    </section>
  );
}
