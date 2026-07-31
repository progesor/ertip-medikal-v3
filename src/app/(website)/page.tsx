import { getPayload } from "payload";
import configPromise from "@payload-config";
import type { Metadata } from "next";
import { RenderBlocks } from "@/components/blocks/RenderBlocks";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "Ertip Medikal | Yenilikçi Medikal Cihazlar ve Çözümler",
  },
  description:
    "Ertip Medikal ürün kataloğu, iğnesiz anestezi cihazları, mikro motorlar ve yenilikçi saç ekim teknolojileri.",
  openGraph: {
    title: "Ertip Medikal | Yenilikçi Medikal Çözümler",
    description:
      "Ertip Medikal ürün kataloğu, iğnesiz anestezi cihazları, mikro motorlar ve yenilikçi saç ekim teknolojileri.",
    type: "website",
  },
};

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: "pages",
    where: { slug: { equals: "home" }, _status: { equals: "published" } },
    limit: 1,
    depth: 2,
  });

  const homePage = docs[0];

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
