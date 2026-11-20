import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { after } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { isAdmin } from "@/access/roles";
import { productExportSchema } from "@/lib/product-export/schema";
import { allRecords } from "@/lib/product-export/source";
import {
  deleteJob,
  createJob,
  exportPath,
  listJobs,
  readJob,
  publicJob,
} from "@/lib/product-export/storage";
import { runProductExport } from "@/lib/product-export/run";
import { validId } from "@/lib/backup/storage.mjs";
import { validExportOrigin } from "@/lib/product-export/origin";
import { serverEnv } from "@/lib/config/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 900;
const headers = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};
const reply = (message: string, status: number) =>
  Response.json({ message }, { status, headers });
async function authorize(request: Request) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  return {
    payload,
    user: user?.collection === "users" && isAdmin(user) ? user : null,
  };
}
export async function GET(request: Request) {
  const { payload, user } = await authorize(request);
  if (!user) return reply("Bu alan yöneticilere açıktır.", 401);
  const params = new URL(request.url).searchParams,
    download = params.get("download");
  if (download !== null) {
    if (!validId(download)) return reply("Dosya bulunamadı.", 404);
    const job = await readJob(download).catch(() => null);
    if (!job || job.status !== "done" || Date.parse(job.expiresAt) < Date.now())
      return reply("Dosya hazır değil veya süresi dolmuş.", 404);
    const file = await exportPath(download, "zip"),
      info = await stat(file).catch(() => null);
    if (!info) return reply("Dosya bulunamadı.", 404);
    return new Response(
      Readable.toWeb(createReadStream(file)) as ReadableStream,
      {
        headers: {
          ...headers,
          "Content-Type": "application/zip",
          "Content-Length": String(info.size),
          "Content-Disposition":
            'attachment; filename="ertip-products-' +
            job.createdAt.slice(0, 10) +
            "-" +
            job.id +
            '.zip"',
        },
      },
    );
  }
  const jobs = await listJobs();
  if (params.has("jobs")) return Response.json({ jobs }, { headers });
  const [products, categories, published] = await Promise.all([
    allRecords(payload, "products", undefined, true, {
      title: true,
      sku: true,
      category: true,
      _status: true,
    }),
    allRecords(payload, "categories", undefined, false, {
      title: true,
      parent: true,
    }),
    allRecords(
      payload,
      "products",
      { _status: { equals: "published" } },
      false,
      { id: true },
    ),
  ]);
  const publishedIds = new Set(published.map((p) => p.id));
  return Response.json(
    {
      products: products.map((p) => ({
        ...p,
        hasPublishedVersion: publishedIds.has(p.id),
      })),
      categories,
      jobs,
    },
    { headers },
  );
}
export async function POST(request: Request) {
  const { payload, user } = await authorize(request);
  if (!user) return reply("Bu alan yöneticilere açıktır.", 401);
  if (request.headers.get("x-ertip-export") !== "1")
    return reply("Geçersiz istek.", 403);
  if (!validExportOrigin(request, serverEnv.publicSiteUrl))
    return reply("Geçersiz kaynak.", 403);
  const parsed = productExportSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return reply("Aktarım kapsamını ve seçiminizi kontrol edin.", 400);
  try {
    const job = await createJob(parsed.data);
    after(() => runProductExport(payload, job, user.id));
    return Response.json(publicJob(job), { status: 202, headers });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Başka bir"))
      return reply(error.message, 409);
    payload.logger.error({ err: error }, "Product export could not start");
    return reply("Aktarım başlatılamadı. Depolama alanını kontrol edin.", 500);
  }
}

export async function DELETE(request: Request) {
  const { payload, user } = await authorize(request);
  if (!user) return reply("Bu alan yöneticilere açıktır.", 401);
  if (
    request.headers.get("x-ertip-export") !== "1" ||
    !validExportOrigin(request, serverEnv.publicSiteUrl)
  )
    return reply("Geçersiz istek.", 403);
  const body = await request.json().catch(() => null);
  if (!validId(body?.id) || body?.confirm !== true)
    return reply("Silinecek paketi seçin ve silmeyi onaylayın.", 400);
  try {
    await deleteJob(body.id);
    return Response.json({ deleted: body.id }, { headers });
  } catch (error) {
    if (
      error instanceof Error &&
      "status" in error &&
      typeof error.status === "number"
    )
      return reply(error.message, error.status);
    payload.logger.error({ err: error }, "Product archive deletion failed");
    return reply("Paket silinemedi. Depolama alanını kontrol edin.", 500);
  }
}
