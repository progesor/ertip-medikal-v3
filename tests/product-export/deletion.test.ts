import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, writeFile, access, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  createJob,
  saveJob,
  exportPath,
  deleteJob,
  listJobs,
} from "../../src/lib/product-export/storage";
import { productExportSchema } from "../../src/lib/product-export/schema";
import {
  archiveFile,
  deleteBackupRecord,
  processStarted,
  saveJSON,
} from "../../src/lib/backup/storage.mjs";

test("archive deletion removes files, protects running jobs and rejects unsafe paths", async () => {
  const original = process.env.BACKUP_DIR;
  const root = await mkdtemp(path.join(os.tmpdir(), "ertip-archive-delete-"));
  process.env.BACKUP_DIR = root;
  try {
    const job = await createJob(productExportSchema.parse({}));
    await writeFile(await exportPath(job.id, "partial"), "test");
    await assert.rejects(deleteJob(job.id), { status: 409 });
    await access(await exportPath(job.id, "partial"));
    job.status = "done";
    await saveJob(job);
    await writeFile(await exportPath(job.id, "zip"), "test");
    await deleteJob(job.id);
    for (const ext of ["zip", "partial", "json"] as const)
      await assert.rejects(access(await exportPath(job.id, ext)), {
        code: "ENOENT",
      });
    await assert.rejects(deleteJob(job.id), { status: 404 });
    await assert.rejects(deleteJob("../outside"), { status: 400 });
    assert.deepEqual(await listJobs(), []);
    const stale = await createJob(productExportSchema.parse({}));
    stale.started = 1;
    await saveJob(stale);
    await deleteJob(stale.id);
    assert.deepEqual(await listJobs(), []);

    const id = randomUUID(),
      pending = randomUUID();
    const record = {
      id,
      status: "done",
      action: "create",
      date: new Date().toISOString(),
      kind: "full",
    };
    await saveJSON(path.join(root, id + ".json"), record);
    await writeFile(archiveFile(id), "disposable test archive");
    await saveJSON(path.join(root, pending + ".json"), {
      ...record,
      id: pending,
      status: "running",
      pid: process.pid,
      started: processStarted,
    });
    await assert.rejects(deleteBackupRecord(id), { status: 409 });
    await access(archiveFile(id));
    await saveJSON(path.join(root, pending + ".json"), {
      ...record,
      id: pending,
      status: "failed",
      action: "restore",
    });
    await deleteBackupRecord(id);
    await assert.rejects(access(archiveFile(id)), { code: "ENOENT" });
    await assert.rejects(access(path.join(root, id + ".json")), {
      code: "ENOENT",
    });
    await deleteBackupRecord(pending);
    await assert.rejects(deleteBackupRecord(id), { status: 404 });
    await assert.rejects(deleteBackupRecord("../../outside"), { status: 400 });
  } finally {
    if (original === undefined) delete process.env.BACKUP_DIR;
    else process.env.BACKUP_DIR = original;
    await rm(root, { recursive: true, force: true });
  }
});
