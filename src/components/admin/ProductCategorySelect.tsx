"use client";

import { useListQuery } from "@payloadcms/ui";

type CategoryOption = { label: string; ids: number[] };

export function ProductCategorySelect({ options }: { options: CategoryOption[] }) {
  const { query, refineListData } = useListQuery();
  const where = query.where || {};
  const category = where.category;
  const selected = category && "in" in category ? String(category.in) : "";

  function chooseCategory(value: string) {
    const nextWhere = { ...where };
    if (value) nextWhere.category = { in: value.split(",").map(Number) };
    else delete nextWhere.category;
    void refineListData({ where: nextWhere, page: 1, sort: "_order" });
  }

  return (
    <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
      Ürün kategorisi
      <select
        value={selected}
        onChange={(event) => chooseCategory(event.target.value)}
        style={{ maxWidth: "65%", padding: "0.45rem", color: "var(--theme-text)", background: "var(--theme-input-bg)", border: "1px solid var(--theme-elevation-250)" }}
      >
        <option value="">Tüm kategoriler</option>
        {options.map(({ label, ids }) => <option key={ids[0]} value={ids.join(",")}>{label}</option>)}
      </select>
    </label>
  );
}
