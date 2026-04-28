"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function HeroSliderBlock({ slides }: any) {
  const [current, setCurrent] = useState(0);

  // Otomatik Kaydırma
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden bg-slate-900">
      {slides.map((slide: any, index: number) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          {/* Arkaplan Resmi */}
          {slide.image?.url ? (
            <Image
              src={slide.image.url}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
              unoptimized
            />
          ) : (
            // Resim yoksa şık bir kurumsal gradyan
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary/20 to-slate-900" />
          )}

          {/* Karartma Overlay */}
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: parseFloat(slide.overlayOpacity || "0.4") }}
          />

          {/* İçerik */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="container mx-auto px-4 text-center text-white space-y-6">
              <h1 className="text-4xl md:text-7xl font-black tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="text-lg md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
                  {slide.subtitle}
                </p>
              )}
              {slide.buttonText && slide.buttonLink && (
                <div className="pt-8 animate-in fade-in slide-in-from-bottom-16 duration-1000">
                  <Button
                    size="lg"
                    className="rounded-full px-10 h-14 text-lg font-bold"
                    asChild
                  >
                    <Link href={slide.buttonLink}>{slide.buttonText}</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Navigasyon Okları */}
      <button
        onClick={() =>
          setCurrent(current === 0 ? slides.length - 1 : current - 1)
        }
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={() =>
          setCurrent(current === slides.length - 1 ? 0 : current + 1)
        }
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Slider Noktaları */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_: any, i: number) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition-all ${i === current ? "bg-primary w-8" : "bg-white/30"}`}
          />
        ))}
      </div>
    </section>
  );
}
