import type { Metadata } from "next";
import { NewsFeedBlock } from "@/components/blocks/NewsFeedBlock";
import { getRequestLocale } from "@/lib/i18n/requestLocale";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

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
