import type { CollectionConfig } from "payload";
import path from "path";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Medya", plural: "Medyalar" },
  admin: {
    group: "Ürün Yönetimi",
    description: "Ürün görsellerini, belgeleri ve site medyalarını yönetin.",
  },
  access: {
    read: () => true,
  },
  upload: {
    // Dosyaları projenin kök dizinindeki 'media' klasörüne kaydeder.
    // Payload bunları otomatik olarak /api/media/file/resim.jpg adresinden sunar.
    staticDir: path.resolve(process.cwd(), "media"),
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "centre" },
      { name: "card", width: 768, height: 1024, position: "centre" },
      { name: "hero", width: 1920, height: 1080, position: "centre" },
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
