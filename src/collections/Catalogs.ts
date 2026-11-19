import type { CollectionConfig } from "payload";
import { adminsOnly, contentManagers } from "@/access/roles";
import { catalogConfigSchema } from "@/lib/catalog/schema";

export const Catalogs: CollectionConfig = {
  slug: "catalogs",
  labels: { singular: "Katalog çalışması", plural: "Katalog çalışmaları" },
  admin: {
    group: "Katalog Stüdyosu",
    useAsTitle: "title",
    defaultColumns: ["title", "isTemplate", "updatedAt"],
    components: {
      views: {
        studio: {
          path: "/studio",
          exact: true,
          Component: "/components/admin/catalog/CatalogStudio#CatalogStudio",
          meta: { title: "Katalog Stüdyosu" },
        },
      },
    },
  },
  access: {
    create: contentManagers,
    read: contentManagers,
    update: contentManagers,
    delete: adminsOnly,
  },
  fields: [
    { name: "title", type: "text", required: true, label: "Çalışma adı" },
    {
      name: "isTemplate",
      type: "checkbox",
      defaultValue: false,
      label: "Şablon",
    },
    {
      name: "config",
      type: "json",
      required: true,
      label: "Tasarım",
      validate: (value) =>
        catalogConfigSchema.safeParse(value).success ||
        "Katalog tasarımını kontrol edin.",
    },
    {
      name: "assets",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      admin: { hidden: true },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data?.config) return data;
        const parsed = catalogConfigSchema.safeParse(data.config);
        if (parsed.success)
          data.assets = [
            ...new Set(
              [
                parsed.data.coverImageId,
                ...parsed.data.overrides.map((p) => p.imageId),
              ].filter((v): v is number => typeof v === "number"),
            ),
          ];
        return data;
      },
    ],
  },
};
