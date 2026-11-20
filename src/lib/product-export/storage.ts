import path from "node:path";
import {
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  rm,
  stat,
} from "node:fs/promises";
import { randomUUID } from "node:crypto";
import {
  privateDir,
  processStarted,
  saveJSON,
  validId,
} from "@/lib/backup/storage.mjs";
import type {
  ProductExportJob,
  ProductExportOptions,
} from "@/types/productExport";

export async function exportRoot() {
  const dir = path.join(await privateDir(), "product-exports");
  await mkdir(dir, { recursive: true, mode: 0o700 });
  return dir;
}
export async function exportPath(
  id: string,
  extension: "json" | "zip" | "partial",
) {
  if (!validId(id)) throw Error("Geçersiz aktarım.");
  return path.join(await exportRoot(), id + "." + extension);
}
export async function readJob(id: string): Promise<ProductExportJob> {
  return JSON.parse(await readFile(await exportPath(id, "json"), "utf8"));
}
export async function saveJob(job: ProductExportJob) {
  await saveJSON(await exportPath(job.id, "json"), job);
}
function isAlive(job: ProductExportJob) {
  if (job.pid === process.pid)
    return Math.abs((job.started || 0) - processStarted) < 2000;
  if (!job.pid) return false;
  try {
    process.kill(job.pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code !== "ESRCH";
  }
}
export function publicJob(job: ProductExportJob) {
  const result = { ...job };
  delete result.pid;
  delete result.started;
  return result;
}
export async function listJobs() {
  const dir = await exportRoot(),
    jobs: ProductExportJob[] = [];
  for (const file of await readdir(/* turbopackIgnore: true */ dir)) {
    if (!file.endsWith(".json") || !validId(file.slice(0, -5))) continue;
    const job = await readJob(file.slice(0, -5));
    if (job.status === "running" && !isAlive(job)) {
      job.status = "failed";
      job.error = "Sunucu yeniden başladı. Yeni bir aktarım oluşturun.";
      await saveJob(job);
      await rm(await exportPath(job.id, "partial"), { force: true });
    }
    if (job.status !== "running" && Date.parse(job.expiresAt) < Date.now()) {
      for (const ext of ["zip", "partial", "json"] as const)
        await rm(await exportPath(job.id, ext), { force: true });
      continue;
    }
    jobs.push(job);
  }
  return jobs
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(publicJob);
}
export async function releaseJob(id: string) {
  const lock = path.join(await exportRoot(), "active.lock");
  try {
    if ((await readFile(lock, "utf8")) === id) await rm(lock, { force: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
export async function createJob(options: ProductExportOptions) {
  await listJobs();
  const dir = await exportRoot(),
    lock = path.join(dir, "active.lock"),
    id = randomUUID();
  async function acquire() {
    const handle = await open(lock, "wx", 0o600);
    try {
      await handle.writeFile(id);
    } finally {
      await handle.close();
    }
  }
  try {
    await acquire();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    const owner = await readFile(lock, "utf8");
    const running = validId(owner)
      ? await readJob(owner).catch(() => null)
      : null;
    if (
      (running && running.status === "running" && isAlive(running)) ||
      (!running && (await stat(lock)).mtimeMs > Date.now() - 60000)
    )
      throw Error("Başka bir aktarım hazırlanıyor. Tamamlanmasını bekleyin.");
    await releaseJob(owner);
    await acquire();
  }
  const job: ProductExportJob = {
    id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    status: "running",
    phase: "Ürün bilgileri hazırlanıyor",
    options,
    productCount: 0,
    fileCount: 0,
    processedFiles: 0,
    bytes: 0,
    warnings: [],
    pid: process.pid,
    started: processStarted,
  };
  try {
    await saveJob(job);
  } catch (error) {
    await releaseJob(id);
    throw error;
  }
  return job;
}
export async function finishArchive(id: string) {
  await rename(await exportPath(id, "partial"), await exportPath(id, "zip"));
}
