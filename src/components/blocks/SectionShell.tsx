import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SectionOptions = {
  anchor?: string | null;
  background?: "transparent" | "light" | "muted" | "dark" | "primary" | null;
  spacing?: "none" | "compact" | "standard" | "large" | null;
  contentWidth?: "compact" | "standard" | "wide" | "full" | null;
  dividerTop?: boolean | null;
  dividerBottom?: boolean | null;
  decoration?: "none" | "glow" | "grid" | null;
};

type SectionShellProps = {
  children: ReactNode;
  section?: SectionOptions | null;
  className?: string;
  contentClassName?: string;
  container?: boolean;
  defaultBackground?: NonNullable<SectionOptions["background"]>;
  defaultSpacing?: NonNullable<SectionOptions["spacing"]>;
  defaultContentWidth?: NonNullable<SectionOptions["contentWidth"]>;
};

const backgroundClasses = {
  transparent: "bg-transparent text-text-main",
  light: "bg-background text-text-main",
  muted: "bg-surface-muted text-text-main",
  dark: "bg-surface-inverse text-surface-inverse-foreground",
  primary: "bg-primary text-primary-foreground",
} as const;

const spacingClasses = {
  none: "py-0",
  compact: "py-10 md:py-12",
  standard: "py-16 md:py-20",
  large: "py-20 md:py-28",
} as const;

const widthClasses = {
  compact: "max-w-3xl",
  standard: "max-w-5xl",
  wide: "max-w-7xl",
  full: "max-w-none",
} as const;

export function SectionShell({
  children,
  section,
  className,
  contentClassName,
  container = true,
  defaultBackground = "transparent",
  defaultSpacing = "standard",
  defaultContentWidth = "wide",
}: SectionShellProps) {
  const background = section?.background || defaultBackground;
  const spacing = section?.spacing || defaultSpacing;
  const contentWidth = section?.contentWidth || defaultContentWidth;
  const decoration = section?.decoration || "none";
  const anchor = section?.anchor?.trim() || undefined;

  return (
    <section
      id={anchor}
      className={cn(
        "relative isolate overflow-hidden",
        backgroundClasses[background],
        spacingClasses[spacing],
        section?.dividerTop && "border-t border-border",
        section?.dividerBottom && "border-b border-border",
        className,
      )}
    >
      {decoration === "glow" && (
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>
      )}

      {decoration === "grid" && (
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:32px_32px]"
          aria-hidden="true"
        />
      )}

      {container ? (
        <div
          className={cn(
            "container mx-auto px-4",
            widthClasses[contentWidth],
            contentClassName,
          )}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
