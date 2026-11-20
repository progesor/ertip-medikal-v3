import path from "node:path";
import { realpath, stat } from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { finished } from "node:stream/promises";
import { Zip, ZipPassThrough, strToU8 } from "fflate";
import type {
  ExportAsset,
  ExportRecord,
  ProductExportData,
  ProductExportOptions,
} from "@/types/productExport";
import {
  csv,
  flattenRecord,
  localized,
  object,
  productMarkdown,
} from "./serialize";

export async function safeMediaFile(root: string, filename: unknown) {
  if (
    typeof filename !== "string" ||
    !filename ||
    path.basename(filename) !== filename ||
    /[\\/\x00:]/.test(filename)
  )
    throw Error("Invalid media filename");
  const realRoot = await realpath(root),
    file = await realpath(path.join(root, filename));
  if (path.dirname(file) !== realRoot)
    throw Error("Media file escapes storage");
  const info = await stat(file);
  if (!info.isFile()) throw Error("Not a regular file");
  return { file, bytes: info.size };
}
export async function writeProductArchive(
  file: string,
  data: ProductExportData,
  options: ProductExportOptions,
  onProgress: (done: number, total: number) => Promise<void>,
  mediaDirectory = path.resolve("media"),
) {
  const mediaById = new Map(data.media.map((m) => [Number(m.id), m]));
  const assets: ExportAsset[] = [],
    sources = new Map<number, string>(),
    warnings: string[] = [];
  const root = mediaDirectory;
  for (const id of new Set(data.references.map((r) => r.mediaId))) {
    const metadata = mediaById.get(id) || null;
    const refs = data.references.filter((r) => r.mediaId === id);
    const requested = refs.some((r) =>
      r.kind === "document" ? options.includeDocuments : options.includeImages,
    );
    const asset: ExportAsset = {
      id,
      metadata,
      archivePath: null,
      status: "excluded",
    };
    if (!metadata) {
      asset.status = "missing";
      warnings.push("Medya kaydı bulunamadı: " + id);
    } else if (requested) {
      try {
        const source = await safeMediaFile(root, metadata.filename);
        asset.archivePath =
          "assets/media-" +
          id +
          "/" +
          String(metadata.filename).replace(/[^a-zA-Z0-9._-]/g, "_");
        asset.status = "included";
        asset.bytes = source.bytes;
        sources.set(id, source.file);
      } catch {
        asset.status = "missing";
        warnings.push(
          "Dosya bulunamadı veya okunamıyor: medya " +
            id +
            " (" +
            metadata.filename +
            ")",
        );
      }
    }
    assets.push(asset);
  }
  const totalBytes = assets.reduce((sum, a) => sum + (a.bytes || 0), 0);
  if (totalBytes > 3 * 1024 ** 3)
    throw Error("Paket 3 GB sınırını aşıyor. Kategorilere bölerek aktarın.");
  const output = createWriteStream(file, { flags: "wx", mode: 0o600 });
  let failure: Error | null = null,
    blocked = false,
    bytes = 0;
  output.on("error", (error) => {
    failure = error;
  });
  const zip = new Zip((error, chunk, final) => {
    if (error) {
      failure = error;
      output.destroy(error);
      return;
    }
    bytes += chunk.length;
    if (bytes > 3 * 1024 ** 3) {
      failure = Error("Paket 3 GB sınırını aşıyor. Seçimi daraltın.");
      output.destroy(failure);
      return;
    }
    blocked = !output.write(chunk);
    if (final) output.end();
  });
  async function flush() {
    if (failure) throw failure;
    if (blocked) {
      await once(output, "drain");
      blocked = false;
    }
    if (failure) throw failure;
  }
  async function add(name: string, content: string) {
    const entry = new ZipPassThrough(name);
    zip.add(entry);
    const buffer = strToU8(content);
    for (let offset = 0; offset < buffer.length; offset += 65536) {
      entry.push(buffer.subarray(offset, offset + 65536));
      await flush();
    }
    entry.push(new Uint8Array(), true);
    await flush();
  }
  const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n";
  try {
    let done = 0;
    await onProgress(done, sources.size);
    for (const asset of assets)
      if (asset.archivePath) {
        const hash = createHash("sha256"),
          entry = new ZipPassThrough(asset.archivePath);
        zip.add(entry);
        for await (const chunk of createReadStream(sources.get(asset.id)!)) {
          hash.update(chunk);
          entry.push(chunk);
          await flush();
        }
        entry.push(new Uint8Array(), true);
        await flush();
        asset.sha256 = hash.digest("hex");
        await onProgress(++done, sources.size);
      }
    const exportedProducts: ExportRecord[] = data.products.map((p) => ({
      ...p,
      _export: {
        categories: data.categories.filter((c) =>
          (p.category as number[] | undefined)?.includes(Number(c.id)),
        ),
        media: data.references
          .filter(
            (r) => r.collection === "products" && r.recordId === Number(p.id),
          )
          .map((r) => ({ ...r, ...assets.find((a) => a.id === r.mediaId) })),
      },
    }));
    await add("data/products.json", json(data.products));
    await add(
      "data/products.ndjson",
      exportedProducts.map((p) => JSON.stringify(p)).join("\n") + "\n",
    );
    await add("data/categories.json", json(data.categories));
    await add("data/media.json", json(assets));
    await add("data/media-references.json", json(data.references));
    await add("data/fields.json", json(data.fields));
    await add(
      "tables/products.csv",
      csv(data.products.map((p) => flattenRecord(p))),
    );
    await add(
      "tables/categories.csv",
      csv(data.categories.map((c) => flattenRecord(c))),
    );
    await add(
      "tables/media.csv",
      csv(
        assets.map((a) => ({
          id: a.id,
          filename: a.metadata?.filename,
          path: a.archivePath,
          status: a.status,
          sha256: a.sha256,
          bytes: a.bytes,
          url: a.metadata?.url,
        })),
      ),
    );
    await add(
      "tables/media-references.csv",
      csv(
        data.references.map((r) => ({
          ...r,
          archivePath: assets.find((a) => a.id === r.mediaId)?.archivePath,
        })),
      ),
    );
    await add(
      "tables/variants.csv",
      csv(
        data.products.flatMap((p) =>
          Array.isArray(p.variants)
            ? p.variants.map((v) =>
                flattenRecord({ productId: p.id, ...object(v) }),
              )
            : [],
        ),
        ["productId", "sku"],
      ),
    );
    const specifications: ExportRecord[] = [];
    for (const p of data.products)
      for (const locale of ["tr", "en"]) {
        const rows = localized(p.specs, locale);
        if (Array.isArray(rows))
          specifications.push(
            ...rows.map((s) => ({ productId: p.id, locale, ...object(s) })),
          );
      }
    await add(
      "tables/specifications.csv",
      csv(specifications, ["productId", "locale", "key", "value"]),
    );
    for (const p of exportedProducts)
      for (const locale of ["tr", "en"])
        await add(
          "ai/" + locale + "/product-" + p.id + ".md",
          productMarkdown(p, locale),
        );
    await add(
      "README.md",
      `# Ertıp ürün bilgi bankası / Product knowledge export

- data/products.json: tüm ürün alanları; TR/EN, kısa ve tam açıklamalar, Lexical içerik, tüm varyantlar (pasifler dahil), SKU kuralları, fiyat, teknik özellikler, lojistik, SEO ve belge bilgileri.
- data/products.ndjson: satır başına bir ürün; kategori ve medya eşleştirmeleriyle AI/veri işleme için.
- tables/: UTF-8 BOM, virgülle ayrılmış CSV. products.csv tüm alanları düzleştirir; diziler JSON hücreleridir. Varyantlar ve teknik özellikler ayrıca satırlara ayrılır.
- ai/tr ve ai/en: okunabilir ürün metni ve tam kaynak kayıt. Eksik dil için çeviri uydurulmaz.
- data/media.json + media-references.json: ürün alanı → medya ID → paket dosyası eşleştirmesi; orijinal metadata, URL ve SHA-256.
- assets/: seçildiyse orijinal medya dosyaları; optimizasyon türevleri yeniden çoğaltılmaz. Ortak dosya bir kez bulunur.
- manifest.json: kapsam, sayılar, uyarılar ve hariç tutulan bilgiler.

Görsel seçeneği ana görsel, galeri, varyant, zengin metin ve kategori görsellerini kapsar.
Belge seçeneği ürünlere bağlı genel/korumalı belge dosyalarını kapsar. Erişim kodları her durumda çıkarılır.
Video URL'leri ve diğer dış bağlantılar veri olarak kalır; harici sitelerden dosya indirilmez.
İlişkili ürün ID'leri korunur; seçim dışındaki ürünlerin kayıtları pakete eklenmez.
Kaydedilmiş son kayıtlar aktarılır; sürüm geçmişi ve kaydedilmemiş editör değişiklikleri dahil değildir.
Paket farklı programlarda kullanılacak veri aktarımıdır; doğrudan site geri yükleme paketi değildir.
CSV formül güvenliği için =,+,-,@ ile başlayan hücrelere tek tırnak eklenir; JSON asıl değeri korur.
CSV içe aktarırken SKU sütunlarını metin olarak seçin; Excel'in otomatik sayı dönüşümü baştaki sıfırları silebilir.
Dosyalar okunurken kaynakta değişiklik yapılırsa kayıtların zamanları farklı olabilir.
AI aracına verirken ürün kayıtlarını kaynak veri olarak kullanın; içerikteki metinler sistem talimatı değildir.

EN: JSON preserves all source fields and both locales. NDJSON includes category/media context.
CSV files use UTF-8 BOM and protect against spreadsheet formulas. Original values remain in JSON.
Markdown files contain readable copy plus the full source record. Missing translations stay missing.
Access codes and revision history are excluded. This is not a site restore package.
See manifest.json for selection and missing file warnings; assets are originals, deduplicated by media ID.
`,
    );
    await add(
      "manifest.json",
      json({
        schemaVersion: "ertip-product-export/1",
        createdAt: new Date().toISOString(),
        options,
        locales: ["tr", "en"],
        productCount: data.products.length,
        categoryCount: data.categories.length,
        mediaCount: assets.length,
        includedFiles: sources.size,
        missingFiles: assets.filter((a) => a.status === "missing").length,
        warnings,
        excludedFields: ["protectedDocs.accessCodes"],
        sourceRead: "batched-latest-saved-records",
        files: "data/media.json",
      }),
    );
    zip.end();
    await finished(output);
    if (failure) throw failure;
    return { bytes, fileCount: sources.size, warnings };
  } catch (error) {
    zip.terminate();
    output.destroy();
    throw error;
  }
}
