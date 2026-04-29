import React from "react";
import Image from "next/image";

export function LogoSliderBlock({ title, logos }: any) {
  if (!logos || logos.length === 0) return null;

  return (
    <section className="py-16 bg-white overflow-hidden border-y border-surface-muted">
      <div className="container mx-auto px-4 mb-8 text-center">
        {title && (
          <h3 className="text-xl font-bold text-content-subtle uppercase tracking-widest">
            {title}
          </h3>
        )}
      </div>

      {/* Kaydırma (Marquee) Animasyonu için Custom CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-250px * ${logos.length})); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `,
        }}
      />

      <div className="flex w-[calc(250px*${logos.length*2})] animate-scroll items-center">
        {/* Kesintisiz döngü için logoları 2 kez basıyoruz */}
        {[...logos, ...logos].map((item: any, index: number) => {
          const logoUrl =
            typeof item.logo === "object" && item.logo?.url
              ? item.logo.url
              : null;
          if (!logoUrl) return null;

          return (
            <div
              key={index}
              className="w-[250px] flex-shrink-0 flex items-center justify-center px-8 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
            >
              <Image
                src={logoUrl}
                alt="Marka Logosu"
                width={150}
                height={80}
                className="object-contain h-16 w-auto"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
