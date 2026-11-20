import type { CatalogPage, CatalogSection } from "@/types/catalog";

/** productIds is authoritative; section membership cannot duplicate or hide products. */
export function pageSections(page: CatalogPage): CatalogSection[] {
  const source = page.sections?.length
    ? page.sections
    : [
        {
          id: page.id,
          title: page.title,
          subtitle: page.subtitle,
          productIds: page.productIds,
          columns:
            page.layout === "grid" ? (Number(page.density) >= 6 ? 3 : 2) : 1,
          layout:
            page.layout === "rows" ? ("rows" as const) : ("grid" as const),
        },
      ];
  const used = new Set<number>();
  const members = new Set(page.productIds);
  const sections = source.map((section) => ({
    ...section,
    productIds: page.productIds.filter((id) => {
      if (!members.has(id) || used.has(id) || !section.productIds.includes(id))
        return false;
      used.add(id);
      return true;
    }),
  }));
  sections[sections.length - 1].productIds.push(
    ...page.productIds.filter((id) => !used.has(id)),
  );
  return sections;
}

export function reconcilePageSections(page: CatalogPage): CatalogPage {
  return page.sections?.length
    ? { ...page, sections: pageSections(page) }
    : page;
}

export function setPageSections(
  page: CatalogPage,
  sections: CatalogSection[],
): CatalogPage {
  const used = new Set<number>();
  const unique = sections.map((section) => ({
    ...section,
    productIds: section.productIds.filter(
      (id) => !used.has(id) && !!used.add(id),
    ),
  }));
  return {
    ...page,
    sections: unique,
    productIds: unique.flatMap((s) => s.productIds),
  };
}

export function moveProductsToSection(
  pages: CatalogPage[],
  ids: number[],
  pageId: string,
  sectionId: string,
): CatalogPage[] {
  const target = pages.find(
    (page) => page.id === pageId && page.kind === "products",
  );
  if (!target || !pageSections(target).some((s) => s.id === sectionId))
    return pages;
  const selected = new Set(ids);
  return pages.map((page) => {
    if (page.id !== pageId)
      return reconcilePageSections({
        ...page,
        productIds: page.productIds.filter((id) => !selected.has(id)),
      });
    return setPageSections(
      page,
      pageSections(page).map((section) => ({
        ...section,
        productIds: [
          ...section.productIds.filter((id) => !selected.has(id)),
          ...(section.id === sectionId ? selected : []),
        ],
      })),
    );
  });
}

/** Physical splits carry only the groups present on that page. Empty editor slots remain elsewhere. */
export function prunePageSections(page: CatalogPage): CatalogPage {
  if (!page.sections?.length) return page;
  const sections = pageSections(page).filter(
    (section) => section.productIds.length,
  );
  return {
    ...page,
    sections,
    title: sections.length === 1 ? sections[0].title : page.title,
  };
}
