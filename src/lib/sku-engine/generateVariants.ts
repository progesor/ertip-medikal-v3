import {
  calculateCombinationCount,
  getCombinations,
} from "./combinations";
import {
  buildLegacyPunchSku,
  buildLegacyVariantTitle,
  createCombinationKey,
} from "./legacyPunch";
import {
  normalizeAttributeName,
  renderSkuTemplate,
  validateSkuTemplate,
} from "./templateProfile";
import type {
  ConfigurableGenerationInput,
  ConfigurableGenerationResult,
  ExistingVariant,
  GeneratedVariantCandidate,
  SkuGenerationIssue,
  VariantMatchStrategy,
} from "./types";

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function findDuplicates(values: readonly string[]): string[] {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([value]) => value);
}

function buildTargetSku(
  input: ConfigurableGenerationInput,
  combination: readonly string[],
): string {
  if (input.profile === "legacy-punch") {
    return buildLegacyPunchSku(
      input.attributes,
      combination,
      input.skuPrefix,
      input.skuSuffix,
    );
  }

  return renderSkuTemplate({
    attributes: input.attributes,
    combination,
    normalization: input.valueNormalization,
    prefix: input.skuPrefix ? String(input.skuPrefix) : "",
    suffix: input.skuSuffix ? String(input.skuSuffix) : "",
    template: input.template,
    valueSeparator: input.valueSeparator,
  });
}

function findMatch(args: {
  combinationKey: string;
  existingByCombinationKey: ReadonlyMap<string, ExistingVariant>;
  existingBySku: ReadonlyMap<string, ExistingVariant>;
  legacySku: string;
  targetSku: string;
  usedVariants: ReadonlySet<ExistingVariant>;
}): { strategy: VariantMatchStrategy; variant?: ExistingVariant } {
  const {
    combinationKey,
    existingByCombinationKey,
    existingBySku,
    legacySku,
    targetSku,
    usedVariants,
  } = args;

  const byCombinationKey = existingByCombinationKey.get(combinationKey);
  if (byCombinationKey && !usedVariants.has(byCombinationKey)) {
    return { strategy: "combination-key", variant: byCombinationKey };
  }

  const byTargetSku = existingBySku.get(targetSku);
  if (byTargetSku && !usedVariants.has(byTargetSku)) {
    return { strategy: "target-sku", variant: byTargetSku };
  }

  const byLegacySku = existingBySku.get(legacySku);
  if (byLegacySku && !usedVariants.has(byLegacySku)) {
    return { strategy: "legacy-sku", variant: byLegacySku };
  }

  return { strategy: "new" };
}

export function generateVariants(
  input: ConfigurableGenerationInput,
): ConfigurableGenerationResult {
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

  for (const duplicateName of findDuplicates(
    input.attributes.map((attribute) => normalizeAttributeName(attribute.name)),
  )) {
    issues.push({
      code: "DUPLICATE_ATTRIBUTE_NAME",
      attributeName: duplicateName,
      message: `“${duplicateName}” özellik adı birden fazla kez kullanılıyor. Özellik adları SKU motorunda benzersiz olmalıdır.`,
    });
  }

  if (combinationCount > input.maximumCombinationCount) {
    issues.push({
      code: "COMBINATION_LIMIT_EXCEEDED",
      combinationCount,
      maximumCombinationCount: input.maximumCombinationCount,
      message: `Varyant üretimi ${combinationCount} kombinasyon oluşturuyor; ürün için izin verilen sınır ${input.maximumCombinationCount}.`,
    });
  }

  if (input.profile === "template") {
    issues.push(...validateSkuTemplate(input.template, input.attributes));
  }

  const existingCombinationKeys = input.existingVariants
    .map((variant) => asNonEmptyString(variant.combinationKey))
    .filter((value): value is string => Boolean(value));

  for (const combinationKey of findDuplicates(existingCombinationKeys)) {
    issues.push({
      code: "DUPLICATE_EXISTING_COMBINATION_KEY",
      combinationKey,
      message: "Mevcut varyantlarda aynı mantıksal kombinasyon kimliği birden fazla kez kullanılıyor.",
    });
  }

  const existingSkus = input.existingVariants
    .map((variant) => asNonEmptyString(variant.sku))
    .filter((value): value is string => Boolean(value));

  for (const sku of findDuplicates(existingSkus)) {
    issues.push({
      code: "DUPLICATE_EXISTING_SKU",
      sku,
      message: `Mevcut varyantlarda “${sku}” SKU kodu birden fazla kez kullanılıyor.`,
    });
  }

  if (issues.length > 0) {
    return { ok: false, combinationCount, issues };
  }

  const existingByCombinationKey = new Map<string, ExistingVariant>();
  const existingBySku = new Map<string, ExistingVariant>();

  for (const variant of input.existingVariants) {
    const combinationKey = asNonEmptyString(variant.combinationKey);
    const sku = asNonEmptyString(variant.sku);
    if (combinationKey) existingByCombinationKey.set(combinationKey, variant);
    if (sku) existingBySku.set(sku, variant);
  }

  const usedVariants = new Set<ExistingVariant>();
  const combinations = getCombinations(arrays);
  const candidates: GeneratedVariantCandidate[] = combinations.map(
    (combination) => {
      const combinationKey = createCombinationKey(input.attributes, combination);
      const targetSku = buildTargetSku(input, combination);
      const legacySku = buildLegacyPunchSku(
        input.attributes,
        combination,
        input.skuPrefix,
        input.skuSuffix,
      );
      const match = findMatch({
        combinationKey,
        existingByCombinationKey,
        existingBySku,
        legacySku,
        targetSku,
        usedVariants,
      });
      const existingVariant = match.variant;
      if (existingVariant) usedVariants.add(existingVariant);

      const title = buildLegacyVariantTitle(input.attributes, combination);
      const previousSku = existingVariant
        ? asNonEmptyString(existingVariant.sku)
        : null;
      const previousTitle = existingVariant
        ? asNonEmptyString(existingVariant.title)
        : null;

      return {
        combination,
        combinationKey,
        matchStrategy: match.strategy,
        previousSku,
        previousTitle,
        variant: {
          ...existingVariant,
          combinationKey,
          title,
          sku: targetSku,
          isActive: existingVariant?.isActive ?? true,
        },
      };
    },
  );

  for (const candidate of candidates) {
    if (!candidate.variant.sku) {
      issues.push({
        code: "EMPTY_GENERATED_SKU",
        combinationKey: candidate.combinationKey,
        message: `“${candidate.variant.title}” varyantı için boş SKU üretildi.`,
      });
    }
  }

  for (const sku of findDuplicates(
    candidates.map((candidate) => candidate.variant.sku),
  )) {
    issues.push({
      code: "DUPLICATE_GENERATED_SKU",
      sku,
      message: `“${sku}” SKU kodu birden fazla kombinasyon tarafından üretiliyor.`,
    });
  }

  if (issues.length > 0) {
    return { ok: false, combinationCount, issues };
  }

  const removedVariants = input.existingVariants.filter(
    (variant) => !usedVariants.has(variant),
  );

  const summary = {
    preserved: candidates.filter((candidate) => candidate.matchStrategy !== "new")
      .length,
    added: candidates.filter((candidate) => candidate.matchStrategy === "new")
      .length,
    skuChanged: candidates.filter(
      (candidate) =>
        candidate.matchStrategy !== "new" &&
        candidate.previousSku !== candidate.variant.sku,
    ).length,
    titleChanged: candidates.filter(
      (candidate) =>
        candidate.matchStrategy !== "new" &&
        candidate.previousTitle !== candidate.variant.title,
    ).length,
    removed: removedVariants.length,
    matchedByCombinationKey: candidates.filter(
      (candidate) => candidate.matchStrategy === "combination-key",
    ).length,
    bootstrappedByTargetSku: candidates.filter(
      (candidate) => candidate.matchStrategy === "target-sku",
    ).length,
    bootstrappedByLegacySku: candidates.filter(
      (candidate) => candidate.matchStrategy === "legacy-sku",
    ).length,
  };

  return {
    ok: true,
    combinationCount,
    candidates,
    variants: candidates.map((candidate) => candidate.variant),
    removedVariants,
    summary,
  };
}