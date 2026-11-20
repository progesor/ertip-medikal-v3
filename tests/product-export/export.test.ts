import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import os from "node:os";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { unzipSync, strFromU8 } from "fflate";
import type { Field, Payload } from "payload";
import { productExportSchema } from "../../src/lib/product-export/schema";
import {
  csv,
  flattenRecord,
  sanitizeRecord,
  plainText,
  localized,
  categoryClosure,
} from "../../src/lib/product-export/serialize";
import {
  mediaReferences,
  allRecords,
} from "../../src/lib/product-export/source";
import {
  safeMediaFile,
  writeProductArchive,
} from "../../src/lib/product-export/archive";
import {
  createJob,
  listJobs,
  releaseJob,
  saveJob,
} from "../../src/lib/product-export/storage";
import type { ProductExportData } from "../../src/types/productExport";

test("selection is explicit and category closure handles grandchildren and cycles", () => {
  assert.equal(
    productExportSchema.safeParse({ scope: "products" }).success,
    false,
  );
  assert.equal(
    productExportSchema.safeParse({ scope: "categories" }).success,
    false,
  );
  assert.equal(
    productExportSchema.safeParse({ scope: "all", includeImages: "yes" })
      .success,
    false,
  );
  const categories = [
    { id: 1, parent: 3 },
    { id: 2, parent: 1 },
    { id: 3, parent: 2 },
    { id: 4 },
  ];
  assert.deepEqual([...categoryClosure(categories, [1], true)], [1, 2, 3]);
  assert.deepEqual([...categoryClosure(categories, [1], false)], [1]);
});
test("source remains complete while protected access codes are removed recursively", () => {
  const raw = {
    id: 1,
    title: { tr: "Ürün", en: null },
    variants: [{ sku: "001", isActive: false, price: 20 }],
    protectedDocs: [{ file: 9, accessCodes: [{ code: "SECRET" }] }],
    rules: { template: "{x}" },
  };
  const sanitized = sanitizeRecord(raw);
  assert.equal(JSON.stringify(sanitized).includes("SECRET"), false);
  assert.ok(JSON.stringify(raw).includes("SECRET"));
  assert.deepEqual((sanitized as typeof raw).variants, raw.variants);
  assert.equal(localized(raw.title, "en"), null);
  assert.deepEqual(
    flattenRecord({ title: raw.title, variants: raw.variants }),
    { "title.tr": "Ürün", "title.en": null, variants: raw.variants },
  );
  assert.equal(
    plainText({
      root: {
        type: "root",
        children: [
          { type: "paragraph", children: [{ text: "Bir" }, { text: " ürün" }] },
          { type: "paragraph", children: [{ text: "İki" }] },
        ],
      },
    }),
    "Bir ürün\nİki",
  );
});
test("CSV quotes multiline content and neutralizes formulas without altering JSON", () => {
  const result = csv([
    { sku: "0012", text: 'A, "B"\nC', formula: " \t=SUM(1,1)", negative: "-1" },
  ]);
  assert.ok(result.startsWith("\uFEFF"));
  assert.ok(result.includes('"A, ""B""\nC"'));
  assert.ok(result.includes('"\' \t=SUM(1,1)"'));
  assert.ok(result.includes('"\'-1"'));
  assert.ok(result.includes('"0012"'));
});
test("media references include localized uploads, variants, rich text, and documents", () => {
  const fields: Field[] = [
    { name: "mainImage", type: "upload", relationTo: "media" },
    {
      name: "variants",
      type: "array",
      fields: [
        {
          name: "variantImages",
          type: "array",
          fields: [{ name: "image", type: "upload", relationTo: "media" }],
        },
      ],
    },
    {
      name: "protectedDocs",
      type: "array",
      fields: [{ name: "file", type: "upload", relationTo: "media" }],
    },
    { name: "description", type: "richText", localized: true },
  ];
  const refs = mediaReferences(
    fields,
    {
      mainImage: 7,
      variants: [{ variantImages: [{ image: 7 }] }],
      protectedDocs: [{ file: 8 }],
      description: {
        tr: {
          root: {
            children: [{ type: "upload", relationTo: "media", value: 9 }],
          },
        },
        en: null,
      },
    },
    "products",
    1,
  );
  assert.deepEqual(
    refs.map((r) => r.mediaId),
    [7, 7, 8, 9],
  );
  assert.equal(refs[2].kind, "document");
  assert.equal(refs[3].kind, "image");
  assert.ok(refs[3].field.startsWith("description.tr"));
});
test("source paging preserves all rows, both locales and no fallback", async () => {
  const calls: Record<string, unknown>[] = [];
  const payload = {
    find: async (args: Record<string, unknown>) => {
      calls.push(args);
      return { docs: [{ id: args.page }], hasNextPage: Number(args.page) < 3 };
    },
  } as unknown as Payload;
  const records = await allRecords(payload, "products");
  assert.deepEqual(
    records.map((r) => r.id),
    [1, 2, 3],
  );
  assert.ok(
    calls.every(
      (c) => c.locale === "all" && c.fallbackLocale === false && c.depth === 0,
    ),
  );
});
test("streamed ZIP preserves files, hashes, missing reports and image-free mode", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "ertip-export-test-"));
  try {
    const image = Buffer.from("original image bytes");
    await writeFile(path.join(dir, "photo.png"), image);
    const options = productExportSchema.parse({ includeImages: true });
    const data: ProductExportData = {
      products: [
        {
          id: 1,
          title: { tr: "Türkçe", en: "English" },
          sku: "001",
          variants: [{ sku: "0002", isActive: false }],
          category: [2],
        },
      ],
      categories: [{ id: 2, title: { tr: "Kategori", en: "Category" } }],
      fields: [],
      references: [
        {
          collection: "products",
          recordId: 1,
          field: "mainImage",
          mediaId: 7,
          kind: "image",
        },
        {
          collection: "products",
          recordId: 1,
          field: "gallery.0.image",
          mediaId: 7,
          kind: "image",
        },
        {
          collection: "products",
          recordId: 1,
          field: "gallery.1.image",
          mediaId: 8,
          kind: "image",
        },
        {
          collection: "products",
          recordId: 1,
          field: "publicDocs.0.file",
          mediaId: 9,
          kind: "document",
        },
      ],
      media: [
        { id: 7, filename: "photo.png" },
        { id: 8, filename: "missing.png" },
        { id: 9, filename: "document.pdf" },
      ],
    };
    const result = await writeProductArchive(
      path.join(dir, "full.zip"),
      data,
      options,
      async () => {},
      dir,
    );
    assert.equal(result.fileCount, 1);
    assert.equal(result.warnings.length, 1);
    const files = unzipSync(await readFile(path.join(dir, "full.zip")));
    assert.equal(
      Object.keys(files).filter((k) => k.startsWith("assets/")).length,
      1,
    );
    assert.deepEqual(Buffer.from(files["assets/media-7/photo.png"]), image);
    const assets = JSON.parse(strFromU8(files["data/media.json"]));
    assert.equal(
      assets[0].sha256,
      createHash("sha256").update(image).digest("hex"),
    );
    assert.equal(assets[1].status, "missing");
    assert.equal(assets[2].status, "excluded");
    assert.ok(strFromU8(files["tables/products.csv"]).includes('"title.tr"'));
    assert.ok(strFromU8(files["tables/variants.csv"]).includes('"false"'));
    assert.ok(strFromU8(files["ai/en/product-1.md"]).includes("# English"));
    assert.equal(
      JSON.parse(strFromU8(files["data/products.ndjson"]))._export.media.length,
      4,
    );
    await writeProductArchive(
      path.join(dir, "none.zip"),
      data,
      { ...options, includeImages: false },
      async () => {},
      dir,
    );
    const none = unzipSync(await readFile(path.join(dir, "none.zip")));
    assert.equal(
      Object.keys(none).filter((k) => k.startsWith("assets/")).length,
      0,
    );
    assert.equal(
      JSON.parse(strFromU8(none["data/media.json"]))[0].archivePath,
      null,
    );
    await assert.rejects(safeMediaFile(dir, "../outside.txt"));
    await assert.rejects(safeMediaFile(dir, "C:\\secret.txt"));
  } finally {
    assert.ok(dir.startsWith(path.join(os.tmpdir(), "ertip-export-test-")));
    await rm(dir, { recursive: true, force: true });
  }
});
test("private jobs reject concurrent creation and expire only completed packages", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "ertip-export-jobs-")),
    previous = process.env.BACKUP_DIR;
  process.env.BACKUP_DIR = dir;
  try {
    const options = productExportSchema.parse({});
    const job = await createJob(options);
    await assert.rejects(createJob(options), /Başka bir aktarım/);
    assert.equal((await listJobs())[0].pid, undefined);
    job.status = "done";
    job.expiresAt = new Date(0).toISOString();
    await saveJob(job);
    await releaseJob(job.id);
    assert.equal((await listJobs()).length, 0);
    const next = await createJob(options);
    assert.notEqual(next.id, job.id);
    await releaseJob(next.id);
  } finally {
    if (previous === undefined) delete process.env.BACKUP_DIR;
    else process.env.BACKUP_DIR = previous;
    assert.ok(dir.startsWith(path.join(os.tmpdir(), "ertip-export-jobs-")));
    await rm(dir, { recursive: true, force: true });
  }
});

import { validExportOrigin } from "../../src/lib/product-export/origin";
test("origin check accepts the public host behind Next and rejects foreign or malformed origins", () => {
  const req = (origin: string, proto = "https") =>
    new Request("http://localhost:3020/api/product-exports", {
      headers: { host: "test.example.com", origin, "x-forwarded-proto": proto },
    });
  assert.equal(validExportOrigin(req("https://test.example.com")), true);
  assert.equal(validExportOrigin(req("https://other.example.com")), false);
  assert.equal(validExportOrigin(req("http://test.example.com")), false);
  assert.equal(validExportOrigin(req("null")), false);
  assert.equal(
    validExportOrigin(
      new Request("http://localhost:3020/api/product-exports", {
        headers: { host: "127.0.0.1:3020", origin: "http://127.0.0.1:3020" },
      }),
    ),
    true,
  );
});
