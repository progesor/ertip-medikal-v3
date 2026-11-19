import path from "node:path";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import type { CatalogSnapshot } from "@/types/catalog";
import { renderCatalog } from "./render";

// Resolve filesystem assets at runtime; bundlers otherwise turn require.resolve into module IDs.
const resolveAsset = process
  .getBuiltinModule("module")
  .createRequire(path.join(process.cwd(), "package.json")).resolve;
export async function catalogHTML(snapshot: CatalogSnapshot) {
  const assets = new Map<number, string>();
  const images = [
    snapshot.coverImage,
    ...snapshot.products.map((p) => p.image),
  ].filter((image) => image !== null);
  const root = path.resolve("media");
  for (const image of images) {
    if (assets.has(image.id)) continue;
    if (
      path.basename(image.filename) !== image.filename ||
      /[\\/\x00]/.test(image.filename)
    )
      throw Error("Geçersiz medya dosyası.");
    const file = path.resolve(root, image.filename);
    if (path.dirname(file) !== root) throw Error("Geçersiz medya konumu.");
    const data = await sharp(await readFile(file))
      .rotate()
      .resize({
        width: snapshot.config.profile === "quality" ? 2200 : 1000,
        height: snapshot.config.profile === "quality" ? 2200 : 1000,
        fit: "inside",
        withoutEnlargement: true,
      })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: snapshot.config.profile === "quality" ? 95 : 83 })
      .toBuffer();
    assets.set(image.id, "data:image/jpeg;base64," + data.toString("base64"));
  }
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
export async function generateCatalogPDF(snapshot: CatalogSnapshot) {
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
    }));
    if (result.failed || !result.pages)
      throw Error("Sayfa yerleşimi oluşturulamadı.");
    if (result.overflow)
      throw Error(
        "Sayfaya sığmayan içerik var. Daha az ürünlü düzen seçin. " +
          result.overflow.slice(0, 200),
      );
    const data = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
    });
    return { data, pages: result.pages };
  } finally {
    await browser.close();
  }
}
