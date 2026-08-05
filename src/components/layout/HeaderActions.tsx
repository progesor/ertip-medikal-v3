"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search } from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { Button } from "@/components/ui/button";
import type { SiteLocale } from "@/lib/i18n/config";
import {
  getProductsPath,
  getQuoteCartPath,
} from "@/lib/i18n/routing";

export function HeaderActions({
  locale,
  ctaLabel = "Bize Ulaşın",
  ctaHref = "/iletisim",
}: {
  locale: SiteLocale;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const { cartItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const labels =
    locale === "en"
      ? {
          searchPlaceholder: "Search product or SKU...",
          searchAria: "Search products",
          cart: "Quote cart",
          product: "product",
          products: "products",
        }
      : {
          searchPlaceholder: "Ürün veya SKU Ara...",
          searchAria: "Ürün ara",
          cart: "Teklif sepeti",
          product: "ürün",
          products: "ürün",
        };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `${getProductsPath(locale)}?q=${encodeURIComponent(searchQuery)}`,
      );
    }
  };

  return (
    <div className="flex items-center gap-4 lg:gap-6 ml-auto">
      <form
        onSubmit={handleSearch}
        className="relative hidden lg:block w-48 xl:w-64"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className="w-full bg-surface-muted border border-border text-sm rounded-[var(--radius-2xl)] pl-4 pr-10 py-2 text-text-main placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-ring outline-none transition-all"
        />
        <button
          type="submit"
          aria-label={labels.searchAria}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>

      <Link
        href={getQuoteCartPath(locale)}
        aria-label={
          cartItems.length > 0
            ? `${labels.cart} (${cartItems.length} ${
                cartItems.length === 1 ? labels.product : labels.products
              })`
            : labels.cart
        }
        className="relative p-2 text-text-muted hover:text-primary transition-colors"
      >
        <ShoppingCart className="w-6 h-6" />
        {cartItems.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-background shadow-sm">
            {cartItems.length}
          </span>
        )}
      </Link>

      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="hidden sm:block">
          <Button
            variant="default"
            size="sm"
            className="rounded-[var(--radius-2xl)] px-6"
          >
            {ctaLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
