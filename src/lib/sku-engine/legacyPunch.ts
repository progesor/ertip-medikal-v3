import type { ParsedAttribute } from "./types";
import { normalizeAttributeName } from "./templateProfile";

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
      ...(typeof attribute.id === "string" && attribute.id
        ? { id: attribute.id }
        : {}),
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
    attributes
      .map((attribute, index) => ({
        identity: attribute.id ? `id:${attribute.id}` : attribute.name,
        sortKey: attribute.id
          ? `id:${attribute.id}`
          : `name:${normalizeAttributeName(attribute.name)}`,
        value: combination[index] ?? "",
      }))
      .sort((left, right) =>
        left.sortKey.localeCompare(right.sortKey, "tr-TR"),
      )
      .map(({ identity, value }) => [identity, value]),
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

interface ParsedPunchMeasurement {
  readonly compactToken: string;
  readonly decimalPlaces: number;
  readonly isInteger: boolean;
  readonly numericValue: number;
}

function parsePunchMeasurement(value: string): ParsedPunchMeasurement | null {
  const trimmed = value.trim();
  const match = /^(\d+)(?:\.(\d+))?$/.exec(trimmed);
  if (!match) return null;

  const integerPart = match[1] ?? "";
  const fractionalPart = match[2] ?? "";
  const numericValue = Number(trimmed);
  if (!Number.isFinite(numericValue)) return null;

  const compactToken = String(
    parseInt(`${integerPart}${fractionalPart}`, 10),
  );

  return {
    compactToken,
    decimalPlaces: fractionalPart.length,
    isInteger: Number.isInteger(numericValue),
    numericValue,
  };
}

function buildPunchDiameterToken(
  diameter: string,
  lengthMeasurement: ParsedPunchMeasurement,
): string {
  const diameterMeasurement = parsePunchMeasurement(diameter);
  if (!diameterMeasurement) return diameter.replace(/\./g, "");

  if (
    lengthMeasurement.isInteger &&
    diameterMeasurement.numericValue > 0 &&
    diameterMeasurement.numericValue < 1 &&
    diameterMeasurement.decimalPlaces === 1
  ) {
    return diameterMeasurement.compactToken.padStart(2, "0");
  }

  return diameterMeasurement.compactToken;
}

function buildPunchLengthToken(length: string): {
  readonly measurement: ParsedPunchMeasurement;
  readonly token: string;
} | null {
  const measurement = parsePunchMeasurement(length);
  if (!measurement) return null;

  return {
    measurement,
    token: measurement.isInteger
      ? String(measurement.numericValue)
      : measurement.compactToken,
  };
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

    const normalizedName = attributeName.toLocaleLowerCase("tr-TR");
    if (normalizedName.includes("çap")) diameter = value;
    if (normalizedName.includes("uzunluk")) length = value;
  });

  if (diameter && length) {
    const lengthToken = buildPunchLengthToken(length);

    if (lengthToken) {
      return `${buildPunchDiameterToken(
        diameter,
        lengthToken.measurement,
      )}${lengthToken.token}`;
    }

    return `${diameter.replace(/\./g, "")}${length.replace(/\./g, "")}`;
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
  const finalSuffix = suffix ? String(suffix) : "";
  return `${finalPrefix}${buildLegacyPunchSkuCode(attributes, combination)}${finalSuffix}`;
}