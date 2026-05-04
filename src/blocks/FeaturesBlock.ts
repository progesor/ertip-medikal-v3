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
      name: "layoutMode",
      type: "select",
      label: "Yerleşim Modu",
      defaultValue: "auto",
      options: [
        { label: "Otomatik", value: "auto" },
        { label: "Grid", value: "grid" },
        { label: "Öne Çıkan", value: "featured" },
        { label: "Kompakt", value: "compact" },
      ],
    },
    {
      name: "alignment",
      type: "select",
      label: "Başlık Hizalama",
      defaultValue: "center",
      options: [
        { label: "Orta", value: "center" },
        { label: "Sol", value: "left" },
      ],
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
