import { getPayload } from "payload";
import configPromise from "@payload-config";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ProductView } from "@/components/product/ProductView";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"; // Yeni ekledik

type Args = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: "products",
    where: { slug: { equals: slug }, _status: { equals: "published" } },
    limit: 1,
  });

  const product = docs[0];
  if (!product) return { title: "Ürün Bulunamadı" };

  const manualMeta = product.meta || {};
  const finalTitle = manualMeta.title || product.title;
  const finalDesc =
    manualMeta.description ||
    product.shortDescription ||
    `${product.title} hakkında detaylı teknik özellikler ve ürün görselleri.`;
  const ogImage =
    typeof manualMeta.image === "object" && manualMeta.image?.url
      ? manualMeta.image.url
      : typeof product.mainImage === "object" && product.mainImage?.url
        ? product.mainImage.url
        : "/og-image.jpg";

  return {
    title: finalTitle,
    description: finalDesc,
    keywords: manualMeta.keywords || "",
    openGraph: {
      title: finalTitle,
      description: finalDesc,
      images: [ogImage],
      type: "article",
    },
  };
}
// -----------------------------------

export default async function ProductDetailPage({ params }: Args) {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: "products",
    where: {
      slug: { equals: slug },
      _status: { equals: "published" },
    },
    limit: 1,
    depth: 2, // İlişkili ürünlerin ve kategorilerin verisini tam çekmek için 2 olmalı
  });

  const product = docs[0];

  if (!product) {
    return notFound();
  }

  // --- 1. BREADCRUMB (NAVİGASYON) VERİSİNİ HAZIRLA ---
  const primaryCategory = product.category?.[0];
  const breadcrumbItems = [
    { label: "Ürün Kataloğu", href: "/urunler" },
    ...(primaryCategory
      ? [
        {
          label:
            typeof primaryCategory === "object"
              ? primaryCategory.title
              : "Kategori",
          href: `/urunler?category=${typeof primaryCategory === "object" ? primaryCategory.slug : ""}`,
        },
      ]
      : []),
    { label: product.title },
  ];

  // --- 2. AKILLI İLİŞKİLİ ÜRÜNLER MANTIĞI ---
  let relatedProducts = product.relatedProducts || [];

  // Eğer admin panelinden özel "İlişkili Ürün" seçilmemişse, otomatik aynı kategoriden 4 ürün çek!
  if (
    relatedProducts.length === 0 &&
    product.category &&
    product.category.length > 0
  ) {
    const catId =
      typeof product.category[0] === "object"
        ? product.category[0].id
        : product.category[0];
    const { docs: sameCategoryProducts } = await payload.find({
      collection: "products",
      where: {
        category: { in: [catId] },
        id: { not_equals: product.id }, // Kendisini hariç tut
        _status: { equals: "published" },
      },
      limit: 4,
    });
    relatedProducts = sameCategoryProducts;
  }

  return (
    <main className="bg-white min-h-screen pb-24">
      {/* ÜST KISIM: BREADCRUMBS */}
      <div className="container mx-auto px-4 max-w-7xl pt-8">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* ORTA KISIM: ÜRÜN DETAY BİLEŞENİ (Client Component) */}
      <ProductView product={product} />

      {/* ALT KISIM: İLİŞKİLİ ÜRÜNLER VİTRİNİ */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-slate-100 mt-16 pt-20 bg-slate-50/50">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                  İlginizi Çekebilir
                </h2>
                <p className="text-slate-500">
                  Bu ürünle benzer özelliklere sahip diğer medikal çözümlerimiz.
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-xl font-bold shrink-0"
                asChild
              >
                <Link href="/urunler">Tüm Kataloğu Gör</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel: any) => {
                const relImageUrl =
                  typeof rel.mainImage === "object" && rel.mainImage?.url
                    ? rel.mainImage.url
                    : "/placeholder.jpg";

                return (
                  <Link
                    key={rel.id}
                    href={`/urunler/${rel.slug}`}
                    className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col"
                  >
                    <div className="relative aspect-square mb-6 bg-slate-50 rounded-2xl p-4 flex items-center justify-center overflow-hidden">
                      <Image
                        src={relImageUrl}
                        alt={rel.title}
                        fill
                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
                        unoptimized
                      />
                    </div>
                    <h4 className="font-bold text-slate-900 line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4 flex-1">
                      {rel.shortDescription}
                    </p>
                    <div className="text-primary text-xs font-bold flex items-center gap-1 uppercase tracking-wider mt-auto">
                      Detaylı İncele{" "}
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
