"use client";

import { useConfig, useListQuery, useTranslation } from "@payloadcms/ui";
import { getTranslation } from "@payloadcms/translations";
import type { ReactNode } from "react";
import type { Where } from "payload";

type FilterSet = {
  field: string;
  operator: "equals" | "exists" | "in" | "greater_than_equal";
  choices: { label: ReactNode; value: string }[];
};

export function CollectionQuickFilters() {
  const { collectionSlug, query, refineListData } = useListQuery();
  const { getEntityConfig } = useConfig();
  const { i18n } = useTranslation();
  const config = getEntityConfig({ collectionSlug });
  const stateField = config.fields.find(
    (field) =>
      field.type === "select" &&
      ["status", "role", "_status"].includes(field.name),
  );

  let filter: FilterSet;
  if (stateField?.type === "select") {
    filter = {
      field: stateField.name,
      operator: "equals",
      choices: stateField.options.map((option) =>
        typeof option === "string"
          ? { label: option, value: option }
          : { label: getTranslation(option.label, i18n), value: option.value },
      ),
    };
  } else if (collectionSlug === "categories") {
    filter = {
      field: "parent",
      operator: "exists",
      choices: [
        { label: "Ana kategoriler", value: "false" },
        { label: "Alt kategoriler", value: "true" },
      ],
    };
  } else if (collectionSlug === "media" && config.upload) {
    const types = config.upload.mimeTypes ?? [];
    filter = {
      field: "mimeType",
      operator: "in",
      choices: [
        {
          label: "Görseller",
          value: types.filter((t) => t.startsWith("image/")).join(","),
        },
        {
          label: "Videolar",
          value: types.filter((t) => t.startsWith("video/")).join(","),
        },
        { label: "PDF belgeleri", value: "application/pdf" },
      ].filter((choice) => choice.value),
    };
  } else {
    filter = {
      field: collectionSlug === "download-logs" ? "createdAt" : "updatedAt",
      operator: "greater_than_equal",
      choices: [7, 30].map((days) => {
        const since = new Date();
        since.setUTCHours(0, 0, 0, 0);
        since.setUTCDate(since.getUTCDate() - days + 1);
        return { label: `Son ${days} gün`, value: since.toISOString() };
      }),
    };
  }

  const where = query.where ?? {};
  const clause = where[filter.field];
  const current =
    clause && !Array.isArray(clause)
      ? String(clause[filter.operator] ?? "")
      : "";

  function choose(value: string) {
    const next: Where = { ...where };
    const condition = Array.isArray(clause) ? {} : { ...clause };
    if (value) condition[filter.operator] = value;
    else delete condition[filter.operator];
    if (Object.keys(condition).length) next[filter.field] = condition;
    else delete next[filter.field];
    void refineListData({ page: 1, where: next });
  }

  return (
    <div
      className="ertip-quick-filters"
      role="group"
      aria-label="Hızlı filtreler"
    >
      {[{ label: "Tümü", value: "" }, ...filter.choices].map(
        ({ label, value }) => (
          <button
            type="button"
            key={value}
            aria-pressed={current === value}
            onClick={() => choose(value)}
          >
            {label}
          </button>
        ),
      )}
    </div>
  );
}
