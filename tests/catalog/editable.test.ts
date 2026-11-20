import assert from "node:assert/strict";
import test from "node:test";
import { unzipSync, strFromU8 } from "fflate";
import { buildEditablePackage } from "../../src/lib/catalog/editablePackage";

test("editable package retains live text, embedded photos and the original reference PDF", async () => {
  const pdf = Buffer.from("%PDF-1.7\nreference");
  const svg =
    '<svg><defs><!--CATALOG_FONTS--></defs><g><text>Çığ ŞÜ 370-075</text><image href="data:image/png;base64,AA=="/></g></svg>';
  const bytes = await buildEditablePackage(
    [{ page: 1, title: "Safir & DHI", svg }],
    pdf,
  );
  const files = unzipSync(bytes);
  assert.deepEqual(Buffer.from(files["reference.pdf"]), pdf);
  const page = strFromU8(files["pages/page-001.svg"]);
  assert.ok(page.includes("<text>Çığ ŞÜ 370-075</text>"));
  assert.ok(page.includes('href="data:image/png;base64,AA=="'));
  assert.ok(page.includes("@font-face"));
  assert.ok(!page.includes("<!--CATALOG_FONTS-->"));
  assert.equal(
    Object.keys(files).filter((name) => name.endsWith(".ttf")).length,
    4,
  );
  for (const name of Object.keys(files).filter((name) => name.endsWith(".ttf")))
    assert.equal(Buffer.from(files[name]).readUInt32BE(0), 0x00010000);
  assert.ok(
    strFromU8(files["fonts/inter-LICENSE.txt"]).includes("OPEN FONT LICENSE"),
  );
  assert.ok(
    strFromU8(files["fonts/source-serif-4-LICENSE.txt"]).includes(
      "OPEN FONT LICENSE",
    ),
  );
  assert.ok(strFromU8(files["README.txt"]).includes("001 - Safir & DHI"));
});

test("editable filenames use page numbers, never untrusted category titles", async () => {
  const pages = [1, 2, 10].map((page) => ({
    page,
    title: "../../outside",
    svg: "<svg><defs><!--CATALOG_FONTS--></defs></svg>",
  }));
  const files = unzipSync(
    await buildEditablePackage(pages, Buffer.from("%PDF-")),
  );
  assert.deepEqual(
    Object.keys(files).filter((name) => name.endsWith(".svg")),
    ["pages/page-001.svg", "pages/page-002.svg", "pages/page-010.svg"],
  );
  assert.ok(Object.keys(files).every((name) => !name.includes("..")));
});
