"use client";

import {
  Boxes,
  Image as ImageIcon,
  Layers3,
  PackageCheck,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useDocumentInfo, useFormFields } from "@payloadcms/ui";

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
  const { hasPublishedDoc, id, versionCount } = useDocumentInfo();

  const summary = useFormFields(([fields]) => {
    const getField = (path: string) => fields[path] as FormField | undefined;

    return {
      categoryCount: rowCount(getField("category")),
      galleryCount: rowCount(getField("gallery")),
      isFeatured: valueAsText(getField("isFeatured")?.value, "Hayır"),
      publicDocCount: rowCount(getField("publicDocs")),
      protectedDocCount: rowCount(getField("protectedDocs")),
      shortDescription: valueAsText(
        getField("shortDescription")?.value,
        "Kısa ürün özeti girilmedi",
      ),
      sku: valueAsText(getField("sku")?.value),
      slug: valueAsText(getField("slug")?.value, ""),
      title: valueAsText(getField("title")?.value, "Yeni ürün"),
      variantCount: rowCount(getField("variants")),
    };
  });

  const publicUrl = useMemo(
    () => (summary.slug ? `/urunler/${summary.slug}` : ""),
    [summary.slug],
  );

  const docCount = summary.publicDocCount + summary.protectedDocCount;

  return (
    <section className="ertip-product-overview" aria-label="Ürün özeti">
      <div className="ertip-product-overview__main">
        <div>
          <span className="ertip-product-overview__eyebrow">Ürün Dosyası</span>
          <h2>{summary.title}</h2>
          <p>{summary.shortDescription}</p>
        </div>

        <div className="ertip-product-overview__actions">
          {publicUrl ? <Link href={publicUrl}>Önizleme</Link> : null}
          <span>{hasPublishedDoc ? "Yayında" : "Taslak"}</span>
        </div>
      </div>

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

      <div className="ertip-product-overview__footer">
        <span>ID: {id || "Yeni kayıt"}</span>
        <span>Versiyon: {versionCount || 0}</span>
        <span>Durum: {hasPublishedDoc ? "Yayında" : "Taslak"}</span>
      </div>
    </section>
  );
}
