import type { CatalogConfig } from "@/types/catalog";

export const catalogPresets = [
  {
    id: "overview",
    title: "Kısa ürün kataloğu",
    description: "6 ürün hedefi, kısa açıklama ve temel teknik bilgiler.",
  },
  {
    id: "directory",
    title: "Kompakt ürün rehberi",
    description: "9 ürün hedefi, görsel, kod ve 3 temel özellik.",
  },
  {
    id: "brochure",
    title: "Ürün broşürü",
    description:
      "2 ürün hedefi, büyük görseller ve teknik bilgiler. Kapaksız, doğrudan ürünlerle başlar.",
  },
  {
    id: "collection",
    title: "Vitrin koleksiyonu",
    description:
      "Öne çıkardığınız ürünler tam sayfa, diğer ürünler 4'lü düzende.",
  },
] as const;
export type CatalogPresetId = (typeof catalogPresets)[number]["id"];

// Product selection, branding and catalogue-only edits are deliberately preserved.
export function applyCatalogPreset(
  config: CatalogConfig,
  preset: CatalogPresetId,
): CatalogConfig {
  return {
    ...config,
    pageMode: "auto",
    adaptiveLayout: true,
    layout: "grid",
    paper: "A4",
    orientation: "portrait",
    information: "essential",
    density:
      preset === "directory"
        ? "9"
        : preset === "brochure"
          ? "2"
          : preset === "collection"
            ? "4"
            : "6",
    description: preset === "directory" ? "none" : "short",
    specLimit: preset === "directory" ? 3 : preset === "overview" ? 4 : 6,
    showSku: true,
    showSpecs: true,
    showVariants: false,
    showPackaging: false,
    showDimensions: false,
    groupByCategory: preset === "overview",
    groupLevel: "top",
    categoryDividers: true,
    dividerStyle: "band",
    toc: preset !== "brochure",
    backCover: preset !== "brochure",
    cover:
      preset === "brochure"
        ? "none"
        : config.cover === "none"
          ? "collage"
          : config.cover,
    featuredProductIds:
      preset === "collection" ? config.featuredProductIds : [],
  };
}
