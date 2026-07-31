import type { Block } from "payload";
import { sectionField } from "@/fields/section";

export const GalleryBlock: Block = {
  slug: "gallery",
  labels: { singular: "Galeri Bloğu", plural: "Galeri Blokları" },
  fields: [
    {
      name: "eyebrow",
      type: "text",
      label: "Küçük Üst Başlık",
    },
    {
      name: "title",
      type: "text",
      label: "Galeri Başlığı",
    },
    {
      name: "subtitle",
      type: "textarea",
      label: "Alt Başlık",
    },
    {
      type: "row",
      fields: [
        {
          name: "galleryLayout",
          type: "select",
          label: "Galeri Yerleşimi",
          defaultValue: "mosaic",
          options: [
            { label: "Mozaik", value: "mosaic" },
            { label: "Grid", value: "grid" },
            { label: "Masonry", value: "masonry" },
            { label: "Öne Çıkan", value: "featured" },
          ],
        },
        {
          name: "imageRatio",
          type: "select",
          label: "Grid Görsel Oranı",
          defaultValue: "landscape",
          options: [
            { label: "Görselin Kendi Oranı", value: "auto" },
            { label: "Yatay 4:3", value: "landscape" },
            { label: "Geniş 16:9", value: "wide" },
            { label: "Kare 1:1", value: "square" },
            { label: "Dikey 3:4", value: "portrait" },
          ],
        },
        {
          name: "alignment",
          type: "select",
          label: "Başlık Hizalama",
          defaultValue: "left",
          options: [
            { label: "Sol", value: "left" },
            { label: "Orta", value: "center" },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "enableLightbox",
          type: "checkbox",
          label: "Büyütülebilir Lightbox Kullan",
          defaultValue: true,
        },
        {
          name: "showCaptions",
          type: "checkbox",
          label: "Başlık ve Açıklamaları Göster",
          defaultValue: true,
        },
      ],
    },
    {
      name: "images",
      type: "array",
      label: "Görseller",
      minRows: 1,
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "title",
          type: "text",
          label: "Görsel Başlığı (Opsiyonel)",
        },
        {
          name: "description",
          type: "textarea",
          label: "Görsel Açıklaması (Opsiyonel)",
        },
      ],
    },
    sectionField({
      background: "muted",
      spacing: "large",
      contentWidth: "wide",
    }),
  ],
};
