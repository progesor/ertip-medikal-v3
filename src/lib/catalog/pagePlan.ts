import type {
  CatalogConfig,
  CatalogPage,
  CatalogProduct,
} from "@/types/catalog";

export function automaticPages(
  products: CatalogProduct[],
  config: CatalogConfig,
): CatalogPage[] {
  const groups = new Map<string, CatalogProduct[]>();
  for (const product of products) {
    const key = config.groupByCategory
      ? String(
          config.groupLevel === "top"
            ? (product.sectionId ?? product.categoryId ?? product.category)
            : (product.categoryId ?? product.category),
        )
      : "all";
    groups.set(key, [...(groups.get(key) || []), product]);
  }
  const pages: CatalogPage[] = [];
  for (const [key, members] of groups) {
    const title = config.groupByCategory
      ? config.groupLevel === "top"
        ? members[0].sectionTitle || members[0].category
        : members[0].category
      : config.locale === "en"
        ? "Products"
        : "Ürünler";
    if (config.categoryDividers && config.dividerStyle === "page" && title) {
      pages.push({
        id: "section-" + key,
        kind: "divider",
        title,
        subtitle: "",
        productIds: [],
        density: config.density,
        layout: config.layout,
      });
    }
    const size = config.layout === "spotlight" ? 1 : Number(config.density);
    for (let i = 0; i < members.length; i += size) {
      pages.push({
        id: "group-" + key + "-" + i,
        kind: "products",
        title,
        subtitle: "",
        productIds: members.slice(i, i + size).map((p) => p.id),
        density: config.density,
        layout: config.layout,
      });
    }
  }
  return pages;
}

export function resolvePages(
  products: CatalogProduct[],
  config: CatalogConfig,
): CatalogPage[] {
  if (config.pageMode === "auto") return automaticPages(products, config);
  const known = new Set(products.map((p) => p.id));
  const used = new Set<number>();
  return config.pages
    .map((page) => ({
      ...page,
      productIds: page.productIds.filter((id) => {
        if (!known.has(id) || used.has(id)) return false;
        used.add(id);
        return true;
      }),
    }))
    .filter((page) => page.kind === "divider" || page.productIds.length);
}
