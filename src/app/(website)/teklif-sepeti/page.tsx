"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Minus,
  Plus,
  Send,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/CartProvider";

type QuoteResponse = {
  success?: boolean;
  message?: string;
};

export default function QuoteCartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/public/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.get("customerName"),
          company: formData.get("company"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          message: formData.get("message"),
          website: formData.get("website"),
          items: cartItems.map((item) => ({
            productId: item.id,
            ...(item.combinationKey
              ? { combinationKey: item.combinationKey }
              : {}),
            sku: item.sku,
            quantity: item.quantity,
          })),
        }),
      });
      const data = (await response.json()) as QuoteResponse;

      if (response.ok && data.success) {
        setIsSuccess(true);
        clearCart();
        form.reset();
      } else {
        setError(
          data.message || "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        );
      }
    } catch (submissionError) {
      console.error(submissionError);
      setError("Bağlantı hatası yaşandı. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background py-24">
        <div className="max-w-lg rounded-[var(--radius-3xl)] border border-border/80 bg-surface p-12 text-center shadow-lg shadow-surface-inverse/5">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/10 text-success">
            <Send className="h-10 w-10" />
          </div>
          <h2 className="mb-4 text-3xl font-black text-text-main">
            Talebiniz Alındı!
          </h2>
          <p className="mb-8 leading-relaxed text-text-muted">
            Teklif listeniz uzman ekibimize başarıyla ulaştı. En kısa sürede
            sizinle iletişime geçeceğiz.
          </p>
          <Button asChild size="lg" className="h-14 rounded-xl px-8 font-bold">
            <Link href="/urunler">Kataloğa Geri Dön</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-12">
      <div className="mb-8 py-2">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h1 className="mb-2 text-3xl font-bold text-text-main">Teklif Sepeti</h1>
          <p className="text-text-muted">
            Seçtiğiniz ürünler için fiyat teklifi isteyin.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center rounded-[var(--radius-3xl)] border border-border/80 bg-surface p-16 text-center shadow-sm shadow-surface-inverse/5">
            <ShoppingCart className="mb-6 h-20 w-20 text-text-muted/30" />
            <h3 className="mb-2 text-2xl font-bold text-text-main">
              Listeniz Şimdilik Boş
            </h3>
            <p className="mb-8 text-text-muted">
              Teklif almak için ürün detay sayfalarından sepetinize ürün
              ekleyebilirsiniz.
            </p>
            <Button
              asChild
              size="lg"
              className="h-14 rounded-2xl px-8 font-bold"
            >
              <Link href="/urunler">
                Ürünleri İncele <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-3">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-text-main">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground shadow-md">
                  {cartItems.length}
                </span>
                Seçilen Ürünler
              </h2>

              <div className="divide-y divide-border overflow-hidden rounded-[var(--radius-2xl)] border border-border/80 bg-surface shadow-sm shadow-surface-inverse/5">
                {cartItems.map((item, index) => (
                  <div
                    key={`${item.id}-${item.variant}-${index}`}
                    className="group flex flex-col items-center gap-6 p-6 transition-colors hover:bg-surface-muted sm:flex-row"
                  >
                    <Link
                      href={`/urunler/${item.slug}`}
                      className="relative h-24 w-24 shrink-0 rounded-[var(--radius-xl)] bg-surface-muted/70 p-2 transition-opacity hover:opacity-80"
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
                      <Link href={`/urunler/${item.slug}`} className="group/title">
                        <h4 className="text-lg font-bold text-text-main transition-colors group-hover/title:text-primary">
                          {item.title}
                        </h4>
                      </Link>
                      <p className="mt-1 text-sm text-text-muted">{item.variant}</p>
                      <span className="mt-2 inline-block rounded-full border border-border bg-surface-muted px-3 py-1 font-mono text-xs font-bold text-text-muted">
                        SKU: {item.sku}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-surface-muted p-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(index, (item.quantity || 1) - 1)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-text-muted shadow-sm transition-all hover:text-primary"
                        aria-label={`${item.title} miktarını azalt`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-text-main">
                        {item.quantity || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(index, (item.quantity || 1) + 1)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-text-muted shadow-sm transition-all hover:text-primary"
                        aria-label={`${item.title} miktarını artır`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(index)}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-error/60 transition-all hover:bg-error hover:text-error-foreground"
                      aria-label={`${item.title} ürününü teklif sepetinden kaldır`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-24 rounded-[var(--radius-2xl)] border border-border/80 bg-surface p-8 shadow-xl shadow-surface-inverse/5">
                <h3 className="mb-6 text-2xl font-bold text-text-main">
                  İletişim Bilgileriniz
                </h3>

                <form onSubmit={handleSubmit} className="relative space-y-5">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
                  >
                    <label htmlFor="quote-website">Website</label>
                    <input
                      id="quote-website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl border border-error/25 bg-error/10 p-4 text-sm font-semibold text-error">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-bold text-text-main">
                      Ad Soyad / Yetkili Adı *
                    </label>
                    <input
                      required
                      name="customerName"
                      type="text"
                      maxLength={120}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-main outline-none transition-all placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-ring"
                      placeholder="Örn: Dr. Ahmet Yılmaz"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-text-main">
                      Klinik / Firma Adı
                    </label>
                    <input
                      name="company"
                      type="text"
                      maxLength={160}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-main outline-none transition-all placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-ring"
                      placeholder="Opsiyonel"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-text-main">
                        E-Posta *
                      </label>
                      <input
                        required
                        name="email"
                        type="email"
                        maxLength={254}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-main outline-none transition-all placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-ring"
                        placeholder="ornek@klinik.com"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-text-main">
                        Telefon *
                      </label>
                      <input
                        required
                        name="phone"
                        type="tel"
                        minLength={5}
                        maxLength={50}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-main outline-none transition-all placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-ring"
                        placeholder="+90 5XX XXX XX XX"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-text-main">
                      Ek Notunuz (Opsiyonel)
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      maxLength={5_000}
                      className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-text-main outline-none transition-all placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-ring"
                      placeholder="Belirtmek istediğiniz özel bir durum var mı?"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 h-14 w-full rounded-xl text-lg font-bold"
                  >
                    {isSubmitting
                      ? "Gönderiliyor..."
                      : "Teklif İsteğini Gönder"}
                  </Button>
                  <p className="mt-4 text-center text-xs text-text-muted">
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
