import { z } from "zod";

const id = z.number().int().positive();
export const catalogConfigSchema = z.object({
  version: z.literal(1).default(1),
  locale: z.enum(["tr", "en"]).default("tr"),
  selection: z.enum(["all", "categories", "products"]).default("all"),
  categoryIds: z.array(id).max(200).default([]),
  productIds: z.array(id).max(2000).default([]),
  includeChildren: z.boolean().default(true),
  theme: z.enum(["corporate", "premium", "compact"]).default("corporate"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#2456a6"),
  paper: z.enum(["A4", "A5"]).default("A4"),
  orientation: z.enum(["portrait", "landscape"]).default("portrait"),
  density: z.enum(["1", "2", "4", "6", "9"]).default("2"),
  font: z.enum(["sans", "serif"]).default("sans"),
  cover: z.enum(["image", "collage", "type", "none"]).default("image"),
  coverImageId: id.nullable().default(null),
  subtitle: z.string().max(300).default(""),
  footer: z.string().max(200).default("ERTIP MEDIKAL"),
  backCover: z.boolean().default(true),
  description: z.enum(["short", "none"]).default("short"),
  showSku: z.boolean().default(true),
  showSpecs: z.boolean().default(true),
  showVariants: z.boolean().default(false),
  showDimensions: z.boolean().default(false),
  showPackaging: z.boolean().default(false),
  showLinks: z.boolean().default(true),
  fallbackTurkish: z.boolean().default(false),
  profile: z.enum(["digital", "quality"]).default("digital"),
  overrides: z
    .array(
      z.object({
        productId: id,
        title: z.string().max(240).optional(),
        description: z.string().max(20000).optional(),
        imageId: id.nullable().optional(),
      }),
    )
    .max(2000)
    .default([]),
});
export const catalogSaveSchema = z.object({
  id: id.optional(),
  updatedAt: z.string().optional(),
  title: z.string().trim().min(1).max(150),
  isTemplate: z.boolean().default(false),
  config: catalogConfigSchema,
});
export const defaultCatalogConfig = catalogConfigSchema.parse({});
