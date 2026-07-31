import type { ElementType } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Headset,
  MessageSquare,
  Package,
  Search,
  Settings,
  Truck,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import {
  SectionShell,
  type SectionOptions,
} from "@/components/blocks/SectionShell";

type ProcessLayout = "horizontal" | "timeline" | "cards";
type ConnectorStyle = "arrows" | "line" | "none";

type MediaValue =
  | number
  | string
  | {
      url?: string | null;
      alt?: string | null;
    }
  | null;

type ProcessStep = {
  stepNumber?: string | null;
  icon?: string | null;
  image?: MediaValue;
  title?: string | null;
  description?: string | null;
  linkText?: string | null;
  link?: string | null;
};

const iconMap: Record<string, ElementType> = {
  search: Search,
  message: MessageSquare,
  settings: Settings,
  package: Package,
  wrench: Wrench,
  truck: Truck,
  check: CheckCircle2,
  headset: Headset,
};

function getStepNumber(step: ProcessStep, index: number) {
  return step.stepNumber?.trim() || String(index + 1).padStart(2, "0");
}

function StepMarker({
  step,
  index,
  inverse,
  className,
}: {
  step: ProcessStep;
  index: number;
  inverse: boolean;
  className?: string;
}) {
  const Icon = step.icon && step.icon !== "none" ? iconMap[step.icon] : null;

  return (
    <div
      className={cn(
        "relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-4 text-xl font-black shadow-lg transition-transform duration-300 group-hover:scale-105 md:h-20 md:w-20 md:rounded-3xl md:text-2xl",
        inverse
          ? "border-current/15 bg-current/10 text-current shadow-surface-inverse/15"
          : "border-background bg-primary text-primary-foreground shadow-primary/20",
        className,
      )}
    >
      {Icon ? <Icon className="h-7 w-7 md:h-8 md:w-8" /> : getStepNumber(step, index)}
    </div>
  );
}

function StepImage({ step }: { step: ProcessStep }) {
  const media = typeof step.image === "object" && step.image ? step.image : null;
  if (!media?.url) return null;

  return (
    <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-2xl bg-surface-muted">
      <Image
        src={media.url}
        alt={media.alt || step.title || "Süreç adımı"}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        quality={78}
      />
    </div>
  );
}

function StepCopy({
  step,
  inverse,
  align = "center",
}: {
  step: ProcessStep;
  inverse: boolean;
  align?: "left" | "center" | "right";
}) {
  return (
    <div
      className={cn(
        align === "center" && "text-center",
        align === "right" && "text-right",
      )}
    >
      {step.title && (
        <h3
          className={cn(
            "text-xl font-bold",
            inverse ? "text-current" : "text-text-main",
          )}
        >
          {step.title}
        </h3>
      )}

      {step.description && (
        <p
          className={cn(
            "mt-3 text-sm leading-7",
            inverse ? "text-current opacity-70" : "text-text-muted",
          )}
        >
          {step.description}
        </p>
      )}

      {step.link && step.linkText && (
        <Link
          href={step.link}
          className={cn(
            "mt-5 inline-flex items-center gap-2 font-bold transition-colors",
            inverse
              ? "text-current underline-offset-4 hover:underline"
              : "text-primary hover:text-primary/80",
          )}
        >
          {step.linkText}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function HorizontalProcess({
  steps,
  connectorStyle,
  animateConnectors,
  inverse,
}: {
  steps: ProcessStep[];
  connectorStyle: ConnectorStyle;
  animateConnectors: boolean;
  inverse: boolean;
}) {
  if (steps.length > 5) {
    return (
      <CardsProcess steps={steps} inverse={inverse} />
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-4">
      {steps.map((step, index) => (
        <div key={index} className="contents">
          <article className="group w-full max-w-sm flex-1">
            <div className="flex flex-col items-center">
              <StepMarker step={step} index={index} inverse={inverse} />
              <div className="mt-6 w-full">
                <StepImage step={step} />
                <StepCopy step={step} inverse={inverse} />
              </div>
            </div>
          </article>

          {connectorStyle !== "none" && index < steps.length - 1 && (
            <div
              className={cn(
                "flex shrink-0 items-center justify-center py-1 lg:pt-5",
                animateConnectors && "motion-safe:animate-pulse",
              )}
              aria-hidden="true"
            >
              {connectorStyle === "arrows" ? (
                <>
                  <ChevronRight className="hidden h-7 w-7 opacity-40 lg:block" />
                  <ChevronDown className="h-7 w-7 opacity-40 lg:hidden" />
                </>
              ) : (
                <>
                  <div className="hidden h-px w-10 bg-current opacity-25 lg:block" />
                  <div className="h-8 w-px bg-current opacity-25 lg:hidden" />
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CardsProcess({
  steps,
  inverse,
}: {
  steps: ProcessStep[];
  inverse: boolean;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {steps.map((step, index) => (
        <article
          key={index}
          className={cn(
            "group rounded-[var(--radius-2xl)] border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
            inverse
              ? "border-current/15 bg-current/5 shadow-surface-inverse/10"
              : "border-border bg-surface shadow-surface-inverse/5",
          )}
        >
          <StepImage step={step} />
          <StepMarker step={step} index={index} inverse={inverse} className="mb-6" />
          <StepCopy step={step} inverse={inverse} align="left" />
        </article>
      ))}
    </div>
  );
}

function TimelineProcess({
  steps,
  connectorStyle,
  inverse,
}: {
  steps: ProcessStep[];
  connectorStyle: ConnectorStyle;
  inverse: boolean;
}) {
  return (
    <div className="relative mx-auto max-w-5xl">
      {connectorStyle !== "none" && (
        <div
          className={cn(
            "absolute bottom-8 left-8 top-8 w-px md:left-1/2",
            inverse ? "bg-current/20" : "bg-border",
          )}
          aria-hidden="true"
        />
      )}

      <div className="space-y-10 md:space-y-14">
        {steps.map((step, index) => {
          const right = index % 2 === 1;

          return (
            <article
              key={index}
              className="group relative min-h-20 pl-24 md:grid md:grid-cols-2 md:pl-0"
            >
              <StepMarker
                step={step}
                index={index}
                inverse={inverse}
                className="absolute left-0 top-0 md:left-1/2 md:-translate-x-1/2"
              />

              <div
                className={cn(
                  "rounded-[var(--radius-2xl)] border p-6 shadow-sm md:p-8",
                  right
                    ? "md:col-start-2 md:ml-12"
                    : "md:col-start-1 md:mr-12",
                  inverse
                    ? "border-current/15 bg-current/5"
                    : "border-border bg-surface",
                )}
              >
                <StepImage step={step} />
                <StepCopy
                  step={step}
                  inverse={inverse}
                  align={right ? "left" : "left"}
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function ProcessBlock({
  eyebrow,
  title,
  subtitle,
  steps,
  layoutMode = "horizontal",
  alignment = "center",
  connectorStyle,
  showArrows = true,
  animateConnectors = false,
  section,
}: {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  steps?: ProcessStep[] | null;
  layoutMode?: ProcessLayout | null;
  alignment?: "left" | "center" | null;
  connectorStyle?: ConnectorStyle | null;
  showArrows?: boolean | null;
  animateConnectors?: boolean | null;
  section?: SectionOptions | null;
}) {
  if (!steps || steps.length === 0) return null;

  const layout = layoutMode || "horizontal";
  const resolvedConnector = connectorStyle || (showArrows === false ? "none" : "arrows");
  const background = section?.background || "light";
  const inverse = background === "primary" || background === "dark";

  return (
    <SectionShell
      section={section}
      defaultBackground="light"
      defaultSpacing="large"
      defaultContentWidth="wide"
    >
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        alignment={alignment || "center"}
        inverse={inverse}
        className="mb-14 md:mb-20"
      />

      {layout === "horizontal" && (
        <HorizontalProcess
          steps={steps}
          connectorStyle={resolvedConnector}
          animateConnectors={Boolean(animateConnectors)}
          inverse={inverse}
        />
      )}

      {layout === "timeline" && (
        <TimelineProcess
          steps={steps}
          connectorStyle={resolvedConnector}
          inverse={inverse}
        />
      )}

      {layout === "cards" && <CardsProcess steps={steps} inverse={inverse} />}
    </SectionShell>
  );
}
