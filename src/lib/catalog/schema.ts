import { z } from "zod";

const id = z.number().int().positive();
const density = z.enum(["1", "2", "4", "6", "9"]);
export const catalogPageSchema = z.object({
  id: z.string().min(1).max(80),
  kind: z.enum(["products", "divider"]).default("products"),
  title: z.string().max(150).default(""),
  subtitle: z.string().max(300).default(""),
  productIds: z.array(id).max(2000).default([]),
  density: density.default("4"),
  layout: z.enum(["grid", "rows", "spotlight"]).default("grid"),
  accent: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  imageScale: z.number().int().min(60).max(100).optional(),
  description: z.enum(["short", "none"]).optional(),
  specLimit: z.number().int().min(1).max(30).optional(),
});
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
  density: density.default("4"),
  layout: z.enum(["grid", "rows", "spotlight"]).default("grid"),
  pageMode: z.enum(["auto", "manual"]).default("auto"),
  adaptiveLayout: z.boolean().default(true),
  featuredProductIds: z.array(id).max(100).default([]),
  pages: z
    .array(catalogPageSchema)
    .max(500)
    .refine(
      (pages) => new Set(pages.map((page) => page.id)).size === pages.length,
      "Sayfa kimlikleri benzersiz olmalı.",
    )
    .refine(
      (pages) =>
        pages.reduce((count, page) => count + page.productIds.length, 0) <=
        2000,
      "En fazla 2000 ürün yerleştirilebilir.",
    )
    .default([]),
  groupByCategory: z.boolean().default(true),
  groupLevel: z.enum(["top", "leaf"]).default("top"),
  categoryDividers: z.boolean().default(true),
  dividerStyle: z.enum(["band", "page"]).default("band"),
  toc: z.boolean().default(true),
  information: z.enum(["essential", "all"]).default("essential"),
  specLimit: z.number().int().min(1).max(30).default(6),
  shortTitles: z.boolean().default(true),
  coverDesign: z
    .object({
      title: z.string().max(150).default(""),
      eyebrow: z.string().max(80).default("ERTIP MEDIKAL"),
      edition: z.string().max(80).default("PRODUCT COLLECTION"),
      background: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .default("#142330"),
      foreground: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .default("#ffffff"),
      titleX: z.number().min(5).max(60).default(9),
      titleY: z.number().min(12).max(72).default(21),
      titleWidth: z.number().min(30).max(88).default(82),
      titleSize: z.number().min(20).max(64).default(42),
      align: z.enum(["left", "center", "right"]).default("left"),
      imageX: z.number().min(0).max(70).default(12),
      imageY: z.number().min(5).max(80).default(46),
      imageWidth: z.number().min(20).max(100).default(76),
      imageHeight: z.number().min(10).max(80).default(42),
      imageFit: z.enum(["contain", "cover"]).default("contain"),
    })
    .default(() => ({
      title: "",
      eyebrow: "ERTIP MEDIKAL",
      edition: "PRODUCT COLLECTION",
      background: "#142330",
      foreground: "#ffffff",
      titleX: 9,
      titleY: 21,
      titleWidth: 82,
      titleSize: 42,
      align: "left" as const,
      imageX: 12,
      imageY: 46,
      imageWidth: 76,
      imageHeight: 42,
      imageFit: "contain" as const,
    })),
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
        sku: z.string().max(120).optional(),
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
