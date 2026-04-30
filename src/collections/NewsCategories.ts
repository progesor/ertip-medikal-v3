import type { CollectionConfig } from "payload";

export const NewsCategories: CollectionConfig = {
  slug: "news-categories",
  labels: { singular: "Haber Kategorisi", plural: "Haber Kategorileri" },
  admin: {
    group: "İçerik Yönetimi",
    useAsTitle: "title",
    components: {
      beforeListTable: [
        "/components/admin/CollectionViewControls#CollectionViewControls",
      ],
    },
  },
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
      name: "title",
      type: "text",
      required: true,
      label: "Kategori Adı (Örn: Yurt Dışı Etkinlikleri)",
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      label: "URL Yolu",
      admin: { position: "sidebar" },
    },
  ],
};
