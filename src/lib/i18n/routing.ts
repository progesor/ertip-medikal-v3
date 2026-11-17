import legacySlugs from "./legacySlugs.json";
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

function canonicalSlug(group: keyof typeof legacySlugs, slug: string) {
  const aliases: Record<string, string> = legacySlugs[group];
  return Object.hasOwn(aliases, slug) ? aliases[slug] : slug;
}

export function getCanonicalCategorySlug(slug: string) {
  return canonicalSlug("categories", slug);
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

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
  const base = `/${locale}/products`;
  return slug ? `${base}/${encodeURIComponent(canonicalSlug("products", slug))}` : base;
}

export function getNewsPath(locale: SiteLocale, slug?: string) {
  const base = `/${locale}/news`;
  return slug ? `${base}/${encodeURIComponent(canonicalSlug("news", slug))}` : base;
}

export function getQuoteCartPath(locale: SiteLocale) {
  return `/${locale}/quote-cart`;
}

export function getUnsubscribePath(locale: SiteLocale) {
  return `/${locale}/unsubscribe`;
}

export function getPagePath(locale: SiteLocale, slug: string) {
  return slug === "home" ? getHomePath(locale) : `/${locale}/${encodeURIComponent(canonicalSlug("pages", slug))}`;
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
  if (first === "products" || first === "urunler") {
    if (second) {
      const rawSlug = rest.slice(1).join("/");
      const slug = canonicalSlug("products", safeDecodeURIComponent(rawSlug));
      return {
        locale,
        kind: "product",
        slug,
        internalPath: `/urunler/${encodeURIComponent(slug)}`,
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

  if (first === "news" || first === "haberler") {
    if (second) {
      const rawSlug = rest.slice(1).join("/");
      const slug = canonicalSlug("news", safeDecodeURIComponent(rawSlug));
      return {
        locale,
        kind: "news-item",
        slug,
        internalPath: `/haberler/${encodeURIComponent(slug)}`,
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

  if (first === "quote-cart" || first === "teklif-sepeti") {
    return {
      locale,
      kind: "quote-cart",
      internalPath: "/teklif-sepeti",
      publicPath: getQuoteCartPath(locale),
    };
  }

  if (
    first === "unsubscribe" || first === "abonelikten-ayril"
  ) {
    return {
      locale,
      kind: "unsubscribe",
      internalPath: "/abonelikten-ayril",
      publicPath: getUnsubscribePath(locale),
    };
  }

  const slug = safeDecodeURIComponent(rest.join("/"));
  return {
    locale,
    kind: "page",
    slug,
    internalPath: `/${rest.join("/")}`,
    publicPath: rest.length === 1 ? getPagePath(locale, slug) : `/${locale}/${rest.join("/")}`,
  };
}

export function toLocalizedPublicPath(
  locale: SiteLocale,
  internalPath: string,
) {
  const normalized = normalizePathname(internalPath);

  return parseLocalizedPublicPath(`/${locale}${normalized}`)!.publicPath;
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
