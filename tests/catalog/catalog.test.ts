import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import type { Payload } from "payload";
import {
  catalogConfigSchema,
  defaultCatalogConfig,
} from "../../src/lib/catalog/schema";
import { catalogSnapshot } from "../../src/lib/catalog/source";
import { renderCatalog } from "../../src/lib/catalog/render";
import { catalogPaginationScript } from "../../src/lib/catalog/paginate";
import type { CatalogSnapshot } from "../../src/types/catalog";

test("catalog accepts short descriptions and rejects full website copy", () => {
  assert.equal(defaultCatalogConfig.description, "short");
  assert.equal(defaultCatalogConfig.showSpecs, true);
  assert.equal(defaultCatalogConfig.showVariants, false);
  assert.equal(
    catalogConfigSchema.safeParse({ description: "full" }).success,
    false,
  );
});
test("untrusted styling and media IDs cannot enter the document", () => {
  for (const config of [
    { color: "red;display:none" },
    { coverImageId: -1 },
    { productIds: [1.5] },
    { density: "100" },
  ]) {
    assert.equal(catalogConfigSchema.safeParse(config).success, false);
  }
});
test("pagination script survives bundling without generated runtime helpers", () => {
  assert.doesNotThrow(() => new vm.Script(catalogPaginationScript));
  assert.ok(!catalogPaginationScript.includes("__name"));
});
const product = {
  id: 7,
  title: "Ürün",
  sku: "S-10",
  category: [1],
  shortDescription: "Kısa bilgi",
  description: "UZUN WEB METNİ",
  mainImage: null,
  specs: [{ key: "Güç", value: "10 W" }],
  attributes: [{ name: "Seçenek", values: "Aktif-Kapalı" }],
  variants: [
    { title: "Aktif", sku: "S-11", isActive: true },
    { title: "Kapalı", sku: "S-12", isActive: false },
  ],
  slug: "product",
  updatedAt: "2026-11-19T00:00:00.000Z",
};
function fixture() {
  const requests: Record<string, unknown>[] = [];
  const payload = {
    findGlobal: async () => ({
      profiles: { card: { width: 768, quality: 75 } },
    }),
    find: async (args: Record<string, unknown>) => {
      requests.push(args);
      return {
        docs:
          args.collection === "categories"
            ? [
                { id: 1, title: "Ana" },
                { id: 2, title: "Alt", parent: 1 },
              ]
            : [product],
        hasNextPage: false,
      };
    },
  } as unknown as Payload;
  return { payload, requests };
}
test("source uses published records, short description and active variants", async () => {
  const { payload, requests } = fixture();
  const snapshot = await catalogSnapshot(payload, "Test", defaultCatalogConfig);
  assert.equal(snapshot.products[0].description, "Kısa bilgi");
  assert.equal(snapshot.products[0].sourceDefaults?.title, "Ürün");
  assert.equal(snapshot.products[0].sourceDefaults?.sku, "S-10");
  assert.deepEqual(snapshot.products[0].options, [
    { key: "Seçenek", value: "Aktif" },
  ]);
  assert.deepEqual(requests[1].where, {
    and: [{ _status: { equals: "published" } }],
  });
  assert.equal(requests[1].draft, false);
});
test("category selection includes descendants, English fallback stays explicit", async () => {
  const { payload, requests } = fixture();
  await catalogSnapshot(payload, "Test", {
    ...defaultCatalogConfig,
    selection: "categories",
    categoryIds: [1],
    locale: "en",
  });
  assert.equal(requests[1].fallbackLocale, false);
  assert.deepEqual(requests[1].where, {
    and: [{ _status: { equals: "published" } }, { category: { in: [1, 2] } }],
  });
});
test("catalog overrides leave source records untouched", async () => {
  const { payload } = fixture();
  const snapshot = await catalogSnapshot(payload, "Test", {
    ...defaultCatalogConfig,
    overrides: [
      { productId: 7, title: "Baskı adı", description: "Baskı metni" },
    ],
  });
  assert.equal(snapshot.products[0].title, "Baskı adı");
  assert.equal(snapshot.products[0].description, "Baskı metni");
  assert.equal(product.title, "Ürün");
  assert.equal(product.shortDescription, "Kısa bilgi");
});
test("user content is escaped, not injected as script or markup", async () => {
  const { payload } = fixture();
  const snapshot: CatalogSnapshot = await catalogSnapshot(
    payload,
    "</title><script>alert(1)</script>",
    defaultCatalogConfig,
  );
  snapshot.products[0].title = "<img src=x onerror=alert(1)>";
  const html = renderCatalog(snapshot);
  assert.ok(!html.includes("<script>alert(1)</script>"));
  assert.ok(!html.includes("<img src=x"));
  assert.ok(html.includes("&lt;img"));
  assert.ok(html.includes("Kısa bilgi"));
  assert.ok(!html.includes("UZUN WEB METNİ"));
});
