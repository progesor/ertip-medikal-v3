import { getPayload } from "payload";
import configPromise from "@payload-config";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ProductView } from "@/components/product/ProductView";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

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
    depth: 2,
  });

  const product = docs[0];

  if (!product) {
    return notFound();
  }

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

  let relatedProducts = product.relatedProducts || [];

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
        id: { not_equals: product.id },
        _status: { equals: "published" },
      },
      limit: 4,
    });
    relatedProducts = sameCategoryProducts;
  }

  // ProductView bir client component olduğu için bu nesne tarayıcıya serialize edilir.
  // Korumalı dosya ilişkileri ve erişim kodları client payload'ına dahil edilmez.
  const productForClient = {
    ...product,
    protectedDocs:
      product.protectedDocs?.map((document) => ({
        id: document.id,
        label: document.label,
      })) ?? [],
  };

  return (
    <main className="bg-background min-h-screen pb-24">
      <div className="container mx-auto px-4 max-w-7xl pt-8">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <ProductView product={productForClient} />

      {relatedProducts.length > 0 && (
        <section className="border-t border-border mt-16 pt-20 bg-surface-muted/30">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-black text-text-main mb-2">
                  İlginizi Çekebilir
                </h2>
                <p className="text-text-muted">
                  Bu ürünle benzer özelliklere sahip diğer medikal çözümlerimiz.
                </p>
              </div>
              <Button
                variant="outline"
                className="font-bold shrink-0 border-border text-text-main hover:bg-surface-muted"
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
                    className="group bg-surface rounded-3xl p-6 border border-border shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col"
                  >
                    <div className="relative aspect-square mb-6 bg-surface-muted/50 rounded-2xl p-4 flex items-center justify-center overflow-hidden">
                      <Image
                        src={relImageUrl}
                        alt={rel.title}
                        fill
                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
                        unoptimized
                      />
                    </div>
                    <h4 className="font-bold text-text-main line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-4 flex-1">
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
