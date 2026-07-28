import type { ParsedAttribute } from "./types";

export function parseLegacyAttributes(input: unknown): ParsedAttribute[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter(
      (attribute): attribute is Record<string, unknown> =>
        Boolean(attribute) &&
        typeof attribute === "object" &&
        Boolean(attribute.name) &&
        Boolean(attribute.values),
    )
    .map((attribute) => ({
      name: String(attribute.name),
      values:
        typeof attribute.values === "string"
          ? attribute.values
              .split("-")
              .map((value) => value.trim())
              .filter(Boolean)
          : [],
    }));
}

export function createCombinationKey(
  attributes: readonly ParsedAttribute[],
  combination: readonly string[],
): string {
  return JSON.stringify(
    attributes.map((attribute, index) => [attribute.name, combination[index] ?? ""]),
  );
}

export function buildLegacyVariantTitle(
  attributes: readonly ParsedAttribute[],
  combination: readonly string[],
): string {
  return combination
    .map((value, index) => {
      const attribute = attributes[index];
      return attribute ? `${value} mm ${attribute.name}` : null;
    })
    .filter((part): part is string => Boolean(part))
    .join(" - ");
}

export function buildLegacyPunchSkuCode(
  attributes: readonly ParsedAttribute[],
  combination: readonly string[],
): string {
  let diameter = "";
  let length = "";

  combination.forEach((value, index) => {
    const attributeName = attributes[index]?.name;
    if (!attributeName) return;

    const normalizedName = attributeName.toLowerCase();
    if (normalizedName.includes("çap")) diameter = value;
    if (normalizedName.includes("uzunluk")) length = value;
  });

  if (diameter && length) {
    const cleanLength = length.replace(/\./g, "");
    const cleanDiameter = diameter.replace(/\./g, "");

    if (length.includes(".")) {
      return `${parseInt(cleanDiameter, 10)}${cleanLength}`;
    }

    return `${cleanDiameter}${cleanLength}`;
  }

  return combination.join("").replace(/\./g, "");
}

export function buildLegacyPunchSku(
  attributes: readonly ParsedAttribute[],
  combination: readonly string[],
  prefix: unknown,
  suffix: unknown,
): string {
  const finalPrefix = prefix ? String(prefix) : "";
  const finalSuffix = suffix ? ` ${String(suffix).trim()}` : "";
  return `${finalPrefix}${buildLegacyPunchSkuCode(attributes, combination)}${finalSuffix}`;
}
