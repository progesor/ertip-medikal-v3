import type { ElementType, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Cpu,
  Globe,
  Headset,
  Heart,
  Package,
  Settings,
  Shield,
  Star,
  Truck,
  Wrench,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import {
  SectionShell,
  type SectionOptions,
} from "@/components/blocks/SectionShell";

const iconMap: Record<string, ElementType> = {
  star: Star,
  shield: Shield,
  cpu: Cpu,
  globe: Globe,
  heart: Heart,
  settings: Settings,
  check: CheckCircle2,
  award: Award,
  wrench: Wrench,
  package: Package,
  truck: Truck,
  headset: Headset,
};

type MediaValue =
  | number
  | string
  | {
      url?: string | null;
      alt?: string | null;
    }
  | null;

type FeatureItem = {
  icon?: string | null;
  accent?: "primary" | "blue" | "teal" | "amber" | "violet" | "rose" | null;
  image?: MediaValue;
  featureTitle?: string | null;
  featureDescription?: string | null;
  linkText?: string | null;
  link?: string | null;
};

type FeaturesLayoutMode = "auto" | "grid" | "featured" | "compact";
type FeaturesAlignment = "left" | "center";
type FeaturesColumns = "auto" | "two" | "three" | "four";
type CardStyle = "elevated" | "outlined" | "soft" | "minimal";
type IconStyle = "boxed" | "circle" | "plain";

const cardStyleClasses: Record<CardStyle, string> = {
  elevated:
    "border border-border bg-surface shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-surface-inverse/5",
  outlined:
    "border-2 border-border bg-transparent shadow-none hover:-translate-y-1 hover:border-primary/35 hover:bg-surface/60",
  soft:
    "border border-primary/10 bg-primary/5 shadow-none hover:-translate-y-1 hover:bg-primary/10",
  minimal:
    "border-0 bg-transparent shadow-none hover:bg-surface/50 hover:-translate-y-0.5",
};

const accentClasses = {
  primary: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
  blue: "bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
  teal: "bg-teal-500/10 text-teal-600 group-hover:bg-teal-600 group-hover:text-white",
  amber: "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
  violet:
    "bg-violet-500/10 text-violet-600 group-hover:bg-violet-600 group-hover:text-white",
  rose: "bg-rose-500/10 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
} as const;

function resolveLayout(mode: FeaturesLayoutMode | undefined, count: number) {
  if (mode && mode !== "auto") return mode;
  if (count === 1) return "featured";
  if (count >= 5) return "compact";
  return "grid";
}

function getGridClass(
  count: number,
  layout: FeaturesLayoutMode,
  columns: FeaturesColumns,
) {
  if (layout === "featured") return "mx-auto max-w-3xl grid-cols-1";

  if (columns === "two") return "grid-cols-1 md:grid-cols-2";
  if (columns === "three") return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  if (columns === "four") {
    return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
  }

  if (layout === "compact" && count >= 5) {
    return "[grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]";
  }
  if (count === 2) return "grid-cols-1 md:grid-cols-2";
  if (count === 3) return "grid-cols-1 md:grid-cols-3";
  if (count === 4) return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
  return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
}

function FeatureCard({
  feature,
  featured,
  compact,
  cardStyle,
  iconStyle,
}: {
  feature: FeatureItem;
  featured: boolean;
  compact: boolean;
  cardStyle: CardStyle;
  iconStyle: IconStyle;
}) {
  const IconComponent = iconMap[feature.icon || ""] || Star;
  const accent = feature.accent || "primary";
  const media = typeof feature.image === "object" && feature.image ? feature.image : null;
  const imageUrl = media?.url || null;

  const iconShape =
    iconStyle === "circle"
      ? "rounded-full"
      : iconStyle === "plain"
        ? "rounded-none bg-transparent p-0 group-hover:bg-transparent"
        : "rounded-2xl";

  const card = (
    <Card
      className={cn(
        "group h-full overflow-hidden transition-all duration-300",
        featured ? "rounded-[var(--radius-3xl)]" : "rounded-3xl",
        cardStyleClasses[cardStyle],
      )}
    >
      {imageUrl && (
        <div className="relative aspect-[16/9] overflow-hidden bg-surface-muted">
          <Image
            src={imageUrl}
            alt={media?.alt || feature.featureTitle || "Özellik görseli"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            quality={78}
          />
        </div>
      )}

      <CardHeader
        className={cn(
          featured ? "p-8 text-center md:p-10" : compact ? "p-6" : "p-7",
          imageUrl && "pt-7",
        )}
      >
        <div
          className={cn(
            "mb-5 flex items-center justify-center transition-colors duration-300",
            featured ? "mx-auto h-16 w-16" : "h-14 w-14",
            iconShape,
            iconStyle === "plain" ? "text-primary" : accentClasses[accent],
          )}
        >
          <IconComponent className={featured ? "h-8 w-8" : "h-7 w-7"} />
        </div>

        <CardTitle
          className={cn(
            "font-bold text-text-main",
            featured ? "text-2xl font-black md:text-3xl" : "text-xl",
          )}
        >
          {feature.featureTitle}
        </CardTitle>
      </CardHeader>

      {(feature.featureDescription || (feature.link && feature.linkText)) && (
        <CardContent
          className={cn(
            featured
              ? "px-8 pb-10 text-center md:px-12"
              : compact
                ? "px-6 pb-7"
                : "px-7 pb-8",
          )}
        >
          {feature.featureDescription && (
            <p
              className={cn(
                "leading-relaxed text-text-muted",
                featured && "mx-auto max-w-2xl text-lg",
              )}
            >
              {feature.featureDescription}
            </p>
          )}

          {feature.link && feature.linkText && (
            <span className="mt-5 inline-flex items-center gap-2 font-bold text-primary">
              {feature.linkText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          )}
        </CardContent>
      )}
    </Card>
  );

  if (!feature.link) return card;

  return (
    <Link
      href={feature.link}
      className="block h-full rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
      aria-label={feature.linkText || feature.featureTitle || "Detaylı bilgi"}
    >
      {card as ReactNode}
    </Link>
  );
}

export function FeaturesBlock({
  eyebrow,
  title,
  subtitle,
  features,
  layoutMode = "auto",
  columns = "auto",
  alignment = "center",
  cardStyle = "elevated",
  iconStyle = "boxed",
  section,
}: {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  features?: FeatureItem[] | null;
  layoutMode?: FeaturesLayoutMode | null;
  columns?: FeaturesColumns | null;
  alignment?: FeaturesAlignment | null;
  cardStyle?: CardStyle | null;
  iconStyle?: IconStyle | null;
  section?: SectionOptions | null;
}) {
  if (!features || features.length === 0) return null;

  const resolvedLayout = resolveLayout(layoutMode || "auto", features.length);
  const resolvedColumns = columns || "auto";
  const resolvedCardStyle = cardStyle || "elevated";
  const resolvedIconStyle = iconStyle || "boxed";
  const inverse = section?.background === "dark" || section?.background === "primary";

  return (
    <SectionShell
      section={section}
      defaultBackground="muted"
      defaultSpacing="standard"
      defaultContentWidth="wide"
    >
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        alignment={alignment || "center"}
        inverse={inverse}
        className="mb-12 md:mb-16"
      />

      <div
        className={cn(
          "grid gap-6 md:gap-8",
          getGridClass(features.length, resolvedLayout, resolvedColumns),
        )}
      >
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            feature={feature}
            featured={resolvedLayout === "featured"}
            compact={resolvedLayout === "compact"}
            cardStyle={resolvedCardStyle}
            iconStyle={resolvedIconStyle}
          />
        ))}
      </div>
    </SectionShell>
  );
}
