import { buildConfigurableGenerationInput } from "./configuration";
import { generateVariants } from "./generateVariants";
import type {
  ConfigurableGenerationResult,
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

export function previewConfiguredVariantGeneration(
  data: VariantGenerationData,
): ConfigurableGenerationResult | null {
  const input = buildConfigurableGenerationInput(data);
  return input ? generateVariants(input) : null;
}

export function applyConfiguredVariantGeneration<
  T extends VariantGenerationData,
>(data: T): T {
  if (!data.triggerVariantGeneration) return data;

  const input = buildConfigurableGenerationInput(data);
  if (!input) {
    data.triggerVariantGeneration = false;
    return data;
  }

  if (input.attributes.length === 0) {
    data.triggerVariantGeneration = false;
    return data;
  }

  const result = generateVariants(input);

  if (!result.ok) {
    throw new SkuGenerationValidationError(
      result.issues.map((issue) => issue.message),
    );
  }

  data.variants = result.variants;
  data.triggerVariantGeneration = false;
  return data;
}

/**
 * Backwards-compatible export retained for the M7.1 characterization suite.
 */
export function applyLegacyVariantGeneration<T extends VariantGenerationData>(
  data: T,
  options: LegacyGenerationOptions = {},
): T {
  if (options.maximumCombinationCount !== undefined) {
    data.maxVariantCombinations = options.maximumCombinationCount;
  }
  if (data.skuRuleProfile === undefined) {
    data.skuRuleProfile = "legacy-punch";
  }
  return applyConfiguredVariantGeneration(data);
}