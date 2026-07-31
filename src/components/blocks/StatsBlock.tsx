import type { ElementType } from "react";
import {
  Award,
  CalendarDays,
  Globe2,
  Package,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedStatValue } from "@/components/blocks/AnimatedStatValue";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import {
  SectionShell,
  type SectionOptions,
} from "@/components/blocks/SectionShell";

type StatIcon =
  | "none"
  | "calendar"
  | "globe"
  | "package"
  | "users"
  | "award"
  | "shield"
  | "truck";

type StatItem = {
  icon?: StatIcon | null;
  prefix?: string | null;
  value?: string | null;
  suffix?: string | null;
  label?: string | null;
  note?: string | null;
};

type StatsLayout = "cards" | "band" | "minimal";
type StatsColumns = "auto" | "two" | "three" | "four";

const iconMap: Partial<Record<StatIcon, ElementType>> = {
  calendar: CalendarDays,
  globe: Globe2,
  package: Package,
  users: Users,
  award: Award,
  shield: ShieldCheck,
  truck: Truck,
};

function getStatsGridClass(count: number, columns: StatsColumns) {
  if (columns === "two") return "grid-cols-1 sm:grid-cols-2";
  if (columns === "three") return "grid-cols-1 md:grid-cols-3";
  if (columns === "four") return "grid-cols-2 lg:grid-cols-4";

  if (count <= 1) return "mx-auto max-w-3xl grid-cols-1";
  if (count === 2) return "mx-auto max-w-4xl grid-cols-1 sm:grid-cols-2";
  if (count === 3) return "mx-auto max-w-5xl grid-cols-1 md:grid-cols-3";
  if (count === 4) return "grid-cols-2 lg:grid-cols-4";
  return "[grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]";
}

function StatContent({
  stat,
  animateValues,
  featured,
  inverse,
  layout,
}: {
  stat: StatItem;
  animateValues: boolean;
  featured: boolean;
  inverse: boolean;
  layout: StatsLayout;
}) {
  const Icon = stat.icon && stat.icon !== "none" ? iconMap[stat.icon] : null;

  return (
    <>
      {Icon && (
        <div
          className={cn(
            "mb-4 flex h-11 w-11 items-center justify-center rounded-2xl",
            layout === "band" && "mx-auto",
            inverse
              ? "bg-current/10 text-current"
              : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      )}

      <AnimatedStatValue
        value={stat.value || "0"}
        prefix={stat.prefix}
        suffix={stat.suffix}
        enabled={animateValues}
        className={cn(
          "block font-black leading-none tracking-tight",
          featured ? "text-5xl md:text-7xl" : "text-4xl md:text-5xl",
        )}
      />

      {stat.label && (
        <div
          className={cn(
            "mt-3 text-sm font-bold uppercase tracking-[0.12em]",
            inverse ? "text-current opacity-80" : "text-text-main",
            featured && "text-base",
          )}
        >
          {stat.label}
        </div>
      )}

      {stat.note && (
        <p
          className={cn(
            "mt-3 text-sm leading-6",
            inverse ? "text-current opacity-65" : "text-text-muted",
          )}
        >
          {stat.note}
        </p>
      )}
    </>
  );
}

export function StatsBlock({
  eyebrow,
  title,
  subtitle,
  stats,
  layoutMode = "cards",
  columns = "auto",
  alignment = "center",
  animateValues = false,
  showDividers = true,
  section,
}: {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  stats?: StatItem[] | null;
  layoutMode?: StatsLayout | null;
  columns?: StatsColumns | null;
  alignment?: "left" | "center" | null;
  animateValues?: boolean | null;
  showDividers?: boolean | null;
  section?: SectionOptions | null;
}) {
  if (!stats || stats.length === 0) return null;

  const resolvedLayout = layoutMode || "cards";
  const resolvedColumns = columns || "auto";
  const background = section?.background || "primary";
  const inverse = background === "primary" || background === "dark";
  const gridClass = getStatsGridClass(stats.length, resolvedColumns);
  const featured = stats.length === 1;

  return (
    <SectionShell
      section={section}
      defaultBackground="primary"
      defaultSpacing="compact"
      defaultContentWidth="wide"
    >
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        alignment={alignment || "center"}
        inverse={inverse}
        className={cn((eyebrow || title || subtitle) && "mb-10 md:mb-12")}
      />

      {resolvedLayout === "band" && (
        <div
          className={cn(
            "grid overflow-hidden rounded-[var(--radius-2xl)] border",
            gridClass,
            inverse
              ? "border-current/15 bg-current/5"
              : "border-border bg-surface shadow-sm",
          )}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                "px-5 py-7 text-center md:px-7 md:py-9",
                showDividers &&
                  index > 0 &&
                  (inverse
                    ? "border-t border-current/15 md:border-l md:border-t-0"
                    : "border-t border-border md:border-l md:border-t-0"),
              )}
            >
              <StatContent
                stat={stat}
                animateValues={Boolean(animateValues)}
                featured={featured}
                inverse={inverse}
                layout={resolvedLayout}
              />
            </div>
          ))}
        </div>
      )}

      {resolvedLayout === "cards" && (
        <div className={cn("grid gap-5 md:gap-6", gridClass)}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                "rounded-[var(--radius-2xl)] border px-5 py-7 text-center shadow-sm transition-transform duration-300 hover:-translate-y-1 md:px-7 md:py-9",
                inverse
                  ? "border-current/15 bg-current/5 shadow-surface-inverse/10"
                  : "border-border bg-surface shadow-surface-inverse/5",
              )}
            >
              <div className="flex flex-col items-center">
                <StatContent
                  stat={stat}
                  animateValues={Boolean(animateValues)}
                  featured={featured}
                  inverse={inverse}
                  layout={resolvedLayout}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {resolvedLayout === "minimal" && (
        <div className={cn("grid gap-y-8", gridClass)}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                "px-4 text-center",
                showDividers &&
                  index > 0 &&
                  (inverse
                    ? "border-t border-current/15 pt-8 md:border-l md:border-t-0 md:pt-0"
                    : "border-t border-border pt-8 md:border-l md:border-t-0 md:pt-0"),
              )}
            >
              <div className="flex flex-col items-center">
                <StatContent
                  stat={stat}
                  animateValues={Boolean(animateValues)}
                  featured={featured}
                  inverse={inverse}
                  layout={resolvedLayout}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
