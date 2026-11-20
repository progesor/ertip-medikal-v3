import path from "node:path";
import { APIError, type CollectionConfig } from "payload";
import { contentManagers, isAdmin } from "@/access/roles";

export const CatalogOutputs: CollectionConfig = {
  slug: "catalog-outputs",
  labels: { singular: "Katalog dosyası", plural: "Katalog dosya arşivi" },
  admin: {
    group: "Katalog Stüdyosu",
    useAsTitle: "title",
    defaultColumns: ["title", "status", "pages", "createdAt"],
  },
  access: {
    read: contentManagers,
    create: () => false,
    update: () => false,
    delete: ({ req }) =>
      isAdmin(req.user) ? { status: { in: ["done", "failed"] } } : false,
  },
  hooks: {
    beforeDelete: [
      async ({ req, id }) => {
        const output = await req.payload.findByID({
          collection: "catalog-outputs",
          id,
          depth: 0,
          req,
        });
        if (output.status === "queued" || output.status === "running")
          throw new APIError(
            "Hazırlanan dosya silinemez. Tamamlanmasını bekleyin.",
            409,
          );
      },
    ],
  },
  upload: {
    staticDir: path.resolve("media", "catalog-pdfs"),
    mimeTypes: ["application/pdf", "application/zip"],
    filesRequiredOnCreate: false,
  },
  fields: [
    { name: "title", type: "text", required: true, label: "Belge" },
    {
      name: "catalog",
      type: "relationship",
      relationTo: "catalogs",
      label: "Çalışma",
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "queued",
      options: [
        { label: "Sırada", value: "queued" },
        { label: "Hazırlanıyor", value: "running" },
        { label: "Hazır", value: "done" },
        { label: "Tamamlanamadı", value: "failed" },
      ],
      label: "Durum",
    },
    { name: "error", type: "textarea", label: "İşlem bilgisi" },
    { name: "pages", type: "number", label: "Sayfa sayısı" },
    { name: "snapshot", type: "json", required: true, admin: { hidden: true } },
    {
      name: "assets",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      admin: { hidden: true },
    },
  ],
};
