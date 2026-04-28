import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Kullanıcı", plural: "Kullanıcılar" },
  admin: { useAsTitle: "email" },
  auth: true,
  fields: [
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      label: "Sistem Rolü",
      options: [
        { label: "Yönetici (Admin)", value: "admin" },
        { label: "İçerik Editörü", value: "editor" },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "firstName", type: "text", label: "Ad" },
        { name: "lastName", type: "text", label: "Soyad" },
      ],
    },
  ],
};
