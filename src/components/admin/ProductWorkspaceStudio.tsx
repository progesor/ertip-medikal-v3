"use client";

import {
  FileText,
  Image as ImageIcon,
  Package,
  Ruler,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useFormFields } from "@payloadcms/ui";

type FormField = {
  value?: unknown;
};

const asArray = (value: unknown) => (Array.isArray(value) ? value : []);

const countDocs = (publicDocs: unknown[], protectedDocs: unknown[]) =>
  publicDocs.length + protectedDocs.length;

const countRows = (
  fields: Record<string, FormField>,
  value: unknown,
  path: string,
) => {
  const valueRows = asArray(value);
  if (valueRows.length) return valueRows.length;

  const indexes = new Set<string>();
  Object.keys(fields).forEach((key) => {
    const match = key.match(new RegExp(`^${path}\\.([0-9]+)\\.`));
    if (match) indexes.add(match[1]);
  });

  return indexes.size;
};

export function ProductWorkspaceStudio() {
  const data = useFormFields(([fields]) => {
    const get = (path: string) => fields[path] as FormField | undefined;
    const publicDocs = asArray(get("publicDocs")?.value);
    const protectedDocs = asArray(get("protectedDocs")?.value);

    return {
      attributes: countRows(fields, get("attributes")?.value, "attributes"),
      docs:
        countDocs(publicDocs, protectedDocs) ||
        countRows(fields, undefined, "publicDocs") +
          countRows(fields, undefined, "protectedDocs"),
      gallery: countRows(fields, get("gallery")?.value, "gallery"),
      packaging: countRows(fields, get("packaging")?.value, "packaging"),
      specs: countRows(fields, get("specs")?.value, "specs"),
      variants: countRows(fields, get("variants")?.value, "variants"),
    };
  });

  return (
    <section className="ertip-product-workspace" aria-label="Ürün çalışma özeti">
      <article>
        <div className="ertip-product-workspace__icon">
          <Ruler size={18} />
          <SlidersHorizontal size={18} />
        </div>
        <strong>Teknik yapı</strong>
        <p>
          {data.specs} teknik özellik, {data.attributes} varyant parametresi
        </p>
      </article>
      <article>
        <div className="ertip-product-workspace__icon">
          <Package size={18} />
        </div>
        <strong>Varyantlar</strong>
        <p>{data.variants} SKU varyantı</p>
      </article>
      <article>
        <div className="ertip-product-workspace__icon">
          <ImageIcon size={18} />
          <FileText size={18} />
        </div>
        <strong>Medya ve doküman</strong>
        <p>
          {data.gallery} galeri görseli, {data.docs} doküman
        </p>
      </article>
      <article>
        <div className="ertip-product-workspace__icon">
          <ShieldCheck size={18} />
        </div>
        <strong>Lojistik</strong>
        <p>{data.packaging} paket tanımı</p>
      </article>
    </section>
  );
}
