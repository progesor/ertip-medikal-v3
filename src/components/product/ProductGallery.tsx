"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ProductGalleryImage = {
  url: string;
  alt?: string;
  thumbnailUrl?: string;
};

type ProductGalleryProps = {
  images: ProductGalleryImage[];
  productTitle?: string;
};

export function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const safeImages = useMemo(
    () => images.filter((image) => image?.url),
    [images],
  );
  const normalizedIndex = safeImages.length
    ? currentIndex % safeImages.length
    : 0;
  const currentImage = safeImages[normalizedIndex];
  const hasMultipleImages = safeImages.length > 1;

  const goToPrevious = useCallback(() => {
    if (!safeImages.length) return;

    setCurrentIndex((previousIndex) => {
      const safeIndex = previousIndex % safeImages.length;
      return safeIndex === 0 ? safeImages.length - 1 : safeIndex - 1;
    });
  }, [safeImages.length]);

  const goToNext = useCallback(() => {
    if (!safeImages.length) return;

    setCurrentIndex((previousIndex) => {
      const safeIndex = previousIndex % safeImages.length;
      return safeIndex === safeImages.length - 1 ? 0 : safeIndex + 1;
    });
  }, [safeImages.length]);

  useEffect(() => {
    if (!isFullscreenOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreenOpen(false);
      }

      if (event.key === "ArrowLeft") {
        goToPrevious();
      }

      if (event.key === "ArrowRight") {
        goToNext();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [goToNext, goToPrevious, isFullscreenOpen]);

  if (!safeImages.length || !currentImage) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-[var(--radius-2xl)] border border-border bg-surface-muted text-text-muted">
        Görsel Yok
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="group relative aspect-square overflow-hidden rounded-[var(--radius-2xl)] border border-border/80 bg-surface-muted/80 p-8 shadow-sm shadow-surface-inverse/5">
          <button
            type="button"
            onClick={() => setIsFullscreenOpen(true)}
            className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-surface/90 text-text-muted shadow-sm backdrop-blur transition hover:border-primary hover:text-primary"
            aria-label="Görseli büyüt"
          >
            <Expand className="h-4 w-4" />
          </button>

          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-surface/90 text-text-muted opacity-0 shadow-sm backdrop-blur transition hover:border-primary hover:text-primary group-hover:opacity-100 focus:opacity-100"
                aria-label="Önceki görsel"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={goToNext}
                className="absolute right-4 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-surface/90 text-text-muted opacity-0 shadow-sm backdrop-blur transition hover:border-primary hover:text-primary group-hover:opacity-100 focus:opacity-100"
                aria-label="Sonraki görsel"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <Image
            src={currentImage.url}
            alt={currentImage.alt || productTitle || "Ürün görseli"}
            fill
            className="object-contain p-4 transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 50vw"
            quality={85}
            preload={normalizedIndex === 0}
          />

          {hasMultipleImages && (
            <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-border/70 bg-surface/90 px-3 py-1 text-xs font-bold text-text-muted shadow-sm backdrop-blur">
              {normalizedIndex + 1} / {safeImages.length}
            </div>
          )}
        </div>

        {hasMultipleImages && (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
            {safeImages.map((image, index) => (
              <button
                key={`${image.url}-${index}`}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-[var(--radius-xl)] bg-surface-muted transition-all",
                  normalizedIndex === index
                    ? "border-2 border-primary ring-2 ring-primary/20"
                    : "border border-border hover:border-primary/60",
                )}
                aria-label={`${index + 1}. ürün görselini göster`}
              >
                <Image
                  src={image.thumbnailUrl || image.url}
                  alt={image.alt || productTitle || "Ürün küçük görseli"}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 640px) 25vw, 160px"
                  quality={70}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {isFullscreenOpen && (
        <div className="fixed inset-0 z-[120] flex flex-col bg-surface-inverse/95 p-4 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 pb-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-surface-inverse-foreground">
                {productTitle || "Ürün Görseli"}
              </p>
              {hasMultipleImages && (
                <p className="text-xs text-surface-inverse-foreground/60">
                  {normalizedIndex + 1} / {safeImages.length}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreenOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-surface-inverse-foreground/15 bg-surface-inverse-foreground/10 text-surface-inverse-foreground transition hover:bg-surface-inverse-foreground hover:text-surface-inverse"
              aria-label="Görseli kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative mx-auto flex min-h-0 w-full max-w-7xl flex-1 items-center justify-center overflow-hidden rounded-[var(--radius-2xl)] border border-surface-inverse-foreground/10 bg-surface-inverse/60">
            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-surface-inverse-foreground/15 bg-surface-inverse-foreground/10 text-surface-inverse-foreground backdrop-blur transition hover:bg-surface-inverse-foreground hover:text-surface-inverse"
                  aria-label="Önceki görsel"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                  type="button"
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-surface-inverse-foreground/15 bg-surface-inverse-foreground/10 text-surface-inverse-foreground backdrop-blur transition hover:bg-surface-inverse-foreground hover:text-surface-inverse"
                  aria-label="Sonraki görsel"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <Image
              src={currentImage.url}
              alt={currentImage.alt || productTitle || "Ürün görseli"}
              fill
              className="object-contain p-4 md:p-8"
              sizes="100vw"
              quality={85}
            />
          </div>

          {hasMultipleImages && (
            <div className="mx-auto mt-4 flex w-full max-w-7xl gap-2 overflow-x-auto pb-1">
              {safeImages.map((image, index) => (
                <button
                  key={`fullscreen-${image.url}-${index}`}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius)] bg-surface-inverse-foreground/10 transition",
                    normalizedIndex === index
                      ? "border-2 border-primary"
                      : "border border-surface-inverse-foreground/15 opacity-70 hover:opacity-100",
                  )}
                  aria-label={`${index + 1}. görsele geç`}
                >
                  <Image
                    src={image.thumbnailUrl || image.url}
                    alt={image.alt || productTitle || "Ürün küçük görseli"}
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                    quality={70}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
