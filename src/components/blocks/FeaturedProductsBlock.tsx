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

export async function FeaturedProductsBlock({
  title,
  selectionType,
  selectedProducts,
}: any) {
  let productsToDisplay = [];
  const payload = await getPayload({ config: configPromise });

  // 1. SENARYO: Yıldızlı / Öne Çıkan Ürünleri Getir (YENİ)
  if (selectionType === "featured") {
    const { docs } = await payload.find({
      collection: "products",
      where: {
        _status: { equals: "published" },
        isFeatured: { equals: true },
      },
      sort: "-updatedAt", // En son güncellenen (yıldızlanan) en üstte çıkar
      limit: 4,
      depth: 1,
    });
    productsToDisplay = docs;
  }
  // 2. SENARYO: En Son Eklenenler
  else if (selectionType === "latest") {
    const { docs } = await payload.find({
      collection: "products",
      where: { _status: { equals: "published" } },
      sort: "-createdAt",
      limit: 4,
      depth: 1,
    });
    productsToDisplay = docs;
  }
  // 3. SENARYO: Manuel Seçim
  else {
    productsToDisplay =
      selectedProducts?.filter(
        (p: any) => typeof p === "object" && p._status === "published",
      ) || [];
  }

  if (productsToDisplay.length === 0) return null;

  return (
    <section className="py-24 bg-slate-50/50 border-t border-slate-100">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Üst Kısım: Başlık ve Tümünü Gör Butonu */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="max-w-2xl">
            {/*<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4">*/}
            {/*    <Star className="w-4 h-4 fill-primary" /> Vitrin*/}
            {/*</div>*/}
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
              {title || "Öne Çıkan Ürünler"}
            </h2>
          </div>
          <Button
            variant="outline"
            className="rounded-xl font-bold bg-white"
            asChild
          >
            <Link href="/urunler">
              Tüm Kataloğu İncele <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Ürün Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productsToDisplay.map((product: any) => {
            const imageUrl =
              typeof product.mainImage === "object" && product.mainImage?.url
                ? product.mainImage.url
                : "/placeholder.jpg";

            return (
              <Card
                key={product.id}
                className="group overflow-hidden rounded-[2rem] border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col bg-white"
              >
                <Link
                  href={`/urunler/${product.slug}`}
                  className="relative aspect-square overflow-hidden bg-slate-50 p-6 flex items-center justify-center"
                >
                  <Image
                    src={imageUrl}
                    alt={product.title}
                    fill
                    className="object-contain p-6 transition-transform duration-500 group-hover:scale-110 mix-blend-multiply"
                    sizes="(max-width: 768px) 100vw, 25vw"
                    unoptimized
                  />
                  {/* SKU Rozeti */}
                  {product.sku && (
                    <div className="absolute top-4 right-4 bg-white text-slate-600 text-[10px] px-2.5 py-1 rounded-md font-mono font-bold shadow-sm border border-slate-100">
                      {product.sku}
                    </div>
                  )}
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
                  {product.shortDescription ? (
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {product.shortDescription}
                    </p>
                  ) : (
                    <div className="h-10" />
                  )}
                </CardContent>
                <CardFooter className="pt-0 pb-6 px-6">
                  <Button
                    className="w-full rounded-xl font-bold bg-slate-900 hover:bg-primary transition-colors"
                    asChild
                  >
                    <Link href={`/urunler/${product.slug}`}>Ürünü İncele</Link>
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
