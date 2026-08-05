import Link from "next/link";
import Image from "next/image";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { HeaderActions } from "@/components/layout/HeaderActions";
import {
  MobileHeaderMenu,
  type MobileHeaderNavItem,
} from "@/components/layout/MobileHeaderMenu";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import {
  getPublicPathname,
  getRequestLocale,
} from "@/lib/i18n/requestLocale";
import {
  getHomePath,
  localizeInternalHref,
} from "@/lib/i18n/routing";
import { resolveAlternateLocaleHref } from "@/lib/i18n/alternateLocale";
import type { SiteLocale } from "@/lib/i18n/config";

type HeaderLogoVariant = "auto" | "default" | "white" | "symbol";
type HeaderLayout = "default" | "compact" | "brand";

type MenuItem = {
  label?: unknown;
  type?: unknown;
  url?: unknown;
  reference?: unknown;
};

function getMediaUrl(media: unknown) {
  return typeof media === "object" && media !== null && "url" in media
    ? String((media as { url?: string }).url || "")
    : "";
}

function getHeaderLogoUrl(general: any, variant: HeaderLogoVariant) {
  const defaultLogo = getMediaUrl(general?.siteLogo);
  const whiteLogo = getMediaUrl(general?.whiteLogo);
  const symbolLogo = getMediaUrl(general?.symbolLogo);

  if (variant === "symbol") return symbolLogo || defaultLogo || whiteLogo;
  if (variant === "white") return whiteLogo || defaultLogo || symbolLogo;
  if (variant === "default") return defaultLogo || symbolLogo || whiteLogo;

  return defaultLogo || symbolLogo || whiteLogo;
}

function resolveMenuItems(
  items: unknown,
  locale: SiteLocale,
): MobileHeaderNavItem[] {
  if (!Array.isArray(items)) return [];

  return items.flatMap((rawItem) => {
    if (!rawItem || typeof rawItem !== "object") return [];

    const item = rawItem as MenuItem;
    const label = typeof item.label === "string" ? item.label.trim() : "";
    if (!label) return [];

    if (item.type === "custom" && typeof item.url === "string") {
      const href = item.url.trim();
      return href
        ? [{ label, href: localizeInternalHref(href, locale) }]
        : [];
    }

    if (
      item.type === "reference" &&
      item.reference &&
      typeof item.reference === "object" &&
      "slug" in item.reference &&
      typeof (item.reference as { slug?: unknown }).slug === "string"
    ) {
      const slug = (item.reference as { slug: string }).slug.trim();
      return slug ? [{ label, href: `/${locale}/${slug}` }] : [];
    }

    return [];
  });
}

export async function Header() {
  const [payload, locale, publicPathname] = await Promise.all([
    getPayload({ config: configPromise }),
    getRequestLocale(),
    getPublicPathname(),
  ]);

  const [mainMenu, siteSettings, alternateLocale] = await Promise.all([
    payload.findGlobal({
      slug: "main-menu",
      locale,
      fallbackLocale: false,
      depth: 1,
    }),
    payload.findGlobal({
      slug: "site-settings",
      locale,
      fallbackLocale: false,
      depth: 2,
    }),
    resolveAlternateLocaleHref({
      payload,
      currentLocale: locale,
      publicPathname,
    }),
  ]);

  const navItems = resolveMenuItems(mainMenu?.items, locale);
  const headerSettings = (siteSettings as any)?.header || {};
  const generalSettings = (siteSettings as any)?.general || {};

  const showLogo = headerSettings.showLogoInHeader === true;
  const showCompanyName = headerSettings.showCompanyNameInHeader !== false;
  const showTagline = headerSettings.showTaglineInHeader !== false;
  const companyName = headerSettings.headerCompanyName || "Ertip Medikal";
  const tagline = headerSettings.headerTagline || "Medical Instruments";
  const logoVariant = (headerSettings.headerLogoVariant ||
    "auto") as HeaderLogoVariant;
  const headerLayout = (headerSettings.headerLayout ||
    "default") as HeaderLayout;
  const ctaLabel =
    headerSettings.headerCtaLabel ||
    (locale === "en" ? "Contact Us" : "Bize Ulaşın");
  const ctaHref = localizeInternalHref(
    headerSettings.headerCtaHref || "/iletisim",
    locale,
  );
  const logoUrl = showLogo
    ? getHeaderLogoUrl(generalSettings, logoVariant)
    : "";
  const shouldFallbackToCompanyName =
    !logoUrl && !showCompanyName && !showTagline;
  const shouldShowText =
    showCompanyName || showTagline || shouldFallbackToCompanyName;
  const shouldUseCompact = headerLayout === "compact";
  const shouldEmphasizeBrand = headerLayout === "brand";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 shadow-sm shadow-surface-inverse/5 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div
        className={`container mx-auto flex items-center justify-between gap-3 px-4 ${
          shouldUseCompact ? "min-h-16 py-2" : "min-h-[4.5rem] py-3"
        }`}
      >
        <div className="flex min-w-0 shrink items-center gap-2">
          <Link
            href={getHomePath(locale)}
            className="flex min-w-0 items-center gap-3"
          >
            {logoUrl ? (
              <span className="relative block h-10 w-auto min-w-28 overflow-hidden">
                <Image
                  src={logoUrl}
                  alt={companyName}
                  width={180}
                  height={48}
                  className="h-10 w-auto object-contain"
                  sizes="180px"
                  quality={75}
                  priority
                />
              </span>
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] border border-primary/15 bg-primary/10 shadow-sm shadow-primary/10">
                <span className="h-4 w-4 rounded-full bg-primary shadow-[0_0_0_6px_hsl(var(--primary)/0.12)]" />
              </span>
            )}

            {shouldShowText && (
              <span
                className={`min-w-0 leading-tight ${
                  logoUrl && shouldEmphasizeBrand ? "hidden lg:block" : ""
                }`}
              >
                {(showCompanyName || shouldFallbackToCompanyName) && (
                  <span className="block truncate text-xl font-black tracking-tight text-text-main">
                    {companyName}
                  </span>
                )}
                {showTagline && (
                  <span className="hidden truncate text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted sm:block">
                    {tagline}
                  </span>
                )}
              </span>
            )}
          </Link>
        </div>

        <nav
          aria-label={locale === "en" ? "Main menu" : "Ana menü"}
          className="hidden items-center gap-1 rounded-[var(--radius-xl)] border border-border/70 bg-surface/80 p-1 text-sm font-semibold shadow-sm shadow-surface-inverse/5 md:flex"
        >
          {navItems.map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              className="rounded-[var(--radius)] px-3 py-2 text-text-muted transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher
            currentLocale={locale}
            targetHref={alternateLocale.href}
            available={alternateLocale.available}
          />
          <HeaderActions
            locale={locale}
            ctaLabel={ctaLabel}
            ctaHref={ctaHref}
          />
          <MobileHeaderMenu
            locale={locale}
            navItems={navItems}
            ctaLabel={ctaLabel}
            ctaHref={ctaHref}
          />
        </div>
      </div>
    </header>
  );
}
