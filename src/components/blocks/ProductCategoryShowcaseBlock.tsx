import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, FolderOpen, Package } from "lucide-react";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import {
  SectionShell,
  type SectionOptions,
} from "@/components/blocks/SectionShell";

type CategoryRelation =
  | number
  | string
  | { id?: number | string | null }
  | null;

type ProductCategoryShowcaseProps = {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  selectionMode?: "topLevel" | "manual" | null;
  layoutMode?: "grid" | "featured" | "compact" | null;
  columns?: "2" | "3" | "4" | null;
  categories?: CategoryRelation[] | null;
  cardStyle?: "overlay" | "card" | "minimal" | null;
  imageRatio?: "4:3" | "16:9" | "1:1" | "3:4" | null;
  alignment?: "left" | "center" | null;
  showDescription?: boolean | null;
  showProductCount?: boolean | null;
  includeChildProducts?: boolean | null;
  emptyStateText?: string | null;
  section?: SectionOptions | null;
};

function relationId(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: string | number | null }).id;
    return id === undefined || id === null ? "" : String(id);
  }
  return "";
}

const ratioClasses = {
  "4:3": "aspect-[4/3]",
  "16:9": "aspect-video",
  "1:1": "aspect-square",
  "3:4": "aspect-[3/4]",
} as const;

const columnClasses = {
  "2": "md:grid-cols-2",
  "3": "md:grid-cols-2 xl:grid-cols-3",
  "4": "sm:grid-cols-2 xl:grid-cols-4",
} as const;

export async function ProductCategoryShowcaseBlock({
  eyebrow,
  title,
  subtitle,
  selectionMode = "topLevel",
  layoutMode = "grid",
  columns = "3",
  categories: selectedRelations,
  cardStyle = "overlay",
  imageRatio = "4:3",
  alignment = "center",
  showDescription = true,
  showProductCount = true,
  includeChildProducts = true,
  emptyStateText = "Henüz gösterilecek kategori bulunmuyor.",
  section,
}: ProductCategoryShowcaseProps) {
  const payload = await getPayload({ config: configPromise });
  const [{ docs: allCategories }, productResult] = await Promise.all([
    payload.find({
      collection: "categories",
      pagination: false,
      depth: 1,
      sort: "title",
    }),
    payload.find({
      collection: "products",
      where: { _status: { equals: "published" } },
      pagination: false,
      depth: 0,
      select: { category: true },
    }),
  ]);

  const byId = new Map(allCategories.map((category) => [String(category.id), category]));
  const childrenByParent = new Map<string, string[]>();

  for (const category of allCategories) {
    const parentId = relationId(category.parent);
    if (!parentId) continue;
    childrenByParent.set(parentId, [
      ...(childrenByParent.get(parentId) || []),
      String(category.id),
    ]);
  }

  const selectedIds = (selectedRelations || []).map(relationId).filter(Boolean);
  const categories =
    selectionMode === "manual"
      ? selectedIds.map((id) => byId.get(id)).filter(Boolean)
      : allCategories.filter((category) => !relationId(category.parent));

  const directCounts = new Map<string, number>();
  for (const product of productResult.docs) {
    const categoryId = relationId(product.category);
    if (!categoryId) continue;
    directCounts.set(categoryId, (directCounts.get(categoryId) || 0) + 1);
  }

  const collectDescendants = (id: string, seen = new Set<string>()): string[] => {
    if (seen.has(id)) return [];
    seen.add(id);
    const children = childrenByParent.get(id) || [];
    return children.flatMap((childId) => [childId, ...collectDescendants(childId, seen)]);
  };

  const countForCategory = (id: string) => {
    const ids = includeChildProducts ? [id, ...collectDescendants(id)] : [id];
    return ids.reduce((total, currentId) => total + (directCounts.get(currentId) || 0), 0);
  };

  const inverse = section?.background === "dark" || section?.background === "primary";
  const resolvedLayout = layoutMode || "grid";
  const resolvedColumns = columns || "3";
  const resolvedCardStyle = cardStyle || "overlay";
  const resolvedRatio = imageRatio || "4:3";

  return (
    <SectionShell
      section={section}
      defaultBackground="muted"
      defaultSpacing="large"
      defaultContentWidth="wide"
    >
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        alignment={alignment}
        inverse={inverse}
        className="mb-12 md:mb-16"
      />

      {categories.length === 0 ? (
        <div className="rounded-[var(--radius-2xl)] border border-dashed border-border p-10 text-center text-current opacity-70">
          {emptyStateText}
        </div>
      ) : (
        <div className={cn("grid gap-6", columnClasses[resolvedColumns])}>
          {categories.map((category, index) => {
            if (!category) return null;
            const image = typeof category.image === "object" && category.image?.url ? category.image : null;
            const productCount = countForCategory(String(category.id));
            const featured = resolvedLayout === "featured" && index === 0;
            const compact = resolvedLayout === "compact";
            const href = `/urunler?category=${encodeURIComponent(category.slug)}`;

            return (
              <Link
                key={category.id}
                href={href}
                className={cn(
                  "group relative overflow-hidden rounded-[var(--radius-2xl)] border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  featured && "md:col-span-2",
                  resolvedCardStyle === "card" &&
                    "border-border/70 bg-surface shadow-md shadow-surface-inverse/5 hover:-translate-y-1 hover:shadow-xl",
                  resolvedCardStyle === "minimal" && "border-border bg-transparent",
                  resolvedCardStyle === "overlay" &&
                    "border-border/40 bg-surface-inverse shadow-lg shadow-surface-inverse/10 hover:-translate-y-1 hover:shadow-xl",
                )}
              >
                <div className={cn("relative overflow-hidden", ratioClasses[resolvedRatio], compact && "max-h-52") }>
                  {image ? (
                    <Image
                      src={image.url!}
                      alt={image.alt || category.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-surface-muted text-primary">
                      <FolderOpen className="h-16 w-16" />
                    </div>
                  )}

                  {resolvedCardStyle === "overlay" && (
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-inverse via-surface-inverse/45 to-transparent" />
                  )}

                  {resolvedCardStyle === "overlay" && (
                    <div className="absolute inset-x-0 bottom-0 p-6 text-surface-inverse-foreground md:p-8">
                      <h3 className="text-2xl font-black leading-tight md:text-3xl">
                        {category.title}
                      </h3>
                      {showDescription && category.description && (
                        <p className="mt-3 line-clamp-2 leading-6 text-surface-inverse-foreground/75">
                          {category.description}
                        </p>
                      )}
                      <div className="mt-5 flex items-center justify-between gap-4">
                        {showProductCount && (
                          <span className="inline-flex items-center gap-2 text-sm font-bold text-surface-inverse-foreground/80">
                            <Package className="h-4 w-4" /> {productCount} ürün
                          </span>
                        )}
                        <ArrowUpRight className="ml-auto h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                      </div>
                    </div>
                  )}
                </div>

                {resolvedCardStyle !== "overlay" && (
                  <div className={cn(compact ? "p-5" : "p-6 md:p-7") }>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-black text-current md:text-2xl">
                        {category.title}
                      </h3>
                      <ArrowUpRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </div>
                    {showDescription && category.description && (
                      <p className="mt-3 line-clamp-3 leading-6 text-current opacity-70">
                        {category.description}
                      </p>
                    )}
                    {showProductCount && (
                      <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">
                        <Package className="h-4 w-4" /> {productCount} ürün
                      </div>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}
