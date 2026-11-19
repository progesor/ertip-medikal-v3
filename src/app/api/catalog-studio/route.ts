import { getPayload, createLocalReq } from "payload";
import config from "@payload-config";
import { isContentManager } from "@/access/roles";
import { catalogSaveSchema } from "@/lib/catalog/schema";
import { catalogSnapshot } from "@/lib/catalog/source";
import type { CatalogSnapshot } from "@/types/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
function reply(message: string, status: number) {
  return Response.json({ message }, { status, headers });
}
async function authorize(request: Request) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  return {
    payload,
    user: user?.collection === "users" && isContentManager(user) ? user : null,
  };
}
export async function GET(request: Request) {
  const { payload, user } = await authorize(request);
  if (!user) return reply("Bu alan içerik yöneticilerine açıktır.", 401);
  const params = new URL(request.url).searchParams;
  if (params.has("outputs")) {
    const result = await payload.find({
      collection: "catalog-outputs",
      where: { catalog: { equals: Number(params.get("outputs")) } },
      depth: 0,
      sort: "-createdAt",
      limit: 30,
      select: {
        title: true,
        status: true,
        error: true,
        url: true,
        filename: true,
        pages: true,
        createdAt: true,
      },
    });
    return Response.json(result.docs, { headers });
  }
  const [catalogs, categories, products] = await Promise.all([
    payload.find({
      collection: "catalogs",
      depth: 0,
      limit: 200,
      sort: "-updatedAt",
    }),
    payload.find({
      collection: "categories",
      depth: 0,
      locale: "tr",
      limit: 1000,
    }),
    payload.find({
      collection: "products",
      where: { _status: { equals: "published" } },
      depth: 1,
      limit: 2000,
      locale: "tr",
      select: { title: true, sku: true, category: true, mainImage: true },
      sort: "_order",
    }),
  ]);
  return Response.json(
    {
      catalogs: catalogs.docs,
      categories: categories.docs.map((c) => ({
        id: c.id,
        title: c.title,
        parent: c.parent,
      })),
      products: products.docs.map((p) => ({
        id: p.id,
        title: p.title,
        sku: p.sku,
        categories: p.category.map((c) => (typeof c === "number" ? c : c.id)),
        image: typeof p.mainImage === "object" ? p.mainImage.url : null,
      })),
    },
    { headers },
  );
}
export async function POST(request: Request) {
  const { payload, user } = await authorize(request);
  if (!user) return reply("Bu alan içerik yöneticilerine açıktır.", 401);
  if (request.headers.get("x-ertip-catalog") !== "1")
    return reply("Geçersiz istek.", 403);
  const body = await request.json().catch(() => null);
  if (!body) return reply("İstek okunamadı.", 400);
  try {
    if (body.action === "save") {
      const parsed = catalogSaveSchema.safeParse(body);
      if (!parsed.success)
        return reply("Çalışma adını ve tasarım ayarlarını kontrol edin.", 400);
      const { id, updatedAt, ...data } = parsed.data;
      if (id) {
        if (!updatedAt) return reply("Çalışmayı yeniden açın.", 409);
        const updated = await payload.update({
          collection: "catalogs",
          where: {
            and: [{ id: { equals: id } }, { updatedAt: { equals: updatedAt } }],
          },
          data,
          depth: 0,
          user,
          overrideAccess: false,
        });
        if (!updated.docs.length)
          return reply(
            "Çalışma başka bir pencerede değişti. Güncel kopyayı açın.",
            409,
          );
        return Response.json(updated.docs[0], { headers });
      }
      return Response.json(
        await payload.create({
          collection: "catalogs",
          data,
          depth: 0,
          user,
          overrideAccess: false,
        }),
        { headers },
      );
    }
    if (body.action === "preview") {
      const parsed = catalogSaveSchema.safeParse(body);
      if (!parsed.success)
        return reply("Tasarım ayarlarını kontrol edin.", 400);
      const snapshot = await catalogSnapshot(
        payload,
        parsed.data.title,
        parsed.data.config,
      );
      if (!snapshot.products.length)
        return reply("Yayımlanmış en az bir ürün seçin.", 400);
      const { catalogHTML } = await import("@/lib/catalog/pdf");
      return Response.json(
        {
          html: await catalogHTML(snapshot),
          warnings: snapshot.warnings,
          products: snapshot.products,
        },
        { headers },
      );
    }
    if (body.action === "generate" && Number.isSafeInteger(body.id)) {
      const doc = await payload.findByID({
        collection: "catalogs",
        id: body.id,
        depth: 0,
        user,
        overrideAccess: false,
      });
      const parsed = catalogSaveSchema.safeParse(doc);
      if (!parsed.success)
        return reply("Çalışmanın tasarımını yeniden kaydedin.", 400);
      const snapshot = await catalogSnapshot(
        payload,
        doc.title,
        parsed.data.config,
      );
      if (!snapshot.products.length)
        return reply("Yayımlanmış en az bir ürün seçin.", 400);
      return Response.json(await queueOutput(payload, user, doc.id, snapshot), {
        status: 202,
        headers,
      });
    }
    return reply("İşlem bulunamadı.", 400);
  } catch (error) {
    payload.logger.error({ err: error }, "Catalog request failed");
    return reply(
      "İşlem tamamlanamadı. Çalışmayı ve ürün görsellerini kontrol edin.",
      500,
    );
  }
}
async function queueOutput(
  payload: Awaited<ReturnType<typeof getPayload>>,
  user: NonNullable<Awaited<ReturnType<typeof authorize>>["user"]>,
  catalogId: number,
  snapshot: CatalogSnapshot,
) {
  const transactionID = await payload.db.beginTransaction();
  if (!transactionID) throw Error("Transaction unavailable");
  const req = await createLocalReq({ user }, payload);
  req.transactionID = transactionID;
  try {
    const assets = [
      ...new Set(
        [
          snapshot.coverImage?.id,
          ...snapshot.products.map((p) => p.image?.id),
        ].filter((id): id is number => typeof id === "number"),
      ),
    ];
    const output = await payload.create({
      collection: "catalog-outputs",
      req,
      depth: 0,
      data: {
        title: snapshot.title,
        catalog: catalogId,
        status: "queued",
        snapshot: JSON.parse(JSON.stringify(snapshot)),
        assets,
      },
    });
    await payload.jobs.queue({
      task: "catalogPDF",
      input: { outputId: output.id },
      queue: "catalog",
      req,
    });
    await payload.db.commitTransaction(transactionID);
    return { id: output.id };
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID);
    throw error;
  }
}
