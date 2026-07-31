import { RichText } from "@payloadcms/richtext-lexical/react";
import { SectionShell, type SectionOptions } from "@/components/blocks/SectionShell";
import { cn } from "@/lib/utils";

type ContentBlockProps = {
  eyebrow?: string | null;
  title?: string | null;
  content: Parameters<typeof RichText>[0]["data"];
  layoutMode?: "single" | "columns" | null;
  bodySize?: "compact" | "standard" | "large" | null;
  headingAlignment?: "left" | "center" | null;
  section?: SectionOptions | null;
};

const bodySizeClasses = {
  compact: "text-base [&_li]:text-base [&_p]:text-base",
  standard: "text-lg [&_li]:text-lg [&_p]:text-lg",
  large: "text-lg md:text-xl [&_li]:text-lg md:[&_li]:text-xl [&_p]:text-lg md:[&_p]:text-xl",
} as const;

export function ContentBlock({
  eyebrow,
  title,
  content,
  layoutMode = "single",
  bodySize = "standard",
  headingAlignment = "left",
  section,
}: ContentBlockProps) {
  if (!content) return null;

  const background = section?.background || "light";
  const inverse = background === "dark" || background === "primary";
  const centered = headingAlignment === "center";

  return (
    <SectionShell
      section={section}
      defaultBackground="light"
      defaultSpacing="standard"
      defaultContentWidth="compact"
    >
      {(eyebrow || title) && (
        <header
          className={cn(
            "mb-10 space-y-4",
            centered && "mx-auto max-w-3xl text-center",
          )}
        >
          {eyebrow && (
            <div
              className={cn(
                "inline-flex rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em]",
                inverse
                  ? "border-current/15 bg-background/10 text-current"
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
        </header>
      )}

      <div
        className={cn(
          "space-y-6 leading-relaxed",
          inverse ? "text-current/80" : "text-text-muted",
          bodySizeClasses[bodySize || "standard"],
          layoutMode === "columns" &&
            "lg:columns-2 lg:gap-14 [&>*]:break-inside-avoid-column [&_h2]:break-after-avoid-column [&_h3]:break-after-avoid-column",
          "[&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
          inverse && "[&_a]:text-current",
          "[&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:bg-primary/10 [&_blockquote]:px-6 [&_blockquote]:py-5 [&_blockquote]:font-semibold [&_blockquote]:text-current",
          "[&_h2]:mb-5 [&_h2]:mt-12 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-current",
          "[&_h3]:mb-4 [&_h3]:mt-8 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-current",
          "[&_img]:mx-auto [&_img]:my-10 [&_img]:rounded-[var(--radius-2xl)] [&_img]:shadow-lg",
          "[&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2",
          "[&_strong]:font-bold [&_strong]:text-current",
        )}
      >
        <RichText data={content} />
      </div>
    </SectionShell>
  );
}
