import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Plus, Trash2, Pencil } from "lucide-react";
import { useAdmin, adminErrorText } from "../../../lib/admin";
import { useContent } from "../../../lib/content";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
// Spiegel der Server-Validierung (admin_util.validatePages) — Defense in depth.
const SLUG_RE = /^[a-z][a-z0-9-]{1,40}$/;
const RESERVED = new Set([
  "leistungen", "entlastung", "demenzbetreuung", "haushaltsnahe-dienstleistungen",
  "verhinderungspflege", "umwandlung-sachleistungen", "einzugsgebiet", "kontakt",
  "impressum", "datenschutz", "karriere", "termin", "termin-status", "admin",
  "api", "assets", "src", "index",
]);

function slugify(s: string): string {
  return s.toLowerCase().replace(/ß/g, "ss").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

export function AdminPages() {
  const { pagesList, pagesSave, pw } = useAdmin();
  const { enterEditMode, reloadStructure } = useContent();
  const navigate = useNavigate();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    let alive = true;
    pagesList()
      .then((p) => { if (alive) setPages(p); })
      .catch((e) => { if (alive) setErr(adminErrorText(e)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [pagesList]);

  const persist = async (next: any[]) => {
    setBusy(true); setErr(null);
    try {
      await pagesSave(next);
      setPages(next);
      await reloadStructure(); // ContentProvider (Menü + DynamicPage) sofort synchronisieren
    } catch (e) { setErr(adminErrorText(e)); }
    finally { setBusy(false); }
  };

  // Direkt in den Bearbeitungsmodus auf diese Seite springen (client-seitig,
  // damit der Edit-Modus erhalten bleibt — ein URL-Aufruf würde neu laden).
  const editPage = async (slug: string) => {
    await reloadStructure();
    enterEditMode(pw());
    navigate(`/${slug}`);
  };

  const add = async () => {
    const l = label.trim();
    const s = slug.trim() || slugify(l);
    if (!l) { setErr("Bitte einen Seitentitel eingeben."); return; }
    if (!SLUG_RE.test(s) || RESERVED.has(s)) { setErr(`Ungültiger oder reservierter Pfad „/${s}".`); return; }
    if (pages.some((p) => p.slug === s)) { setErr(`Der Pfad „/${s}" existiert schon.`); return; }
    await persist([...pages, { slug: s, label: l, inMenu: true }]);
    setLabel(""); setSlug("");
  };
  const del = async (s: string) => {
    if (confirm("Diese Seite entfernen? Sie ist danach nicht mehr erreichbar (der eingegebene Inhalt bleibt aber gespeichert).")) {
      await persist(pages.filter((p) => p.slug !== s));
    }
  };
  const toggleMenu = async (s: string) =>
    persist(pages.map((p) => (p.slug === s ? { ...p, inMenu: !p.inMenu } : p)));

  return (
    <section className="max-w-3xl mx-auto px-6 py-10" style={jakarta}>
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-[#5F6B73] hover:text-[#111111] mb-4">
        <ArrowLeft size={16} strokeWidth={1.5} /> Übersicht
      </Link>
      <h1 className="text-2xl font-medium text-[#111111] mb-1">Seiten &amp; Menü</h1>
      <p className="text-sm text-[#5F6B73] mb-6">Eigene Seiten anlegen (z. B. „Über uns", „Team"). Zum Befüllen einfach auf <b className="text-[#0F7C77]">„Bearbeiten"</b> klicken — du landest direkt im Bearbeitungsmodus auf der Seite und kannst dort Text/Button/Bild-Blöcke einfügen.</p>

      {/* Neue Seite */}
      <div className="bg-white rounded-2xl border border-[#E5F4F5] p-5 mb-6">
        <p className="text-sm font-medium text-[#111111] mb-3">Neue Seite</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={label} onChange={(e) => { setLabel(e.target.value); setSlug(slugify(e.target.value)); }}
            placeholder="Titel, z. B. Über uns" aria-label="Seitentitel"
            className="flex-1 px-3 py-2 rounded-xl border border-[#E5F4F5] bg-[#F8FEFF] text-sm outline-none focus:border-[#6FD3D1]" />
          <div className="flex items-center gap-1 text-sm text-[#5F6B73]">
            <span>/</span>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ueber-uns" aria-label="Pfad"
              className="w-32 px-3 py-2 rounded-xl border border-[#E5F4F5] bg-[#F8FEFF] text-sm outline-none focus:border-[#6FD3D1]" />
          </div>
          <button onClick={add} disabled={busy}
            className="inline-flex items-center justify-center gap-2 bg-[#0F7C77] text-white hover:bg-[#0c6a66] disabled:opacity-50 px-4 py-2 rounded-full text-sm font-medium">
            <Plus size={16} strokeWidth={2} /> Anlegen
          </button>
        </div>
      </div>

      {err && <p className="text-sm text-[#d7120a] mb-3" role="alert">{err}</p>}

      {loading ? (
        <p className="text-sm text-[#5F6B73]">lädt …</p>
      ) : pages.length === 0 ? (
        <p className="text-sm text-[#5F6B73]">Noch keine eigenen Seiten.</p>
      ) : (
        <ul className="bg-white rounded-2xl border border-[#E5F4F5] divide-y divide-[#E5F4F5]">
          {pages.map((p) => (
            <li key={p.slug} className="flex items-center gap-3 px-5 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#111111] truncate">{p.label}</p>
                <p className="text-xs text-[#5F6B73]">/{p.slug}</p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-[#5F6B73] cursor-pointer select-none">
                <input type="checkbox" checked={!!p.inMenu} onChange={() => toggleMenu(p.slug)} disabled={busy}
                  className="accent-[#0F7C77]" />
                im Menü
              </label>
              <button onClick={() => editPage(p.slug)} disabled={busy}
                className="inline-flex items-center gap-1.5 text-sm text-[#0F7C77] border border-[#0F7C77] px-3 py-1.5 rounded-full hover:bg-[#0F7C77] hover:text-white transition-colors disabled:opacity-50">
                <Pencil size={14} strokeWidth={1.7} /> Bearbeiten
              </button>
              <button onClick={() => del(p.slug)} disabled={busy} aria-label="Seite entfernen" title="Seite entfernen"
                className="text-[#d7120a] hover:bg-[#fdeceb] rounded-full p-1.5 disabled:opacity-50">
                <Trash2 size={15} strokeWidth={1.7} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
