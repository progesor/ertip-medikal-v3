import type { MCPPluginConfig } from "@payloadcms/plugin-mcp";
import { isContentManager } from "@/access/roles";
import sharp from "sharp";
import { z } from "zod";

const maxBytes = 8 * 1024 * 1024;
const input = z.object({
  filename: z.string().trim().min(1).max(160)
    .regex(/^[\p{L}\p{N}][\p{L}\p{N} _.-]*\.(?:jpe?g|png|webp)$/iu)
    .describe("Dosya adı ve uzantısı (JPEG, PNG veya WebP)."),
  alt: z.string().trim().min(1).max(500).describe("Ürün görselinin alternatif metni."),
  base64: z.string().min(4).max(4 * Math.ceil(maxBytes / 3))
    .describe("Dosya içeriği, standart Base64 biçiminde (en fazla 8 MiB)."),
});

type Tool = NonNullable<NonNullable<MCPPluginConfig["mcp"]>["tools"]>[number];

export const uploadProductImage: Tool = {
  name: "uploadProductImage",
  description: "Bir ürün fotoğrafını medya kütüphanesine yükler. Ürün veya varyantta kullanılabilecek medya kimliğini döndürür.",
  parameters: input.shape,
  async handler(args, req) {
    if (!isContentManager(req.user)) throw new Error("İçerik düzenleme yetkisi gerekiyor.");
    const { filename, alt, base64 } = input.parse(args);
    const data = Buffer.from(base64, "base64");
    if (!data.length || data.length > maxBytes || data.toString("base64") !== base64) {
      throw new Error("Görsel verisi geçersiz veya dosya 8 MiB sınırını aşıyor.");
    }

    const extension = filename.split(".").pop()!.toLowerCase();
    const format = extension === "jpg" ? "jpeg" : extension;
    const metadata = await sharp(data, { limitInputPixels: 48_000_000 }).metadata();
    if (metadata.format !== format || !metadata.width || !metadata.height ||
        metadata.width * metadata.height > 48_000_000) {
      throw new Error("Görsel, dosya uzantısıyla eşleşmeli ve en fazla 48 megapiksel olmalıdır.");
    }

    const media = await req.payload.create({
      collection: "media",
      data: { alt },
      file: { name: filename, mimetype: `image/${format}`, size: data.length, data },
      overwriteExistingFiles: false,
      depth: 0,
      overrideAccess: false,
      req,
      user: req.user,
    });
    const { id, url, filename: storedFilename } = media;
    return { content: [{ type: "text", text: JSON.stringify({ id, filename: storedFilename, url }) }] };
  },
};
