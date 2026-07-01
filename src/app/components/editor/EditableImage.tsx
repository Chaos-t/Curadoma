import { useRef } from "react";
import { useContent } from "../../../lib/content";

export function EditableImage({ id, src, alt = "", altId, className, ...img }: {
  id: string; src: string; alt?: string; altId?: string; className?: string;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  const { get, editMode, uploadImage } = useContent();
  const url = get(id) ?? src;
  const altVal = altId ? (get(altId) ?? alt) : alt;
  const inputRef = useRef<HTMLInputElement>(null);
  if (!editMode) return <img src={url} alt={altVal} className={className} {...img} />;
  return (
    <>
      <img src={url} alt={altVal} title="Klicken, um Bild zu ersetzen"
        role="button" tabIndex={0} aria-label="Bild ersetzen"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
        className={`${className ?? ""} outline outline-2 outline-dashed outline-[#d7120a] outline-offset-2 cursor-pointer`} {...img} />
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden
        onChange={async (e) => { const f = e.target.files?.[0]; if (f) await uploadImage(id, f); e.currentTarget.value = ""; }} />
    </>
  );
}
