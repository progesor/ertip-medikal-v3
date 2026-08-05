import React from "react";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { NewsGridClient } from "@/components/blocks/NewsGridClient";
import { getRequestLocale } from "@/lib/i18n/requestLocale";

export async function NewsFeedBlock({
  title,
  description,
  limit = 20,
  showFilters = true,
}: any) {
  const [payload, locale] = await Promise.all([
    getPayload({ config: configPromise }),
    getRequestLocale(),
  ]);

  const [{ docs: categories }, { docs: news }] = await Promise.all([
    payload.find({
      collection: "news-categories",
      locale,
      fallbackLocale: false,
      where: { slug: { exists: true } },
      limit: 50,
    }),
    payload.find({
      collection: "news",
      locale,
      fallbackLocale: false,
      where: {
        _status: { equals: "published" },
        slug: { exists: true },
      },
      sort: "-publishedDate",
      limit,
      depth: 2,
    }),
  ]);

  return (
    <section className="py-16 md:py-24 bg-background relative">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="max-w-3xl mx-auto text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-main">
            {title}
          </h2>
          {description && (
            <p className="text-lg text-text-muted">{description}</p>
          )}
        </div>

        <NewsGridClient
          initialNews={news}
          categories={categories}
          showFilters={showFilters}
          locale={locale}
        />
      </div>
    </section>
  );
}
