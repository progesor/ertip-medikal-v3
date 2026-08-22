import { MetadataRoute } from "next";
import { getPayload } from "payload";
import configPromise from "@payload-config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.ertipmedikal.com.tr";
  const payload = await getPayload({ config: configPromise });

  // 1. Tüm Ürünleri Çek
  const { docs: products } = await payload.find({
    collection: "products",
    where: { _status: { equals: "published" } },
    limit: 1000,
  });

  // 2. Tüm Haberleri Çek
  const { docs: news } = await payload.find({
    collection: "news",
    where: { _status: { equals: "published" } },
    limit: 1000,
  });

  // 3. Tüm Kurumsal Sayfaları Çek
  const { docs: pages } = await payload.find({
    collection: "pages",
    where: { _status: { equals: "published" } },
    limit: 1000,
  });

  // Ürün Linkleri
  const productUrls = products.map((product) => ({
    url: `${baseUrl}/urunler/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Haber Linkleri
  const newsUrls = news.map((item) => ({
    url: `${baseUrl}/haberler/${item.slug}`,
    lastModified: new Date(item.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Sayfa Linkleri
  const pageUrls = pages.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: new Date(page.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Sabit Sayfalar
  const staticUrls = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/urunler`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/haberler`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/iletisim`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ];

  // Hepsini birleştir ve Google'a sun
  return [...staticUrls, ...pageUrls, ...productUrls, ...newsUrls];
}
