import { NewsletterFormClient } from "./NewsletterFormClient";
import type { Page } from "@/payload-types";

type Newsletter = Extract<NonNullable<Page["layout"]>[number], { blockType: "newsletter" }>;

export function NewsletterBlock({ title, description, buttonText }: Newsletter) {
  return (
    <section className="bg-primary py-10 text-primary-foreground md:py-14">
      <div className="container mx-auto grid max-w-7xl items-center gap-6 px-4 lg:grid-cols-2 lg:gap-12">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          {description && <p className="mt-2 text-base leading-relaxed">{description}</p>}
        </div>
        <NewsletterFormClient buttonText={buttonText} />
      </div>
    </section>
  );
}