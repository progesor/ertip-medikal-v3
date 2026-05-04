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
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ürünlerimiz",
  description:
      "Ertip Medikal yenilikçi cihaz kataloğu. Saç ekim motorları, iğnesiz anestezi cihazları ve tüm medikal çözümlerimiz.",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const payload = await getPayload({ config: configPromise });

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const categorySlug =
      typeof params.category === "string" ? params.category : "";

  // --- 1. SAYFALAMA (PAGINATION) PARAMETRESİNİ AL ---
  const pageParam =
      typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const LIMIT = 12;

  // 2. Kategorileri Çek
  const { docs: categories } = await payload.find({
    collection: "categories",
    limit: 100,
    depth: 1,
  });

  const parentCategories = categories.filter((c: any) => !c.parent);

  const getChildren = (parentId: string | number) => {
    return categories.filter((c: any) => {
      if (!c.parent) return false;
      const pId = typeof c.parent === "object" ? c.parent.id : c.parent;
      return String(pId) === String(parentId);
    });
  };

  const activeCategory = categories.find((c: any) => c.slug === categorySlug);

  const categoryIds: (string | number)[] = [];
  if (activeCategory) {
    categoryIds.push(activeCategory.id);
    const children = getChildren(activeCategory.id);
    children.forEach((child: any) => categoryIds.push(child.id));
  }

  // 3. ARAMA VE FİLTRE SORGUSU
  const whereClause: any = { _status: { equals: "published" } };

  if (q) {
    whereClause.or = [
      { title: { like: q } },
      { sku: { like: q } },
      { "variants.sku": { like: q } },
      { "variants.title": { like: q } },
    ];
  }

  if (categoryIds.length > 0) {
    whereClause.category = { in: categoryIds };
  }

  // --- 4. ÜRÜNLERİ ÇEK VE SAYFALAMA VERİSİNİ AL ---
  const {
    docs: products,
    totalPages,
    hasPrevPage,
    hasNextPage,
    prevPage,
    nextPage,
    totalDocs,
  } = await payload.find({
    collection: "products",
    where: whereClause,
    sort: "-createdAt",
    limit: LIMIT,
    page: currentPage,
    depth: 1,
  });

  // URL Üretici
  const buildPageUrl = (pageNumber: number) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (categorySlug) query.set("category", categorySlug);
    query.set("page", pageNumber.toString());
    return `/urunler?${query.toString()}`;
  };

  return (
      <div className="bg-background min-h-screen pt-12 pb-24">
        {/* Üst Başlık (Her temada koyu ve şık durur) */}
        {/*
        <div className="bg-primary py-[4.5rem] mb-12 border-b-4 border-primary">
          <div className="container mx-auto px-4 max-w-7xl text-center">
            <div className="mx-auto mb-5 inline-flex items-center rounded-full border border-surface-inverse-foreground/10 bg-surface-inverse-foreground/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-surface-inverse-foreground/75">
              Medical Product Catalogue
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-surface-inverse-foreground mb-6 tracking-tight">
              Ürün Kataloğu
            </h1>
            <p className="text-lg text-surface-inverse-foreground/70 max-w-2xl mx-auto">
              İhtiyacınız olan medikal cihazı, modeli veya SKU kodunu hızlıca
              bulun.
            </p>
          </div>
        </div>
        */}

        {/* Minimal ve şık üst kısım */}
        <div className="py-2 mb-8">
          <div className="container mx-auto px-4 max-w-7xl text-center">
            <h1 className="text-3xl font-bold text-text-main mb-2">
              Ürün Kataloğu
            </h1>
            <p className="text-text-muted">
              İhtiyacınız olan medikal cihazı hızlıca bulun.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* SOL KENAR: SİDEBAR FİLTRELERİ */}
            <aside className="w-full lg:w-1/4 space-y-8">
              {/* Arama Kutusu */}
              <div className="bg-surface p-6 rounded-[var(--radius-2xl)] shadow-sm shadow-surface-inverse/5 border border-border/80">
                <h3 className="font-bold text-text-main mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" /> Ürün / SKU Ara
                </h3>
                <form action="/urunler" method="GET" className="relative">
                  {categorySlug && (
                      <input type="hidden" name="category" value={categorySlug} />
                  )}
                  <input
                      type="text"
                      name="q"
                      defaultValue={q}
                      placeholder="Örn: 110-0625 veya FUE..."
                      className="w-full pl-4 pr-12 py-3 rounded-[var(--radius)] border border-input bg-background focus:border-primary focus:ring-2 focus:ring-ring/30 outline-none transition-all text-sm font-medium text-text-main placeholder:text-text-muted/50"
                  />
                  <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground bg-primary p-1.5 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Kategoriler Ağacı */}
              <div className="bg-surface p-6 rounded-[var(--radius-2xl)] shadow-sm shadow-surface-inverse/5 border border-border/80 sticky top-24">
                <h3 className="font-bold text-text-main mb-4 flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-primary" /> Kategoriler
                </h3>
                <div className="space-y-1.5">
                  <Link
                      href={`/urunler${q ? `?q=${q}` : ""}`}
                      className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${!categorySlug ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-text-muted hover:bg-surface-muted hover:text-text-main"}`}
                  >
                    Tüm Ürünler
                  </Link>

                  {parentCategories.map((parent: any) => {
                    const isParentActive = categorySlug === parent.slug;
                    const children = getChildren(parent.id);
                    const isChildActive = children.some(
                        (c: any) => c.slug === categorySlug,
                    );
                    const isExpanded = isParentActive || isChildActive;

                    return (
                        <div key={parent.id} className="pt-1">
                          <Link
                              href={`/urunler?category=${parent.slug}${q ? `&q=${q}` : ""}`}
                              className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${isParentActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : isExpanded ? "text-primary bg-primary/10" : "text-text-muted hover:bg-surface-muted hover:text-text-main"}`}
                          >
                            {parent.title}
                          </Link>

                          {children.length > 0 && (
                              <div className="ml-5 mt-1.5 mb-3 space-y-1 border-l-2 border-border pl-3">
                                {children.map((child: any) => {
                                  const isCurrentChild = categorySlug === child.slug;
                                  return (
                                      <Link
                                          key={child.id}
                                          href={`/urunler?category=${child.slug}${q ? `&q=${q}` : ""}`}
                                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isCurrentChild ? "text-primary bg-primary/10 font-bold" : "text-text-muted hover:text-text-main hover:bg-surface-muted"}`}
                                      >
                                        <CornerDownRight
                                            className={`w-3.5 h-3.5 ${isCurrentChild ? "text-primary" : "opacity-40"}`}
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

            {/* SAĞ KENAR: ÜRÜN LİSTESİ VE ÇİPLER */}
            <main className="w-full lg:w-3/4">
              {/* Üst Bilgi Barı */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-[var(--radius-xl)] border border-border/80 shadow-sm shadow-surface-inverse/5">
                <p className="text-sm text-text-muted font-medium">
                  Toplam{" "}
                  <strong className="text-text-main text-base">
                    {totalDocs}
                  </strong>{" "}
                  ürün bulundu. (Sayfa {currentPage}/{totalPages || 1})
                </p>

                {/* Filtre Etiketleri (Chips) */}
                {(q || categorySlug) && (
                    <div className="flex flex-wrap gap-2">
                      {q && (
                          <Link
                              href={`/urunler${categorySlug ? `?category=${categorySlug}` : ""}`}
                              className="inline-flex items-center gap-1.5 bg-surface-muted hover:bg-error/10 text-text-main hover:text-error px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                          >
                            Arama: "{q}" <X className="w-3.5 h-3.5" />
                          </Link>
                      )}
                      {categorySlug && activeCategory && (
                          <Link
                              href={`/urunler${q ? `?q=${q}` : ""}`}
                              className="inline-flex items-center gap-1.5 bg-primary/10 hover:bg-error/10 text-primary hover:text-error px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                          >
                            Kategori: {activeCategory.title}{" "}
                            <X className="w-3.5 h-3.5" />
                          </Link>
                      )}
                      <Link
                          href="/urunler"
                          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-main px-2 py-1.5 text-xs font-bold transition-colors ml-2 underline"
                      >
                        Tümünü Temizle
                      </Link>
                    </div>
                )}
              </div>

              {/* İçerik: Boş Durum veya Izgara */}
              {products.length === 0 ? (
                  <div className="bg-surface p-16 rounded-[var(--radius-2xl)] border border-border shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-20 h-20 bg-surface-muted text-text-muted rounded-full flex items-center justify-center mb-6">
                      <PackageX className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-text-main mb-2">
                      Sonuç Bulunamadı
                    </h3>
                    <p className="text-text-muted mb-8 max-w-md">
                      Aradığınız kriterlere uygun ürün veya SKU kodu sistemimizde
                      bulunmuyor. Farklı kelimelerle aramayı deneyebilirsiniz.
                    </p>
                    <Button asChild size="lg" className="rounded-xl font-bold">
                      <Link href="/urunler">Tüm Kataloğu Göster</Link>
                    </Button>
                  </div>
              ) : (
                  <>
                    {/* Izgara */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {products.map((product: any) => {
                        const imageUrl =
                            typeof product.mainImage === "object" &&
                            product.mainImage?.url
                                ? product.mainImage.url
                                : "/placeholder.jpg";
                        return (
                            <Card
                                key={product.id}
                                className="group overflow-hidden rounded-[var(--radius-2xl)] border-border/80 shadow-sm shadow-surface-inverse/5 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40 transition-all duration-300 flex flex-col bg-surface"
                            >
                              <Link
                                  href={`/urunler/${product.slug}`}
                                  className="relative aspect-square bg-surface-muted/70 p-6 flex items-center justify-center overflow-hidden"
                              >
                                <Image
                                    src={imageUrl}
                                    alt={product.title}
                                    fill
                                    className="object-contain p-8 mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                                    unoptimized
                                />
                                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                                  {product.sku && (
                                      <span className="bg-surface text-text-muted text-[10px] px-2.5 py-1 rounded-md font-mono font-bold shadow-sm border border-border">
                                {product.sku}
                              </span>
                                  )}
                                  {product.variants &&
                                      product.variants.length > 0 && (
                                          <span className="bg-primary/10 text-primary text-[10px] px-2.5 py-1 rounded-md font-bold shadow-sm">
                                  {product.variants.length} Model
                                </span>
                                      )}
                                </div>
                              </Link>
                              <CardHeader className="pt-6 pb-2">
                                <CardTitle className="text-lg line-clamp-2 leading-snug font-bold">
                                  <Link
                                      href={`/urunler/${product.slug}`}
                                      className="hover:text-primary transition-colors text-text-main"
                                  >
                                    {product.title}
                                  </Link>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="flex-1 pb-4">
                                <p className="text-sm text-text-muted line-clamp-2 leading-relaxed">
                                  {product.shortDescription}
                                </p>
                              </CardContent>
                              <CardFooter className="pt-0 pb-6 px-6">
                                <Button
                                    className="w-full rounded-xl font-bold bg-surface-inverse text-surface-inverse-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                                    asChild
                                >
                                  <Link href={`/urunler/${product.slug}`}>
                                    Ürünü İncele
                                  </Link>
                                </Button>
                              </CardFooter>
                            </Card>
                        );
                      })}
                    </div>

                    {/* --- SAYFALAMA BİLEŞENİ (PAGINATION) --- */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center items-center gap-2">
                          {/* Önceki Sayfa */}
                          {hasPrevPage ? (
                              <Link
                                  href={buildPageUrl(prevPage!)}
                                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-border text-text-muted hover:border-primary hover:text-primary hover:bg-primary/5 transition-all shadow-sm bg-surface"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </Link>
                          ) : (
                              <div className="w-10 h-10 flex items-center justify-center rounded-xl border border-border text-text-muted/50 bg-surface-muted cursor-not-allowed">
                                <ChevronLeft className="w-5 h-5" />
                              </div>
                          )}

                          {/* Sayfa Numaraları */}
                          <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-2 h-10 shadow-sm">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                (pageNum) => (
                                    <Link
                                        key={pageNum}
                                        href={buildPageUrl(pageNum)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                            currentPage === pageNum
                                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                                : "text-text-muted hover:bg-surface-muted hover:text-text-main"
                                        }`}
                                    >
                                      {pageNum}
                                    </Link>
                                ),
                            )}
                          </div>

                          {/* Sonraki Sayfa */}
                          {hasNextPage ? (
                              <Link
                                  href={buildPageUrl(nextPage!)}
                                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-border text-text-muted hover:border-primary hover:text-primary hover:bg-primary/5 transition-all shadow-sm bg-surface"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </Link>
                          ) : (
                              <div className="w-10 h-10 flex items-center justify-center rounded-xl border border-border text-text-muted/50 bg-surface-muted cursor-not-allowed">
                                <ChevronRight className="w-5 h-5" />
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
