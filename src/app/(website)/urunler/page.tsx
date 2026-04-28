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
  const LIMIT = 12; // Her sayfada kaç ürün gösterilecek? (Izgara için 12 idealdir: 3x4 veya 4x3)

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
    limit: LIMIT, // Limiti dinamik değişkene bağladık
    page: currentPage, // Mevcut sayfayı iletiyoruz
    depth: 1,
  });

  // URL Üretici Yardımcı Fonksiyon (Arama ve kategori filtreleri bozulmasın diye)
  const buildPageUrl = (pageNumber: number) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (categorySlug) query.set("category", categorySlug);
    query.set("page", pageNumber.toString());
    return `/urunler?${query.toString()}`;
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      {/* Üst Başlık */}
      <div className="bg-slate-900 py-16 mb-12 border-b-4 border-primary">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Ürün Kataloğu
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            İhtiyacınız olan medikal cihazı, modeli veya SKU kodunu hızlıca
            bulun.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* SOL KENAR: SİDEBAR FİLTRELERİ */}
          <aside className="w-full lg:w-1/4 space-y-8">
            {/* Arama Kutusu */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
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
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white bg-primary p-1.5 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Kategoriler Ağacı (Aynı kaldı) */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-24">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-primary" /> Kategoriler
              </h3>
              <div className="space-y-1.5">
                <Link
                  href={`/urunler${q ? `?q=${q}` : ""}`}
                  className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${!categorySlug ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-600 hover:bg-slate-100"}`}
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
                        className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${isParentActive ? "bg-primary text-white shadow-md shadow-primary/20" : isExpanded ? "text-primary bg-primary/5" : "text-slate-600 hover:bg-slate-100"}`}
                      >
                        {parent.title}
                      </Link>

                      {children.length > 0 && (
                        <div className="ml-5 mt-1.5 mb-3 space-y-1 border-l-2 border-slate-100 pl-3">
                          {children.map((child: any) => {
                            const isCurrentChild = categorySlug === child.slug;
                            return (
                              <Link
                                key={child.id}
                                href={`/urunler?category=${child.slug}${q ? `&q=${q}` : ""}`}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isCurrentChild ? "text-primary bg-primary/10 font-bold" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
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
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">
                Toplam{" "}
                <strong className="text-slate-900 text-base">
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
                      className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      Arama: "{q}" <X className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  {categorySlug && activeCategory && (
                    <Link
                      href={`/urunler${q ? `?q=${q}` : ""}`}
                      className="inline-flex items-center gap-1.5 bg-primary/10 hover:bg-red-50 text-primary hover:text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      Kategori: {activeCategory.title}{" "}
                      <X className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <Link
                    href="/urunler"
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-900 px-2 py-1.5 text-xs font-bold transition-colors ml-2 underline"
                  >
                    Tümünü Temizle
                  </Link>
                </div>
              )}
            </div>

            {/* İçerik: Boş Durum veya Izgara */}
            {products.length === 0 ? (
              <div className="bg-white p-16 rounded-[2rem] border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
                  <PackageX className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Sonuç Bulunamadı
                </h3>
                <p className="text-slate-500 mb-8 max-w-md">
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
                        className="group overflow-hidden rounded-[2rem] border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col bg-white"
                      >
                        <Link
                          href={`/urunler/${product.slug}`}
                          className="relative aspect-square bg-slate-50 p-6 flex items-center justify-center overflow-hidden"
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
                              <span className="bg-white text-slate-600 text-[10px] px-2.5 py-1 rounded-md font-mono font-bold shadow-sm border border-slate-100">
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
                              className="hover:text-primary transition-colors text-slate-900"
                            >
                              {product.title}
                            </Link>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 pb-4">
                          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                            {product.shortDescription}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-0 pb-6 px-6">
                          <Button
                            className="w-full rounded-xl font-bold bg-slate-900 hover:bg-primary transition-colors"
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
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all shadow-sm bg-white"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Link>
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed">
                        <ChevronLeft className="w-5 h-5" />
                      </div>
                    )}

                    {/* Sayfa Numaraları */}
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2 h-10 shadow-sm">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNum) => (
                          <Link
                            key={pageNum}
                            href={buildPageUrl(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                              currentPage === pageNum
                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                : "text-slate-600 hover:bg-slate-100"
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
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all shadow-sm bg-white"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed">
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
