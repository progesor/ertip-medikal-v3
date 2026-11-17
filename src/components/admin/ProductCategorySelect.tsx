"use client";

import { useListQuery } from "@payloadcms/ui";

type CategoryOption = { label: string; ids: number[] };

export function ProductCategorySelect({
  options,
}: {
  options: CategoryOption[];
}) {
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
    <div className="ertip-catalog-tools">
      <label>
        Ürün kategorisi
        <select
          value={selected}
          onChange={(event) => chooseCategory(event.target.value)}
        >
          <option value="">Tüm kategoriler</option>
          {options.map(({ label, ids }) => (
            <option key={ids[0]} value={ids.join(",")}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <small>
        Katalog sırasını değiştirmek için ürünleri satır başındaki tutamaçtan
        sürükleyin.
      </small>
    </div>
  );
}
