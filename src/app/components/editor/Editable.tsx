import { createElement, useRef, type ReactNode } from "react";
import { useContent } from "../../../lib/content";

type Tag = keyof JSX.IntrinsicElements;
export function Editable({ id, children, as = "span", rich = false, className, style }: {
  id: string; children: ReactNode; as?: Tag; rich?: boolean; className?: string; style?: React.CSSProperties;
}) {
  const { get, getStored, editMode, setPending } = useContent();
  const override = get(id);
  // Seed nur einmal bei aktivem Edit-Modus erfassen; bei Verlassen zurücksetzen.
  // Seed kommt aus dem GESPEICHERTEN (server-sanitisierten) Wert, nie aus dem
  // ungespeicherten `pending` — so kann kein roh getipptes innerHTML einen
  // dangerouslySetInnerHTML seed füllen.
  const seed = useRef<ReactNode | undefined>(undefined);
  if (editMode) {
    if (seed.current === undefined) {
      const stored = getStored(id);
      seed.current = stored != null
        ? (rich ? <span dangerouslySetInnerHTML={{ __html: stored }} /> : stored)
        : children;
    }
  } else {
    seed.current = undefined;
  }

  if (!editMode) {
    if (override != null) {
      return rich
        ? createElement(as, { className, style, dangerouslySetInnerHTML: { __html: override } })
        : createElement(as, { className, style }, override);
    }
    return createElement(as, { className, style }, children);
  }

  const editClass = `${className ?? ""} outline outline-1 outline-dashed outline-[#d7120a] outline-offset-2 rounded-sm cursor-text focus:outline-2 focus:outline-solid`.trim();
  const onInput = (e: React.FormEvent<HTMLElement>) => {
    const el = e.currentTarget;
    setPending(id, rich ? el.innerHTML : (el.innerText ?? ""), rich);
  };
  // Im Edit-Modus Klicks NICHT navigieren lassen: viele editierbare Labels
  // liegen in <Link>/<a> (Nav, CTAs, Footer-Kontakt) — ohne preventDefault
  // würde ein Klick zum Bearbeiten die Route öffnen. Der Cursor wird bereits
  // bei mousedown gesetzt, preventDefault auf click stört das nicht.
  const onClick = (e: React.MouseEvent<HTMLElement>) => e.preventDefault();
  return createElement(
    as,
    { "data-ed-id": id, contentEditable: true, suppressContentEditableWarning: true, className: editClass, style, onInput, onClick, title: id },
    seed.current,
  );
}
