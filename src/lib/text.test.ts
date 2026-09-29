// node --test "src/lib/text.test.ts"
import { test } from "node:test";
import assert from "node:assert/strict";
import { jsonLd, plainText } from "./text.ts";

test("jsonLd: ein </script> im Inhalt kann das Skript-Tag nicht beenden", () => {
  const out = jsonLd({ text: "</script><script>alert(1)</script>" });
  assert.ok(!out.includes("<"), "kein rohes < im Ergebnis");
  assert.ok(out.includes("\\u003c/script>"));
  // bleibt gueltiges JSON mit identischem Inhalt
  assert.deepEqual(JSON.parse(out), { text: "</script><script>alert(1)</script>" });
});

test("jsonLd: U+2028/U+2029 werden maskiert", () => {
  const out = jsonLd({ a: "x\u2028y\u2029z" });
  assert.ok(!out.includes("\u2028") && !out.includes("\u2029"));
  assert.deepEqual(JSON.parse(out), { a: "x\u2028y\u2029z" });
});

test("plainText: Tags weg, Entitaeten dekodiert, Leerraum normalisiert", () => {
  assert.equal(plainText("<strong>Hameln</strong> &amp; Paderborn"), "Hameln & Paderborn");
  assert.equal(plainText("a<br>b<br/>c"), "a b c");
  assert.equal(plainText("&quot;x&quot; &#39;y&#39; &lt;z&gt;"), "\"x\" 'y' <z>");
  assert.equal(plainText("S&#252;ntelhang &#xDF;"), "Süntelhang ß");
  assert.equal(plainText("  viel \n  Leerraum  "), "viel Leerraum");
  assert.equal(plainText(undefined), "");
  assert.equal(plainText(null), "");
});

test("plainText: &amp; wird zuletzt dekodiert (keine Doppel-Dekodierung)", () => {
  assert.equal(plainText("&amp;lt;b&amp;gt;"), "&lt;b&gt;");
});

test("plainText: ungueltige Codepoints werfen nicht", () => {
  assert.doesNotThrow(() => plainText("&#9999999;&#x110000;"));
  assert.equal(plainText("a&#9999999;b"), "ab");
});

test("plainText + jsonLd zusammen: dekodiertes </script> bleibt harmlos", () => {
  // So kommt ein boeswilliger Editor-Wert serverseitig sanitisiert zurueck …
  const override = "&lt;/script&gt;&lt;img src=x onerror=alert(1)&gt;";
  const txt = plainText(override); // … und wird hier wieder zu echtem "<"
  assert.equal(txt, "</script><img src=x onerror=alert(1)>");
  assert.ok(!jsonLd({ answer: txt }).includes("<"));
});
