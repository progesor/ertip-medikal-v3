"use client";

import { Boxes, Image as ImageIcon, Layers3, PackageCheck } from "lucide-react";
import Link from "next/link";
import { ProductWorkspaceStudio } from "./ProductWorkspaceStudio";
import { getProductsPath } from "@/lib/i18n/routing";
import { useDocumentInfo, useFormFields, useLocale } from "@payloadcms/ui";

type FormField = {
  rows?: unknown[];
  value?: unknown;
};

const valueAsText = (value: unknown, fallback = "Henüz girilmedi") => {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Evet" : "Hayır";
  return fallback;
};

const rowCount = (field?: FormField) => {
  if (Array.isArray(field?.rows)) return field.rows.length;
  if (Array.isArray(field?.value)) return field.value.length;
  return 0;
};

export function ProductEditOverview() {
  const locale = useLocale();
  const { hasPublishedDoc, id, versionCount } = useDocumentInfo();

  const summary = useFormFields(([fields]) => {
    const getField = (path: string) => fields[path] as FormField | undefined;

    return {
      categoryCount: rowCount(getField("category")),
      galleryCount: rowCount(getField("gallery")),
      isFeatured: valueAsText(getField("isFeatured")?.value, "Hayır"),
      publicDocCount: rowCount(getField("publicDocs")),
      protectedDocCount: rowCount(getField("protectedDocs")),
      sku: valueAsText(getField("sku")?.value),
      slug: valueAsText(getField("slug")?.value, ""),
      variantCount: rowCount(getField("variants")),
    };
  });

  const publicUrl =
    summary.slug && hasPublishedDoc ? getProductsPath(locale.code === "en" ? "en" : "tr", summary.slug) : "";

  const docCount = summary.publicDocCount + summary.protectedDocCount;

  return (
    <details className="ertip-detail">
      <summary>Ürün bilgileri ve teknik ayrıntılar</summary>
      {publicUrl && <Link href={publicUrl}>Ürünü sitede görüntüle</Link>}
      <div className="ertip-product-overview__stats">
        <span>
          <PackageCheck size={17} />
          <strong>{summary.sku}</strong>
          <small>Ana SKU</small>
        </span>
        <span>
          <Boxes size={17} />
          <strong>
            {summary.variantCount} / {summary.categoryCount}
          </strong>
          <small>Varyant / kategori</small>
        </span>
        <span>
          <ImageIcon size={17} />
          <strong>
            {summary.galleryCount} / {docCount}
          </strong>
          <small>Galeri / doküman</small>
        </span>
        <span>
          <Layers3 size={17} />
          <strong>{summary.isFeatured}</strong>
          <small>Öne çıkar</small>
        </span>
      </div>

      <ProductWorkspaceStudio />
      <div className="ertip-product-overview__footer">
        <span>ID: {id || "Yeni kayıt"}</span>
        <span>Versiyon: {versionCount || 0}</span>
        <span>Durum: {hasPublishedDoc ? "Yayında" : "Taslak"}</span>
      </div>
    </details>
  );
}
