import { DEFAULT_MAX_VARIANT_COMBINATIONS } from "./configuration";
import { generateVariants } from "./generateVariants";
import {
  DEFAULT_SKU_TEMPLATE,
  DEFAULT_SKU_VALUE_NORMALIZATION,
  DEFAULT_SKU_VALUE_SEPARATOR,
} from "./templateProfile";
import type {
  LegacyGenerationInput,
  LegacyGenerationOptions,
  LegacyGenerationResult,
} from "./types";

export const LEGACY_PUNCH_DEFAULT_MAX_COMBINATIONS =
  DEFAULT_MAX_VARIANT_COMBINATIONS;

export function generateLegacyVariants(
  input: LegacyGenerationInput,
  options: LegacyGenerationOptions = {},
): LegacyGenerationResult {
  return generateVariants({
    ...input,
    profile: "legacy-punch",
    maximumCombinationCount:
      options.maximumCombinationCount ??
      LEGACY_PUNCH_DEFAULT_MAX_COMBINATIONS,
    template: DEFAULT_SKU_TEMPLATE,
    valueSeparator: DEFAULT_SKU_VALUE_SEPARATOR,
    valueNormalization: DEFAULT_SKU_VALUE_NORMALIZATION,
  });
}