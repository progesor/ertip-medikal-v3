"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";

type GalleryLayout = "mosaic" | "grid" | "masonry" | "featured";

type GalleryImage = {
  image?: {
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  } | number | null;
};

type PreparedImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

function prepareImages(images?: GalleryImage[]) {
  if (!images) return [];

  return images.reduce<PreparedImage[]>((acc, item) => {
    if (typeof item.image === "object" && item.image?.url) {
      acc.push({
        url: item.image.url,
        alt: item.image.alt || "Galeri Görseli",
        width: item.image.width || 800,
        height: item.image.height || 600,
      });
    }
    return acc;
  }, []);
}

function GalleryItem({
  image,
  onSelect,
  className = "",
  imageClassName = "",
  priority = false,
}: {
  image: PreparedImage;
  onSelect: (url: string) => void;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}) {
  return (
    <button
      type="button"
      className={`group relative w-full cursor-pointer overflow-hidden rounded-2xl bg-surface text-left shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-surface-inverse/10 ${className}`}
      onClick={() => onSelect(image.url)}
      aria-label={`${image.alt} görselini büyüt`}
    >
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="flex h-12 w-12 scale-50 items-center justify-center rounded-full bg-surface text-primary shadow-xl transition-transform duration-500 group-hover:scale-100">
          <Maximize2 className="h-6 w-6" />
        </div>
      </div>

      <Image
        src={image.url}
        alt={image.alt}
        width={image.width}
        height={image.height}
        className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${imageClassName}`}
        priority={priority}
        unoptimized
      />
    </button>
  );
}

function GalleryGrid({
  images,
  onSelect,
  layout,
}: {
  images: PreparedImage[];
  onSelect: (url: string) => void;
  layout: GalleryLayout;
}) {
  if (layout === "featured") {
    const [firstImage, ...restImages] = images;

    if (restImages.length === 0 && firstImage) {
      return (
        <div className="mx-auto max-w-5xl">
          <GalleryItem
            image={firstImage}
            onSelect={onSelect}
            className="min-h-[420px]"
            imageClassName="h-full min-h-[420px]"
            priority
          />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        {firstImage && (
          <GalleryItem
            image={firstImage}
            onSelect={onSelect}
            className="min-h-[360px]"
            imageClassName="h-full min-h-[360px]"
            priority
          />
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
          {restImages.map((image, index) => (
            <GalleryItem
              key={image.url}
              image={image}
              onSelect={onSelect}
              imageClassName="aspect-[4/3] h-full"
              priority={index < 2}
            />
          ))}
        </div>
      </div>
    );
  }

  if (layout === "grid") {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <GalleryItem
            key={image.url}
            image={image}
            onSelect={onSelect}
            imageClassName="aspect-[4/3] h-full"
            priority={index < 3}
          />
        ))}
      </div>
    );
  }

  if (layout === "mosaic") {
    return (
      <div className="grid auto-rows-[220px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {images.map((image, index) => {
          const spanClass =
            index === 0
              ? "md:col-span-2 md:row-span-2"
              : index % 7 === 0
                ? "lg:col-span-2"
                : "";

          return (
            <GalleryItem
              key={image.url}
              image={image}
              onSelect={onSelect}
              className={spanClass}
              imageClassName="h-full"
              priority={index < 3}
            />
          );
        })}
      </div>
    );
  }

  if (layout === "masonry") {
    return (
      <div className="columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3">
        {images.map((image, index) => (
          <GalleryItem
            key={image.url}
            image={image}
            onSelect={onSelect}
            className="mb-6 break-inside-avoid"
            imageClassName="h-auto"
            priority={index < 3}
          />
        ))}
      </div>
    );
  }

  return null;
}

export function GalleryBlock({
  title,
  images,
  galleryLayout = "mosaic",
}: {
  title?: string;
  images?: GalleryImage[];
  galleryLayout?: GalleryLayout;
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const preparedImages = prepareImages(images);

  if (preparedImages.length === 0) return null;

  return (
    <section className="bg-surface-muted py-24">
      <div className="container mx-auto max-w-7xl px-4">
        {title && (
          <div className="mb-12 flex flex-col items-baseline justify-between gap-4 md:flex-row">
            <h2 className="text-3xl font-extrabold tracking-tight text-text-main md:text-4xl">
              {title}
            </h2>
            <p className="font-medium text-text-muted">
              Görsellere tıklayarak detaylı inceleyebilirsiniz
            </p>
          </div>
        )}

        <GalleryGrid
          images={preparedImages}
          onSelect={setSelectedImage}
          layout={galleryLayout}
        />
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/95 p-4 backdrop-blur-sm md:p-8"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            className="absolute right-6 top-6 z-[101] text-surface-inverse-foreground/60 transition-colors hover:text-surface-inverse-foreground md:right-10 md:top-10"
            onClick={() => setSelectedImage(null)}
            aria-label="Galeriyi kapat"
          >
            <X className="h-10 w-10 md:h-12 md:w-12" />
          </button>

          <div
            className="relative flex max-h-[90vh] w-full max-w-6xl items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Büyük Görsel"
              width={1920}
              height={1080}
              className="h-auto max-h-[85vh] w-full rounded-lg object-contain shadow-2xl"
              unoptimized
            />
          </div>
        </div>
      )}
    </section>
  );
}
