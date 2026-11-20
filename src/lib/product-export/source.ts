import type { Field, Payload, Where } from "payload";
import type {
  ExportRecord,
  ExportMediaReference,
  ProductExportOptions,
  ProductExportData,
} from "@/types/productExport";
import { categoryClosure, object, sanitizeRecord } from "./serialize";

export async function allRecords(
  payload: Payload,
  collection: "products" | "categories" | "media",
  where?: Where,
  draft = false,
  select?: Record<string, true>,
) {
  const docs: ExportRecord[] = [];
  for (let page = 1; ; page++) {
    const result = await payload.find({
      collection,
      where,
      draft,
      select,
      locale: "all",
      fallbackLocale: false,
      depth: 0,
      limit: 200,
      page,
      sort: "id",
      overrideAccess: true,
    });
    docs.push(...(result.docs as unknown as ExportRecord[]));
    if (docs.length > 50000)
      throw Error(
        "Tek aktarımda en fazla 50.000 kayıt desteklenir. Seçimi daraltın.",
      );
    if (!result.hasNextPage) break;
  }
  return docs;
}
export function mediaReferences(
  fields: Field[],
  data: ExportRecord,
  collection: string,
  recordId: number,
) {
  const refs: ExportMediaReference[] = [];
  function add(value: unknown, field: string) {
    const id = Number(typeof value === "object" ? object(value).id : value);
    if (Number.isSafeInteger(id) && id > 0)
      refs.push({
        collection,
        recordId,
        field,
        mediaId: id,
        kind: /Docs\b|\.file\b/.test(field) ? "document" : "image",
      });
  }
  function rich(value: unknown, field: string) {
    if (Array.isArray(value)) value.forEach((v, i) => rich(v, field + "." + i));
    else if (value && typeof value === "object") {
      const node = object(value);
      if (node.type === "upload" && node.relationTo === "media")
        add(node.value, field);
      for (const [k, v] of Object.entries(node))
        if (k !== "value") rich(v, field + "." + k);
    }
  }
  function walk(list: Field[], row: ExportRecord, prefix: string) {
    for (const f of list) {
      if (f.type === "ui") continue;
      if (f.type === "tabs") {
        for (const t of f.tabs)
          walk(
            t.fields,
            "name" in t && t.name ? object(row[t.name]) : row,
            prefix + ("name" in t && t.name ? t.name + "." : ""),
          );
        continue;
      }
      if (f.type === "row" || f.type === "collapsible") {
        walk(f.fields, row, prefix);
        continue;
      }
      if (!("name" in f)) continue;
      const name = prefix + f.name,
        value = row[f.name];
      const values = f.localized
        ? Object.entries(object(value)).map(
            ([locale, v]) => [name + "." + locale, v] as const,
          )
        : [[name, value] as const];
      for (const [key, v] of values) {
        if (f.type === "upload" || f.type === "relationship") {
          const entries = Array.isArray(v) ? v : [v];
          for (const entry of entries) {
            if (f.relationTo === "media") add(entry, key);
            else if (
              Array.isArray(f.relationTo) &&
              object(entry).relationTo === "media"
            )
              add(object(entry).value, key);
          }
        } else if (f.type === "group") walk(f.fields, object(v), key + ".");
        else if (f.type === "array" && Array.isArray(v))
          v.forEach((r, i) => walk(f.fields, object(r), key + "." + i + "."));
        else if (f.type === "blocks" && Array.isArray(v))
          for (const [i, r] of v.entries()) {
            const block = f.blocks.find((b) => b.slug === object(r).blockType);
            if (block) walk(block.fields, object(r), key + "." + i + ".");
          }
        else if (f.type === "richText") rich(v, key);
      }
    }
  }
  walk(fields, data, "");
  return refs;
}
export function fieldDictionary(fields: Field[], prefix = ""): ExportRecord[] {
  return fields.flatMap((f) => {
    if (f.type === "ui") return [];
    if (f.type === "tabs")
      return f.tabs.flatMap((t) =>
        fieldDictionary(
          t.fields,
          prefix + ("name" in t && t.name ? t.name + "." : ""),
        ),
      );
    if (f.type === "row" || f.type === "collapsible")
      return fieldDictionary(f.fields, prefix);
    if (!("name" in f) || f.name === "accessCodes") return [];
    const entry: ExportRecord = {
      path: prefix + f.name,
      type: f.type,
      localized: !!f.localized,
      label: "label" in f && typeof f.label !== "function" ? f.label : null,
    };
    if (f.type === "upload" || f.type === "relationship")
      entry.relationTo = f.relationTo;
    return [
      entry,
      ...("fields" in f
        ? fieldDictionary(f.fields, prefix + f.name + ".")
        : []),
    ];
  });
}
export async function collectExportData(
  payload: Payload,
  options: ProductExportOptions,
): Promise<ProductExportData> {
  const categories = await allRecords(payload, "categories");
  const conditions: Where[] = [];
  if (options.status !== "all")
    conditions.push({ _status: { equals: options.status } });
  if (options.scope === "products")
    conditions.push({ id: { in: options.productIds } });
  if (options.scope === "categories")
    conditions.push({
      category: {
        in: [
          ...categoryClosure(
            categories,
            options.categoryIds,
            options.includeChildren,
          ),
        ],
      },
    });
  const products = (
    await allRecords(
      payload,
      "products",
      conditions.length ? { and: conditions } : undefined,
      options.status !== "published",
    )
  ).map((p) => sanitizeRecord(p) as ExportRecord);
  if (!products.length)
    throw Error("Bu seçimde aktarılabilecek ürün bulunamadı.");
  const categoryIds = new Set(
    products.flatMap((p) =>
      Array.isArray(p.category) ? p.category.map(Number) : [],
    ),
  );
  let size = -1;
  while (size !== categoryIds.size) {
    size = categoryIds.size;
    for (const c of categories)
      if (categoryIds.has(Number(c.id)) && c.parent)
        categoryIds.add(Number(c.parent));
  }
  const usedCategories = categories.filter((c) =>
    categoryIds.has(Number(c.id)),
  );
  const refs = [
    ...products.flatMap((p) =>
      mediaReferences(
        payload.collections.products.config.fields,
        p,
        "products",
        Number(p.id),
      ),
    ),
    ...usedCategories.flatMap((c) =>
      mediaReferences(
        payload.collections.categories.config.fields,
        c,
        "categories",
        Number(c.id),
      ),
    ),
  ];
  const ids = [...new Set(refs.map((r) => r.mediaId))],
    media: ExportRecord[] = [];
  for (let i = 0; i < ids.length; i += 200)
    media.push(
      ...(await allRecords(payload, "media", {
        id: { in: ids.slice(i, i + 200) },
      })),
    );
  return {
    products,
    categories: usedCategories,
    references: refs,
    media,
    fields: fieldDictionary(payload.collections.products.config.fields),
  };
}
