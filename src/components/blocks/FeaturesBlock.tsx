import React from "react";
import { Cpu, Globe, Heart, Settings, Shield, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const iconMap: Record<string, React.ElementType> = {
  star: Star,
  shield: Shield,
  cpu: Cpu,
  globe: Globe,
  heart: Heart,
  settings: Settings,
};

type FeatureItem = {
  icon?: string;
  featureTitle?: string;
  featureDescription?: string;
};

type FeaturesLayoutMode = "auto" | "grid" | "featured" | "compact";
type FeaturesAlignment = "left" | "center";

function resolveLayout(mode: FeaturesLayoutMode | undefined, count: number) {
  if (mode && mode !== "auto") return mode;
  if (count === 1) return "featured";
  if (count >= 5) return "compact";
  return "grid";
}

function getGridClass(count: number, layout: FeaturesLayoutMode) {
  if (layout === "featured") return "mx-auto max-w-3xl grid-cols-1";
  if (layout === "compact" && count >= 5) {
    return "mx-auto max-w-7xl [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]";
  }
  if (count === 2) return "mx-auto max-w-5xl grid-cols-1 md:grid-cols-2";
  if (count === 3) return "mx-auto max-w-6xl grid-cols-1 md:grid-cols-3";
  if (count === 4) return "mx-auto max-w-7xl grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
  return "mx-auto max-w-7xl grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
}

function FeatureCard({ feature, featured = false, compact = false }: { feature: FeatureItem; featured?: boolean; compact?: boolean }) {
  const IconComponent = iconMap[feature.icon || ""] || Star;

  return (
    <Card
      className={`group border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-surface-inverse/5 ${
        featured ? "rounded-[var(--radius-3xl)]" : "rounded-3xl"
      }`}
    >
      <CardHeader className={featured ? "p-8 text-center md:p-10" : compact ? "p-6" : "p-7"}>
        <div
          className={`mb-5 flex items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground ${
            featured ? "mx-auto h-16 w-16" : "h-14 w-14"
          }`}
        >
          <IconComponent className={featured ? "h-8 w-8" : "h-7 w-7"} />
        </div>
        <CardTitle className={featured ? "text-2xl font-black text-text-main md:text-3xl" : "text-xl font-bold text-text-main"}>
          {feature.featureTitle}
        </CardTitle>
      </CardHeader>
      {feature.featureDescription && (
        <CardContent className={featured ? "px-8 pb-10 text-center md:px-12" : compact ? "px-6 pb-7" : "px-7 pb-8"}>
          <p className={featured ? "mx-auto max-w-2xl text-lg leading-relaxed text-text-muted" : "leading-relaxed text-text-muted"}>
            {feature.featureDescription}
          </p>
        </CardContent>
      )}
    </Card>
  );
}

export function FeaturesBlock({
  title,
  subtitle,
  features,
  layoutMode = "auto",
  alignment = "center",
}: {
  title?: string;
  subtitle?: string;
  features?: FeatureItem[];
  layoutMode?: FeaturesLayoutMode;
  alignment?: FeaturesAlignment;
}) {
  if (!features || features.length === 0) return null;

  const resolvedLayout = resolveLayout(layoutMode, features.length);
  const isCentered = alignment !== "left";

  return (
    <section className="border-y border-border bg-surface-muted py-20">
      <div className="container mx-auto max-w-7xl px-4">
        {(title || subtitle) && (
          <div className={`mb-16 space-y-4 ${isCentered ? "mx-auto max-w-3xl text-center" : "max-w-3xl text-left"}`}>
            {title && (
              <h2 className="text-3xl font-extrabold text-text-main md:text-4xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg leading-relaxed text-text-muted">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className={`grid gap-8 ${getGridClass(features.length, resolvedLayout)}`}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              featured={resolvedLayout === "featured"}
              compact={resolvedLayout === "compact"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
