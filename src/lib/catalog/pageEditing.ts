import type { CatalogPage } from "@/types/catalog";
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
