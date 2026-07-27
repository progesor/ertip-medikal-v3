"use client";

type ImageLoaderArguments = {
  src: string;
  width: number;
  quality?: number;
};

const MEDIA_FILE_MARKER = "/api/media/file/";

export default function ertipImageLoader({
  src,
  width,
  quality,
}: ImageLoaderArguments) {
  const markerIndex = src.indexOf(MEDIA_FILE_MARKER);

  if (markerIndex < 0) return src;

  const mediaPath = src.slice(markerIndex).split("#", 1)[0];
  const parameters = new URLSearchParams({
    src: mediaPath,
    w: String(width),
  });

  if (quality) parameters.set("q", String(quality));

  return `/api/image-delivery?${parameters.toString()}`;
}
