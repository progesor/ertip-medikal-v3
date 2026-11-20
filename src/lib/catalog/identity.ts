import type { Product } from "@/payload-types";

export function catalogIdentity(
  product: Pick<Product, "sku" | "skuPrefix" | "skuSuffix" | "variants">,
  locale: "tr" | "en",
) {
  const label = locale === "en" ? "Product code" : "Ürün kodu";
  if (product.sku?.trim()) return { sku: product.sku.trim(), skuLabel: label };
  const codes = [
    ...new Set(
      (product.variants || [])
        .filter((v) => v.isActive !== false)
        .map((v) => v.sku?.trim())
        .filter((v): v is string => !!v),
    ),
  ];
  // Preserve the complete first active SKU. Do not invent a main code from a prefix.
  return {
    sku: codes[0] || "",
    skuLabel: locale === "en" ? "Example variant code" : "Örnek varyant kodu",
  };
}
