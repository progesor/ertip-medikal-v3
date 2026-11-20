"use client";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Combine,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type {
  CatalogConfig,
  CatalogPage,
  CatalogProduct,
} from "@/types/catalog";
import { automaticPages } from "@/lib/catalog/pagePlan";
import { mergeCatalogPage, moveCatalogPage } from "@/lib/catalog/pageEditing";
import { pageSections } from "@/lib/catalog/sections";
import styles from "./PagePlan.module.css";

export function PagePlan({
  config,
  products,
  disabled,
  onChange,
  onEdit,
  onPreview,
}: {
  config: CatalogConfig;
  products: CatalogProduct[];
  disabled: boolean;
  onChange: (patch: Partial<CatalogConfig>) => void;
  onEdit: (id: string) => void;
  onPreview: () => void;
}) {
  const [dragged, setDragged] = useState("");
  const pages =
    config.pageMode === "manual"
      ? config.pages
      : automaticPages(products, config);
  const save = (next: CatalogPage[]) =>
    onChange({ pageMode: "manual", pages: next });
  const used = new Set(pages.flatMap((p) => p.productIds));
  const add = (kind: CatalogPage["kind"]) => {
    const page: CatalogPage = {
      id: crypto.randomUUID(),
      kind,
      title: kind === "divider" ? "Yeni bölüm" : "Yeni ürün sayfası",
      subtitle: "",
      productIds: [],
      density: config.density,
      layout: config.layout,
    };
    save([...pages, page]);
    onEdit(page.id);
  };
  return (
    <section className={styles.plan} aria-label="Sayfa yapısı">
      <div className={styles.heading}>
        <div>
          <h2>Sayfa planı</h2>
          <p>Katalog akışını kurun; ayrıntıları görsel editörde düzenleyin.</p>
        </div>
        <button
          disabled={disabled || pages.length >= 500}
          onClick={() => add("products")}
        >
          <Plus size={14} /> Ürün sayfası
        </button>
        <button
          disabled={disabled || pages.length >= 500}
          onClick={() => add("divider")}
        >
          <Plus size={14} /> Bölüm ayracı
        </button>
      </div>
      <div className={styles.summary}>
        <span>{pages.length} plan sayfası</span>
        <span>{used.size} yerleştirilen ürün</span>
        <span>{products.filter((p) => !used.has(p.id)).length} havuzda</span>
      </div>
      <p className={styles.note}>
        Birleştirilen kategoriler kendi başlıklarını korur. Sığmayan içerik
        PDF'de devam sayfasına aktarılır. İşlemleri üstteki Geri al ile geri
        alabilirsiniz.
      </p>
      {!products.length && (
        <button disabled={disabled} onClick={onPreview}>
          Ürünleri ve planı hazırla
        </button>
      )}
      <div className={styles.list}>
        {pages.map((page, index) => (
          <article
            key={page.id}
            className={styles.row}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (!disabled && dragged)
                save(moveCatalogPage(pages, dragged, page.id));
              setDragged("");
            }}
          >
            <button
              className={styles.grip}
              disabled={disabled}
              draggable={!disabled}
              onDragStart={() => setDragged(page.id)}
              onDragEnd={() => setDragged("")}
              aria-label={`Sayfa ${index + 1} sürükle`}
            >
              <GripVertical size={16} />
            </button>
            <span className={styles.number}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className={styles.content}>
              <strong>{page.title || "Ürün sayfası"}</strong>
              <small>
                {page.kind === "divider"
                  ? "Bölüm ayracı"
                  : `${page.productIds.length} ürün · ${pageSections(page).length} bölüm`}
              </small>
              {page.kind === "products" && (
                <div className={styles.sections}>
                  {pageSections(page).map((s) => (
                    <span key={s.id}>
                      {s.title || "Başlıksız grup"} <b>{s.productIds.length}</b>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.actions}>
              <button
                disabled={disabled || index === 0}
                aria-label={`Sayfa ${index + 1} yukarı`}
                onClick={() =>
                  save(moveCatalogPage(pages, page.id, pages[index - 1].id))
                }
              >
                <ArrowUp size={14} />
              </button>
              <button
                disabled={disabled || index === pages.length - 1}
                aria-label={`Sayfa ${index + 1} aşağı`}
                onClick={() =>
                  save(moveCatalogPage(pages, pages[index + 1].id, page.id))
                }
              >
                <ArrowDown size={14} />
              </button>
              <button
                disabled={
                  disabled ||
                  page.kind !== "products" ||
                  pages[index + 1]?.kind !== "products" ||
                  pageSections(page).length +
                    pageSections(pages[index + 1]).length >
                    50
                }
                onClick={() => save(mergeCatalogPage(pages, page.id))}
              >
                <Combine size={14} /> Sonrakiyle birleştir
              </button>
              <button disabled={disabled} onClick={() => onEdit(page.id)}>
                <Pencil size={14} /> Görsel düzenle
              </button>
              <button
                disabled={disabled}
                aria-label={`Sayfa ${index + 1} kaldır`}
                onClick={() => save(pages.filter((p) => p.id !== page.id))}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>
      <button
        disabled={disabled || config.pageMode === "auto"}
        onClick={() => onChange({ pageMode: "auto" })}
      >
        Otomatik plana dön
      </button>
    </section>
  );
}
