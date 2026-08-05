import "server-only";

import type { SiteLocale } from "@/lib/i18n/config";
import {
  getHomePath,
  getNewsPath,
  getPagePath,
  getProductsPath,
  getQuoteCartPath,
  getUnsubscribePath,
  parseLocalizedPublicPath,
} from "@/lib/i18n/routing";

type AlternateLocaleResult = {
  href: string;
  available: boolean;
};

function otherLocale(locale: SiteLocale): SiteLocale {
  return locale === "en" ? "tr" : "en";
}

async function resolveLocalizedRecordSlug({
  payload,
  collection,
  currentLocale,
  targetLocale,
  currentSlug,
  allowIdLookup = false,
}: {
  payload: any;
  collection: "pages" | "products" | "news";
  currentLocale: SiteLocale;
  targetLocale: SiteLocale;
  currentSlug: string;
  allowIdLookup?: boolean;
}) {
  const where = allowIdLookup
    ? {
        or: [
          { slug: { equals: currentSlug } },
          { id: { equals: currentSlug } },
        ],
      }
    : { slug: { equals: currentSlug } };

  const { docs } = await payload.find({
    collection,
    locale: currentLocale,
    fallbackLocale: false,
    where,
    limit: 1,
    depth: 0,
  });
  const currentRecord = docs[0];

  if (!currentRecord) return null;

  const targetRecord = await payload.findByID({
    collection,
    id: currentRecord.id,
    locale: targetLocale,
    fallbackLocale: false,
    depth: 0,
  });
  const targetSlug =
    typeof targetRecord?.slug === "string" ? targetRecord.slug.trim() : "";

  return targetSlug || null;
}

export async function resolveAlternateLocaleHref({
  payload,
  currentLocale,
  publicPathname,
}: {
  payload: any;
  currentLocale: SiteLocale;
  publicPathname: string;
}): Promise<AlternateLocaleResult> {
  const targetLocale = otherLocale(currentLocale);
  const route = parseLocalizedPublicPath(publicPathname);

  if (!route) {
    return { href: getHomePath(targetLocale), available: true };
  }

  if (route.kind === "products") {
    return { href: getProductsPath(targetLocale), available: true };
  }

  if (route.kind === "news") {
    return { href: getNewsPath(targetLocale), available: true };
  }

  if (route.kind === "quote-cart") {
    return { href: getQuoteCartPath(targetLocale), available: true };
  }

  if (route.kind === "unsubscribe") {
    return { href: getUnsubscribePath(targetLocale), available: true };
  }

  if (route.kind === "home") {
    const targetSlug = await resolveLocalizedRecordSlug({
      payload,
      collection: "pages",
      currentLocale,
      targetLocale,
      currentSlug: "home",
    });

    return {
      href: getHomePath(targetLocale),
      available: Boolean(targetSlug),
    };
  }

  if (route.kind === "product" && route.slug) {
    const targetSlug = await resolveLocalizedRecordSlug({
      payload,
      collection: "products",
      currentLocale,
      targetLocale,
      currentSlug: route.slug,
    });

    return targetSlug
      ? { href: getProductsPath(targetLocale, targetSlug), available: true }
      : { href: getProductsPath(targetLocale), available: false };
  }

  if (route.kind === "news-item" && route.slug) {
    const targetSlug = await resolveLocalizedRecordSlug({
      payload,
      collection: "news",
      currentLocale,
      targetLocale,
      currentSlug: route.slug,
      allowIdLookup: true,
    });

    return targetSlug
      ? { href: getNewsPath(targetLocale, targetSlug), available: true }
      : { href: getNewsPath(targetLocale), available: false };
  }

  if (route.kind === "page" && route.slug) {
    const targetSlug = await resolveLocalizedRecordSlug({
      payload,
      collection: "pages",
      currentLocale,
      targetLocale,
      currentSlug: route.slug,
    });

    return targetSlug
      ? { href: getPagePath(targetLocale, targetSlug), available: true }
      : { href: getHomePath(targetLocale), available: false };
  }

  return { href: getHomePath(targetLocale), available: true };
}
