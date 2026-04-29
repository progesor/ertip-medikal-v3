"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ImageType } from "@/types";

export function ProductGallery({ images }: { images: ImageType[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-2xl flex items-center justify-center border">
        <span className="text-muted-foreground">Görsel Yok</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Ana Görsel (Büyük) */}
      <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border shadow-sm">
        <Image
          src={images[currentIndex].url}
          alt={images[currentIndex].alt || "Ürün Görseli"}
          fill
          className="object-contain p-4"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          unoptimized
        />
      </div>

      {/* Küçük Görseller (Thumbnails) */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "relative aspect-square bg-white rounded-lg overflow-hidden transition-all",
                currentIndex === idx
                  ? "border-2 border-primary ring-2 ring-primary/20"
                  : "border border-border hover:border-primary/50",
              )}
            >
              <Image
                src={img.url}
                alt={img.alt || "Küçük Görsel"}
                fill
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
