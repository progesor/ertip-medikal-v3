import assert from "node:assert/strict";
import test from "node:test";
import {
  applyLegacyVariantGeneration,
  SkuGenerationValidationError,
} from "../../src/lib/sku-engine/applyLegacyVariantGeneration";
import { generateLegacyVariants } from "../../src/lib/sku-engine/generateLegacyVariants";
import { parseLegacyAttributes } from "../../src/lib/sku-engine/legacyPunch";

const attributes = parseLegacyAttributes([
  { name: "Çap", values: "0.6-0.65" },
  { name: "Uzunluk", values: "1.5-20" },
]);

test("generates Cartesian products in the historical order", () => {
  const result = generateLegacyVariants({
    attributes,
    existingVariants: [],
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.deepEqual(
    result.variants.map((variant) => variant.sku),
    ["615", "0620", "6515", "6520"],
  );
});

test("preserves manual fields by exact legacy SKU match", () => {
  const existingVariant = {
    id: "row-1",
    title: "Old title",
    sku: "615",
    price: "125",
    variantImages: [{ image: 42 }],
    isActive: false,
    customField: "preserve-me",
  };
  const result = generateLegacyVariants({
    attributes: parseLegacyAttributes([
      { name: "Çap", values: "0.6" },
      { name: "Uzunluk", values: "1.5" },
    ]),
    existingVariants: [existingVariant],
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.variants[0]?.id, "row-1");
  assert.equal(result.variants[0]?.title, "0.6 mm Çap - 1.5 mm Uzunluk");
  assert.equal(result.variants[0]?.sku, "615");
  assert.equal(result.variants[0]?.price, "125");
  assert.deepEqual(result.variants[0]?.variantImages, [{ image: 42 }]);
  assert.equal(result.variants[0]?.isActive, false);
  assert.equal(result.variants[0]?.customField, "preserve-me");
  assert.equal(typeof result.variants[0]?.combinationKey, "string");
  assert.equal(result.candidates[0]?.matchStrategy, "target-sku");
});

test("defaults null active state to true like the original hook", () => {
  const result = generateLegacyVariants({
    attributes: parseLegacyAttributes([
      { name: "Çap", values: "0.6" },
      { name: "Uzunluk", values: "1.5" },
    ]),
    existingVariants: [{ sku: "615", isActive: null }],
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.variants[0]?.isActive, true);
});

test("blocks duplicate generated SKUs after numeric normalization", () => {
  const result = generateLegacyVariants({
    attributes: parseLegacyAttributes([
      { name: "Çap", values: "0.65" },
      { name: "Uzunluk", values: "3-3.0" },
    ]),
    existingVariants: [],
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.issues[0]?.code, "DUPLICATE_GENERATED_SKU");
  assert.equal(result.issues[0]?.sku, "653");
});

test("blocks ambiguous duplicate existing SKUs", () => {
  const result = generateLegacyVariants({
    attributes: parseLegacyAttributes([
      { name: "Çap", values: "0.6" },
      { name: "Uzunluk", values: "1.5" },
    ]),
    existingVariants: [{ sku: "615" }, { sku: "615" }],
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.issues[0]?.code, "DUPLICATE_EXISTING_SKU");
});

test("blocks accidental variant explosions before materializing combinations", () => {
  const result = generateLegacyVariants(
    {
      attributes,
      existingVariants: [],
    },
    { maximumCombinationCount: 3 },
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.combinationCount, 4);
  assert.equal(result.issues[0]?.code, "COMBINATION_LIMIT_EXCEEDED");
});

test("invalid generation leaves existing variants untouched", () => {
  const variants = [{ sku: "KEEP", price: "99" }];
  const data = {
    triggerVariantGeneration: true,
    attributes: [{ name: "Çap", values: "-" }],
    variants,
  };

  assert.throws(
    () => applyLegacyVariantGeneration(data),
    SkuGenerationValidationError,
  );
  assert.equal(data.variants, variants);
  assert.equal(data.triggerVariantGeneration, true);
});

test("normal saves do not regenerate variants", () => {
  const variants = [{ sku: "KEEP" }];
  const data = {
    triggerVariantGeneration: false,
    attributes: [{ name: "Çap", values: "0.6" }],
    variants,
  };

  assert.equal(applyLegacyVariantGeneration(data), data);
  assert.equal(data.variants, variants);
});

test("empty attribute rows keep variants and reset the explicit trigger", () => {
  const variants = [{ sku: "KEEP" }];
  const data = {
    triggerVariantGeneration: true,
    attributes: [{ name: "", values: "" }],
    variants,
  };

  applyLegacyVariantGeneration(data);
  assert.equal(data.variants, variants);
  assert.equal(data.triggerVariantGeneration, false);
});