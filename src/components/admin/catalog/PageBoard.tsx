"use client";
import { useState } from "react";
import Image from "next/image";
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Copy,
  Eye,
  Scissors,
  Combine,
  ImagePlus,
} from "lucide-react";
import type {
  CatalogConfig,
  CatalogPage,
  CatalogProduct,
  CatalogPagePreview,
} from "@/types/catalog";
import { automaticPages } from "@/lib/catalog/pagePlan";
import {
  moveCatalogPage,
  moveCatalogProduct,
  moveCatalogProducts,
  splitCatalogPage,
  mergeCatalogPage,
  pagesFromPreview,
} from "@/lib/catalog/pageEditing";
import styles from "./PageBoard.module.css";

type Props = {
  config: CatalogConfig;
  products: CatalogProduct[];
  sheets: CatalogPagePreview[];
  stale: boolean;
  disabled: boolean;
  onChange: (patch: Partial<CatalogConfig>) => void;
  onEditProduct: (id: number) => void;
  onPreview: (pageId?: string) => void;
};
export function PageBoard({
  config,
  products,
  sheets,
  stale,
  disabled,
  onChange,
  onEditProduct,
  onPreview,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedPageId, setSelectedPageId] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [over, setOver] = useState("");
  const pages =
    config.pageMode === "manual"
      ? config.pages
      : automaticPages(products, config);
  const page = pages.find((p) => p.id === selectedPageId) || pages[0];
  const index = page ? pages.indexOf(page) : -1;
  const byId = new Map(
    products.map((original) => {
      const p = { ...original, ...original.sourceDefaults };
      const custom = config.overrides.find((o) => o.productId === p.id);
      const image =
        custom?.imageId === null
          ? null
          : [p.image, ...p.gallery].find((i) => i?.id === custom?.imageId) ||
            p.image;
      return [p.id, { ...p, ...custom, id: p.id, image }];
    }),
  );
  const used = new Set(pages.flatMap((p) => p.productIds));
  const unplaced = products.filter((p) => !used.has(p.id));
  const pool = products.filter(
    (p) =>
      (showAll || !used.has(p.id)) &&
      (p.title + " " + p.sku)
        .toLocaleLowerCase("tr")
        .includes(search.toLocaleLowerCase("tr")),
  );
  const save = (next: CatalogPage[]) =>
    onChange({ pageMode: "manual", pages: next });
  const selectPage = (id: string) => {
    setSelectedPageId(id);
    setSelectedIds([]);
  };
  const patch = (update: Partial<CatalogPage>) =>
    page &&
    save(pages.map((p) => (p.id === page.id ? { ...p, ...update } : p)));
  const check = (id: number) =>
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id],
    );
  const add = (kind: "products" | "divider", copy = false) => {
    const id = crypto.randomUUID();
    const next: CatalogPage =
      copy && page
        ? { ...page, id, productIds: [] }
        : {
            id,
            kind,
            title: kind === "divider" ? "Yeni bölüm" : "",
            subtitle: "",
            productIds: [],
            density: config.density,
            layout: config.layout,
          };
    const list = [...pages];
    list.splice(index + 1, 0, next);
    save(list);
    selectPage(id);
  };
  const move = (targetId: string, ids = selectedIds) => {
    save(moveCatalogProducts(pages, ids, targetId));
    setSelectedIds([]);
    setSelectedPageId(targetId);
  };
  const remove = (ids: number[]) => {
    save(
      pages.map((p) => ({
        ...p,
        productIds: p.productIds.filter((id) => !ids.includes(id)),
      })),
    );
    setSelectedIds([]);
  };
  const reorder = (id: number, step: number) => {
    if (!page) return;
    const ids = [...page.productIds],
      i = ids.indexOf(id),
      to = i + step;
    if (i < 0 || to < 0 || to >= ids.length) return;
    [ids[i], ids[to]] = [ids[to], ids[i]];
    patch({ productIds: ids });
  };
  const drag = (event: React.DragEvent, kind: string, id: string | number) => {
    event.stopPropagation();
    event.dataTransfer.setData(
      "application/ertip-catalog",
      JSON.stringify({
        kind,
        id,
        ids:
          kind === "product" && selectedIds.includes(Number(id))
            ? selectedIds
            : [id],
      }),
    );
    event.dataTransfer.effectAllowed = "move";
  };
  const drop = (
    event: React.DragEvent,
    target: CatalogPage,
    position?: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setOver("");
    if (disabled) return;
    try {
      const value = JSON.parse(
        event.dataTransfer.getData("application/ertip-catalog"),
      );
      if (value.kind === "page" && typeof value.id === "string")
        save(moveCatalogPage(pages, value.id, target.id));
      if (value.kind === "product" && target.kind === "products") {
        const ids = Array.isArray(value.ids)
          ? value.ids.filter((id: number) => products.some((p) => p.id === id))
          : [];
        if (ids.length > 1) save(moveCatalogProducts(pages, ids, target.id));
        else if (products.some((p) => p.id === value.id))
          save(moveCatalogProduct(pages, value.id, target.id, position));
      }
    } catch {
      /* Ignore drops from outside this editor. */
    }
  };
  const accept = (event: React.DragEvent, id: string) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    setOver(id);
  };
  const actual =
    page && !stale
      ? sheets.filter((s) => s.id === page.id).map((s) => s.page)
      : [];
  return (
    <section className={styles.board} aria-label="Görsel sayfa düzenleyici">
      <div className={styles.toolbar}>
        <div>
          <h2>Sayfa atölyesi</h2>
          <p>
            {pages.length} plan sayfası · {used.size} yerleştirilen ürün ·{" "}
            {unplaced.length} bekleyen
          </p>
        </div>
        <button
          disabled={disabled || !products.length || stale || !sheets.length}
          onClick={() => {
            const fixed = pagesFromPreview(pages, sheets);
            if (fixed.length) {
              save(fixed);
              selectPage(fixed[0].id);
            }
          }}
        >
          Önizlemedeki sayfaları sabitle
        </button>
        <button
          disabled={disabled || config.pageMode === "auto"}
          onClick={() => {
            onChange({ pageMode: "auto" });
            setSelectedIds([]);
          }}
        >
          Otomatik moda dön
        </button>
      </div>
      <p className={styles.hint}>
        {config.pageMode === "auto"
          ? "Otomatik plan · ilk değişiklik elle düzenlemeyi başlatır."
          : "Elle düzenleme · tüm işlemler üstteki Geri al ile geri alınabilir."}{" "}
        Görseller yerleşim taslağıdır; kesin baskı düzeni PDF önizlemesinde
        hesaplanır.
      </p>
      {!products.length && (
        <button disabled={disabled} onClick={() => onPreview()}>
          Ürünleri ve önizlemeyi hazırla
        </button>
      )}
      <div className={styles.workspace}>
        <nav className={styles.navigator} aria-label="Plan sayfaları">
          {pages.map((p, i) => (
            <div
              key={p.id}
              className={styles.navItem}
              data-active={page?.id === p.id}
              data-over={over === p.id}
              draggable={!disabled}
              onDragStart={(e) => drag(e, "page", p.id)}
              onDragEnd={() => setOver("")}
              onDragOver={(e) => accept(e, p.id)}
              onDrop={(e) => drop(e, p)}
            >
              <button
                disabled={disabled}
                aria-label={"Plan sayfası " + (i + 1) + " seç"}
                aria-pressed={page?.id === p.id}
                draggable={!disabled}
                onDragStart={(e) => drag(e, "page", p.id)}
                onClick={() => selectPage(p.id)}
              >
                <span
                  className={styles.mini}
                  data-divider={p.kind === "divider"}
                >
                  {p.kind === "divider" ? (
                    <strong>{p.title || "Bölüm"}</strong>
                  ) : (
                    p.productIds
                      .slice(0, 9)
                      .map((id) => (
                        <span key={id}>
                          {byId.get(id)?.image && (
                            <Image
                              src={byId.get(id)!.image!.url}
                              width={60}
                              height={44}
                              unoptimized
                              alt=""
                            />
                          )}
                        </span>
                      ))
                  )}
                  {!p.productIds.length && p.kind === "products" && (
                    <ImagePlus size={22} />
                  )}
                </span>
                <span>
                  <b>{String(i + 1).padStart(2, "0")}</b>{" "}
                  {p.title || "Ürün sayfası"}
                </span>
                <small>
                  {p.kind === "divider"
                    ? "Bölüm ayracı"
                    : p.productIds.length + " ürün"}
                </small>
              </button>
            </div>
          ))}
          <button
            disabled={disabled || pages.length >= 500}
            onClick={() => add("products")}
          >
            <Plus size={14} /> Sayfa
          </button>
          <button
            disabled={disabled || pages.length >= 500}
            onClick={() => add("divider")}
          >
            <Plus size={14} /> Bölüm
          </button>
        </nav>
        <div className={styles.stage}>
          {page ? (
            <>
              <div className={styles.toolbar}>
                <strong>
                  Sayfa {index + 1}
                  {actual.length ? " · PDF " + actual.join(", ") : ""}
                </strong>
                <button
                  disabled={
                    disabled ||
                    (!page.productIds.length && page.kind !== "divider")
                  }
                  onClick={() => onPreview(page.id)}
                >
                  <Eye size={14} /> PDF'de gör
                </button>
              </div>
              <div
                className={styles.sheet}
                data-layout={page.layout}
                data-divider={page.kind === "divider"}
                style={
                  {
                    "--page-accent": page.accent || config.color,
                  } as React.CSSProperties
                }
                onDragOver={(e) => accept(e, "canvas-" + page.id)}
                onDrop={(e) => drop(e, page)}
                data-over={over === "canvas-" + page.id}
              >
                <div className={styles.sheetHead}>
                  <b>ERTIP</b>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                {page.kind === "divider" ? (
                  <div className={styles.divider}>
                    <span>BÖLÜM</span>
                    <h2>{page.title}</h2>
                    <p>{page.subtitle}</p>
                  </div>
                ) : (
                  <>
                    <h3>{page.title || "Ürün koleksiyonu"}</h3>
                    <div
                      className={styles.cards}
                      style={
                        {
                          "--columns":
                            page.layout === "grid"
                              ? page.productIds.length >= 5
                                ? 3
                                : 2
                              : 1,
                        } as React.CSSProperties
                      }
                    >
                      {page.productIds.map((id, i) => {
                        const product = byId.get(id);
                        return (
                          <article
                            key={id}
                            className={styles.card}
                            data-selected={selectedIds.includes(id)}
                            data-over={over === "product-" + id}
                            draggable={!disabled}
                            onDragStart={(e) => drag(e, "product", id)}
                            onDragEnd={() => setOver("")}
                            onDragOver={(e) => accept(e, "product-" + id)}
                            onDrop={(e) => drop(e, page, i)}
                          >
                            <div className={styles.cardTools}>
                              <label>
                                <input
                                  type="checkbox"
                                  disabled={disabled}
                                  checked={selectedIds.includes(id)}
                                  onChange={() => check(id)}
                                  aria-label={(product?.title || id) + " seç"}
                                />
                              </label>
                              <button
                                draggable={!disabled}
                                disabled={disabled}
                                onDragStart={(e) => drag(e, "product", id)}
                                aria-label={(product?.title || id) + " sürükle"}
                              >
                                <GripVertical size={13} />
                              </button>
                              <button
                                disabled={disabled || i === 0}
                                aria-label={(product?.title || id) + " yukarı"}
                                onClick={() => reorder(id, -1)}
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                disabled={
                                  disabled || i === page.productIds.length - 1
                                }
                                aria-label={(product?.title || id) + " aşağı"}
                                onClick={() => reorder(id, 1)}
                              >
                                <ArrowDown size={12} />
                              </button>
                            </div>
                            <button
                              className={styles.productEdit}
                              disabled={disabled || !product}
                              onClick={() => onEditProduct(id)}
                              aria-label={(product?.title || id) + " düzenle"}
                            >
                              <span className={styles.visual}>
                                {product?.image ? (
                                  <Image
                                    src={product.image.url}
                                    width={220}
                                    height={150}
                                    unoptimized
                                    alt=""
                                    style={{
                                      maxWidth: (page.imageScale ?? 100) + "%",
                                    }}
                                  />
                                ) : (
                                  <ImagePlus size={24} />
                                )}
                              </span>
                              <span>
                                <strong>{product?.title || "#" + id}</strong>
                                <code>{product?.sku || "Kod eksik"}</code>
                              </span>
                            </button>
                          </article>
                        );
                      })}
                    </div>
                    {!page.productIds.length && (
                      <div className={styles.empty}>
                        <ImagePlus size={30} />
                        <p>Ürünleri buraya sürükleyin veya havuzdan ekleyin.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className={styles.bulk} aria-label="Seçili ürün işlemleri">
                <span>{selectedIds.length} ürün seçili</span>
                <button
                  disabled={disabled || !page.productIds.length}
                  onClick={() => setSelectedIds([...page.productIds])}
                >
                  Sayfadakileri seç
                </button>
                <select
                  aria-label="Seçili ürünleri taşı"
                  value=""
                  disabled={disabled || !selectedIds.length}
                  onChange={(e) => e.target.value && move(e.target.value)}
                >
                  <option value="">Sayfaya taşı…</option>
                  {pages
                    .filter((p) => p.kind === "products")
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {pages.indexOf(p) + 1} · {p.title || "Ürünler"}
                      </option>
                    ))}
                </select>
                <button
                  disabled={disabled || !selectedIds.length}
                  onClick={() => remove(selectedIds)}
                >
                  Havuza çıkar
                </button>
                <button
                  disabled={!selectedIds.length}
                  onClick={() => setSelectedIds([])}
                >
                  Seçimi kaldır
                </button>
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <p>Bir ürün sayfası veya bölüm ekleyerek başlayın.</p>
            </div>
          )}
        </div>
        {page && (
          <aside
            className={styles.inspector}
            aria-label="Seçili sayfa ayarları"
          >
            <h3>Sayfa ayarları</h3>
            <label>
              Sayfa başlığı
              <input
                value={page.title}
                disabled={disabled}
                maxLength={150}
                onChange={(e) => patch({ title: e.target.value })}
              />
            </label>
            {page.kind === "divider" ? (
              <label>
                Bölüm açıklaması
                <textarea
                  value={page.subtitle}
                  disabled={disabled}
                  maxLength={300}
                  onChange={(e) => patch({ subtitle: e.target.value })}
                />
              </label>
            ) : (
              <>
                <label>
                  Sayfa yerleşimi
                  <select
                    value={page.layout}
                    disabled={disabled}
                    onChange={(e) =>
                      patch({ layout: e.target.value as CatalogPage["layout"] })
                    }
                  >
                    <option value="grid">Kart ızgarası</option>
                    <option value="rows">Yatay satırlar</option>
                    <option value="spotlight">Tam sayfa vitrin</option>
                  </select>
                </label>
                <label>
                  Sayfada en fazla
                  <select
                    value={page.density}
                    disabled={disabled || page.layout === "spotlight"}
                    onChange={(e) =>
                      patch({
                        density: e.target.value as CatalogPage["density"],
                      })
                    }
                  >
                    {["1", "2", "4", "6", "9"].map((n) => (
                      <option key={n} value={n}>
                        {n} ürün
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Görsel ölçeği · %{page.imageScale ?? 100}
                  <input
                    type="range"
                    min={60}
                    max={100}
                    step={5}
                    value={page.imageScale ?? 100}
                    disabled={disabled}
                    onChange={(e) =>
                      patch({ imageScale: Number(e.target.value) })
                    }
                  />
                </label>
                <label>
                  Kısa açıklama
                  <select
                    value={page.description || "inherit"}
                    disabled={disabled}
                    onChange={(e) =>
                      patch({
                        description:
                          e.target.value === "inherit"
                            ? undefined
                            : (e.target.value as "short" | "none"),
                      })
                    }
                  >
                    <option value="inherit">Genel ayarı kullan</option>
                    <option value="short">Göster</option>
                    <option value="none">Gizle</option>
                  </select>
                </label>
                <label>
                  Temel özellik sayısı
                  <select
                    value={page.specLimit ?? ""}
                    disabled={disabled}
                    onChange={(e) =>
                      patch({
                        specLimit: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  >
                    <option value="">Genel ayarı kullan</option>
                    {[1, 2, 3, 4, 6, 8, 12, 20, 30].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <p className={styles.hint}>
                  Tüm teknik bilgiler açıkken özellik sayısı sınırlanmaz. Uzun
                  içerik ek PDF sayfasına taşınabilir.
                </p>
              </>
            )}
            <label>
              Sayfa vurgu rengi
              <input
                type="color"
                value={page.accent || config.color}
                disabled={disabled}
                onChange={(e) => patch({ accent: e.target.value })}
              />
            </label>
            <button
              disabled={disabled}
              onClick={() =>
                patch({
                  accent: undefined,
                  imageScale: undefined,
                  description: undefined,
                  specLimit: undefined,
                })
              }
            >
              Genel görünümü kullan
            </button>
            <div className={styles.pageActions}>
              <button
                disabled={disabled || index === 0}
                onClick={() =>
                  save(moveCatalogPage(pages, page.id, pages[index - 1].id))
                }
              >
                <ArrowUp size={14} /> Yukarı
              </button>
              <button
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
                <ArrowDown size={14} /> Aşağı
              </button>
              <button
                disabled={disabled || pages.length >= 500}
                onClick={() => add(page.kind, true)}
              >
                <Copy size={14} /> Boş kopya
              </button>
              <button
                disabled={
                  disabled ||
                  page.kind !== "products" ||
                  page.productIds.length < 2 ||
                  pages.length >= 500
                }
                onClick={() => {
                  const selected = page.productIds.filter((id) =>
                    selectedIds.includes(id),
                  );
                  const ids =
                    selected.length && selected.length < page.productIds.length
                      ? selected
                      : page.productIds.slice(
                          Math.ceil(page.productIds.length / 2),
                        );
                  save(
                    splitCatalogPage(pages, page.id, ids, crypto.randomUUID()),
                  );
                  setSelectedIds([]);
                }}
              >
                <Scissors size={14} /> Sayfayı böl
              </button>
              <button
                disabled={
                  disabled ||
                  page.kind !== "products" ||
                  pages[index + 1]?.kind !== "products"
                }
                onClick={() => save(mergeCatalogPage(pages, page.id))}
              >
                <Combine size={14} /> Sonrakiyle birleştir
              </button>
              <button
                disabled={disabled}
                onClick={() => {
                  save(pages.filter((p) => p.id !== page.id));
                  selectPage(
                    pages[index - 1]?.id || pages[index + 1]?.id || "",
                  );
                }}
              >
                <Trash2 size={14} /> Sayfayı kaldır
              </button>
            </div>
            <p className={styles.hint}>
              Boş kopya sayfa tasarımını çoğaltır. Kaldırılan sayfanın ürünleri
              havuza döner.
            </p>
          </aside>
        )}
      </div>
      <section className={styles.poolSection} aria-label="Ürün havuzu">
        <div className={styles.toolbar}>
          <h3>Ürün havuzu · {unplaced.length} yerleştirilmemiş</h3>
          <label>
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
            />{" "}
            Yerleştirilenleri de göster
          </label>
          <input
            aria-label="Havuzda ürün veya kod ara"
            placeholder="Ürün adı veya tam kod"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <p className={styles.hint}>
          Eklemek ürünü seçili sayfaya taşır; aynı ürün tekrar eklenmez. Kartına
          tıklayarak sağ panelde metin ve görselini düzenleyebilirsiniz.
        </p>
        <div className={styles.pool}>
          {pool.map((product) => (
            <div
              className={styles.poolProduct}
              key={product.id}
              draggable={!disabled}
              onDragStart={(e) => drag(e, "product", product.id)}
              onDragEnd={() => setOver("")}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(product.id)}
                disabled={disabled}
                onChange={() => check(product.id)}
                aria-label={product.title + " havuzdan seç"}
              />
              {product.image && (
                <Image
                  src={product.image.url}
                  width={48}
                  height={48}
                  unoptimized
                  alt=""
                />
              )}
              <span>
                <strong>{product.title}</strong>
                <code>{product.sku}</code>
              </span>
              <button
                disabled={disabled || page?.kind !== "products"}
                onClick={() => page && move(page.id, [product.id])}
              >
                Ekle
              </button>
            </div>
          ))}
        </div>
        {!pool.length && (
          <p className={styles.hint}>
            {search
              ? "Aramanızla eşleşen ürün yok."
              : "Tüm ürünler sayfalara yerleştirildi."}
          </p>
        )}
      </section>
    </section>
  );
}
