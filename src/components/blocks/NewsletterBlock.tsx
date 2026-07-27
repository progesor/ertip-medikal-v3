"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type NewsletterResponse = {
  success?: boolean;
  message?: string;
};

export function NewsletterBlock({ title, description, buttonText }: any) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/public/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          website: formData.get("website"),
        }),
      });
      const data = (await response.json()) as NewsletterResponse;

      if (response.ok && data.success) {
        setStatus("success");
        form.reset();
        window.setTimeout(() => setStatus("idle"), 4_000);
      } else {
        setStatus("error");
        setErrorMessage(
          data.message || "Bir hata oluştu. Lütfen tekrar deneyin.",
        );
      }
    } catch {
      setStatus("error");
      setErrorMessage("Bağlantı hatası yaşandı.");
    }
  };

  return (
    <section className="relative overflow-hidden bg-primary py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-background/10 blur-[120px]" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-primary-foreground md:text-5xl">
            {title}
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-primary-foreground/80">
            {description}
          </p>

          <form
            onSubmit={handleSubmit}
            className="relative mx-auto flex max-w-lg flex-col gap-4 sm:flex-row"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
            >
              <label htmlFor="newsletter-website">Website</label>
              <input
                id="newsletter-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="relative w-full">
              <Input
                name="email"
                type="email"
                maxLength={254}
                placeholder="E-Posta adresinizi girin..."
                required
                disabled={status === "loading" || status === "success"}
                className="h-14 w-full rounded-full border-background/20 bg-background/10 px-6 text-lg text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-ring"
              />
              {status === "error" && (
                <p className="absolute -bottom-7 left-4 flex items-center text-sm text-error-foreground">
                  <AlertCircle className="mr-1 h-3 w-3" /> {errorMessage}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={status === "loading" || status === "success"}
              className="h-14 w-full rounded-full bg-background px-8 text-md font-bold text-foreground transition-all duration-300 hover:bg-surface-muted sm:w-auto"
            >
              {status === "loading" ? (
                "Kayıt..."
              ) : status === "success" ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5 text-success" /> Başarılı
                </>
              ) : (
                <>
                  {buttonText || "Kayıt Ol"} <Send className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
