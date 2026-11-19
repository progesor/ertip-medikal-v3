import type { Product } from "@/payload-types";
import { getVariantSelection } from "@/lib/sku-engine/storefrontSelection";
import { catalogLabel } from "@/lib/i18n/catalogLabels";
import type { SiteLocale } from "@/lib/i18n/config";

// Summarize actual active choices without expanding their Cartesian combinations.
export function catalogOptions(
  product: Pick<Product, "attributes" | "variants">,
  locale: SiteLocale,
) {
  const attributes = (product.attributes || []).map((attribute) => ({
    id: attribute.id || undefined,
    name: attribute.name,
    values: [
      ...new Set(
        attribute.values
          .split("-")
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    ],
  }));
  const active = (product.variants || []).filter(
    (variant) => variant.isActive !== false,
  );
  const selections = active.map((variant) =>
    getVariantSelection(attributes, variant),
  );
  return attributes.flatMap((attribute) => {
    const available = new Set(
      selections.map((selection) => selection[attribute.name]).filter(Boolean),
    );
    const values = attribute.values.filter((value) => available.has(value));
    return values.length
      ? [
          {
            key: catalogLabel(attribute.name, locale),
            value: values
              .map((value) => catalogLabel(value, locale))
              .join(" · "),
          },
        ]
      : [];
  });
}
