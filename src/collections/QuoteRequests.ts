import type { CollectionConfig } from "payload";

export const QuoteRequests: CollectionConfig = {
  slug: "quote-requests",
  labels: { singular: "Teklif Talebi", plural: "Teklif Talepleri" },
  admin: {
    group: "İletişim ve Talepler",
    useAsTitle: "customerName",
    defaultColumns: ["customerName", "company", "createdAt", "status"],
    components: {
      beforeListTable: [
        "/components/admin/CollectionViewControls#CollectionViewControls",
      ],
    },
  },
  // Dışarıdan form gönderilebilmesi için yetkileri açıyoruz
  access: {
    create: () => true,
    read: ({ req: { user } }) => Boolean(user), // Sadece admin okuyabilir
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
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
      type: "row",
      fields: [
        {
          name: "customerName",
          type: "text",
          label: "Müşteri / Yetkili Adı",
          required: true,
          admin: { width: "50%" },
        },
        {
          name: "company",
          type: "text",
          label: "Firma / Klinik Adı",
          admin: { width: "50%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "email",
          type: "email",
          label: "E-Posta Adresi",
          required: true,
          admin: { width: "50%" },
        },
        {
          name: "phone",
          type: "text",
          label: "Telefon Numarası",
          required: true,
          admin: { width: "50%" },
        },
      ],
    },
    {
      name: "message",
      type: "textarea",
      label: "Müşteri Notu / Özel İstekler",
    },
    {
      name: "status",
      type: "select",
      label: "Talep Durumu",
      defaultValue: "new",
      options: [
        { label: "🔴 Yeni Talep", value: "new" },
        { label: "🟡 İnceleniyor", value: "reviewing" },
        { label: "🟢 Fiyat Verildi", value: "quoted" },
        { label: "⚫ Kapandı / İptal", value: "closed" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "items",
      type: "array",
      label: "Talep Edilen Ürünler",
      required: true,
      admin: {
        components: {
          RowLabel: "/components/admin/AdminArrayRowLabel#AdminArrayRowLabel",
        },
      },
      fields: [
        { name: "productTitle", type: "text", label: "Ürün Adı" },
        { name: "variantInfo", type: "text", label: "Seçilen Model / Varyant" },
        { name: "sku", type: "text", label: "Ürün Kodu (SKU)" },
        { name: "quantity", type: "number", label: "Adet", defaultValue: 1 },
      ],
    },
  ],
};
