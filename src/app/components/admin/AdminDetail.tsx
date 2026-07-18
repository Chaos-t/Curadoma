import { useEffect, useRef, useState } from "react";
import { X, Mail, Phone, Download, Archive, Trash2 } from "lucide-react";
import { useAdmin, adminErrorText, type AdminType } from "../../../lib/admin";
import { TYPE_META, STATUS_LABELS, fmtDate } from "./fields";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const STATUSES = ["neu", "in_bearbeitung", "erledigt"] as const;

export function AdminDetail({ type, record, onClose, onChanged, onDeleted }: {
  type: AdminType;
  record: any;
  onClose: () => void;
  onChanged: (updated: any) => void;
  onDeleted: (id: string) => void;
}) {
  const { update, remove, cvUrl } = useAdmin();
  const meta = TYPE_META[type];
  const [note, setNote] = useState<string>(record.admin_note ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Modal-Fokus: beim Öffnen Fokus ins Panel, Tab innerhalb einfangen, Esc
  // schließt, beim Schließen Fokus auf den Auslöser zurückgeben (WCAG 2.4.3).
  useEffect(() => {
    const prevFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const f = panel.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])',
      );
      if (f.length === 0) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); prevFocused?.focus?.(); };
  }, [onClose]);

  const patch = async (p: any, tag: string) => {
    setBusy(tag); setErr(null);
    try { onChanged(await update(type, record.id, p)); }
    catch (e) { setErr(adminErrorText(e)); }
    finally { setBusy(null); }
  };

  const del = async () => {
    if (!confirm("Diesen Eintrag endgültig löschen? Das kann nicht rückgängig gemacht werden.")) return;
    setBusy("del"); setErr(null);
    try { await remove(type, record.id); onDeleted(record.id); }
    catch (e) { setErr(adminErrorText(e)); setBusy(null); }
  };

  const downloadCv = async () => {
    setBusy("cv"); setErr(null);
    try {
      const url = await cvUrl(record.id);
      if (url) window.open(url, "_blank", "noopener");
      else setErr("Kein Lebenslauf vorhanden.");
    } catch {
      setErr("Lebenslauf konnte nicht geladen werden.");
    } finally {
      setBusy(null);
    }
  };

  const st = record.admin_status ?? "neu";

  return (
    <div className="fixed inset-0 z-[120] flex" style={jakarta}>
      <div className="flex-1 bg-black/30" onClick={onClose} aria-hidden="true" />
      <div ref={panelRef} className="w-full max-w-md bg-white h-dvh overflow-y-auto shadow-[-20px_0_60px_rgb(0,0,0,0.18)] p-6"
        role="dialog" aria-modal="true" aria-label={`${meta.singular} · Detail`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium text-[#111111]">{meta.singular} · Detail</h2>
          <button ref={closeBtnRef} onClick={onClose} aria-label="Schließen" className="text-[#5F6B73] hover:text-[#111111]">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Status */}
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wide text-[#5F6B73] mb-2">Status</p>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button key={s} disabled={busy !== null} onClick={() => patch({ admin_status: s }, "st-" + s)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${st === s ? "bg-[#0F7C77] text-white border-[#0F7C77]" : "border-[#E5F4F5] text-[#5F6B73] hover:border-[#6FD3D1]"}`}>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Felder */}
        <dl className="mb-5 space-y-2">
          {meta.detail.map((f) => {
            const raw = record[f.key];
            const v = f.kind === "bool" ? (raw ? "Ja" : "Nein")
              : f.kind === "date" ? fmtDate(raw)
              : raw;
            if (v == null || v === "") return null;
            return (
              <div key={f.key} className="grid grid-cols-[40%_1fr] gap-2">
                <dt className="text-sm text-[#5F6B73]">{f.label}</dt>
                <dd className={`text-sm text-[#111111] break-words ${f.kind === "long" ? "whitespace-pre-wrap" : ""}`}>{String(v)}</dd>
              </div>
            );
          })}
        </dl>

        {/* Kontakt-Schnellaktionen */}
        <div className="flex flex-wrap gap-2 mb-5">
          {record.email && (
            <a href={`mailto:${record.email}`}
              className="inline-flex items-center gap-1.5 text-sm text-[#0F7C77] border border-[#0F7C77] px-3 py-1.5 rounded-full hover:bg-[#0F7C77] hover:text-white transition-colors">
              <Mail size={15} strokeWidth={1.5} /> Antworten
            </a>
          )}
          {record.phone && (
            <a href={`tel:${String(record.phone).replace(/[^\d+]/g, "")}`}
              className="inline-flex items-center gap-1.5 text-sm text-[#0F7C77] border border-[#0F7C77] px-3 py-1.5 rounded-full hover:bg-[#0F7C77] hover:text-white transition-colors">
              <Phone size={15} strokeWidth={1.5} /> Anrufen
            </a>
          )}
          {type === "job" && record.cv_path && (
            <button onClick={downloadCv} disabled={busy === "cv"}
              className="inline-flex items-center gap-1.5 text-sm text-[#0F7C77] border border-[#0F7C77] px-3 py-1.5 rounded-full hover:bg-[#0F7C77] hover:text-white transition-colors disabled:opacity-50">
              <Download size={15} strokeWidth={1.5} /> {busy === "cv" ? "…" : "Lebenslauf"}
            </button>
          )}
        </div>

        {/* Interne Notiz (Klartext; React/Textarea escapen bei der Ausgabe) */}
        <div className="mb-5">
          <p className="text-xs uppercase tracking-wide text-[#5F6B73] mb-2">Interne Notiz</p>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={2000}
            aria-label="Interne Notiz"
            className="w-full px-3 py-2 rounded-xl border border-[#E5F4F5] bg-[#F8FEFF] text-sm outline-none focus:border-[#6FD3D1]" />
          <button onClick={() => patch({ admin_note: note }, "note")} disabled={busy !== null}
            className="mt-2 text-sm bg-[#0F7C77] text-white px-4 py-1.5 rounded-full hover:bg-[#0c6a66] disabled:opacity-50">
            {busy === "note" ? "…" : "Notiz speichern"}
          </button>
        </div>

        {err && <p className="text-sm text-[#d7120a] mb-3" role="alert">{err}</p>}

        {/* Archiv + Löschen */}
        <div className="flex items-center gap-2 pt-4 border-t border-[#E5F4F5]">
          <button onClick={() => patch({ admin_archived: !record.admin_archived }, "arch")} disabled={busy !== null}
            className="inline-flex items-center gap-1.5 text-sm text-[#5F6B73] border border-[#E5F4F5] px-3 py-1.5 rounded-full hover:border-[#6FD3D1] disabled:opacity-50">
            <Archive size={15} strokeWidth={1.5} /> {record.admin_archived ? "Aus Archiv holen" : "Archivieren"}
          </button>
          <button onClick={del} disabled={busy !== null}
            className="inline-flex items-center gap-1.5 text-sm text-[#d7120a] border border-[#f3c2bf] px-3 py-1.5 rounded-full hover:bg-[#fdeceb] ml-auto disabled:opacity-50">
            <Trash2 size={15} strokeWidth={1.5} /> {busy === "del" ? "…" : "Löschen"}
          </button>
        </div>
      </div>
    </div>
  );
}
