"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ArrowRight, SlidersHorizontal } from "lucide-react";

export function NewsGridClient({ initialNews, categories, showFilters }: any) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Anında Filtreleme Mantığı (Client-Side)
    const filteredNews = activeCategory
        ? initialNews.filter((item: any) => {
            const catId = typeof item.category === "object" ? item.category?.id : item.category;
            return catId === activeCategory;
        })
        : initialNews;

    return (
        <div>
            {/* Kategori Filtreleri */}
            {showFilters && categories?.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3 mb-12 bg-surface-muted p-4 rounded-3xl border border-border">
          <span className="text-sm font-semibold text-text-muted mr-2 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" /> Filtrele:
          </span>
                    <button
                        onClick={() => setActiveCategory(null)}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                            activeCategory === null
                                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                : "bg-white text-text-muted hover:bg-slate-200 border border-border"
                        }`}
                    >
                        Tümü
                    </button>
                    {categories.map((cat: any) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                                activeCategory === cat.id
                                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                    : "bg-white text-text-muted hover:bg-slate-200 border border-border"
                            }`}
                        >
                            {cat.title}
                        </button>
                    ))}
                </div>
            )}

            {/* Haber Kartları Grid'i */}
            {filteredNews.length === 0 ? (
                <div className="text-center py-24 bg-surface-muted rounded-3xl border border-dashed border-border">
                    <p className="text-xl text-text-muted font-medium mb-4">
                        Bu kategoriye ait bir haber bulunamadı.
                    </p>
                    <button
                        onClick={() => setActiveCategory(null)}
                        className="text-primary hover:underline font-bold"
                    >
                        Filtreleri Temizle
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredNews.map((item: any) => {
                        const imageUrl = typeof item.image === "object" && item.image?.url ? item.image.url : "/placeholder.jpg";
                        const formattedDate = new Date(item.publishedDate).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" });
                        const categoryTitle = typeof item.category === "object" ? item.category?.title : null;

                        return (
                            <Card key={item.id} className="group overflow-hidden rounded-2xl border-0 bg-white shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col">
                                <Link href={`/haberler/${item.slug || item.id}`} className="relative block aspect-[16/9] overflow-hidden">
                                    <Image
                                        src={imageUrl}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        unoptimized
                                    />
                                    {categoryTitle && (
                                        <div className="absolute top-4 left-4 z-10">
                                            <Badge className="bg-white/90 text-primary hover:bg-white backdrop-blur-sm shadow-sm font-bold px-3 py-1.5">
                                                {categoryTitle}
                                            </Badge>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </Link>

                                <CardContent className="p-8 flex flex-col flex-grow">
                                    <div className="flex items-center gap-2 text-sm text-text-muted mb-4 font-bold">
                                        <CalendarDays className="w-4 h-4 text-primary" />
                                        <time>{formattedDate}</time>
                                    </div>
                                    <h3 className="text-xl font-black mb-4 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                        <Link href={`/haberler/${item.slug || item.id}`}>{item.title}</Link>
                                    </h3>
                                    {item.excerpt && (
                                        <p className="text-text-muted line-clamp-2 mb-8 text-base leading-relaxed flex-grow">
                                            {item.excerpt}
                                        </p>
                                    )}
                                    <Link href={`/haberler/${item.slug || item.id}`} className="inline-flex items-center text-primary font-black text-sm group/btn mt-auto uppercase tracking-wide">
                                        Haberi Oku
                                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                                    </Link>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}