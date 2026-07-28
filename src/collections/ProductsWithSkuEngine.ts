import type { CollectionConfig } from "payload";
import { Products as ProductsSchema } from "@/collections/Products";
import { legacyVariantGenerationHook } from "@/lib/sku-engine/payloadHook";

/**
 * Transitional collection adapter for M7.
 *
 * The schema remains in Products.ts while the legacy inline generation hook is
 * replaced at registration time by the extracted, testable SKU engine. This
 * keeps the Payload schema and database shape unchanged during the foundation
 * batch. The obsolete inline hook can be removed when Products.ts is split into
 * schema modules in the next schema-focused phase.
 */
export const Products: CollectionConfig = {
  ...ProductsSchema,
  hooks: {
    ...ProductsSchema.hooks,
    beforeChange: [legacyVariantGenerationHook],
  },
};
