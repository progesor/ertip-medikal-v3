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
  if (codes.length === 1) return { sku: codes[0], skuLabel: label };
  if (product.skuPrefix?.trim()) {
    return {
      sku: product.skuPrefix.trim() + "…" + (product.skuSuffix || ""),
      skuLabel: locale === "en" ? "Code series" : "Kod serisi",
    };
  }
  // Show real codes only. A variant code is never silently promoted to a base SKU.
  if (codes.length <= 3)
    return {
      sku: codes.join(" / "),
      skuLabel: locale === "en" ? "Product codes" : "Ürün kodları",
    };
  const prefix = codes
    .reduce((prefix, code) => {
      let i = 0;
      while (i < prefix.length && i < code.length && prefix[i] === code[i]) i++;
      return prefix.slice(0, i);
    }, codes[0] || "")
    .replace(/[0-9]+$/, "");
  return {
    sku: prefix.length >= 2 ? prefix + "…" : "",
    skuLabel: locale === "en" ? "Code series" : "Kod serisi",
  };
}
