import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Download, Search } from "lucide-react";
import { useAdmin, adminErrorText, type AdminType } from "../../../lib/admin";
import { TYPE_META, STATUS_LABELS, STATUS_STYLE, fmtDate } from "./fields";
import { AdminDetail } from "./AdminDetail";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const STATUS_FILTERS = ["alle", "neu", "in_bearbeitung", "erledigt", "archiviert"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function filterLabel(s: StatusFilter): string {
  if (s === "alle") return "alle";
  if (s === "archiviert") return "archiviert";
  return STATUS_LABELS[s];
}

export function AdminInbox({ type }: { type: AdminType }) {
  const { list, exportCsv } = useAdmin();
  const meta = TYPE_META[type];
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("alle");
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true); setErr(null);
    list(type, true) // inkl. Archivierte; clientseitig gefiltert
      .then((rows) => { if (alive) setItems(rows); })
      .catch((e) => { if (alive) setErr(adminErrorText(e)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [type, list]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((r) => {
      const st = r.admin_status ?? "neu";
      if (status === "archiviert") {
        if (!r.admin_archived) return false;
      } else {
        if (r.admin_archived) return false;
        if (status !== "alle" && st !== status) return false;
      }
      if (!needle) return true;
      return JSON.stringify(r).toLowerCase().includes(needle);
    });
  }, [items, q, status]);

  return (
    <section className="max-w-5xl mx-auto px-6 py-10" style={jakarta}>
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-[#5F6B73] hover:text-[#111111] mb-4">
        <ArrowLeft size={16} strokeWidth={1.5} /> Übersicht
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-2xl font-medium text-[#111111]">{meta.title}</h1>
        <button onClick={() => exportCsv(type, true).catch((e) => setErr(adminErrorText(e)))}
          className="inline-flex items-center gap-2 text-sm text-[#0F7C77] hover:text-white hover:bg-[#0F7C77] border border-[#0F7C77] px-4 py-2 rounded-full transition-colors">
          <Download size={16} strokeWidth={1.5} /> CSV-Export
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA3A8]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suchen …" aria-label="Suchen"
            className="pl-9 pr-3 py-2 rounded-full border border-[#E5F4F5] bg-white text-sm outline-none focus:border-[#6FD3D1]" />
        </div>
        {STATUS_FILTERS.map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${status === s ? "bg-[#0F7C77] text-white border-[#0F7C77]" : "border-[#E5F4F5] text-[#5F6B73] hover:border-[#6FD3D1]"}`}>
            {filterLabel(s)}
          </button>
        ))}
      </div>

      {err && <p className="text-sm text-[#d7120a] mb-3" role="alert">{err}</p>}

      {loading ? (
        <p className="text-sm text-[#5F6B73]">lädt …</p>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5F4F5] overflow-hidden">
          {filtered.length === 0 ? (
            <p className="p-6 text-sm text-[#5F6B73]">Keine Einträge.</p>
          ) : (
            <ul className="divide-y divide-[#E5F4F5]">
              {filtered.map((r) => {
                const st = r.admin_status ?? "neu";
                return (
                  <li key={r.id}>
                    <button onClick={() => setSelected(r)}
                      className="w-full text-left px-5 py-3.5 hover:bg-[#F8FEFF] flex items-center gap-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${r.admin_archived ? "bg-[#E9EDEC] text-[#5C6B69]" : STATUS_STYLE[st]}`}>
                        {r.admin_archived ? "archiviert" : STATUS_LABELS[st]}
                      </span>
                      {meta.columns.map((c) => (
                        <span key={c.key} className="text-sm text-[#111111] truncate flex-1 min-w-0">
                          {c.key === "created_at" ? fmtDate(r[c.key]) : (r[c.key] || "—")}
                        </span>
                      ))}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {selected && (
        <AdminDetail
          type={type}
          record={selected}
          onClose={() => setSelected(null)}
          onChanged={(updated) => {
            setItems((xs) => xs.map((x) => (x.id === updated.id ? updated : x)));
            // Nur aktualisieren, wenn das Panel noch dieses Element zeigt — sonst
            // würde ein spät auflösender Request das geschlossene Panel neu öffnen.
            setSelected((prev) => (prev && prev.id === updated.id ? updated : prev));
          }}
          onDeleted={(id) => {
            setItems((xs) => xs.filter((x) => x.id !== id));
            setSelected(null);
          }}
        />
      )}
    </section>
  );
}
