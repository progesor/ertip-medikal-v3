import { z } from "zod";
const ids = z.array(z.number().int().positive()).max(5000).default([]);
export const productExportSchema = z
  .object({
    scope: z.enum(["all", "categories", "products"]).default("all"),
    categoryIds: ids,
    productIds: ids,
    includeChildren: z.boolean().default(true),
    status: z.enum(["published", "all", "draft"]).default("published"),
    includeImages: z.boolean().default(false),
    includeDocuments: z.boolean().default(false),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      (data.scope === "categories" && !data.categoryIds.length) ||
      (data.scope === "products" && !data.productIds.length)
    )
      ctx.addIssue({ code: "custom", message: "En az bir kayıt seçin." });
  });
