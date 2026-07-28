import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLegacyPunchSku,
  buildLegacyPunchSkuCode,
  buildLegacyVariantTitle,
  createCombinationKey,
  parseLegacyAttributes,
} from "../../src/lib/sku-engine/legacyPunch";

const attributes = parseLegacyAttributes([
  { name: "Çap", values: "0.6-0.65" },
  { name: "Uzunluk", values: "1.5-20" },
]);

test("parses legacy hyphen-separated attributes", () => {
  assert.deepEqual(attributes, [
    { name: "Çap", values: ["0.6", "0.65"] },
    { name: "Uzunluk", values: ["1.5", "20"] },
  ]);
});

test("keeps the historical decimal-length Punch SKU behavior", () => {
  assert.equal(buildLegacyPunchSkuCode(attributes, ["0.6", "1.5"]), "615");
  assert.equal(buildLegacyPunchSkuCode(attributes, ["0.65", "1.5"]), "6515");
});

test("keeps leading diameter zero when length is an integer", () => {
  assert.equal(buildLegacyPunchSkuCode(attributes, ["0.6", "20"]), "0620");
});

test("keeps fallback concatenation for non-Punch attributes", () => {
  const fallbackAttributes = parseLegacyAttributes([
    { name: "Renk", values: "Mavi" },
    { name: "Model", values: "A.1" },
  ]);
  assert.equal(
    buildLegacyPunchSkuCode(fallbackAttributes, ["Mavi", "A.1"]),
    "MaviA1",
  );
});

test("preserves legacy title, prefix and suffix formatting", () => {
  assert.equal(
    buildLegacyVariantTitle(attributes, ["0.6", "20"]),
    "0.6 mm Çap - 20 mm Uzunluk",
  );
  assert.equal(
    buildLegacyPunchSku(attributes, ["0.6", "20"], "110-", " S-303 "),
    "110-0620 S-303",
  );
});

test("creates a deterministic logical combination key", () => {
  assert.equal(
    createCombinationKey(attributes, ["0.6", "20"]),
    '[["Çap","0.6"],["Uzunluk","20"]]',
  );
});
