import assert from "node:assert/strict";
import test from "node:test";
import {
  applyConfiguredVariantGeneration,
  previewConfiguredVariantGeneration,
} from "../../src/lib/sku-engine/applyLegacyVariantGeneration";
import { createGenerationFingerprint } from "../../src/lib/sku-engine/configuration";
import { generateVariants } from "../../src/lib/sku-engine/generateVariants";
import {
  createCombinationKey,
  parseLegacyAttributes,
} from "../../src/lib/sku-engine/legacyPunch";

const attributes = parseLegacyAttributes([
  { id: "attribute-color", name: "Renk", values: "Mavi-Kırmızı" },
  { id: "attribute-size", name: "Boyut", values: "Small-Large" },
]);

function createTemplateInput() {
  return {
    profile: "template" as const,
    attributes,
    existingVariants: [],
    skuPrefix: "PRD-",
    skuSuffix: "-TR",
    maximumCombinationCount: 100,
    template: "{prefix}{value:Renk}-{value:Boyut}{suffix}",
    valueSeparator: "/",
    valueNormalization: "uppercase-compact" as const,
  };
}

test("renders generic templates with named attribute tokens", () => {
  const result = generateVariants(createTemplateInput());

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.deepEqual(
    result.variants.map((variant) => variant.sku),
    [
      "PRD-MAVI-SMALL-TR",
      "PRD-MAVI-LARGE-TR",
      "PRD-KIRMIZI-SMALL-TR",
      "PRD-KIRMIZI-LARGE-TR",
    ],
  );
});

test("preserves manual metadata by persisted combination key when SKU changes", () => {
  const combinationKey = createCombinationKey(attributes, ["Mavi", "Small"]);
  const existingVariant = {
    id: "variant-1",
    combinationKey,
    title: "Eski başlık",
    sku: "OLD-SKU",
    price: "125",
    variantImages: [{ image: 42 }],
    isActive: false,
  };

  const result = generateVariants({
    ...createTemplateInput(),
    existingVariants: [existingVariant],
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.candidates[0]?.matchStrategy, "combination-key");
  assert.equal(result.candidates[0]?.previousSku, "OLD-SKU");
  assert.equal(result.variants[0]?.sku, "PRD-MAVI-SMALL-TR");
  assert.equal(result.variants[0]?.price, "125");
  assert.deepEqual(result.variants[0]?.variantImages, [{ image: 42 }]);
  assert.equal(result.variants[0]?.isActive, false);
  assert.equal(result.summary.skuChanged, 1);
});

test("bootstraps a template profile from the existing Punch SKU", () => {
  const punchAttributes = parseLegacyAttributes([
    { id: "diameter", name: "Çap", values: "0.65" },
    { id: "length", name: "Uzunluk", values: "3.0" },
  ]);
  const result = generateVariants({
    profile: "template",
    attributes: punchAttributes,
    existingVariants: [{ id: "legacy-row", sku: "110-653 S-303", price: "99" }],
    skuPrefix: "110-",
    skuSuffix: " S-303",
    maximumCombinationCount: 10,
    template: "NEW-{values}",
    valueSeparator: "-",
    valueNormalization: "compact",
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.candidates[0]?.matchStrategy, "legacy-sku");
  assert.equal(result.variants[0]?.id, "legacy-row");
  assert.equal(result.variants[0]?.price, "99");
  assert.equal(result.variants[0]?.sku, "NEW-065-30");
});

test("reports variants removed by the new attribute matrix", () => {
  const result = generateVariants({
    ...createTemplateInput(),
    existingVariants: [
      { sku: "PRD-MAVI-SMALL-TR" },
      { sku: "NO-LONGER-USED", price: "44" },
    ],
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.summary.removed, 1);
  assert.equal(result.removedVariants[0]?.sku, "NO-LONGER-USED");
});

test("rejects duplicate attribute names and unknown template tokens", () => {
  const duplicateResult = generateVariants({
    ...createTemplateInput(),
    attributes: parseLegacyAttributes([
      { name: "Renk", values: "Mavi" },
      { name: " renk ", values: "Kırmızı" },
    ]),
  });

  assert.equal(duplicateResult.ok, false);
  if (duplicateResult.ok) return;
  assert.equal(duplicateResult.issues[0]?.code, "DUPLICATE_ATTRIBUTE_NAME");

  const tokenResult = generateVariants({
    ...createTemplateInput(),
    template: "{prefix}{value:OlmayanAlan}",
  });

  assert.equal(tokenResult.ok, false);
  if (tokenResult.ok) return;
  assert.equal(tokenResult.issues[0]?.code, "UNKNOWN_TEMPLATE_TOKEN");
});

test("manual profile disables automatic generation without changing variants", () => {
  const variants = [{ sku: "MANUAL", price: "12" }];
  const data = {
    triggerVariantGeneration: true,
    skuRuleProfile: "manual",
    attributes: [{ name: "Renk", values: "Mavi" }],
    variants,
  };

  applyConfiguredVariantGeneration(data);
  assert.equal(data.variants, variants);
  assert.equal(data.triggerVariantGeneration, false);
  assert.equal(previewConfiguredVariantGeneration(data), null);
});

test("preview fingerprints become stale after relevant form changes", () => {
  const data = {
    skuRuleProfile: "template",
    skuTemplate: "{prefix}{values}",
    skuPrefix: "A-",
    attributes: [{ name: "Renk", values: "Mavi" }],
    variants: [],
  };
  const first = createGenerationFingerprint(data);
  data.skuPrefix = "B-";
  const second = createGenerationFingerprint(data);
  assert.notEqual(first, second);
});