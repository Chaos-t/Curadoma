import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_TYPES, isAdminType, prefixFor, keyFor, isUuid,
  ADMIN_STATUSES, isAdminStatus, sanitizeNote, yesNo, csvCell, buildCsv, CSV_COLUMNS,
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
