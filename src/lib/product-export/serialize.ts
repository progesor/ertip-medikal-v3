import type { ExportRecord } from "@/types/productExport";

export function object(value: unknown): ExportRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ExportRecord)
    : {};
}
export function localized(value: unknown, locale: string): unknown {
  const obj = object(value);
  return "tr" in obj || "en" in obj ? (obj[locale] ?? null) : value;
}
export function plainText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (Array.isArray(value))
    return value.map(plainText).filter(Boolean).join("\n");
  const obj = object(value);
  if (typeof obj.text === "string") return obj.text;
  if (obj.root) return plainText(obj.root);
  if (obj.children) {
    const children = obj.children as unknown[];
    const separator = ["root", "list", "table", "tablerow"].includes(
      String(obj.type),
    )
      ? "\n"
      : "";
    return children.map(plainText).join(separator);
  }
  return "";
}
// Export content, never the access codes used to unlock protected downloads.
export function sanitizeRecord(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeRecord);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "accessCodes")
      .map(([key, child]) => [key, sanitizeRecord(child)]),
  );
}
export function flattenRecord(record: ExportRecord, prefix = ""): ExportRecord {
  const output: ExportRecord = {};
  for (const [key, value] of Object.entries(record)) {
    const field = prefix ? prefix + "." + key : key;
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length
    )
      Object.assign(output, flattenRecord(value as ExportRecord, field));
    else output[field] = value;
  }
  return output;
}
export function csv(
  records: ExportRecord[],
  emptyHeaders: string[] = ["id"],
): string {
  const columns = [...new Set(records.flatMap((row) => Object.keys(row)))];
  if (!columns.length) columns.push(...emptyHeaders);
  function cell(value: unknown) {
    let text =
      value == null
        ? ""
        : typeof value === "object"
          ? JSON.stringify(value)
          : String(value);
    // Excel/LibreOffice formula injection. JSON retains the unmodified original value.
    if (/^[\s\u0000-\u001f]*[=+@-]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  }
  return (
    "\uFEFF" +
    [columns, ...records.map((row) => columns.map((key) => row[key]))]
      .map((row) => row.map(cell).join(","))
      .join("\r\n") +
    "\r\n"
  );
}
export function categoryClosure(
  categories: ExportRecord[],
  selected: number[],
  includeChildren: boolean,
) {
  const result = new Set(selected);
  if (includeChildren) {
    let size = -1;
    while (size !== result.size) {
      size = result.size;
      for (const c of categories)
        if (result.has(Number(c.parent))) result.add(Number(c.id));
    }
  }
  return result;
}
export function productMarkdown(product: ExportRecord, locale: string) {
  const title =
    plainText(localized(product.title, locale)) ||
    "(Eksik başlık / Missing title)";
  const specs = localized(product.specs, locale);
  const specText = Array.isArray(specs)
    ? specs
        .map(
          (s) =>
            "- " + plainText(object(s).key) + ": " + plainText(object(s).value),
        )
        .join("\n")
    : "";
  return (
    "# " +
    title +
    "\n\n" +
    "ID: " +
    product.id +
    " | SKU: " +
    (product.sku || "—") +
    " | Status: " +
    product._status +
    "\n\n" +
    plainText(localized(product.shortDescription, locale)) +
    "\n\n" +
    plainText(localized(product.description, locale)) +
    "\n\n" +
    "## Specifications\n\n" +
    specText +
    "\n\n" +
    "## Complete source record (all languages, variants and fields)\n\n" +
    "~~~~json\n" +
    JSON.stringify(product, null, 2) +
    "\n~~~~\n"
  );
}
