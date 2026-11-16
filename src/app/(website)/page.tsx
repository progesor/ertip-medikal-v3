import { cache } from "react";
import type { SiteLocale } from "@/lib/i18n/config";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import { getRequestLocale } from "@/lib/i18n/requestLocale";
import { getHomePath } from "@/lib/i18n/routing";

export const dynamic = "force-dynamic";

const homeMetadata = {
  en: {
    title: "Ertip Medical | Innovative Medical Devices and Solutions",
    description:
      "Explore Ertip Medical's medical device portfolio, professional instruments and innovative clinical solutions.",
  },
  tr: {
    title: "Ertip Medikal | Yenilikçi Medikal Cihazlar ve Çözümler",
    description:
      "Ertip Medikal ürün kataloğu, iğnesiz anestezi cihazları, mikro motorlar ve yenilikçi saç ekim teknolojileri.",
  },
} as const;

const loadHomePage = cache(async (locale: SiteLocale) => {
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: "pages",
    locale,
    fallbackLocale: false,
    where: { slug: { equals: "home" }, _status: { equals: "published" } },
    limit: 1,
    depth: 2,
  });

  return docs[0];
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = await loadHomePage(locale);
  const title = page?.meta?.title || page?.title || homeMetadata[locale].title;
  const description = page?.meta?.description || homeMetadata[locale].description;
  const image = page?.meta?.image;

  return {
    title: { absolute: title },
    keywords: page?.meta?.keywords || undefined,
    description,
    openGraph: {
      title,
      ...(typeof image === "object" && image?.url ? { images: [image.url] } : {}),
      description,
      type: "website",
    },
  };
}

export default async function HomePage() {
  const locale = await getRequestLocale();
  const homePage = await loadHomePage(locale);

  // M10.1 intentionally created only Turkish locale rows. Until the English
  // homepage is authored, keep public traffic on a complete locale instead of
  // silently mixing Turkish fields into an English page.
  if (!homePage && locale === "en") {
    redirect(getHomePath("tr"));
  }

  if (!homePage) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background p-10 text-center">
        <h1 className="mb-4 text-2xl font-bold text-text-main/70">
          Anasayfa Yapılandırılmadı
        </h1>
        <p className="text-text-muted">
          Lütfen Payload CMS üzerinden &apos;home&apos; slug değerine sahip bir
          sayfa oluşturun ve bloklarınızı ekleyin.
        </p>
      </div>
    );
  }

  return (
    <main className="flex flex-col bg-background">
      <RenderBlocks
        blocks={homePage.layout}
        context={{
          pageTitle: homePage.title,
          pageSlug: homePage.slug || "home",
          isHome: true,
        }}
      />
    </main>
  );
}
