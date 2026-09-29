import { useContent } from "../../../lib/content";
import { LOCATIONS, oneLineAddress, mapsLinks, type LocationKey } from "../../../lib/locations";
import { plainText } from "../../../lib/text";
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

/** Die aktuelle (ggf. im Editor geaenderte) Adresse eines Standorts als
 *  Klartext, plus daraus ABGELEITETE Maps-Links. Nie eine Adresse und ihren
 *  Link getrennt hartcodieren — genau das verhindert dieser Hook. */
export function useAddress(location: LocationKey = "hameln") {
  const { get } = useContent();
  const L = LOCATIONS[location];
  const street = plainText(get(`${L.addressId}.street`)) || L.street;
  const zip = plainText(get(`${L.addressId}.zip`)) || L.zip;
  const city = plainText(get(`${L.addressId}.city`)) || L.city;
  const line = oneLineAddress({ street, zip, city });
  return { street, zip, city, line, maps: mapsLinks(line) };
}

// Adresse strukturiert; `variant` steuert das Rendering (br / inline).
// `location` waehlt den Standort — Standard bleibt Hameln, damit alle
// bestehenden Aufrufe (Footer, Impressum, Datenschutz) unveraendert bleiben.
export function AddressBlock({ variant = "br", country = false, className, location = "hameln" }: {
  variant?: "br" | "inline"; country?: boolean; className?: string; location?: LocationKey;
}) {
  const L = LOCATIONS[location];
  const street = <Editable as="span" id={`${L.addressId}.street`}>{L.street}</Editable>;
  const zipcity = <><Editable as="span" id={`${L.addressId}.zip`}>{L.zip}</Editable> <Editable as="span" id={`${L.addressId}.city`}>{L.city}</Editable></>;
  const land = country ? <Editable as="span" id="shared.address.country">Deutschland</Editable> : null;
  if (variant === "inline") return <span className={className}>{street}, {zipcity}{land ? <>, {land}</> : null}</span>;
  return <span className={className}>{street}<br />{zipcity}{land ? <><br />{land}</> : null}</span>;
}
