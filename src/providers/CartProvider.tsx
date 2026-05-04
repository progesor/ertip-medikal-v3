"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CartItem, CartContextType } from "@/types";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{ show: boolean; item: CartItem | null }>({
    show: false,
    item: null,
  });

  // İlk yüklemede LocalStorage'dan sepeti çek
  useEffect(() => {
    const stored = localStorage.getItem("quote_cart");
    if (stored) {
      try {
        const parsedCart = JSON.parse(stored);
        // GÜVENLİK KONTROLÜ: Eski sepette 'quantity' alanı yoksa varsayılan olarak 1 ata
        const validatedCart = parsedCart.map((item: any) => ({
          ...item,
          quantity: item.quantity || 1,
        }));
        setCartItems(validatedCart);
      } catch (e) {
        console.error("Sepet okuma hatası", e);
      }
    }
  }, []);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((prevCart) => {
      // Sepette aynı SKU'ya sahip ürün var mı kontrol et
      const existingItemIndex = prevCart.findIndex((i) => i.sku === item.sku);

      let newCart;
      if (existingItemIndex >= 0) {
        // VARSA: Mevcut ürünün adedini 1 artır (Immutable update)
        newCart = prevCart.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: (cartItem.quantity || 1) + 1 }
            : cartItem,
        );
      } else {
        // YOKSA: Yeni ürün olarak adet=1 ile ekle
        newCart = [...prevCart, { ...item, quantity: 1 }];
      }

      localStorage.setItem("quote_cart", JSON.stringify(newCart));
      return newCart;
    });

    // Toast Bildirimi
    setToast({ show: true, item: { ...item, quantity: 1 } as CartItem });
    setTimeout(() => setToast({ show: false, item: null }), 4000);
  };

  const removeFromCart = (index: number) => {
    setCartItems((prevCart) => {
      const newCart = prevCart.filter((_, i) => i !== index);
      localStorage.setItem("quote_cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return; // 1'den az olamaz

    setCartItems((prevCart) => {
      // Doğru ve güvenli array güncelleme yöntemi (Immutable)
      const newCart = prevCart.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item,
      );
      localStorage.setItem("quote_cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("quote_cart");
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

      {/* ÖZEL ANİMASYONLU BİLDİRİM (TOAST) */}
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
                <CheckCircle2 className="w-4 h-4" /> Teklif Listesine Eklendi
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
              <ShoppingBag className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setToast({ show: false, item: null })}
              className="absolute -right-2 -top-2 rounded-full border border-border bg-card p-1 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
              aria-label="Bildirimi kapat"
            >
              <X className="w-3 h-3" />
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
