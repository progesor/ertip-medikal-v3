"use client";

import React from "react";
import { useRowLabel } from "@payloadcms/ui";

type RowData = Record<string, any>;

function useAdminRow() {
  return useRowLabel<RowData>();
}

export function SpecRowLabel() {
  const { data, rowNumber } = useAdminRow();
  return (
    <span>
      {data?.key || `Teknik özellik ${(rowNumber ?? 0) + 1}`}
      {data?.value ? `: ${data.value}` : ""}
    </span>
  );
}

export function GalleryRowLabel() {
  const { data, rowNumber } = useAdminRow();
  const imageName =
    typeof data?.image === "object"
      ? data.image.alt || data.image.filename
      : undefined;

  return <span>{imageName || `Galeri görseli ${(rowNumber ?? 0) + 1}`}</span>;
}

export function AttributeRowLabel() {
  const { data, rowNumber } = useAdminRow();
  return (
    <span>
      {data?.name || `Varyant özelliği ${(rowNumber ?? 0) + 1}`}
      {data?.values ? ` (${data.values})` : ""}
    </span>
  );
}

export function VariantRowLabel() {
  const { data, rowNumber } = useAdminRow();
  return (
    <span className="ertip-row-label">
      <span>{data?.title || `Varyant ${(rowNumber ?? 0) + 1}`}</span>
      {data?.sku ? <small>{data.sku}</small> : null}
    </span>
  );
}

export function PackagingRowLabel() {
  const { data, rowNumber } = useAdminRow();
  return (
    <span>
      {data?.packageLabel || `Paketleme seçeneği ${(rowNumber ?? 0) + 1}`}
      {data?.quantity ? ` · ${data.quantity} adet` : ""}
    </span>
  );
}

export function DocumentRowLabel() {
  const { data, rowNumber } = useAdminRow();
  return <span>{data?.label || `Belge ${(rowNumber ?? 0) + 1}`}</span>;
}

export function AccessCodeRowLabel() {
  const { data, rowNumber } = useAdminRow();
  return (
    <span>
      {data?.code || `Erişim kodu ${(rowNumber ?? 0) + 1}`}
      {data?.isActive === false ? " · Pasif" : ""}
    </span>
  );
}
