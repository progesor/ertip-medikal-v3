import type { CollectionConfig } from "payload";
import { applyConfiguredVariantGeneration } from "./applyLegacyVariantGeneration";
import type { VariantGenerationData } from "./types";

type BeforeChangeHook = NonNullable<
  NonNullable<CollectionConfig["hooks"]>["beforeChange"]
>[number];

export const configurableVariantGenerationHook: BeforeChangeHook = ({ data }) =>
  applyConfiguredVariantGeneration(data as VariantGenerationData);

export const legacyVariantGenerationHook = configurableVariantGenerationHook;