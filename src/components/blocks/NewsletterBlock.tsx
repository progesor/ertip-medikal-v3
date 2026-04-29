import React from "react";
import { NewsletterFormClient } from "@/components/blocks/NewsletterFormClient";

export function NewsletterBlock({ title, description, buttonText }: any) {
  return (
    <section className="py-24 bg-brand-dark relative overflow-hidden">
      {/* Dekoratif Arkaplan Işıkları */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            {title}
          </h2>
          <p className="text-lg text-content-soft mb-10 leading-relaxed">
            {description}
          </p>

          <NewsletterFormClient buttonText={buttonText} />
        </div>
      </div>
    </section>
  );
}
