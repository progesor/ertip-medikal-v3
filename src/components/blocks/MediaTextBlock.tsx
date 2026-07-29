import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Button } from "@/components/ui/button";

type MediaValue =
  | number
  | string
  | {
      url?: string | null;
      alt?: string | null;
    }
  | null
  | undefined;

type MediaTextBlockProps = {
  eyebrow?: string | null;
  title: string;
  content: Parameters<typeof RichText>[0]["data"];
  image: MediaValue;
  imagePosition?: "left" | "right" | null;
  imageFit?: "cover" | "contain" | null;
  theme?: "light" | "muted" | "dark" | null;
  highlight?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
};

const themeClasses = {
  light: {
    section: "bg-background text-text-main",
    eyebrow: "border-primary/15 bg-primary/10 text-primary",
    body: "text-text-muted",
    highlight: "border-primary/20 bg-primary/10 text-text-main",
    image: "bg-surface-muted",
  },
  muted: {
    section: "border-y border-border bg-surface-muted text-text-main",
    eyebrow: "border-primary/15 bg-surface text-primary",
    body: "text-text-muted",
    highlight: "border-primary/20 bg-surface text-text-main",
    image: "bg-surface",
  },
  dark: {
    section: "bg-surface-inverse text-surface-inverse-foreground",
    eyebrow:
      "border-primary-foreground/15 bg-primary-foreground/10 text-primary-foreground",
    body: "text-surface-inverse-foreground/75",
    highlight:
      "border-primary-foreground/15 bg-primary-foreground/10 text-surface-inverse-foreground",
    image: "bg-surface-inverse-foreground/5",
  },
} as const;

export function MediaTextBlock({
  eyebrow,
  title,
  content,
  image,
  imagePosition = "left",
  imageFit = "cover",
  theme = "light",
  highlight,
  buttonText,
  buttonLink,
}: MediaTextBlockProps) {
  const media = typeof image === "object" && image ? image : null;
  const imageUrl = media?.url || null;
  const resolvedTheme = theme || "light";
  const classes = themeClasses[resolvedTheme];
  const imageOnRight = imagePosition === "right";
  const isDark = resolvedTheme === "dark";

  if (!imageUrl) return null;

  return (
    <section
      className={`relative overflow-hidden py-16 md:py-24 lg:py-28 ${classes.section}`}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24">
          <div
            className={`relative order-1 ${imageOnRight ? "lg:order-2" : "lg:order-1"}`}
          >
            <div className="absolute -inset-4 rounded-[var(--radius-3xl)] border border-primary/10 bg-primary/5 md:-inset-6" />
            <div
              className={`relative aspect-[4/3] overflow-hidden rounded-[var(--radius-3xl)] border border-border/50 shadow-2xl shadow-surface-inverse/15 ${classes.image}`}
            >
              <Image
                src={imageUrl}
                alt={media?.alt || title}
                fill
                className={
                  imageFit === "contain"
                    ? "object-contain p-6"
                    : "object-cover"
                }
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={80}
              />
              {imageFit !== "contain" && (
                <div className="absolute inset-0 bg-gradient-to-t from-surface-inverse/20 via-transparent to-transparent" />
              )}
            </div>
          </div>

          <div
            className={`order-2 ${imageOnRight ? "lg:order-1" : "lg:order-2"}`}
          >
            {eyebrow && (
              <div
                className={`mb-5 inline-flex rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] ${classes.eyebrow}`}
              >
                {eyebrow}
              </div>
            )}

            <h2 className="max-w-2xl text-3xl font-black leading-tight tracking-tight md:text-4xl lg:text-5xl">
              {title}
            </h2>

            <div
              className={`mt-7 space-y-5 text-base leading-8 md:text-lg [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_h2]:pt-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:pt-3 [&_h3]:text-xl [&_h3]:font-bold [&_li]:mb-2 [&_ol]:ml-5 [&_ol]:list-decimal [&_p]:leading-8 [&_ul]:ml-5 [&_ul]:list-disc ${classes.body}`}
            >
              <RichText data={content} />
            </div>

            {highlight && (
              <div
                className={`mt-8 flex gap-4 rounded-[var(--radius-2xl)] border p-5 md:p-6 ${classes.highlight}`}
              >
                <Quote
                  className="mt-0.5 h-6 w-6 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <p className="text-base font-semibold leading-7 md:text-lg">
                  {highlight}
                </p>
              </div>
            )}

            {buttonText && buttonLink && (
              <div className="mt-9">
                <Button
                  size="lg"
                  variant={isDark ? "secondary" : "default"}
                  className="h-12 rounded-[var(--radius-2xl)] px-7 font-bold"
                  asChild
                >
                  <Link href={buttonLink}>
                    {buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
