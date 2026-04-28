"use client";

import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterBlock({ title, description, buttonText }: any) {
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Buraya ileride Server Action veya API entegrasyonu gelecek
    setStatus("success");
    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Dekoratif Arkaplan Işıkları */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            {title}
          </h2>
          <p className="text-lg text-slate-300 mb-10 leading-relaxed">
            {description}
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
          >
            <Input
              type="email"
              placeholder="E-Posta adresinizi girin..."
              required
              className="h-14 rounded-full bg-white/10 border-white/20 text-white placeholder:text-slate-400 px-6 focus-visible:ring-primary text-lg"
            />
            <Button
              type="submit"
              size="lg"
              className="h-14 rounded-full px-8 font-bold text-md w-full sm:w-auto transition-all duration-300"
            >
              {status === "success" ? (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" /> Kayıt Başarılı
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
