import type { CollectionConfig } from "payload";

export const Subscribers: CollectionConfig = {
  slug: "subscribers",
  labels: {
    singular: "E-Bülten Abonesi",
    plural: "E-Bülten Aboneleri",
  },
  admin: {
    useAsTitle: "email",
    group: "Müşteri İletişimi",
    defaultColumns: ["email", "status", "createdAt"],
    // Gelecekte Excel/CSV olarak kolayca kopyalayabilmen için
    description: "E-bültene kayıt olan kullanıcıların listesi.",
  },
  access: {
    // Dışarıdan sadece veri oluşturulabilir (form gönderimi)
    create: () => true,
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      unique: true, // Aynı mailin iki kere kayıt olmasını engeller
      label: "E-Posta Adresi",
    },
    {
      name: "status",
      type: "select",
      defaultValue: "active",
      options: [
        { label: "Aktif", value: "active" },
        { label: "Abonelikten Çıktı", value: "unsubscribed" },
      ],
      label: "Abonelik Durumu",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "source",
      type: "text",
      label: "Kayıt Kaynağı",
      defaultValue: "Website Footer",
      admin: {
        position: "sidebar",
        readOnly: true, // Sadece bilgi amaçlı
      },
    },
  ],
};
