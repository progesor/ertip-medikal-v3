"use client";

import { FileText, Hash, Link2 } from "lucide-react";
import { useDocumentInfo, useFormFields } from "@payloadcms/ui";

export function GenericEditOverview() {
  const { docConfig, id, versionCount } = useDocumentInfo();
  const slug = useFormFields(([fields]) => fields.slug?.value);
  if (!id) return null;

  return (
    <details className="ertip-detail">
      <summary>Kayıt bilgileri</summary>
      <div className="ertip-edit-overview__stats">
        <span>
          <Hash size={16} />
          <strong>{id}</strong>
          <small>Kayıt numarası</small>
        </span>
        {typeof slug === "string" && slug && (
          <span>
            <Link2 size={16} />
            <strong>{slug}</strong>
            <small>Sayfa adresi</small>
          </span>
        )}
        {docConfig?.versions && (
          <span>
            <FileText size={16} />
            <strong>{versionCount || 0}</strong>
            <small>Sürüm sayısı</small>
          </span>
        )}
      </div>

    </details>
  );
}
