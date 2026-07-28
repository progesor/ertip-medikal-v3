export type SkuRuleProfile = "legacy-punch" | "template" | "manual";

export type SkuValueNormalization =
  | "none"
  | "compact"
  | "uppercase-compact"
  | "slug";

export interface LegacyAttributeInput {
  id?: unknown;
  name?: unknown;
  values?: unknown;
  [key: string]: unknown;
}

export interface ParsedAttribute {
  id?: string;
  name: string;
  values: string[];
}

export interface ExistingVariant extends Record<string, unknown> {
  combinationKey?: unknown;
  sku?: unknown;
  title?: unknown;
  isActive?: unknown;
}

export interface GeneratedVariant extends ExistingVariant {
  combinationKey: string;
  title: string;
  sku: string;
  isActive: unknown;
}

export type VariantMatchStrategy =
  | "combination-key"
  | "target-sku"
  | "legacy-sku"
  | "new";

export interface GeneratedVariantCandidate {
  combination: string[];
  combinationKey: string;
  matchStrategy: VariantMatchStrategy;
  previousSku: string | null;
  previousTitle: string | null;
  variant: GeneratedVariant;
}

export type SkuGenerationErrorCode =
  | "EMPTY_ATTRIBUTE_VALUES"
  | "COMBINATION_LIMIT_EXCEEDED"
  | "DUPLICATE_GENERATED_SKU"
  | "DUPLICATE_EXISTING_SKU"
  | "DUPLICATE_EXISTING_COMBINATION_KEY"
  | "DUPLICATE_ATTRIBUTE_NAME"
  | "INVALID_TEMPLATE"
  | "UNKNOWN_TEMPLATE_TOKEN"
  | "EMPTY_GENERATED_SKU";

export interface SkuGenerationIssue {
  code: SkuGenerationErrorCode;
  message: string;
  sku?: string;
  token?: string;
  attributeName?: string;
  combinationKey?: string;
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

export interface ConfigurableGenerationInput extends LegacyGenerationInput {
  profile: Exclude<SkuRuleProfile, "manual">;
  maximumCombinationCount: number;
  template: string;
  valueSeparator: string;
  valueNormalization: SkuValueNormalization;
}

export interface ReconciliationSummary {
  preserved: number;
  added: number;
  skuChanged: number;
  titleChanged: number;
  removed: number;
  matchedByCombinationKey: number;
  bootstrappedByTargetSku: number;
  bootstrappedByLegacySku: number;
}

export type ConfigurableGenerationResult =
  | {
      ok: true;
      combinationCount: number;
      candidates: GeneratedVariantCandidate[];
      variants: GeneratedVariant[];
      removedVariants: ExistingVariant[];
      summary: ReconciliationSummary;
    }
  | {
      ok: false;
      combinationCount: number;
      issues: SkuGenerationIssue[];
    };

export type LegacyGenerationResult = ConfigurableGenerationResult;

export interface VariantGenerationData extends Record<string, unknown> {
  triggerVariantGeneration?: unknown;
  attributes?: unknown;
  variants?: unknown;
  skuPrefix?: unknown;
  skuSuffix?: unknown;
  skuRuleProfile?: unknown;
  skuTemplate?: unknown;
  skuValueSeparator?: unknown;
  skuValueNormalization?: unknown;
  maxVariantCombinations?: unknown;
}