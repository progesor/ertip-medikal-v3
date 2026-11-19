import type { CatalogImage, CatalogSnapshot } from "@/types/catalog";
import { catalogPaginationScript } from "./paginate";

function escape(value: unknown) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
function paragraphs(text: string, wordsPerUnit: number) {
  // All source content is rendered as text. Existing HTML paragraphs retain their boundaries.
  const plain = text
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
  return plain
    .split(/\n+/)
    .filter((p) => p.trim())
    .flatMap((p) => {
      const words = p.trim().split(/\s+/);
      const parts: string[] = [];
      for (let i = 0; i < words.length; i += wordsPerUnit)
        parts.push(
          '<p class="unit">' +
            escape(words.slice(i, i + wordsPerUnit).join(" ")) +
            "</p>",
        );
      return parts;
    })
    .join("");
}
export function renderCatalog(
  snapshot: CatalogSnapshot,
  assets?: Map<number, string>,
  fontCSS = "",
) {
  const { config: c, products } = snapshot;
  const en = c.locale === "en";
  const width = c.paper === "A4" ? 210 : 148;
  const height = c.paper === "A4" ? 297 : 210;
  const pageW = c.orientation === "portrait" ? width : height;
  const pageH = c.orientation === "portrait" ? height : width;
  const count = Number(c.density);
  const cols =
    count === 1
      ? 1
      : count === 2
        ? c.orientation === "landscape"
          ? 2
          : 1
        : count === 9
          ? 3
          : 2;
  const rows = Math.ceil(count / cols);
  const cardHeight = (pageH - 45 - (rows - 1) * 6) / rows;
  const imageHeight = Math.round(Math.min(75, cardHeight * 0.34));
  const smallPage = cardHeight < 55;
  const image = (media: CatalogImage | null, className = "") =>
    media
      ? '<img class="' +
        className +
        '" src="' +
        escape(assets?.get(media.id) || media.url) +
        '" alt="" />'
      : '<div class="missing visual">' +
        (en ? "Image unavailable" : "Görsel eksik") +
        "</div>";
  const footer =
    "<footer><span>" +
    escape(c.footer) +
    '</span><span class="number"></span></footer>';
  const coverImages =
    c.cover === "collage"
      ? products
          .slice(0, 4)
          .map((p) => image(p.image))
          .join("")
      : image(snapshot.coverImage);
  const cover =
    c.cover === "none"
      ? ""
      : '<section class="sheet cover ' +
        c.cover +
        '"><div class="cover-top"><b>ERTIP</b><span>' +
        (en ? "PRODUCT COLLECTION" : "ÜRÜN KOLEKSİYONU") +
        '</span></div><div class="cover-title"><h1>' +
        escape(snapshot.title) +
        "</h1><p>" +
        escape(c.subtitle) +
        "</p></div>" +
        (c.cover !== "type"
          ? '<div class="cover-images">' + coverImages + "</div>"
          : '<div class="cover-mark">E.</div>') +
        footer +
        "</section>";
  const templates = products
    .map((p) => {
      const row = (left: string, right: string) =>
        '<div class="unit spec"><strong>' +
        escape(left) +
        "</strong><span>" +
        escape(right) +
        "</span></div>";
      return (
        '<article><header class="card-heading"><span class="category">' +
        escape(p.category) +
        "</span><h2>" +
        escape(p.title) +
        "</h2>" +
        (c.showSku && p.sku
          ? '<span class="sku">' + escape(p.sku) + "</span>"
          : "") +
        "</header>" +
        '<div class="visual">' +
        image(p.image) +
        '</div><div class="units">' +
        (c.description !== "none"
          ? paragraphs(p.description, smallPage ? 10 : count >= 6 ? 20 : 45)
          : "") +
        (c.showSpecs ? p.specs.map((s) => row(s.key, s.value)).join("") : "") +
        (c.showDimensions && p.dimensions
          ? row(en ? "Dimensions / weight" : "Ölçüler / ağırlık", p.dimensions)
          : "") +
        (c.showPackaging
          ? p.packaging
              .map((s) => row(en ? "Packaging" : "Paketleme", s))
              .join("")
          : "") +
        (c.showVariants
          ? (p.options || [])
              .filter(
                (option) =>
                  !c.showSpecs ||
                  !p.specs.some(
                    (spec) =>
                      spec.key.toLocaleLowerCase(c.locale) ===
                      option.key.toLocaleLowerCase(c.locale),
                  ),
              )
              .map((option) => row(option.key, option.value))
              .join("")
          : "") +
        (c.showLinks
          ? '<p class="unit product-link"><a href="' +
            escape(p.link) +
            '">' +
            (en ? "View product ↗" : "Ürünü incele ↗") +
            "</a></p>"
          : "") +
        "</div></article>"
      );
    })
    .join("");
  const script = catalogPaginationScript;
  return (
    '<!DOCTYPE html><html lang="' +
    c.locale +
    '"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' +
    escape(snapshot.title) +
    "</title><style>" +
    fontCSS +
    `
:root{--accent:${c.color};--ink:#17202e;--muted:#687482;--line:#dce2e9;--paper:#fff;--page-w:${pageW}mm;--page-h:${pageH}mm}
*{box-sizing:border-box}body{margin:0;background:#e5e9ef;color:var(--ink);font-family:${c.font === "serif" ? '"Catalog Serif",Georgia,serif' : '"Catalog Sans",Arial,sans-serif'};font-size:10pt;line-height:1.45}
.sheet{width:var(--page-w);height:var(--page-h);padding:12mm 13mm 16mm;background:var(--paper);position:relative;overflow:hidden;break-after:page;margin:8mm auto;box-shadow:0 1mm 5mm #0001}
.sheet:last-child{break-after:auto}h1,h2,p{margin:0}a{color:var(--accent);text-decoration:none}img{max-width:100%;max-height:100%;object-fit:contain}
footer{position:absolute;bottom:7mm;left:13mm;right:13mm;display:flex;justify-content:space-between;gap:4mm;border-top:.3mm solid var(--line);padding-top:3mm;font-size:7pt;letter-spacing:.6pt;color:var(--muted)}
.page-head{height:12mm;display:flex;justify-content:space-between;gap:4mm;color:var(--muted);font-size:8pt;border-bottom:.5mm solid var(--accent);margin-bottom:5mm;align-items:flex-start}
.page-head strong{color:var(--accent);letter-spacing:2pt}.page-head span{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:75%}
.cards{height:calc(100% - 17mm);display:grid;grid-template-columns:repeat(${cols},minmax(0,1fr));grid-template-rows:repeat(${rows},minmax(0,1fr));gap:6mm}
.card{overflow:hidden;min-width:0;min-height:0;display:flex;flex-direction:column;gap:2mm;padding:0 0 3mm;border-bottom:.25mm solid var(--line)}
.card>*{flex-shrink:0}.card-heading h2{font-size:${smallPage ? 8 : count <= 2 ? 19 : count <= 4 ? 13 : 10}pt;line-height:1.18;font-weight:600;overflow-wrap:anywhere;margin:1.5mm 0 2mm}
.category{font-family:"Catalog Sans",Arial,sans-serif;color:var(--accent);font-size:7pt;letter-spacing:.5pt;text-transform:uppercase}.sku{font-size:8pt;color:var(--muted)}
.visual{height:${imageHeight}mm;display:flex;align-items:center;justify-content:center;padding:1mm;background:#f7f9fb;border-radius:2mm}
.visual img{height:100%;width:100%;mix-blend-mode:multiply}.missing{color:var(--muted);font-size:8pt;min-height:15mm}
.unit{font-size:${count <= 2 ? 9 : 8}pt;overflow-wrap:anywhere;line-height:1.45}
.spec{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:3mm;border-bottom:.2mm solid var(--line);padding:1.4mm 0;margin:0}
.spec strong{font-weight:550;color:var(--muted)}.spec span{text-align:right}.continuation{color:var(--accent);font-size:7pt}.product-link{font-size:7pt;margin-top:1mm}
.cover{display:flex;flex-direction:column;background:${c.theme === "premium" ? "#111d30" : "#f4f7fb"};color:${c.theme === "premium" ? "#f6f8fc" : "var(--ink)"}}
.cover-top{display:flex;justify-content:space-between;align-items:center;border-top:2mm solid var(--accent);padding-top:6mm}.cover-top b{font-size:21pt;letter-spacing:4pt}.cover-top span{font-size:7pt;letter-spacing:1pt}
.cover-title{margin-top:18mm;position:relative;z-index:1}.cover h1{font-size:${c.paper === "A5" ? 29 : 38}pt;line-height:1.05;max-width:95%;overflow-wrap:anywhere}.cover-title p{font-size:12pt;line-height:1.55;margin-top:6mm;max-width:85%;white-space:pre-line}
.cover-images{min-height:0;flex:1;display:grid;grid-template-columns:1fr;margin:10mm 0 6mm;overflow:hidden;background:white;border-radius:3mm;padding:5mm}.cover-images img{width:100%;height:100%;min-height:0}.collage .cover-images{grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:4mm}
.cover-mark{font-size:130pt;font-weight:bold;color:var(--accent);margin:auto 0}.cover footer{color:${c.theme === "premium" ? "#c5cedd" : "var(--muted)"}}
.back{display:flex;flex-direction:column;justify-content:center;border-top:5mm solid var(--accent)}.back h2{font-size:35pt;letter-spacing:4pt}.back p{font-size:15pt;margin-top:10mm;white-space:pre-line;overflow-wrap:anywhere}.back .edition{font-size:10pt;color:var(--muted)}
body.compact .visual{background:white}body.compact .cards{gap:4mm}body.premium .page-head{border-bottom:1mm solid var(--accent)}
${smallPage ? ".category{display:none}.card{gap:1mm;padding-bottom:1mm}.card-heading h2{margin:0 0 1mm}.unit{font-size:7pt}.continuation{font-size:6pt}" : ""}
@page{size:${pageW}mm ${pageH}mm;margin:0}
@media print{body{background:white;-webkit-print-color-adjust:exact;print-color-adjust:exact}.sheet{margin:0;box-shadow:none}}
` +
    '</style></head><body class="' +
    c.theme +
    '" data-density="' +
    count +
    '"><main id="pages">' +
    cover +
    '</main><template id="page-template"><section class="sheet"><div class="page-head"><strong>ERTIP</strong><span>' +
    escape(snapshot.title) +
    '</span></div><div class="cards"></div>' +
    footer +
    "</section></template>" +
    (c.backCover
      ? '<template id="back-template"><section class="sheet back"><h2>ERTIP</h2><p>' +
        escape(c.footer) +
        '</p><p class="edition">' +
        escape(snapshot.title) +
        "</p>" +
        footer +
        "</section></template>"
      : "") +
    '<div id="product-templates" hidden>' +
    templates +
    "</div><script>" +
    script +
    "</script></body></html>"
  );
}
