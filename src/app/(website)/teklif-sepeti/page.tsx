"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Send,
  ShoppingCart,
  ArrowRight,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/CartProvider";

export default function QuoteCartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payloadData = {
      customerName: formData.get("customerName"),
      company: formData.get("company"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message"),
      items: cartItems.map((item) => ({
        productTitle: item.title,
        variantInfo: item.variant,
        sku: item.sku,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadData),
      });

      if (res.ok) {
        setIsSuccess(true);
        clearCart();
      } else {
        alert("Bir hata oluştu, lütfen daha sonra tekrar deneyin.");
      }
    } catch (error) {
      console.error(error);
      alert("Bağlantı hatası yaşandı.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
        <div className="min-h-screen bg-background py-24 flex items-center justify-center">
          <div className="bg-surface p-12 rounded-[3rem] shadow-sm border border-border text-center max-w-lg">
            <div className="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-text-main mb-4">
              Talebiniz Alındı!
            </h2>
            <p className="text-text-muted mb-8 leading-relaxed">
              Teklif listeniz uzman ekibimize başarıyla ulaştı. En kısa sürede
              sizinle iletişime geçeceğiz.
            </p>
            <Button asChild size="lg" className="rounded-xl font-bold h-14 px-8">
              <Link href="/urunler">Kataloğa Geri Dön</Link>
            </Button>
          </div>
        </div>
    );
  }

  return (
      <div className="bg-background min-h-screen pt-12 pb-24">
        {/* Üst Kısım: Her temada şık duran koyu zemin */}
        <div className="bg-foreground py-16 mb-12">
          <div className="container mx-auto px-4 max-w-7xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Teklif Sepeti
            </h1>
            <p className="text-lg text-white/70">
              Seçtiğiniz medikal ürünler için hızlıca fiyat teklifi isteyin.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-7xl">
          {cartItems.length === 0 ? (
              <div className="bg-surface p-16 rounded-[3rem] shadow-sm border border-border text-center flex flex-col items-center">
                <ShoppingCart className="w-20 h-20 text-text-muted/30 mb-6" />
                <h3 className="text-2xl font-bold text-text-main mb-2">
                  Listeniz Şimdilik Boş
                </h3>
                <p className="text-text-muted mb-8">
                  Teklif almak için ürün detay sayfalarından sepetinize ürün
                  ekleyebilirsiniz.
                </p>
                <Button
                    asChild
                    size="lg"
                    className="rounded-2xl font-bold h-14 px-8"
                >
                  <Link href="/urunler">
                    Ürünleri İncele <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
          ) : (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                {/* SOL BÖLÜM: Ürün Listesi */}
                <div className="lg:col-span-3 space-y-6">
                  <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md">
                  {cartItems.length}
                </span>
                    Seçilen Ürünler
                  </h2>

                  <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden divide-y divide-border">
                    {cartItems.map((item, index) => (
                        <div
                            key={index}
                            className="p-6 flex flex-col sm:flex-row items-center gap-6 group hover:bg-surface-muted transition-colors"
                        >
                          <Link
                              href={`/urunler/${item.slug}`}
                              className="w-24 h-24 relative bg-surface-muted/50 rounded-2xl p-2 shrink-0 hover:opacity-80 transition-opacity"
                          >
                            <Image
                                src={item.image || "/placeholder.jpg"}
                                alt={item.title}
                                fill
                                className="object-contain mix-blend-multiply"
                                unoptimized
                            />
                          </Link>

                          <div className="flex-1 text-center sm:text-left">
                            <Link
                                href={`/urunler/${item.slug}`}
                                className="group/title"
                            >
                              <h4 className="font-bold text-text-main text-lg group-hover/title:text-primary transition-colors">
                                {item.title}
                              </h4>
                            </Link>
                            <p className="text-sm text-text-muted mt-1">
                              {item.variant}
                            </p>
                            <span className="inline-block mt-2 bg-surface-muted text-text-muted px-3 py-1 rounded-full text-xs font-mono font-bold border border-border">
                        SKU: {item.sku}
                      </span>
                          </div>

                          {/* ADET SEÇİCİ */}
                          <div className="flex items-center gap-3 bg-surface-muted p-1.5 rounded-xl border border-border">
                            <button
                                type="button"
                                onClick={() =>
                                    updateQuantity(index, (item.quantity || 1) - 1)
                                }
                                className="w-8 h-8 flex items-center justify-center bg-surface rounded-lg text-text-muted hover:text-primary shadow-sm transition-all"
                            >
                              <Minus className="w-4 h-4" />
                            </button>

                            <span className="w-8 text-center font-bold text-text-main">
                        {item.quantity || 1}
                      </span>

                            <button
                                type="button"
                                onClick={() =>
                                    updateQuantity(index, (item.quantity || 1) + 1)
                                }
                                className="w-8 h-8 flex items-center justify-center bg-surface rounded-lg text-text-muted hover:text-primary shadow-sm transition-all"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                              onClick={() => removeFromCart(index)}
                              className="w-12 h-12 rounded-full flex items-center justify-center text-error/60 hover:text-white hover:bg-error transition-all shrink-0"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                    ))}
                  </div>
                </div>

                {/* SAĞ BÖLÜM: İletişim Formu */}
                <div className="lg:col-span-2">
                  <div className="bg-surface p-8 rounded-3xl border border-border shadow-xl shadow-black/5 sticky top-24">
                    <h3 className="text-2xl font-bold text-text-main mb-6">
                      İletişim Bilgileriniz
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-text-main mb-2">
                          Ad Soyad / Yetkili Adı *
                        </label>
                        <input
                            required
                            name="customerName"
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-muted/50"
                            placeholder="Örn: Dr. Ahmet Yılmaz"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-text-main mb-2">
                          Klinik / Firma Adı
                        </label>
                        <input
                            name="company"
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-muted/50"
                            placeholder="Opsiyonel"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-text-main mb-2">
                            E-Posta *
                          </label>
                          <input
                              required
                              name="email"
                              type="email"
                              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-muted/50"
                              placeholder="ornek@klinik.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-text-main mb-2">
                            Telefon *
                          </label>
                          <input
                              required
                              name="phone"
                              type="tel"
                              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-muted/50"
                              placeholder="+90 5XX XXX XX XX"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-text-main mb-2">
                          Ek Notunuz (Opsiyonel)
                        </label>
                        <textarea
                            name="message"
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none placeholder:text-text-muted/50"
                            placeholder="Belirtmek istediğiniz özel bir durum var mı?"
                        ></textarea>
                      </div>

                      <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-14 rounded-xl text-lg font-bold mt-4"
                      >
                        {isSubmitting
                            ? "Gönderiliyor..."
                            : "Teklif İsteğini Gönder"}
                      </Button>
                      <p className="text-xs text-center text-text-muted mt-4">
                        Bilgileriniz KVKK kapsamında korunmaktadır.
                      </p>
                    </form>
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  );
}