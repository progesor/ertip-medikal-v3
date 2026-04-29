"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type CartItem = {
  id: string;
  title: string;
  slug: string;
  variant: string;
  sku: string;
  image: string;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  updateQuantity: (index: number, newQuantity: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
};

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
            className="fixed bottom-8 right-8 z-50 bg-white p-4 rounded-3xl shadow-2xl border border-surface-muted flex items-center gap-4 min-w-[320px] max-w-[400px]"
          >
            <div className="w-16 h-16 relative bg-surface rounded-2xl p-1 shrink-0 border border-surface-muted">
              <Image
                src={toast.item.image || "/placeholder.jpg"}
                alt="Ürün"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-green-600 flex items-center gap-1 mb-1">
                <CheckCircle2 className="w-4 h-4" /> Teklif Listesine Eklendi
              </p>
              <p className="text-sm font-bold text-content-strong line-clamp-1">
                {toast.item.title}
              </p>
              <p className="text-xs text-content-muted font-mono mt-0.5">
                {toast.item.sku}
              </p>
            </div>
            <Link
              href="/teklif-sepeti"
              onClick={() => setToast({ show: false, item: null })}
              className="bg-primary/10 text-primary p-3 rounded-xl hover:bg-primary hover:text-white transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setToast({ show: false, item: null })}
              className="absolute -top-2 -right-2 bg-white text-content-subtle hover:text-content-strong border border-surface-muted rounded-full p-1 shadow-sm"
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
