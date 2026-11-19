import path from "node:path";
import type { CollectionConfig } from "payload";
import { contentManagers } from "@/access/roles";

export const CatalogOutputs: CollectionConfig = {
  slug: "catalog-outputs",
  labels: { singular: "Katalog PDF", plural: "Katalog PDF arşivi" },
  admin: {
    group: "Katalog Stüdyosu",
    useAsTitle: "title",
    defaultColumns: ["title", "status", "pages", "createdAt"],
  },
  access: {
    read: contentManagers,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  upload: {
    staticDir: path.resolve("media", "catalog-pdfs"),
    mimeTypes: ["application/pdf"],
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
