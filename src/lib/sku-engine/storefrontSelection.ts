import type { ParsedAttribute } from "./types";

type StorefrontVariant = { title?: string | null; combinationKey?: string | null };

// Keep whole decimal measurements together, while treating 0.70, 0,7 and 0.7 alike.
function searchableText(text: string): string {
  const tokens = text.normalize("NFKC").toLocaleLowerCase("tr-TR")
    .replaceAll("_", " ").match(/\d+(?:[.,]\d+)?|[\p{L}\p{M}]+|[^\s]/gu) ?? [];
  return " " + tokens.map(token => /^\d+[.,]\d+$/.test(token)
    ? token.replace(",", ".").replace(/0+$/, "").replace(/\.$/, "")
    : token).join(" ") + " ";
}

function readKey(key?: string | null): Map<string, string> {
  if (key) {
    try {
      const entries: unknown = JSON.parse(key);
      if (Array.isArray(entries) && entries.every(pair => Array.isArray(pair) &&
        pair.length === 2 && pair.every(value => typeof value === "string"))) {
        return new Map(entries);
      }
    } catch {
      // Older manual variants only have a display title.
    }
  }
  return new Map();
}

export function getVariantSelection(attributes: ParsedAttribute[], variant: StorefrontVariant) {
  const key = readKey(variant.combinationKey);
  const title = variant.title ?? "";
  const parts = title.split(/\s+[-–—]\s+/u);
  const selection: Record<string, string> = {};
  for (const [index, attribute] of attributes.entries()) {
    const stored = key.get(`id:${attribute.id}`) ?? key.get(attribute.name);
    let value: string | undefined;
    if (stored !== undefined) {
      value = attribute.values.find(option => option === stored) ??
        attribute.values.find(option => searchableText(option) === searchableText(stored));
    } else {
      // Legacy titles put one attribute in each part. Match within that part
      // so digits in the diameter cannot accidentally select the length.
      const part = searchableText(parts.length === attributes.length ? parts[index] : title);
      value = [...attribute.values].sort((a, b) => b.length - a.length)
        .find(option => part.includes(searchableText(option)));
    }
    if (value !== undefined) selection[attribute.name] = value;
  }
  return selection;
}
