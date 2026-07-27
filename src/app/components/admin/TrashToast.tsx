import { useState } from "react";
import { Undo2, X } from "lucide-react";
import { useAdmin, adminErrorText } from "../../../lib/admin";
import { Css } from "../Css";

/**
 * Session-Papierkorb-Toast: zeigt die zuletzt gelöschte Sache mit „Rückgängig".
 * Die Rückgängig-Aktion lebt nur im Speicher — nach Reload/Verlassen ist die
 * Löschung endgültig. Eine neue Löschung ersetzt den Toast.
 */
export function TrashToast() {
  const { trash, clearTrash } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (!trash) return null;

  const undo = async () => {
    setBusy(true); setErr(null);
    try { await trash.undo(); clearTrash(); }
    catch (e) { setErr(adminErrorText(e)); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] w-[min(94vw,460px)] bg-[#111111] text-white rounded-2xl shadow-[0_20px_60px_rgb(0,0,0,0.3)] px-4 py-3 flex items-center gap-3 motion-safe:animate-[curaTrashIn_220ms_ease-out]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} role="status">
      <span className="flex-1 text-sm truncate">
        {err ? <span className="text-[#ff9a94]">{err}</span> : <>{trash.label} <span className="text-white/50">· in dieser Sitzung wiederherstellbar</span></>}
      </span>
      <button onClick={undo} disabled={busy}
        className="inline-flex items-center gap-1.5 shrink-0 text-sm font-medium text-[#6FD3D1] hover:text-white disabled:opacity-50 transition-colors">
        <Undo2 size={15} strokeWidth={1.9} /> {busy ? "…" : "Rückgängig"}
      </button>
      <button onClick={clearTrash} aria-label="Schließen" className="shrink-0 text-white/50 hover:text-white transition-colors">
        <X size={16} strokeWidth={2} />
      </button>
      <Css>{`@keyframes curaTrashIn { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</Css>
    </div>
  );
}
