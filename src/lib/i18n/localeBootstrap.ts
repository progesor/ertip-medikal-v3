import type { PayloadRequest } from "payload";

const SOURCE_LOCALE = "tr" as const;
const TARGET_LOCALE = "en" as const;

type BootstrapDocument = Record<string, unknown> & {
  id?: number | string;
};

export type LocaleBootstrapSpec = {
  fields: readonly string[];
  stripNestedIds?: readonly string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isMissingLocalizedValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (isRecord(value)) {
    const values = Object.values(value);
    return values.length === 0 || values.every(isMissingLocalizedValue);
  }

  return false;
}

function cloneLocalizedValue(value: unknown, stripNestedIds: boolean): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => cloneLocalizedValue(item, stripNestedIds));
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !(stripNestedIds && key === "id"))
        .map(([key, nestedValue]) => [
          key,
          cloneLocalizedValue(nestedValue, stripNestedIds),
        ]),
    );
  }

  return value;
}

export function buildLocaleBootstrapPatch(
  source: BootstrapDocument,
  target: BootstrapDocument,
  spec: LocaleBootstrapSpec,
) {
  const stripNestedIds = new Set(spec.stripNestedIds ?? []);
  const patch: Record<string, unknown> = {};

  for (const field of spec.fields) {
    const sourceValue = source[field];
    const targetValue = target[field];

    if (
      isMissingLocalizedValue(targetValue) &&
      !isMissingLocalizedValue(sourceValue)
    ) {
      patch[field] = cloneLocalizedValue(
        sourceValue,
        stripNestedIds.has(field),
      );
    }
  }

  return patch;
}

async function findCollectionLocaleByID({
  req,
  collection,
  id,
  locale,
}: {
  req: PayloadRequest;
  collection: string;
  id: number | string;
  locale: "tr" | "en";
}) {
  return (await req.payload.findByID({
    collection: collection as never,
    id,
    locale,
    fallbackLocale: false,
    depth: 0,
    draft: true,
    overrideAccess: true,
    req,
  })) as BootstrapDocument;
}

export async function bootstrapCollectionEnglishLocale({
  req,
  collection,
  id,
  spec,
  sourceDoc,
}: {
  req: PayloadRequest;
  collection: string;
  id: number | string;
  spec: LocaleBootstrapSpec;
  sourceDoc?: BootstrapDocument;
}) {
  const source =
    sourceDoc ??
    (await findCollectionLocaleByID({
      req,
      collection,
      id,
      locale: SOURCE_LOCALE,
    }));
  const target = await findCollectionLocaleByID({
    req,
    collection,
    id,
    locale: TARGET_LOCALE,
  });
  const data = buildLocaleBootstrapPatch(source, target, spec);

  if (Object.keys(data).length === 0) return false;

  await req.payload.update({
    collection: collection as never,
    id,
    locale: TARGET_LOCALE,
    fallbackLocale: false,
    data: data as never,
    depth: 0,
    overrideAccess: true,
    req,
  });

  return true;
}

export async function bootstrapGlobalEnglishLocale({
  req,
  slug,
  spec,
}: {
  req: PayloadRequest;
  slug: string;
  spec: LocaleBootstrapSpec;
}) {
  const source = (await req.payload.findGlobal({
    slug: slug as never,
    locale: SOURCE_LOCALE,
    fallbackLocale: false,
    depth: 0,
    overrideAccess: true,
    req,
  })) as BootstrapDocument;
  const target = (await req.payload.findGlobal({
    slug: slug as never,
    locale: TARGET_LOCALE,
    fallbackLocale: false,
    depth: 0,
    overrideAccess: true,
    req,
  })) as BootstrapDocument;
  const data = buildLocaleBootstrapPatch(source, target, spec);

  if (Object.keys(data).length === 0) return false;

  await req.payload.updateGlobal({
    slug: slug as never,
    locale: TARGET_LOCALE,
    fallbackLocale: false,
    data: data as never,
    depth: 0,
    overrideAccess: true,
    req,
  });

  return true;
}
