import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  alignment?: "left" | "center" | null;
  inverse?: boolean;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  alignment = "center",
  inverse = false,
  className,
}: SectionHeadingProps) {
  if (!eyebrow && !title && !subtitle) return null;

  const centered = alignment !== "left";

  return (
    <div
      className={cn(
        "space-y-4",
        centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl text-left",
        className,
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            "inline-flex rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em]",
            inverse
              ? "border-current/15 bg-current/10 text-current"
              : "border-primary/15 bg-primary/10 text-primary",
          )}
        >
          {eyebrow}
        </div>
      )}

      {title && (
        <h2 className="text-3xl font-black leading-tight tracking-tight text-current md:text-4xl lg:text-5xl">
          {title}
        </h2>
      )}

      {subtitle && (
        <p className="text-base leading-8 text-current opacity-70 md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
