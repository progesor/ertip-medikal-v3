import type { PayloadRequest } from "payload";
import { Forbidden } from "payload";
import { isContentManager } from "@/access/roles";

export const reviewPath = "/admin/collections/products/icerik-kontrolu";
export const reviewFilters = ["all", "image", "tr", "en", "sku"] as const;
export type ReviewFilter = (typeof reviewFilters)[number];

export const filterLabels: Record<ReviewFilter, string> = {
  all: "Tüm eksikler",
  image: "Ana görsel",
  tr: "Türkçe metin",
  en: "İngilizce metin",
  sku: "Katalog kodu (SKU)",
};
const textFields = ["title", "shortDescription", "description"] as const;
export const textLabels = {
  title: "Başlık",
  shortDescription: "Kısa açıklama",
  description: "Detaylı açıklama",
};

function localizedText(value: unknown, locale: "tr" | "en") {
  if (!value || typeof value !== "object") return "";
  const text = (value as Record<string, unknown>)[locale];
  return typeof text === "string" ? text.trim() : "";
}

function hasText(value: string) {
  return Boolean(
    value.replace(
      /<\/?[a-z][^>]*>|&nbsp;|&#160;|&#xA0;|[\s\u200B\uFEFF]/gi,
      "",
    ),
  );
}

type ReviewSource = {
  id: number;
  title?: unknown;
  shortDescription?: unknown;
  description?: unknown;
  mainImage?: unknown;
  sku?: string | null;
  _status?: string | null;
  variants?: { sku?: string | null; isActive?: boolean | null }[] | null;
};

function inspect(product: ReviewSource) {
  const issues: Exclude<ReviewFilter, "all">[] = [];
  if (!product.mainImage) issues.push("image");
  const missingText = (locale: "tr" | "en") =>
    textFields.filter(
      (field) => !hasText(localizedText(product[field], locale)),
    );
  const tr = missingText("tr");
  const en = missingText("en");
  if (tr.length) issues.push("tr");
  if (en.length) issues.push("en");
  const variants = product.variants ?? [];
  const missingVariantSkus = variants.filter(
    (v) => v.isActive !== false && !v.sku?.trim(),
  ).length;
  const missingProductSku = !variants.length && !product.sku?.trim();
  if (missingVariantSkus || missingProductSku) issues.push("sku");
  return {
    id: product.id,
    title:
      localizedText(product.title, "tr") ||
      localizedText(product.title, "en") ||
      `Adsız ürün #${product.id}`,
    status: product._status,
    issues,
    missingText: { tr, en },
    missingVariantSkus,
    missingProductSku,
  };
}

export async function listProductContentIssues(
  req: PayloadRequest,
  {
    filter = "all",
    after,
    before,
    limit = 20,
  }: {
    filter?: ReviewFilter;
    after?: number;
    before?: number;
    limit?: number;
  } = {},
) {
  if (req.user?.collection !== "users" || !isContentManager(req.user))
    throw new Forbidden();
  const items: ReturnType<typeof inspect>[] = [];
  const backward = before !== undefined;
  let cursor = before ?? after;
  const batchSize = 100;
  // Localized Local API calls mutate req.locale. Keep the panel's editing locale intact.
  const readRequest = {
    user: req.user,
    i18n: req.i18n,
    headers: req.headers,
    context: req.context,
    transactionID: req.transactionID,
    payloadAPI: req.payloadAPI,
  };
  // Page by product ID so edits to a draft's text or timestamp do not move it between batches.
  while (items.length <= limit) {
    const { docs } = await req.payload.find({
      collection: "products",
      req: readRequest,
      user: req.user,
      overrideAccess: false,
      draft: true,
      locale: "all",
      fallbackLocale: false,
      depth: 0,
      limit: batchSize,
      pagination: false,
      sort: backward ? "id" : "-id",
      where:
        cursor === undefined
          ? undefined
          : { id: backward ? { greater_than: cursor } : { less_than: cursor } },
      select: {
        title: true,
        description: true,
        shortDescription: true,
        mainImage: true,
        sku: true,
        _status: true,
        variants: { sku: true, isActive: true },
      },
    });
    for (const doc of docs) {
      const item = inspect(doc);
      if (
        item.issues.length &&
        (filter === "all" || item.issues.includes(filter))
      )
        items.push(item);
      if (items.length > limit) break;
    }
    if (docs.length < batchSize) break;
    cursor = docs[docs.length - 1].id;
  }
  const more = items.length > limit;
  const products = items.slice(0, limit);
  if (backward) products.reverse();
  return {
    filter,
    products,
    previousBefore: (backward ? more : after !== undefined)
      ? (products[0]?.id ?? null)
      : null,
    nextAfter: backward || more ? (products.at(-1)?.id ?? null) : null,
  };
}
