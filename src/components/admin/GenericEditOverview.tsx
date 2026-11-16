"use client";

import { FileText, Hash, LayoutPanelTop, ShieldCheck } from "lucide-react";
import { useDocumentInfo, useFormFields } from "@payloadcms/ui";

type FormField = {
  value?: unknown;
};

const getConfigLabel = (config: unknown) => {
  const typedConfig = config as {
    label?: unknown;
    labels?: {
      singular?: unknown;
    };
  };

  if (typeof typedConfig.labels?.singular === "string") {
    return typedConfig.labels.singular;
  }

  if (typeof typedConfig.label === "string") {
    return typedConfig.label;
  }

  return "Kay\u0131t";
};

const asText = (value: unknown, fallback = "Hen\u00fcz girilmedi") => {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Evet" : "Hay\u0131r";
  return fallback;
};

const getCollectionTone = (slug?: string) => {
  if (slug === "quote-requests" || slug === "inquiries") return "Talep y\u00f6netimi";
  if (slug === "download-logs") return "Uyumluluk kayd\u0131";
  if (slug === "pages" || slug === "news") return "\u0130\u00e7erik y\u00f6netimi";
  if (slug === "media") return "Medya k\u00fct\u00fcphanesi";
  if (slug === "users") return "Sistem kullan\u0131c\u0131s\u0131";
  return "Kay\u0131t \u00e7al\u0131\u015fma alan\u0131";
};

export function GenericEditOverview() {
  const { docConfig, hasPublishedDoc, id, title, versionCount } =
    useDocumentInfo();

  const summary = useFormFields(([fields]) => {
    const get = (path: string) => fields[path] as FormField | undefined;

    return {
      email: asText(get("email")?.value, ""),
      slug: asText(get("slug")?.value, ""),
      status: asText(get("status")?.value, ""),
      subtitle:
        asText(get("excerpt")?.value, "") ||
        asText(get("description")?.value, "") ||
        asText(get("message")?.value, "") ||
        asText(get("alt")?.value, "") ||
        asText(get("company")?.value, ""),
    };
  });

  const collectionSlug = "slug" in (docConfig || {}) ? docConfig?.slug : "";
  const label = getConfigLabel(docConfig);

  return (
    <section className="ertip-edit-overview" aria-label={"Kay\u0131t \u00f6zeti"}>
      <div className="ertip-edit-overview__main">
        <span className="ertip-edit-overview__eyebrow">
          {getCollectionTone(collectionSlug)}
        </span>
        <h2>{title || `Yeni ${label}`}</h2>
        <p>{summary.subtitle || `${label} detaylar\u0131n\u0131 d\u00fczenleyin.`}</p>
      </div>

      <div className="ertip-edit-overview__stats">
        <span>
          <Hash size={16} />
          <strong>{id || "Yeni"}</strong>
          <small>{"Kay\u0131t ID"}</small>
        </span>
        <span>
          <LayoutPanelTop size={16} />
          <strong>{summary.slug || collectionSlug || label}</strong>
          <small>{"Tan\u0131mlay\u0131c\u0131"}</small>
        </span>
        <span>
          <ShieldCheck size={16} />
          <strong>{summary.status || (hasPublishedDoc ? "Yay\u0131nda" : "Aktif")}</strong>
          <small>Durum</small>
        </span>
        <span>
          <FileText size={16} />
          <strong>{versionCount || 0}</strong>
          <small>Versiyon</small>
        </span>
      </div>

      {summary.email ? (
        <div className="ertip-edit-overview__footer">
          {"\u0130leti\u015fim"}: {summary.email}
        </div>
      ) : null}
    </section>
  );
}
