import type { Block } from "payload";
import { sectionField } from "@/fields/section";

export const TimelineBlock: Block = {
  slug: "timeline",
  labels: {
    singular: "Zaman Çizgisi",
    plural: "Zaman Çizgileri",
  },
  fields: [
    {
      name: "eyebrow",
      type: "text",
      label: "Küçük Üst Başlık",
    },
    {
      name: "title",
      type: "text",
      label: "Başlık",
      defaultValue: "Kilometre Taşlarımız",
    },
    {
      name: "subtitle",
      type: "textarea",
      label: "Açıklama",
    },
    {
      type: "row",
      fields: [
        {
          name: "layoutMode",
          type: "select",
          label: "Yerleşim",
          defaultValue: "alternating",
          options: [
            { label: "Sağ / Sol Dönüşümlü", value: "alternating" },
            { label: "Dikey Liste", value: "vertical" },
            { label: "Kart Grid", value: "cards" },
          ],
        },
        {
          name: "alignment",
          type: "select",
          label: "Başlık Hizası",
          defaultValue: "center",
          options: [
            { label: "Orta", value: "center" },
            { label: "Sol", value: "left" },
          ],
        },
        {
          name: "cardStyle",
          type: "select",
          label: "Kart Stili",
          defaultValue: "elevated",
          options: [
            { label: "Yükseltilmiş", value: "elevated" },
            { label: "Çerçeveli", value: "outlined" },
            { label: "Minimal", value: "minimal" },
          ],
        },
      ],
    },
    {
      name: "items",
      type: "array",
      label: "Kilometre Taşları",
      minRows: 1,
      maxRows: 16,
      fields: [
        {
          name: "dateLabel",
          type: "text",
          label: "Yıl / Tarih",
          required: true,
          admin: { placeholder: "2005" },
        },
        {
          name: "itemTitle",
          type: "text",
          label: "Başlık",
          required: true,
        },
        {
          name: "description",
          type: "textarea",
          label: "Açıklama",
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          label: "Görsel (Opsiyonel)",
        },
        {
          type: "row",
          fields: [
            {
              name: "highlight",
              type: "checkbox",
              label: "Öne Çıkar",
              defaultValue: false,
            },
            {
              name: "linkText",
              type: "text",
              label: "Bağlantı Metni",
            },
            {
              name: "link",
              type: "text",
              label: "Bağlantı",
              admin: { placeholder: "/hakkimizda" },
            },
          ],
        },
      ],
    },
    sectionField({
      background: "light",
      spacing: "large",
      contentWidth: "wide",
    }),
  ],
};
