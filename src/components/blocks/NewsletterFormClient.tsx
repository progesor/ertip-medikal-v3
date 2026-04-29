"use client";

import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterFormClient({ buttonText }: { buttonText?: string }) {
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("success");
    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
    >
      <Input
        type="email"
        placeholder="E-Posta adresinizi girin..."
        required
        className="h-14 rounded-full bg-white/10 border-white/20 text-white placeholder:text-content-subtle px-6 focus-visible:ring-primary text-lg"
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
  );
}
