import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import {
  Search,
  ChevronRight,
  LayoutGrid,
  CornerDownRight,
  X,
  PackageX,
  ChevronLeft,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ürünlerimiz",
  description:
    "Ertip Medikal yenilikçi cihaz kataloğu. Saç ekim motorları, iğnesiz anestezi cihazları ve tüm medikal çözümlerimiz.",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type ProductSortMode = "newest" | "oldest" | "manual";

function getRelationshipId(value: unknown) {
  if (
    typeof value === "object" &&
    value !== null &&
    "id" in value
  ) {
    return String((value as { id: string | number }).id);
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "";
}

function sortProductsManually(products: any[], manualOrder: unknown[]) {
  const manualRanks = new Map(
    manualOrder
      .map((item, index) => [getRelationshipId(item), index] as const)
      .filter(([id]) => Boolean(id)),
  );

  return [...products].sort((first, second) => {
    const firstRank = manualRanks.get(String(first.id));
    const secondRank = manualRanks.get(String(second.id));

    if (firstRank !== undefined && secondRank !== undefined) {
      return firstRank - secondRank;
    }
    if (firstRank !== undefined) return -1;
    if (secondRank !== undefined) return 1;

    return (
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime()
    );
  });
}

function getProductImageUrl(product: any) {
  if (typeof product.mainImage !== "object" || !product.mainImage) {
    return "/placeholder.jpg";
  }

  return (
    product.mainImage.sizes?.card?.url ||
    product.mainImage.url ||
    "/placeholder.jpg"
  );
}

export default async function ProductsPage({ searchParams }: Props) {
  const payload = await getPayload({ config: configPromise });
  const params = await searchParams;

  const query = typeof params.q === "string" ? params.q.trim() : "";
  const categorySlug =
    typeof params.category === "string" ? params.category : "";
  const parsedPage =
    typeof params.page === "string" ? Number.parseInt(params.page, 10) : 1;
  const currentPage =
    Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const pageSize = 12;

  const [{ docs: categories }, siteSettings] = await Promise.all([
    payload.find({
      collection: "categories",
      limit: 100,
      depth: 0,
    }),
    payload.findGlobal({
      slug: "site-settings",
      depth: 0,
    }),
  ]);

  const parentCategories = categories.filter((category: any) => !category.parent);
  const getChildren = (parentId: string | number) =>
    categories.filter((category: any) => {
      if (!category.parent) return false;
      const relationshipId =
        typeof category.parent === "object"
          ? category.parent.id
          : category.parent;
      return String(relationshipId) === String(parentId);
    });

  const activeCategory = categories.find(
    (category: any) => category.slug === categorySlug,
  );
  const categoryIds: (string | number)[] = [];

  if (activeCategory) {
    categoryIds.push(activeCategory.id);
    getChildren(activeCategory.id).forEach((child: any) => {
      categoryIds.push(child.id);
    });
  }

  const whereClause: any = { _status: { equals: "published" } };

  if (query) {
    whereClause.or = [
      { title: { like: query } },
      { sku: { like: query } },
      { "variants.sku": { like: query } },
      { "variants.title": { like: query } },
    ];
  }

  if (categoryIds.length > 0) {
    whereClause.category = { in: categoryIds };
  }

  const catalogSettings = siteSettings.productCatalog;
  const globalSortMode = (catalogSettings?.defaultSortMode ||
    "newest") as ProductSortMode;
  const categorySortMode = activeCategory?.productSortMode;
  const effectiveSortMode = (
    categorySortMode && categorySortMode !== "inherit"
      ? categorySortMode
      : globalSortMode
  ) as ProductSortMode;
  const manualOrder =
    effectiveSortMode === "manual"
      ? categorySortMode === "manual"
        ? activeCategory?.manualProductOrder || []
        : catalogSettings?.manualProductOrder || []
      : [];

  let products: any[] = [];
  let totalPages = 0;
  let hasPrevPage = false;
  let hasNextPage = false;
  let prevPage: number | null = null;
  let nextPage: number | null = null;
  let totalDocs = 0;

  if (effectiveSortMode === "manual") {
    const result = await payload.find({
      collection: "products",
      where: whereClause,
      sort: "-createdAt",
      pagination: false,
      depth: 1,
    });

    const orderedProducts = sortProductsManually(result.docs, manualOrder);
    totalDocs = orderedProducts.length;
    totalPages = Math.ceil(totalDocs / pageSize);

    const startIndex = (currentPage - 1) * pageSize;
    products = orderedProducts.slice(startIndex, startIndex + pageSize);
    hasPrevPage = currentPage > 1;
    hasNextPage = currentPage < totalPages;
    prevPage = hasPrevPage ? currentPage - 1 : null;
    nextPage = hasNextPage ? currentPage + 1 : null;
  } else {
    const result = await payload.find({
      collection: "products",
      where: whereClause,
      sort: effectiveSortMode === "oldest" ? "createdAt" : "-createdAt",
      limit: pageSize,
      page: currentPage,
      depth: 1,
    });

    products = result.docs;
    totalPages = result.totalPages;
    hasPrevPage = result.hasPrevPage;
    hasNextPage = result.hasNextPage;
    prevPage = result.prevPage ?? null;
    nextPage = result.nextPage ?? null;
    totalDocs = result.totalDocs;
  }

  const buildPageUrl = (pageNumber: number) => {
    const urlParams = new URLSearchParams();
    if (query) urlParams.set("q", query);
    if (categorySlug) urlParams.set("category", categorySlug);
    urlParams.set("page", pageNumber.toString());
    return `/urunler?${urlParams.toString()}`;
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-12">
      <div className="mb-8 py-2">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h1 className="mb-2 text-3xl font-bold text-text-main">
            Ürün Kataloğu
          </h1>
          <p className="text-text-muted">
            İhtiyacınız olan medikal cihazı hızlıca bulun.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-10 lg:flex-row">
          <aside className="w-full space-y-8 lg:w-1/4">
            <div className="rounded-[var(--radius-2xl)] border border-border/80 bg-surface p-6 shadow-sm shadow-surface-inverse/5">
              <h2 className="mb-4 flex items-center gap-2 font-bold text-text-main">
                <Search className="h-5 w-5 text-primary" /> Ürün / SKU Ara
              </h2>
              <form action="/urunler" method="GET" className="relative">
                {categorySlug && (
                  <input type="hidden" name="category" value={categorySlug} />
                )}
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Örn: 110-0625 veya FUE..."
                  className="w-full rounded-[var(--radius)] border border-input bg-background py-3 pl-4 pr-12 text-sm font-medium text-text-main outline-none transition-all placeholder:text-text-muted/50 focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-primary p-1.5 text-primary-foreground transition-colors hover:bg-primary/90"
                  aria-label="Ürün ara"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </form>
            </div>

            <div className="sticky top-24 rounded-[var(--radius-2xl)] border border-border/80 bg-surface p-6 shadow-sm shadow-surface-inverse/5">
              <h2 className="mb-4 flex items-center gap-2 font-bold text-text-main">
                <LayoutGrid className="h-5 w-5 text-primary" /> Kategoriler
              </h2>
              <div className="space-y-1.5">
                <Link
                  href={`/urunler${query ? `?q=${encodeURIComponent(query)}` : ""}`}
                  className={`block rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                    !categorySlug
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-text-muted hover:bg-surface-muted hover:text-text-main"
                  }`}
                >
                  Tüm Ürünler
                </Link>

                {parentCategories.map((parent: any) => {
                  const isParentActive = categorySlug === parent.slug;
                  const children = getChildren(parent.id);
                  const isChildActive = children.some(
                    (child: any) => child.slug === categorySlug,
                  );
                  const isExpanded = isParentActive || isChildActive;

                  return (
                    <div key={parent.id} className="pt-1">
                      <Link
                        href={`/urunler?category=${encodeURIComponent(parent.slug)}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                        className={`block rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                          isParentActive
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : isExpanded
                              ? "bg-primary/10 text-primary"
                              : "text-text-muted hover:bg-surface-muted hover:text-text-main"
                        }`}
                      >
                        {parent.title}
                      </Link>

                      {children.length > 0 && (
                        <div className="mb-3 ml-5 mt-1.5 space-y-1 border-l-2 border-border pl-3">
                          {children.map((child: any) => {
                            const isCurrentChild = categorySlug === child.slug;

                            return (
                              <Link
                                key={child.id}
                                href={`/urunler?category=${encodeURIComponent(child.slug)}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                  isCurrentChild
                                    ? "bg-primary/10 font-bold text-primary"
                                    : "text-text-muted hover:bg-surface-muted hover:text-text-main"
                                }`}
                              >
                                <CornerDownRight
                                  className={`h-3.5 w-3.5 ${
                                    isCurrentChild ? "text-primary" : "opacity-40"
                                  }`}
                                />
                                {child.title}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          <main className="w-full lg:w-3/4">
            <div className="mb-6 flex flex-col justify-between gap-4 rounded-[var(--radius-xl)] border border-border/80 bg-surface p-4 shadow-sm shadow-surface-inverse/5 sm:flex-row sm:items-center">
              <p className="text-sm font-medium text-text-muted">
                Toplam <strong className="text-base text-text-main">{totalDocs}</strong>{" "}
                ürün bulundu. (Sayfa {currentPage}/{totalPages || 1})
              </p>

              {(query || categorySlug) && (
                <div className="flex flex-wrap gap-2">
                  {query && (
                    <Link
                      href={`/urunler${categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : ""}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-surface-muted px-3 py-1.5 text-xs font-bold text-text-main transition-colors hover:bg-error/10 hover:text-error"
                    >
                      Arama: &quot;{query}&quot; <X className="h-3.5 w-3.5" />
                    </Link>
                  )}
                  {categorySlug && activeCategory && (
                    <Link
                      href={`/urunler${query ? `?q=${encodeURIComponent(query)}` : ""}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-error/10 hover:text-error"
                    >
                      Kategori: {activeCategory.title} <X className="h-3.5 w-3.5" />
                    </Link>
                  )}
                  <Link
                    href="/urunler"
                    className="ml-2 inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-bold text-text-muted underline transition-colors hover:text-text-main"
                  >
                    Tümünü Temizle
                  </Link>
                </div>
              )}
            </div>

            {products.length === 0 ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[var(--radius-2xl)] border border-border bg-surface p-16 text-center shadow-sm">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-muted text-text-muted">
                  <PackageX className="h-10 w-10" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-text-main">
                  Sonuç Bulunamadı
                </h2>
                <p className="mb-8 max-w-md text-text-muted">
                  Aradığınız kriterlere uygun ürün veya SKU kodu sistemimizde
                  bulunmuyor. Farklı kelimelerle aramayı deneyebilirsiniz.
                </p>
                <Button asChild size="lg" className="rounded-xl font-bold">
                  <Link href="/urunler">Tüm Kataloğu Göster</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product: any) => (
                    <Card
                      key={product.id}
                      className="group flex flex-col overflow-hidden rounded-[var(--radius-2xl)] border-border/80 bg-surface shadow-sm shadow-surface-inverse/5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
                    >
                      <Link
                        href={`/urunler/${product.slug}`}
                        prefetch={false}
                        className="relative flex aspect-square items-center justify-center overflow-hidden bg-surface-muted/70 p-6"
                      >
                        <Image
                          src={getProductImageUrl(product)}
                          alt={product.mainImage?.alt || product.title}
                          fill
                          className="object-contain p-8 mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(50vw - 28px), (max-width: 1279px) calc(37.5vw - 40px), 294px"
                          quality={75}
                        />
                        <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
                          {product.sku && (
                            <span className="rounded-md border border-border bg-surface px-2.5 py-1 font-mono text-[10px] font-bold text-text-muted shadow-sm">
                              {product.sku}
                            </span>
                          )}
                          {Array.isArray(product.variants) &&
                            product.variants.length > 0 && (
                              <span className="rounded-md bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary shadow-sm">
                                {product.variants.length} Model
                              </span>
                            )}
                        </div>
                      </Link>
                      <CardHeader className="pb-2 pt-6">
                        <CardTitle className="line-clamp-2 text-lg font-bold leading-snug">
                          <Link
                            href={`/urunler/${product.slug}`}
                            prefetch={false}
                            className="text-text-main transition-colors hover:text-primary"
                          >
                            {product.title}
                          </Link>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 pb-4">
                        <p className="line-clamp-2 text-sm leading-relaxed text-text-muted">
                          {product.shortDescription}
                        </p>
                      </CardContent>
                      <CardFooter className="px-6 pb-6 pt-0">
                        <Button
                          className="w-full rounded-xl bg-surface-inverse font-bold text-surface-inverse-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                          asChild
                        >
                          <Link href={`/urunler/${product.slug}`} prefetch={false}>
                            Ürünü İncele
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    {hasPrevPage && prevPage ? (
                      <Link
                        href={buildPageUrl(prevPage)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-muted shadow-sm transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                        aria-label="Önceki sayfa"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Link>
                    ) : (
                      <div className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-xl border border-border bg-surface-muted text-text-muted/50">
                        <ChevronLeft className="h-5 w-5" />
                      </div>
                    )}

                    <div className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-2 shadow-sm">
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                        (pageNumber) => (
                          <Link
                            key={pageNumber}
                            href={buildPageUrl(pageNumber)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-all ${
                              currentPage === pageNumber
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                : "text-text-muted hover:bg-surface-muted hover:text-text-main"
                            }`}
                          >
                            {pageNumber}
                          </Link>
                        ),
                      )}
                    </div>

                    {hasNextPage && nextPage ? (
                      <Link
                        href={buildPageUrl(nextPage)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-muted shadow-sm transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                        aria-label="Sonraki sayfa"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    ) : (
                      <div className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-xl border border-border bg-surface-muted text-text-muted/50">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
