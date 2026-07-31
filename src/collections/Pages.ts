import type { CollectionConfig } from "payload";
import { HeroBlock } from "@/blocks/HeroBlock";
import { ContentBlock } from "@/blocks/ContentBlock";
import { metaFields } from "@/fields/meta";
import { slugField } from "@/fields/slug";
import { FeaturesBlock } from "@/blocks/FeaturesBlock";
import { FeaturedProductsBlock } from "@/blocks/FeaturedProductsBlock";
import { FAQBlock } from "@/blocks/FAQBlock";
import { TestimonialBlock } from "@/blocks/TestimonialBlock";
import { StatsBlock } from "@/blocks/StatsBlock";
import { GalleryBlock } from "@/blocks/GalleryBlock";
import { LogoSliderBlock } from "@/blocks/LogoSliderBlock";
import { LocationBlock } from "@/blocks/LocationBlock";
import { TeamBlock } from "@/blocks/TeamBlock";
import { NewsletterBlock } from "@/blocks/NewsletterBlock";
import { HeroSliderBlock } from "@/blocks/HeroSliderBlock";
import { CertificateGridBlock } from "@/blocks/CertificateGridBlock";
import { ProcessBlock } from "@/blocks/ProcessBlock";
import { CTABlock } from "@/blocks/CTABlock";
import { ContactFormBlock } from "@/blocks/ContactFormBlock";
import { NewsFeedBlock } from "@/blocks/NewsFeedBlock";
import { MediaTextBlock } from "@/blocks/MediaTextBlock";
import { TimelineBlock } from "@/blocks/TimelineBlock";
import { ProductCategoryShowcaseBlock } from "@/blocks/ProductCategoryShowcaseBlock";
import { VideoMediaBlock } from "@/blocks/VideoMediaBlock";

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Sayfa", plural: "Sayfalar" },
  admin: {
    useAsTitle: "title",
    group: "İçerik Yönetimi",
    defaultColumns: ["title", "slug", "updatedAt"],
  },
  versions: { drafts: true },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Sayfa İçeriği",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              label: "Sayfa Başlığı",
            },
            {
              name: "layout",
              type: "blocks",
              label: "Sayfa Tasarım Blokları (Page Builder)",
              minRows: 1,
              blocks: [
                HeroBlock,
                ContentBlock,
                MediaTextBlock,
                TimelineBlock,
                ProductCategoryShowcaseBlock,
                VideoMediaBlock,
                FeaturesBlock,
                FeaturedProductsBlock,
                FAQBlock,
                TestimonialBlock,
                StatsBlock,
                GalleryBlock,
                LogoSliderBlock,
                LocationBlock,
                TeamBlock,
                NewsletterBlock,
                HeroSliderBlock,
                CertificateGridBlock,
                ProcessBlock,
                CTABlock,
                ContactFormBlock,
                NewsFeedBlock,
              ],
            },
          ],
        },
        {
          label: "SEO Ayarları",
          fields: [metaFields],
        },
      ],
    },
    slugField("title"),
  ],
};
