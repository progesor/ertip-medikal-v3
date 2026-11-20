import type { CatalogConfig } from "@/types/catalog";

export function documentStyles(c: CatalogConfig) {
  const short = c.paper === "A4" ? 210 : 148,
    long = c.paper === "A4" ? 297 : 210;
  const width = c.orientation === "portrait" ? short : long,
    height = c.orientation === "portrait" ? long : short;
  return `
:root{--accent:${c.color};--ink:#172b3a;--muted:#6b7a86;--line:#dce3e8;--page-w:${width}mm;--page-h:${height}mm;--cover-bg:${c.coverDesign.background};--cover-fg:${c.coverDesign.foreground}}
*{box-sizing:border-box}body{margin:0;background:#e5e9ef;color:var(--ink);font-family:${c.font === "serif" ? '"Catalog Serif",Georgia,serif' : '"Catalog Sans",Arial,sans-serif'};font-size:9pt;line-height:1.4}
h1,h2,h3,p{margin:0}img{display:block;max-width:100%;object-fit:contain}a{color:var(--accent);text-decoration:none}
.sheet{width:var(--page-w);height:var(--page-h);padding:10mm 11mm 14mm;background:white;position:relative;overflow:hidden;break-after:page;margin:6mm auto;box-shadow:0 1mm 5mm #0001}
.sheet:last-child{break-after:auto}.page-head{height:11mm;border-top:.7mm solid var(--accent);padding-top:3mm;display:flex;align-items:flex-start;justify-content:space-between;gap:8mm;font-size:7pt;letter-spacing:.5pt}.page-head b{letter-spacing:2pt}.page-head span{max-width:75%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted)}
.section-band{height:13mm;display:flex;justify-content:space-between;align-items:center;border-bottom:.25mm solid var(--line);margin-bottom:4mm}.section-band h2{font-size:17pt;line-height:1.1;letter-spacing:-.5pt}.section-band span{font-size:7pt;color:var(--muted);white-space:nowrap}
footer{position:absolute;left:11mm;right:11mm;bottom:5mm;display:flex;justify-content:space-between;gap:3mm;border-top:.25mm solid var(--line);padding-top:2mm;font-size:6.5pt;color:var(--muted);letter-spacing:.6pt}footer>span:first-child{max-width:85%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cards{height:calc(100% - 11mm);display:grid;grid-template-columns:repeat(var(--cols),minmax(0,1fr));grid-template-rows:repeat(var(--rows),minmax(0,1fr));gap:5mm 6mm}
.has-band .cards{height:calc(100% - 28mm)}.card{min-height:0;min-width:0;overflow:hidden;display:flex;flex-direction:column;padding-bottom:2mm;border-bottom:.3mm solid var(--line)}
.card-heading{flex:none;min-height:16mm;padding-bottom:2mm}.card-heading h2{font-size:12pt;line-height:1.2;letter-spacing:-.2pt;font-weight:600;overflow-wrap:anywhere}.code{display:flex;align-items:baseline;gap:2mm;font-size:7pt;margin-top:1.5mm;color:var(--muted)}.code strong{font-family:"Catalog Sans",Arial,sans-serif;color:var(--accent);font-weight:600;letter-spacing:.3pt;font-size:8pt}
.card-body{display:flex;flex-direction:column;min-height:0;flex:1;gap:2.5mm}.visual{height:var(--visual);flex:none;background:#f5f7f8;display:flex;align-items:center;justify-content:center;border-radius:2mm;padding:2mm}.visual img{height:100%;width:100%;mix-blend-mode:multiply}.missing{color:var(--muted);font-size:7pt}
.copy{min-height:0;min-width:0}.unit{font-size:8pt;line-height:1.4;overflow-wrap:anywhere}.description{margin-bottom:2.5mm;color:#425260}.spec{display:grid;grid-template-columns:42% minmax(0,1fr);gap:2mm;border-bottom:.2mm solid #e8edf0;padding:1.1mm 0}.spec strong{font-weight:400;color:var(--muted);font-size:7.3pt}.spec span{font-size:7.5pt;font-weight:500}.product-link{margin-top:2mm;font-size:6.7pt}.continuation{font-size:6pt;color:var(--muted);margin-top:1mm}
.dense .card-heading{min-height:17mm}.dense .card-heading h2{font-size:10pt}.dense .unit{font-size:7.3pt}.dense .spec{padding:.75mm 0}.dense .spec strong,.dense .spec span{font-size:6.8pt}.dense .description{margin-bottom:1.5mm}.dense .card-body{gap:2mm}
.layout-rows .card-body{display:grid;grid-template-columns:34% minmax(0,1fr);gap:5mm}.layout-rows .visual{height:100%;max-height:var(--visual)}.layout-rows .card-heading{min-height:0}.layout-rows:not(.dense) .card-heading h2{font-size:18pt}.layout-rows .description{margin-bottom:1.5mm}
.layout-spotlight .card-heading{padding:3mm 0 6mm}.layout-spotlight .card-heading h2{font-size:24pt;line-height:1.05;max-width:90%}.layout-spotlight .code{margin-top:3mm}.layout-spotlight .card-body{display:grid;grid-template-columns:38% minmax(0,1fr);gap:8mm}.layout-spotlight .visual{height:100%;max-height:145mm;padding:5mm}.layout-spotlight .spec{padding:1.4mm 0}.layout-spotlight .unit{font-size:9pt}.layout-spotlight .spec strong,.layout-spotlight .spec span{font-size:8pt}
.tight .card-heading h2{font-size:9pt}.tight .unit{font-size:7pt}.tight .description{margin-bottom:1mm}.tight .spec{padding:.5mm 0}.tight .card-body{gap:1.5mm}
.layout-spotlight .tight .card-heading h2{font-size:20pt}.layout-spotlight .tight .unit{font-size:8pt}
.cover{padding:0;background:var(--cover-bg);color:var(--cover-fg)}.cover:before{content:"";position:absolute;width:65%;height:120%;left:55%;top:-10%;background:var(--accent);opacity:.15;transform:rotate(25deg)}.cover-top{position:absolute;left:9%;right:9%;top:7%;display:flex;justify-content:space-between;gap:5mm;font-size:7pt;letter-spacing:1.7pt}.cover-top b{font-size:12pt;letter-spacing:2pt}.cover-title{position:absolute;z-index:2;left:${c.coverDesign.titleX}%;top:${c.coverDesign.titleY}%;width:${c.coverDesign.titleWidth}%;text-align:${c.coverDesign.align}}.cover h1{font-size:${c.coverDesign.titleSize}pt;line-height:1.03;letter-spacing:-1.4pt;overflow-wrap:anywhere;font-weight:600}.cover-title p{font-size:11pt;line-height:1.5;margin-top:5mm;white-space:pre-line}
.cover-images{position:absolute;left:${c.coverDesign.imageX}%;top:${c.coverDesign.imageY}%;width:${c.coverDesign.imageWidth}%;height:${c.coverDesign.imageHeight}%;padding:6mm;border-radius:4mm;background:white;display:grid;grid-template-columns:1fr;overflow:hidden}.cover-images img{width:100%;height:100%;min-height:0;object-fit:${c.coverDesign.imageFit}}.collage .cover-images{grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:4mm}.cover footer{color:var(--cover-fg);border-color:#ffffff40}.cover-mark{position:absolute;bottom:12%;right:9%;font-size:130pt;opacity:.15}
.divider{display:flex;flex-direction:column;justify-content:center;background:#142330;color:white}.divider .ordinal{font-size:80pt;line-height:1;color:var(--accent);margin-bottom:12mm;font-weight:600}.divider h1{font-size:32pt;line-height:1.05;overflow-wrap:anywhere;max-width:90%;letter-spacing:-.9pt}.divider p{font-size:12pt;margin-top:8mm;max-width:85%}.divider footer{color:#cbd6df;border-color:#ffffff30}
.toc h1{font-size:32pt;letter-spacing:-1pt;margin:10mm 0}.toc-list{display:flex;flex-direction:column;gap:0}.toc-row{display:flex;justify-content:space-between;align-items:baseline;gap:5mm;padding:3.5mm 0;border-bottom:.25mm solid var(--line);font-size:11pt}.toc-row span{color:var(--ink)}.toc-row b{font-size:9pt;color:var(--accent)}.toc-note{color:var(--muted);font-size:8pt;margin-bottom:8mm}
.back{display:flex;flex-direction:column;justify-content:center;border-top:4mm solid var(--accent)}.back h2{font-size:35pt;letter-spacing:4pt}.back p{font-size:12pt;margin-top:8mm;max-width:85%;overflow-wrap:anywhere}.back .edition{font-size:9pt;color:var(--muted)}
${height <= 148 ? ".layout-spotlight .card-heading{padding:1mm 0 2mm}.layout-spotlight .card-heading h2,.layout-spotlight .tight .card-heading h2{font-size:16pt}.layout-spotlight .visual{max-height:60mm;min-height:0}.layout-spotlight .unit{font-size:8pt}.layout-spotlight .spec{padding:.7mm 0}.section-band h2{font-size:13pt}" : ""}
/* Measured layouts retain readable type and give remaining space to the product image. */
body[data-adaptive="true"] .card-heading{min-height:0;padding-bottom:3mm}
body[data-adaptive="true"] .copy{flex-shrink:0}
body[data-adaptive="true"] .dense .card-heading h2{font-size:10pt;line-height:1.22}
body[data-adaptive="true"] .dense .unit{font-size:8pt;line-height:1.4}
body[data-adaptive="true"] .dense .spec strong,body[data-adaptive="true"] .dense .spec span{font-size:7.5pt;line-height:1.35}
body[data-adaptive="true"] .code{flex-wrap:wrap;gap:.5mm 2mm;line-height:1.3}
body[data-adaptive="true"] .code strong{overflow-wrap:anywhere}
body[data-adaptive="true"] .visual{padding:3mm;background:#f7f9fa;border-radius:1.5mm}
body[data-adaptive="true"] .visual img{object-fit:contain}
body[data-adaptive="true"] .layout-rows .card-body{grid-template-columns:44% minmax(0,1fr);gap:7mm;align-items:center}
body[data-adaptive="true"] .layout-rows .card-heading{padding-bottom:4mm}
body[data-adaptive="true"] .layout-rows .card-heading h2{font-size:${height <= 148 ? 14 : 17}pt}
body[data-adaptive="true"] .layout-rows .spec{padding:1.3mm 0}
body[data-adaptive="true"] .layout-rows .unit{font-size:8.5pt}
body[data-adaptive="true"] .layout-rows[data-capacity="3"] .card-heading h2{font-size:13pt}
body[data-adaptive="true"] .layout-rows[data-capacity="3"] .card-heading{padding-bottom:2mm}
body[data-adaptive="true"] .layout-rows[data-capacity="3"] .spec{padding:.8mm 0}
body[data-adaptive="true"] .layout-rows[data-capacity="3"] .unit{font-size:8pt}
body[data-adaptive="true"] .layout-spotlight .card-body{display:flex;flex-direction:column;gap:6mm}
body[data-adaptive="true"] .layout-spotlight .visual{max-height:none;width:100%;padding:6mm}
body[data-adaptive="true"] .layout-spotlight .copy{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 7mm}
body[data-adaptive="true"] .layout-spotlight .description,body[data-adaptive="true"] .layout-spotlight .product-link{grid-column:1/-1}
.code{flex-wrap:wrap;line-height:1.35}.code span{font-size:6.8pt}.code strong{font-size:8.5pt;letter-spacing:0;overflow-wrap:anywhere;color:var(--ink)}
.dense .code strong{font-size:8.5pt}.visual img{max-width:var(--image-scale,100%);max-height:var(--image-scale,100%)}
@page{size:${width}mm ${height}mm;margin:0}@media print{body{background:white;-webkit-print-color-adjust:exact;print-color-adjust:exact}.sheet{margin:0;box-shadow:none}}
`;
}
