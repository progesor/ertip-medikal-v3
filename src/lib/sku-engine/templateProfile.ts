import type {
  ParsedAttribute,
  SkuGenerationIssue,
  SkuValueNormalization,
} from "./types";

export const DEFAULT_SKU_TEMPLATE = "{prefix}{values}{suffix}";
export const DEFAULT_SKU_VALUE_SEPARATOR = "-";
export const DEFAULT_SKU_VALUE_NORMALIZATION: SkuValueNormalization = "compact";

export function normalizeAttributeName(name: string): string {
  return name.trim().toLocaleLowerCase("tr-TR").replace(/\s+/g, " ");
}

export function normalizeTemplateValue(
  value: string,
  normalization: SkuValueNormalization,
): string {
  const trimmed = value.trim();

  if (normalization === "none") return trimmed;

  const decomposed = trimmed.normalize("NFKD").replace(/\p{M}/gu, "");

  if (normalization === "slug") {
    return decomposed
      .toLocaleLowerCase("tr-TR")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "");
  }

  const compact = decomposed.replace(/[^\p{L}\p{N}]+/gu, "");
  return normalization === "uppercase-compact"
    ? compact.toLocaleUpperCase("tr-TR")
    : compact;
}

function findAttributeIndex(
  attributes: readonly ParsedAttribute[],
  requestedName: string,
): number {
  const normalizedRequestedName = normalizeAttributeName(requestedName);
  return attributes.findIndex(
    (attribute) =>
      normalizeAttributeName(attribute.name) === normalizedRequestedName,
  );
}

export function validateSkuTemplate(
  template: string,
  attributes: readonly ParsedAttribute[],
): SkuGenerationIssue[] {
  const issues: SkuGenerationIssue[] = [];
  const trimmedTemplate = template.trim();

  if (!trimmedTemplate) {
    issues.push({
      code: "INVALID_TEMPLATE",
      message: "SKU şablonu boş bırakılamaz.",
    });
    return issues;
  }

  const tokenPattern = /\{([^{}]+)\}/g;
  const matches = trimmedTemplate.matchAll(tokenPattern);

  for (const match of matches) {
    const token = match[1]?.trim() || "";
    if (token === "prefix" || token === "suffix" || token === "values") {
      continue;
    }

    const [kind, ...nameParts] = token.split(":");
    const attributeName = nameParts.join(":").trim();

    if (
      (kind === "value" || kind === "raw") &&
      attributeName &&
      findAttributeIndex(attributes, attributeName) >= 0
    ) {
      continue;
    }

    issues.push({
      code: "UNKNOWN_TEMPLATE_TOKEN",
      token,
      message: `SKU şablonundaki “{${token}}” belirteci tanınmıyor.`,
    });
  }

  return issues;
}

export function renderSkuTemplate(args: {
  attributes: readonly ParsedAttribute[];
  combination: readonly string[];
  normalization: SkuValueNormalization;
  prefix: string;
  suffix: string;
  template: string;
  valueSeparator: string;
}): string {
  const {
    attributes,
    combination,
    normalization,
    prefix,
    suffix,
    template,
    valueSeparator,
  } = args;

  const normalizedValues = combination.map((value) =>
    normalizeTemplateValue(value, normalization),
  );

  return template.replace(/\{([^{}]+)\}/g, (_match, rawToken: string) => {
    const token = rawToken.trim();

    if (token === "prefix") return prefix;
    if (token === "suffix") return suffix;
    if (token === "values") return normalizedValues.join(valueSeparator);

    const [kind, ...nameParts] = token.split(":");
    const attributeName = nameParts.join(":").trim();
    const attributeIndex = findAttributeIndex(attributes, attributeName);

    if (attributeIndex < 0) return "";
    const rawValue = combination[attributeIndex] ?? "";

    return kind === "raw"
      ? rawValue.trim()
      : normalizeTemplateValue(rawValue, normalization);
  });
}