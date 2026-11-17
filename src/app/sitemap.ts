import type { MetadataRoute } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { serverEnv } from "@/lib/config/env";
import { siteLocales } from "@/lib/i18n/config";
import { getHomePath, getNewsPath, getPagePath, getProductsPath } from "@/lib/i18n/routing";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config });
  const entries = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const locale of siteLocales) {
    for (const path of [getHomePath(locale), getProductsPath(locale), getNewsPath(locale)]) {
      const url = new URL(path, serverEnv.publicSiteUrl).href;
      entries.set(url, { url });
    }
    for (const collection of ["pages", "news", "products"] as const) {
      const pathFor = { pages: getPagePath, news: getNewsPath, products: getProductsPath }[collection];
      const { docs } = await payload.find({
        collection, locale, fallbackLocale: false, depth: 0, pagination: false,
        select: { slug: true, updatedAt: true },
        where: { _status: { equals: "published" }, slug: { exists: true } },
      });
      for (const doc of docs) {
        if (!doc.slug) continue;
        const url = new URL(pathFor(locale, doc.slug), serverEnv.publicSiteUrl).href;
        entries.set(url, { url, lastModified: doc.updatedAt });
      }
    }
  }
  return [...entries.values()];
}