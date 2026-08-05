import { getPayload } from "payload";
import configPromise from "@payload-config";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import { getRequestLocale } from "@/lib/i18n/requestLocale";

export const dynamic = "force-dynamic";

type Args = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getRequestLocale()]);
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: "pages",
    locale,
    fallbackLocale: false,
    where: { slug: { equals: slug }, _status: { equals: "published" } },
    limit: 1,
  });

  const page = docs[0];
  if (!page) {
    return { title: locale === "en" ? "Page Not Found" : "Sayfa Bulunamadı" };
  }

  const manualMeta = page.meta || {};
  const finalTitle = manualMeta.title || page.title;
  const finalDesc =
    manualMeta.description ||
    (locale === "en"
      ? `Ertip Medical corporate information: ${page.title}.`
      : `Ertip Medikal kurumsal bilgi: ${page.title}.`);
  const ogImage =
    typeof manualMeta.image === "object" && manualMeta.image?.url
      ? manualMeta.image.url
      : "/og-image.jpg";

  return {
    title: finalTitle,
    description: finalDesc,
    keywords: manualMeta.keywords || "",
    openGraph: {
      title: finalTitle,
      description: finalDesc,
      images: [ogImage],
      type: "website",
    },
  };
}

export default async function DynamicPage({ params }: Args) {
  const [{ slug }, locale] = await Promise.all([params, getRequestLocale()]);
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: "pages",
    locale,
    fallbackLocale: false,
    where: {
      slug: { equals: slug },
      _status: { equals: "published" },
    },
    limit: 1,
    depth: 2,
  });

  const page = docs[0];

  if (!page) {
    return notFound();
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <RenderBlocks
        blocks={page.layout}
        context={{
          pageTitle: page.title,
          pageSlug: page.slug || slug,
          isHome: false,
        }}
      />
    </main>
  );
}
