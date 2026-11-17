import React from "react";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
    <section className="border-y border-border bg-surface-muted/50 py-12 md:py-20">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4 md:mb-9">
          <h2 className="text-3xl font-bold tracking-tight text-text-main md:text-4xl">
            {title || labels.fallbackTitle}
          </h2>
          <Button asChild variant="outline">
            <Link href={getProductsPath(locale)}>
              {labels.catalog} <ArrowRight className="ml-2 size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
          {productsToDisplay.map((product: any) => (
            <Link
              key={product.id}
              href={getProductsPath(locale, product.slug)}
              prefetch={false}
              className="group flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-background">
                {product.mainImage?.url && (
                  <Image
                    src={product.mainImage.url}
                    alt=""
                    fill
                    className="object-contain p-3 transition-transform motion-safe:group-hover:scale-105 md:p-5"
                    sizes="(max-width: 1023px) 48vw, (max-width: 1279px) 24vw, 300px"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 border-t border-border p-3 sm:p-5">
                <h3 className="text-base font-semibold leading-snug text-text-main sm:text-lg">{product.title}</h3>
                {product.shortDescription && (
                  <p className="hidden text-sm leading-relaxed text-text-muted md:line-clamp-2">{product.shortDescription}</p>
                )}
                <span className="mt-auto flex items-center justify-between gap-2 pt-2 text-sm font-semibold text-primary">
                  {labels.inspect} <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
