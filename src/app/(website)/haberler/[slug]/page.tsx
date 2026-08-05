import { getPayload } from "payload";
import configPromise from "@payload-config";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { CalendarDays, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";
import { getRequestLocale } from "@/lib/i18n/requestLocale";
import { getNewsPath } from "@/lib/i18n/routing";

type Args = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getRequestLocale()]);
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: "news",
    locale,
    fallbackLocale: false,
    where: {
      or: [{ slug: { equals: slug } }, { id: { equals: slug } }],
      _status: { equals: "published" },
    },
    limit: 1,
  });

  const newsItem = docs[0];
  if (!newsItem) {
    return { title: locale === "en" ? "News Not Found" : "Haber Bulunamadı" };
  }

  const manualMeta = newsItem.meta || {};
  const finalTitle = manualMeta.title || newsItem.title;
  const finalDesc =
    manualMeta.description ||
    newsItem.excerpt ||
    (locale === "en"
      ? `${newsItem.title} - Latest news and announcements from Ertip Medical.`
      : `${newsItem.title} - Ertip Medikal'den en güncel gelişmeler ve duyurular.`);

  const ogImage =
    typeof manualMeta.image === "object" && manualMeta.image?.url
      ? manualMeta.image.url
      : typeof newsItem.image === "object" && newsItem.image?.url
        ? newsItem.image.url
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
      publishedTime: newsItem.publishedDate,
    },
  };
}

export default async function NewsDetailPage({ params }: Args) {
  const [{ slug }, locale] = await Promise.all([params, getRequestLocale()]);
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: "news",
    locale,
    fallbackLocale: false,
    where: {
      or: [{ slug: { equals: slug } }, { id: { equals: slug } }],
      _status: { equals: "published" },
    },
    limit: 1,
    depth: 2,
  });

  const newsItem = docs[0];

  if (!newsItem) {
    return notFound();
  }

  const labels =
    locale === "en"
      ? {
          back: "Back to All News",
          galleryTitle: "Event Gallery",
          galleryDescription:
            "Browse all images from the event in detail.",
        }
      : {
          back: "Tüm Haberlere Dön",
          galleryTitle: "Etkinlikten Kareler",
          galleryDescription:
            "Etkinliğimize ait tüm görselleri detaylıca inceleyebilirsiniz.",
        };
  const imageUrl =
    typeof newsItem.image === "object" && newsItem.image?.url
      ? newsItem.image.url
      : null;
  const formattedDate = new Date(newsItem.publishedDate).toLocaleDateString(
    locale === "en" ? "en-US" : "tr-TR",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
  const categoryTitle =
    typeof newsItem.category === "object" ? newsItem.category?.title : null;

  const galleryImages: { url: string; alt?: string }[] = [];
  if (newsItem.gallery && Array.isArray(newsItem.gallery)) {
    newsItem.gallery.forEach((item: any) => {
      if (item.image && typeof item.image === "object" && item.image.url) {
        galleryImages.push({ url: item.image.url, alt: item.image.alt });
      }
    });
  }

  return (
    <article className="pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link
          href={getNewsPath(locale)}
          className="inline-flex items-center text-sm font-semibold text-text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> {labels.back}
        </Link>
      </div>

      <div className="container mx-auto px-4 mb-16">
        <div className="relative w-full max-w-5xl mx-auto rounded-[var(--radius-3xl)] overflow-hidden shadow-2xl bg-surface-inverse">
          <div className="aspect-[16/9] md:aspect-[21/9] relative">
            {imageUrl && (
              <>
                <Image
                  src={imageUrl}
                  alt={newsItem.title}
                  fill
                  className="object-cover opacity-60"
                  priority
                  sizes="(max-width: 1024px) 100vw, 1024px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-inverse via-surface-inverse/40 to-transparent" />
              </>
            )}

            <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-surface-inverse-foreground z-10">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {categoryTitle && (
                  <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 text-sm border-0">
                    {categoryTitle}
                  </Badge>
                )}
                <div className="flex items-center text-surface-inverse-foreground/75 font-medium">
                  <CalendarDays className="w-5 h-5 mr-2 text-primary" />
                  {formattedDate}
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-balance">
                {newsItem.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg md:prose-xl max-w-none mb-16 text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80 prose-li:text-muted-foreground prose-blockquote:border-primary prose-blockquote:bg-muted prose-blockquote:text-foreground prose-code:text-primary prose-pre:bg-surface-inverse prose-pre:text-surface-inverse-foreground">
            <RichText data={newsItem.content} />
          </div>

          {galleryImages.length > 0 && (
            <div className="mt-20 pt-16 border-t border-border">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-bold text-text-main mb-4">
                  {labels.galleryTitle}
                </h3>
                <p className="text-text-muted">{labels.galleryDescription}</p>
              </div>
              <div className="bg-surface-muted p-6 md:p-10 rounded-[var(--radius-3xl)] shadow-inner">
                <ProductGallery images={galleryImages as any} />
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
