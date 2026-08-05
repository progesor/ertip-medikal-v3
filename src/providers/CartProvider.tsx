"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type {
  CartContextType,
  CartItem,
  CartLocalizedIdentity,
} from "@/types";
import { getQuoteCartPath } from "@/lib/i18n/routing";
import {
  useSiteLocale,
  useUiDictionary,
} from "@/providers/SiteLocaleProvider";

const CART_STORAGE_KEY = "quote_cart";
const CartContext = createContext<CartContextType | undefined>(undefined);

function getCartIdentity(
  item: Pick<CartItem, "id" | "sku" | "combinationKey">,
) {
  return `${item.id}::${item.combinationKey || item.sku || "standard"}`;
}

function readLocalizedIdentity(value: unknown): CartLocalizedIdentity | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;

  const source = value as Record<string, unknown>;
  const localizedIdentity: CartLocalizedIdentity = {};

  for (const locale of ["en", "tr"] as const) {
    const candidate = source[locale];
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      continue;
    }

    const localized = candidate as Record<string, unknown>;
    if (typeof localized.title === "string" && typeof localized.slug === "string") {
      localizedIdentity[locale] = {
        title: localized.title,
        slug: localized.slug,
      };
    }
  }

  return Object.keys(localizedIdentity).length > 0 ? localizedIdentity : undefined;
}

function readStoredCart(): CartItem[] {
  try {
    const storedValue = localStorage.getItem(CART_STORAGE_KEY);
    if (!storedValue) return [];

    const parsedValue: unknown = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) return [];

    return parsedValue.flatMap((value) => {
      if (!value || typeof value !== "object") return [];

      const item = value as Record<string, unknown>;
      if (
        (typeof item.id !== "string" && typeof item.id !== "number") ||
        typeof item.title !== "string" ||
        typeof item.slug !== "string" ||
        typeof item.variant !== "string" ||
        typeof item.sku !== "string" ||
        typeof item.image !== "string"
      ) {
        return [];
      }

      const quantity =
        typeof item.quantity === "number" && Number.isFinite(item.quantity)
          ? Math.max(1, Math.floor(item.quantity))
          : 1;
      const combinationKey =
        typeof item.combinationKey === "string"
          ? item.combinationKey.trim()
          : "";
      const localizedIdentity = readLocalizedIdentity(item.localizedIdentity);

      return [
        {
          id: String(item.id),
          title: item.title,
          slug: item.slug,
          ...(localizedIdentity ? { localizedIdentity } : {}),
          variant: item.variant,
          sku: item.sku,
          ...(combinationKey ? { combinationKey } : {}),
          image: item.image,
          quantity,
        },
      ];
    });
  } catch (error) {
    console.error("Cart read error", error);
    return [];
  }
}

function persistCart(cartItems: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const locale = useSiteLocale();
  const dictionary = useUiDictionary();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{ show: boolean; item: CartItem | null }>({
    show: false,
    item: null,
  });

  useEffect(() => {
    const hydrateCart = () => setCartItems(readStoredCart());
    const timeoutId = window.setTimeout(hydrateCart, 0);

    window.addEventListener("storage", hydrateCart);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("storage", hydrateCart);
    };
  }, []);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((previousCart) => {
      const itemIdentity = getCartIdentity(item);
      const existingItemIndex = previousCart.findIndex(
        (cartItem) => getCartIdentity(cartItem) === itemIdentity,
      );
      const nextCart =
        existingItemIndex >= 0
          ? previousCart.map((cartItem, index) =>
              index === existingItemIndex
                ? {
                    ...cartItem,
                    title: item.title,
                    slug: item.slug,
                    localizedIdentity: {
                      ...cartItem.localizedIdentity,
                      ...item.localizedIdentity,
                    },
                    quantity: cartItem.quantity + 1,
                  }
                : cartItem,
            )
          : [...previousCart, { ...item, quantity: 1 }];

      persistCart(nextCart);
      return nextCart;
    });

    setToast({ show: true, item: { ...item, quantity: 1 } });
    window.setTimeout(() => setToast({ show: false, item: null }), 4000);
  };

  const removeFromCart = (index: number) => {
    setCartItems((previousCart) => {
      const nextCart = previousCart.filter((_, itemIndex) => itemIndex !== index);
      persistCart(nextCart);
      return nextCart;
    });
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems((previousCart) => {
      const nextCart = previousCart.map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity: newQuantity } : item,
      );
      persistCart(nextCart);
      return nextCart;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const toastTitle = toast.item?.localizedIdentity?.[locale]?.title || toast.item?.title;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}

      <AnimatePresence>
        {toast.show && toast.item && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 flex min-w-[320px] max-w-[400px] items-center gap-4 rounded-[var(--radius-2xl)] border border-border bg-card p-4 text-card-foreground shadow-2xl"
          >
            <div className="relative h-16 w-16 shrink-0 rounded-[var(--radius-xl)] border border-border bg-surface-muted p-1">
              <Image
                src={toast.item.image || "/placeholder.jpg"}
                alt={dictionary.cart.productAlt}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="flex-1">
              <p className="mb-1 flex items-center gap-1 text-xs font-bold text-success">
                <CheckCircle2 className="h-4 w-4" /> {dictionary.cart.added}
              </p>
              <p className="line-clamp-1 text-sm font-bold text-card-foreground">
                {toastTitle}
              </p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {toast.item.sku}
              </p>
            </div>
            <Link
              href={getQuoteCartPath(locale)}
              onClick={() => setToast({ show: false, item: null })}
              className="rounded-[var(--radius)] bg-primary/10 p-3 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              aria-label={dictionary.cart.goToCart}
            >
              <ShoppingBag className="h-5 w-5" />
            </Link>
            <button
              type="button"
              onClick={() => setToast({ show: false, item: null })}
              className="absolute -right-2 -top-2 rounded-full border border-border bg-card p-1 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
              aria-label={dictionary.cart.closeNotification}
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
