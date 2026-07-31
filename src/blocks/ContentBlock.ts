import type { Block } from "payload";
import { sectionField } from "@/fields/section";

export const ContentBlock: Block = {
  slug: "content",
  labels: { singular: "Metin İçeriği", plural: "Metin İçerikleri" },
  fields: [
    {
      name: "eyebrow",
      type: "text",
      label: "Küçük Üst Başlık (Opsiyonel)",
    },
    {
      name: "title",
      type: "text",
      label: "Bölüm Başlığı (Opsiyonel)",
    },
    {
      name: "content",
      type: "richText",
      required: true,
      label: "İçerik Editörü",
    },
    {
      type: "row",
      fields: [
        {
          name: "layoutMode",
          type: "select",
          label: "Metin Yerleşimi",
          defaultValue: "single",
          options: [
            { label: "Tek Sütun", value: "single" },
            { label: "İki Sütun", value: "columns" },
          ],
        },
        {
          name: "bodySize",
          type: "select",
          label: "Metin Boyutu",
          defaultValue: "standard",
          options: [
            { label: "Kompakt", value: "compact" },
            { label: "Standart", value: "standard" },
            { label: "Büyük", value: "large" },
          ],
        },
        {
          name: "headingAlignment",
          type: "select",
          label: "Başlık Hizası",
          defaultValue: "left",
          options: [
            { label: "Sol", value: "left" },
            { label: "Orta", value: "center" },
          ],
        },
      ],
    },
    sectionField({
      background: "light",
      spacing: "standard",
      contentWidth: "compact",
    }),
  ],
};
