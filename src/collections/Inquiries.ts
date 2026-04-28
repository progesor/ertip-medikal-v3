import type { CollectionConfig } from "payload";

export const Inquiries: CollectionConfig = {
  slug: "inquiries",
  labels: {
    singular: "Gelen Talep",
    plural: "Gelen Talepler",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "status", "createdAt"],
  },
  access: {
    // Dışarıdan sadece veri oluşturulabilir (form gönderimi), okuma ve silme sadece admin yapabilir
    create: () => true,
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "status",
      type: "select",
      defaultValue: "unread",
      options: [
        { label: "Okunmadı", value: "unread" },
        { label: "İnceleniyor", value: "pending" },
        { label: "Yanıtlandı", value: "resolved" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "name", type: "text", required: true, label: "Ad Soyad" },
    { name: "email", type: "email", required: true, label: "E-Posta" },
    { name: "phone", type: "text", label: "Telefon" },
    { name: "message", type: "textarea", required: true, label: "Mesaj" },
  ],
};
