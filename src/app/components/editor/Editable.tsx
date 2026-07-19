import { createElement, useEffect, useRef, type ReactNode } from "react";
import { useContent } from "../../../lib/content";

type Tag = keyof JSX.IntrinsicElements;
export function Editable({ id, children, as = "span", rich = false, className, style, placeholder }: {
  id: string; children?: ReactNode; as?: Tag; rich?: boolean; className?: string; style?: React.CSSProperties;
  /** Echter Platzhalter: grauer Hinweis (was der Block macht), der NUR im leeren
   *  Zustand erscheint, beim Tippen verschwindet und nie als Inhalt gespeichert
   *  wird. Wenn gesetzt, wird `children` nicht als Startinhalt verwendet. */
  placeholder?: string;
}) {
  const { get, getStored, editMode, setPending, isDirty, registerField } = useContent();
  const override = get(id);
  const elRef = useRef<HTMLElement | null>(null);
  // Seed nur einmal bei aktivem Edit-Modus erfassen; bei Verlassen zurücksetzen.
  // Seed kommt aus dem GESPEICHERTEN (server-sanitisierten) Wert, nie aus dem
  // ungespeicherten `pending` — so kann kein roh getipptes innerHTML einen
  // dangerouslySetInnerHTML seed füllen.
  const seed = useRef<ReactNode | undefined>(undefined);
  if (editMode) {
    if (seed.current === undefined) {
      const stored = getStored(id);
      // Overrides IMMER als (server-sanitisiertes) HTML seeden — auch "plain",
      // da der Server jeden gespeicherten Wert sanitisiert (escapetes HTML).
      seed.current = stored != null
        ? <span dangerouslySetInnerHTML={{ __html: stored }} />
        : children;
    }
  } else {
    seed.current = undefined;
  }

  // Ausgangswert des Feldes einmal registrieren (für die Undo-Rücksetzung).
  useEffect(() => {
    if (editMode && elRef.current) {
      registerField(id, rich ? elRef.current.innerHTML : (elRef.current.textContent ?? ""));
    }
  }, [editMode, id, rich, registerField]);

  if (!editMode) {
    if (override != null) {
      // Overrides sind serverseitig sanitisiert -> immer als HTML rendern (kein
      // Doppel-Escape fuer plain-Werte, kein XSS dank sanitizeRich beim Speichern).
      return createElement(as, { className, style, dangerouslySetInnerHTML: { __html: override } });
    }
    return createElement(as, { className, style }, children);
  }

  // Geänderte (ungespeicherte) Felder heben sich ab: durchgehender türkiser
  // Rahmen + zarte Tönung. Unveränderte Felder tragen den roten gestrichelten
  // „editierbar"-Rahmen.
  const marker = isDirty(id)
    ? "outline outline-2 outline-solid outline-[#0F7C77] bg-[#DFF7F8]"
    : "outline outline-1 outline-dashed outline-[#d7120a]";
  const editClass = `${className ?? ""} ${marker} outline-offset-2 rounded-sm cursor-text focus:outline-2 focus:outline-solid`.trim();
  const onInput = (e: React.FormEvent<HTMLElement>) => {
    const el = e.currentTarget;
    // Platzhalter-Felder: bei komplett geleertem Feld das übrig gebliebene <br>
    // entfernen, damit `:empty` (und damit der Hinweis) wieder greift.
    if (placeholder && (el.innerText ?? "").replace(/​/g, "").trim() === "") {
      if (el.innerHTML !== "") el.innerHTML = "";
      setPending(id, "", rich);
      return;
    }
    setPending(id, rich ? el.innerHTML : (el.innerText ?? ""), rich);
  };
  // Im Edit-Modus Klicks NICHT navigieren lassen: viele editierbare Labels
  // liegen in <Link>/<a> (Nav, CTAs, Footer-Kontakt) — ohne preventDefault
  // würde ein Klick zum Bearbeiten die Route öffnen. Der Cursor wird bereits
  // bei mousedown gesetzt, preventDefault auf click stört das nicht.
  const onClick = (e: React.MouseEvent<HTMLElement>) => e.preventDefault();
  return createElement(
    as,
    { ref: elRef, "data-ed-id": id, "data-ed-rich": rich ? "true" : undefined, "data-ph": placeholder || undefined, contentEditable: true, suppressContentEditableWarning: true, className: editClass, style, onInput, onClick, title: import.meta.env.DEV ? id : "Zum Bearbeiten klicken" },
    seed.current,
  );
}
