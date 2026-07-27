import Image from "next/image";
import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type TestimonialItem = {
  name?: string;
  content?: string;
  avatar?: {
    url?: string;
  } | number | null;
};

type TestimonialLayoutMode = "auto" | "featured" | "grid";

function resolveLayout(mode: TestimonialLayoutMode | undefined, count: number) {
  if (mode && mode !== "auto") return mode;
  return count === 1 ? "featured" : "grid";
}

function getGridClass(count: number, layout: TestimonialLayoutMode) {
  if (layout === "featured") return "mx-auto max-w-4xl grid-cols-1";
  if (count === 2) return "mx-auto max-w-5xl grid-cols-1 md:grid-cols-2";
  if (count === 3) return "mx-auto max-w-7xl grid-cols-1 md:grid-cols-3";
  return "mx-auto max-w-7xl grid-cols-1 md:grid-cols-2 xl:grid-cols-4";
}

function TestimonialCard({
  item,
  featured = false,
}: {
  item: TestimonialItem;
  featured?: boolean;
}) {
  const avatarUrl =
    typeof item.avatar === "object" && item.avatar?.url ? item.avatar.url : null;
  const initial = item.name?.charAt(0) || "R";

  return (
    <Card
      className={`relative border border-border bg-surface-muted transition-colors duration-300 hover:bg-surface-muted/80 ${
        featured ? "rounded-[var(--radius-3xl)] p-4 md:p-8" : "rounded-3xl p-4"
      }`}
    >
      <CardContent
        className={featured ? "px-6 py-10 text-center md:px-12" : "px-8 pb-8 pt-10"}
      >
        <Quote
          className={`text-primary/10 transition-colors group-hover:text-primary/20 ${
            featured ? "mx-auto mb-6 h-12 w-12" : "absolute left-8 top-8 h-10 w-10"
          }`}
        />

        <blockquote className="relative z-10">
          <p
            className={`mb-8 leading-relaxed text-text-muted ${
              featured ? "text-xl italic md:text-2xl" : "text-lg italic"
            }`}
          >
            “{item.content}”
          </p>

          <div
            className={`flex items-center gap-4 ${featured ? "justify-center" : ""}`}
          >
            {avatarUrl ? (
              <div
                className={`${featured ? "h-16 w-16" : "h-14 w-14"} relative overflow-hidden rounded-2xl shadow-md`}
              >
                <Image
                  src={avatarUrl}
                  alt={item.name || "Referans"}
                  fill
                  className="object-cover"
                  sizes={featured ? "64px" : "56px"}
                  quality={70}
                />
              </div>
            ) : (
              <div
                className={`${featured ? "h-16 w-16" : "h-14 w-14"} flex items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary shadow-sm`}
              >
                {initial}
              </div>
            )}
            <div className={featured ? "text-left" : ""}>
              <cite className="block text-lg font-bold not-italic text-text-main">
                {item.name}
              </cite>
              <span className="text-sm font-medium lowercase text-text-muted">
                Referans
              </span>
            </div>
          </div>
        </blockquote>
      </CardContent>
    </Card>
  );
}

export function TestimonialBlock({
  title,
  testimonials,
  layoutMode = "auto",
}: {
  title?: string;
  testimonials?: TestimonialItem[];
  layoutMode?: TestimonialLayoutMode;
}) {
  if (!testimonials || testimonials.length === 0) return null;

  const resolvedLayout = resolveLayout(layoutMode, testimonials.length);

  return (
    <section className="bg-background py-24">
      <div className="container mx-auto max-w-7xl px-4">
        {title && (
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-text-main md:text-4xl">
              {title}
            </h2>
            <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-primary" />
          </div>
        )}

        <div
          className={`grid gap-8 ${getGridClass(testimonials.length, resolvedLayout)}`}
        >
          {testimonials.map((item, index) => (
            <TestimonialCard
              key={index}
              item={item}
              featured={resolvedLayout === "featured"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
