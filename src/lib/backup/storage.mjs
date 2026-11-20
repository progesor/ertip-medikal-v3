import path from "node:path";
import {
  rm,
  mkdir,
  readdir,
  readFile,
  rename,
  stat,
  writeFile,
} from "node:fs/promises";
import { randomUUID } from "node:crypto";

export const kinds = ["full", "sql", "media"];
export const processStarted = Math.round(Date.now() - process.uptime() * 1000);
export const validId = (id) =>
  typeof id === "string" &&
  /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(id);
export const mediaRoot = () => path.resolve("media");
function contains(parent, child) {
  const relative = path.relative(parent, child);
  return (
    relative !== ".." &&
    !relative.startsWith(".." + path.sep) &&
    !path.isAbsolute(relative)
  );
}
export function backupRoot() {
  // Runtime volume. Its contents must never become build inputs.
  const dir = path.resolve(
    /* turbopackIgnore: true */ process.env.BACKUP_DIR || ".backups",
  );
  for (const forbidden of [
    mediaRoot(),
    path.resolve("public"),
    path.resolve(".next"),
  ]) {
    if (contains(dir, forbidden) || contains(forbidden, dir))
      throw Error("Yedek dizini medya ve web dizinlerinden ayrı olmalı.");
  }
  return dir;
}
export const maintenanceFile = () => path.join(backupRoot(), "restoring.json");
export function archiveFile(id) {
  if (!validId(id)) throw Error("Geçersiz yedek.");
  return path.join(backupRoot(), id + ".ertip");
}
export async function privateDir() {
  const dir = backupRoot();
  await mkdir(dir, { recursive: true, mode: 0o700 });
  return dir;
}
export async function saveJSON(file, value) {
  const temp = file + "." + randomUUID() + ".tmp";
  await writeFile(temp, JSON.stringify(value), { mode: 0o600, flag: "wx" });
  await rename(temp, file);
}
export async function readJSON(file) {
  return JSON.parse(await readFile(file, "utf8"));
}
export async function inventory() {
  const dir = await privateDir();
  const files = await readdir(/* turbopackIgnore: true */ dir);
  const entries = files.filter(
    (n) => n.endsWith(".json") && validId(n.split(".")[0]),
  );
  const records = (
    await Promise.all(
      entries.map(async (n) => {
        try {
          return await readJSON(path.join(/* turbopackIgnore: true */ dir, n));
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
          return null; // A running job can be replaced by the completed archive during listing.
        }
      }),
    )
  ).filter(Boolean);
  for (const r of records) {
    if (r.status === "running") {
      let stopped =
        r.pid === process.pid && Math.abs(r.started - processStarted) > 2000;
      try {
        process.kill(r.pid, 0);
      } catch (e) {
        stopped ||= e.code === "ESRCH";
      }
      if (stopped) {
        r.status = "failed";
        r.message = "Sunucu yeniden başlatıldı. İşlemi tekrar başlatın.";
      }
    }
    delete r.pid;
    delete r.started;
  }
  return records.sort((a, b) => b.date.localeCompare(a.date));
}
export async function completedArchive(id) {
  const file = archiveFile(id);
  const record = await readJSON(path.join(backupRoot(), id + ".json"));
  if (record.status !== "done" || !["create", "import"].includes(record.action))
    throw Error("Yedek hazır değil.");
  return { file, record, size: (await stat(file)).size };
}

// Called only while the backup engine holds the PostgreSQL backup/restore lock.
export async function deleteBackupRecord(id) {
  if (!validId(id))
    throw Object.assign(Error("Geçersiz yedek."), { status: 400 });
  const records = await inventory();
  if (records.some((r) => r.status === "running"))
    throw Object.assign(
      Error("Yedekleme işlemi sürüyor. Tamamlanmasını bekleyin."),
      { status: 409 },
    );
  if (!records.some((r) => r.id === id))
    throw Object.assign(Error("Yedek bulunamadı."), { status: 404 });
  await rm(archiveFile(id), { force: true });
  await rm(path.join(backupRoot(), id + ".json"), { force: true });
}
