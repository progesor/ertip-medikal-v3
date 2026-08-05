import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Button } from "@/components/ui/button";
import { getRequestLocale } from "@/lib/i18n/requestLocale";
import { localizeInternalHref } from "@/lib/i18n/routing";

type MediaValue =
  | number
  | string
  | {
      url?: string | null;
      alt?: string | null;
      width?: number | null;
      height?: number | null;
    }
  | null
  | undefined;

type MediaTextBlockProps = {
  eyebrow?: string | null;
  title: string;
  content: Parameters<typeof RichText>[0]["data"];
  image?: MediaValue;
  layoutMode?: "split" | "wrap" | null;
  columnRatio?: "mediaOneThird" | "equal" | "mediaTwoThird" | null;
  imagePosition?: "left" | "right" | null;
  verticalAlignment?: "start" | "center" | null;
  imageFit?: "cover" | "contain" | null;
  imageRatio?: "auto" | "landscape" | "wide" | "square" | "portrait" | null;
  contentWidth?: "compact" | "standard" | "wide" | "full" | null;
  contentAlignment?: "left" | "center" | null;
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

const ratioClasses = {
  mediaOneThird: {
    mediaGrid: "lg:col-span-4",
    contentGrid: "lg:col-span-8",
    wrapWidth: "lg:w-1/3",
    sizes: "(max-width: 1023px) 100vw, 33vw",
  },
  equal: {
    mediaGrid: "lg:col-span-6",
    contentGrid: "lg:col-span-6",
    wrapWidth: "lg:w-1/2",
    sizes: "(max-width: 1023px) 100vw, 50vw",
  },
  mediaTwoThird: {
    mediaGrid: "lg:col-span-8",
    contentGrid: "lg:col-span-4",
    wrapWidth: "lg:w-2/3",
    sizes: "(max-width: 1023px) 100vw, 66vw",
  },
} as const;

const contentWidthClasses = {
  compact: "max-w-3xl",
  standard: "max-w-5xl",
  wide: "max-w-6xl",
  full: "max-w-7xl",
} as const;

const fixedAspectRatios = {
  landscape: "4 / 3",
  wide: "16 / 9",
  square: "1 / 1",
  portrait: "3 / 4",
} as const;

const richTextClasses =
  "space-y-5 text-base leading-8 md:text-lg [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_h2]:pt-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:pt-3 [&_h3]:text-xl [&_h3]:font-bold [&_li]:mb-2 [&_ol]:ml-5 [&_ol]:list-decimal [&_p]:leading-8 [&_ul]:ml-5 [&_ul]:list-disc";

export async function MediaTextBlock({
  eyebrow,
  title,
  content,
  image,
  layoutMode = "split",
  columnRatio = "equal",
  imagePosition = "left",
  verticalAlignment = "center",
  imageFit = "cover",
  imageRatio = "landscape",
  contentWidth = "standard",
  contentAlignment = "left",
  theme = "light",
  highlight,
  buttonText,
  buttonLink,
}: MediaTextBlockProps) {
  const locale = await getRequestLocale();
  const media = typeof image === "object" && image ? image : null;
  const imageUrl = media?.url || null;
  const resolvedTheme = theme || "light";
  const resolvedLayoutMode = layoutMode || "split";
  const resolvedColumnRatio = columnRatio || "equal";
  const resolvedImageRatio = imageRatio || "landscape";
  const resolvedContentWidth = contentWidth || "standard";
  const classes = themeClasses[resolvedTheme];
  const ratio = ratioClasses[resolvedColumnRatio];
  const imageOnRight = imagePosition === "right";
  const isDark = resolvedTheme === "dark";
  const textOnlyCentered = !imageUrl && contentAlignment === "center";
  const autoAspectRatio =
    media?.width && media?.height
      ? `${media.width} / ${media.height}`
      : fixedAspectRatios.landscape;
  const aspectRatio =
    resolvedImageRatio === "auto"
      ? autoAspectRatio
      : fixedAspectRatios[resolvedImageRatio];

  const renderHeader = (centered = false) => (
    <div className={centered ? "text-center" : undefined}>
      {eyebrow && (
        <div className={centered ? "flex justify-center" : undefined}>
          <div
            className={`mb-5 inline-flex rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] ${classes.eyebrow}`}
          >
            {eyebrow}
          </div>
        </div>
      )}

      <h2
        className={`text-3xl font-black leading-tight tracking-tight md:text-4xl lg:text-5xl ${centered ? "mx-auto max-w-4xl" : "max-w-2xl"}`}
      >
        {title}
      </h2>
    </div>
  );

  const renderImage = (className: string, sizes: string) => {
    if (!imageUrl) return null;

    return (
      <div className={`relative ${className}`}>
        <div className="absolute -inset-3 rounded-[var(--radius-3xl)] border border-primary/10 bg-primary/5 md:-inset-5" />
        <div
          className={`relative overflow-hidden rounded-[var(--radius-3xl)] border border-border/50 shadow-2xl shadow-surface-inverse/15 ${classes.image}`}
          style={{ aspectRatio }}
        >
          <Image
            src={imageUrl}
            alt={media?.alt || title}
            fill
            className={
              imageFit === "contain" ? "object-contain p-6" : "object-cover"
            }
            sizes={sizes}
            quality={80}
          />
          {imageFit !== "contain" && (
            <div className="absolute inset-0 bg-gradient-to-t from-surface-inverse/20 via-transparent to-transparent" />
          )}
        </div>
      </div>
    );
  };

  const renderFooterContent = (centered = false) => (
    <>
      {highlight && (
        <div
          className={`mt-8 flex gap-4 rounded-[var(--radius-2xl)] border p-5 text-left md:p-6 ${classes.highlight}`}
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
        <div className={`mt-9 ${centered ? "flex justify-center" : ""}`}>
          <Button
            size="lg"
            variant={isDark ? "secondary" : "default"}
            className="h-12 rounded-[var(--radius-2xl)] px-7 font-bold"
            asChild
          >
            <Link href={localizeInternalHref(buttonLink, locale)}>
              {buttonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </>
  );

  const renderTextOnly = () => (
    <div
      className={`${contentWidthClasses[resolvedContentWidth]} ${textOnlyCentered ? "mx-auto" : "mr-auto"}`}
    >
      {renderHeader(textOnlyCentered)}
      <div
        className={`mt-7 ${richTextClasses} ${classes.body} ${textOnlyCentered ? "text-left" : ""}`}
      >
        <RichText data={content} />
      </div>
      {renderFooterContent(textOnlyCentered)}
    </div>
  );

  const renderWrapLayout = () => {
    const floatClasses = imageOnRight
      ? "lg:float-right lg:ml-10 xl:ml-12"
      : "lg:float-left lg:mr-10 xl:mr-12";

    return (
      <div className={`${contentWidthClasses[resolvedContentWidth]} mx-auto`}>
        {renderHeader()}
        <div className="mt-9 flow-root">
          {renderImage(
            `mb-8 w-full lg:mb-6 ${floatClasses} ${ratio.wrapWidth}`,
            ratio.sizes,
          )}
          <div className={`${richTextClasses} ${classes.body}`}>
            <RichText data={content} />
          </div>
        </div>
        {renderFooterContent()}
      </div>
    );
  };

  const renderSplitLayout = () => {
    const alignmentClass =
      verticalAlignment === "start" ? "items-start" : "items-center";

    return (
      <div
        className={`grid gap-12 lg:grid-cols-12 lg:gap-16 xl:gap-20 ${alignmentClass}`}
      >
        <div
          className={`${ratio.mediaGrid} ${imageOnRight ? "lg:order-2" : "lg:order-1"}`}
        >
          {renderImage("w-full", ratio.sizes)}
        </div>

        <div
          className={`${ratio.contentGrid} ${imageOnRight ? "lg:order-1" : "lg:order-2"}`}
        >
          {renderHeader()}
          <div className={`mt-7 ${richTextClasses} ${classes.body}`}>
            <RichText data={content} />
          </div>
          {renderFooterContent()}
        </div>
      </div>
    );
  };

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
        {!imageUrl
          ? renderTextOnly()
          : resolvedLayoutMode === "wrap"
            ? renderWrapLayout()
            : renderSplitLayout()}
      </div>
    </section>
  );
}
