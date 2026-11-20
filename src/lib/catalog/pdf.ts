import path from "node:path";
import { readFile, stat } from "node:fs/promises";
import sharp from "sharp";
import type { CatalogSnapshot, CatalogSVGPage } from "@/types/catalog";
import { renderCatalog } from "./render";
import { catalogConfigSchema } from "./schema";
import { catalogImageTargets } from "./imageSizing";

// Resolve filesystem assets at runtime; bundlers otherwise turn require.resolve into module IDs.
const resolveAsset = process
  .getBuiltinModule("module")
  .createRequire(path.join(process.cwd(), "package.json")).resolve;
const imageCache = new Map<string, string>();
export async function catalogHTML(snapshot: CatalogSnapshot) {
  const assets = new Map<number, string>();
  const targets = catalogImageTargets(snapshot);
  const images = [
    snapshot.coverImage,
    ...snapshot.products.map((p) => p.image),
  ].filter((image) => image !== null);
  const root = path.resolve("media");
  const unique = [
    ...new Map(images.map((image) => [image.id, image])).values(),
  ].filter((image) => targets.has(image.id));
  async function prepareImage(image: (typeof unique)[number]) {
    if (
      path.basename(image.filename) !== image.filename ||
      /[\\/\x00]/.test(image.filename)
    )
      throw Error("Geçersiz medya dosyası.");
    const file = path.resolve(root, image.filename);
    if (path.dirname(file) !== root) throw Error("Geçersiz medya konumu.");
    const info = await stat(file);
    const target = targets.get(image.id)!;
    const key =
      file + ":" + info.mtimeMs + ":" + snapshot.config.profile + ":" + target;
    const cached = imageCache.get(key);
    if (cached) {
      assets.set(image.id, cached);
      return;
    }
    const data = await sharp(await readFile(file))
      .rotate()
      .flatten({ background: "#ffffff" })
      .trim({ background: "#ffffff", threshold: 8 })
      .resize({
        width: target,
        height: target,
        fit: "inside",
        withoutEnlargement: true,
      })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: snapshot.config.profile === "quality" ? 95 : 83 })
      .toBuffer();
    const result = "data:image/jpeg;base64," + data.toString("base64");
    assets.set(image.id, result);
    imageCache.set(key, result);
    if (imageCache.size > 200)
      imageCache.delete(imageCache.keys().next().value!);
  }
  for (let i = 0; i < unique.length; i += 4)
    await Promise.all(unique.slice(i, i + 4).map(prepareImage));
  let fonts = "";
  for (const [pkg, family] of [
    ["inter", "Catalog Sans"],
    ["source-serif-4", "Catalog Serif"],
  ]) {
    for (const weight of [400, 600]) {
      for (const subset of ["latin", "latin-ext"]) {
        const directory = path.dirname(
          resolveAsset("@fontsource/" + pkg + "/package.json"),
        );
        const data = await readFile(
          path.join(
            directory,
            "files",
            pkg + "-" + subset + "-" + weight + "-normal.woff2",
          ),
        );
        fonts +=
          '@font-face{font-family:"' +
          family +
          '";font-style:normal;font-weight:' +
          weight +
          ";src:url(data:font/woff2;base64," +
          data.toString("base64") +
          ') format("woff2");unicode-range:' +
          (subset === "latin-ext"
            ? "U+0100-02FF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF"
            : "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD") +
          ";}";
      }
    }
  }
  return renderCatalog(snapshot, assets, fonts);
}
async function prepareDocument(
  snapshot: CatalogSnapshot,
  mode: "preview" | "pdf" | "editable",
) {
  snapshot = {
    ...snapshot,
    config: catalogConfigSchema.parse(snapshot.config),
  };
  const { chromium } = await import("playwright-core");
  const executablePath =
    process.env.CATALOG_CHROMIUM_PATH ||
    (process.platform === "linux" ? "/usr/bin/chromium" : undefined);
  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args:
      process.platform === "linux"
        ? ["--no-sandbox", "--disable-dev-shm-usage"]
        : [],
  });
  try {
    const context = await browser.newContext({ javaScriptEnabled: true });
    await context.route("**/*", (route) => route.abort());
    const page = await context.newPage();
    page.setDefaultTimeout(120000);
    await page.setContent(await catalogHTML(snapshot), {
      waitUntil: "load",
      timeout: 120000,
    });
    await page.waitForFunction(
      () =>
        document.body.dataset.ready === "true" ||
        document.body.dataset.failed === "true",
    );
    const result = await page.evaluate(() => ({
      pages: Number(document.body.dataset.pages),
      overflow: document.body.dataset.overflow,
      failed: document.body.dataset.failed,
      sheets: Array.from(
        document.querySelectorAll<HTMLElement>("#pages > .sheet"),
      ).map((sheet, index) => ({
        id: sheet.dataset.plan || sheet.id || "page-" + index,
        title: sheet.dataset.title || "",
        kind: sheet.dataset.kind || "products",
        page: index + 1,
        layout: ["grid", "rows", "spotlight"].find((layout) =>
          sheet.classList.contains("layout-" + layout),
        ),
        productIds: Array.from(
          sheet.querySelectorAll<HTMLElement>(".card[data-product]"),
        ).map((card) => Number(card.dataset.product)),
      })),
    }));
    if (result.failed || !result.pages)
      throw Error("Sayfa yerleşimi oluşturulamadı.");
    if (result.overflow)
      throw Error(
        "Sayfaya sığmayan içerik var. Daha az ürünlü düzen seçin. " +
          result.overflow.slice(0, 200),
      );
    const data =
      mode !== "preview"
        ? await page.pdf({
            printBackground: true,
            preferCSSPageSize: true,
            tagged: true,
          })
        : undefined;
    const svgs =
      mode === "editable"
        ? await page.evaluate<CatalogSVGPage[]>(
            (await import("./svg")).catalogSVGScript,
          )
        : [];
    // A static preview cannot hang on client script, font timing or postMessage races.
    await page.evaluate(() =>
      document
        .querySelectorAll("template,script")
        .forEach((node) => node.remove()),
    );
    return {
      data,
      pages: result.pages,
      sheets: result.sheets,
      svgs,
      html: mode === "preview" ? await page.content() : "",
    };
  } finally {
    await browser.close();
  }
}
export async function previewCatalog(snapshot: CatalogSnapshot) {
  return prepareDocument(snapshot, "preview");
}
export async function generateCatalogPDF(snapshot: CatalogSnapshot) {
  const result = await prepareDocument(snapshot, "pdf");
  return { data: result.data!, pages: result.pages };
}

export async function generateEditableCatalog(snapshot: CatalogSnapshot) {
  const result = await prepareDocument(
    { ...snapshot, config: { ...snapshot.config, profile: "quality" } },
    "editable",
  );
  const { buildEditablePackage } = await import("./editablePackage");
  return {
    data: await buildEditablePackage(result.svgs, result.data!),
    pages: result.pages,
  };
}
