import type { CollectionConfig } from "payload";
import path from "path";
import { getAnonymousMediaReadAccess } from "@/lib/security/protectedMedia";
import { isSupportedImageMimeType } from "@/lib/imageOptimization/config";
import {
  markImageOptimizationStale,
  removeOptimizedMediaVariants,
} from "@/lib/imageOptimization/server";

async function markRasterMediaChanged({
  id,
  mimeType,
  filename,
  payload,
}: {
  id: number | string;
  mimeType?: string | null;
  filename?: string | null;
  payload: Parameters<typeof markImageOptimizationStale>[0];
}) {
  if (!isSupportedImageMimeType(mimeType)) return;

  try {
    await removeOptimizedMediaVariants(id);
    await markImageOptimizationStale(
      payload,
      `${filename || "Bir görsel"} değişti. Güncel türevleri üretmek için toplu optimizasyonu yeniden çalıştırın.`,
    );
  } catch (error) {
    payload.logger.error(
      { err: error },
      "Image optimization state could not be marked stale",
    );
  }
}

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Medya", plural: "Medyalar" },
  admin: {
    group: "Ürün Yönetimi",
    description: "Ürün görsellerini, belgeleri ve site medyalarını yönetin.",
  },
  access: {
    read: async ({ req, id }) => {
      if (req.user) return true;

      return getAnonymousMediaReadAccess(req.payload, id);
    },
  },
  hooks: {
    afterRead: [
      ({ doc, req }) => {
        if (req.user || !doc?.url || !doc?.sizes) return doc;

        // Historical Payload sizes were generated with fixed width + height and
        // therefore contain irreversible centre crops. Public website reads
        // always start from the original asset; the manual optimizer creates
        // its own aspect-ratio-safe derivatives from that source.
        const sizes = Object.fromEntries(
          Object.entries(doc.sizes).map(([name, size]) => [
            name,
            size && typeof size === "object"
              ? { ...size, url: doc.url }
              : size,
          ]),
        );

        return { ...doc, sizes };
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        await markRasterMediaChanged({
          id: doc.id,
          mimeType: doc.mimeType,
          filename: doc.filename,
          payload: req.payload,
        });

        return doc;
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await markRasterMediaChanged({
          id: doc.id,
          mimeType: doc.mimeType,
          filename: doc.filename,
          payload: req.payload,
        });

        return doc;
      },
    ],
  },
  upload: {
    // Dosyaları projenin kök dizinindeki 'media' klasörüne kaydeder.
    // Payload bunları otomatik olarak /api/media/file/resim.jpg adresinden sunar.
    staticDir: path.resolve(process.cwd(), "media"),
    crop: false,
    focalPoint: false,
    imageSizes: [
      { name: "thumbnail", width: 400, withoutEnlargement: true },
      { name: "card", width: 900, withoutEnlargement: true },
      { name: "hero", width: 1920, withoutEnlargement: true },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/*", "application/pdf"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Alternatif Metin / Belge Adı",
      admin: {
        description:
          "Görseller için SEO metni, PDF'ler için dosya başlığı olarak kullanılır.",
      },
    },
    {
      name: "caption",
      type: "text",
      label: "Altyazı (Opsiyonel)",
    },
  ],
};
