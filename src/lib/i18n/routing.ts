import {
  isSiteLocale,
  publicDefaultLocale,
  type SiteLocale,
} from "@/lib/i18n/config";

type LocalizedRouteKind =
  | "home"
  | "products"
  | "product"
  | "news"
  | "news-item"
  | "quote-cart"
  | "unsubscribe"
  | "page";

export type LocalizedRoute = {
  locale: SiteLocale;
  kind: LocalizedRouteKind;
  internalPath: string;
  publicPath: string;
  slug?: string;
};

const routeSegments = {
  products: { en: "products", tr: "urunler" },
  news: { en: "news", tr: "haberler" },
  quoteCart: { en: "quote-cart", tr: "teklif-sepeti" },
  unsubscribe: { en: "unsubscribe", tr: "abonelikten-ayril" },
} as const satisfies Record<string, Record<SiteLocale, string>>;

function splitPathAndSuffix(href: string) {
  const queryIndex = href.indexOf("?");
  const hashIndex = href.indexOf("#");
  const suffixIndex = [queryIndex, hashIndex]
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  if (suffixIndex === undefined) {
    return { pathname: href, suffix: "" };
  }

  return {
    pathname: href.slice(0, suffixIndex),
    suffix: href.slice(suffixIndex),
  };
}

function normalizePathname(pathname: string) {
  if (!pathname || pathname === "/") return "/";

  const withLeadingSlash = pathname.startsWith("/")
    ? pathname
    : `/${pathname}`;

  return withLeadingSlash.replace(/\/{2,}/g, "/").replace(/\/$/, "") || "/";
}

export function getHomePath(locale: SiteLocale) {
  return `/${locale}`;
}

export function getProductsPath(locale: SiteLocale, slug?: string) {
  const base = `/${locale}/${routeSegments.products[locale]}`;
  return slug ? `${base}/${encodeURIComponent(slug)}` : base;
}

export function getNewsPath(locale: SiteLocale, slug?: string) {
  const base = `/${locale}/${routeSegments.news[locale]}`;
  return slug ? `${base}/${encodeURIComponent(slug)}` : base;
}

export function getQuoteCartPath(locale: SiteLocale) {
  return `/${locale}/${routeSegments.quoteCart[locale]}`;
}

export function getUnsubscribePath(locale: SiteLocale) {
  return `/${locale}/${routeSegments.unsubscribe[locale]}`;
}

export function getPagePath(locale: SiteLocale, slug: string) {
  return `/${locale}/${encodeURIComponent(slug)}`;
}

export function parseLocalizedPublicPath(
  pathname: string,
): LocalizedRoute | null {
  const normalized = normalizePathname(pathname);
  const parts = normalized.split("/").filter(Boolean);
  const rawLocale = parts[0];

  if (!rawLocale || !isSiteLocale(rawLocale)) return null;

  const locale = rawLocale;
  const rest = parts.slice(1);

  if (rest.length === 0) {
    return {
      locale,
      kind: "home",
      internalPath: "/",
      publicPath: getHomePath(locale),
    };
  }

  const [first, second] = rest;
  const productSegments = Object.values(routeSegments.products);
  const newsSegments = Object.values(routeSegments.news);
  const quoteCartSegments = Object.values(routeSegments.quoteCart);
  const unsubscribeSegments = Object.values(routeSegments.unsubscribe);

  if (productSegments.includes(first as (typeof productSegments)[number])) {
    if (second) {
      const slug = decodeURIComponent(rest.slice(1).join("/"));
      return {
        locale,
        kind: "product",
        slug,
        internalPath: `/urunler/${rest.slice(1).join("/")}`,
        publicPath: getProductsPath(locale, slug),
      };
    }

    return {
      locale,
      kind: "products",
      internalPath: "/urunler",
      publicPath: getProductsPath(locale),
    };
  }

  if (newsSegments.includes(first as (typeof newsSegments)[number])) {
    if (second) {
      const slug = decodeURIComponent(rest.slice(1).join("/"));
      return {
        locale,
        kind: "news-item",
        slug,
        internalPath: `/haberler/${rest.slice(1).join("/")}`,
        publicPath: getNewsPath(locale, slug),
      };
    }

    return {
      locale,
      kind: "news",
      internalPath: "/haberler",
      publicPath: getNewsPath(locale),
    };
  }

  if (quoteCartSegments.includes(first as (typeof quoteCartSegments)[number])) {
    return {
      locale,
      kind: "quote-cart",
      internalPath: "/teklif-sepeti",
      publicPath: getQuoteCartPath(locale),
    };
  }

  if (
    unsubscribeSegments.includes(first as (typeof unsubscribeSegments)[number])
  ) {
    return {
      locale,
      kind: "unsubscribe",
      internalPath: "/abonelikten-ayril",
      publicPath: getUnsubscribePath(locale),
    };
  }

  const slug = decodeURIComponent(rest.join("/"));
  return {
    locale,
    kind: "page",
    slug,
    internalPath: `/${rest.join("/")}`,
    publicPath: `/${locale}/${rest.join("/")}`,
  };
}

export function toLocalizedPublicPath(
  locale: SiteLocale,
  internalPath: string,
) {
  const normalized = normalizePathname(internalPath);

  if (normalized === "/") return getHomePath(locale);

  if (normalized === "/urunler") return getProductsPath(locale);
  if (normalized.startsWith("/urunler/")) {
    return getProductsPath(locale, decodeURIComponent(normalized.slice(10)));
  }

  if (normalized === "/haberler") return getNewsPath(locale);
  if (normalized.startsWith("/haberler/")) {
    return getNewsPath(locale, decodeURIComponent(normalized.slice(10)));
  }

  if (normalized === "/teklif-sepeti") return getQuoteCartPath(locale);
  if (normalized === "/abonelikten-ayril") return getUnsubscribePath(locale);

  return `/${locale}${normalized}`;
}

export function localizeInternalHref(href: string, locale: SiteLocale) {
  const trimmed = href.trim();
  if (!trimmed) return trimmed;

  if (
    trimmed.startsWith("#") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("//")
  ) {
    return trimmed;
  }

  if (!trimmed.startsWith("/")) return trimmed;

  const { pathname, suffix } = splitPathAndSuffix(trimmed);
  const localized = parseLocalizedPublicPath(pathname);
  const internalPath = localized?.internalPath || pathname;

  return `${toLocalizedPublicPath(locale, internalPath)}${suffix}`;
}

export function getPreferredLocaleFromAcceptLanguage(
  acceptLanguage: string | null,
): SiteLocale {
  if (!acceptLanguage) return publicDefaultLocale;

  const candidates = acceptLanguage
    .split(",")
    .map((entry, index) => {
      const [tagPart, ...parameters] = entry.trim().split(";");
      const tag = tagPart.toLowerCase();
      const base = tag.split("-")[0];
      const qParameter = parameters.find((parameter) =>
        parameter.trim().startsWith("q="),
      );
      const parsedQ = qParameter
        ? Number.parseFloat(qParameter.trim().slice(2))
        : 1;

      return {
        locale: isSiteLocale(base) ? base : null,
        q: Number.isFinite(parsedQ) ? parsedQ : 0,
        index,
      };
    })
    .filter(
      (candidate): candidate is {
        locale: SiteLocale;
        q: number;
        index: number;
      } => candidate.locale !== null && candidate.q > 0,
    )
    .sort((a, b) => b.q - a.q || a.index - b.index);

  return candidates[0]?.locale || publicDefaultLocale;
}
