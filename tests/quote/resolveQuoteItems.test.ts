import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveQuoteItems,
  type QuoteProductRecord,
} from "../../src/lib/quote/resolveQuoteItems";

function createLoader(products: QuoteProductRecord[]) {
  const byId = new Map(products.map((product) => [String(product.id), product]));
  return async (productId: string) => byId.get(productId) ?? null;
}

const publishedVariantProduct: QuoteProductRecord = {
  id: 42,
  title: "Punch",
  sku: "PUNCH",
  _status: "published",
  variants: [
    {
      combinationKey: "cap=0.6|uzunluk=3",
      title: "0.6 mm Çap - 3 mm Uzunluk",
      sku: "110-063",
      isActive: true,
    },
    {
      combinationKey: "cap=0.7|uzunluk=3",
      title: "0.7 mm Çap - 3 mm Uzunluk",
      sku: "110-073",
      isActive: false,
    },
  ],
};

test("resolves a current variant by stable combination key", async () => {
  const result = await resolveQuoteItems(
    [
      {
        productId: "42",
        combinationKey: "cap=0.6|uzunluk=3",
        sku: "spoofed-or-stale-sku",
        productTitle: "Spoofed title",
        variantInfo: "Spoofed variant",
        quantity: 2,
      },
    ],
    createLoader([publishedVariantProduct]),
  );

  assert.deepEqual(result, {
    ok: true,
    items: [
      {
        productTitle: "Punch",
        variantInfo: "0.6 mm Çap - 3 mm Uzunluk",
        sku: "110-063",
        quantity: 2,
      },
    ],
  });
});

test("supports a legacy cart by exact unique SKU", async () => {
  const result = await resolveQuoteItems(
    [{ productId: 42, sku: "110-063", quantity: 1 }],
    createLoader([publishedVariantProduct]),
  );

  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.items[0]?.sku, "110-063");
});

test("rejects inactive, missing, or unpublished products", async () => {
  const loader = createLoader([
    publishedVariantProduct,
    { id: 99, title: "Draft", _status: "draft" },
  ]);

  const inactive = await resolveQuoteItems(
    [
      {
        productId: 42,
        combinationKey: "cap=0.7|uzunluk=3",
        quantity: 1,
      },
    ],
    loader,
  );
  assert.equal(inactive.ok, false);

  const missing = await resolveQuoteItems(
    [{ productId: 404, sku: "X", quantity: 1 }],
    loader,
  );
  assert.equal(missing.ok, false);

  const draft = await resolveQuoteItems(
    [{ productId: 99, quantity: 1 }],
    loader,
  );
  assert.equal(draft.ok, false);
});

test("rejects an unknown stable combination instead of falling back", async () => {
  const result = await resolveQuoteItems(
    [
      {
        productId: 42,
        combinationKey: "unknown-combination",
        sku: "110-063",
        quantity: 1,
      },
    ],
    createLoader([publishedVariantProduct]),
  );

  assert.equal(result.ok, false);
});

test("resolves standard products from database values", async () => {
  const result = await resolveQuoteItems(
    [
      {
        productId: "7",
        sku: "client-controlled",
        quantity: 3,
      },
    ],
    createLoader([
      {
        id: 7,
        title: "Standart Ürün",
        sku: "DB-SKU-7",
        _status: "published",
        variants: [],
      },
    ]),
  );

  assert.deepEqual(result, {
    ok: true,
    items: [
      {
        productTitle: "Standart Ürün",
        variantInfo: "Standart",
        sku: "DB-SKU-7",
        quantity: 3,
      },
    ],
  });
});

test("merges duplicate logical items and validates quantity limits", async () => {
  const result = await resolveQuoteItems(
    [
      {
        productId: 42,
        combinationKey: "cap=0.6|uzunluk=3",
        quantity: 2,
      },
      {
        productId: 42,
        combinationKey: "cap=0.6|uzunluk=3",
        quantity: 4,
      },
    ],
    createLoader([publishedVariantProduct]),
  );

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0]?.quantity, 6);
  }

  const invalidQuantity = await resolveQuoteItems(
    [{ productId: 42, sku: "110-063", quantity: 0 }],
    createLoader([publishedVariantProduct]),
  );
  assert.equal(invalidQuantity.ok, false);
});
