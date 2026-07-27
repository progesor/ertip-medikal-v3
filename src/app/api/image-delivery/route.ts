import { NextRequest } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { getAnonymousMediaReadAccess } from "@/lib/security/protectedMedia";
import {
  getOptimizedImageContentType,
  isSupportedImageMimeType,
  selectImageOptimizationProfile,
} from "@/lib/imageOptimization/config";
import {
  loadImageOptimizationSettings,
  readOptimizedImage,
} from "@/lib/imageOptimization/server";

const MEDIA_FILE_MARKER = "/api/media/file/";
const SETTINGS_CACHE_TTL = 15_000;
const MEDIA_CACHE_TTL = 60_000;

type CachedSettings = Awaited<
  ReturnType<typeof loadImageOptimizationSettings>
>;

type CachedMedia = {
  expiresAt: number;
  document: {
    id: number | string;
    filename?: string | null;
    mimeType?: string | null;
    url?: string | null;
  } | null;
};

let settingsCache:
  | {
      expiresAt: number;
      value: CachedSettings;
    }
  | undefined;
const mediaCache = new Map<string, CachedMedia>();

async function getCachedSettings() {
  const now = Date.now();

  if (settingsCache && settingsCache.expiresAt > now) {
    return settingsCache.value;
  }

  const payload = await getPayload({ config: configPromise });
  const value = await loadImageOptimizationSettings(payload);
  settingsCache = { expiresAt: now + SETTINGS_CACHE_TTL, value };

  return value;
}

async function getMediaByFilename(filename: string) {
  const now = Date.now();
  const cached = mediaCache.get(filename);

  if (cached && cached.expiresAt > now) return cached.document;

  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: "media",
    overrideAccess: true,
    depth: 0,
    limit: 1,
    where: {
      filename: {
        equals: filename,
      },
    },
  });
  const document = result.docs[0] || null;

  mediaCache.set(filename, {
    expiresAt: now + MEDIA_CACHE_TTL,
    document,
  });

  return document;
}

function getRequestedMediaPath(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("src");

  if (!source) return null;

  let pathname: string;

  try {
    pathname = new URL(source, request.url).pathname;
  } catch {
    return null;
  }

  if (!pathname.startsWith(MEDIA_FILE_MARKER)) return null;

  const encodedFilename = pathname.slice(MEDIA_FILE_MARKER.length);

  if (!encodedFilename || encodedFilename.includes("/")) return null;

  try {
    const filename = decodeURIComponent(encodedFilename);

    if (!filename || filename.includes("/") || filename.includes("\\")) {
      return null;
    }

    return { filename, pathname };
  } catch {
    return null;
  }
}

function redirectToOriginal(request: NextRequest, sourceUrl: string) {
  const response = Response.redirect(new URL(sourceUrl, request.url), 307);
  response.headers.set("Cache-Control", "private, no-store");

  return response;
}

export async function GET(request: NextRequest) {
  const requestedMedia = getRequestedMediaPath(request);

  if (!requestedMedia) {
    return Response.json({ message: "Geçersiz medya kaynağı." }, { status: 400 });
  }

  const media = await getMediaByFilename(requestedMedia.filename);

  if (!media) {
    return Response.json({ message: "Medya bulunamadı." }, { status: 404 });
  }

  const payload = await getPayload({ config: configPromise });
  const canRead = await getAnonymousMediaReadAccess(payload, media.id);

  if (canRead !== true) {
    return Response.json({ message: "Medya erişime kapalı." }, { status: 404 });
  }

  const originalUrl = media.url || requestedMedia.pathname;

  if (!isSupportedImageMimeType(media.mimeType)) {
    return redirectToOriginal(request, originalUrl);
  }

  const { settings, currentFingerprint } = await getCachedSettings();
  const mayUseActiveOptimization =
    settings.enabled &&
    Boolean(settings.activeFingerprint) &&
    settings.activeFingerprint === currentFingerprint &&
    (settings.status === "ready" ||
      settings.status === "partial" ||
      settings.status === "stale");

  if (!mayUseActiveOptimization || !settings.activeFingerprint) {
    return redirectToOriginal(request, originalUrl);
  }

  const requestedWidth = Number(
    request.nextUrl.searchParams.get("w") ||
      settings.profiles.content.width,
  );
  const profile = selectImageOptimizationProfile(requestedWidth, settings);
  const optimized = await readOptimizedImage({
    mediaId: media.id,
    fingerprint: settings.activeFingerprint,
    profile,
    format: settings.format,
  });

  if (!optimized) {
    return redirectToOriginal(request, originalUrl);
  }

  return new Response(new Uint8Array(optimized), {
    status: 200,
    headers: {
      "Content-Type": getOptimizedImageContentType(settings.format),
      "Content-Length": String(optimized.byteLength),
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      ETag: `\"${settings.activeFingerprint}-${media.id}-${profile}\"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
