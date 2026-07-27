import fs from "node:fs/promises";
import path from "node:path";
import type { Payload } from "payload";
import sharp from "sharp";
import {
  IMAGE_OPTIMIZATION_PROFILES,
  createImageOptimizationFingerprint,
  getOptimizedImageRelativePath,
  isSupportedImageMimeType,
  normalizeImageOptimizationSettings,
  type ImageOptimizationProfile,
  type NormalizedImageOptimizationSettings,
} from "@/lib/imageOptimization/config";

export const MEDIA_ROOT = path.resolve(process.cwd(), "media");
export const OPTIMIZED_MEDIA_ROOT = path.join(MEDIA_ROOT, "optimized");

type OptimizableMedia = {
  id: number | string;
  filename?: string | null;
  mimeType?: string | null;
};

export type MediaOptimizationResult = {
  generated: number;
  skipped: number;
  error: string | null;
};

function getSafeSourcePath(filename: string) {
  const basename = path.basename(filename);

  if (basename !== filename) return null;

  const sourcePath = path.resolve(MEDIA_ROOT, basename);

  if (!sourcePath.startsWith(`${MEDIA_ROOT}${path.sep}`)) return null;

  return sourcePath;
}

export async function loadImageOptimizationSettings(payload: Payload) {
  const document = await payload.findGlobal({
    slug: "imageOptimization",
    overrideAccess: true,
  });
  const settings = normalizeImageOptimizationSettings(document);
  const currentFingerprint = createImageOptimizationFingerprint(settings);

  return {
    document,
    settings: {
      ...settings,
      settingsFingerprint: currentFingerprint,
    } satisfies NormalizedImageOptimizationSettings,
    currentFingerprint,
  };
}

async function writeProfileVariant({
  sourcePath,
  outputPath,
  profile,
  settings,
}: {
  sourcePath: string;
  outputPath: string;
  profile: ImageOptimizationProfile;
  settings: NormalizedImageOptimizationSettings;
}) {
  const profileSettings = settings.profiles[profile];
  const temporaryPath = `${outputPath}.tmp-${process.pid}-${Date.now()}`;
  let pipeline = sharp(sourcePath, { animated: false })
    .rotate()
    .resize({
      width: profileSettings.width,
      fit: "inside",
      withoutEnlargement: true,
    });

  pipeline =
    settings.format === "avif"
      ? pipeline.avif({ quality: profileSettings.quality, effort: 4 })
      : pipeline.webp({ quality: profileSettings.quality, effort: 4 });

  try {
    await pipeline.toFile(temporaryPath);
    await fs.rename(temporaryPath, outputPath);
  } catch (error) {
    await fs.rm(temporaryPath, { force: true }).catch(() => undefined);
    throw error;
  }
}

export async function optimizeMediaDocument({
  media,
  settings,
  fingerprint,
  force,
}: {
  media: OptimizableMedia;
  settings: NormalizedImageOptimizationSettings;
  fingerprint: string;
  force: boolean;
}): Promise<MediaOptimizationResult> {
  if (!media.filename || !isSupportedImageMimeType(media.mimeType)) {
    return { generated: 0, skipped: 1, error: null };
  }

  const sourcePath = getSafeSourcePath(media.filename);

  if (!sourcePath) {
    return {
      generated: 0,
      skipped: 0,
      error: `Güvenli olmayan medya dosya adı: ${media.filename}`,
    };
  }

  try {
    await fs.access(sourcePath);
  } catch {
    return {
      generated: 0,
      skipped: 0,
      error: `Kaynak dosya bulunamadı: ${media.filename}`,
    };
  }

  let generated = 0;
  let skipped = 0;

  try {
    for (const profile of IMAGE_OPTIMIZATION_PROFILES) {
      const relativePath = getOptimizedImageRelativePath(
        fingerprint,
        media.id,
        profile,
        settings.format,
      );
      const outputPath = path.resolve(MEDIA_ROOT, relativePath);

      if (!outputPath.startsWith(`${OPTIMIZED_MEDIA_ROOT}${path.sep}`)) {
        throw new Error("Optimize edilmiş dosya yolu güvenli değil.");
      }

      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      if (!force) {
        try {
          await fs.access(outputPath);
          skipped += 1;
          continue;
        } catch {
          // File is absent and should be generated.
        }
      }

      await writeProfileVariant({
        sourcePath,
        outputPath,
        profile,
        settings,
      });
      generated += 1;
    }

    return { generated, skipped, error: null };
  } catch (error) {
    return {
      generated,
      skipped,
      error:
        error instanceof Error
          ? error.message
          : "Görsel işlenirken bilinmeyen bir hata oluştu.",
    };
  }
}

export async function readOptimizedImage({
  mediaId,
  fingerprint,
  profile,
  format,
}: {
  mediaId: number | string;
  fingerprint: string;
  profile: ImageOptimizationProfile;
  format: NormalizedImageOptimizationSettings["format"];
}) {
  const relativePath = getOptimizedImageRelativePath(
    fingerprint,
    mediaId,
    profile,
    format,
  );
  const outputPath = path.resolve(MEDIA_ROOT, relativePath);

  if (!outputPath.startsWith(`${OPTIMIZED_MEDIA_ROOT}${path.sep}`)) return null;

  try {
    return await fs.readFile(outputPath);
  } catch {
    return null;
  }
}

export async function removeInactiveOptimizationVersions(
  activeFingerprint: string,
) {
  await fs.mkdir(OPTIMIZED_MEDIA_ROOT, { recursive: true });
  const entries = await fs.readdir(OPTIMIZED_MEDIA_ROOT, {
    withFileTypes: true,
  });

  await Promise.all(
    entries
      .filter(
        (entry) =>
          entry.isDirectory() && entry.name !== activeFingerprint,
      )
      .map((entry) =>
        fs.rm(path.join(OPTIMIZED_MEDIA_ROOT, entry.name), {
          recursive: true,
          force: true,
        }),
      ),
  );
}
