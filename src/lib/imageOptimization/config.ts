import { createHash } from "node:crypto";
import path from "node:path";

export const IMAGE_OPTIMIZATION_PROFILES = [
  "thumbnail",
  "card",
  "content",
  "fullscreen",
] as const;

export type ImageOptimizationProfile =
  (typeof IMAGE_OPTIMIZATION_PROFILES)[number];

export type ImageOptimizationFormat = "webp" | "avif";
export type ImageOptimizationStatus =
  | "idle"
  | "stale"
  | "running"
  | "ready"
  | "partial";

export type ImageOptimizationProfileSettings = {
  width: number;
  quality: number;
};

export type NormalizedImageOptimizationSettings = {
  enabled: boolean;
  format: ImageOptimizationFormat;
  profiles: Record<
    ImageOptimizationProfile,
    ImageOptimizationProfileSettings
  >;
  settingsFingerprint: string;
  activeFingerprint: string | null;
  status: ImageOptimizationStatus;
};

export const DEFAULT_IMAGE_OPTIMIZATION_PROFILES: Record<
  ImageOptimizationProfile,
  ImageOptimizationProfileSettings
> = {
  thumbnail: { width: 384, quality: 72 },
  card: { width: 768, quality: 75 },
  content: { width: 1_440, quality: 80 },
  fullscreen: { width: 2_400, quality: 85 },
};

export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/tiff",
] as const;

function clampInteger(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) return fallback;

  return Math.min(maximum, Math.max(minimum, Math.round(parsed)));
}

function normalizeFormat(value: unknown): ImageOptimizationFormat {
  return value === "avif" ? "avif" : "webp";
}

function readProfile(
  value: unknown,
  fallback: ImageOptimizationProfileSettings,
): ImageOptimizationProfileSettings {
  const candidate =
    value && typeof value === "object"
      ? (value as { width?: unknown; quality?: unknown })
      : {};

  return {
    width: clampInteger(candidate.width, fallback.width, 64, 3_840),
    quality: clampInteger(candidate.quality, fallback.quality, 40, 95),
  };
}

export function createImageOptimizationFingerprint(input: {
  format: ImageOptimizationFormat;
  profiles: Record<
    ImageOptimizationProfile,
    ImageOptimizationProfileSettings
  >;
}) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        format: input.format,
        profiles: IMAGE_OPTIMIZATION_PROFILES.map((profile) => ({
          name: profile,
          quality: input.profiles[profile].quality,
          width: input.profiles[profile].width,
        })),
      }),
    )
    .digest("hex")
    .slice(0, 16);
}

export function normalizeImageOptimizationSettings(
  value: unknown,
): NormalizedImageOptimizationSettings {
  const candidate =
    value && typeof value === "object"
      ? (value as {
          enabled?: unknown;
          format?: unknown;
          profiles?: Record<string, unknown> | null;
          settingsFingerprint?: unknown;
          activeFingerprint?: unknown;
          optimizationStatus?: unknown;
        })
      : {};
  const profiles = {
    thumbnail: readProfile(
      candidate.profiles?.thumbnail,
      DEFAULT_IMAGE_OPTIMIZATION_PROFILES.thumbnail,
    ),
    card: readProfile(
      candidate.profiles?.card,
      DEFAULT_IMAGE_OPTIMIZATION_PROFILES.card,
    ),
    content: readProfile(
      candidate.profiles?.content,
      DEFAULT_IMAGE_OPTIMIZATION_PROFILES.content,
    ),
    fullscreen: readProfile(
      candidate.profiles?.fullscreen,
      DEFAULT_IMAGE_OPTIMIZATION_PROFILES.fullscreen,
    ),
  } satisfies Record<
    ImageOptimizationProfile,
    ImageOptimizationProfileSettings
  >;
  const format = normalizeFormat(candidate.format);
  const calculatedFingerprint = createImageOptimizationFingerprint({
    format,
    profiles,
  });
  const allowedStatuses = new Set<ImageOptimizationStatus>([
    "idle",
    "stale",
    "running",
    "ready",
    "partial",
  ]);
  const requestedStatus = String(candidate.optimizationStatus || "idle");

  return {
    enabled: candidate.enabled !== false,
    format,
    profiles,
    settingsFingerprint:
      typeof candidate.settingsFingerprint === "string" &&
      candidate.settingsFingerprint
        ? candidate.settingsFingerprint
        : calculatedFingerprint,
    activeFingerprint:
      typeof candidate.activeFingerprint === "string" &&
      candidate.activeFingerprint
        ? candidate.activeFingerprint
        : null,
    status: allowedStatuses.has(requestedStatus as ImageOptimizationStatus)
      ? (requestedStatus as ImageOptimizationStatus)
      : "idle",
  };
}

export function getCurrentImageOptimizationFingerprint(value: unknown) {
  const settings = normalizeImageOptimizationSettings(value);

  return createImageOptimizationFingerprint(settings);
}

export function isSupportedImageMimeType(value: unknown): value is string {
  return SUPPORTED_IMAGE_MIME_TYPES.includes(
    String(value || "") as (typeof SUPPORTED_IMAGE_MIME_TYPES)[number],
  );
}

export function selectImageOptimizationProfile(
  requestedWidth: number,
  settings: NormalizedImageOptimizationSettings,
): ImageOptimizationProfile {
  const safeWidth = clampInteger(requestedWidth, 1_280, 1, 7_680);

  for (const profile of IMAGE_OPTIMIZATION_PROFILES) {
    if (safeWidth <= settings.profiles[profile].width) return profile;
  }

  return "fullscreen";
}

export function getOptimizedImageRelativePath(
  fingerprint: string,
  mediaId: number | string,
  profile: ImageOptimizationProfile,
  format: ImageOptimizationFormat,
) {
  const safeFingerprint = fingerprint.replace(/[^a-f0-9]/gi, "");
  const safeMediaId = String(mediaId).replace(/[^a-z0-9_-]/gi, "_");

  return path.join(
    "optimized",
    safeFingerprint,
    safeMediaId,
    `${profile}.${format}`,
  );
}

export function getOptimizedImageContentType(
  format: ImageOptimizationFormat,
) {
  return format === "avif" ? "image/avif" : "image/webp";
}
