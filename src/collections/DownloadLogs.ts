import { CollectionConfig } from "payload";

export const DownloadLogs: CollectionConfig = {
  slug: "download-logs",
  labels: { singular: "Kılavuz Logu", plural: "Kılavuz Logları" },
  admin: {
    useAsTitle: "accessCode",
    defaultColumns: ["productTitle", "accessCode", "ipAddress", "createdAt"],
  },
  access: {
    create: () => true, // API üzerinden veri yazılabilmesi için
    read: ({ req: { user } }) => Boolean(user),
    update: () => false, // Log güvenliği için güncelleme kapalı
    delete: ({ req: { user } }) => Boolean(user),
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
      label: "Kullanılan Kod",
      admin: { readOnly: true },
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
