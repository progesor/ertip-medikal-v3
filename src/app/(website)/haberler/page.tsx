import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import type { SiteLocale } from "@/lib/i18n/config";
import type { Metadata } from "next";
import { NewsFeedBlock } from "@/components/blocks/NewsFeedBlock";
import { getRequestLocale } from "@/lib/i18n/requestLocale";

export const dynamic = "force-dynamic";

const loadNewsPage = cache(async (locale: SiteLocale) => {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "pages", locale, fallbackLocale: false, depth: 2, limit: 1,
    where: { slug: { in: ["news", "haberler"] }, _status: { equals: "published" } },
  });
  return docs[0];
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  const page = await loadNewsPage(locale);
  if (page) return { title: page.meta?.title || page.title, description: page.meta?.description || undefined };

  return locale === "en"
    ? {
        title: "News",
        description:
          "Latest Ertip Medical news, announcements, exhibitions and industry updates.",
      }
    : {
        title: "Haberler",
        description:
          "Ertip Medikal'den güncel haberler, duyurular, fuarlar ve sektörel gelişmeler.",
      };
}

export default async function NewsPage() {
  const locale = await getRequestLocale();

  const page = await loadNewsPage(locale);
  if (page?.layout?.length) {
    return <RenderBlocks blocks={page.layout} context={{ pageTitle: page.title, pageSlug: page.slug || "news", isHome: false }} />;
  }

  return (
    <main className="min-h-screen bg-background">
      <NewsFeedBlock
        title={locale === "en" ? "News & Updates" : "Haberler ve Gelişmeler"}
        description={
          locale === "en"
            ? "Follow Ertip Medical's latest announcements, events and industry developments."
            : "Ertip Medikal'in güncel duyurularını, etkinliklerini ve sektörel gelişmeleri takip edin."
        }
        limit={50}
        showFilters
      />
    </main>
  );
}
