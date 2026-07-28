import type { CollectionConfig } from "payload";
import { applyLegacyVariantGeneration } from "./applyLegacyVariantGeneration.js";
import type { VariantGenerationData } from "./types.js";

type BeforeChangeHook = NonNullable<
  NonNullable<CollectionConfig["hooks"]>["beforeChange"]
>[number];

export const legacyVariantGenerationHook: BeforeChangeHook = ({ data }) =>
  applyLegacyVariantGeneration(data as VariantGenerationData);
