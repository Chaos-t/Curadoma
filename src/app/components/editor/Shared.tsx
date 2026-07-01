import { useContent } from "../../../lib/content";
import { Editable } from "./Editable";

// Sichtbarer Telefontext; href wird aus dem Text abgeleitet (0… -> +49…).
function telHref(display: string) {
  const digits = display.replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? `tel:${digits}` : `tel:+49${digits.replace(/^0/, "")}`;
}
export function PhoneText({ id = "shared.tel_display", def = "05151 7107093", className }: { id?: string; def?: string; className?: string }) {
  const { get } = useContent();
  const display = get(id) ?? def;
  return <a href={telHref(display)} className={className}><Editable as="span" id={id}>{def}</Editable></a>;
}
export function EmailText({ id = "shared.email", def = "info@curadoma.de", className }: { id?: string; def?: string; className?: string }) {
  const { get } = useContent();
  const val = get(id) ?? def;
  return <a href={`mailto:${val}`} className={className}><Editable as="span" id={id}>{def}</Editable></a>;
}
export function HoursText({ withSuffix = true, className }: { withSuffix?: boolean; className?: string }) {
  return <span className={className}><Editable as="span" id="shared.hours">Mo–Fr: 8:00 – 17:00</Editable>{withSuffix ? " Uhr" : ""}</span>;
}
// Adresse strukturiert; `variant` steuert das Rendering (br / inline / inline-country).
export function AddressBlock({ variant = "br", country = false, className }: { variant?: "br" | "inline"; country?: boolean; className?: string }) {
  const street = <Editable as="span" id="shared.address.street">Süntelhang 9</Editable>;
  const zipcity = <><Editable as="span" id="shared.address.zip">31787</Editable> <Editable as="span" id="shared.address.city">Hameln</Editable></>;
  const land = country ? <Editable as="span" id="shared.address.country">Deutschland</Editable> : null;
  if (variant === "inline") return <span className={className}>{street}, {zipcity}{land ? <>, {land}</> : null}</span>;
  return <span className={className}>{street}<br />{zipcity}{land ? <><br />{land}</> : null}</span>;
}
