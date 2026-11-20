import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readdir,
  rename,
  rm,
  stat,
} from "node:fs/promises";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { pack, unpack } from "./archive.mjs";
import {
  deleteBackupRecord,
  archiveFile,
  backupRoot,
  kinds,
  maintenanceFile,
  mediaRoot,
  privateDir,
  readJSON,
  saveJSON,
} from "./storage.mjs";

const exec = promisify(execFile);
async function postgresTool(name, args) {
  const binary = process.env.PG_BIN_DIR
    ? path.join(process.env.PG_BIN_DIR, name)
    : name;
  const url = new URL(process.env.DATABASE_URI);
  const password =
    url.searchParams.get("password") ?? decodeURIComponent(url.password);
  url.password = "";
  url.searchParams.delete("password");
  try {
    await exec(binary, ["--no-password", "--dbname=" + url.href, ...args], {
      windowsHide: true,
      maxBuffer: 8 * 1024 * 1024,
      env: { ...process.env, PGPASSWORD: password, PGCONNECT_TIMEOUT: "15" },
    });
  } catch (error) {
    if (error.code === "ENOENT")
      throw Error(
        name +
          " bulunamadı. PostgreSQL istemcisini kurun veya PG_BIN_DIR tanımlayın.",
      );
    // Native diagnostics may contain customer data, SQL statements or credentials.
    throw Error(
      name +
        " işlemi tamamlanamadı. İstemci sürümünü, veritabanı sahipliğini ve disk alanını kontrol edin.",
    );
  }
}
async function copyMedia(source, target) {
  await cp(source, target, {
    recursive: true,
    force: false,
    errorOnExist: true,
    filter: async (file) => {
      const info = await lstat(file);
      if (!info.isFile() && !info.isDirectory())
        throw Error("Medya dizininde desteklenmeyen bağlantı veya dosya var.");
      const name = path.basename(file);
      if (name.includes("\\") || name.includes(":"))
        throw Error("Medya dosya adı taşınabilir değil.");
      return true;
    },
  });
}
async function replaceMedia(source) {
  const root = mediaRoot();
  if (!(await lstat(root)).isDirectory()) throw Error("Medya dizini geçersiz.");
  for (const name of await readdir(root))
    await rm(path.join(root, name), { recursive: true, force: true });
  for (const name of await readdir(source))
    await copyMedia(path.join(source, name), path.join(root, name));
}
async function existingMarker() {
  try {
    return await readJSON(maintenanceFile());
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

export async function execute(
  action,
  value,
  onRestored = async () => {},
  id = randomUUID(),
) {
  const root = await privateDir();
  const work = await mkdtemp(path.join(root, "work-"));
  const stage = path.join(work, "contents");
  const sql = path.join(stage, "database.sql");
  const media = path.join(stage, "media");
  const db = new pg.Client({
    connectionString: process.env.DATABASE_URI,
    connectionTimeoutMillis: 15000,
  });
  let preserveWork = false;
  try {
    await mkdir(stage);
    if (action === "extract") {
      const compressed = path.join(work, "verified.tar.gz");
      await unpack(value, stage, compressed);
      await rm(compressed);
      preserveWork = true;
      return { directory: stage };
    }
    await db.connect();
    const lock = await db.query(
      "SELECT pg_try_advisory_lock(20168113, 1) AS acquired",
    );
    if (!lock.rows[0].acquired)
      throw Object.assign(
        Error("Başka bir yedekleme işlemi sürüyor. Tamamlanmasını bekleyin."),
        { status: 409 },
      );
    const marker = await existingMarker();
    if (marker && action !== "restore")
      throw Object.assign(
        Error("Yarım kalan geri yükleme için aynı paketi tekrar seçin."),
        { status: 409 },
      );
    if (action === "delete") {
      await deleteBackupRecord(value);
      return { deleted: value, kind: undefined };
    }
    if (action === "create") {
      if (!kinds.includes(value)) throw Error("Geçersiz yedek türü.");
      const manifest = {
        kind: value,
        date: new Date().toISOString(),
        version: 1,
        archiveId: id,
        revision: process.env.SOURCE_COMMIT || null,
        postgres: (await db.query("SHOW server_version")).rows[0]
          .server_version,
      };
      if (value === "full") {
        await db.query("BEGIN");
        if (
          (await db.query("SELECT to_regclass('public.media') AS name")).rows[0]
            .name
        ) {
          await db.query("SET LOCAL lock_timeout = '30s'");
          await db.query("LOCK TABLE public.media IN SHARE MODE");
        }
      }
      if (value !== "media")
        await postgresTool("pg_dump", [
          "--format=plain",
          "--lock-wait-timeout=30s",
          "--no-owner",
          "--no-privileges",
          "--no-tablespaces",
          "--clean",
          "--if-exists",
          "--file",
          sql,
        ]);
      if (value !== "sql") await copyMedia(mediaRoot(), media);
      if (value === "full") await db.query("COMMIT");
      await saveJSON(path.join(stage, "manifest.json"), manifest);
      const temp = path.join(work, "archive");
      await pack(stage, value, temp);
      await rename(temp, archiveFile(id));
      return await register(id, action, manifest);
    }
    if (!["import", "restore"].includes(action)) throw Error("Geçersiz işlem.");
    const compressed = path.join(work, "verified.tar.gz");
    const kind = await unpack(value, stage, compressed);
    await rm(compressed);
    const manifest = await readJSON(path.join(stage, "manifest.json"));
    if (manifest.kind !== kind || manifest.version !== 1 || !manifest.archiveId)
      throw Error("Paket bilgileri geçersiz.");
    if (kind !== "media" && !(await stat(sql)).isFile())
      throw Error("SQL dosyası bulunamadı.");
    if (kind !== "sql" && !(await stat(media)).isDirectory())
      throw Error("Medya dizini bulunamadı.");
    if (action === "import") {
      await cp(value, archiveFile(id), { force: false, errorOnExist: true });
      return await register(id, action, manifest);
    }
    if (marker && marker.archiveId !== manifest.archiveId)
      throw Error(
        "Kurtarmayı tamamlamak için önce aynı paketi tekrar yükleyin.",
      );
    const previous = marker?.previous || path.join(work, "previous");
    if (kind !== "sql") {
      await mkdir(mediaRoot(), { recursive: true });
    }
    await saveJSON(maintenanceFile(), {
      archiveId: manifest.archiveId,
      previous,
    });
    if (!marker && kind !== "sql") {
      try {
        await copyMedia(mediaRoot(), previous);
      } catch (error) {
        await rm(maintenanceFile());
        throw error;
      }
    }
    // Keep the original media snapshot on disk until both resources are committed.
    try {
      if (kind !== "sql") await replaceMedia(media);
      if (kind !== "media")
        await postgresTool("psql", [
          "-X",
          "--quiet",
          "--single-transaction",
          "--set",
          "ON_ERROR_STOP=1",
          "--file",
          sql,
        ]);
    } catch (error) {
      if (!marker) {
        try {
          if (kind !== "sql") await replaceMedia(previous);
          await rm(maintenanceFile());
        } catch {
          preserveWork = true;
          throw Error("Kurtarma tamamlanamadı. Aynı paketi tekrar yükleyin.");
        }
      }
      throw error;
    }
    preserveWork = true;
    await onRestored();
    await rm(maintenanceFile());
    preserveWork = false;
    if (marker && path.dirname(previous) !== work) {
      // Only remove a recovery directory generated inside this private backup store.
      const oldWork = path.dirname(previous);
      if (
        path.dirname(oldWork) === root &&
        path.basename(oldWork).startsWith("work-")
      )
        await rm(oldWork, { recursive: true, force: true });
    }
    return { kind };
  } finally {
    await db.end();
    if (!preserveWork) await rm(work, { recursive: true, force: true });
  }
}
async function register(id, action, manifest) {
  const record = {
    id,
    action,
    status: "done",
    date: manifest.date,
    kind: manifest.kind,
    size: (await stat(archiveFile(id))).size,
  };
  await saveJSON(path.join(backupRoot(), id + ".json"), record);
  return record;
}
