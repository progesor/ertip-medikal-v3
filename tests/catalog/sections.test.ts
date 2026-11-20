import assert from "node:assert/strict";
import test from "node:test";
import { catalogPageSchema } from "../../src/lib/catalog/schema";
import {
  mergeCatalogPage,
  splitCatalogPage,
  pagesFromPreview,
} from "../../src/lib/catalog/pageEditing";
import {
  pageSections,
  setPageSections,
  moveProductsToSection,
} from "../../src/lib/catalog/sections";
const a = catalogPageSchema.parse({
  id: "sapphire",
  title: "Safir ve Bıçak Tutucular",
  density: "2",
  productIds: [1, 2],
});
const b = catalogPageSchema.parse({
  id: "dhi",
  title: "DHI",
  density: "2",
  productIds: [3, 4],
});
test("merging small categories preserves both headings and fits a four-product plan", () => {
  const [page] = mergeCatalogPage([a, b], a.id);
  assert.equal(page.density, "4");
  assert.deepEqual(
    pageSections(page).map((s) => [s.title, s.productIds]),
    [
      [a.title, [1, 2]],
      [b.title, [3, 4]],
    ],
  );
  assert.deepEqual(page.productIds, [1, 2, 3, 4]);
  assert.equal(a.sections, undefined);
});
test("section reconciliation cannot hide or duplicate members and keeps empty editable groups", () => {
  const page = catalogPageSchema.parse({
    ...a,
    productIds: [1, 2, 3],
    sections: [
      { id: "x", title: "A", productIds: [1, 1, 99] },
      { id: "y", title: "B", productIds: [1, 2] },
      { id: "z", title: "C", productIds: [] },
    ],
  });
  assert.deepEqual(
    pageSections(page).map((s) => s.productIds),
    [[1], [2], [3]],
  );
});
test("moving products between modules and pages preserves unique membership and explicit order", () => {
  const [merged] = mergeCatalogPage([a, b], a.id);
  const sections = pageSections(merged);
  const moved = moveProductsToSection(
    [merged, catalogPageSchema.parse({ id: "pool", productIds: [5] })],
    [2, 5, 5],
    merged.id,
    sections[1].id,
  );
  assert.deepEqual(
    pageSections(moved[0]).map((s) => s.productIds),
    [[1], [3, 4, 2, 5]],
  );
  assert.deepEqual(moved[1].productIds, []);
  assert.equal(
    moveProductsToSection([merged], [2], merged.id, "missing")[0],
    merged,
  );
  const reordered = setPageSections(merged, [sections[1], sections[0]]);
  assert.deepEqual(reordered.productIds, [3, 4, 1, 2]);
});
test("split and measured-page freeze retain matching category headings", () => {
  const [merged] = mergeCatalogPage([a, b], a.id);
  const split = splitCatalogPage([merged], merged.id, [2, 3, 4], "new");
  assert.deepEqual(
    pageSections(split[0]).map((s) => s.productIds),
    [[1]],
  );
  assert.deepEqual(
    pageSections(split[1]).map((s) => s.productIds),
    [[2], [3, 4]],
  );
  const frozen = pagesFromPreview(
    [merged],
    [
      {
        id: merged.id,
        kind: "products",
        page: 2,
        title: merged.title,
        productIds: [3, 4],
      },
    ],
  );
  assert.deepEqual(
    pageSections(frozen[0])
      .filter((s) => s.productIds.length)
      .map((s) => s.title),
    ["DHI"],
  );
});
test("section schema rejects duplicate IDs, oversized columns and injectable styles", () => {
  for (const sections of [
    [{ id: "x" }, { id: "x" }],
    [{ id: "x", columns: 4 }],
    [{ id: "x", layout: "grid;display:none" }],
  ]) {
    assert.equal(
      catalogPageSchema.safeParse({ id: "p", sections }).success,
      false,
    );
  }
});
