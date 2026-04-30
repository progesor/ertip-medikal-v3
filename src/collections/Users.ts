import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Kullanıcı", plural: "Kullanıcılar" },
  admin: {
    group: "Sistem",
    useAsTitle: "email",
    components: {
      beforeListTable: [
        "/components/admin/CollectionViewControls#CollectionViewControls",
      ],
    },
  },
  auth: true,
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
