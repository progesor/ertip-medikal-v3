import type { CollectionConfig } from "payload";

export const Categories: CollectionConfig = {
  slug: "categories",
  labels: { singular: "Kategori", plural: "Kategoriler" },
  admin: {
    useAsTitle: "title",
    group: "Ürün Yönetimi",
    description:
      "Katalog kategorilerini ve kategori bazlı ürün sırasını yönetin.",
  },
  fields: [
    { name: "title", type: "text", required: true, label: "Kategori Adı" },
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
          "Ürünleri görünmesini istediğiniz sırayla seçin. Listede olmayan kategori ürünleri bu listenin ardından en yeni ürün önce olacak şekilde gösterilir.",
      },
    },
  ],
};
