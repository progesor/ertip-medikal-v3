import type { Payload, Where } from "payload";
import type { Media } from "@/payload-types";
import type {
  CatalogConfig,
  CatalogImage,
  CatalogSnapshot,
  CatalogWarning,
} from "@/types/catalog";
import { serverEnv } from "@/lib/config/env";
import { catalogLabel } from "@/lib/i18n/catalogLabels";
import { catalogOptions } from "./options";
import { catalogIdentity } from "./identity";
import { loadImageOptimizationSettings } from "@/lib/imageOptimization/server";

export function catalogImage(value: unknown): CatalogImage | null {
  if (!value || typeof value !== "object" || !("filename" in value))
    return null;
  const media = value as Media;
  if (!media.filename || !media.mimeType?.startsWith("image/")) return null;
  return {
    id: media.id,
    filename: media.filename,
    url: "/api/media/file/" + encodeURIComponent(media.filename),
    width: media.width || 0,
    height: media.height || 0,
  };
}
export async function catalogSnapshot(
  payload: Payload,
  title: string,
  config: CatalogConfig,
): Promise<CatalogSnapshot> {
  const categories = await payload.find({
    collection: "categories",
    locale: config.locale,
    fallbackLocale: config.fallbackTurkish ? "tr" : false,
    limit: 1000,
    depth: 0,
  });
  const selected = new Set(config.categoryIds);
  if (config.includeChildren) {
    let previous = -1;
    while (previous !== selected.size) {
      previous = selected.size;
      for (const c of categories.docs)
        if (typeof c.parent === "number" && selected.has(c.parent))
          selected.add(c.id);
    }
  }
  const conditions: Where[] = [{ _status: { equals: "published" } }];
  if (config.selection === "products")
    conditions.push({ id: { in: config.productIds } });
  if (config.selection === "categories")
    conditions.push({ category: { in: [...selected] } });
  const result = await payload.find({
    collection: "products",
    locale: config.locale,
    fallbackLocale: config.fallbackTurkish ? "tr" : false,
    where: { and: conditions },
    sort: "_order",
    limit: 2000,
    depth: 1,
    draft: false,
  });
  if (result.hasNextPage)
    throw Error("Tek çalışmada en fazla 2000 ürün seçebilirsiniz.");
  const overrides = new Map(config.overrides.map((o) => [o.productId, o]));
  const images = new Map<number, CatalogImage | null>();
  const imageIds = [
    ...new Set(
      [config.coverImageId, ...config.overrides.map((o) => o.imageId)].filter(
        (n): n is number => typeof n === "number",
      ),
    ),
  ];
  if (imageIds.length) {
    const media = await payload.find({
      collection: "media",
      where: { id: { in: imageIds } },
      depth: 0,
      limit: imageIds.length,
    });
    for (const image of media.docs) images.set(image.id, catalogImage(image));
  }
  const warnings: CatalogWarning[] = [];
  const products = result.docs.map((p) => {
    const custom = overrides.get(p.id);
    const image =
      custom?.imageId !== undefined
        ? images.get(custom.imageId || 0) || null
        : catalogImage(p.mainImage);
    const name =
      custom?.title ??
      (config.shortTitles
        ? p.title?.replace(/^(?:ERTIP|ERTİP|Ertıp)\s+/iu, "")
        : p.title) ??
      "";
    const identity =
      custom?.sku !== undefined
        ? {
            sku: custom.sku,
            skuLabel: config.locale === "en" ? "Product code" : "Ürün kodu",
          }
        : catalogIdentity(p, config.locale);
    const memberships = p.category.map((c) =>
      typeof c === "object" ? c.id : c,
    );
    const primaryCategory =
      categories.docs.find(
        (c) =>
          memberships.includes(c.id) &&
          !categories.docs.some(
            (child) => memberships.includes(child.id) && child.parent === c.id,
          ),
      ) || categories.docs.find((c) => memberships.includes(c.id));
    let section = primaryCategory;
    const visited = new Set<number>();
    while (
      section &&
      typeof section.parent === "number" &&
      !visited.has(section.id)
    ) {
      visited.add(section.id);
      const parent = categories.docs.find((c) => c.id === section!.parent);
      if (!parent) break;
      section = parent;
    }
    const description = custom?.description ?? p.shortDescription ?? "";
    const add = (message: string) =>
      warnings.push({
        productId: p.id,
        message: (name || "#" + p.id) + " · " + message,
      });
    if (!name.trim())
      add(
        config.locale === "en" ? "İngilizce ürün adı eksik" : "Ürün adı eksik",
      );
    if (config.description !== "none" && !description.trim())
      add("Seçilen dilde açıklama eksik");
    if (!image) add("Ürün görseli eksik");
    if (image && image.width < (Number(config.density) <= 2 ? 900 : 400))
      add("Görsel baskı için düşük çözünürlüklü olabilir");
    if (
      config.showSku &&
      !p.sku &&
      !p.variants?.some((v) => v.isActive !== false && v.sku)
    )
      add("SKU eksik");
    return {
      id: p.id,
      sourceDefaults: {
        title:
          (config.shortTitles
            ? p.title?.replace(/^(?:ERTIP|ERTİP|Ertıp)\s+/iu, "")
            : p.title) || "",
        ...catalogIdentity(p, config.locale),
        description: p.shortDescription || "",
        image: catalogImage(p.mainImage),
      },
      title: name || (config.locale === "en" ? "Product" : "Ürün") + " " + p.id,
      ...identity,
      categoryId: primaryCategory?.id,
      sectionId: section?.id,
      sectionTitle: section?.title || "",
      category: primaryCategory?.title || "",
      description,
      image,
      gallery: (p.gallery || [])
        .map((g) => catalogImage(g.image))
        .filter((g): g is CatalogImage => Boolean(g)),
      specs: (p.specs || []).map((s) => ({ key: s.key, value: s.value })),
      options: catalogOptions(p, config.locale),
      dimensions: [
        p.width && p.width + " cm",
        p.height && p.height + " cm",
        p.depth && p.depth + " cm",
        p.weight && p.weight + " kg",
      ]
        .filter(Boolean)
        .join(" × "),
      packaging: (p.packaging || []).map((p) =>
        [
          catalogLabel(p.packageLabel || "", config.locale),
          p.quantity,
          p.grossWeight && p.grossWeight + " kg",
        ]
          .filter(Boolean)
          .join(" · "),
      ),
      updatedAt: p.updatedAt,
      link:
        serverEnv.publicSiteUrl +
        "/" +
        config.locale +
        "/products/" +
        encodeURIComponent(p.slug || ""),
    };
  });
  if (config.selection === "products") {
    const ranks = new Map(config.productIds.map((n, i) => [n, i]));
    products.sort((a, b) => (ranks.get(a.id) || 0) - (ranks.get(b.id) || 0));
    for (const id of config.productIds)
      if (!products.some((p) => p.id === id))
        warnings.push({
          productId: id,
          message: "#" + id + " yayımlanmış ürünler arasında bulunamadı.",
        });
  }
  if (config.pageMode === "manual") {
    const placed = new Set(
      config.pages
        .filter((page) => page.kind === "products")
        .flatMap((page) => page.productIds),
    );
    const missing = products.filter((product) => !placed.has(product.id));
    if (missing.length)
      warnings.push({
        message:
          missing.length +
          " ürün sayfa planına yerleştirilmedi; PDF içinde görünmeyecek.",
      });
    for (const id of placed)
      if (!products.some((product) => product.id === id))
        warnings.push({
          productId: id,
          message:
            "#" +
            id +
            " sayfa planında, ancak seçilen yayındaki ürünler arasında bulunamadı.",
        });
  }
  return {
    title,
    config,
    imageProfiles: (await loadImageOptimizationSettings(payload)).settings
      .profiles,
    products,
    coverImage:
      images.get(config.coverImageId || 0) || products[0]?.image || null,
    warnings,
    createdAt: new Date().toISOString(),
  };
}
