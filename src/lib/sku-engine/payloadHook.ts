import type { CollectionConfig } from "payload";
import { applyLegacyVariantGeneration } from "./applyLegacyVariantGeneration";
import type { VariantGenerationData } from "./types";

type BeforeChangeHook = NonNullable<
  NonNullable<CollectionConfig["hooks"]>["beforeChange"]
>[number];

export const legacyVariantGenerationHook: BeforeChangeHook = ({ data }) =>
  applyLegacyVariantGeneration(data as VariantGenerationData);
