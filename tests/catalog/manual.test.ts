import assert from "node:assert/strict";
import test from "node:test";
import { catalogIdentity } from "../../src/lib/catalog/identity";
import { catalogPageSchema } from "../../src/lib/catalog/schema";
import {
  moveCatalogProducts,
  splitCatalogPage,
  mergeCatalogPage,
  pagesFromPreview,
} from "../../src/lib/catalog/pageEditing";
const pages = [
  catalogPageSchema.parse({
    id: "a",
    productIds: [1, 2, 3],
    accent: "#123456",
    imageScale: 80,
  }),
  catalogPageSchema.parse({ id: "b", productIds: [4] }),
];
test("catalog shows a full first active variant code without inventing a base SKU", () => {
  assert.deepEqual(
    catalogIdentity(
      {
        skuPrefix: "E20",
        variants: [
          { title: "off", sku: "OFF", isActive: false },
          { title: "blank", sku: " " },
          { title: "first", sku: " E20.04.40 " },
          { title: "next", sku: "E20.05.45" },
        ],
      },
      "tr",
    ),
    { sku: "E20.04.40", skuLabel: "Örnek varyant kodu" },
  );
  assert.equal(
    catalogIdentity({ skuPrefix: "E20", variants: [] }, "tr").sku,
    "",
  );
});
test("bulk moving preserves order, unique placement, and rejects dividers", () => {
  const next = moveCatalogProducts(pages, [2, 3, 2], "b");
  assert.deepEqual(
    next.map((p) => p.productIds),
    [[1], [4, 2, 3]],
  );
  assert.deepEqual(pages[0].productIds, [1, 2, 3]);
  assert.equal(moveCatalogProducts(pages, [1], "missing"), pages);
});
test("split and merge preserve every product and page appearance", () => {
  const split = splitCatalogPage(pages, "a", [2, 3, 999], "new");
  assert.deepEqual(
    split.map((p) => p.productIds),
    [[1], [2, 3], [4]],
  );
  assert.equal(split[1].accent, "#123456");
  assert.equal(split[1].imageScale, 80);
  assert.deepEqual(mergeCatalogPage(split, "a"), pages);
  assert.equal(splitCatalogPage(pages, "a", [1, 2, 3], "new"), pages);
  const divider = catalogPageSchema.parse({ id: "d", kind: "divider" });
  const withDivider = [pages[0], divider, pages[1]];
  assert.equal(mergeCatalogPage(withDivider, "a"), withDivider);
});
test("freezing measured pages excludes covers and does not duplicate continuation products", () => {
  const frozen = pagesFromPreview(pages, [
    { id: "cover", title: "Cover", kind: "cover", page: 1, productIds: [] },
    {
      id: "a",
      title: "",
      kind: "products",
      page: 2,
      productIds: [1, 2],
      layout: "rows",
    },
    {
      id: "a",
      title: "",
      kind: "products",
      page: 3,
      productIds: [2, 3],
      layout: "spotlight",
    },
    { id: "b", title: "", kind: "products", page: 4, productIds: [4] },
  ]);
  assert.deepEqual(
    frozen.map((p) => p.productIds),
    [[1, 2], [3], [4]],
  );
  assert.equal(frozen[0].layout, "rows");
  assert.equal(new Set(frozen.map((p) => p.id)).size, 3);
});
test("page-specific appearance is bounded and older pages retain inherited settings", () => {
  assert.equal(catalogPageSchema.parse({ id: "old" }).imageScale, undefined);
  assert.equal(
    catalogPageSchema.safeParse({ id: "bad", accent: "red;display:none" })
      .success,
    false,
  );
  assert.equal(
    catalogPageSchema.safeParse({ id: "bad", imageScale: 120 }).success,
    false,
  );
});
