import type { CatalogPage, CatalogPagePreview } from "@/types/catalog";

export function moveCatalogProducts(
  pages: CatalogPage[],
  ids: number[],
  targetId: string,
) {
  if (!pages.some((p) => p.id === targetId && p.kind === "products"))
    return pages;
  const selected = new Set(ids);
  return pages.map((page) => ({
    ...page,
    productIds:
      page.id === targetId
        ? [...page.productIds.filter((id) => !selected.has(id)), ...selected]
        : page.productIds.filter((id) => !selected.has(id)),
  }));
}

export function splitCatalogPage(
  pages: CatalogPage[],
  pageId: string,
  ids: number[],
  newId: string,
) {
  const index = pages.findIndex(
    (page) => page.id === pageId && page.kind === "products",
  );
  if (index < 0 || pages.some((page) => page.id === newId)) return pages;
  const page = pages[index],
    selected = new Set(ids);
  const moved = page.productIds.filter((id) => selected.has(id));
  if (!moved.length || moved.length === page.productIds.length) return pages;
  const next = [...pages];
  next.splice(
    index,
    1,
    { ...page, productIds: page.productIds.filter((id) => !selected.has(id)) },
    { ...page, id: newId, productIds: moved },
  );
  return next;
}

export function mergeCatalogPage(pages: CatalogPage[], pageId: string) {
  const index = pages.findIndex((page) => page.id === pageId);
  if (
    index < 0 ||
    pages[index].kind !== "products" ||
    pages[index + 1]?.kind !== "products"
  )
    return pages;
  const next = [...pages];
  next.splice(index, 2, {
    ...pages[index],
    productIds: [
      ...new Set([...pages[index].productIds, ...pages[index + 1].productIds]),
    ],
  });
  return next;
}

// Convert measured PDF groups to editable pages. Continuations keep their source product once.
export function pagesFromPreview(
  plans: CatalogPage[],
  sheets: CatalogPagePreview[],
): CatalogPage[] {
  const seen = new Set<number>();
  return sheets.flatMap((sheet, index) => {
    const plan = plans.find((page) => page.id === sheet.id);
    if (!plan || (sheet.kind !== "products" && sheet.kind !== "divider"))
      return [];
    const productIds = sheet.productIds.filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    if (sheet.kind === "products" && !productIds.length) return [];
    const layout =
      sheet.layout === "rows" || sheet.layout === "spotlight"
        ? sheet.layout
        : plan.layout;
    return [
      {
        ...plan,
        id: ("fixed-" + index + "-" + plan.id).slice(0, 80),
        productIds,
        layout,
      },
    ];
  });
}
export function moveCatalogProduct(
  pages: CatalogPage[],
  productId: number,
  targetId: string,
  position?: number,
) {
  if (!pages.some((p) => p.id === targetId && p.kind === "products"))
    return pages;
  const next = pages.map((page) => ({
    ...page,
    productIds: page.productIds.filter((id) => id !== productId),
  }));
  const target = next.find((page) => page.id === targetId)!;
  const oldIndex = pages
    .find((page) => page.id === targetId)!
    .productIds.indexOf(productId);
  const insertion =
    position !== undefined && oldIndex >= 0 && oldIndex < position
      ? position - 1
      : position;
  target.productIds.splice(
    Math.max(
      0,
      Math.min(insertion ?? target.productIds.length, target.productIds.length),
    ),
    0,
    productId,
  );
  return next;
}
export function moveCatalogPage(
  pages: CatalogPage[],
  sourceId: string,
  targetId: string,
) {
  const source = pages.find((p) => p.id === sourceId);
  if (!source || sourceId === targetId || !pages.some((p) => p.id === targetId))
    return pages;
  const next = pages.filter((p) => p.id !== sourceId);
  next.splice(
    next.findIndex((p) => p.id === targetId),
    0,
    source,
  );
  return next;
}
