import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { mkdtemp, mkdir, rm, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pack, unpack } from "../../src/lib/backup/archive.mjs";

test("A SQL package is portable and rejects corruption or a different site's key before extraction", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ertip-archive-"));
  const secret = process.env.PAYLOAD_SECRET;
  t.after(async () => {
    if (secret === undefined) delete process.env.PAYLOAD_SECRET;
    else process.env.PAYLOAD_SECRET = secret;
    await rm(root, { recursive: true, force: true });
  });
  process.env.PAYLOAD_SECRET = randomBytes(32).toString("hex");
  const source = path.join(root, "source");
  const dest = path.join(root, "restored");
  await mkdir(source);
  await mkdir(dest);
  await writeFile(path.join(source, "manifest.json"), "{}");
  const sql = "SELECT 'ürün';\n";
  await writeFile(path.join(source, "database.sql"), sql);
  const archive = path.join(root, "package.ertip");
  await pack(source, "sql", archive);
  assert.equal(
    await unpack(archive, dest, path.join(root, "verified.gz")),
    "sql",
  );
  assert.equal(await readFile(path.join(dest, "database.sql"), "utf8"), sql);

  await rm(path.join(dest, "database.sql"));
  const altered = await readFile(archive);
  altered[30] ^= 1;
  const corrupt = path.join(root, "damaged.ertip");
  await writeFile(corrupt, altered);
  await assert.rejects(
    unpack(corrupt, dest, path.join(root, "damaged.gz")),
    /doğrulanamadı/,
  );
  process.env.PAYLOAD_SECRET = randomBytes(32).toString("hex");
  await assert.rejects(
    unpack(archive, dest, path.join(root, "wrong-key.gz")),
    /doğrulanamadı/,
  );
  await assert.rejects(readFile(path.join(dest, "database.sql")), {
    code: "ENOENT",
  });
});
