"use client";

import React, { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

type ContactResponse = {
  success?: boolean;
  message?: string;
};

type ContactFormProps = {
  departments?: any[];
  privacyHref?: string;
};

export function ContactForm({ departments, privacyHref }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const selectedDepartment = formData.get("department");
    const rawMessage = formData.get("message");
    const finalMessage = selectedDepartment
      ? `[İlgili Departman: ${selectedDepartment}]\n\n${rawMessage}`
      : rawMessage;

    try {
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          message: finalMessage,
          website: formData.get("website"),
        }),
      });
      const data = (await response.json()) as ContactResponse;

      if (response.ok && data.success) {
        setIsSuccess(true);
        form.reset();
      } else {
        setError(data.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } catch (submissionError) {
      console.error("Form submission error:", submissionError);
      setError("Bağlantı hatası yaşandı. Lütfen internetinizi kontrol edin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl border border-success/25 bg-success/10 p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="mb-4 h-16 w-16 text-success" />
        <h3 className="mb-2 text-2xl font-bold text-text-main">
          Mesajınız Alındı!
        </h3>
        <p className="mb-6 text-text-muted">
          Talebiniz ilgili departmanımıza başarıyla iletildi. En kısa sürede
          sizinle iletişime geçeceğiz.
        </p>
        <Button
          variant="outline"
          onClick={() => setIsSuccess(false)}
          className="border-border font-bold text-text-main"
        >
          Yeni Mesaj Gönder
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
      >
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {error && (
        <div
          className="rounded-xl border border-error/25 bg-error/10 p-4 text-sm font-semibold text-error"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="contact-name"
            className="text-sm font-bold text-text-main"
          >
            Ad Soyad *
          </label>
          <input
            id="contact-name"
            required
            name="name"
            type="text"
            maxLength={120}
            autoComplete="name"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-main outline-none transition-all placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-ring"
            placeholder="Örn: Dr. Ahmet Yılmaz"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="contact-email"
            className="text-sm font-bold text-text-main"
          >
            E-Posta *
          </label>
          <input
            id="contact-email"
            required
            name="email"
            type="email"
            maxLength={254}
            autoComplete="email"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-main outline-none transition-all placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-ring"
            placeholder="ornek@klinik.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="contact-phone"
            className="text-sm font-bold text-text-main"
          >
            Telefon
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            maxLength={50}
            autoComplete="tel"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-main outline-none transition-all placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-ring"
            placeholder="+90 5XX XXX XX XX"
          />
        </div>

        {departments && departments.length > 0 && (
          <div className="space-y-2">
            <label
              htmlFor="contact-department"
              className="text-sm font-bold text-text-main"
            >
              İlgili Departman
            </label>
            <select
              id="contact-department"
              name="department"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-main outline-none transition-all focus:border-primary focus:ring-1 focus:ring-ring"
            >
              <option value="">Genel / Diğer</option>
              {departments.map((department: any, index: number) => (
                <option key={department.id || index} value={department.label}>
                  {department.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="contact-message"
          className="text-sm font-bold text-text-main"
        >
          Mesajınız *
        </label>
        <textarea
          id="contact-message"
          required
          name="message"
          rows={4}
          minLength={5}
          maxLength={5_000}
          className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-text-main outline-none transition-all placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-ring"
          placeholder="Talebinizi detaylıca buraya yazabilirsiniz..."
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="group h-14 w-full rounded-xl text-lg font-bold"
      >
        {isSubmitting ? (
          "Gönderiliyor..."
        ) : (
          <>
            Mesajı Gönder
            <Send className="ml-2 h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </>
        )}
      </Button>

      {privacyHref && (
        <p className="text-center text-xs leading-relaxed text-text-muted">
          Kişisel verilerin işlenmesine ilişkin detaylar için{" "}
          <a
            href={privacyHref}
            className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
          >
            KVKK Aydınlatma Metni
          </a>
          ’ni inceleyebilirsiniz.
        </p>
      )}
    </form>
  );
}
