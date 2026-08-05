import { NextRequest, NextResponse } from "next/server";
import {
  isSiteLocale,
  localeCookieName,
  localeRequestHeader,
  publicPathRequestHeader,
  type SiteLocale,
} from "@/lib/i18n/config";
import {
  getPreferredLocaleFromAcceptLanguage,
  parseLocalizedPublicPath,
  toLocalizedPublicPath,
} from "@/lib/i18n/routing";

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const bypassPrefixes = [
  "/admin",
  "/api",
  "/_next",
  "/_payload",
];

const bypassExactPaths = new Set([
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
  "/og-image.jpg",
]);

function shouldBypass(pathname: string) {
  if (bypassExactPaths.has(pathname)) return true;
  if (bypassPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return true;
  }

  // Public files and image assets should never be treated as localized pages.
  return /\.[a-z0-9]{2,8}$/i.test(pathname);
}

function getSavedLocale(request: NextRequest): SiteLocale | null {
  const value = request.cookies.get(localeCookieName)?.value;
  return value && isSiteLocale(value) ? value : null;
}

function withLocaleCookie(response: NextResponse, locale: SiteLocale) {
  response.cookies.set(localeCookieName, locale, {
    httpOnly: false,
    maxAge: LOCALE_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

function redirectToLocalizedPath(
  request: NextRequest,
  locale: SiteLocale,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = toLocalizedPublicPath(locale, pathname);
  return withLocaleCookie(NextResponse.redirect(url), locale);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (shouldBypass(pathname)) {
    return NextResponse.next();
  }

  const localizedRoute = parseLocalizedPublicPath(pathname);

  if (localizedRoute) {
    // Accept aliases such as /en/urunler, but permanently expose only the
    // locale's canonical segment (/en/products, /tr/urunler, etc.).
    if (localizedRoute.publicPath !== pathname) {
      const canonicalUrl = request.nextUrl.clone();
      canonicalUrl.pathname = localizedRoute.publicPath;
      return withLocaleCookie(
        NextResponse.redirect(canonicalUrl, 308),
        localizedRoute.locale,
      );
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(localeRequestHeader, localizedRoute.locale);
    requestHeaders.set(publicPathRequestHeader, pathname);

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = localizedRoute.internalPath;

    return withLocaleCookie(
      NextResponse.rewrite(rewriteUrl, {
        request: {
          headers: requestHeaders,
        },
      }),
      localizedRoute.locale,
    );
  }

  if (pathname === "/") {
    const locale =
      getSavedLocale(request) ||
      getPreferredLocaleFromAcceptLanguage(request.headers.get("accept-language"));

    return redirectToLocalizedPath(request, locale, "/");
  }

  // Existing pre-M10 public URLs contain Turkish content. Keep old links
  // working while making the locale prefix canonical.
  return redirectToLocalizedPath(request, "tr", pathname);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
