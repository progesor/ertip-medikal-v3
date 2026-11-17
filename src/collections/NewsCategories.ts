import type { CollectionConfig } from "payload";

export const NewsCategories: CollectionConfig = {
  slug: "news-categories",
  labels: { singular: "Haber Kategorisi", plural: "Haber Kategorileri" },
  admin: {
    components: { beforeListTable: ["/components/admin/CollectionViewControls#CollectionViewControls"] },
    useAsTitle: "title",
    defaultColumns: ["title", "updatedAt"],
    group: "İçerik Yönetimi",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Kategori adı",
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      label: "Kategori adresi",
      admin: { position: "sidebar" },
    },
    {
      name: "editOverview",
      type: "ui",
      admin: {
        components: {
          Field: "/components/admin/GenericEditOverview#GenericEditOverview",
        },
      },
    },
  ],
};
