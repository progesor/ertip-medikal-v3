import type { CollectionConfig } from "payload";
import { Products as ProductsSchema } from "@/collections/Products";
import { enhanceProductFields } from "@/collections/productSkuFields";
import { configurableVariantGenerationHook } from "@/lib/sku-engine/payloadHook";

export const Products: CollectionConfig = {
  ...ProductsSchema,
  fields: enhanceProductFields(ProductsSchema.fields),
  hooks: {
    ...ProductsSchema.hooks,
    beforeChange: [configurableVariantGenerationHook],
  },
};