"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  MailCheck,
  MailX,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ApiResponse = {
  success?: boolean;
  message?: string;
};

type Status = "idle" | "loading" | "success" | "error";

export function UnsubscribeClient({ token }: { token?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/public/unsubscribe/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          website: formData.get("website"),
        }),
      });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok) {
        setStatus("error");
        setMessage(result.message || "İşlem tamamlanamadı. Lütfen tekrar deneyin.");
        return;
      }

      setStatus("success");
      setMessage(
        result.message ||
          "Adres abonelik listemizde bulunuyorsa doğrulama bağlantısı gönderildi.",
      );
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Bağlantı hatası yaşandı. Lütfen tekrar deneyin.");
    }
  };

  const handleConfirm = async () => {
    if (!token) return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/public/unsubscribe/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok) {
        setStatus("error");
        setMessage(result.message || "İşlem tamamlanamadı.");
        return;
      }

      setStatus("success");
      setMessage(
        result.message || "E-bülten aboneliğiniz başarıyla iptal edildi.",
      );
    } catch {
      setStatus("error");
      setMessage("Bağlantı hatası yaşandı. Lütfen tekrar deneyin.");
    }
  };

  const isConfirmation = Boolean(token);
  const isComplete = status === "success";

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-surface-muted/30 px-4 py-20">
      <div className="max-w-md w-full bg-surface p-8 md:p-12 rounded-[var(--radius-3xl)] shadow-2xl shadow-surface-inverse/5 border border-border/80 text-center">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isComplete ? "bg-success/10" : "bg-surface-muted"
          }`}
        >
          {isComplete ? (
            <CheckCircle2 className="w-10 h-10 text-success" />
          ) : isConfirmation ? (
            <MailCheck className="w-10 h-10 text-text-muted" />
          ) : (
            <MailX className="w-10 h-10 text-text-muted" />
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-text-main mb-4">
          {isComplete
            ? isConfirmation
              ? "Abonelik İptal Edildi"
              : "E-Postanızı Kontrol Edin"
            : isConfirmation
              ? "Abonelik İptal Onayı"
              : "Abonelikten Ayrıl"}
        </h1>

        {message ? (
          <div
            className={`mb-6 rounded-xl border p-4 text-sm font-medium ${
              status === "error"
                ? "border-error/25 bg-error/10 text-error"
                : "border-success/25 bg-success/10 text-text-main"
            }`}
          >
            {status === "error" ? (
              <AlertCircle className="inline-block w-4 h-4 mr-2" />
            ) : null}
            {message}
          </div>
        ) : (
          <p className="text-text-muted mb-8 leading-relaxed">
            {isConfirmation
              ? "E-bülten aboneliğinizi iptal etmek için işlemi onaylayın."
              : "Güvenli iptal bağlantısını almak için e-posta adresinizi girin."}
          </p>
        )}

        {!isComplete && isConfirmation ? (
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={status === "loading"}
            className="w-full h-14 rounded-[var(--radius-xl)] font-bold"
          >
            {status === "loading" ? "İşleniyor..." : "Aboneliğimi İptal Et"}
          </Button>
        ) : null}

        {!isComplete && !isConfirmation ? (
          <form onSubmit={handleRequest} className="space-y-4">
            <div
              aria-hidden="true"
              className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
            >
              <label htmlFor="unsubscribe-website">Website</label>
              <input
                id="unsubscribe-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="E-posta adresiniz..."
              className="w-full px-4 py-3 rounded-[var(--radius)] border border-input bg-background focus:border-primary focus:ring-2 focus:ring-ring/30 outline-none transition-all text-text-main placeholder:text-text-muted/50"
            />
            <Button
              type="submit"
              variant="destructive"
              disabled={status === "loading"}
              className="w-full h-14 rounded-[var(--radius-xl)] font-bold"
            >
              {status === "loading" ? "Gönderiliyor..." : "İptal Bağlantısı Gönder"}
            </Button>
          </form>
        ) : null}

        <Link
          href="/"
          className="inline-flex items-center justify-center mt-6 text-sm font-semibold text-text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Anasayfaya Dön
        </Link>
      </div>
    </div>
  );
}
