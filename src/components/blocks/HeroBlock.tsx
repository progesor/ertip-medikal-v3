import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionShell, type SectionOptions } from "@/components/blocks/SectionShell";
import { cn } from "@/lib/utils";

type MediaValue =
  | number
  | string
  | {
      url?: string | null;
      alt?: string | null;
    }
  | null
  | undefined;

type HeroButton = {
  label?: string | null;
  link?: string | null;
  style?: "solid" | "secondary" | "outline" | null;
};

type HeroBlockProps = {
  eyebrow?: string | null;
  heading: string;
  subheading?: string | null;
  backgroundImage?: MediaValue;
  mobileBackgroundImage?: MediaValue;
  height?: "compact" | "standard" | "large" | "screen" | null;
  contentAlignment?: "left" | "center" | "right" | null;
  contentWidth?: "compact" | "standard" | "wide" | null;
  theme?: "primary" | "dark" | "light" | null;
  overlayOpacity?: "low" | "medium" | "high" | null;
  imageFocus?: "center" | "top" | "bottom" | "left" | "right" | null;
  showBreadcrumb?: boolean | null;
  buttons?: HeroButton[] | null;
  section?: SectionOptions | null;
  pageTitle?: string;
  pageSlug?: string;
  isHome?: boolean;
};

const heightClasses = {
  compact: "min-h-[320px] py-20 md:min-h-[360px]",
  standard: "min-h-[420px] py-24 md:min-h-[480px] md:py-28",
  large: "min-h-[520px] py-28 md:min-h-[620px] md:py-32",
  screen: "min-h-[70vh] py-28 md:min-h-[78vh] md:py-36",
} as const;

const widthClasses = {
  compact: "max-w-2xl",
  standard: "max-w-4xl",
  wide: "max-w-6xl",
} as const;

const alignmentClasses = {
  left: "items-start text-left",
  center: "items-center text-center",
  right: "items-end text-right",
} as const;

const themeClasses = {
  primary: {
    background: "bg-primary",
    text: "text-primary-foreground",
    muted: "text-primary-foreground/80",
    overlay: "bg-primary",
    breadcrumb: "text-primary-foreground/75",
  },
  dark: {
    background: "bg-surface-inverse",
    text: "text-surface-inverse-foreground",
    muted: "text-surface-inverse-foreground/75",
    overlay: "bg-surface-inverse",
    breadcrumb: "text-surface-inverse-foreground/70",
  },
  light: {
    background: "bg-background",
    text: "text-text-main",
    muted: "text-text-muted",
    overlay: "bg-background",
    breadcrumb: "text-text-muted",
  },
} as const;

const overlayClasses = {
  low: "opacity-30",
  medium: "opacity-50",
  high: "opacity-70",
} as const;

const focusClasses = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
} as const;

function getMedia(value: MediaValue) {
  return typeof value === "object" && value ? value : null;
}

function getButtonPresentation(
  style: HeroButton["style"],
  theme: NonNullable<HeroBlockProps["theme"]>,
) {
  const resolvedStyle = style || "solid";
  const lightTheme = theme === "light";

  if (resolvedStyle === "outline") {
    return {
      variant: "outline" as const,
      className: lightTheme
        ? "border-text-main/20 bg-background/70 text-text-main hover:bg-surface-muted"
        : "border-current/30 bg-transparent text-current hover:bg-primary-foreground/10",
    };
  }

  if (resolvedStyle === "secondary") {
    return {
      variant: "outline" as const,
      className: lightTheme
        ? "border-primary/15 bg-primary/10 text-primary hover:bg-primary/15"
        : "border-primary-foreground/15 bg-primary-foreground/10 text-current hover:bg-primary-foreground/15",
    };
  }

  return {
    variant: lightTheme ? ("default" as const) : ("secondary" as const),
    className: lightTheme
      ? ""
      : "bg-background text-primary hover:bg-surface-muted",
  };
}

export function HeroBlock({
  eyebrow,
  heading,
  subheading,
  backgroundImage,
  mobileBackgroundImage,
  height = "standard",
  contentAlignment = "center",
  contentWidth = "standard",
  theme = "primary",
  overlayOpacity = "medium",
  imageFocus = "center",
  showBreadcrumb,
  buttons,
  section,
  pageTitle,
  pageSlug,
  isHome,
}: HeroBlockProps) {
  const desktopMedia = getMedia(backgroundImage);
  const mobileMedia = getMedia(mobileBackgroundImage);
  const desktopUrl = desktopMedia?.url || null;
  const mobileUrl = mobileMedia?.url || desktopUrl;
  const resolvedTheme = theme || "primary";
  const resolvedHeight = height || "standard";
  const resolvedAlignment = contentAlignment || "center";
  const resolvedWidth = contentWidth || "standard";
  const resolvedOverlay = overlayOpacity || "medium";
  const resolvedFocus = imageFocus || "center";
  const classes = themeClasses[resolvedTheme];
  const hasImage = Boolean(desktopUrl || mobileUrl);

  return (
    <SectionShell
      section={section}
      container={false}
      defaultBackground="transparent"
      defaultSpacing="none"
      defaultContentWidth="full"
      className={cn(classes.background, classes.text)}
    >
      <div
        className={cn(
          "relative flex w-full items-center overflow-hidden",
          heightClasses[resolvedHeight],
        )}
      >
        {mobileUrl && (
          <Image
            src={mobileUrl}
            alt={mobileMedia?.alt || desktopMedia?.alt || heading}
            fill
            className={cn(
              "object-cover md:hidden",
              focusClasses[resolvedFocus],
            )}
            sizes="100vw"
            quality={76}
            preload
          />
        )}

        {desktopUrl && (
          <Image
            src={desktopUrl}
            alt={desktopMedia?.alt || heading}
            fill
            className={cn(
              "hidden object-cover md:block",
              focusClasses[resolvedFocus],
            )}
            sizes="100vw"
            quality={78}
            preload
          />
        )}

        {hasImage && (
          <div
            className={cn(
              "absolute inset-0",
              classes.overlay,
              overlayClasses[resolvedOverlay],
            )}
            aria-hidden="true"
          />
        )}

        <div className="container relative z-10 mx-auto max-w-7xl px-4">
          <div
            className={cn(
              "flex flex-col",
              alignmentClasses[resolvedAlignment],
              widthClasses[resolvedWidth],
              resolvedAlignment === "center" && "mx-auto",
              resolvedAlignment === "right" && "ml-auto",
            )}
          >
            {showBreadcrumb && !isHome && pageTitle && (
              <nav
                className={cn(
                  "mb-7 flex max-w-full items-center gap-2 overflow-x-auto whitespace-nowrap text-sm font-medium",
                  classes.breadcrumb,
                )}
                aria-label="Sayfa yolu"
              >
                <Link
                  href="/"
                  className="flex items-center gap-1.5 transition-opacity hover:opacity-100"
                >
                  <Home className="h-4 w-4" />
                  Anasayfa
                </Link>
                <ChevronRight className="h-4 w-4 shrink-0" />
                <span className="truncate font-bold" aria-current="page">
                  {pageTitle || pageSlug}
                </span>
              </nav>
            )}

            {eyebrow && (
              <div className="mb-5 inline-flex rounded-full border border-current/15 bg-background/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] backdrop-blur-sm">
                {eyebrow}
              </div>
            )}

            <h1 className="text-4xl font-black leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              {heading}
            </h1>

            {subheading && (
              <p
                className={cn(
                  "mt-6 max-w-3xl text-lg leading-relaxed md:text-xl",
                  classes.muted,
                )}
              >
                {subheading}
              </p>
            )}

            {buttons && buttons.length > 0 && (
              <div
                className={cn(
                  "mt-9 flex flex-wrap gap-4",
                  resolvedAlignment === "center" && "justify-center",
                  resolvedAlignment === "right" && "justify-end",
                )}
              >
                {buttons.map((button, index) => {
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
                        "h-12 rounded-[var(--radius-2xl)] px-7 font-bold backdrop-blur-sm",
                        presentation.className,
                      )}
                      asChild
                    >
                      <Link href={button.link}>{button.label}</Link>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
