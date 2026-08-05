import { getPayload } from "payload";
import configPromise from "@payload-config";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ProductView } from "@/components/product/ProductView";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { getRequestLocale } from "@/lib/i18n/requestLocale";
import { getProductsPath } from "@/lib/i18n/routing";

type Args = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getRequestLocale()]);
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: "products",
    locale,
    fallbackLocale: false,
    where: { slug: { equals: slug }, _status: { equals: "published" } },
    limit: 1,
  });

  const product = docs[0];
  if (!product) {
    return { title: locale === "en" ? "Product Not Found" : "Ürün Bulunamadı" };
  }

  const manualMeta = product.meta || {};
  const finalTitle = manualMeta.title || product.title;
  const finalDesc =
    manualMeta.description ||
    product.shortDescription ||
    (locale === "en"
      ? `Detailed technical specifications and product images for ${product.title}.`
      : `${product.title} hakkında detaylı teknik özellikler ve ürün görselleri.`);
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
  const [{ slug }, locale] = await Promise.all([params, getRequestLocale()]);
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: "products",
    locale,
    fallbackLocale: false,
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

  const labels =
    locale === "en"
      ? {
          catalog: "Product Catalog",
          category: "Category",
          relatedTitle: "You May Also Like",
          relatedDescription:
            "Explore other medical solutions with similar features.",
          allCatalog: "View Full Catalog",
          inspect: "View Details",
        }
      : {
          catalog: "Ürün Kataloğu",
          category: "Kategori",
          relatedTitle: "İlginizi Çekebilir",
          relatedDescription:
            "Bu ürünle benzer özelliklere sahip diğer medikal çözümlerimiz.",
          allCatalog: "Tüm Kataloğu Gör",
          inspect: "Detaylı İncele",
        };
  const catalogPath = getProductsPath(locale);
  const primaryCategory = product.category?.[0];
  const breadcrumbItems = [
    { label: labels.catalog, href: catalogPath },
    ...(primaryCategory
      ? [
          {
            label:
              typeof primaryCategory === "object"
                ? primaryCategory.title
                : labels.category,
            href: `${catalogPath}?category=${
              typeof primaryCategory === "object" ? primaryCategory.slug : ""
            }`,
          },
        ]
      : []),
    { label: product.title },
  ];

  let relatedProducts = (product.relatedProducts || []).filter(
    (relatedProduct: any) =>
      typeof relatedProduct !== "object" ||
      (relatedProduct.slug && relatedProduct.title),
  );

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
      locale,
      fallbackLocale: false,
      where: {
        category: { in: [catId] },
        id: { not_equals: product.id },
        slug: { exists: true },
        _status: { equals: "published" },
      },
      limit: 4,
    });
    relatedProducts = sameCategoryProducts;
  }

  const alternateLocale = locale === "en" ? "tr" : "en";
  const alternateProduct = await payload
    .findByID({
      collection: "products",
      id: product.id,
      locale: alternateLocale,
      fallbackLocale: false,
      depth: 0,
    })
    .catch(() => null);
  const cartLocalizedIdentity = {
    [locale]: { title: product.title, slug: product.slug },
    ...(alternateProduct?.title && alternateProduct?.slug
      ? {
          [alternateLocale]: {
            title: alternateProduct.title,
            slug: alternateProduct.slug,
          },
        }
      : {}),
  };

  // ProductView is a client component, so this object is serialized to the browser.
  // Protected file relationships and access codes are intentionally excluded.
  const productForClient = {
    ...product,
    cartLocalizedIdentity,
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
                  {labels.relatedTitle}
                </h2>
                <p className="text-text-muted">{labels.relatedDescription}</p>
              </div>
              <Button
                variant="outline"
                className="font-bold shrink-0 border-border text-text-main hover:bg-surface-muted"
                asChild
              >
                <Link href={catalogPath}>{labels.allCatalog}</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct: any) => {
                if (typeof relatedProduct !== "object" || !relatedProduct.slug) {
                  return null;
                }

                const relatedImageUrl =
                  typeof relatedProduct.mainImage === "object" &&
                  relatedProduct.mainImage?.url
                    ? relatedProduct.mainImage.url
                    : "/placeholder.jpg";

                return (
                  <Link
                    key={relatedProduct.id}
                    href={getProductsPath(locale, relatedProduct.slug)}
                    className="group bg-surface rounded-3xl p-6 border border-border shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col"
                  >
                    <div className="relative aspect-square mb-6 bg-surface-muted/50 rounded-2xl p-4 flex items-center justify-center overflow-hidden">
                      <Image
                        src={relatedImageUrl}
                        alt={relatedProduct.title}
                        fill
                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        quality={75}
                      />
                    </div>
                    <h4 className="font-bold text-text-main line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                      {relatedProduct.title}
                    </h4>
                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-4 flex-1">
                      {relatedProduct.shortDescription}
                    </p>
                    <div className="text-primary text-xs font-bold flex items-center gap-1 uppercase tracking-wider mt-auto">
                      {labels.inspect}{" "}
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
