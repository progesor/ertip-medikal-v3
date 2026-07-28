import {
  calculateCombinationCount,
  getCombinations,
} from "./combinations.js";
import {
  buildLegacyPunchSku,
  buildLegacyVariantTitle,
  createCombinationKey,
} from "./legacyPunch.js";
import type {
  ExistingVariant,
  GeneratedVariantCandidate,
  LegacyGenerationInput,
  LegacyGenerationOptions,
  LegacyGenerationResult,
  SkuGenerationIssue,
} from "./types.js";

export const LEGACY_PUNCH_DEFAULT_MAX_COMBINATIONS = 500;

function findDuplicateSkus(
  variants: readonly ExistingVariant[],
): string[] {
  const counts = new Map<string, number>();

  for (const variant of variants) {
    if (typeof variant.sku !== "string") continue;
    counts.set(variant.sku, (counts.get(variant.sku) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([sku]) => sku);
}

export function generateLegacyVariants(
  input: LegacyGenerationInput,
  options: LegacyGenerationOptions = {},
): LegacyGenerationResult {
  const maximumCombinationCount =
    options.maximumCombinationCount ?? LEGACY_PUNCH_DEFAULT_MAX_COMBINATIONS;
  const arrays = input.attributes.map((attribute) => attribute.values);
  const combinationCount = calculateCombinationCount(arrays);
  const issues: SkuGenerationIssue[] = [];

  for (const attribute of input.attributes) {
    if (attribute.values.length === 0) {
      issues.push({
        code: "EMPTY_ATTRIBUTE_VALUES",
        attributeName: attribute.name,
        message: `“${attribute.name}” özelliğinde üretilebilir bir değer bulunamadı.`,
      });
    }
  }

  if (combinationCount > maximumCombinationCount) {
    issues.push({
      code: "COMBINATION_LIMIT_EXCEEDED",
      combinationCount,
      maximumCombinationCount,
      message: `Varyant üretimi ${combinationCount} kombinasyon oluşturuyor; izin verilen güvenli sınır ${maximumCombinationCount}.`,
    });
  }

  for (const sku of findDuplicateSkus(input.existingVariants)) {
    issues.push({
      code: "DUPLICATE_EXISTING_SKU",
      sku,
      message: `Mevcut varyantlarda “${sku}” SKU kodu birden fazla kez kullanılıyor.`,
    });
  }

  if (issues.length > 0) {
    return { ok: false, combinationCount, issues };
  }

  const combinations = getCombinations(arrays);
  const candidates: GeneratedVariantCandidate[] = combinations.map(
    (combination) => {
      const generatedSku = buildLegacyPunchSku(
        input.attributes,
        combination,
        input.skuPrefix,
        input.skuSuffix,
      );
      const existingVariant = input.existingVariants.find(
        (variant) => variant.sku === generatedSku,
      );

      return {
        combination,
        combinationKey: createCombinationKey(input.attributes, combination),
        variant: {
          ...existingVariant,
          title: buildLegacyVariantTitle(input.attributes, combination),
          sku: generatedSku,
          isActive: existingVariant?.isActive ?? true,
        },
      };
    },
  );

  const generatedSkuCounts = new Map<string, number>();
  for (const candidate of candidates) {
    const sku = candidate.variant.sku;
    generatedSkuCounts.set(sku, (generatedSkuCounts.get(sku) ?? 0) + 1);
  }

  for (const [sku, count] of generatedSkuCounts) {
    if (count <= 1) continue;
    issues.push({
      code: "DUPLICATE_GENERATED_SKU",
      sku,
      message: `“${sku}” SKU kodu ${count} farklı kombinasyon tarafından üretiliyor.`,
    });
  }

  if (issues.length > 0) {
    return { ok: false, combinationCount, issues };
  }

  return {
    ok: true,
    combinationCount,
    candidates,
    variants: candidates.map((candidate) => candidate.variant),
  };
}
