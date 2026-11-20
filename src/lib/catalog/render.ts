import { pageSections } from "./sections";
import type {
  CatalogImage,
  CatalogProduct,
  CatalogSnapshot,
  CatalogPage,
} from "@/types/catalog";
import { catalogPaginationScript } from "./paginate";
import { documentStyles } from "./documentStyles";
import { resolvePages } from "./pagePlan";
import { selectCatalogSpecs } from "./specs";

export function escape(value: unknown) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
export function plainText(text: string) {
  return text
    .replace(/<\/(p|li|div|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
export function renderCatalog(
  snapshot: CatalogSnapshot,
  assets?: Map<number, string>,
  fontCSS = "",
) {
  const { config: c, products } = snapshot,
    en = c.locale === "en";
  const image = (media: CatalogImage | null) =>
    media
      ? '<img src="' +
        escape(assets?.get(media.id) || media.url) +
        '" alt="" />'
      : '<span class="missing">' +
        (en ? "Image unavailable" : "Görsel eksik") +
        "</span>";
  const footer =
    "<footer><span>" +
    escape(c.footer) +
    '</span><span class="number"></span></footer>';
  const head =
    '<div class="page-head"><b>ERTIP</b><span>' +
    escape(snapshot.title) +
    "</span></div>";
  const cover =
    c.cover === "none"
      ? ""
      : '<section class="sheet cover ' +
        c.cover +
        '" data-kind="cover" data-title="' +
        escape(en ? "Cover" : "Kapak") +
        '"><div class="cover-top"><b>' +
        escape(c.coverDesign.eyebrow) +
        "</b><span>" +
        escape(c.coverDesign.edition) +
        '</span></div><div class="cover-title"><h1>' +
        escape(c.coverDesign.title || snapshot.title) +
        "</h1><p>" +
        escape(c.subtitle) +
        "</p></div>" +
        (c.cover === "type"
          ? '<div class="cover-mark">E.</div>'
          : '<div class="cover-images">' +
            (c.cover === "collage"
              ? products
                  .slice(0, 4)
                  .map((p) => image(p.image))
                  .join("")
              : image(snapshot.coverImage)) +
            "</div>") +
        footer +
        "</section>";
  const row = (key: string, value: string) =>
    '<div class="unit spec"><strong>' +
    escape(key) +
    "</strong><span>" +
    escape(value) +
    "</span></div>";
  function card(p: CatalogProduct, plan: CatalogPage) {
    const capacity = plan.layout === "spotlight" ? 1 : Number(plan.density);
    const limit =
      c.information === "all"
        ? Infinity
        : Math.min(
            plan.specLimit ?? c.specLimit,
            plan.specLimit ??
              (capacity >= 9 ? 3 : capacity >= 6 ? 4 : c.specLimit),
          );
    const specs = c.showSpecs ? selectCatalogSpecs(p.specs, limit) : [];
    const options = c.showVariants
      ? (p.options || []).filter(
          (o) =>
            !specs.some(
              (s) =>
                s.key.toLocaleLowerCase(c.locale) ===
                o.key.toLocaleLowerCase(c.locale),
            ),
        )
      : [];
    const description =
      (plan.description ?? c.description) === "none"
        ? ""
        : plainText(p.description)
            .split(/\n+/)
            .filter((p) => p.trim())
            .map(
              (text) =>
                '<p class="unit description">' + escape(text.trim()) + "</p>",
            )
            .join("");
    return (
      '<article class="card" data-product="' +
      p.id +
      '"><header class="card-heading"><h2>' +
      escape(p.title) +
      "</h2>" +
      (c.showSku && p.sku
        ? '<div class="code"><span>' +
          escape(p.skuLabel || "SKU") +
          "</span><strong>" +
          escape(p.sku) +
          "</strong></div>"
        : "") +
      '</header><div class="card-body"><div class="visual">' +
      image(p.image) +
      '</div><div class="copy">' +
      description +
      specs.map((s) => row(s.key, s.value)).join("") +
      options.map((s) => row(s.key, s.value)).join("") +
      (c.showDimensions && p.dimensions
        ? row(en ? "Dimensions / weight" : "Ölçüler / ağırlık", p.dimensions)
        : "") +
      (c.showPackaging
        ? p.packaging
            .map((s) => row(en ? "Packaging" : "Paketleme", s))
            .join("")
        : "") +
      (c.showLinks
        ? '<p class="unit product-link"><a href="' +
          escape(p.link) +
          '">' +
          (en ? "Product details ↗" : "Ürün bilgileri ↗") +
          "</a></p>"
        : "") +
      "</div></div></article>"
    );
  }
  const byId = new Map(products.map((p) => [p.id, p]));
  const plans = resolvePages(products, c);
  const planned = plans
    .map((plan, index) => {
      const attributes =
        ' data-plan="' +
        escape(plan.id) +
        '" data-title="' +
        escape(plan.title) +
        '" data-density="' +
        plan.density +
        '" data-layout="' +
        plan.layout +
        '" data-kind="' +
        plan.kind +
        '" data-accent="' +
        escape(plan.accent || c.color) +
        '" data-image-scale="' +
        (plan.imageScale ?? 100) +
        '" data-manual="' +
        (c.pageMode === "manual") +
        '"';
      if (plan.kind === "divider")
        return (
          '<template class="planned"' +
          attributes +
          '><section class="sheet divider"><div class="ordinal">' +
          String(index + 1).padStart(2, "0") +
          "</div><h1>" +
          escape(plan.title) +
          "</h1><p>" +
          escape(plan.subtitle) +
          "</p>" +
          footer +
          "</section></template>"
        );
      return (
        '<template class="planned"' +
        attributes +
        ">" +
        (plan.sections?.length
          ? pageSections(plan)
              .filter((s) => s.productIds.length)
              .map(
                (section) =>
                  '<section class="product-module" data-title="' +
                  escape(section.title) +
                  '" data-columns="' +
                  section.columns +
                  '" data-layout="' +
                  section.layout +
                  '"><header class="module-heading"><h2>' +
                  escape(section.title) +
                  "</h2>" +
                  (section.subtitle
                    ? "<p>" + escape(section.subtitle) + "</p>"
                    : "") +
                  "</header>" +
                  section.productIds
                    .map((id) => byId.get(id))
                    .filter((p): p is CatalogProduct => !!p)
                    .map((p) => card(p, plan))
                    .join("") +
                  "</section>",
              )
              .join("")
          : plan.productIds
              .map((id) => byId.get(id))
              .filter((p): p is CatalogProduct => !!p)
              .map((p) => card(p, plan))
              .join("")) +
        "</template>"
      );
    })
    .join("");
  return (
    '<!DOCTYPE html><html lang="' +
    c.locale +
    '"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' +
    escape(snapshot.title) +
    "</title><style>" +
    fontCSS +
    documentStyles(c) +
    '</style></head><body data-toc="' +
    c.toc +
    '" data-bands="' +
    c.categoryDividers +
    '" data-paper="' +
    c.paper +
    '" data-orientation="' +
    c.orientation +
    '" data-adaptive="' +
    c.adaptiveLayout +
    '"><main id="pages">' +
    cover +
    '</main><template id="page-template"><section class="sheet">' +
    head +
    '<div class="cards"></div>' +
    footer +
    '</section></template><template id="toc-template"><section class="sheet toc">' +
    head +
    "<h1>" +
    (en ? "Contents" : "İçindekiler") +
    '</h1><p class="toc-note">' +
    (en
      ? "Product collection · Categories and sections"
      : "Ürün koleksiyonu · Kategoriler ve bölümler") +
    '</p><div class="toc-list"></div>' +
    footer +
    "</section></template>" +
    planned +
    (c.backCover
      ? '<template id="back-template"><section class="sheet back"><h2>ERTIP</h2><p>' +
        escape(c.footer) +
        '</p><p class="edition">' +
        escape(snapshot.title) +
        "</p>" +
        footer +
        "</section></template>"
      : "") +
    "<script>" +
    catalogPaginationScript +
    "</script></body></html>"
  );
}
