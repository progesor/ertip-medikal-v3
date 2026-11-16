import type { CollectionConfig } from "payload";

export const Categories: CollectionConfig = {
  slug: "categories",
  defaultSort: ["displayOrder", "id"],
  labels: { singular: "Kategori", plural: "Kategoriler" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "parent", "displayOrder"],
    group: "Ürün Yönetimi",
    description:
      "Katalog kategorilerini ve kategori bazlı ürün sırasını yönetin.",
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
    { name: "title", type: "text", required: true, label: "Kategori Adı" },
    {
      name: "displayOrder",
      type: "number",
      label: "Kategori sırası",
      defaultValue: 1000,
      required: true,
      min: 0,
      admin: {
        position: "sidebar",
        step: 1,
        description: "Aynı düzeyde küçük sayı önce görünür. Araya kategori eklemek için 10, 20, 30 gibi aralıklı sayılar kullanabilirsiniz.",
      },
    },
    {
      name: "slug",
      type: "text",
      unique: true,
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "parent",
      type: "relationship",
      relationTo: "categories",
      label: "Üst Kategori (Alt Kategori Yaratmak İçin)",
      admin: { position: "sidebar" },
    },
    {
      name: "description",
      type: "textarea",
      label: "Kategori Kısa Açıklaması",
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Kategori Görseli",
    },
    {
      name: "productSortMode",
      type: "select",
      label: "Kategori Ürün Sıralaması",
      defaultValue: "inherit",
      options: [
        { label: "Genel Katalog Ayarını Kullan", value: "inherit" },
        { label: "Son Eklenen Önce", value: "newest" },
        { label: "İlk Eklenen Önce", value: "oldest" },
        { label: "Manuel Sıralama", value: "manual" },
      ],
      admin: {
        description:
          "Bu kategori açıldığında ürünlerin hangi sırayla gösterileceğini belirler.",
      },
    },
    {
      name: "manualProductOrder",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      label: "Kategoriye Özel Manuel Ürün Sırası",
      admin: {
        condition: (_, siblingData) =>
          siblingData?.productSortMode === "manual",
        description:
          "Seçili ürünleri sürükleyerek sıralayın. İlk ürün kategorinin başında görünür. Yeni eklenen ürünler seçili listenin ardından gösterilir.",
      },
    },
  ],
};
