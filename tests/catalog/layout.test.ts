import assert from "node:assert/strict";
import test from "node:test";
import {
  catalogConfigSchema,
  defaultCatalogConfig,
  catalogPageSchema,
} from "../../src/lib/catalog/schema";
import { catalogIdentity } from "../../src/lib/catalog/identity";
import { automaticPages, resolvePages } from "../../src/lib/catalog/pagePlan";
import {
  moveCatalogPage,
  moveCatalogProduct,
} from "../../src/lib/catalog/pageEditing";
import { plainText } from "../../src/lib/catalog/render";
import type { CatalogProduct } from "../../src/types/catalog";
const product = (id: number, sectionId = 1) =>
  ({
    id,
    categoryId: id,
    category: "Leaf " + id,
    sectionId,
    sectionTitle: "Group " + sectionId,
  }) as CatalogProduct;
test("old saved settings acquire page and cover defaults", () => {
  const parsed = catalogConfigSchema.parse({ density: "2" });
  assert.deepEqual(parsed.pages, []);
  assert.equal(parsed.coverDesign.titleX, 9);
  assert.equal(parsed.pageMode, "auto");
});
test("main SKU stays distinct from a variant family", () => {
  assert.deepEqual(
    catalogIdentity(
      { sku: "MAIN-1", variants: [{ title: "X", sku: "V-1" }] },
      "tr",
    ),
    { sku: "MAIN-1", skuLabel: "Ürün kodu" },
  );
  assert.deepEqual(
    catalogIdentity(
      {
        skuPrefix: "110-",
        skuSuffix: " S-303",
        variants: [
          { title: "x", sku: "110-625 S-303" },
          { title: "y", sku: "110-725 S-303" },
        ],
      },
      "en",
    ),
    { sku: "110-625 S-303", skuLabel: "Example variant code" },
  );
});
test("grouping uses main categories without repeating category paths in product titles", () => {
  const pages = automaticPages([product(1), product(2), product(3, 2)], {
    ...defaultCatalogConfig,
    density: "2",
  });
  assert.equal(pages.length, 2);
  assert.deepEqual(pages[0].productIds, [1, 2]);
  assert.equal(pages[0].title, "Group 1");
});
test("manual pages retain mixed layouts and exclude stale and duplicated product IDs", () => {
  const pages = [
    catalogPageSchema.parse({ id: "a", productIds: [1, 2], layout: "rows" }),
    catalogPageSchema.parse({
      id: "b",
      productIds: [2, 3, 999],
      layout: "spotlight",
    }),
  ];
  const resolved = resolvePages([product(1), product(2), product(3)], {
    ...defaultCatalogConfig,
    pageMode: "manual",
    pages,
  });
  assert.deepEqual(
    resolved.map((p) => p.productIds),
    [[1, 2], [3]],
  );
  assert.equal(resolved[0].layout, "rows");
  assert.equal(resolved[1].layout, "spotlight");
});
test("dragging moves a product without duplicating or losing it", () => {
  const pages = [
    catalogPageSchema.parse({ id: "a", productIds: [1, 2] }),
    catalogPageSchema.parse({ id: "b", productIds: [3] }),
  ];
  const result = moveCatalogProduct(pages, 1, "b", 0);
  assert.deepEqual(
    result.map((p) => p.productIds),
    [[2], [1, 3]],
  );
  assert.deepEqual(pages[0].productIds, [1, 2]);
  assert.deepEqual(
    moveCatalogPage(result, "b", "a").map((p) => p.id),
    ["b", "a"],
  );
});
test("short descriptions retain paragraph boundaries without arbitrary word splits", () => {
  assert.equal(
    plainText("<p>Bir ürün açıklaması.</p><p>İkinci paragraf.</p>"),
    "Bir ürün açıklaması.\nİkinci paragraf.\n",
  );
});
test("cover coordinates and raw CSS cannot escape validated limits", () => {
  assert.equal(
    catalogConfigSchema.safeParse({ coverDesign: { background: "url(x)" } })
      .success,
    false,
  );
  assert.equal(
    catalogConfigSchema.safeParse({
      ...defaultCatalogConfig,
      coverDesign: { ...defaultCatalogConfig.coverDesign, titleX: 101 },
    }).success,
    false,
  );
});
