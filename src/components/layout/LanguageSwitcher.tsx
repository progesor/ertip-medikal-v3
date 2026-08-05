import Link from "next/link";
import { Languages } from "lucide-react";
import type { SiteLocale } from "@/lib/i18n/config";

type LanguageSwitcherProps = {
  currentLocale: SiteLocale;
  targetHref: string;
  available: boolean;
};

export function LanguageSwitcher({
  currentLocale,
  targetHref,
  available,
}: LanguageSwitcherProps) {
  const targetLocale: SiteLocale = currentLocale === "en" ? "tr" : "en";
  const targetLabel = targetLocale.toUpperCase();
  const ariaLabel =
    targetLocale === "en" ? "Switch to English" : "Türkçeye geç";
  const unavailableLabel =
    targetLocale === "en"
      ? "English translation is not available yet"
      : "Türkçe çeviri henüz mevcut değil";

  if (!available) {
    return (
      <span
        aria-disabled="true"
        title={unavailableLabel}
        className="inline-flex h-10 cursor-not-allowed items-center gap-1.5 rounded-[var(--radius)] border border-border bg-surface-muted px-2.5 text-xs font-black uppercase tracking-wider text-text-muted/50"
      >
        <Languages className="h-4 w-4" aria-hidden="true" />
        {targetLabel}
      </span>
    );
  }

  return (
    <Link
      href={targetHref}
      aria-label={ariaLabel}
      title={ariaLabel}
      className="inline-flex h-10 items-center gap-1.5 rounded-[var(--radius)] border border-border bg-surface px-2.5 text-xs font-black uppercase tracking-wider text-text-muted shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      {targetLabel}
    </Link>
  );
}
