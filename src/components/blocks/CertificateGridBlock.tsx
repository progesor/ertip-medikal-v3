"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, X, Award, FileText, CheckCircle2, Download, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Certificate } from "@/types";

export function CertificateGridBlock({ title, certificates }: { title?: string; certificates: Certificate[] }) {
    const [selectedCertIndex, setSelectedCertIndex] = useState<number | null>(null);

    if (!certificates || certificates.length === 0) return null;
    const currentCert = selectedCertIndex !== null ? certificates[selectedCertIndex] : null;

    const showPrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedCertIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : certificates.length - 1));
    };

    const showNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedCertIndex((prev) => (prev !== null && prev < certificates.length - 1 ? prev + 1 : 0));
    };

    return (
        <section className="py-24 bg-slate-50/40">
            {/* GENİŞLETİLMİŞ KONTEYNER (5 Kolon için daha geniş alan) */}
            <div className="container mx-auto px-4 max-w-[1400px]">

                {/* Başlık Alanı */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary font-bold text-sm mb-6 shadow-sm">
                        <CheckCircle2 className="w-5 h-5" /> Kurumsal Güven
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                        {title || "Sertifikalarımız"}
                    </h2>
                </div>

                {/* 4 / 5 KOLONLU DİKEY (A4) GRID YAPISI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                    {certificates.map((cert, i) => (
                        <div
                            key={cert.id || i}
                            onClick={() => setSelectedCertIndex(i)}
                            className="group bg-white rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 cursor-pointer flex flex-col overflow-hidden"
                        >
                            {/* A4 Oranında (Dikey) Medya Alanı */}
                            <div className="relative w-full aspect-[1/1.414] bg-slate-100/50 p-6 flex items-center justify-center overflow-hidden border-b border-slate-100">

                                {/* Hover Büyüteç Efekti */}
                                <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 z-10 flex items-center justify-center">
                                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl transform scale-50 group-hover:scale-100 transition-transform duration-300">
                                        <Search className="w-6 h-6 text-primary" />
                                    </div>
                                </div>

                                {/* Sertifika Görseli (Drop Shadow ile kağıt hissi verildi) */}
                                <Image
                                    src={cert.image?.url || "/placeholder.jpg"}
                                    alt={cert.name}
                                    fill
                                    className="object-contain p-4 drop-shadow-[0_10px_15px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-700 bg-transparent"
                                    unoptimized
                                />
                            </div>

                            {/* Alt Metin Alanı */}
                            <div className="p-6 text-center flex flex-col flex-grow justify-center bg-white relative z-20">
                                <h3 className="text-base font-bold text-slate-900 mb-3 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                    {cert.name}
                                </h3>
                                {cert.issuer && (
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5 mt-auto">
                                        <Award className="w-4 h-4 text-primary/40" /> {cert.issuer}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* DEV BOYUTLU LIGHTBOX (TAM EKRAN OKUMA MODU) */}
            {selectedCertIndex !== null && currentCert && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 md:p-8"
                    onClick={() => setSelectedCertIndex(null)}
                >
                    <div
                        className="bg-white w-full max-w-[90rem] h-full max-h-[90vh] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Üst Navigasyon & Kapatma */}
                        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50 flex gap-2 md:gap-3">
                            <button onClick={showPrev} className="p-3 md:p-4 bg-white/90 hover:bg-primary hover:text-white rounded-2xl shadow-xl transition-all text-slate-900"><ChevronLeft className="w-5 h-5 md:w-6 md:h-6"/></button>
                            <button onClick={showNext} className="p-3 md:p-4 bg-white/90 hover:bg-primary hover:text-white rounded-2xl shadow-xl transition-all text-slate-900"><ChevronRight className="w-5 h-5 md:w-6 md:h-6"/></button>
                            <button onClick={() => setSelectedCertIndex(null)} className="p-3 md:p-4 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-2xl shadow-xl transition-all"><X className="w-5 h-5 md:w-6 md:h-6"/></button>
                        </div>

                        {/* SOL KOLON: DEV EKRAN GÖRÜNTÜLEYİCİ */}
                        <div className="relative w-full lg:w-2/3 h-[50vh] lg:h-auto bg-slate-100 border-r border-slate-200 flex items-center justify-center overflow-hidden">
                            {currentCert.document?.url ? (
                                <iframe
                                    src={`${currentCert.document.url}#toolbar=0&view=Fit`}
                                    className="w-full h-full border-none bg-white"
                                    title={currentCert.name}
                                />
                            ) : (
                                <div className="relative w-full h-full p-8 md:p-16 flex items-center justify-center">
                                    <Image
                                        src={currentCert.image?.url || "/placeholder.jpg"}
                                        alt={currentCert.name}
                                        fill
                                        className="object-contain p-8 drop-shadow-2xl"
                                        unoptimized
                                    />
                                </div>
                            )}
                        </div>

                        {/* SAĞ KOLON: BİLGİ VE İNDİRME PANELİ */}
                        <div className="w-full lg:w-1/3 p-8 md:p-14 flex flex-col bg-white overflow-y-auto">
                            <div className="mb-auto">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-slate-500 font-bold text-xs mb-8 uppercase tracking-widest">
                                    <FileText className="w-4 h-4 text-primary" /> Resmi Belge
                                </div>

                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">
                                    {currentCert.name}
                                </h2>

                                {currentCert.issuer && (
                                    <div className="flex items-center gap-4 text-lg md:text-xl font-bold text-primary mb-10 pb-10 border-b border-slate-100">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                            <Award className="w-6 h-6" />
                                        </div>
                                        {currentCert.issuer}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-900 text-base uppercase tracking-tight">Kapsam Detayları</h4>
                                    <p className="text-slate-500 leading-relaxed text-base">
                                        {currentCert.description || "Bu sertifika, Ertıp Medikal'in global standartlara, kalite kontrol süreçlerine ve medikal üretim yönetmeliklerine olan tam uygunluğunu tescillemektedir."}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-10 mt-10 border-t border-slate-100">
                                {currentCert.document?.url ? (
                                    <div className="space-y-4">
                                        <Button className="w-full h-16 rounded-2xl text-lg font-bold bg-slate-900 text-white hover:bg-primary transition-all shadow-xl hover:shadow-primary/20" asChild>
                                            <a href={currentCert.document.url} target="_blank" rel="noopener noreferrer">
                                                <Download className="w-6 h-6 mr-3" /> PDF Olarak Görüntüle
                                            </a>
                                        </Button>
                                        <p className="text-xs text-slate-400 text-center flex justify-center items-center gap-1.5 leading-tight">
                                            <Info className="w-4 h-4" /> Cihazınıza kaydetmek için butona sağ tıklayıp "Farklı Kaydet" seçeneğini kullanabilirsiniz.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
                                        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                                            Bu belgenin ıslak imzalı orijinal nüshası merkez ofisimizde muhafaza edilmektedir.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}