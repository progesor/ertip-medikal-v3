import type { CollectionConfig } from "payload";
import {
  adminOrSelf,
  adminsOnly,
  authenticated,
  isAdmin,
} from "@/access/roles";

const allowAnonymousFirstUser =
  process.env.NODE_ENV !== "production" ||
  process.env.ALLOW_PUBLIC_ADMIN_BOOTSTRAP === "true";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Kullanıcı", plural: "Kullanıcılar" },
  admin: {
    components: {
      beforeListTable: ["/components/admin/CollectionViewControls#CollectionViewControls"],
      views: {
        backups: {
          path: "/yedekler",
          exact: true,
          Component: "/components/admin/BackupCenter#BackupCenter",
          meta: { title: "Yedekleme ve taşıma" },
        },
      },
    },
    useAsTitle: "email", group: "Sistem", defaultColumns: ["email", "firstName", "lastName", "role"],
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    tokenExpiration: 8 * 60 * 60,
    cookies: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    },
  },
  access: {
    admin: authenticated,
    create: async ({ req }) => {
      if (isAdmin(req.user)) return true;
      if (!allowAnonymousFirstUser) return false;

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
      label: "Yetki düzeyi",
      admin: { description: "Yöneticiler tüm paneli, içerik editörleri katalog ve site içeriklerini yönetebilir." },
      access: {
        create: ({ req }) =>
          isAdmin(req.user) || (!req.user && allowAnonymousFirstUser),
        update: adminsOnly,
      },
      options: [
        { label: "Yönetici", value: "admin" },
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
    {
      name: "editOverview",
      type: "ui",
      admin: {
        components: {
          Field: "/components/admin/GenericEditOverview#GenericEditOverview",
        },
      },
    },
  ],
};
