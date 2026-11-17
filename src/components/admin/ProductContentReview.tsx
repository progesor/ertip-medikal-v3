import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  ImageOff,
  Languages,
  ScanBarcode,
} from "lucide-react";
import type { AdminViewServerProps } from "payload";
import {
  filterLabels,
  listProductContentIssues,
  reviewFilters,
  reviewPath,
  textLabels,
  type ReviewFilter,
} from "@/lib/catalog/contentReview";

const icons = {
  image: ImageOff,
  tr: Languages,
  en: Languages,
  sku: ScanBarcode,
};

function reviewUrl(
  filter: ReviewFilter,
  before?: number | null,
  after?: number | null,
) {
  const query = new URLSearchParams();
  if (filter !== "all") query.set("filter", filter);
  if (before) query.set("before", String(before));
  if (after) query.set("after", String(after));
  return query.size ? `${reviewPath}?${query}` : reviewPath;
}

export function ContentReviewShortcuts() {
  return (
    <section className="ertip-dashboard__panel ertip-review-shortcuts">
      <div className="ertip-dashboard__panel-heading">
        <h2>İçerik kontrolü</h2>
        <Link prefetch={false} href={reviewPath}>
          Eksik ürünleri gör <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <div className="ertip-review-links">
        {reviewFilters
          .filter((key) => key !== "all")
          .map((key) => {
            const Icon = icons[key];
            return (
              <Link prefetch={false} key={key} href={reviewUrl(key)}>
                <Icon size={17} aria-hidden="true" />
                {filterLabels[key]}
              </Link>
            );
          })}
      </div>
    </section>
  );
}

function cursorId(value: string | string[] | undefined) {
  const n = typeof value === "string" ? Number(value) : NaN;
  return Number.isSafeInteger(n) && n > 0 ? n : undefined;
}

export async function ProductContentReview({
  initPageResult,
  searchParams,
}: AdminViewServerProps) {
  const filter =
    reviewFilters.find((key) => key === searchParams?.filter) ?? "all";
  const before = cursorId(searchParams?.before);
  const after = before ? undefined : cursorId(searchParams?.after);
  const { products, nextAfter, previousBefore } =
    await listProductContentIssues(initPageResult.req, {
      filter,
      before,
      after,
    });
  return (
    <main className="ertip-review">
      <Link className="ertip-review-back" href="/admin">
        <ArrowLeft size={15} aria-hidden="true" /> Ana sayfa
      </Link>
      <header className="ertip-module ertip-review-header">
        <ClipboardList size={25} aria-hidden="true" />
        <div>
          <h1>İçerik kontrolü</h1>
          <p>
            Ürünlerin son kaydedilen sürümündeki eksikleri tamamlayın. Her dil
            kendi metniyle kontrol edilir.
          </p>
        </div>
      </header>
      <nav
        className="ertip-review-links"
        aria-label="Eksik türüne göre filtrele"
      >
        {reviewFilters.map((key) => (
          <Link
            key={key}
            prefetch={false}
            href={reviewUrl(key)}
            aria-current={filter === key ? "page" : undefined}
          >
            {filterLabels[key]}
          </Link>
        ))}
      </nav>
      {products.length ? (
        <ul className="ertip-review-list">
          {products.map((product) => {
            const href = `/admin/collections/products/${product.id}`;
            return (
              <li key={product.id}>
                <div className="ertip-review-product">
                  <Link prefetch={false} href={href}>
                    {product.title}
                  </Link>
                  <small>
                    {product.status === "published" ? "Yayında" : "Taslak"}
                  </small>
                </div>
                <ul className="ertip-review-issues">
                  {product.issues.map((issue) => {
                    const locale =
                      issue === "tr" || issue === "en" ? issue : null;
                    const label = locale
                      ? (locale === "tr" ? "Türkçe" : "İngilizce") +
                        " · " +
                        product.missingText[locale]
                          .map((f) => textLabels[f])
                          .join(", ")
                      : issue === "image"
                        ? "Ana görsel eksik"
                        : product.missingProductSku
                          ? "Ürün kodu eksik"
                          : product.missingVariantSkus +
                            " aktif varyantın kodu eksik";
                    return (
                      <li key={issue}>
                        <Link
                          prefetch={false}
                          href={locale ? href + "?locale=" + locale : href}
                        >
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="ertip-module ertip-review-empty">
          <CheckCircle2 size={24} aria-hidden="true" />
          <h2>
            {before || after
              ? "Bu sayfada ürün kalmadı"
              : "Eksik ürün bulunmadı"}
          </h2>
          <p>
            {before || after
              ? "Güncel sonuçları görmek için ilk sayfaya dönün."
              : "Seçili kontrol için tamamlanacak bir alan yok."}
          </p>
          {(before || after) && (
            <Link prefetch={false} href={reviewUrl(filter)}>
              İlk sayfaya dön
            </Link>
          )}
        </div>
      )}
      {(previousBefore || nextAfter) && (
        <nav className="ertip-review-links" aria-label="Sonuç sayfaları">
          {previousBefore && (
            <Link prefetch={false} href={reviewUrl(filter, previousBefore)}>
              ← Önceki ürünler
            </Link>
          )}
          {nextAfter && (
            <Link prefetch={false} href={reviewUrl(filter, null, nextAfter)}>
              Sonraki ürünler →
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
