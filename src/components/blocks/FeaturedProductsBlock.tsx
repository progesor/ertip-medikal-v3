import React from "react";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { getRequestLocale } from "@/lib/i18n/requestLocale";
import { getProductsPath } from "@/lib/i18n/routing";

export async function FeaturedProductsBlock({
  title,
  selectionType,
  selectedProducts,
}: any) {
  let productsToDisplay: any[] = [];
  const [payload, locale] = await Promise.all([
    getPayload({ config: configPromise }),
    getRequestLocale(),
  ]);
  const labels =
    locale === "en"
      ? {
          fallbackTitle: "Featured Products",
          catalog: "Explore Full Catalog",
          inspect: "View Product",
        }
      : {
          fallbackTitle: "Öne Çıkan Ürünler",
          catalog: "Tüm Kataloğu İncele",
          inspect: "Ürünü İncele",
        };

  if (selectionType === "featured") {
    const { docs } = await payload.find({
      collection: "products",
      locale,
      fallbackLocale: false,
      where: {
        _status: { equals: "published" },
        isFeatured: { equals: true },
        slug: { exists: true },
      },
      sort: "-updatedAt",
      limit: 4,
      depth: 1,
    });
    productsToDisplay = docs;
  } else if (selectionType === "latest") {
    const { docs } = await payload.find({
      collection: "products",
      locale,
      fallbackLocale: false,
      where: {
        _status: { equals: "published" },
        slug: { exists: true },
      },
      sort: "-createdAt",
      limit: 4,
      depth: 1,
    });
    productsToDisplay = docs;
  } else {
    productsToDisplay =
      selectedProducts?.filter(
        (product: any) =>
          typeof product === "object" &&
          product._status === "published" &&
          typeof product.slug === "string" &&
          product.slug.trim(),
      ) || [];
  }

  if (productsToDisplay.length === 0) return null;

  return (
    <section className="py-24 bg-surface-muted/50 border-t border-border">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-main mb-4">
              {title || labels.fallbackTitle}
            </h2>
          </div>
          <Button
            variant="outline"
            className="rounded-xl font-bold bg-background"
            asChild
          >
            <Link href={getProductsPath(locale)}>
              {labels.catalog} <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productsToDisplay.map((product: any) => {
            const imageUrl =
              typeof product.mainImage === "object" && product.mainImage?.url
                ? product.mainImage.url
                : "/placeholder.jpg";
            const productHref = getProductsPath(locale, product.slug);

            return (
              <Card
                key={product.id}
                className="group overflow-hidden rounded-2xl border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col bg-surface"
              >
                <Link
                  href={productHref}
                  prefetch={false}
                  className="relative aspect-square overflow-hidden bg-surface-muted p-6 flex items-center justify-center"
                >
                  <Image
                    src={imageUrl}
                    alt={product.title}
                    fill
                    className="object-contain p-6 transition-transform duration-500 group-hover:scale-110 mix-blend-multiply"
                    sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(50vw - 28px), (max-width: 1279px) 25vw, 294px"
                    quality={75}
                  />
                  {product.sku && (
                    <div className="absolute top-4 right-4 bg-surface text-text-muted text-[10px] px-2.5 py-1 rounded-md font-mono font-bold shadow-sm border border-border">
                      {product.sku}
                    </div>
                  )}
                </Link>
                <CardHeader className="pt-6 pb-2">
                  <CardTitle className="text-lg line-clamp-2 leading-snug font-bold">
                    <Link
                      href={productHref}
                      prefetch={false}
                      className="hover:text-primary transition-colors text-text-main"
                    >
                      {product.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  {product.shortDescription ? (
                    <p className="text-sm text-text-muted line-clamp-2 leading-relaxed">
                      {product.shortDescription}
                    </p>
                  ) : (
                    <div className="h-10" />
                  )}
                </CardContent>
                <CardFooter className="pt-0 pb-6 px-6">
                  <Button
                    className="w-full rounded-xl font-bold bg-primary hover:bg-primary transition-colors"
                    asChild
                  >
                    <Link href={productHref} prefetch={false}>
                      {labels.inspect}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
