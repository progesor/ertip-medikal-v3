import assert from "node:assert/strict";
import { test } from "node:test";
import type { PayloadRequest } from "payload";
import { listProductContentIssues } from "../../src/lib/catalog/contentReview";

const both = { tr: "Türkçe metin", en: "English text" };
const complete = {
  title: both,
  shortDescription: both,
  description: both,
  sku: "ABC",
  mainImage: 1,
};
type Row = { id: number } & Record<string, unknown>;

function catalog(rows: Row[]) {
  let reads = 0;
  const req = {
    user: { id: 1, collection: "users", role: "editor" },
    locale: "tr",
    payload: {
      async find({
        where,
        limit,
        sort,
        ...options
      }: {
        where?: { id: { less_than?: number; greater_than?: number } };
        limit: number;
        sort: string;
        draft: boolean;
        fallbackLocale: boolean;
        locale: string;
        overrideAccess: boolean;
      }) {
        reads++;
        assert.equal(options.draft, true);
        assert.equal(options.overrideAccess, false);
        assert.equal(options.fallbackLocale, false);
        assert.equal(options.locale, "all");
        const matches = rows.filter(
          (row) =>
            row.id < (where?.id.less_than ?? Infinity) &&
            row.id > (where?.id.greater_than ?? -Infinity),
        );
        matches.sort((a, b) => (sort === "-id" ? b.id - a.id : a.id - b.id));
        return { docs: matches.slice(0, limit) };
      },
    },
  } as unknown as PayloadRequest;
  return { req, reads: () => reads };
}

test("a missing locale stays missing and only active variant SKUs are required", async () => {
  const { req } = catalog([
    {
      ...complete,
      id: 1,
      sku: "",
      variants: [{ sku: "A" }, { isActive: false }],
    },
    {
      ...complete,
      id: 2,
      title: { tr: "Ürün" },
      description: { tr: "Detay", en: "<p>&nbsp;</p>" },
      variants: [{ sku: "   " }, { isActive: false }],
    },
    { ...complete, id: 3, mainImage: null, sku: " " },
  ]);
  const { products } = await listProductContentIssues(req);
  assert.deepEqual(
    products.map((p) => [p.id, p.issues]),
    [
      [3, ["image", "sku"]],
      [2, ["en", "sku"]],
    ],
  );
  assert.equal(products[0].missingProductSku, true);
  assert.equal(products[1].missingVariantSkus, 1);
  assert.deepEqual(products[1].missingText.en, ["title", "description"]);
});

test("filtered pages cross batches of complete products in both directions", async () => {
  const rows = Array.from({ length: 205 }, (_, i) => ({
    ...complete,
    id: i + 1,
    mainImage: [1, 103, 205].includes(i + 1) ? null : 1,
  }));
  const { req, reads } = catalog(rows);
  const first = await listProductContentIssues(req, {
    filter: "image",
    limit: 1,
  });
  assert.equal(first.nextAfter, 205);
  assert.equal(first.previousBefore, null);
  assert.ok(reads() > 1);
  const next = await listProductContentIssues(req, {
    filter: "image",
    limit: 1,
    after: first.nextAfter!,
  });
  assert.deepEqual(
    next.products.map((p) => p.id),
    [103],
  );
  const back = await listProductContentIssues(req, {
    filter: "image",
    limit: 1,
    before: next.previousBefore!,
  });
  assert.deepEqual(back, first);
  const last = await listProductContentIssues(req, {
    filter: "image",
    limit: 1,
    after: next.nextAfter!,
  });
  assert.equal(last.nextAfter, null);
  const healthy = await listProductContentIssues(req, { filter: "sku" });
  assert.deepEqual(healthy.products, []);
  assert.equal(healthy.nextAfter, null);
});
