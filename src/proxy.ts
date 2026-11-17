import { NextRequest, NextResponse } from "next/server";
import { existsSync } from "node:fs";
import { maintenanceFile } from "@/lib/backup/storage.mjs";
import {
  isSiteLocale,
  localeCookieName,
  localeRequestHeader,
  publicPathRequestHeader,
  type SiteLocale,
} from "@/lib/i18n/config";
import {
  getPreferredLocaleFromAcceptLanguage,
  getCanonicalCategorySlug,
  parseLocalizedPublicPath,
  toLocalizedPublicPath,
} from "@/lib/i18n/routing";

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const INTERNAL_REWRITE_HEADER = "x-ertip-internal-rewrite";

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
  if (
    bypassPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
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
  if (existsSync(maintenanceFile()) && !(
    pathname.startsWith("/_next/") ||
    (["GET", "HEAD"].includes(request.method) && (pathname.startsWith("/admin/") || pathname === "/admin")) ||
    ["/api/users/login", "/api/users/me", "/api/users/refresh-token"].includes(pathname)
  )) {
    return new NextResponse("Site geri yükleniyor. Lütfen biraz sonra yeniden deneyin.", {
      status: 503, headers: { "Retry-After": "30", "Cache-Control": "no-store" },
    });
  }

  if (shouldBypass(pathname)) {
    return NextResponse.next();
  }

  // A localized public URL is rewritten to one of the existing internal app
  // routes. If Next.js evaluates Proxy again for that rewritten request, do not
  // feed the internal path back into legacy/public canonicalization. The marker
  // is routing-only; it is not an authorization or security boundary.
  if (request.headers.get(INTERNAL_REWRITE_HEADER) === "1") {
    return NextResponse.next();
  }

  const localizedRoute = parseLocalizedPublicPath(pathname);

  if (localizedRoute) {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.pathname = localizedRoute.publicPath;
    const category = canonicalUrl.searchParams.get("category");
    if (localizedRoute.kind === "products" && category) {
      const slug = getCanonicalCategorySlug(category);
      if (slug !== category) canonicalUrl.searchParams.set("category", slug);
    }
    if (canonicalUrl.pathname !== pathname || canonicalUrl.search !== request.nextUrl.search) {
      return withLocaleCookie(
        NextResponse.redirect(canonicalUrl, 308),
        localizedRoute.locale,
      );
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(INTERNAL_REWRITE_HEADER, "1");
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
      getPreferredLocaleFromAcceptLanguage(
        request.headers.get("accept-language"),
      );

    return redirectToLocalizedPath(request, locale, "/");
  }

  // Existing pre-M10 public URLs contain Turkish content. Keep old links
  // working while making the locale prefix canonical.
  return redirectToLocalizedPath(request, "tr", pathname);
}

export const config = {
  // Leave large backup uploads on the route's streaming body, outside Proxy's replay buffer.
  matcher: ["/((?!_next/static|_next/image|api/site-backups(?:/|$)).*)"],
};
