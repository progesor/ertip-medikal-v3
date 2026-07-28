import { generateLegacyVariants } from "./generateLegacyVariants";
import { parseLegacyAttributes } from "./legacyPunch";
import type {
  ExistingVariant,
  LegacyGenerationOptions,
  VariantGenerationData,
} from "./types";

export class SkuGenerationValidationError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Varyant ve SKU üretimi uygulanamadı:\n- ${issues.join("\n- ")}`);
    this.name = "SkuGenerationValidationError";
    this.issues = issues;
  }
}

export function applyLegacyVariantGeneration<T extends VariantGenerationData>(
  data: T,
  options: LegacyGenerationOptions = {},
): T {
  if (
    !data.triggerVariantGeneration ||
    !Array.isArray(data.attributes) ||
    data.attributes.length === 0
  ) {
    return data;
  }

  const attributes = parseLegacyAttributes(data.attributes);
  if (attributes.length === 0) {
    data.triggerVariantGeneration = false;
    return data;
  }

  const existingVariants = Array.isArray(data.variants)
    ? (data.variants.filter(
        (variant): variant is ExistingVariant =>
          Boolean(variant) && typeof variant === "object",
      ) as ExistingVariant[])
    : [];

  const result = generateLegacyVariants(
    {
      attributes,
      existingVariants,
      skuPrefix: data.skuPrefix,
      skuSuffix: data.skuSuffix,
    },
    options,
  );

  if (!result.ok) {
    throw new SkuGenerationValidationError(
      result.issues.map((issue) => issue.message),
    );
  }

  data.variants = result.variants;
  data.triggerVariantGeneration = false;
  return data;
}
