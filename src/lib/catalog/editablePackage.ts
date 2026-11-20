import { readFile } from "node:fs/promises";
import path from "node:path";
import { zip, strToU8, type Zippable } from "fflate";
import type { CatalogSVGPage } from "@/types/catalog";

export async function buildEditablePackage(
  pages: CatalogSVGPage[],
  pdf: Buffer,
) {
  const files: Zippable = { "reference.pdf": [pdf, { level: 0 }] };
  let faces = "";
  for (const family of ["Sans", "Serif"]) {
    for (const [style, weight] of [
      ["Regular", 400],
      ["SemiBold", 600],
    ] as const) {
      const name = `ErtipCatalog${family}-${style}.ttf`;
      const data = await readFile(
        path.join(process.cwd(), "public/catalog-fonts", name),
      );
      files["fonts/" + name] = data;
      faces += `@font-face{font-family:'Ertip Catalog ${family}';font-style:normal;font-weight:${weight};src:url(data:font/ttf;base64,${data.toString("base64")}) format('truetype');}`;
    }
  }
  for (const name of ["inter-LICENSE.txt", "source-serif-4-LICENSE.txt"])
    files["fonts/" + name] = await readFile(
      path.join(process.cwd(), "public/catalog-fonts", name),
    );
  for (const page of pages)
    files[`pages/page-${String(page.page).padStart(3, "0")}.svg`] = strToU8(
      page.svg.replace("<!--CATALOG_FONTS-->", "<style>" + faces + "</style>"),
    );
  files["README.txt"] =
    strToU8(`ERTIP - DÜZENLENEBİLİR KATALOG / EDITABLE CATALOG

1. ZIP paketini bir klasöre çıkarın.
2. fonts klasöründeki dört TTF fontunu bilgisayarınıza kurun.
3. Illustrator veya Inkscape'te Dosya > Aç ile pages/page-001.svg dosyasını açın.
   Her SVG tek bir katalog sayfasıdır. Tüm sayfalar pages klasöründedir.
4. Metin aracı ile yazıları düzenleyin. Ürünler, başlıklar ve görseller gruplar halindedir.
   Gerekirse gruba çift tıklayın veya Grubu Çöz (Ungroup) kullanın.
5. Illustrator'da kendi AI dosyanız olarak kaydedebilirsiniz.
6. reference.pdf asıl baskı görünümüdür; değişikliklerden sonra bu dosyayla karşılaştırın.

Metinler kontur değildir; satırlar tspan olarak korunur. Metin uzunluğu değişince
satır kırılımlarını ve konumlarını grafik programında düzenlemeniz gerekebilir.
Fotoğraflar gömülüdür, bağlı dosya gerektirmez. Fotoğraflar vektör çizime dönüşmez.
Fontlar kurulmazsa grafik programı başka font kullanabilir ve satır ölçüleri değişebilir.
Uygulamaya göre renk, saydamlık ve görsel harmanlama farkları olabilir.
Illustrator, SVG Tiny'ye yeniden kayıtta kırpmanın kaybolacağı uyarısını gösterebilir.
Kontrol edilen sayfa görünümü korunur; düzenlemeyi AI veya tam SVG 1.1 olarak kaydedin.
Harici düzenlemeler Katalog Stüdyosu'na veya kaynak ürünlere geri aktarılmaz.
Bu paket yerel Adobe AI/INDD biçimi değildir. Renk uzayı RGB'dir.

ENGLISH
Extract the ZIP and install the four TTF fonts in fonts/.
Open any pages/page-NNN.svg with File > Open in Illustrator or Inkscape.
Each file is one catalog page with live text, grouped objects and embedded photos.
Use the text tool or ungroup objects to edit. Save as AI in Illustrator if desired.
reference.pdf preserves the original print appearance.
Text remains editable but line wrapping is fixed; longer copy may need manual reflow.
Font substitution or editor-specific transparency/blending can change appearance.
Illustrator may warn that clipping is lost on round-trip to SVG Tiny.
Keep edits in AI or full SVG 1.1 and compare the result with reference.pdf.
Edits do not sync back to Catalog Studio. This is SVG, not native AI/INDD, and uses RGB.

FONT CREDITS
Ertip Catalog Sans is a renamed combination of the Latin and Latin Extended subsets of Inter.
Ertip Catalog Serif is a renamed combination of the same subsets of Source Serif 4.
Generated from the project's Fontsource packages with FontTools, preserving glyph metrics.
Both fonts remain under the SIL Open Font License 1.1. Original licenses are in fonts/.

PAGES / SAYFALAR
${pages.map((p) => String(p.page).padStart(3, "0") + " - " + p.title).join("\n")}
`);
  return new Promise<Buffer>((resolve, reject) =>
    zip(files, { level: 6 }, (error, result) =>
      error ? reject(error) : resolve(Buffer.from(result)),
    ),
  );
}
