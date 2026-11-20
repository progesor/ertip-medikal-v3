"use client";
import type { CatalogPage, CatalogSection } from "@/types/catalog";
import { pageSections, setPageSections } from "@/lib/catalog/sections";

export function SectionInspector({
  page,
  selectedId,
  disabled,
  onSelect,
  onChange,
}: {
  page: CatalogPage;
  selectedId: string;
  disabled: boolean;
  onSelect: (id: string) => void;
  onChange: (page: CatalogPage) => void;
}) {
  const sections = pageSections(page);
  const section = sections.find((s) => s.id === selectedId) || sections[0];
  const patch = (values: Partial<CatalogSection>) =>
    onChange(
      setPageSections(
        page,
        sections.map((s) => (s.id === section.id ? { ...s, ...values } : s)),
      ),
    );
  const add = () => {
    const id = crypto.randomUUID();
    onChange(
      setPageSections(page, [
        ...sections,
        {
          id,
          title: "Yeni kategori / ürün grubu",
          subtitle: "",
          productIds: [],
          columns: 2,
          layout: "grid",
        },
      ]),
    );
    onSelect(id);
  };
  return (
    <>
      <h3>Ürün grupları</h3>
      <label>
        Düzenlenen bölüm
        <select
          aria-label="Düzenlenen bölüm"
          value={section.id}
          disabled={disabled}
          onChange={(e) => onSelect(e.target.value)}
        >
          {sections.map((s, i) => (
            <option key={s.id} value={s.id}>
              {i + 1} · {s.title || "Başlıksız grup"}
            </option>
          ))}
        </select>
      </label>
      <label>
        Bölüm başlığı
        <input
          value={section.title}
          maxLength={150}
          disabled={disabled}
          onChange={(e) => patch({ title: e.target.value })}
        />
      </label>
      <label>
        Bölüm açıklaması
        <textarea
          value={section.subtitle}
          maxLength={300}
          disabled={disabled}
          onChange={(e) => patch({ subtitle: e.target.value })}
        />
      </label>
      <label>
        Bölüm yerleşimi
        <select
          value={section.layout}
          disabled={disabled}
          onChange={(e) =>
            patch({ layout: e.target.value as CatalogSection["layout"] })
          }
        >
          <option value="grid">Kart ızgarası</option>
          <option value="rows">Yatay satırlar</option>
        </select>
      </label>
      <label>
        Bölüm sütun sayısı
        <select
          value={section.columns}
          disabled={disabled || section.layout === "rows"}
          onChange={(e) => patch({ columns: Number(e.target.value) })}
        >
          {[1, 2, 3].map((n) => (
            <option key={n} value={n}>
              {n} sütun
            </option>
          ))}
        </select>
      </label>
      <button disabled={disabled || sections.length >= 50} onClick={add}>
        + Ürün grubu ekle
      </button>
      <button
        disabled={disabled || sections.length <= 1}
        onClick={() => {
          const next = sections.filter((s) => s.id !== section.id);
          onChange(setPageSections(page, next));
          onSelect(next[0].id);
        }}
      >
        Bölümü kaldır · ürünleri havuza çıkar
      </button>
    </>
  );
}
