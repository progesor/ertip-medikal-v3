import type { CollectionConfig } from "payload";
import {
  adminOrSelf,
  adminsOnly,
  authenticated,
  isAdmin,
} from "@/access/roles";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Kullanıcı", plural: "Kullanıcılar" },
  admin: { useAsTitle: "email", group: "Sistem" },
  auth: true,
  access: {
    admin: authenticated,
    create: async ({ req }) => {
      if (isAdmin(req.user)) return true;

      const existingUsers = await req.payload.find({
        collection: "users",
        limit: 0,
        overrideAccess: true,
      });

      return existingUsers.totalDocs === 0;
    },
    read: adminOrSelf,
    update: adminOrSelf,
    delete: adminsOnly,
    unlock: adminsOnly,
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation !== "create" || !data) return data;

        const existingUsers = await req.payload.find({
          collection: "users",
          limit: 0,
          overrideAccess: true,
        });

        if (existingUsers.totalDocs === 0) {
          return {
            ...data,
            role: "admin",
          };
        }

        return data;
      },
    ],
  },
  fields: [
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      saveToJWT: true,
      label: "Sistem Rolü",
      access: {
        create: ({ req }) => !req.user || isAdmin(req.user),
        update: adminsOnly,
      },
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
