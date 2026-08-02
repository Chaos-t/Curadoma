import test from "node:test";
import assert from "node:assert/strict";
import { luminance, remapColor, recolorSvg, THRESHOLD } from "./karte-recolor.mjs";

test("luminance gewichtet Grün am stärksten", () => {
  assert.ok(luminance(0, 255, 0) > luminance(255, 0, 0));
  assert.equal(luminance(0, 0, 0), 0);
  assert.equal(Math.round(luminance(255, 255, 255)), 255);
});

test("helle Markenfarben bleiben unangetastet", () => {
  // Diese vier tragen die Zeichnung und dürfen sich nicht verändern.
  assert.deepEqual(remapColor(168, 220, 211), [168, 220, 211]); // #A8DCD3, 1206x
  assert.deepEqual(remapColor(111, 211, 209), [111, 211, 209]); // #6FD3D1, 115x
  assert.deepEqual(remapColor(191, 234, 242), [191, 234, 242]); // #BFEAF2, 98x
  assert.deepEqual(remapColor(248, 254, 255), [248, 254, 255]); // #F8FEFF, 58x
});

test("dunkle Baumkonturen werden deutlich aufgehellt", () => {
  for (const [r, g, b] of [[83, 109, 103], [65, 91, 86], [92, 119, 113], [86, 88, 86]]) {
    const out = remapColor(r, g, b);
    assert.ok(luminance(...out) > luminance(r, g, b) + 60,
      `rgb(${r},${g},${b}) wurde nicht ausreichend aufgehellt: ${out}`);
    assert.ok(out.every((v) => v >= 0 && v <= 255), "Kanal außerhalb 0..255");
  }
});

test("die Schwelle ist die Entscheidungsgrenze", () => {
  const dunkel = [40, 40, 40];
  const hell = [230, 240, 240];
  assert.ok(luminance(...dunkel) < THRESHOLD);
  assert.ok(luminance(...hell) >= THRESHOLD);
  assert.notDeepEqual(remapColor(...dunkel), dunkel);
  assert.deepEqual(remapColor(...hell), hell);
});

test("recolorSvg ersetzt nur rgb()-Angaben und lässt den Rest in Ruhe", () => {
  const vorher = '<path fill="rgb(65,91,86)" d="M0,0"/><stop stop-color="rgb(168,220,211)"/>';
  const nachher = recolorSvg(vorher);
  assert.ok(nachher.includes('rgb(168,220,211)'), "helle Farbe wurde verändert");
  assert.ok(!nachher.includes('rgb(65,91,86)'), "dunkle Farbe wurde nicht ersetzt");
  assert.ok(nachher.includes('d="M0,0"'), "Pfaddaten wurden angefasst");
});

test("recolorSvg verträgt Leerzeichen in rgb()", () => {
  assert.ok(!recolorSvg('rgb(65, 91, 86)').includes("65, 91, 86"));
});
