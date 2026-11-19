"use client";
import { useState } from "react";
import { GripVertical, ArrowUp, ArrowDown, Plus, Trash2 } from "lucide-react";
import type {
  CatalogConfig,
  CatalogPage,
  CatalogProduct,
} from "@/types/catalog";
import { automaticPages } from "@/lib/catalog/pagePlan";
import { moveCatalogPage, moveCatalogProduct } from "@/lib/catalog/pageEditing";
import styles from "./PageBoard.module.css";

type Props = {
  config: CatalogConfig;
  products: CatalogProduct[];
  disabled: boolean;
  onChange: (patch: Partial<CatalogConfig>) => void;
};
export function PageBoard({ config, products, disabled, onChange }: Props) {
  const [search, setSearch] = useState("");
  const pages =
    config.pageMode === "manual"
      ? config.pages
      : automaticPages(products, config);
  const save = (next: CatalogPage[]) =>
    onChange({ pageMode: "manual", pages: next });
  const patch = (id: string, update: Partial<CatalogPage>) =>
    save(pages.map((page) => (page.id === id ? { ...page, ...update } : page)));
  const used = new Set(pages.flatMap((page) => page.productIds));
  const available = products.filter(
    (p) =>
      !used.has(p.id) &&
      p.title.toLocaleLowerCase("tr").includes(search.toLocaleLowerCase("tr")),
  );
  const add = (kind: "products" | "divider") =>
    save([
      ...pages,
      {
        id: crypto.randomUUID(),
        kind,
        title: kind === "divider" ? "Yeni bölüm" : "",
        subtitle: "",
        productIds: [],
        density: config.density,
        layout: config.layout,
      },
    ]);
  const drop = (
    event: React.DragEvent,
    target: CatalogPage,
    index?: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    try {
      const value = JSON.parse(
        event.dataTransfer.getData("application/ertip-catalog"),
      );
      if (value.kind === "page" && typeof value.id === "string")
        save(moveCatalogPage(pages, value.id, target.id));
      if (value.kind === "product" && products.some((p) => p.id === value.id))
        save(moveCatalogProduct(pages, value.id, target.id, index));
    } catch {
      /* External drops are ignored. */
    }
  };
  const drag = (event: React.DragEvent, kind: string, id: string | number) => {
    event.stopPropagation();
    event.dataTransfer.setData(
      "application/ertip-catalog",
      JSON.stringify({ kind, id }),
    );
    event.dataTransfer.effectAllowed = "move";
  };
  return (
    <section className={styles.board} aria-label="Sayfa düzenleyici">
      <div className={styles.toolbar}>
        <div>
          <h2>Sayfa planı</h2>
          <p>Sayfaları sıralayın, ürünleri sayfalar arasında taşıyın.</p>
        </div>
        <button
          disabled={disabled || !products.length}
          onClick={() => save(automaticPages(products, config))}
        >
          Otomatik yerleşimden başla
        </button>
        <button
          disabled={disabled}
          onClick={() => onChange({ pageMode: "auto", pages: [] })}
        >
          Otomatik moda dön
        </button>
      </div>
      <p className={styles.hint}>
        {config.pageMode === "auto"
          ? "Otomatik plan gösteriliyor. İlk düzenlemeniz bu planı sabitler."
          : "Manuel plan · yeni ürünler aşağıdaki yerleştirilmeyenler alanında görünür."}{" "}
        Uzun içerik için gerektiğinde ek sayfa oluşur; kesin sayfa numaraları
        önizlemede hesaplanır.
      </p>
      {!products.length && (
        <p>Ürün havuzunu hazırlamak için önce Önizle düğmesine basın.</p>
      )}
      <div className={styles.pages}>
        {pages.map((page, index) => (
          <article
            key={page.id}
            className={styles.page}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }}
            onDrop={(e) => drop(e, page)}
          >
            <header>
              <button
                draggable={!disabled}
                onDragStart={(e) => drag(e, "page", page.id)}
                aria-label={"Sayfa " + (index + 1) + " sürükle"}
              >
                <GripVertical size={16} />
              </button>
              <strong>
                {String(index + 1).padStart(2, "0")} ·{" "}
                {page.kind === "divider" ? "Bölüm ayracı" : "Ürün sayfası"}
              </strong>
              <button
                aria-label={"Sayfa " + (index + 1) + " yukarı"}
                disabled={disabled || index === 0}
                onClick={() =>
                  save(moveCatalogPage(pages, page.id, pages[index - 1].id))
                }
              >
                <ArrowUp size={14} />
              </button>
              <button
                aria-label={"Sayfa " + (index + 1) + " aşağı"}
                disabled={disabled || index === pages.length - 1}
                onClick={() => {
                  const next = [...pages];
                  [next[index], next[index + 1]] = [
                    next[index + 1],
                    next[index],
                  ];
                  save(next);
                }}
              >
                <ArrowDown size={14} />
              </button>
              <button
                aria-label={"Sayfa " + (index + 1) + " kaldır"}
                disabled={disabled}
                onClick={() => save(pages.filter((p) => p.id !== page.id))}
              >
                <Trash2 size={14} />
              </button>
            </header>
            <label>
              Sayfa {index + 1} başlığı
              <input
                value={page.title}
                maxLength={150}
                disabled={disabled}
                onChange={(e) => patch(page.id, { title: e.target.value })}
              />
            </label>
            {page.kind === "divider" ? (
              <label>
                Bölüm açıklaması
                <textarea
                  value={page.subtitle}
                  maxLength={300}
                  disabled={disabled}
                  onChange={(e) => patch(page.id, { subtitle: e.target.value })}
                />
              </label>
            ) : (
              <>
                <div className={styles.row}>
                  <label>
                    Sayfa {index + 1} yerleşimi
                    <select
                      value={page.layout}
                      disabled={disabled}
                      onChange={(e) =>
                        patch(page.id, {
                          layout: e.target.value as CatalogPage["layout"],
                        })
                      }
                    >
                      <option value="grid">Dengeli kartlar</option>
                      <option value="rows">Yatay ürün satırları</option>
                      <option value="spotlight">Ürün vitrini</option>
                    </select>
                  </label>
                  <label>
                    Sayfa {index + 1} yoğunluğu
                    <select
                      value={page.density}
                      disabled={disabled || page.layout === "spotlight"}
                      onChange={(e) =>
                        patch(page.id, {
                          density: e.target.value as CatalogPage["density"],
                        })
                      }
                    >
                      {["1", "2", "4", "6", "9"].map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className={styles.dropzone}>
                  {page.productIds.map((id, i) => {
                    const product = products.find((p) => p.id === id);
                    return (
                      <div
                        key={id}
                        draggable={!disabled}
                        onDragStart={(e) => drag(e, "product", id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => drop(e, page, i)}
                        className={styles.product}
                      >
                        <GripVertical size={14} />
                        <span>{product?.title || "#" + id}</span>
                        <select
                          aria-label={(product?.title || id) + " taşı"}
                          value=""
                          disabled={disabled}
                          onChange={(e) => {
                            if (
                              e.target.value === "@up" ||
                              e.target.value === "@down"
                            ) {
                              const ids = [...page.productIds];
                              const target =
                                i + (e.target.value === "@up" ? -1 : 1);
                              if (target >= 0 && target < ids.length) {
                                [ids[i], ids[target]] = [ids[target], ids[i]];
                                patch(page.id, { productIds: ids });
                              }
                              return;
                            }
                            if (e.target.value)
                              save(
                                moveCatalogProduct(pages, id, e.target.value),
                              );
                          }}
                        >
                          <option value="">Taşı…</option>
                          <option value="@up" disabled={i === 0}>
                            Sayfada yukarı
                          </option>
                          <option
                            value="@down"
                            disabled={i === page.productIds.length - 1}
                          >
                            Sayfada aşağı
                          </option>
                          {pages
                            .filter(
                              (p) => p.kind === "products" && p.id !== page.id,
                            )
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {pages.indexOf(p) + 1} ·{" "}
                                {p.title || "Ürün sayfası"}
                              </option>
                            ))}
                        </select>
                        <button
                          aria-label={
                            (product?.title || id) + " sayfadan çıkar"
                          }
                          disabled={disabled}
                          onClick={() =>
                            patch(page.id, {
                              productIds: page.productIds.filter(
                                (n) => n !== id,
                              ),
                            })
                          }
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                  {!page.productIds.length && <p>Ürünleri buraya bırakın</p>}
                </div>
                <select
                  aria-label={"Sayfa " + (index + 1) + " ürün ekle"}
                  value=""
                  disabled={disabled}
                  onChange={(e) => {
                    if (e.target.value)
                      save(
                        moveCatalogProduct(
                          pages,
                          Number(e.target.value),
                          page.id,
                        ),
                      );
                  }}
                >
                  <option value="">Ürün ekle…</option>
                  {products
                    .filter((p) => !page.productIds.includes(p.id))
                    .map((p) => (
                      <option value={p.id} key={p.id}>
                        {p.title}
                      </option>
                    ))}
                </select>
              </>
            )}
          </article>
        ))}
      </div>
      <div className={styles.toolbar}>
        <button disabled={disabled} onClick={() => add("products")}>
          <Plus size={15} />
          Ürün sayfası
        </button>
        <button disabled={disabled} onClick={() => add("divider")}>
          <Plus size={15} />
          Bölüm ayracı
        </button>
      </div>
      <details open={available.length > 0}>
        <summary>
          Yerleştirilmeyen ürünler ·{" "}
          {products.filter((p) => !used.has(p.id)).length}
        </summary>
        <input
          aria-label="Yerleştirilmeyen ürün ara"
          placeholder="Ürün ara"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.pool}>
          {available.map((product) => (
            <div
              key={product.id}
              draggable={!disabled}
              onDragStart={(e) => drag(e, "product", product.id)}
              className={styles.product}
            >
              <GripVertical size={14} />
              <span>{product.title}</span>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}
