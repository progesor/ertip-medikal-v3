"use client";

import {
  BadgeCheck,
  Box,
  FileText,
  Image,
  Package,
  Ruler,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useFormFields, useRowLabel } from "@payloadcms/ui";

type Props = {
  path?: string;
  rowNumber?: number;
};

type FormField = {
  value?: unknown;
};

const textValue = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : "";

const getArrayType = (path: string) => {
  if (path.includes("specs")) return "specs";
  if (path.includes("gallery")) return "gallery";
  if (path.includes("attributes")) return "attributes";
  if (path.includes("variants")) return "variants";
  if (path.includes("packaging")) return "packaging";
  if (path.includes("accessCodes")) return "accessCodes";
  if (path.includes("publicDocs")) return "publicDocs";
  if (path.includes("protectedDocs")) return "protectedDocs";
  return "default";
};

const getRowIndex = (path: string, rowNumber?: number) => {
  if (typeof rowNumber === "number") return rowNumber + 1;

  const parts = path.split(".");
  const lastIndex = [...parts].reverse().find((part) => /^\d+$/.test(part));

  return lastIndex ? Number(lastIndex) + 1 : 1;
};

export function ProductArrayRowLabel({ path, rowNumber }: Props) {
  const rowLabel = useRowLabel<Record<string, unknown>>();
  const currentPath = path || rowLabel.path || "";
  const currentRowNumber = rowNumber ?? rowLabel.rowNumber;
  const arrayType = getArrayType(currentPath);
  const displayIndex = getRowIndex(currentPath, currentRowNumber);

  const row = useFormFields(([fields]) => {
    const get = (name: string) =>
      (fields[`${currentPath}.${name}`] as FormField | undefined)?.value ??
      rowLabel.data?.[name];

    return {
      code: textValue(get("code")),
      grossWeight: textValue(get("grossWeight")),
      isActive: get("isActive"),
      key: textValue(get("key")),
      label: textValue(get("label")),
      name: textValue(get("name")),
      packageLabel: textValue(get("packageLabel")),
      quantity: get("quantity"),
      sku: textValue(get("sku")),
      title: textValue(get("title")),
      value: textValue(get("value")),
      values: textValue(get("values")),
    };
  });

  const map = {
    accessCodes: {
      icon: ShieldCheck,
      meta: row.isActive === false ? "Pasif" : "Aktif",
      title: row.code || `Kod ${displayIndex}`,
    },
    attributes: {
      icon: SlidersHorizontal,
      meta: row.values || "Değerler bekleniyor",
      title: row.name || `Özellik grubu ${displayIndex}`,
    },
    default: {
      icon: Box,
      meta: "Satır",
      title: `Kayıt ${displayIndex}`,
    },
    gallery: {
      icon: Image,
      meta: "Galeri görseli",
      title: `Görsel ${displayIndex}`,
    },
    packaging: {
      icon: Package,
      meta: row.quantity ? `${row.quantity} adet` : row.grossWeight || "Ambalaj",
      title: row.packageLabel || `Paket ${displayIndex}`,
    },
    protectedDocs: {
      icon: ShieldCheck,
      meta: "Korumalı doküman",
      title: row.label || `Kılavuz ${displayIndex}`,
    },
    publicDocs: {
      icon: FileText,
      meta: "Halka açık doküman",
      title: row.label || `Belge ${displayIndex}`,
    },
    specs: {
      icon: Ruler,
      meta: row.value || "Değer bekleniyor",
      title: row.key || `Teknik özellik ${displayIndex}`,
    },
    variants: {
      icon: BadgeCheck,
      meta: row.sku || (row.isActive === false ? "Pasif" : "Aktif"),
      title: row.title || `Varyant ${displayIndex}`,
    },
  }[arrayType];

  const Icon = map.icon;

  return (
    <span className="ertip-array-row-label">
      <Icon size={16} />
      <span>
        <strong>{map.title}</strong>
        <small>{map.meta}</small>
      </span>
    </span>
  );
}
