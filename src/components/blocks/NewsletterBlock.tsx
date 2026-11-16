import { NewsletterFormClient } from "./NewsletterFormClient";
import type { Page } from "@/payload-types";

type Newsletter = Extract<NonNullable<Page["layout"]>[number], { blockType: "newsletter" }>;

export function NewsletterBlock({ title, description, buttonText }: Newsletter) {
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

          <NewsletterFormClient buttonText={buttonText} />
        </div>
      </div>
    </section>
  );
}
