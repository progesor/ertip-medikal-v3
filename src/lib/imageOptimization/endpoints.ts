import type { Endpoint } from "payload";
import { isAdmin } from "@/access/roles";
import { SUPPORTED_IMAGE_MIME_TYPES } from "@/lib/imageOptimization/config";
import {
  loadImageOptimizationSettings,
  optimizeMediaDocument,
  removeInactiveOptimizationVersions,
} from "@/lib/imageOptimization/server";

type OptimizationRunBody = {
  page?: number;
  batchSize?: number;
  force?: boolean;
  runId?: string;
  expectedFingerprint?: string;
};

type OptimizationStatusDocument = {
  optimizationRunId?: string | null;
  optimizationStatus?: string | null;
  activeFingerprint?: string | null;
  settingsFingerprint?: string | null;
  processedCount?: number | null;
  skippedCount?: number | null;
  errorCount?: number | null;
  totalCount?: number | null;
  lastOptimizedAt?: string | null;
  lastMessage?: string | null;
};

function unauthorizedResponse() {
  return Response.json(
    { message: "Bu işlem yalnızca yönetici kullanıcılar tarafından yapılabilir." },
    { status: 403 },
  );
}

function asBoundedInteger(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) return fallback;

  return Math.min(maximum, Math.max(minimum, Math.round(parsed)));
}

const statusEndpoint: Endpoint = {
  path: "/media-optimization/status",
  method: "get",
  handler: async (req) => {
    if (!isAdmin(req.user)) return unauthorizedResponse();

    const { document, settings, currentFingerprint } =
      await loadImageOptimizationSettings(req.payload);
    const status = document as OptimizationStatusDocument;

    return Response.json({
      enabled: settings.enabled,
      format: settings.format,
      profiles: settings.profiles,
      currentFingerprint,
      activeFingerprint: status.activeFingerprint || null,
      status: status.optimizationStatus || "idle",
      runId: status.optimizationRunId || null,
      processedCount: status.processedCount || 0,
      skippedCount: status.skippedCount || 0,
      errorCount: status.errorCount || 0,
      totalCount: status.totalCount || 0,
      lastOptimizedAt: status.lastOptimizedAt || null,
      message: status.lastMessage || null,
    });
  },
};

const runEndpoint: Endpoint = {
  path: "/media-optimization/run",
  method: "post",
  handler: async (req) => {
    if (!isAdmin(req.user)) return unauthorizedResponse();

    const body = (
      typeof req.json === "function"
        ? await req.json().catch(() => ({}))
        : {}
    ) as OptimizationRunBody;
    const page = asBoundedInteger(body.page, 1, 1, 100_000);
    const batchSize = asBoundedInteger(body.batchSize, 5, 1, 20);
    const runId = String(body.runId || "").trim();

    if (!runId || runId.length > 100) {
      return Response.json(
        { message: "Geçerli bir optimizasyon çalışma kimliği gerekli." },
        { status: 400 },
      );
    }

    const { document, settings, currentFingerprint } =
      await loadImageOptimizationSettings(req.payload);
    const statusDocument = document as OptimizationStatusDocument;

    if (
      body.expectedFingerprint &&
      body.expectedFingerprint !== currentFingerprint
    ) {
      return Response.json(
        {
          message:
            "Görsel ayarları işlem sırasında değişti. Ayarları kaydedip optimizasyonu yeniden başlatın.",
          currentFingerprint,
        },
        { status: 409 },
      );
    }

    if (
      page > 1 &&
      statusDocument.optimizationRunId &&
      statusDocument.optimizationRunId !== runId
    ) {
      return Response.json(
        {
          message:
            "Başka bir optimizasyon çalışması başlatılmış. Sayfayı yenileyip mevcut durumu kontrol edin.",
        },
        { status: 409 },
      );
    }

    const baseProcessed = page === 1 ? 0 : statusDocument.processedCount || 0;
    const baseSkipped = page === 1 ? 0 : statusDocument.skippedCount || 0;
    const baseErrors = page === 1 ? 0 : statusDocument.errorCount || 0;

    if (page === 1) {
      await req.payload.updateGlobal({
        slug: "imageOptimization",
        overrideAccess: true,
        data: {
          optimizationRunId: runId,
          optimizationStatus: "running",
          processedCount: 0,
          skippedCount: 0,
          errorCount: 0,
          totalCount: 0,
          lastMessage:
            "Görseller işleniyor. Bu sayfayı açık tutmanız önerilir.",
        },
      });
    }

    const result = await req.payload.find({
      collection: "media",
      overrideAccess: true,
      depth: 0,
      page,
      limit: batchSize,
      sort: "id",
      where: {
        mimeType: {
          in: [...SUPPORTED_IMAGE_MIME_TYPES],
        },
      },
    });

    let processedInBatch = 0;
    let skippedInBatch = 0;
    let errorsInBatch = 0;
    const errors: Array<{ id: number | string; message: string }> = [];

    for (const media of result.docs) {
      const optimization = await optimizeMediaDocument({
        media,
        settings,
        fingerprint: currentFingerprint,
        force: body.force !== false,
      });

      if (optimization.error) {
        errorsInBatch += 1;
        errors.push({ id: media.id, message: optimization.error });
      } else if (optimization.generated === 0) {
        skippedInBatch += 1;
      } else {
        processedInBatch += 1;
      }
    }

    const processedCount = baseProcessed + processedInBatch;
    const skippedCount = baseSkipped + skippedInBatch;
    const errorCount = baseErrors + errorsInBatch;
    const finished = !result.hasNextPage;
    const finalStatus = errorCount > 0 ? "partial" : "ready";
    const finalMessage =
      errorCount > 0
        ? `${processedCount} medya işlendi, ${skippedCount} medya atlandı, ${errorCount} medya hata verdi.`
        : `${processedCount} medya başarıyla optimize edildi. ${skippedCount} medya değişmeden bırakıldı.`;

    await req.payload.updateGlobal({
      slug: "imageOptimization",
      overrideAccess: true,
      data: {
        optimizationRunId: finished ? null : runId,
        optimizationStatus: finished ? finalStatus : "running",
        activeFingerprint: finished
          ? currentFingerprint
          : statusDocument.activeFingerprint || null,
        processedCount,
        skippedCount,
        errorCount,
        totalCount: result.totalDocs,
        lastOptimizedAt: finished ? new Date().toISOString() : undefined,
        lastMessage: finished
          ? finalMessage
          : `${processedCount + skippedCount + errorCount} / ${result.totalDocs} medya kontrol edildi.`,
      },
    });

    if (finished) {
      await removeInactiveOptimizationVersions(currentFingerprint).catch(
        (error) => {
          req.payload.logger.warn({
            err: error,
            msg: "Eski görsel optimizasyon klasörleri temizlenemedi.",
          });
        },
      );
    }

    return Response.json({
      success: true,
      runId,
      currentFingerprint,
      page: result.page,
      nextPage: result.nextPage,
      hasNextPage: result.hasNextPage,
      totalDocs: result.totalDocs,
      processedCount,
      skippedCount,
      errorCount,
      errors,
      finished,
      status: finished ? finalStatus : "running",
      message: finished ? finalMessage : null,
    });
  },
};

export const imageOptimizationEndpoints: Endpoint[] = [
  statusEndpoint,
  runEndpoint,
];
