import type { Access, CollectionConfig } from "payload";

const isAdmin: Access = ({ req }) =>
  Boolean(req.user && "role" in req.user && req.user.role === "admin");

export const DownloadLogs: CollectionConfig = {
  slug: "download-logs",
  labels: { singular: "Kılavuz Logu", plural: "Kılavuz Logları" },
  admin: {
    useAsTitle: "accessCode",
    group: "Uyumluluk ve Kayıtlar",
    defaultColumns: ["productTitle", "accessCode", "ipAddress", "createdAt"],
  },
  access: {
    // Log records are written only through trusted server-side Local API calls.
    create: () => false,
    read: isAdmin,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    {
      name: "productTitle",
      type: "text",
      label: "Ürün Adı",
      admin: { readOnly: true },
    },
    {
      name: "documentName",
      type: "text",
      label: "Belge Adı",
      admin: { readOnly: true },
    },
    {
      name: "accessCode",
      type: "text",
      label: "Erişim Kodu Parmak İzi",
      admin: {
        readOnly: true,
        description:
          "Gerçek erişim kodu kaydedilmez. Aynı kodun kullanımını ilişkilendirmek için HMAC tabanlı kısa bir parmak izi tutulur.",
      },
    },
    {
      name: "ipAddress",
      type: "text",
      label: "IP Adresi",
      admin: { readOnly: true },
    },
    {
      name: "country",
      type: "text",
      label: "Ülke (Tahmini)",
      admin: { readOnly: true },
    },
    {
      name: "deviceInfo",
      type: "text",
      label: "Cihaz/Tarayıcı",
      admin: { readOnly: true },
    },
  ],
};
