export interface LegacyAttributeInput {
  name?: unknown;
  values?: unknown;
  [key: string]: unknown;
}

export interface ParsedAttribute {
  name: string;
  values: string[];
}

export interface ExistingVariant extends Record<string, unknown> {
  sku?: unknown;
  title?: unknown;
  isActive?: unknown;
}

export interface GeneratedVariant extends ExistingVariant {
  title: string;
  sku: string;
  isActive: unknown;
}

export interface GeneratedVariantCandidate {
  combination: string[];
  combinationKey: string;
  variant: GeneratedVariant;
}

export type SkuGenerationErrorCode =
  | "EMPTY_ATTRIBUTE_VALUES"
  | "COMBINATION_LIMIT_EXCEEDED"
  | "DUPLICATE_GENERATED_SKU"
  | "DUPLICATE_EXISTING_SKU";

export interface SkuGenerationIssue {
  code: SkuGenerationErrorCode;
  message: string;
  sku?: string;
  attributeName?: string;
  combinationCount?: number;
  maximumCombinationCount?: number;
}

export interface LegacyGenerationOptions {
  maximumCombinationCount?: number;
}

export interface LegacyGenerationInput {
  attributes: ParsedAttribute[];
  existingVariants: ExistingVariant[];
  skuPrefix?: unknown;
  skuSuffix?: unknown;
}

export type LegacyGenerationResult =
  | {
      ok: true;
      combinationCount: number;
      candidates: GeneratedVariantCandidate[];
      variants: GeneratedVariant[];
    }
  | {
      ok: false;
      combinationCount: number;
      issues: SkuGenerationIssue[];
    };

export interface VariantGenerationData extends Record<string, unknown> {
  triggerVariantGeneration?: unknown;
  attributes?: unknown;
  variants?: unknown;
  skuPrefix?: unknown;
  skuSuffix?: unknown;
}
