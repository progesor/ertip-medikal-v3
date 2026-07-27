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
    description: "E-bültene kayıt olan kullanıcıların listesi.",
  },
  access: {
    // Anonymous subscriptions go through /api/public/newsletter.
    create: ({ req: { user } }) => Boolean(user),
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
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
        readOnly: true,
      },
    },
  ],
};
