import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Trash2, Lock } from "lucide-react";
import { useAdmin, adminErrorText } from "../../../lib/admin";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const FILTERS = ["alle", "verwendet", "ungenutzt"] as const;

function fmtSize(n?: number | null): string {
  if (!n || n <= 0) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function AdminMedia() {
  const { mediaList, mediaDelete } = useAdmin();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("alle");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true); setErr(null);
    mediaList()
      .then((x) => { if (alive) setItems(x); })
      .catch((e) => { if (alive) setErr(adminErrorText(e)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [mediaList]);

  const filtered = useMemo(
    () => items.filter((it) => (filter === "alle" ? true : filter === "verwendet" ? it.inUse : !it.inUse)),
    [items, filter],
  );
  const usedCount = items.filter((i) => i.inUse).length;
  const orphanCount = items.length - usedCount;

  const del = async (it: any) => {
    if (it.inUse) return; // benutzte Bilder sind geschützt
    if (!confirm(`Bild „${it.name}" endgültig löschen?`)) return;
    setBusy(it.path); setErr(null);
    try {
      await mediaDelete(it.path);
      setItems((xs) => xs.filter((x) => x.path !== it.path));
    } catch (e) {
      setErr(adminErrorText(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-6 py-10" style={jakarta}>
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-[#5F6B73] hover:text-[#111111] mb-4">
        <ArrowLeft size={16} strokeWidth={1.5} /> Übersicht
      </Link>
      <h1 className="text-2xl font-medium text-[#111111] mb-1">Mediathek</h1>
      <p className="text-sm text-[#5F6B73] mb-5">
        {items.length} Bilder · {usedCount} in Verwendung · {orphanCount} ungenutzt. Ungenutzte Bilder lassen sich löschen; benutzte sind geschützt.
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${filter === f ? "bg-[#0F7C77] text-white border-[#0F7C77]" : "border-[#E5F4F5] text-[#5F6B73] hover:border-[#6FD3D1]"}`}>
            {f === "alle" ? "alle" : f === "verwendet" ? "in Verwendung" : "ungenutzt"}
          </button>
        ))}
      </div>

      {err && <p className="text-sm text-[#d7120a] mb-3" role="alert">{err}</p>}

      {loading ? (
        <p className="text-sm text-[#5F6B73]">lädt …</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[#5F6B73]">Keine Bilder.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((it) => (
            <div key={it.path} className="bg-white rounded-2xl border border-[#E5F4F5] overflow-hidden">
              <div className="aspect-square bg-[#F8FEFF] overflow-hidden">
                <img src={it.url} alt={it.name} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  {it.inUse ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#256E45] bg-[#DFF1E5] px-2 py-0.5 rounded-full">
                      <Lock size={11} strokeWidth={2} /> in Verwendung
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-[#5C6B69] bg-[#E9EDEC] px-2 py-0.5 rounded-full">ungenutzt</span>
                  )}
                  <button onClick={() => del(it)} disabled={it.inUse || busy === it.path}
                    aria-label="Bild löschen"
                    title={it.inUse ? "Wird verwendet — geschützt" : "Löschen"}
                    className="text-[#d7120a] disabled:text-[#c9cccb] disabled:cursor-not-allowed hover:bg-[#fdeceb] rounded-full p-1.5 transition-colors">
                    <Trash2 size={15} strokeWidth={1.7} />
                  </button>
                </div>
                <p className="text-[11px] text-[#5F6B73] truncate" title={it.name}>{it.name}</p>
                <p className="text-[11px] text-[#5F6B73]">{fmtSize(it.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
