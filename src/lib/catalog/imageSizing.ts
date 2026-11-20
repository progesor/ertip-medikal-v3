import type { CatalogSnapshot } from "@/types/catalog";
import { DEFAULT_IMAGE_OPTIMIZATION_PROFILES } from "@/lib/imageOptimization/config";
import { resolvePages } from "./pagePlan";

export function catalogImageTargets(
  snapshot: CatalogSnapshot,
): Map<number, number> {
  const profiles =
    snapshot.imageProfiles || DEFAULT_IMAGE_OPTIMIZATION_PROFILES;
  const widths = Object.values(profiles)
    .map((p) => p.width)
    .sort((a, b) => a - b);
  const dpi = snapshot.config.profile === "quality" ? 300 : 160;
  const short = snapshot.config.paper === "A4" ? 210 : 148;
  const long = snapshot.config.paper === "A4" ? 297 : 210;
  const pageWidth = snapshot.config.orientation === "portrait" ? short : long;
  const targets = new Map<number, number>();
  const assign = (id: number | undefined, millimeters: number) => {
    if (!id) return;
    const required = Math.ceil((millimeters / 25.4) * dpi);
    // Share the site's profile sizes; for print never sacrifice the required resolution.
    const target =
      widths.find((width) => width >= required) || Math.min(3840, required);
    targets.set(id, Math.max(targets.get(id) || 0, target));
  };
  const products = new Map(snapshot.products.map((p) => [p.id, p]));
  for (const page of resolvePages(snapshot.products, snapshot.config)) {
    if (page.kind !== "products") continue;
    const count = Math.min(page.productIds.length, Number(page.density));
    const width =
      page.layout === "spotlight" || count === 1
        ? (pageWidth - 22) * (snapshot.config.adaptiveLayout ? 1 : 0.55)
        : (pageWidth - 22) /
          (count >= 9 && !snapshot.config.adaptiveLayout ? 3 : 2);
    for (const id of page.productIds)
      assign(products.get(id)?.image?.id, width);
  }
  if (snapshot.config.cover === "image")
    assign(
      snapshot.coverImage?.id,
      (pageWidth * snapshot.config.coverDesign.imageWidth) / 100,
    );
  if (snapshot.config.cover === "collage")
    for (const p of snapshot.products.slice(0, 4))
      assign(
        p.image?.id,
        (pageWidth * snapshot.config.coverDesign.imageWidth) / 200,
      );
  return targets;
}
