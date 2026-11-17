import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  mkdir,
  open,
  readdir,
  readFile,
  rm,
  stat,
  utimes,
  writeFile,
} from "node:fs/promises";
import { privateDir, validId } from "./storage.mjs";

const chunkSize = 4 * 1024 ** 2;
const expiry = 24 * 60 * 60 * 1000;
class UploadError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}
export function uploadFailure(error: unknown) {
  return error instanceof UploadError
    ? { message: error.message, status: error.status }
    : {
        message: "Yükleme kaydedilemedi. Sunucudaki boş alanı kontrol edin.",
        status: 500,
      };
}
export async function beginUpload(size: number) {
  const limit = Number(process.env.BACKUP_UPLOAD_MAX_BYTES || 16 * 1024 ** 3);
  if (!Number.isSafeInteger(limit) || limit <= 0)
    throw new UploadError("Sunucu yükleme sınırı geçersiz.", 500);
  if (!Number.isSafeInteger(size) || size <= 0)
    throw new UploadError("Paket boyutu geçersiz.", 400);
  if (size > limit)
    throw new UploadError("Paket yükleme sınırını aşıyor.", 413);
  const root = path.join(await privateDir(), "uploads");
  await mkdir(root, { recursive: true, mode: 0o700 });
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || !validId(entry.name)) continue;
    const dir = path.join(root, entry.name);
    const info = await stat(dir).catch(() => null);
    if (info && Date.now() - info.mtimeMs > expiry)
      await rm(dir, { recursive: true, force: true });
  }
  const id = randomUUID();
  const dir = path.join(root, id);
  await mkdir(dir, { mode: 0o700 });
  await writeFile(path.join(dir, "size"), String(size), { mode: 0o600 });
  await writeFile(path.join(dir, "archive"), "", { mode: 0o600, flag: "wx" });
  return { id, chunkSize };
}
async function session(id: string) {
  if (!validId(id)) throw new UploadError("Yükleme numarası geçersiz.", 400);
  const dir = path.join(await privateDir(), "uploads", id);
  const size = await readFile(path.join(dir, "size"), "utf8").catch(() => null);
  if (!size)
    throw new UploadError("Yükleme süresi doldu. Dosyayı tekrar seçin.", 404);
  return { dir, size: Number(size), file: path.join(dir, "archive") };
}
async function locked<T>(dir: string, run: () => Promise<T>) {
  const guard = path.join(dir, "busy");
  try {
    await mkdir(guard);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST")
      throw new UploadError("Önceki parça işleniyor.", 409);
    throw error;
  }
  try {
    return await run();
  } finally {
    await rm(guard, { recursive: true, force: true });
  }
}
export async function addChunk(
  id: string,
  offset: number,
  body: ReadableStream<Uint8Array> | null,
) {
  const { dir, file, size } = await session(id);
  if (
    !body ||
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    offset >= size ||
    offset % chunkSize !== 0
  )
    throw new UploadError("Parça konumu geçersiz.", 400);
  const length = Math.min(chunkSize, size - offset);
  const reader = body.getReader();
  const bytes = Buffer.allocUnsafe(length);
  let received = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (received + value.length > length) {
        await reader.cancel();
        throw new UploadError("Parça boyutu sınırı aşıldı.", 413);
      }
      bytes.set(value, received);
      received += value.length;
    }
  } finally {
    reader.releaseLock();
  }
  if (received !== length) throw new UploadError("Parça eksik ulaştı.", 400);
  return locked(dir, async () => {
    const handle = await open(file, "r+");
    try {
      const end = (await handle.stat()).size;
      if (offset > end)
        throw new UploadError("Önceki parça henüz ulaşmadı.", 409);
      // A repeated request may follow a lost response. Completed chunks are immutable.
      if (offset + length > end) {
        let written = 0;
        while (written < length) {
          const result = await handle.write(
            bytes,
            written,
            length - written,
            offset + written,
          );
          written += result.bytesWritten;
        }
      }
      const now = new Date();
      await utimes(dir, now, now);
      return { received: offset + length };
    } finally {
      await handle.close();
    }
  });
}
export async function finishUpload<T>(
  id: string,
  schedule: (file: string) => Promise<T>,
): Promise<T> {
  const { dir, file, size } = await session(id);
  return locked(dir, async () => {
    const receipt = path.join(dir, "receipt");
    const prior = await readFile(receipt, "utf8").catch((error) => {
      if (error.code !== "ENOENT") throw error;
      return null;
    });
    if (prior) return JSON.parse(prior) as T;
    if ((await stat(file)).size !== size)
      throw new UploadError("Paket henüz tamamlanmadı.", 409);
    const job = await schedule(file);
    await writeFile(receipt, JSON.stringify(job), { mode: 0o600 });
    return job;
  });
}
