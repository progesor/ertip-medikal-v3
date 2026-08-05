import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionShell, type SectionOptions } from "@/components/blocks/SectionShell";
import { cn } from "@/lib/utils";
import { getRequestLocale } from "@/lib/i18n/requestLocale";
import { localizeInternalHref } from "@/lib/i18n/routing";

type MediaValue =
  | number
  | string
  | {
      url?: string | null;
      alt?: string | null;
    }
  | null
  | undefined;

type CTAButton = {
  label?: string | null;
  link?: string | null;
  style?: "solid" | "secondary" | "outline" | null;
};

type CTABlockProps = {
  eyebrow?: string | null;
  title: string;
  description?: string | null;
  backgroundImage?: MediaValue;
  layoutMode?: "card" | "banner" | null;
  alignment?: "left" | "center" | null;
  theme?: "primary" | "dark" | "light" | null;
  buttons?: CTAButton[] | null;
  trustNote?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  section?: SectionOptions | null;
};

const themeClasses = {
  primary: {
    surface: "bg-primary text-primary-foreground",
    muted: "text-primary-foreground/80",
    overlay: "bg-primary/80",
    eyebrow: "border-primary-foreground/15 bg-primary-foreground/10",
  },
  dark: {
    surface: "bg-surface-inverse text-surface-inverse-foreground",
    muted: "text-surface-inverse-foreground/75",
    overlay: "bg-surface-inverse/82",
    eyebrow: "border-surface-inverse-foreground/15 bg-surface-inverse-foreground/10",
  },
  light: {
    surface: "border border-border bg-background text-text-main",
    muted: "text-text-muted",
    overlay: "bg-background/88",
    eyebrow: "border-primary/15 bg-primary/10 text-primary",
  },
} as const;

function getMedia(value: MediaValue) {
  return typeof value === "object" && value ? value : null;
}

function getButtonPresentation(
  style: CTAButton["style"],
  theme: NonNullable<CTABlockProps["theme"]>,
) {
  const resolvedStyle = style || "solid";
  const lightTheme = theme === "light";

  if (resolvedStyle === "outline") {
    return {
      variant: "outline" as const,
      className: lightTheme
        ? "border-text-main/20 bg-transparent text-text-main hover:bg-surface-muted"
        : "border-current/30 bg-transparent text-current hover:bg-background/10",
    };
  }

  if (resolvedStyle === "secondary") {
    return {
      variant: "outline" as const,
      className: lightTheme
        ? "border-primary/15 bg-primary/10 text-primary hover:bg-primary/15"
        : "border-current/15 bg-background/10 text-current hover:bg-background/15",
    };
  }

  return {
    variant: lightTheme ? ("default" as const) : ("secondary" as const),
    className: lightTheme
      ? ""
      : "bg-background text-primary hover:bg-surface-muted",
  };
}

export async function CTABlock({
  eyebrow,
  title,
  description,
  backgroundImage,
  layoutMode = "card",
  alignment = "center",
  theme = "primary",
  buttons,
  trustNote,
  buttonText,
  buttonLink,
  section,
}: CTABlockProps) {
  const locale = await getRequestLocale();
  const media = getMedia(backgroundImage);
  const imageUrl = media?.url || null;
  const resolvedTheme = theme || "primary";
  const resolvedLayout = layoutMode || "card";
  const centered = alignment !== "left";
  const classes = themeClasses[resolvedTheme];
  const preparedButtons =
    buttons && buttons.length > 0
      ? buttons
      : buttonText && buttonLink
        ? [{ label: buttonText, link: buttonLink, style: "solid" as const }]
        : [];

  return (
    <SectionShell
      section={section}
      defaultBackground="transparent"
      defaultSpacing="compact"
      defaultContentWidth="wide"
    >
      <div
        className={cn(
          "relative isolate overflow-hidden shadow-2xl shadow-surface-inverse/10",
          classes.surface,
          resolvedLayout === "card"
            ? "rounded-[var(--radius-3xl)] px-7 py-12 md:px-14 md:py-20"
            : "rounded-[var(--radius-2xl)] px-6 py-9 md:px-10 md:py-11",
        )}
      >
        {imageUrl && (
          <>
            <Image
              src={imageUrl}
              alt={media?.alt || title}
              fill
              className="-z-20 object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
              quality={76}
            />
            <div
              className={cn("absolute inset-0 -z-10", classes.overlay)}
              aria-hidden="true"
            />
          </>
        )}

        <div
          className={cn(
            "relative z-10",
            resolvedLayout === "banner" && !centered
              ? "grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]"
              : "",
          )}
        >
          <div className={cn(centered && "mx-auto max-w-4xl text-center")}>
            {eyebrow && (
              <div
                className={cn(
                  "mb-5 inline-flex rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em]",
                  classes.eyebrow,
                )}
              >
                {eyebrow}
              </div>
            )}

            <h2
              className={cn(
                "font-black leading-tight tracking-tight",
                resolvedLayout === "card"
                  ? "text-3xl md:text-5xl"
                  : "text-3xl md:text-4xl",
              )}
            >
              {title}
            </h2>

            {description && (
              <p
                className={cn(
                  "mt-5 max-w-3xl text-lg leading-relaxed md:text-xl",
                  centered && "mx-auto",
                  classes.muted,
                )}
              >
                {description}
              </p>
            )}

            {trustNote && (
              <div
                className={cn(
                  "mt-6 flex items-center gap-2 text-sm font-semibold",
                  centered && "justify-center",
                  classes.muted,
                )}
              >
                <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{trustNote}</span>
              </div>
            )}
          </div>

          {preparedButtons.length > 0 && (
            <div
              className={cn(
                "flex flex-wrap gap-4",
                resolvedLayout === "card" || centered ? "mt-9 justify-center" : "justify-end",
              )}
            >
              {preparedButtons.map((button, index) => {
                if (!button.label || !button.link) return null;
                const presentation = getButtonPresentation(
                  button.style || (index === 0 ? "solid" : "outline"),
                  resolvedTheme,
                );

                return (
                  <Button
                    key={`${button.link}-${index}`}
                    size="lg"
                    variant={presentation.variant}
                    className={cn(
                      "h-12 rounded-[var(--radius-2xl)] px-7 font-bold",
                      presentation.className,
                    )}
                    asChild
                  >
                    <Link href={localizeInternalHref(button.link, locale)}>
                      {button.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        {!imageUrl && (
          <div
            className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-background/10 blur-3xl"
            aria-hidden="true"
          />
        )}
      </div>
    </SectionShell>
  );
}
