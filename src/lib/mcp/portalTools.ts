import type { MCPPluginConfig } from "@payloadcms/plugin-mcp";
import type { PayloadRequest } from "payload";
import { z } from "zod";
import {
  listProductContentIssues,
  reviewFilters,
} from "@/lib/catalog/contentReview";
import { isAdmin, isContentManager } from "@/access/roles";
import { uploadProductImage } from "@/lib/catalog/uploadProductImage";

type Tool = NonNullable<NonNullable<MCPPluginConfig["mcp"]>["tools"]>[number];

function readAccess(req: PayloadRequest) {
  if (!isContentManager(req.user))
    throw new Error("İçerik yönetimi yetkisi gerekiyor.");
  return { req, user: req.user, overrideAccess: false, depth: 0 } as const;
}

function result(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data) }] };
}

const catalogQuery = z.object({
  sku: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .describe("Ürün veya varyantın tam katalog kodu."),
  locale: z.enum(["tr", "en"]).default("tr"),
  page: z.number().int().positive().default(1),
});
const reviewPage = z.object({
  filter: z.enum(reviewFilters).default("all"),
  limit: z.number().int().min(1).max(50).default(20),
  after: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Sonraki sayfa için önceki yanıtın nextAfter değeri."),
  before: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Önceki sayfa için önceki yanıtın previousBefore değeri."),
});
const productQuery = z.object({ productId: z.number().int().positive() });

export const portalTools: Tool[] = [
  uploadProductImage,
  {
    name: "listProductContentIssues",
    description:
      "Paneldeki eksik ürün listesini okur. Ana görsel, Türkçe veya İngilizce başlık ve açıklamalar, ürün veya aktif varyant SKU eksiklerine göre filtrelenebilir.",
    parameters: reviewPage.shape,
    async handler(args, req) {
      const page = reviewPage.parse(args);
      if (page.after && page.before)
        throw new Error("Tek bir sayfa yönü seçin.");
      return result(await listProductContentIssues(req, page));
    },
  },
  {
    name: "findCatalogItem",
    description:
      "Tam katalog koduyla eşleşen ürünleri ve varyantları bulur. Taslakları da kapsar.",
    parameters: catalogQuery.shape,
    async handler(args, req) {
      const { sku, locale, page } = catalogQuery.parse(args);
      const { docs, totalDocs, hasNextPage } = await req.payload.find({
        ...readAccess(req),
        collection: "products",
        locale,
        page,
        limit: 20,
        draft: true,
        where: {
          or: [{ sku: { equals: sku } }, { "variants.sku": { equals: sku } }],
        },
        select: {
          title: true,
          sku: true,
          _status: true,
          variants: { sku: true, title: true, id: true },
        },
      });
      return result({
        totalDocs,
        page,
        hasNextPage,
        products: docs.map(({ variants, ...product }) => ({
          ...product,
          variants: variants?.filter((variant) => variant.sku === sku) ?? [],
        })),
      });
    },
  },
  {
    name: "reviewProductContent",
    description:
      "Bir ürünün Türkçe ve İngilizce içeriğini ayrı ayrı kontrol eder. Eksik alanları listeler.",
    parameters: productQuery.shape,
    async handler(args, req) {
      const { productId } = productQuery.parse(args);
      const access = readAccess(req);
      const reviews = [];
      // Payload updates req.locale for each Local API call.
      for (const locale of ["tr", "en"] as const) {
        const doc = await req.payload.findByID({
          ...access,
          collection: "products",
          id: productId,
          locale,
          fallbackLocale: false,
          draft: true,
          select: {
            title: true,
            slug: true,
            shortDescription: true,
            description: true,
            mainImage: true,
          },
        });
        const missingFields = (
          [
            "title",
            "slug",
            "shortDescription",
            "description",
            "mainImage",
          ] as const
        ).filter((field) =>
          typeof doc[field] === "string"
            ? !String(doc[field]).trim()
            : !doc[field],
        );
        reviews.push({ locale, title: doc.title, missingFields });
      }
      return result({ productId, reviews });
    },
  },
  {
    name: "getContentOverview",
    description:
      "Ürün, kategori, sayfa, haber ve medya kayıtlarının sayılarını gösterir.",
    parameters: {},
    async handler(_args, req) {
      const access = readAccess(req);
      const totals = await Promise.all(
        (["products", "categories", "pages", "news", "media"] as const).map(
          async (collection) => [
            collection,
            (await req.payload.count({ ...access, collection })).totalDocs,
          ],
        ),
      );
      return result(Object.fromEntries(totals));
    },
  },
  {
    name: "getInboxSummary",
    description:
      "Tekliflerin ve iletişim mesajlarının durumlara göre sayısını verir. Yönetici yetkisi gerekir.",
    parameters: {},
    async handler(_args, req) {
      if (!isAdmin(req.user))
        throw new Error(
          "Talep özetini görmek için yönetici yetkisi gerekiyor.",
        );
      const counts = async (
        collection: "inquiries" | "quote-requests",
        statuses: string[],
      ) =>
        Object.fromEntries(
          await Promise.all(
            statuses.map(async (status) => {
              const { totalDocs } = await req.payload.count({
                ...readAccess(req),
                collection,
                where: { status: { equals: status } },
              });
              return [status, totalDocs];
            }),
          ),
        );
      const [quotes, messages] = await Promise.all([
        counts("quote-requests", ["new", "reviewing", "quoted", "closed"]),
        counts("inquiries", ["unread", "pending", "resolved"]),
      ]);
      return result({ quotes, messages });
    },
  },
];
