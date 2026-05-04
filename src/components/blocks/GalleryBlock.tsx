"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";

export function GalleryBlock({ title, images }: any) {
  // Hangi resmin tam ekran açılacağını tutan state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <section className="py-24 bg-surface-muted">
      <div className="container mx-auto px-4 max-w-7xl">
        {title && (
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 gap-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-main tracking-tight">
              {title}
            </h2>
            <p className="text-text-muted font-medium">
              Görsellere tıklayarak detaylı inceleyebilirsiniz
            </p>
          </div>
        )}

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((item: any, index: number) => {
            const imgUrl =
              typeof item.image === "object" && item.image?.url
                ? item.image.url
                : null;
            if (!imgUrl) return null;

            return (
              <div
                key={index}
                className="relative break-inside-avoid rounded-2xl overflow-hidden group bg-surface shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer"
                onClick={() => setSelectedImage(imgUrl)} // Tıklanınca resmi state'e at
              >
                {/* Resim Overlay (Hover Efekti) */}
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-primary transform scale-50 group-hover:scale-100 transition-transform duration-500 shadow-xl">
                    <Maximize2 className="w-6 h-6" />
                  </div>
                </div>

                <Image
                  src={imgUrl}
                  alt={item.image?.alt || "Galeri Görseli"}
                  width={item.image?.width || 800}
                  height={item.image?.height || 600}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                  unoptimized
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Tam Ekran Lightbox (Pop-up) Modülü */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/95 backdrop-blur-sm p-4 md:p-8"
          onClick={() => setSelectedImage(null)} // Siyah alana tıklayınca kapat
        >
          {/* Kapatma Butonu */}
          <button
            className="absolute top-6 right-6 md:top-10 md:right-10 text-surface-inverse-foreground/60 hover:text-surface-inverse-foreground transition-colors z-[101]"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-10 h-10 md:w-12 md:h-12" />
          </button>

          {/* Tam Boy Görsel */}
          <div
            className="relative w-full max-w-6xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Resme tıklayınca kapanmasını engelle
          >
            <Image
              src={selectedImage}
              alt="Büyük Görsel"
              width={1920}
              height={1080}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
              unoptimized
            />
          </div>
        </div>
      )}
    </section>
  );
}
