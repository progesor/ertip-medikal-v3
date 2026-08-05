"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import type { SiteLocale } from "@/lib/i18n/config";

type AlternateLocaleState = {
  pathname: string;
  href: string;
  available: boolean;
};

type LanguageSwitcherProps = {
  currentLocale: SiteLocale;
  sourcePathname: string;
  targetHref: string;
  available: boolean;
};

export function LanguageSwitcher({
  currentLocale,
  sourcePathname,
  targetHref,
  available,
}: LanguageSwitcherProps) {
  const pathname = usePathname() || sourcePathname;
  const targetLocale: SiteLocale = currentLocale === "en" ? "tr" : "en";
  const targetLabel = targetLocale.toUpperCase();
  const ariaLabel =
    targetLocale === "en" ? "Switch to English" : "Türkçeye geç";
  const unavailableLabel =
    targetLocale === "en"
      ? "English translation is not available yet"
      : "Türkçe çeviri henüz mevcut değil";
  const resolvingLabel =
    targetLocale === "en"
      ? "Resolving English page..."
      : "Türkçe sayfa hazırlanıyor...";
  const [clientResolution, setClientResolution] =
    useState<AlternateLocaleState | null>(null);

  useEffect(() => {
    if (pathname === sourcePathname) return;

    const controller = new AbortController();

    void fetch(
      `/api/public/alternate-locale?pathname=${encodeURIComponent(pathname)}`,
      {
        cache: "no-store",
        signal: controller.signal,
      },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error("Alternate locale resolution failed");

        const result = (await response.json()) as Partial<AlternateLocaleState>;
        const href = typeof result.href === "string" ? result.href : "";
        const resolvedAvailable = result.available === true;

        if (!href.startsWith("/")) {
          throw new Error("Invalid alternate locale href");
        }

        if (!controller.signal.aborted) {
          setClientResolution({
            pathname,
            href,
            available: resolvedAvailable,
          });
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Alternate locale resolution error", error);
        setClientResolution({ pathname, href: "", available: false });
      });

    return () => controller.abort();
  }, [pathname, sourcePathname]);

  const isSourcePath = pathname === sourcePathname;
  const hasCurrentClientResolution = clientResolution?.pathname === pathname;
  const isResolving = !isSourcePath && !hasCurrentClientResolution;
  const alternateLocale = isSourcePath
    ? { href: targetHref, available }
    : clientResolution?.pathname === pathname
      ? clientResolution
      : { href: "", available: false };

  if (isResolving || !alternateLocale.available) {
    return (
      <span
        aria-disabled="true"
        aria-busy={isResolving || undefined}
        title={isResolving ? resolvingLabel : unavailableLabel}
        className="inline-flex h-10 cursor-not-allowed items-center gap-1.5 rounded-[var(--radius)] border border-border bg-surface-muted px-2.5 text-xs font-black uppercase tracking-wider text-text-muted/50"
      >
        <Languages className="h-4 w-4" aria-hidden="true" />
        {targetLabel}
      </span>
    );
  }

  // Locale switching intentionally uses a native document navigation instead
  // of Next's client-side Link. The public locale is carried in request headers
  // by proxy.ts and shared Server Component layouts (header/menu/footer) must
  // be reconstructed for the new locale in the same navigation.
  return (
    <a
      href={alternateLocale.href}
      aria-label={ariaLabel}
      title={ariaLabel}
      className="inline-flex h-10 items-center gap-1.5 rounded-[var(--radius)] border border-border bg-surface px-2.5 text-xs font-black uppercase tracking-wider text-text-muted shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      {targetLabel}
    </a>
  );
}
