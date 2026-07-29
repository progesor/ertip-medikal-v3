import { getPayload } from "payload";
import configPromise from "@payload-config";
import { HeroBlock } from "@/components/blocks/HeroBlock";
import { ContentBlock } from "@/components/blocks/ContentBlock";
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
import { ContactFormBlock } from "@/components/blocks/ContactFormBlock";
import { Metadata } from "next";
import { NewsFeedBlock } from "@/components/blocks/NewsFeedBlock";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // absolute: layout.tsx'teki template kuralını ezer ve sadece buradaki metni kullanır
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

  // Slug'ı 'home' olan sayfayı bul
  const { docs } = await payload.find({
    collection: "pages",
    where: { slug: { equals: "home" }, _status: { equals: "published" } },
    limit: 1,
  });

  const homePage = docs[0];

  // Eğer CMS'te 'home' sayfası henüz oluşturulmadıysa bir uyarı gösterelim (veya fallback yapalım)
  if (!homePage) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-10 bg-background">
          <h1 className="text-2xl font-bold mb-4 text-text-main/70">
            Anasayfa Yapılandırılmadı
          </h1>
          <p className="text-text-muted">
            Lütfen Payload CMS üzerinden 'home' slug değerine sahip bir sayfa
            oluşturun ve bloklarınızı ekleyin.
          </p>
        </div>
    );
  }

  return (
      <main className="flex flex-col bg-background">
        {homePage.layout?.map((block: any, index: number) => {
          switch (block.blockType) {
            case "hero":
              return <HeroBlock key={index} {...block} />;
            case "heroSlider":
              return <HeroSliderBlock key={index} {...block} />;
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
                  <section key={index} className="p-8 bg-error/10 text-error font-medium border-y border-error/20">
                    Tanımsız blok: {String(block.blockType)}
                  </section>
              );
          }
        })}
      </main>
  );
}
