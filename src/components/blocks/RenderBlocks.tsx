import { HeroBlock } from "@/components/blocks/HeroBlock";
import { HeroSliderBlock } from "@/components/blocks/HeroSliderBlock";
import { ContentBlock } from "@/components/blocks/ContentBlock";
import { MediaTextBlock } from "@/components/blocks/MediaTextBlock";
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
import { CertificateGridBlock } from "@/components/blocks/CertificateGridBlock";
import { ProcessBlock } from "@/components/blocks/ProcessBlock";
import { CTABlock } from "@/components/blocks/CTABlock";
import { ContactFormBlock } from "@/components/blocks/ContactFormBlock";
import { NewsFeedBlock } from "@/components/blocks/NewsFeedBlock";

type BlockItem = {
  id?: string | number | null;
  blockType?: string | null;
  [key: string]: unknown;
};

type RenderContext = {
  pageTitle?: string;
  pageSlug?: string;
  isHome?: boolean;
};

type RenderBlocksProps = {
  blocks?: unknown[] | null;
  context?: RenderContext;
};

function UnknownBlock({ blockType }: { blockType?: string | null }) {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <section className="border-y border-error/20 bg-error/10 p-6 text-center font-medium text-error">
      Tanımsız blok: {String(blockType || "bilinmiyor")}
    </section>
  );
}

export function RenderBlocks({ blocks, context }: RenderBlocksProps) {
  if (!blocks || blocks.length === 0) return null;

  return blocks.map((rawBlock, index) => {
    const block = rawBlock as BlockItem;
    const key = String(block.id || `${block.blockType || "block"}-${index}`);
    const props = block as any;

    switch (block.blockType) {
      case "hero":
        return (
          <HeroBlock
            key={key}
            {...props}
            pageTitle={context?.pageTitle}
            pageSlug={context?.pageSlug}
            isHome={context?.isHome}
          />
        );
      case "heroSlider":
        return <HeroSliderBlock key={key} {...props} />;
      case "content":
        return <ContentBlock key={key} {...props} />;
      case "mediaText":
        return <MediaTextBlock key={key} {...props} />;
      case "features":
        return <FeaturesBlock key={key} {...props} />;
      case "featuredProducts":
        return <FeaturedProductsBlock key={key} {...props} />;
      case "faq":
        return <FAQBlock key={key} {...props} />;
      case "testimonial":
        return <TestimonialBlock key={key} {...props} />;
      case "stats":
        return <StatsBlock key={key} {...props} />;
      case "gallery":
        return <GalleryBlock key={key} {...props} />;
      case "logoSlider":
        return <LogoSliderBlock key={key} {...props} />;
      case "location":
        return <LocationBlock key={key} {...props} />;
      case "team":
        return <TeamBlock key={key} {...props} />;
      case "newsletter":
        return <NewsletterBlock key={key} {...props} />;
      case "certificateGrid":
        return <CertificateGridBlock key={key} {...props} />;
      case "process":
        return <ProcessBlock key={key} {...props} />;
      case "cta":
        return <CTABlock key={key} {...props} />;
      case "contactForm":
        return <ContactFormBlock key={key} {...props} />;
      case "newsFeed":
        return <NewsFeedBlock key={key} {...props} />;
      default:
        return <UnknownBlock key={key} blockType={block.blockType} />;
    }
  });
}
