"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Plus,
  Save,
  Download,
  Eye,
  Search,
  ChevronUp,
  ChevronDown,
  Undo2,
  Redo2,
  Copy,
  X,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  catalogConfigSchema,
  defaultCatalogConfig,
} from "@/lib/catalog/schema";
import type {
  CatalogConfig,
  CatalogDocument,
  CatalogOutputSummary,
  CatalogProduct,
  CatalogWarning,
} from "@/types/catalog";
import styles from "./CatalogEditor.module.css";
import { PageBoard } from "./PageBoard";
import { PagePlan } from "./PagePlan";
import { CoverDesigner } from "./CoverDesigner";
import { applyCatalogPreset, catalogPresets } from "@/lib/catalog/presets";
import type { CatalogPagePreview } from "@/types/catalog";

type ProductOption = {
  id: number;
  title: string;
  sku?: string;
  categories: number[];
  image?: string;
};
type CategoryOption = { id: number; title: string; parent?: number | null };
type Library = {
  catalogs: CatalogDocument[];
  categories: CategoryOption[];
  products: ProductOption[];
};
type Working = { title: string; isTemplate: boolean; config: CatalogConfig };
type Preview = {
  html: string;
  pageCount: number;
  sheets: CatalogPagePreview[];
  warnings: CatalogWarning[];
  products: CatalogProduct[];
};
const empty: Working = {
  title: "Ertıp Ürün Kataloğu",
  isTemplate: false,
  config: defaultCatalogConfig,
};
const api = "/api/catalog-studio";

async function request<T>(
  body?: object,
  query = "",
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(api + query, {
    method: body ? "POST" : "GET",
    cache: "no-store",
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(120000)])
      : AbortSignal.timeout(120000),
    headers: body
      ? { "Content-Type": "application/json", "x-ertip-catalog": "1" }
      : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const value = await response.json().catch(() => null);
  if (!response.ok || !value)
    throw Error(
      value?.message || "İstek tamamlanamadı. HTTP " + response.status,
    );
  return value;
}
export function CatalogEditor() {
  const [library, setLibrary] = useState<Library | null>(null);
  const [working, setWorking] = useState<Working>(empty);
  const [saved, setSaved] = useState<CatalogDocument | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [view, setView] = useState<"preview" | "pages" | "editor">("preview");
  const [visiblePage, setVisiblePage] = useState(1);
  const [layout, setLayout] = useState<{ pages: number; error: string } | null>(
    null,
  );
  const [editorPageId, setEditorPageId] = useState("");
  const [wideEditor, setWideEditor] = useState(true);
  const [previewKey, setPreviewKey] = useState("");
  const [outputs, setOutputs] = useState<CatalogOutputSummary[]>([]);
  const [tab, setTab] = useState<"content" | "design" | "cover" | "product">(
    "content",
  );
  const [search, setSearch] = useState("");
  const [editedProduct, setEditedProduct] = useState<number | null>(null);
  const [busy, setBusy] = useState("");
  const [exportFormat, setExportFormat] = useState<"pdf" | "editable-svg">(
    "pdf",
  );
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [zoom, setZoom] = useState(65);
  const history = useRef<Working[]>([empty]);
  const cursor = useRef(0);
  const [historyPosition, setHistoryPosition] = useState(0);
  const [historyLength, setHistoryLength] = useState(1);
  const savedId = saved?.id;
  const dirty =
    JSON.stringify({
      ...working,
      config: catalogConfigSchema.parse(working.config),
    }) !==
    JSON.stringify(
      saved
        ? {
            title: saved.title,
            isTemplate: !!saved.isTemplate,
            config: catalogConfigSchema.parse(saved.config),
          }
        : empty,
    );
  const config = working.config;
  const stale = preview && previewKey !== JSON.stringify(working);
  const change = (next: Working) => {
    history.current = [
      ...history.current.slice(0, cursor.current + 1),
      next,
    ].slice(-60);
    cursor.current = history.current.length - 1;
    setHistoryPosition(cursor.current);
    setHistoryLength(history.current.length);
    setWorking(next);
  };
  const configure = (patch: Partial<CatalogConfig>) =>
    change({ ...working, config: { ...config, ...patch } });
  const choose = (doc: CatalogDocument | null) => {
    if (
      dirty &&
      !window.confirm(
        "Kaydedilmeyen değişiklikler var. Çalışmadan çıkılsın mı?",
      )
    )
      return;
    const next = doc
      ? {
          title: doc.title,
          isTemplate: !!doc.isTemplate,
          config: catalogConfigSchema.parse(doc.config),
        }
      : empty;
    setWorking(next);
    setSaved(doc);
    setPreview(null);
    setOutputs([]);
    setError("");
    setNotice("");
    history.current = [next];
    cursor.current = 0;
    setHistoryPosition(0);
    setHistoryLength(1);
  };
  const historyMove = (step: number) => {
    const next = cursor.current + step;
    if (next < 0 || next >= history.current.length) return;
    cursor.current = next;
    setHistoryPosition(next);
    setWorking(history.current[next]);
  };
  useEffect(() => {
    const controller = new AbortController();
    request<Library>(undefined, "", controller.signal)
      .then(setLibrary)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const leave = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, [dirty]);
  const loadOutputs = useCallback(async () => {
    if (saved)
      setOutputs(
        await request<CatalogOutputSummary[]>(
          undefined,
          "?outputs=" + saved.id,
        ),
      );
  }, [saved]);
  useEffect(() => {
    if (!savedId) return;
    let active = true;
    const refresh = () =>
      request<CatalogOutputSummary[]>(undefined, "?outputs=" + savedId)
        .then((v) => {
          if (active) setOutputs(v);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    void refresh();
    const timer = setInterval(refresh, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [savedId]);
  async function save() {
    const doc = await request<CatalogDocument>({
      action: "save",
      ...working,
      id: saved?.id,
      updatedAt: saved?.updatedAt,
    });
    setSaved(doc);
    setLibrary((current) =>
      current
        ? {
            ...current,
            catalogs: [doc, ...current.catalogs.filter((c) => c.id !== doc.id)],
          }
        : current,
    );
    return doc;
  }
  async function perform(
    action: "save" | "preview" | "generate",
    planId?: string,
  ) {
    setBusy(action);
    setError("");
    setNotice("");
    try {
      if (action === "preview") {
        setLayout(null);
        const result = await request<Preview>({ action, ...working });
        setPreview(result);
        setLayout({ pages: result.pageCount, error: "" });
        setVisiblePage(
          planId
            ? result.sheets.find((sheet) => sheet.id === planId)?.page || 1
            : 1,
        );
        if (planId) setView("preview");
        setPreviewKey(JSON.stringify(working));
      } else {
        const doc = await save();
        if (action === "generate") {
          await request({ action, id: doc.id, format: exportFormat });
          setNotice(
            exportFormat === "editable-svg"
              ? "Düzenlenebilir paket sıraya alındı. Hazır olunca dosya arşivinden indirebilirsiniz."
              : "PDF sıraya alındı. Bu ekrandan ayrılabilirsiniz.",
          );
          await loadOutputs();
        } else setNotice("Çalışma kaydedildi.");
      }
    } catch (e) {
      setError(
        e instanceof Error && e.name === "TimeoutError"
          ? "Önizleme zaman aşımına uğradı. Yeniden deneyin veya daha az ürün seçin."
          : e instanceof Error
            ? e.message
            : "İşlem tamamlanamadı.",
      );
    } finally {
      setBusy("");
    }
  }
  const selected = new Set(config.productIds);
  const filtered =
    library?.products.filter((p) =>
      (p.title + " " + (p.sku || ""))
        .toLocaleLowerCase("tr")
        .includes(search.toLocaleLowerCase("tr")),
    ) || [];
  const selectedProducts = config.productIds
    .map((id) => library?.products.find((p) => p.id === id))
    .filter((p): p is ProductOption => !!p);
  const previewProduct = preview?.products.find((p) => p.id === editedProduct);
  const product = previewProduct
    ? { ...previewProduct, ...previewProduct.sourceDefaults }
    : undefined;
  const override = config.overrides.find((p) => p.productId === editedProduct);
  const editProduct = (patch: Partial<NonNullable<typeof override>>) => {
    if (!editedProduct) return;
    configure({
      overrides: [
        ...config.overrides.filter((p) => p.productId !== editedProduct),
        { ...override, productId: editedProduct, ...patch },
      ],
    });
  };
  const moveProduct = (index: number, step: number) => {
    const ids = [...config.productIds];
    const destination = index + step;
    if (destination < 0 || destination >= ids.length) return;
    [ids[index], ids[destination]] = [ids[destination], ids[index]];
    configure({ productIds: ids });
  };
  const pageWidth =
    config.orientation === "portrait"
      ? config.paper === "A4"
        ? 794
        : 559
      : config.paper === "A4"
        ? 1123
        : 794;
  const labelSelect = (
    label: string,
    key: keyof CatalogConfig,
    options: [string, string][],
  ) => (
    <label>
      {label}
      <select
        value={String(config[key])}
        disabled={!!busy}
        onChange={(e) => configure({ [key]: e.target.value })}
      >
        {options.map(([value, title]) => (
          <option key={value} value={value}>
            {title}
          </option>
        ))}
      </select>
    </label>
  );
  const toggle = (label: string, key: keyof CatalogConfig) => (
    <label className={styles.check}>
      <input
        type="checkbox"
        checked={!!config[key]}
        disabled={!!busy}
        onChange={(e) => configure({ [key]: e.target.checked })}
      />
      {label}
    </label>
  );
  return (
    <main
      className={styles.studio}
      onKeyDown={(event) => {
        if (!(event.ctrlKey || event.metaKey) || busy) return;
        if (event.key.toLowerCase() === "s") {
          event.preventDefault();
          void perform("save");
        }
        if (
          (event.target as HTMLElement).closest(
            "input,textarea,[contenteditable=true]",
          )
        )
          return;
        if (event.key.toLowerCase() === "z") {
          event.preventDefault();
          historyMove(event.shiftKey ? 1 : -1);
        }
      }}
    >
      <header className={styles.header}>
        <div>
          <Link href="/admin" className={styles.back}>
            <ArrowLeft size={14} /> Yönetim
          </Link>
          <h1>
            <BookOpen size={24} />
            Katalog Stüdyosu
          </h1>
          <p>Ürünlerinizi bir araya getirin. Kataloğunuzu tasarlayın.</p>
        </div>
        <div className={styles.actions}>
          <button
            title="Geri al"
            aria-label="Geri al"
            disabled={!!busy || historyPosition === 0}
            onClick={() => historyMove(-1)}
          >
            <Undo2 size={17} />
          </button>
          <button
            title="İleri al"
            aria-label="İleri al"
            disabled={!!busy || historyPosition >= historyLength - 1}
            onClick={() => historyMove(1)}
          >
            <Redo2 size={17} />
          </button>
          <button disabled={!!busy} onClick={() => perform("save")}>
            <Save size={16} /> Kaydet
          </button>
          <button disabled={!!busy} onClick={() => perform("preview")}>
            <Eye size={16} /> Önizle
          </button>
          <label className={styles.exportFormat}>
            Dışa aktarma
            <select
              aria-label="Dışa aktarma biçimi"
              value={exportFormat}
              disabled={!!busy}
              onChange={(e) =>
                setExportFormat(e.target.value as "pdf" | "editable-svg")
              }
            >
              <option value="pdf">PDF · Gönderime hazır</option>
              <option value="editable-svg">Düzenlenebilir · SVG + PDF</option>
            </select>
          </label>
          <button
            className={styles.primary}
            disabled={!!busy || !library}
            onClick={() => perform("generate")}
          >
            <Download size={16} />{" "}
            {exportFormat === "editable-svg"
              ? "Düzenlenebilir paket oluştur"
              : "PDF oluştur"}
          </button>
        </div>
      </header>
      {exportFormat === "editable-svg" && (
        <p className={styles.exportHelp}>
          Illustrator ve Inkscape için her sayfa ayrı SVG; düzenlenebilir
          metinler, gruplu ürünler, gömülü görseller, fontlar ve referans PDF
          tek ZIP paketinde. Açmadan önce paketteki fontları kurun. Harici
          değişiklikler stüdyoya geri aktarılmaz.
        </p>
      )}
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className={styles.notice}>
          {notice}
        </p>
      )}
      {busy && (
        <p role="status" className={styles.notice}>
          <Loader2 size={15} className={styles.spin} />
          {busy === "preview"
            ? "Ürünler ve sayfalar hazırlanıyor…"
            : busy === "generate"
              ? exportFormat === "editable-svg"
                ? "Düzenlenebilir paket hazırlanmak üzere kaydediliyor…"
                : "PDF hazırlanmak üzere kaydediliyor…"
              : "Kaydediliyor…"}
        </p>
      )}
      <div
        className={styles.workspace}
        data-board={view !== "preview"}
        data-wide={view === "pages" || (view === "editor" && wideEditor)}
      >
        <aside className={styles.library}>
          <div className={styles.panelTitle}>
            <h2>Çalışmalar</h2>
            <button
              aria-label="Yeni çalışma"
              disabled={!!busy}
              onClick={() => choose(null)}
            >
              <Plus size={17} />
            </button>
          </div>
          <select
            aria-label="Kayıtlı çalışma"
            value={saved?.id || ""}
            disabled={!!busy}
            onChange={(e) =>
              choose(
                library?.catalogs.find(
                  (c) => c.id === Number(e.target.value),
                ) || null,
              )
            }
          >
            <option value="">Yeni çalışma</option>
            {library?.catalogs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.isTemplate ? "Şablon · " : ""}
                {c.title}
              </option>
            ))}
          </select>
          <label>
            Çalışma adı
            <input
              value={working.title}
              maxLength={150}
              disabled={!!busy}
              onChange={(e) => change({ ...working, title: e.target.value })}
            />
          </label>
          <span className={styles.meta}>
            {dirty
              ? "Kaydedilmemiş değişiklikler"
              : saved
                ? "Kaydedildi"
                : "Yeni çalışma"}
          </span>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={working.isTemplate}
              disabled={!!busy}
              onChange={(e) =>
                change({ ...working, isTemplate: e.target.checked })
              }
            />
            Şablon olarak sakla
          </label>
          <button
            disabled={!!busy}
            onClick={() => {
              setSaved(null);
              change({ ...working, title: working.title + " · Kopya" });
              setOutputs([]);
            }}
          >
            <Copy size={15} /> Çoğalt
          </button>
          <div className={styles.panelTitle}>
            <h2>Ürünler</h2>
            <span className={styles.meta}>
              {config.selection === "products"
                ? selected.size
                : (preview?.products.length ?? "Tümü")}
            </span>
          </div>
          <label className={styles.search}>
            <Search size={15} />
            <input
              aria-label="Ürün ara"
              placeholder="Ürün adı veya SKU"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          {config.selection !== "products" && (
            <p className={styles.hint}>
              Elle seçim için sağdaki içerik ayarından “Seçtiğim ürünler”
              seçeneğini kullanın.
            </p>
          )}
          <div className={styles.productList}>
            {filtered.map((p) => (
              <label key={p.id} className={styles.product}>
                {config.selection === "products" && (
                  <input
                    type="checkbox"
                    disabled={!!busy}
                    checked={selected.has(p.id)}
                    onChange={(e) =>
                      configure({
                        productIds: e.target.checked
                          ? [...config.productIds, p.id]
                          : config.productIds.filter((id) => id !== p.id),
                      })
                    }
                  />
                )}
                {p.image ? (
                  <Image
                    src={p.image}
                    alt=""
                    width={38}
                    height={42}
                    unoptimized
                  />
                ) : (
                  <span className={styles.noImage}>
                    <BookOpen size={18} />
                  </span>
                )}
                <span>
                  <strong>{p.title}</strong>
                  <small>{p.sku || "SKU varyantlarda"}</small>
                </span>
              </label>
            ))}
          </div>
          {config.selection === "products" && (
            <details>
              <summary>Seçilen ürünlerin sırası</summary>
              {selectedProducts.map((p, i) => (
                <div key={p.id} className={styles.orderRow}>
                  <span>{p.title}</span>
                  <button
                    aria-label={p.title + " yukarı"}
                    disabled={!!busy || i === 0}
                    onClick={() => moveProduct(i, -1)}
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    aria-label={p.title + " aşağı"}
                    disabled={!!busy || i === selectedProducts.length - 1}
                    onClick={() => moveProduct(i, 1)}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
              ))}
            </details>
          )}
        </aside>
        <section className={styles.canvasArea} aria-label="Katalog önizleme">
          <div className={styles.canvasToolbar}>
            <button
              aria-pressed={view === "preview"}
              onClick={() => setView("preview")}
            >
              Önizleme
            </button>
            <button
              aria-pressed={view === "pages"}
              onClick={() => setView("pages")}
            >
              Sayfa planı
            </button>
            <button
              aria-pressed={view === "editor"}
              onClick={() => setView("editor")}
            >
              Görsel editör
            </button>
            {view === "editor" && (
              <button
                aria-pressed={wideEditor}
                onClick={() => setWideEditor(!wideEditor)}
              >
                {wideEditor ? "Genel ayarları aç" : "Çalışma alanını genişlet"}
              </button>
            )}
            <span>
              {config.paper} ·{" "}
              {config.orientation === "portrait" ? "Dikey" : "Yatay"} ·{" "}
              {config.locale.toUpperCase()}
            </span>
            {view === "preview" && (
              <label>
                Yakınlaştır
                <select
                  aria-label="Yakınlaştırma"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                >
                  {[35, 50, 65, 80, 100].map((v) => (
                    <option key={v} value={v}>
                      %{v}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          {stale && (
            <button
              className={styles.stale}
              disabled={!!busy}
              onClick={() => perform("preview")}
            >
              Tasarım değişti. Önizlemeyi yenile
            </button>
          )}
          {view === "pages" ? (
            <PagePlan
              config={config}
              products={preview?.products || []}
              disabled={!!busy}
              onChange={configure}
              onEdit={(id) => {
                setEditorPageId(id);
                setView("editor");
              }}
              onPreview={() => perform("preview")}
            />
          ) : view === "editor" ? (
            <PageBoard
              selectedPageId={editorPageId}
              onSelectPage={setEditorPageId}
              config={config}
              products={preview?.products || []}
              sheets={preview?.sheets || []}
              stale={!!stale}
              disabled={!!busy}
              onChange={configure}
              onEditProduct={(id) => {
                setWideEditor(false);
                setEditedProduct(id);
                setTab("product");
              }}
              onPreview={(pageId) => perform("preview", pageId)}
            />
          ) : preview ? (
            <div className={styles.canvasScroll}>
              <div className={styles.pageNavigation}>
                <button
                  aria-label="Önceki PDF sayfası"
                  disabled={visiblePage <= 1}
                  onClick={() => setVisiblePage((n) => n - 1)}
                >
                  ‹
                </button>
                <select
                  aria-label="Önizleme sayfası"
                  value={visiblePage}
                  onChange={(e) => setVisiblePage(Number(e.target.value))}
                >
                  {preview.sheets.map((page) => (
                    <option key={page.page} value={page.page}>
                      {page.page} · {page.title || "Ürünler"}
                    </option>
                  ))}
                </select>
                <button
                  aria-label="Sonraki PDF sayfası"
                  disabled={visiblePage >= preview.pageCount}
                  onClick={() => setVisiblePage((n) => n + 1)}
                >
                  ›
                </button>
              </div>
              <div
                style={{
                  position: "relative",
                  width: (pageWidth * zoom) / 100,
                  height:
                    ((config.orientation === "portrait"
                      ? config.paper === "A4"
                        ? 1123
                        : 794
                      : config.paper === "A4"
                        ? 794
                        : 559) *
                      zoom) /
                    100,
                }}
              >
                <iframe
                  title="PDF sayfaları"
                  sandbox=""
                  srcDoc={preview.html.replace(
                    "</head>",
                    "<style>#pages>.sheet:not(:nth-child(" +
                      visiblePage +
                      ")){display:none}.sheet{margin:0;box-shadow:none}</style></head>",
                  )}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: pageWidth,
                    height:
                      config.orientation === "portrait"
                        ? config.paper === "A4"
                          ? 1123
                          : 794
                        : config.paper === "A4"
                          ? 794
                          : 559,
                    transform: "scale(" + zoom / 100 + ")",
                    transformOrigin: "top left",
                  }}
                />
              </div>
            </div>
          ) : (
            <div className={styles.empty}>
              <div className={styles.mockPage}>
                <span>ERTIP</span>
                <strong>
                  Ürünlerinize
                  <br />
                  yeni bir bakış.
                </strong>
                <div />
                <small>ÜRÜN KATALOĞU</small>
              </div>
              <h2>Kataloğunuz burada şekillenecek</h2>
              <p>Ürünleri ve tasarımı seçip önizlemeyi oluşturun.</p>
              <button
                className={styles.primary}
                disabled={!!busy || !library}
                onClick={() => perform("preview")}
              >
                <Eye size={16} /> Önizleme oluştur
              </button>
            </div>
          )}
          {layout?.error && (
            <p role="alert" className={styles.error}>
              {layout.error}
            </p>
          )}
          {preview && (
            <details
              className={styles.review}
              open={preview.warnings.length > 0}
            >
              <summary>
                {preview.products.length} ürün ·{" "}
                {layout
                  ? layout.pages + " sayfa · "
                  : "Sayfalar hazırlanıyor · "}{" "}
                {preview.warnings.length
                  ? preview.warnings.length + " içerik uyarısı"
                  : "İçerik kontrolü tamamlandı"}
              </summary>
              {preview.warnings.map((warning, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setEditedProduct(warning.productId || null);
                    setTab("product");
                  }}
                >
                  {warning.message}
                </button>
              ))}
            </details>
          )}
        </section>
        <aside className={styles.settings}>
          <nav className={styles.tabs} aria-label="Katalog ayarları">
            {(
              [
                ["content", "İçerik"],
                ["design", "Tasarım"],
                ["cover", "Kapak"],
                ["product", "Ürün"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                aria-pressed={tab === key}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className={styles.settingsBody}>
            {tab === "content" && (
              <>
                <h2>İçeriği oluştur</h2>
                {labelSelect("Belge dili", "locale", [
                  ["tr", "Türkçe"],
                  ["en", "English"],
                ])}
                {labelSelect("Ürün kaynağı", "selection", [
                  ["all", "Tüm yayındaki ürünler"],
                  ["categories", "Seçilen kategoriler"],
                  ["products", "Seçtiğim ürünler"],
                ])}
                {config.selection === "categories" && (
                  <>
                    <label>
                      Kategoriler
                      <select
                        multiple
                        aria-label="Kategoriler"
                        value={config.categoryIds.map(String)}
                        onChange={(e) =>
                          configure({
                            categoryIds: Array.from(
                              e.target.selectedOptions,
                            ).map((o) => Number(o.value)),
                          })
                        }
                      >
                        {library?.categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    {toggle("Alt kategorileri dahil et", "includeChildren")}
                  </>
                )}
                {config.locale === "en" &&
                  toggle(
                    "Eksik İngilizce alanlarda Türkçe kullan",
                    "fallbackTurkish",
                  )}
                {toggle("Kategoriye göre grupla", "groupByCategory")}
                {labelSelect("Kategori bölümleri", "groupLevel", [
                  ["top", "Ana kategoriler · kompakt"],
                  ["leaf", "Alt kategoriler · ayrıntılı"],
                ])}
                {toggle("Kategori ayırıcıları", "categoryDividers")}
                {labelSelect("Ayırıcı görünümü", "dividerStyle", [
                  ["band", "Sayfa başında başlık"],
                  ["page", "Tam sayfa bölüm kapağı"],
                ])}
                {toggle("Otomatik içindekiler", "toc")}
                {toggle("Ürün adında marka tekrarını kaldır", "shortTitles")}
                <h3>Gösterilecek bilgiler</h3>
                {labelSelect("Açıklama", "description", [
                  ["short", "Kısa açıklama"],
                  ["none", "Açıklama gösterme"],
                ])}
                {toggle("Ürün kodu (SKU)", "showSku")}
                {toggle("Teknik özellikler", "showSpecs")}
                {toggle("Ölçü ve seçenek özeti", "showVariants")}
                {toggle("Ölçüler ve ağırlık", "showDimensions")}
                {toggle("Paketleme", "showPackaging")}
                {toggle("Ürün sayfası bağlantısı", "showLinks")}
                <p className={styles.hint}>
                  Kısa açıklama ve teknik özellikler kullanılır. Her ürün ana
                  kartıyla yer alır; ölçü ve seçenekler gruplandırılır.
                </p>
              </>
            )}
            {tab === "design" && (
              <>
                <h2>Belge tasarımı</h2>
                <h3>Nasıl bir yayın hazırlıyorsunuz?</h3>
                <div className={styles.presets}>
                  {catalogPresets.map((preset) => (
                    <button
                      key={preset.id}
                      disabled={!!busy}
                      onClick={() => {
                        configure(applyCatalogPreset(config, preset.id));
                        setNotice(
                          preset.title +
                            " ayarları uygulandı. Ürün seçiminiz korundu; otomatik sayfa düzeni kullanılacak.",
                        );
                      }}
                    >
                      <strong>{preset.title}</strong>
                      <span>{preset.description}</span>
                    </button>
                  ))}
                </div>
                {toggle("İçeriğe göre akıllı yerleşim", "adaptiveLayout")}
                <p className={styles.hint}>
                  Görsel oranları ve metin uzunluğu ölçülür. Sayfada ürün sayısı
                  üst sınırdır; okunaklılık için gerektiğinde azaltılır.
                  Görseller, görsel optimizasyonundaki ölçülerden sayfaya uygun
                  çözünürlükte hazırlanır.
                </p>
                <h3>Öne çıkan ürünler</h3>
                <label>
                  Vitrin ürünü ekle
                  <select
                    value=""
                    disabled={!!busy}
                    onChange={(event) => {
                      const id = Number(event.target.value);
                      if (id && !config.featuredProductIds.includes(id))
                        configure({
                          featuredProductIds: [
                            ...config.featuredProductIds,
                            id,
                          ],
                        });
                    }}
                  >
                    <option value="">Ürün seçin…</option>
                    {library?.products
                      .filter(
                        (p) =>
                          !config.featuredProductIds.includes(p.id) &&
                          (config.selection !== "products" ||
                            config.productIds.includes(p.id)),
                      )
                      .map((p) => (
                        <option value={p.id} key={p.id}>
                          {p.title}
                        </option>
                      ))}
                  </select>
                </label>
                {config.featuredProductIds.map((id) => (
                  <div className={styles.featured} key={id}>
                    <span>
                      {library?.products.find((p) => p.id === id)?.title ||
                        "#" + id}
                    </span>
                    <button
                      disabled={!!busy}
                      aria-label={
                        (library?.products.find((p) => p.id === id)?.title ||
                          "Ürün") + " vitrin seçimini kaldır"
                      }
                      onClick={() =>
                        configure({
                          featuredProductIds: config.featuredProductIds.filter(
                            (value) => value !== id,
                          ),
                        })
                      }
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <p className={styles.hint}>
                  Seçilen ürünler katalog kapsamındaysa kendi bölümünün başında
                  tam sayfa görünür. Bu özellik otomatik sayfa düzeninde
                  geçerlidir.
                </p>
                {labelSelect("Yerleşim", "layout", [
                  ["grid", "Dengeli kartlar"],
                  ["rows", "Yatay ürün satırları"],
                  ["spotlight", "Ürün vitrini"],
                ])}
                {labelSelect("Teknik bilgi yoğunluğu", "information", [
                  ["essential", "Seçili temel özellikler"],
                  ["all", "Tüm teknik bilgiler"],
                ])}
                <label>
                  Temel özellik sayısı
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={config.specLimit}
                    disabled={!!busy}
                    onChange={(e) =>
                      configure({
                        specLimit: Math.max(
                          1,
                          Math.min(30, Number(e.target.value) || 1),
                        ),
                      })
                    }
                  />
                </label>
                <p className={styles.hint}>
                  6 kartta en fazla 4, 9 kartta en fazla 3 temel özellik
                  kullanılır. Tüm bilgiler seçilirse sığmayan ürün için ek
                  vitrin sayfası oluşturulur.
                </p>
                <div className={styles.themes}>
                  {(
                    [
                      ["corporate", "Kurumsal"],
                      ["premium", "Premium"],
                      ["compact", "Kompakt"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      className={styles.theme}
                      data-theme={key}
                      aria-pressed={config.theme === key}
                      disabled={!!busy}
                      onClick={() =>
                        configure({
                          theme: key,
                          coverDesign: {
                            ...config.coverDesign,
                            background:
                              key === "corporate"
                                ? "#eef3f6"
                                : key === "premium"
                                  ? "#142330"
                                  : "#ffffff",
                            foreground:
                              key === "premium" ? "#ffffff" : "#172b3a",
                          },
                        })
                      }
                    >
                      <span>
                        <i />
                        <i />
                        <i />
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
                {labelSelect("Sayfa ölçüsü", "paper", [
                  ["A4", "A4"],
                  ["A5", "A5"],
                ])}
                {labelSelect("Yön", "orientation", [
                  ["portrait", "Dikey"],
                  ["landscape", "Yatay"],
                ])}
                {labelSelect("Sayfada ürün", "density", [
                  ["1", "1 · Ayrıntılı"],
                  ["2", "2 · Dengeli"],
                  ["4", "4 · Genel görünüm"],
                  ["6", "6 · Kompakt"],
                  ["9", "9 · Yoğun"],
                ])}
                <label>
                  Vurgu rengi
                  <input
                    type="color"
                    value={config.color}
                    disabled={!!busy}
                    onChange={(e) => configure({ color: e.target.value })}
                  />
                </label>
                {labelSelect("Yazı tipi", "font", [
                  ["sans", "Inter · Modern"],
                  ["serif", "Source Serif · Klasik"],
                ])}
                {labelSelect("PDF kalitesi", "profile", [
                  ["digital", "Dijital paylaşım"],
                  ["quality", "Yüksek kaliteli çıktı"],
                ])}
                <label>
                  Altbilgi
                  <input
                    value={config.footer}
                    maxLength={200}
                    disabled={!!busy}
                    onChange={(e) => configure({ footer: e.target.value })}
                  />
                </label>
              </>
            )}
            {tab === "cover" && (
              <>
                <h2>İlk izlenim</h2>
                {labelSelect("Kapak düzeni", "cover", [
                  ["image", "Büyük ürün görseli"],
                  ["collage", "Dört ürün kolajı"],
                  ["type", "Tipografik kapak"],
                  ["none", "Kapaksız"],
                ])}
                <label>
                  Kapak alt başlığı
                  <textarea
                    rows={4}
                    maxLength={300}
                    value={config.subtitle}
                    disabled={!!busy}
                    onChange={(e) => configure({ subtitle: e.target.value })}
                    placeholder="Katalog yılı, ürün grubu veya kısa tanıtım"
                  />
                </label>
                <label>
                  Kapak görseli
                  <select
                    value={config.coverImageId || ""}
                    disabled={!!busy}
                    onChange={(e) =>
                      configure({
                        coverImageId: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  >
                    <option value="">İlk ürünün görseli</option>
                    {preview?.products
                      .filter((p) => p.image)
                      .map((p) => (
                        <option key={p.id} value={p.image!.id}>
                          {p.title}
                        </option>
                      ))}
                  </select>
                </label>
                <p className={styles.hint}>
                  Ürün görsellerini seçebilmek için önce önizleme oluşturun.
                </p>
                {toggle("Arka kapak ekle", "backCover")}
                {config.cover !== "none" && (
                  <CoverDesigner
                    config={config}
                    title={working.title}
                    image={
                      preview?.products
                        .map((p) => p.image)
                        .find((image) => image?.id === config.coverImageId) ||
                      preview?.products[0]?.image ||
                      null
                    }
                    disabled={!!busy}
                    onChange={configure}
                  />
                )}
              </>
            )}
            {tab === "product" && (
              <>
                <h2>Kataloğa özel düzenle</h2>
                <label>
                  Ürün
                  <select
                    value={editedProduct || ""}
                    onChange={(e) => setEditedProduct(Number(e.target.value))}
                  >
                    <option value="">Ürün seçin</option>
                    {preview?.products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </label>
                {product ? (
                  <>
                    <label>
                      Bu katalogdaki ürün adı
                      <input
                        value={override?.title ?? product.title}
                        maxLength={240}
                        disabled={!!busy}
                        onChange={(e) => editProduct({ title: e.target.value })}
                      />
                    </label>
                    <label>
                      Ana ürün kodu / SKU
                      <input
                        value={override?.sku ?? product.sku}
                        maxLength={120}
                        disabled={!!busy}
                        onChange={(e) => editProduct({ sku: e.target.value })}
                      />
                    </label>
                    <p className={styles.hint}>
                      Ana kod yoksa ilk aktif varyasyonun tam kodu gösterilir.
                      Bu alan yalnızca bu kataloğu değiştirir.
                    </p>
                    <label>
                      Bu katalogdaki kısa açıklama
                      <textarea
                        rows={9}
                        value={override?.description ?? product.description}
                        disabled={!!busy}
                        onChange={(e) =>
                          editProduct({ description: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Ürün görseli
                      <select
                        value={override?.imageId ?? product.image?.id ?? ""}
                        disabled={!!busy}
                        onChange={(e) =>
                          editProduct({
                            imageId: Number(e.target.value) || null,
                          })
                        }
                      >
                        {[product.image, ...product.gallery]
                          .filter(
                            (p, i, a) =>
                              p && a.findIndex((x) => x?.id === p.id) === i,
                          )
                          .map((p) => (
                            <option key={p!.id} value={p!.id}>
                              {p!.filename}
                            </option>
                          ))}
                      </select>
                    </label>
                    <button
                      disabled={!!busy}
                      onClick={() =>
                        configure({
                          overrides: config.overrides.filter(
                            (p) => p.productId !== product.id,
                          ),
                        })
                      }
                    >
                      <X size={14} /> Kaynak bilgilerini kullan
                    </button>
                    <p className={styles.hint}>
                      Bu düzenlemeler katalog çalışmasına kaydedilir.
                    </p>
                  </>
                ) : (
                  <p className={styles.hint}>
                    Önizleme oluşturduktan sonra ürün metinlerini ve
                    görsellerini burada düzenleyebilirsiniz.
                  </p>
                )}
              </>
            )}
          </div>
          <section className={styles.exports}>
            <h2>Dosya arşivi</h2>
            {!outputs.length && (
              <p className={styles.hint}>
                PDF ve düzenlenebilir paketleriniz burada görünür.
              </p>
            )}
            {outputs.map((o) => (
              <article key={o.id}>
                <strong>
                  {o.status === "done"
                    ? (o.pages || "") + " sayfa · Hazır"
                    : o.status === "failed"
                      ? "Tamamlanamadı"
                      : o.status === "running"
                        ? "Hazırlanıyor…"
                        : "Sırada…"}
                </strong>
                <small>{new Date(o.createdAt).toLocaleString("tr-TR")}</small>
                {o.error && <p className={styles.error}>{o.error}</p>}
                {o.status === "done" && o.filename && (
                  <a
                    className={styles.download}
                    href={
                      "/api/catalog-outputs/file/" +
                      encodeURIComponent(o.filename)
                    }
                    download
                  >
                    <Download size={14} />{" "}
                    {o.filename.endsWith(".zip")
                      ? "Düzenlenebilir ZIP indir"
                      : "PDF indir"}
                  </a>
                )}
                {o.status === "failed" && (
                  <button disabled={!!busy} onClick={() => perform("generate")}>
                    Güncel içerikle tekrar oluştur
                  </button>
                )}
              </article>
            ))}
          </section>
        </aside>
      </div>
    </main>
  );
}
