import assert from "node:assert/strict";
import test from "node:test";
import { getVariantSelection } from "../../src/lib/sku-engine/storefrontSelection";

const axes = [
  { id: "d", name: "Çap", values: ["0.70", "0.75", "1.00"] },
  { id: "l", name: "Uzunluk", values: ["2.5", "3", "3.5", "5"] },
];

test("resolves each measurement in its own axis, including decimals and trailing zeroes", () => {
  for (const [diameter, option] of [["0.7", "0.70"], ["0,75", "0.75"], ["1", "1.00"]]) {
    for (const length of axes[1].values) {
      assert.deepEqual(getVariantSelection(axes, { title: `${diameter} mm Çap - ${length} mm Uzunluk` }),
        { Çap: option, Uzunluk: length });
    }
  }
  assert.deepEqual(getVariantSelection(axes, { title: "0.75 mm Çap - 15 mm Uzunluk" }), { Çap: "0.75" });
});

test("resolves renamed and reordered attributes by their stored identity", () => {
  assert.deepEqual(getVariantSelection(axes, {
    title: "Özel model",
    combinationKey: JSON.stringify([["id:l", "5"], ["id:d", "0.7"]]),
  }), { Çap: "0.70", Uzunluk: "5" });
});

test("recognizes the option in older free-text single-attribute titles", () => {
  assert.deepEqual(getVariantSelection([{ name: "Çap", values: ["0.7 mm", "0.75 mm"] }],
    { title: "Varyant Ürün Kodu 0.75 mm – Yeşil" }), { Çap: "0.75 mm" });
});
