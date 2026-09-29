import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_TYPES, isAdminType, prefixFor, keyFor, isUuid,
  ADMIN_STATUSES, isAdminStatus, sanitizeNote, yesNo, csvCell, buildCsv, CSV_COLUMNS,
  validateZones, isZoneKey, validatePages, validateBlocks, safeHref, validateSeo,
} from "./admin_util.ts";

test("type guard + prefixes + key", () => {
  assert.deepEqual(ADMIN_TYPES, ["contact", "job", "appointment"]);
  assert.ok(isAdminType("contact"));
  assert.ok(!isAdminType("evil"));
  assert.ok(!isAdminType(123));
  assert.equal(prefixFor("job"), "job_application:");
  assert.equal(keyFor("appointment", "abc"), "appointment:abc");
});

test("uuid validation", () => {
  assert.ok(isUuid("123e4567-e89b-12d3-a456-426614174000"));
  assert.ok(!isUuid("123e4567"));
  assert.ok(!isUuid("../../secret"));
  assert.ok(!isUuid(undefined));
});

test("admin status enum", () => {
  assert.deepEqual([...ADMIN_STATUSES], ["neu", "in_bearbeitung", "erledigt"]);
  assert.ok(isAdminStatus("erledigt"));
  assert.ok(!isAdminStatus("gelöscht"));
  assert.ok(!isAdminStatus(5));
});

test("sanitizeNote passes text through and caps length (no HTML-escape)", () => {
  // Stored plain — escaping happens on output (React/textarea/CSV), so a
  // re-save must not double-mangle <, & or ".
  assert.equal(sanitizeNote('Preis < 100 € "netto" & MwSt'), 'Preis < 100 € "netto" & MwSt');
  assert.equal(sanitizeNote("x".repeat(3000)).length, 2000);
  assert.equal(sanitizeNote(null), "");
  assert.equal(sanitizeNote(undefined), "");
});

test("csvCell guards formula injection and quotes", () => {
  assert.equal(csvCell("=SUM(A1)"), "'=SUM(A1)");
  assert.equal(csvCell("+49 5151"), "'+49 5151");
  assert.equal(csvCell("-1"), "'-1");
  assert.equal(csvCell("@x"), "'@x");
  assert.equal(csvCell("normal"), "normal");
  assert.equal(csvCell('a,"b"\nc'), '"a,""b""\nc"');
  assert.equal(csvCell(null), "");
});

test("buildCsv joins with CRLF and escapes", () => {
  const out = buildCsv(["A", "B"], [["1", "=2"], ["x,y", "z"]]);
  assert.equal(out, 'A,B\r\n1,\'=2\r\n"x,y",z');
});

test("yesNo + column specs", () => {
  assert.equal(yesNo(true), "Ja");
  assert.equal(yesNo(false), "Nein");
  assert.ok(CSV_COLUMNS.contact.length > 0);
  assert.ok(CSV_COLUMNS.job.some(([h]) => h === "Lebenslauf"));
  assert.ok(!JSON.stringify(CSV_COLUMNS.appointment).includes("token"));
});

test("validateZones accepts good structure and rejects bad", () => {
  const ok = validateZones({ "leistungen.services": ["0", "1", "x1a"] });
  assert.ok(ok.ok);
  if (ok.ok) assert.equal(ok.zones["leistungen.services"].length, 3);
  assert.ok(!validateZones("nope").ok);
  assert.ok(!validateZones(["0"]).ok);
  assert.ok(!validateZones({ "BAD ID!": ["0"] }).ok);       // bad zone id
  assert.ok(!validateZones({ z: "notarray" }).ok);          // bad value
  assert.ok(!validateZones({ z: ["ok", "no key!"] }).ok);   // bad key
  assert.ok(!validateZones({ z: ["a", "a"] }).ok);          // duplicate
});

test("isZoneKey", () => {
  assert.ok(isZoneKey("x1a2b3"));
  assert.ok(!isZoneKey("../x"));
  assert.ok(!isZoneKey("UPPER"));
  assert.ok(!isZoneKey(5));
});

test("safeHref allows safe targets, blocks dangerous ones", () => {
  assert.ok(safeHref("https://x.de/a?b=1&c=2"));
  assert.ok(safeHref("mailto:a@b.de"));
  assert.ok(safeHref("tel:+49123"));
  assert.ok(safeHref("/kontakt"));
  assert.ok(safeHref("#anker"));
  assert.ok(!safeHref("javascript:alert(1)"));
  assert.ok(!safeHref("//evil.com"));
  assert.ok(!safeHref("ftp://x"));
});

test("validateBlocks accepts typed blocks (card/title/quote/divider) + align, coerces bad hrefs", () => {
  const ok = validateBlocks({ "page.x.blocks": [
    { k: "a1", t: "text", align: "center" },
    { k: "b2", t: "button", href: "https://x.de?a=1&b=2", align: "right" },
    { k: "c3", t: "button", href: "javascript:alert(1)" },
    { k: "d4", t: "image" },
    { k: "e5", t: "card" },
    { k: "f6", t: "title", align: "left" },   // left = Default -> nicht gespeichert
    { k: "g7", t: "quote" },
    { k: "h8", t: "divider" },
    { k: "i9", t: "text", align: "middle" },  // ungültige Ausrichtung -> ignoriert
  ] });
  assert.ok(ok.ok);
  if (ok.ok) {
    const arr = ok.blocks["page.x.blocks"];
    assert.equal(arr[0].align, "center");
    assert.equal(arr[1].href, "https://x.de?a=1&b=2"); // gültig, nicht escaped
    assert.equal(arr[1].align, "right");
    assert.equal(arr[2].href, "#");                     // gefährlich -> No-op
    assert.equal(arr[4].t, "card");
    assert.equal(arr[5].align, undefined);              // left nicht gespeichert
    assert.equal(arr[7].t, "divider");
    assert.equal(arr[8].align, undefined);              // "middle" verworfen
  }
  assert.ok(!validateBlocks("nope").ok);
  assert.ok(!validateBlocks({ "BAD ID": [] }).ok);
  assert.ok(!validateBlocks({ "a": [{ k: "x", t: "video" }] }).ok);  // bad type
  assert.ok(!validateBlocks({ "a": [{ k: "UP", t: "text" }] }).ok);  // bad key
  assert.ok(!validateBlocks({ "a": [{ k: "x", t: "text" }, { k: "x", t: "image" }] }).ok); // dup
});

test("validateZones accepts long nested list-zone ids (card bullets) but caps at 120", () => {
  const slug = "a".repeat(40);                                   // max slug length
  const key = "b".repeat(16);                                    // max zone key
  const nested = `page.${slug}.blocks.${key}.bullets`;           // ~77 chars
  assert.ok(nested.length <= 120);
  assert.ok(validateZones({ [nested]: ["0", "1"] }).ok);
  const tooLong = "z".repeat(121);
  assert.ok(!validateZones({ [tooLong]: ["0"] }).ok);
});

test("validateSeo: plain-text caps, safe image, key regex, empty-drop", () => {
  const ok = validateSeo({
    "/": { title: "Start <b>x</b>", description: "Hallo   Welt", image: "https://x.de/og.png" },
    "/leistungen": { title: "  Leistungen  " },
    "/ueber-uns": { image: "javascript:alert(1)" },   // böses Bild -> verworfen -> Eintrag leer -> weg
    "/leer": {},                                        // leer -> weg
  });
  assert.ok(ok.ok);
  if (ok.ok) {
    assert.equal(ok.seo["/"].title, "Start x");        // Tags entfernt
    assert.equal(ok.seo["/"].description, "Hallo Welt"); // Whitespace geglättet
    assert.equal(ok.seo["/"].image, "https://x.de/og.png");
    assert.equal(ok.seo["/leistungen"].title, "Leistungen");
    assert.ok(!("/ueber-uns" in ok.seo));               // nur böses Bild -> Eintrag entfällt
    assert.ok(!("/leer" in ok.seo));
  }
  assert.ok(!validateSeo("nope").ok);
  assert.ok(!validateSeo({ "kein-slash": { title: "x" } }).ok);   // bad key
  assert.ok(!validateSeo({ "/UPPER": { title: "x" } }).ok);       // uppercase key
  assert.ok(!validateSeo({ "/x": "notobj" }).ok);                 // bad entry
});

test("validatePages accepts good pages and rejects bad/reserved/dupes", () => {
  const ok = validatePages([{ slug: "ueber-uns", label: "Über uns", inMenu: true }]);
  assert.ok(ok.ok);
  if (ok.ok) { assert.equal(ok.pages[0].slug, "ueber-uns"); assert.equal(ok.pages[0].inMenu, true); }
  assert.ok(!validatePages("nope").ok);
  assert.ok(!validatePages([{ slug: "Admin", label: "x", inMenu: false }]).ok);      // uppercase -> bad slug
  assert.ok(!validatePages([{ slug: "kontakt", label: "x", inMenu: false }]).ok);    // reserved
  assert.ok(!validatePages([{ slug: "standort-hameln", label: "x", inMenu: false }]).ok);    // reserved (Standortseite)
  assert.ok(!validatePages([{ slug: "standort-paderborn", label: "x", inMenu: false }]).ok); // reserved (Standortseite)
  assert.ok(!validatePages([{ slug: "../evil", label: "x", inMenu: false }]).ok);    // traversal
  assert.ok(!validatePages([{ slug: "ok-slug", label: "", inMenu: false }]).ok);     // empty label
  assert.ok(!validatePages([{ slug: "a", label: "x" }, { slug: "a", label: "y" }]).ok); // dup
});
