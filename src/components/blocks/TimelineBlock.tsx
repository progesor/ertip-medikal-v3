import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import {
  SectionShell,
  type SectionOptions,
} from "@/components/blocks/SectionShell";

type MediaValue =
  | number
  | string
  | {
      url?: string | null;
      alt?: string | null;
    }
  | null;

type TimelineItem = {
  dateLabel?: string | null;
  itemTitle?: string | null;
  description?: string | null;
  image?: MediaValue;
  highlight?: boolean | null;
  linkText?: string | null;
  link?: string | null;
};

type TimelineBlockProps = {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  layoutMode?: "alternating" | "vertical" | "cards" | null;
  alignment?: "left" | "center" | null;
  cardStyle?: "elevated" | "outlined" | "minimal" | null;
  items?: TimelineItem[] | null;
  section?: SectionOptions | null;
};

function getMedia(value: MediaValue) {
  return typeof value === "object" && value?.url ? value : null;
}

function TimelineCard({
  item,
  cardStyle,
  compact = false,
}: {
  item: TimelineItem;
  cardStyle: NonNullable<TimelineBlockProps["cardStyle"]>;
  compact?: boolean;
}) {
  const media = getMedia(item.image);

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-2xl)] border transition-all duration-300",
        cardStyle === "elevated" &&
          "border-border/70 bg-surface shadow-lg shadow-surface-inverse/5 hover:-translate-y-1 hover:shadow-xl",
        cardStyle === "outlined" && "border-border bg-transparent",
        cardStyle === "minimal" && "border-transparent bg-transparent",
        item.highlight && "border-primary/35 ring-1 ring-primary/20",
      )}
    >
      {media && (
        <div className={cn("relative overflow-hidden", compact ? "aspect-[16/9]" : "aspect-[4/3]") }>
          <Image
            src={media.url!}
            alt={media.alt || item.itemTitle || "Zaman çizgisi görseli"}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}

      <div className={cn(compact ? "p-5" : "p-6 md:p-8") }>
        {item.dateLabel && (
          <div className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-black tracking-wide text-primary">
            {item.dateLabel}
          </div>
        )}
        {item.itemTitle && (
          <h3 className="text-xl font-black leading-tight text-current md:text-2xl">
            {item.itemTitle}
          </h3>
        )}
        {item.description && (
          <p className="mt-4 leading-7 text-current opacity-70">
            {item.description}
          </p>
        )}
        {item.link && item.linkText && (
          <Link
            href={item.link}
            className="mt-5 inline-flex items-center gap-2 font-bold text-primary transition-colors hover:text-primary/75"
          >
            {item.linkText}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </article>
  );
}

export function TimelineBlock({
  eyebrow,
  title,
  subtitle,
  layoutMode = "alternating",
  alignment = "center",
  cardStyle = "elevated",
  items,
  section,
}: TimelineBlockProps) {
  if (!items?.length) return null;

  const resolvedLayout = layoutMode || "alternating";
  const resolvedCardStyle = cardStyle || "elevated";
  const inverse = section?.background === "dark" || section?.background === "primary";

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
        alignment={alignment}
        inverse={inverse}
        className="mb-14 md:mb-20"
      />

      {resolvedLayout === "cards" && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <TimelineCard
              key={`${item.dateLabel || "item"}-${index}`}
              item={item}
              cardStyle={resolvedCardStyle}
              compact
            />
          ))}
        </div>
      )}

      {resolvedLayout === "vertical" && (
        <div className="relative mx-auto max-w-4xl space-y-8 before:absolute before:bottom-0 before:left-[15px] before:top-0 before:w-px before:bg-border md:before:left-[19px]">
          {items.map((item, index) => (
            <div key={`${item.dateLabel || "item"}-${index}`} className="relative pl-12 md:pl-16">
              <div className={cn(
                "absolute left-0 top-7 h-8 w-8 rounded-full border-4 border-background bg-primary shadow-md md:h-10 md:w-10",
                item.highlight && "ring-4 ring-primary/15",
              )} />
              <TimelineCard item={item} cardStyle={resolvedCardStyle} compact />
            </div>
          ))}
        </div>
      )}

      {resolvedLayout === "alternating" && (
        <div className="relative space-y-10 before:absolute before:bottom-0 before:left-[15px] before:top-0 before:w-px before:bg-border md:before:left-1/2 md:before:-translate-x-1/2">
          {items.map((item, index) => {
            const right = index % 2 === 1;
            return (
              <div
                key={`${item.dateLabel || "item"}-${index}`}
                className="relative grid gap-8 pl-12 md:grid-cols-2 md:pl-0"
              >
                <div className={cn("md:pr-12", right && "md:col-start-2 md:pl-12 md:pr-0") }>
                  <TimelineCard item={item} cardStyle={resolvedCardStyle} />
                </div>
                <div className={cn(
                  "absolute left-0 top-8 h-8 w-8 rounded-full border-4 border-background bg-primary shadow-md md:left-1/2 md:-translate-x-1/2 md:h-10 md:w-10",
                  item.highlight && "ring-4 ring-primary/15",
                )} />
              </div>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}
