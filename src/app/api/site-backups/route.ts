import path from "node:path";
import { randomUUID } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { rm } from "node:fs/promises";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";
import { isAdmin } from "@/access/roles";
import { invalidateProtectedMediaCache } from "@/lib/security/protectedMedia";
import { execute } from "@/lib/backup/engine.mjs";
import {
  completedArchive,
  inventory,
  kinds,
  privateDir,
  processStarted,
  saveJSON,
  validId,
} from "@/lib/backup/storage.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
const reply = (message: string, status: number) =>
  Response.json({ message }, { status, headers });

async function authorize(request: Request) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if (!user || user.collection !== "users" || !isAdmin(user))
    return reply("Bu alan yöneticilere açıktır.", user ? 403 : 401);
  // Cross-origin HTML forms cannot set this header. Fetch preflights are not allowed.
  if (request.method !== "GET" && request.headers.get("x-ertip-backup") !== "1")
    return reply("Geçersiz istek.", 403);
}

export async function GET(request: Request) {
  const denied = await authorize(request);
  if (denied) return denied;
  const id = new URL(request.url).searchParams.get("download");
  if (id === null) return Response.json(await inventory(), { headers });
  if (!validId(id)) return reply("Yedek bulunamadı.", 404);
  const archive = await completedArchive(id).catch(() => null);
  if (!archive) return reply("Yedek bulunamadı.", 404);
  return new Response(
    Readable.toWeb(createReadStream(archive.file)) as ReadableStream,
    {
      headers: {
        ...headers,
        "Content-Type": "application/octet-stream",
        "Content-Length": String(archive.size),
        "Content-Disposition":
          'attachment; filename="ertip-' +
          archive.record.kind +
          "-" +
          archive.record.date.slice(0, 10) +
          "-" +
          id +
          '.ertip"',
      },
    },
  );
}

async function schedule(
  action: "create" | "restore" | "import",
  value: string,
  kind?: string,
) {
  const job = {
    id: randomUUID(),
    date: new Date().toISOString(),
    pid: process.pid,
    started: processStarted,
    status: "running",
    action,
    kind,
  };
  const file = path.join(await privateDir(), job.id + ".json");
  await saveJSON(file, job);
  after(async () => {
    try {
      const result = await execute(action, value, async () => {
        invalidateProtectedMediaCache();
        revalidatePath("/", "layout");
      });
      if (action === "restore")
        await saveJSON(file, { ...job, status: "done", kind: result.kind });
      else await rm(file); // The finished archive has its own persistent record.
    } catch (error) {
      await saveJSON(file, {
        ...job,
        status: "failed",
        message:
          error instanceof Error ? error.message : "İşlem tamamlanamadı.",
      });
    } finally {
      if (action === "import") await rm(value, { force: true });
    }
  });
  return Response.json({ id: job.id }, { status: 202, headers });
}
export async function POST(request: Request) {
  const denied = await authorize(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  if (body?.action === "create" && kinds.includes(body.kind))
    return schedule("create", body.kind, body.kind);
  if (body?.action === "restore" && validId(body.id) && body.confirm === true) {
    const archive = await completedArchive(body.id).catch(() => null);
    if (!archive) return reply("Yedek bulunamadı.", 404);
    return schedule("restore", archive.file, archive.record.kind);
  }
  return reply("İşlem ve yedek seçimini kontrol edin.", 400);
}
export async function PUT(request: Request) {
  const denied = await authorize(request);
  if (denied) return denied;
  if (!request.body) return reply("Paket seçin.", 400);
  const limit = Number(process.env.BACKUP_UPLOAD_MAX_BYTES || 16 * 1024 ** 3);
  if (!Number.isSafeInteger(limit) || limit <= 0)
    return reply("Sunucu yükleme sınırı geçersiz.", 500);
  if (Number(request.headers.get("content-length")) > limit)
    return reply("Paket yükleme sınırını aşıyor.", 413);
  const file = path.join(await privateDir(), "upload-" + randomUUID());
  let size = 0;
  const counter = new Transform({
    transform(chunk, _, callback) {
      size += chunk.length;
      callback(size > limit ? Error("limit") : null, chunk);
    },
  });
  try {
    await pipeline(
      Readable.fromWeb(request.body as Parameters<typeof Readable.fromWeb>[0]),
      counter,
      createWriteStream(file, { flags: "wx", mode: 0o600 }),
    );
    return await schedule("import", file);
  } catch {
    await rm(file, { force: true });
    return reply(
      size > limit ? "Paket yükleme sınırını aşıyor." : "Paket yüklenemedi.",
      size > limit ? 413 : 400,
    );
  }
}
