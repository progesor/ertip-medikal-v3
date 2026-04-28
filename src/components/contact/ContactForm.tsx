"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitInquiry } from "@/app/actions/submitInquiry";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{
    success?: boolean;
    error?: string;
  } | null>(null);

  const handleSubmit = (formData: FormData) => {
    setStatus(null);
    // startTransition, Next.js'e bu işlemin arka planda asenkron çalışacağını söyler
    startTransition(async () => {
      const result = await submitInquiry(formData);
      setStatus(result);
    });
  };

  // Başarılı gönderim durumu
  if (status?.success) {
    return (
      <div className="p-8 bg-green-50 text-green-800 rounded-2xl border border-green-200 text-center space-y-4">
        <h3 className="text-2xl font-bold">Mesajınız Alındı!</h3>
        <p className="text-lg">
          Talebiniz başarıyla bize ulaştı. En kısa sürede sizinle iletişime
          geçeceğiz.
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {status?.error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
          {status.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">
          Ad Soyad <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Adınız ve Soyadınız"
          disabled={isPending}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email">
            E-Posta <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="ornek@sirket.com"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon Numaranız</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+90 (555) 000 00 00"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          Mesajınız / Teklif Talebiniz <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          required
          placeholder="Hangi ürünle ilgileniyorsunuz veya size nasıl yardımcı olabiliriz?"
          rows={6}
          disabled={isPending}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full text-md"
        disabled={isPending}
      >
        {isPending ? "Gönderiliyor..." : "Mesajı Gönder"}
      </Button>
    </form>
  );
}
