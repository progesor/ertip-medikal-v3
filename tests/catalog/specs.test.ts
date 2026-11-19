import test from "node:test";
import assert from "node:assert/strict";
import { selectCatalogSpecs } from "../../src/lib/catalog/specs";
test("compact pages prioritize actual sizes and technical choices over generic manufacturer rows", () => {
  const specs = [
    { key: "Üretim", value: "Türkiye" },
    { key: "Ürün tipi", value: "Punch" },
    { key: "Çaplar", value: "0.6 / 0.7 / 0.8 mm" },
    { key: "Uzunluklar", value: "3 / 4 mm" },
  ];
  assert.deepEqual(
    selectCatalogSpecs(specs, 2).map((s) => s.key),
    ["Çaplar", "Uzunluklar"],
  );
  assert.deepEqual(selectCatalogSpecs(specs, Infinity), specs);
});
