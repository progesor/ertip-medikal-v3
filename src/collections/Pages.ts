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
import {ContactFormBlock} from "@/blocks/ContactFormBlock";
import {NewsFeedBlock} from "@/blocks/NewsFeedBlock";

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Sayfa", plural: "Sayfalar" },
  admin: {
    group: "İçerik Yönetimi",
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
    components: {
      beforeListTable: [
        "/components/admin/CollectionViewControls#CollectionViewControls",
      ],
    },
  },
  versions: { drafts: true },
  fields: [
    {
      name: "editOverview",
      type: "ui",
      admin: {
        components: {
          Field: "/components/admin/GenericEditOverview#GenericEditOverview",
        },
      },
    },
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
              name: "pageBuilderStudio",
              type: "ui",
              admin: {
                components: {
                  Field: "/components/admin/PageBuilderStudio#PageBuilderStudio",
                },
              },
            },
            {
              name: "layout",
              type: "blocks",
              label: "Sayfa Tasarım Blokları (Page Builder)",
              minRows: 1,
              blocks: [
                HeroBlock,
                ContentBlock,
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
    // Yan Bar (Sidebar)
    slugField("title"),
  ],
};
