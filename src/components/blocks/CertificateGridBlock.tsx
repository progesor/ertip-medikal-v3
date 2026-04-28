"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, X, Award, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Sertifika tipini belirliyoruz
interface Certificate {
  id: string;
  image: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  name: string;
  issuer?: string;
  issueDate?: string; // Opsiyonel tarih alanı
  description?: string; // Opsiyonel açıklama alanı
}

export function CertificateGridBlock({
  title,
  certificates,
}: {
  title?: string;
  certificates: Certificate[];
}) {
  // Tam ekran açılan sertifika ve index'ini tutan state'ler
  const [selectedCertIndex, setSelectedCertIndex] = useState<number | null>(
    null,
  );

  if (!certificates || certificates.length === 0) return null;

  const currentCert =
    selectedCertIndex !== null ? certificates[selectedCertIndex] : null;

  // Önceki/Sonraki sertifikaya geçiş fonksiyonları
  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCertIndex((prev) =>
      prev !== null && prev > 0 ? prev - 1 : certificates.length - 1,
    );
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCertIndex((prev) =>
      prev !== null && prev < certificates.length - 1 ? prev + 1 : 0,
    );
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {title && (
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h2>
            <div className="w-20 h-1.5 bg-primary mx-auto rounded-full" />
          </div>
        )}

        {/* Sertifika Grid Yapısı */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {certificates.map((cert, i) => {
            const imgUrl = cert.image?.url;
            return (
              <div
                key={cert.id}
                className="group cursor-pointer flex flex-col items-center"
                onClick={() => setSelectedCertIndex(i)} // Tıklanınca ilgili sertifikayı aç
              >
                {/* Sertifika Görseli Kartı */}
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm group-hover:shadow-2xl transition-all duration-500 ease-out p-5 flex items-center justify-center">
                  <Image
                    src={imgUrl}
                    alt={cert.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {/* Hover'da Çıkan Arama İkonu */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="bg-white/20 p-4 rounded-full shadow-lg text-white transform scale-50 group-hover:scale-100 transition-transform duration-300">
                      <Search className="w-7 h-7" />
                    </div>
                  </div>
                </div>

                {/* Kartın Altındaki Yazı Alanı */}
                <div className="mt-7 text-center w-full px-2">
                  <h4 className="font-extrabold text-slate-950 text-lg mb-1.5 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {cert.name}
                  </h4>
                  {cert.issuer && (
                    <p className="text-sm text-slate-600 font-semibold uppercase tracking-wider line-clamp-1">
                      {cert.issuer}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gelişmiş Tam Ekran Lightbox Modalı */}
      {currentCert && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
          onClick={() => setSelectedCertIndex(null)} // Arka plana tıklayınca kapat
        >
          {/* Kapatma Butonu */}
          <button
            className="absolute top-6 right-6 md:top-10 md:right-10 text-slate-300 hover:text-white hover:rotate-90 transition-all duration-300 z-[102]"
            onClick={() => setSelectedCertIndex(null)}
          >
            <X className="w-10 h-10" />
          </button>

          {/* Navigasyon Okları */}
          <button
            onClick={showPrev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-[102] text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/80 p-3 md:p-4 rounded-full transition-all"
          >
            <ChevronLeft className="w-7 h-7 md:w-9 md:h-9" />
          </button>
          <button
            onClick={showNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-[102] text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/80 p-3 md:p-4 rounded-full transition-all"
          >
            <ChevronRight className="w-7 h-7 md:w-9 md:h-9" />
          </button>

          {/* İçerik Paneli (Görsel + Metin) */}
          <div
            className="relative w-full max-w-7xl max-h-[90vh] bg-slate-900 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-5 animate-in slide-in-from-bottom-8 duration-500 ease-out"
            onClick={(e) => e.stopPropagation()} // Paneli tıklayınca kapanmasın
          >
            {/* Sol Taraf: Büyük Görsel */}
            <div className="lg:col-span-3 p-6 md:p-10 flex items-center justify-center bg-slate-950/40 relative h-[40vh] md:h-[60vh] lg:h-auto">
              <Image
                src={currentCert.image?.url}
                alt={currentCert.name}
                fill
                className="object-contain p-2"
                unoptimized
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            </div>

            {/* Sağ Taraf: Şık Metin Bilgileri */}
            <div className="lg:col-span-2 p-10 md:p-14 text-white space-y-8 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-center">
              <div className="space-y-3">
                {/* Tip İkonu ve Başlık */}
                <div className="flex items-center gap-3 text-primary">
                  <Award className="w-8 h-8" />
                  <span className="text-sm font-bold uppercase tracking-widest text-primary/80">
                    Sertifika Detayları
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  {currentCert.name}
                </h3>
              </div>

              <div className="w-16 h-1 bg-primary/40 rounded-full" />

              <div className="space-y-6 text-slate-300">
                {/* Düzenleyen Kurum Bilgisi */}
                {currentCert.issuer && (
                  <div className="flex items-center gap-4 bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
                    <FileText className="w-8 h-8 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">
                        Düzenleyen Kurum
                      </p>
                      <p className="text-xl font-bold text-white">
                        {currentCert.issuer}
                      </p>
                    </div>
                  </div>
                )}

                {/* Sertifika Açıklaması veya Durum */}
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-slate-400 leading-relaxed">
                      {currentCert.description ||
                        "Bu sertifika, Ertip Medikal'in ilgili standartlara ve kalite yönetmeliklerine uygunluğunu belgelemektedir. Orijinal nüshası şirket merkezimizde muhafaza edilmektedir."}
                    </p>
                  </div>
                </div>
              </div>

              {/* İsteğe bağlı ek buton */}
              <div className="pt-6">
                <Button
                  className="w-full h-14 rounded-full text-md font-bold"
                  variant="outline"
                >
                  Doğruluğunu Kontrol Et (Yakında)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Navigasyon ikonları için basit bileşenler
function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 19.5L8.25 12l7.5-7.5"
      />
    </svg>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 4.5l7.5 7.5-7.5 7.5"
      />
    </svg>
  );
}
