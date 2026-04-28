import { Block } from "payload";

export const FeaturesBlock: Block = {
  slug: "features",
  labels: {
    singular: "Özellik Kartları",
    plural: "Özellik Kartları",
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Blok Başlığı",
      admin: { placeholder: "Örn: Neden Ertip Medikal?" },
    },
    {
      name: "subtitle",
      type: "text",
      label: "Alt Başlık",
    },
    {
      name: "features",
      type: "array",
      label: "Özellikler",
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          name: "icon",
          type: "select",
          label: "İkon Seçimi",
          options: [
            { label: "Yıldız", value: "star" },
            { label: "Kalkan / Güvenlik", value: "shield" },
            { label: "Cihaz / Teknoloji", value: "cpu" },
            { label: "Küresel / Dünya", value: "globe" },
            { label: "Kalp / Sağlık", value: "heart" },
            { label: "Ayarlar / Mühendislik", value: "settings" },
          ],
        },
        {
          name: "featureTitle",
          type: "text",
          label: "Özellik Başlığı",
          required: true,
        },
        { name: "featureDescription", type: "textarea", label: "Açıklama" },
      ],
    },
  ],
};
