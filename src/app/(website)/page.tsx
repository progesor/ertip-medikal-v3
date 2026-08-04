import { cache } from "react";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import type { Metadata } from "next";
import { RenderBlocks } from "@/components/blocks/RenderBlocks";

export const dynamic = "force-dynamic";

const defaultTitle = "Ertip Medikal | Yenilikçi Medikal Cihazlar ve Çözümler";
const defaultDescription =
  "Ertip Medikal ürün kataloğu, iğnesiz anestezi cihazları, mikro motorlar ve yenilikçi saç ekim teknolojileri.";

const loadHomePage = cache(async () => {
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: "pages",
    where: { slug: { equals: "home" }, _status: { equals: "published" } },
    limit: 1,
    depth: 2,
  });

  return docs[0] || null;
});

export async function generateMetadata(): Promise<Metadata> {
  const homePage = await loadHomePage();
  const manualMeta = homePage?.meta || {};
  const title = manualMeta.title || homePage?.title || defaultTitle;
  const description = manualMeta.description || defaultDescription;
  const ogImage =
    typeof manualMeta.image === "object" && manualMeta.image?.url
      ? manualMeta.image.url
      : "/og-image.jpg";

  return {
    title: { absolute: title },
    description,
    keywords: manualMeta.keywords || "",
    openGraph: {
      title,
      description,
      images: [ogImage],
      type: "website",
    },
  };
}

export default async function HomePage() {
  const homePage = await loadHomePage();

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
