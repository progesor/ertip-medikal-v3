"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/CartProvider";
import type { SiteLocale } from "@/lib/i18n/config";
import {
  getProductsPath,
  getQuoteCartPath,
} from "@/lib/i18n/routing";

export type MobileHeaderNavItem = {
  label: string;
  href: string;
};

type MobileHeaderMenuProps = {
  locale: SiteLocale;
  navItems: MobileHeaderNavItem[];
  ctaLabel?: string;
  ctaHref?: string;
};

export function MobileHeaderMenu({
  locale,
  navItems,
  ctaLabel,
  ctaHref,
}: MobileHeaderMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const panelId = useId();
  const router = useRouter();
  const { cartItems } = useCart();
  const labels =
    locale === "en"
      ? {
          open: "Open mobile menu",
          close: "Close mobile menu",
          navigation: "Mobile navigation",
          search: "Search product or SKU",
          searchPlaceholder: "Search product or SKU...",
          submitSearch: "Search",
          mainMenu: "Mobile main menu",
          cart: "Quote Cart",
        }
      : {
          open: "Mobil menüyü aç",
          close: "Mobil menüyü kapat",
          navigation: "Mobil navigasyon",
          search: "Ürün veya SKU ara",
          searchPlaceholder: "Ürün veya SKU Ara...",
          submitSearch: "Ara",
          mainMenu: "Mobil ana menü",
          cart: "Teklif Sepeti",
        };

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    closeMenu();
    router.push(`${getProductsPath(locale)}?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? labels.close : labels.open}
        className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] border border-border bg-surface text-text-main shadow-sm transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label={labels.close}
            onClick={closeMenu}
            className="fixed inset-0 z-30 bg-surface-inverse/35 backdrop-blur-sm md:hidden"
          />

          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label={labels.navigation}
            className="fixed inset-x-0 top-[4.5rem] z-40 max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-b border-border bg-background p-4 shadow-2xl shadow-surface-inverse/15 md:hidden"
          >
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
              <form onSubmit={handleSearch} className="relative">
                <label htmlFor={`${panelId}-search`} className="sr-only">
                  {labels.search}
                </label>
                <input
                  id={`${panelId}-search`}
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={labels.searchPlaceholder}
                  className="w-full rounded-[var(--radius-xl)] border border-border bg-surface-muted py-3 pl-4 pr-12 text-sm text-text-main outline-none transition-all placeholder:text-text-muted/60 focus:border-primary focus:ring-1 focus:ring-ring"
                />
                <button
                  type="submit"
                  aria-label={labels.submitSearch}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-[var(--radius)] text-text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>

              <nav aria-label={labels.mainMenu} className="grid gap-2">
                {navItems.map((item) => (
                  <Link
                    key={`${item.label}-${item.href}`}
                    href={item.href}
                    onClick={closeMenu}
                    className="rounded-[var(--radius-xl)] border border-border/70 bg-surface px-4 py-3 text-sm font-bold text-text-main transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <Link
                href={getQuoteCartPath(locale)}
                onClick={closeMenu}
                className="flex items-center justify-between rounded-[var(--radius-xl)] border border-border bg-surface-muted px-4 py-3 font-bold text-text-main transition-colors hover:border-primary/30 hover:text-primary"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" /> {labels.cart}
                </span>
                <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-primary px-2 text-xs text-primary-foreground">
                  {cartItems.length}
                </span>
              </Link>

              {ctaLabel && ctaHref && (
                <Button asChild size="lg" className="w-full rounded-[var(--radius-xl)]">
                  <Link href={ctaHref} onClick={closeMenu}>
                    {ctaLabel}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
