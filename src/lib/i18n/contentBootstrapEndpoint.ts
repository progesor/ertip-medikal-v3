import type { Endpoint, PayloadRequest } from "payload";
import { isAdmin } from "@/access/roles";
import {
  bootstrapCollectionEnglishLocale,
  bootstrapGlobalEnglishLocale,
  type LocaleBootstrapSpec,
} from "@/lib/i18n/localeBootstrap";

type CollectionBootstrap = LocaleBootstrapSpec & {
  slug: "products" | "categories" | "news" | "pages" | "news-categories";
};

type GlobalBootstrap = LocaleBootstrapSpec & {
  slug: "site-settings" | "main-menu";
};

const collectionBootstraps: CollectionBootstrap[] = [
  {
    slug: "products",
    fields: ["title", "shortDescription", "description", "specs", "meta", "slug"],
    stripNestedIds: ["specs"],
  },
  {
    slug: "categories",
    fields: ["title", "description", "slug"],
  },
  {
    slug: "news",
    fields: ["title", "excerpt", "content", "meta", "slug"],
  },
  {
    slug: "pages",
    fields: ["title", "layout", "meta", "slug"],
    stripNestedIds: ["layout"],
  },
  {
    slug: "news-categories",
    fields: ["title", "slug"],
  },
];

const globalBootstraps: GlobalBootstrap[] = [
  {
    slug: "site-settings",
    fields: ["header", "floatingAction", "footer"],
    stripNestedIds: ["header", "floatingAction", "footer"],
  },
  {
    slug: "main-menu",
    fields: ["items"],
    stripNestedIds: ["items"],
  },
];

type BootstrapSummary = {
  scanned: number;
  updated: number;
  unchanged: number;
  errors: Array<{ scope: string; id?: number | string; message: string }>;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Bilinmeyen hata";
}

async function runEnglishContentBootstrap(req: PayloadRequest) {
  const summary: BootstrapSummary = {
    scanned: 0,
    updated: 0,
    unchanged: 0,
    errors: [],
  };

  for (const bootstrap of collectionBootstraps) {
    const result = await req.payload.find({
      collection: bootstrap.slug,
      locale: "tr",
      fallbackLocale: false,
      pagination: false,
      depth: 0,
      draft: true,
      overrideAccess: true,
      req,
    });

    for (const rawDoc of result.docs) {
      const doc = rawDoc as Record<string, unknown> & { id: number | string };
      summary.scanned += 1;

      try {
        const changed = await bootstrapCollectionEnglishLocale({
          req,
          collection: bootstrap.slug,
          id: doc.id,
          spec: bootstrap,
          sourceDoc: doc,
        });

        if (changed) summary.updated += 1;
        else summary.unchanged += 1;
      } catch (error) {
        summary.errors.push({
          scope: bootstrap.slug,
          id: doc.id,
          message: errorMessage(error),
        });
      }
    }
  }

  for (const bootstrap of globalBootstraps) {
    summary.scanned += 1;

    try {
      const changed = await bootstrapGlobalEnglishLocale({
        req,
        slug: bootstrap.slug,
        spec: bootstrap,
      });

      if (changed) summary.updated += 1;
      else summary.unchanged += 1;
    } catch (error) {
      summary.errors.push({
        scope: bootstrap.slug,
        message: errorMessage(error),
      });
    }
  }

  return summary;
}

const bootstrapEnglishContentEndpoint: Endpoint = {
  path: "/i18n/bootstrap-english",
  method: "post",
  handler: async (req) => {
    if (!isAdmin(req.user)) {
      return Response.json(
        { message: "Bu işlem yalnızca yönetici kullanıcılar tarafından yapılabilir." },
        { status: 403 },
      );
    }

    const summary = await runEnglishContentBootstrap(req);
    const success = summary.errors.length === 0;

    req.payload.logger.info({
      msg: "English locale bootstrap completed from Turkish content.",
      ...summary,
      userId: req.user?.id,
    });

    return Response.json(
      {
        success,
        ...summary,
        message: success
          ? `${summary.updated} kayıt için eksik İngilizce içerik Türkçeden dolduruldu. ${summary.unchanged} kayıt zaten hazırdı.`
          : `${summary.updated} kayıt güncellendi, ${summary.errors.length} hata oluştu.`,
      },
      { status: success ? 200 : 207 },
    );
  },
};

export const i18nContentEndpoints: Endpoint[] = [bootstrapEnglishContentEndpoint];
