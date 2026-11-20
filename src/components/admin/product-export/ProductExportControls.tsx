"use client";

import {
  ArchiveDeleteButton,
  deleteArchive,
} from "@/components/admin/ArchiveDeleteButton";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  Database,
  Download,
  FileText,
  ImageIcon,
  LoaderCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import type {
  ProductExportJob,
  ProductExportOptions,
  ExportRecord,
} from "@/types/productExport";
import {
  categoryClosure,
  localized,
  plainText,
} from "@/lib/product-export/serialize";
import styles from "./ProductExport.module.css";

const initial: ProductExportOptions = {
  scope: "all",
  productIds: [],
  categoryIds: [],
  includeChildren: true,
  status: "published",
  includeImages: false,
  includeDocuments: false,
};
type Library = {
  products: ExportRecord[];
  categories: ExportRecord[];
  jobs: ProductExportJob[];
};
function label(value: unknown) {
  return (
    plainText(localized(value, "tr")) ||
    plainText(localized(value, "en")) ||
    "İsimsiz kayıt"
  );
}
function size(bytes: number) {
  return bytes < 1048576
    ? (bytes / 1024).toFixed(0) + " KB"
    : (bytes / 1048576).toFixed(1) + " MB";
}
async function request(options?: ProductExportOptions, jobs = false) {
  const response = await fetch(
    "/api/product-exports" + (jobs ? "?jobs=1" : ""),
    options
      ? {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-ertip-export": "1",
          },
          body: JSON.stringify(options),
        }
      : { cache: "no-store" },
  );
  const data = await response.json();
  if (!response.ok) throw Error(data.message || "İşlem tamamlanamadı.");
  return data;
}
export function ProductExportControls() {
  const [library, setLibrary] = useState<Library | null>(null),
    [jobs, setJobs] = useState<ProductExportJob[]>([]);
  const [options, setOptions] = useState(initial),
    [search, setSearch] = useState(""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const active = jobs.some((j) => j.status === "running");
  async function load() {
    try {
      setError("");
      const data: Library = await request();
      setLibrary(data);
      setJobs(data.jobs);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    let live = true;
    request()
      .then((data: Library) => {
        if (live) {
          setLibrary(data);
          setJobs(data.jobs);
        }
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    if (!active) return;
    let live = true;
    const timer = setInterval(() => {
      request(undefined, true)
        .then((data) => {
          if (live) setJobs(data.jobs);
        })
        .catch((e) => {
          if (live) setError(e.message);
        });
    }, 2500);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [active]);
  function change<K extends keyof ProductExportOptions>(
    key: K,
    value: ProductExportOptions[K],
  ) {
    setOptions((o) => ({ ...o, [key]: value }));
  }
  function toggle(key: "productIds" | "categoryIds", id: number) {
    setOptions((o) => ({
      ...o,
      [key]: o[key].includes(id)
        ? o[key].filter((n) => n !== id)
        : [...o[key], id],
    }));
  }
  const categories = library?.categories || [],
    products = library?.products || [];
  const selectedCategories = categoryClosure(
    categories,
    options.categoryIds,
    options.includeChildren,
  );
  // A product can have a published version and newer saved draft simultaneously.
  const selected = products.filter(
    (p) =>
      (options.status === "all" ||
        (options.status === "published"
          ? p.hasPublishedVersion
          : p._status === "draft")) &&
      (options.scope === "all" ||
        (options.scope === "products" &&
          options.productIds.includes(Number(p.id))) ||
        (options.scope === "categories" &&
          Array.isArray(p.category) &&
          p.category.some((id) => selectedCategories.has(Number(id))))),
  );
  const visible = products.filter((p) =>
    (label(p.title) + " " + (p.sku || "") + " " + p.id)
      .toLocaleLowerCase("tr")
      .includes(search.toLocaleLowerCase("tr")),
  );
  async function start() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const job = await request(options);
      setJobs((old) => [job, ...old]);
      setNotice(
        "Paket arka planda hazırlanıyor. Bu ekrandan ayrılabilirsiniz.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className={styles.center}>
      <Link href="/admin" className={styles.back}>
        <ArrowLeft size={15} /> Yönetim
      </Link>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>ÜRÜN VERİLERİNİZ, HER YERDE</span>
          <h1>
            <Database size={26} /> Ürün bilgi bankası
          </h1>
          <p>
            Ürünlerinizi başka programlara taşıyın, ekibinizle paylaşın veya AI
            araçlarıyla çalışın.
          </p>
        </div>
        <button onClick={load} disabled={busy}>
          <RefreshCw size={16} /> Yenile
        </button>
      </header>
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
      <div className={styles.layout}>
        <section className={styles.panel}>
          <div className={styles.sectionTitle}>
            <span>01</span>
            <div>
              <h2>Hangi ürünler?</h2>
              <p>İhtiyacınıza uygun bir veri paketi hazırlayın.</p>
            </div>
          </div>
          <fieldset disabled={busy || active || !library}>
            <div className={styles.choices}>
              {(
                [
                  ["all", "Tüm ürünler"],
                  ["categories", "Kategoriler"],
                  ["products", "Ürün seçimi"],
                ] as const
              ).map(([value, title]) => (
                <label
                  key={value}
                  className={options.scope === value ? styles.selected : ""}
                >
                  <input
                    type="radio"
                    name="scope"
                    value={value}
                    checked={options.scope === value}
                    onChange={() => change("scope", value)}
                  />
                  {title}
                </label>
              ))}
            </div>
            <label className={styles.field}>
              Kayıt durumu
              <select
                value={options.status}
                onChange={(e) =>
                  change(
                    "status",
                    e.target.value as ProductExportOptions["status"],
                  )
                }
              >
                <option value="published">Yayındaki ürünler</option>
                <option value="all">Tümü · son kaydedilen kayıtlar</option>
                <option value="draft">
                  Taslaklar · son kaydedilen kayıtlar
                </option>
              </select>
            </label>
            {options.scope === "categories" && (
              <>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={options.includeChildren}
                    onChange={(e) =>
                      change("includeChildren", e.target.checked)
                    }
                  />{" "}
                  Alt kategoriler dahil
                </label>
                <div className={styles.selector}>
                  {categories.map((c) => (
                    <label key={Number(c.id)}>
                      <input
                        type="checkbox"
                        checked={options.categoryIds.includes(Number(c.id))}
                        onChange={() => toggle("categoryIds", Number(c.id))}
                      />
                      <span>
                        {label(c.title)}
                        {c.parent ? (
                          <small>
                            {label(
                              categories.find((p) => p.id === c.parent)?.title,
                            )}
                          </small>
                        ) : null}
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )}
            {options.scope === "products" && (
              <>
                <label className={styles.search}>
                  <Search size={16} />
                  <input
                    aria-label="Ürün ara"
                    placeholder="Ürün adı, ana SKU veya kayıt numarası"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <div className={styles.selectionActions}>
                  <button
                    type="button"
                    onClick={() =>
                      change("productIds", [
                        ...new Set([
                          ...options.productIds,
                          ...visible.map((p) => Number(p.id)),
                        ]),
                      ])
                    }
                  >
                    Görünenleri seç
                  </button>
                  <button
                    type="button"
                    onClick={() => change("productIds", [])}
                  >
                    Seçimi temizle
                  </button>
                </div>
                <div className={styles.selector}>
                  {visible.map((p) => (
                    <label key={Number(p.id)}>
                      <input
                        type="checkbox"
                        checked={options.productIds.includes(Number(p.id))}
                        onChange={() => toggle("productIds", Number(p.id))}
                      />
                      <span>
                        {label(p.title)}
                        <small>
                          {String(p.sku || "Varyant kodları pakette")} ·{" "}
                          {p._status === "published" ? "Yayında" : "Taslak"}
                        </small>
                      </span>
                    </label>
                  ))}
                  {!visible.length && <p>Aramaya uygun ürün bulunamadı.</p>}
                </div>
              </>
            )}
            <div className={styles.sectionTitle}>
              <span>02</span>
              <div>
                <h2>Dosyalar da gelsin mi?</h2>
                <p>
                  Bilgiler her zaman tam aktarılır. Dosyaları ihtiyacınıza göre
                  ekleyin.
                </p>
              </div>
            </div>
            <label className={styles.option}>
              <input
                type="checkbox"
                checked={options.includeImages}
                onChange={(e) => change("includeImages", e.target.checked)}
              />
              <ImageIcon size={22} />
              <span>
                <strong>Orijinal görselleri dahil et</strong>
                <small>
                  Ana görsel, galeri, varyant ve kategori görselleri. Ortak
                  dosyalar bir kez eklenir.
                </small>
              </span>
            </label>
            <label className={styles.option}>
              <input
                type="checkbox"
                checked={options.includeDocuments}
                onChange={(e) => change("includeDocuments", e.target.checked)}
              />
              <FileText size={22} />
              <span>
                <strong>Ürün belgelerini dahil et</strong>
                <small>
                  Ürüne bağlı genel ve korumalı belgeler. Belge erişim kodları
                  aktarılmaz.
                </small>
              </span>
            </label>
          </fieldset>
          <div className={styles.start}>
            <div>
              <strong>{library ? selected.length : "…"} ürün eşleşiyor</strong>
              <small>Türkçe + İngilizce · Tüm varyantlar</small>
            </div>
            <button
              className={styles.primary}
              disabled={
                busy ||
                active ||
                !library ||
                (options.scope !== "all" &&
                  !(
                    options.scope === "products"
                      ? options.productIds
                      : options.categoryIds
                  ).length)
              }
              onClick={start}
            >
              {busy || active ? (
                <LoaderCircle size={17} className={styles.spin} />
              ) : (
                <Archive size={17} />
              )}{" "}
              {active ? "Paket hazırlanıyor" : "Aktarım paketini oluştur"}
            </button>
          </div>
        </section>
        <aside className={styles.panel}>
          <span className={styles.eyebrow}>TEK PAKET, FARKLI KULLANIMLAR</span>
          <h2>Paketin içinde ne var?</h2>
          <div className={styles.format}>
            <Database />
            <div>
              <h3>Eksiksiz ürün verisi</h3>
              <p>
                JSON ve NDJSON: tüm alanlar, iki dil, fiyatlar, SKU kuralları,
                varyantlar, SEO ve ilişkiler.
              </p>
            </div>
          </div>
          <div className={styles.format}>
            <FileText />
            <div>
              <h3>Tablolarla çalışın</h3>
              <p>
                CSV: ürünler, varyantlar, teknik özellikler, kategoriler ve
                görsel eşleştirmeleri ayrı tablolar halinde.
              </p>
            </div>
          </div>
          <div className={styles.format}>
            <CheckCircle2 />
            <div>
              <h3>AI için okunabilir içerik</h3>
              <p>
                Her ürün için Türkçe ve İngilizce metin dosyaları. Uzun
                açıklamalar ve tüm kaynak bilgiler dahil.
              </p>
            </div>
          </div>
          <details className={styles.details}>
            <summary>Aktarım hakkında</summary>
            <p>
              ZIP içinde bir kullanım rehberi bulunur. CSV dosyaları Excel’e
              UTF-8 olarak alınabilir. Görseller eklenmese de adresleri ve ürün
              eşleştirmeleri korunur.
            </p>
            <p>
              Yayındaki ürünler yayımlanmış sürümden; “Tümü” ve “Taslaklar” son
              kaydedilen sürümden okunur. Yukarıdaki sayı son kayda göre
              tahminidir. Sürüm geçmişi aktarılmaz.
            </p>
            <p>
              Eksik dosyalar sonuçta bildirilir. Harici video bağlantıları
              indirilmez. Bu paket site geri yükleme dosyası değildir. Paket
              başına sınır 3 GB; daha büyük arşivleri kategorilere bölün.
            </p>
            <p>
              Dosyalar 7 gün saklanır; süresi dolanlar sonraki ziyaret veya
              aktarımda temizlenir. Bu alan yöneticilere özeldir.
            </p>
          </details>
        </aside>
      </div>
      <section className={styles.history}>
        <h2>Hazırlanan paketler</h2>
        <p>Hazır paketleri buradan indirebilirsiniz.</p>
        {!jobs.length && (
          <div className={styles.empty}>
            {library
              ? "İlk aktarımınız burada görünecek."
              : "Ürünler ve paketler yükleniyor…"}
          </div>
        )}
        {jobs.map((job) => (
          <article key={job.id} className={styles.job}>
            <div className={styles.jobIcon}>
              {job.status === "running" ? (
                <LoaderCircle className={styles.spin} />
              ) : job.status === "done" ? (
                <CheckCircle2 />
              ) : (
                <Archive />
              )}
            </div>
            <div className={styles.jobInfo}>
              <strong>
                {job.status === "done"
                  ? "Aktarım hazır"
                  : job.status === "failed"
                    ? "Aktarım tamamlanamadı"
                    : job.phase}
              </strong>
              <small>
                {new Date(job.createdAt).toLocaleString("tr-TR")} ·{" "}
                {job.productCount} ürün ·{" "}
                {job.options.includeImages ? "Görseller dahil" : "Görselsiz"}
                {job.options.includeDocuments ? " · Belgeler dahil" : ""}
              </small>
              {job.status === "running" && (
                <p role="status">
                  {job.processedFiles} / {job.fileCount} dosya
                </p>
              )}
              {job.error && <p className={styles.error}>{job.error}</p>}
              {!!job.warnings.length && (
                <details>
                  <summary>{job.warnings.length} dosya uyarısı</summary>
                  <ul>
                    {job.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </details>
              )}
              {job.status === "done" && (
                <small>
                  {job.fileCount} medya dosyası · {size(job.bytes)} · Son
                  indirme: {new Date(job.expiresAt).toLocaleDateString("tr-TR")}
                </small>
              )}
            </div>
            {job.status === "done" && (
              <a
                className={styles.download}
                href={"/api/product-exports?download=" + job.id}
                download
              >
                <Download size={17} /> ZIP indir
              </a>
            )}
            <ArchiveDeleteButton
              label={
                "Ürün paketi · " +
                new Date(job.createdAt).toLocaleString("tr-TR")
              }
              disabled={job.status === "running"}
              onDelete={async () => {
                await deleteArchive(
                  "/api/product-exports",
                  "x-ertip-export",
                  job.id,
                );
                setJobs((current) =>
                  current.filter((item) => item.id !== job.id),
                );
                setNotice("Paket ve arşiv kaydı silindi.");
              }}
            />
          </article>
        ))}
      </section>
    </main>
  );
}
