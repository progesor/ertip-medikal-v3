import path from "node:path";
import { execute } from "@/lib/backup/engine.mjs";
import { validExportOrigin } from "@/lib/product-export/origin";
import { serverEnv } from "@/lib/config/env";
import { createHmac, randomUUID } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { rm } from "node:fs/promises";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { getPayload } from "payload";
import config from "@payload-config";
import { isAdmin } from "@/access/roles";
import {
  addChunk,
  beginUpload,
  finishUpload,
  uploadFailure,
} from "@/lib/backup/upload";
import { scheduleBackup } from "@/lib/backup/schedule";
import {
  completedArchive,
  inventory,
  kinds,
  privateDir,
  validId,
} from "@/lib/backup/storage.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
const reply = (message: string, status: number) =>
  Response.json({ message }, { status, headers });

async function authorize(request: Request, downloadId?: string | null) {
  const payload = await getPayload({ config });
  const authorization = request.headers.get("authorization");
  if (
    request.method === "GET" &&
    downloadId &&
    validId(downloadId) &&
    authorization?.startsWith("Bearer ")
  ) {
    // Use the plugin's SHA-256 API key index and recheck the owner on each download.
    const apiKeyIndex = createHmac("sha256", payload.secret)
      .update(authorization.slice(7).trim())
      .digest("hex");
    const {
      docs: [key],
    } = await payload.find({
      collection: "payload-mcp-api-keys",
      overrideAccess: true,
      depth: 1,
      limit: 1,
      pagination: false,
      select: { user: true },
      populate: { users: { role: true } },
      where: {
        and: [
          { apiKeyIndex: { equals: apiKeyIndex } },
          { enableAPIKey: { equals: true } },
          { "payload-mcp-tool.getSiteBackupDownload": { equals: true } },
        ],
      },
    });
    if (!key || !isAdmin(key.user))
      return reply("Bu bağlantının yedek indirme yetkisi yok.", 403);
    return;
  }
  const { user } = await payload.auth({ headers: request.headers });
  if (!user || user.collection !== "users" || !isAdmin(user))
    return reply("Bu alan yöneticilere açıktır.", user ? 403 : 401);
  // Cross-origin HTML forms cannot set this header. Fetch preflights are not allowed.
  if (request.method !== "GET" && request.headers.get("x-ertip-backup") !== "1")
    return reply("Geçersiz istek.", 403);
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("download");
  const denied = await authorize(request, id);
  if (denied) return denied;
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

export async function POST(request: Request) {
  const denied = await authorize(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  if (body?.action === "beginUpload" || body?.action === "finishUpload") {
    try {
      const result =
        body.action === "beginUpload"
          ? await beginUpload(body.size)
          : await finishUpload(body.id, (file) =>
              scheduleBackup("import", file),
            );
      return Response.json(result, {
        status: body.action === "beginUpload" ? 201 : 202,
        headers,
      });
    } catch (error) {
      const failure = uploadFailure(error);
      return reply(failure.message, failure.status);
    }
  }
  if (body?.action === "create" && kinds.includes(body.kind))
    return Response.json(await scheduleBackup("create", body.kind, body.kind), {
      status: 202,
      headers,
    });
  if (body?.action === "restore" && validId(body.id) && body.confirm === true) {
    const archive = await completedArchive(body.id).catch(() => null);
    if (!archive) return reply("Yedek bulunamadı.", 404);
    return Response.json(
      await scheduleBackup("restore", archive.file, archive.record.kind),
      { status: 202, headers },
    );
  }
  return reply("İşlem ve yedek seçimini kontrol edin.", 400);
}
export async function PUT(request: Request) {
  const denied = await authorize(request);
  if (denied) return denied;
  const upload = request.headers.get("x-upload-id");
  if (upload !== null) {
    try {
      const offset = request.headers.get("x-upload-offset");
      const result = await addChunk(
        upload,
        offset === null ? NaN : Number(offset),
        request.body,
      );
      return Response.json(result, { headers });
    } catch (error) {
      const failure = uploadFailure(error);
      return reply(failure.message, failure.status);
    }
  }
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
    return Response.json(await scheduleBackup("import", file), {
      status: 202,
      headers,
    });
  } catch {
    await rm(file, { force: true });
    return reply(
      size > limit ? "Paket yükleme sınırını aşıyor." : "Paket yüklenemedi.",
      size > limit ? 413 : 400,
    );
  }
}

export async function DELETE(request: Request) {
  const denied = await authorize(request);
  if (denied) return denied;
  if (!validExportOrigin(request, serverEnv.publicSiteUrl))
    return reply("Geçersiz kaynak.", 403);
  const body = await request.json().catch(() => null);
  if (!validId(body?.id) || body?.confirm !== true)
    return reply("Silinecek yedeği seçin ve silmeyi onaylayın.", 400);
  try {
    await execute("delete", body.id);
    return Response.json({ deleted: body.id }, { headers });
  } catch (error) {
    if (
      error instanceof Error &&
      "status" in error &&
      typeof error.status === "number"
    )
      return reply(error.message, error.status);
    const payload = await getPayload({ config });
    payload.logger.error({ err: error }, "Backup archive deletion failed");
    return reply("Yedek silinemedi. Depolama alanını kontrol edin.", 500);
  }
}
