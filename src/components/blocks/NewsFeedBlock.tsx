import React from "react";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { NewsGridClient } from "@/components/blocks/NewsGridClient";

// 1. SERVER COMPONENT: Verileri veritabanından SEO dostu şekilde çeker
export async function NewsFeedBlock({ title, description, limit = 20, showFilters = true }: any) {
    const payload = await getPayload({ config: configPromise });

    // Kategorileri Çek
    const { docs: categories } = await payload.find({
        collection: "news-categories",
        limit: 50,
    });

    // Haberleri Çek
    const { docs: news } = await payload.find({
        collection: "news",
        where: { _status: { equals: "published" } },
        sort: "-publishedDate",
        limit: limit,
        depth: 2,
    });

    return (
        <section className="py-16 md:py-24 bg-white relative">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Başlık Alanı */}
                <div className="max-w-3xl mx-auto text-center mb-12 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-main">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-lg text-text-muted">
                            {description}
                        </p>
                    )}
                </div>

                {/* 2. CLIENT COMPONENT: Etkileşimli Grid ve Filtreleme */}
                <NewsGridClient
                    initialNews={news}
                    categories={categories}
                    showFilters={showFilters}
                />
            </div>
        </section>
    );
}