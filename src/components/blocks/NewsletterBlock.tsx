"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterBlock({ title, description, buttonText }: any) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");

    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        const errorData = await res.json();
        setStatus("error");

        if (errorData.errors?.[0]?.message?.includes("unique")) {
          setErrorMessage("Bu e-posta adresi zaten kayıtlı.");
        } else {
          setErrorMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
        }
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("Bağlantı hatası yaşandı.");
    }
  };

  return (
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-background/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold text-primary-foreground mb-6 tracking-tight">
              {title}
            </h2>
            {/* Metin, primary arkaplan üzerinde okunabilmesi için primary-foreground'un hafif saydam hali yapıldı */}
            <p className="text-lg text-primary-foreground/80 mb-10 leading-relaxed">
              {description}
            </p>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
            >
              <div className="w-full relative">
                <Input
                    name="email"
                    type="email"
                    placeholder="E-Posta adresinizi girin..."
                    required
                    disabled={status === "loading" || status === "success"}
                    // Input placeholder'ı ve metni primary-foreground oldu
                    className="h-14 rounded-full bg-background/10 border-background/20 text-primary-foreground placeholder:text-primary-foreground/50 px-6 focus-visible:ring-background text-lg w-full"
                />
                {status === "error" && (
                    <p className="absolute -bottom-6 left-4 text-sm text-red-200 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" /> {errorMessage}
                    </p>
                )}
              </div>

              <Button
                  type="submit"
                  size="lg"
                  disabled={status === "loading" || status === "success"}
                  // Buton bg-primary arkaplanında kaybolmasın diye zıt renk (bg-background) atandı
                  className="h-14 rounded-full px-8 font-bold text-md w-full sm:w-auto transition-all duration-300 bg-background text-foreground hover:bg-surface-muted"
              >
                {status === "loading" ? (
                    "Kayıt..."
                ) : status === "success" ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" /> Başarılı
                    </>
                ) : (
                    <>
                      {buttonText || "Kayıt Ol"} <Send className="w-5 h-5 ml-2" />
                    </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>
  );
}