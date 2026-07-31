import type { Block } from "payload";
import { sectionField } from "@/fields/section";

export const ProductCategoryShowcaseBlock: Block = {
  slug: "productCategoryShowcase",
  labels: {
    singular: "Ürün Kategori Vitrini",
    plural: "Ürün Kategori Vitrinleri",
  },
  fields: [
    { name: "eyebrow", type: "text", label: "Küçük Üst Başlık" },
    {
      name: "title",
      type: "text",
      label: "Başlık",
      defaultValue: "Ürün Kategorilerimiz",
    },
    { name: "subtitle", type: "textarea", label: "Açıklama" },
    {
      type: "row",
      fields: [
        {
          name: "selectionMode",
          type: "select",
          label: "Kategori Kaynağı",
          defaultValue: "topLevel",
          options: [
            { label: "Tüm Ana Kategoriler", value: "topLevel" },
            { label: "Manuel Seçim", value: "manual" },
          ],
        },
        {
          name: "layoutMode",
          type: "select",
          label: "Yerleşim",
          defaultValue: "grid",
          options: [
            { label: "Grid", value: "grid" },
            { label: "Öne Çıkan", value: "featured" },
            { label: "Kompakt", value: "compact" },
          ],
        },
        {
          name: "columns",
          type: "select",
          label: "Sütun Sayısı",
          defaultValue: "3",
          options: [
            { label: "2", value: "2" },
            { label: "3", value: "3" },
            { label: "4", value: "4" },
          ],
        },
      ],
    },
    {
      name: "categories",
      type: "relationship",
      relationTo: "categories",
      hasMany: true,
      label: "Gösterilecek Kategoriler",
      admin: {
        condition: (_, siblingData) => siblingData?.selectionMode === "manual",
        description: "Kategorileri görünmesini istediğiniz sırayla seçin.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "cardStyle",
          type: "select",
          label: "Kart Stili",
          defaultValue: "overlay",
          options: [
            { label: "Görsel Üzeri", value: "overlay" },
            { label: "Klasik Kart", value: "card" },
            { label: "Minimal", value: "minimal" },
          ],
        },
        {
          name: "imageRatio",
          type: "select",
          label: "Görsel Oranı",
          defaultValue: "4:3",
          options: [
            { label: "4:3", value: "4:3" },
            { label: "16:9", value: "16:9" },
            { label: "Kare", value: "1:1" },
            { label: "Dikey", value: "3:4" },
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
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "showDescription",
          type: "checkbox",
          label: "Kategori Açıklamasını Göster",
          defaultValue: true,
        },
        {
          name: "showProductCount",
          type: "checkbox",
          label: "Ürün Sayısını Göster",
          defaultValue: true,
        },
        {
          name: "includeChildProducts",
          type: "checkbox",
          label: "Alt Kategori Ürünlerini Sayıya Dahil Et",
          defaultValue: true,
        },
      ],
    },
    {
      name: "emptyStateText",
      type: "text",
      label: "Kategori Bulunamazsa Mesaj",
      defaultValue: "Henüz gösterilecek kategori bulunmuyor.",
    },
    sectionField({
      background: "muted",
      spacing: "large",
      contentWidth: "wide",
    }),
  ],
};
