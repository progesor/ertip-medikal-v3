import { getPayload } from "payload";
import configPromise from "@payload-config";
import { notFound } from "next/navigation";
import { HeroBlock } from "@/components/blocks/HeroBlock";
import { ContentBlock } from "@/components/blocks/ContentBlock";
import { Metadata } from "next";
import { FeaturesBlock } from "@/components/blocks/FeaturesBlock";
import { FeaturedProductsBlock } from "@/components/blocks/FeaturedProductsBlock";
import { FAQBlock } from "@/components/blocks/FAQBlock";
import { TestimonialBlock } from "@/components/blocks/TestimonialBlock";
import { StatsBlock } from "@/components/blocks/StatsBlock";
import { GalleryBlock } from "@/components/blocks/GalleryBlock";
import { LogoSliderBlock } from "@/components/blocks/LogoSliderBlock";
import { LocationBlock } from "@/components/blocks/LocationBlock";
import { TeamBlock } from "@/components/blocks/TeamBlock";
import { NewsletterBlock } from "@/components/blocks/NewsletterBlock";
import { HeroSliderBlock } from "@/components/blocks/HeroSliderBlock";
import { CertificateGridBlock } from "@/components/blocks/CertificateGridBlock";
import { ProcessBlock } from "@/components/blocks/ProcessBlock";
import { CTABlock } from "@/components/blocks/CTABlock";
import {ContactFormBlock} from "@/components/blocks/ContactFormBlock";
import {NewsFeedBlock} from "@/components/blocks/NewsFeedBlock";
import type { RouteParams } from "@/types/next";

type Args = {
  params: RouteParams<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug }, _status: { equals: "published" } },
    limit: 1,
  });

  const page = docs[0];
  if (!page) return { title: "Sayfa Bulunamadı" };

  // 1. Manuel girilen SEO verilerini al (Admin panelindeki SEO sekmesi)
  const manualMeta = page.meta || {};

  // 2. Akıllı Fallback: Önce manuel SEO başlığı, yoksa sayfanın kendi adı
  const finalTitle = manualMeta.title || page.title;

  // 3. Akıllı Fallback: Önce manuel açıklama, yoksa varsayılan kurumsal metin
  const finalDesc =
    manualMeta.description || `Ertip Medikal kurumsal bilgi: ${page.title}.`;

  // 4. Görsel Önceliği: Manuel SEO Görseli > Sitenin Varsayılan OG Görseli
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
  const { slug } = await params;

  const payload = await getPayload({ config: configPromise });

  // Slug'a göre sayfayı bul
  const { docs } = await payload.find({
    collection: "pages",
    where: {
      slug: { equals: slug },
      _status: { equals: "published" },
    },
    limit: 1,
    depth: 2, // Resim URL'lerini çekebilmek için depth gerekli
  });

  const page = docs[0];

  // Sayfa yoksa 404'e düş
  if (!page) {
    return notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sayfanın bloklarını (layout) döngüye sok ve render et */}
      {page.layout?.map((block: any, index: number) => {
        switch (block.blockType) {
          case "hero":
            return <HeroBlock key={index} {...block} />;
          case "content":
            return <ContentBlock key={index} {...block} />;
          case "features":
            return <FeaturesBlock key={index} {...block} />;
          case "featuredProducts":
            return <FeaturedProductsBlock key={index} {...block} />;
          case "faq":
            return <FAQBlock key={index} {...block} />;
          case "testimonial":
            return <TestimonialBlock key={index} {...block} />;
          case "stats":
            return <StatsBlock key={index} {...block} />;
          case "gallery":
            return <GalleryBlock key={index} {...block} />;
          case "logoSlider":
            return <LogoSliderBlock key={index} {...block} />;
          case "location":
            return <LocationBlock key={index} {...block} />;
          case "team":
            return <TeamBlock key={index} {...block} />;
          case "newsletter":
            return <NewsletterBlock key={index} {...block} />;
          case "heroSlider":
            return <HeroSliderBlock key={index} {...block} />;
          case "certificateGrid":
            return <CertificateGridBlock key={index} {...block} />;
          case "process":
            return <ProcessBlock key={index} {...block} />;
          case "cta":
            return <CTABlock key={index} {...block} />;
          case "contactForm":
            return <ContactFormBlock key={index} {...block} />;
          case "newsFeed":
            return <NewsFeedBlock key={index} {...block} />;
          default:
            return (
              <div key={index} className="p-4 text-center text-red-500">
                Tanımsız Blok: {block.blockType}
              </div>
            );
        }
      })}
    </div>
  );
}
