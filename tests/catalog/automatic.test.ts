import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultCatalogConfig,
  catalogConfigSchema,
} from "../../src/lib/catalog/schema";
import { automaticPages } from "../../src/lib/catalog/pagePlan";
import { applyCatalogPreset } from "../../src/lib/catalog/presets";
import { catalogImageTargets } from "../../src/lib/catalog/imageSizing";
import type { CatalogProduct, CatalogSnapshot } from "../../src/types/catalog";

const products = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  category: "Instruments",
  sectionId: 1,
  image: { id: i + 1 },
})) as CatalogProduct[];
test("automatic groups balance trailing pages and place a highlight only once", () => {
  const pages = automaticPages(products, {
    ...defaultCatalogConfig,
    density: "9",
    featuredProductIds: [1],
  });
  assert.deepEqual(
    pages.map((p) => p.productIds.length),
    [1, 9],
  );
  assert.equal(pages[0].layout, "spotlight");
  assert.equal(new Set(pages.flatMap((p) => p.productIds)).size, 10);
  const balanced = automaticPages(products, {
    ...defaultCatalogConfig,
    density: "9",
  });
  assert.deepEqual(
    balanced.map((p) => p.productIds.length),
    [5, 5],
  );
});
test("publication presets preserve source selection, colours and catalog overrides", () => {
  const config = catalogConfigSchema.parse({
    selection: "products",
    productIds: [1, 2],
    color: "#123456",
    overrides: [{ productId: 1, title: "Custom" }],
  });
  const compact = applyCatalogPreset(config, "directory");
  assert.deepEqual(compact.productIds, config.productIds);
  assert.deepEqual(compact.overrides, config.overrides);
  assert.equal(compact.color, config.color);
  assert.equal(compact.density, "9");
  assert.equal(compact.description, "none");
  const brochure = applyCatalogPreset(config, "brochure");
  assert.equal(brochure.cover, "none");
  assert.equal(brochure.toc, false);
});
test("image resolution follows saved site sizes and the largest use of a shared image", () => {
  const snapshot = {
    config: {
      ...defaultCatalogConfig,
      cover: "image",
      coverDesign: { ...defaultCatalogConfig.coverDesign, imageWidth: 76 },
      density: "9",
    },
    products,
    coverImage: { id: 1 },
    imageProfiles: {
      thumbnail: { width: 320, quality: 70 },
      card: { width: 900, quality: 75 },
      content: { width: 1600, quality: 80 },
      fullscreen: { width: 2400, quality: 85 },
    },
  } as CatalogSnapshot;
  const targets = catalogImageTargets(snapshot);
  assert.equal(targets.get(1), 1600);
  assert.equal(targets.get(2), 900);
  snapshot.config.profile = "quality";
  assert.equal(catalogImageTargets(snapshot).get(1), 2400);
});
