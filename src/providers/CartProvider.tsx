"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CartContextType, CartItem } from "@/types";

const CART_STORAGE_KEY = "quote_cart";
const CartContext = createContext<CartContextType | undefined>(undefined);

function getCartIdentity(
  item: Pick<CartItem, "id" | "sku" | "combinationKey">,
) {
  return `${item.id}::${item.combinationKey || item.sku || "standard"}`;
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

      return [
        {
          id: String(item.id),
          title: item.title,
          slug: item.slug,
          variant: item.variant,
          sku: item.sku,
          ...(combinationKey ? { combinationKey } : {}),
          image: item.image,
          quantity,
        },
      ];
    });
  } catch (error) {
    console.error("Sepet okuma hatası", error);
    return [];
  }
}

function persistCart(cartItems: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
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
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
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
                alt="Ürün"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="flex-1">
              <p className="mb-1 flex items-center gap-1 text-xs font-bold text-success">
                <CheckCircle2 className="h-4 w-4" /> Teklif Listesine Eklendi
              </p>
              <p className="line-clamp-1 text-sm font-bold text-card-foreground">
                {toast.item.title}
              </p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {toast.item.sku}
              </p>
            </div>
            <Link
              href="/teklif-sepeti"
              onClick={() => setToast({ show: false, item: null })}
              className="rounded-[var(--radius)] bg-primary/10 p-3 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              aria-label="Teklif sepetine git"
            >
              <ShoppingBag className="h-5 w-5" />
            </Link>
            <button
              type="button"
              onClick={() => setToast({ show: false, item: null })}
              className="absolute -right-2 -top-2 rounded-full border border-border bg-card p-1 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
              aria-label="Bildirimi kapat"
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
