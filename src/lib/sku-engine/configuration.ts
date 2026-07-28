import { parseLegacyAttributes } from "./legacyPunch";
import {
  DEFAULT_SKU_TEMPLATE,
  DEFAULT_SKU_VALUE_NORMALIZATION,
  DEFAULT_SKU_VALUE_SEPARATOR,
} from "./templateProfile";
import type {
  ConfigurableGenerationInput,
  ExistingVariant,
  SkuRuleProfile,
  SkuValueNormalization,
  VariantGenerationData,
} from "./types";

export const DEFAULT_MAX_VARIANT_COMBINATIONS = 500;
export const MAX_CONFIGURABLE_VARIANT_COMBINATIONS = 5_000;

export function readSkuRuleProfile(value: unknown): SkuRuleProfile {
  return value === "template" || value === "manual"
    ? value
    : "legacy-punch";
}

export function readSkuValueNormalization(
  value: unknown,
): SkuValueNormalization {
  return value === "none" ||
    value === "uppercase-compact" ||
    value === "slug"
    ? value
    : DEFAULT_SKU_VALUE_NORMALIZATION;
}

export function readMaximumCombinationCount(value: unknown): number {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return DEFAULT_MAX_VARIANT_COMBINATIONS;
  }

  return Math.min(
    MAX_CONFIGURABLE_VARIANT_COMBINATIONS,
    Math.max(1, Math.floor(numericValue)),
  );
}

export function readExistingVariants(input: unknown): ExistingVariant[] {
  if (!Array.isArray(input)) return [];

  return input.filter(
    (variant): variant is ExistingVariant =>
      Boolean(variant) && typeof variant === "object",
  );
}

export function buildConfigurableGenerationInput(
  data: VariantGenerationData,
): ConfigurableGenerationInput | null {
  const profile = readSkuRuleProfile(data.skuRuleProfile);
  if (profile === "manual") return null;

  return {
    profile,
    attributes: parseLegacyAttributes(data.attributes),
    existingVariants: readExistingVariants(data.variants),
    skuPrefix: data.skuPrefix,
    skuSuffix: data.skuSuffix,
    maximumCombinationCount: readMaximumCombinationCount(
      data.maxVariantCombinations,
    ),
    template:
      typeof data.skuTemplate === "string" && data.skuTemplate.length > 0
        ? data.skuTemplate
        : DEFAULT_SKU_TEMPLATE,
    valueSeparator:
      typeof data.skuValueSeparator === "string"
        ? data.skuValueSeparator
        : DEFAULT_SKU_VALUE_SEPARATOR,
    valueNormalization: readSkuValueNormalization(
      data.skuValueNormalization,
    ),
  };
}

function normalizeFingerprintValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeFingerprintValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [
          key,
          normalizeFingerprintValue(nestedValue),
        ]),
    );
  }

  return value;
}

export function createGenerationFingerprint(
  data: VariantGenerationData,
): string {
  return JSON.stringify(
    normalizeFingerprintValue({
      attributes: data.attributes,
      variants: data.variants,
      skuPrefix: data.skuPrefix,
      skuSuffix: data.skuSuffix,
      skuRuleProfile: readSkuRuleProfile(data.skuRuleProfile),
      skuTemplate: data.skuTemplate,
      skuValueSeparator: data.skuValueSeparator,
      skuValueNormalization: readSkuValueNormalization(
        data.skuValueNormalization,
      ),
      maxVariantCombinations: readMaximumCombinationCount(
        data.maxVariantCombinations,
      ),
    }),
  );
}