import type { Payload } from "payload";
import { rm } from "node:fs/promises";
import { isAdmin } from "@/access/roles";
import type { ProductExportJob } from "@/types/productExport";
import { collectExportData } from "./source";
import { writeProductArchive } from "./archive";
import { exportPath, finishArchive, releaseJob, saveJob } from "./storage";

export async function runProductExport(
  payload: Payload,
  job: ProductExportJob,
  userId: number,
) {
  try {
    const user = await payload.findByID({
      collection: "users",
      id: userId,
      depth: 0,
    });
    if (!isAdmin(user)) throw Error("Yönetici yetkisi bulunamadı.");
    const data = await collectExportData(payload, job.options);
    job.productCount = data.products.length;
    job.phase = "Dosyalar paketleniyor";
    await saveJob(job);
    const result = await writeProductArchive(
      await exportPath(job.id, "partial"),
      data,
      job.options,
      async (done, total) => {
        job.processedFiles = done;
        job.fileCount = total;
        job.phase =
          done === total
            ? "Tablolar ve AI metinleri hazırlanıyor"
            : "Görseller ve belgeler ekleniyor";
        await saveJob(job);
      },
    );
    await finishArchive(job.id);
    Object.assign(job, result, { status: "done", phase: "İndirmeye hazır" });
    await saveJob(job);
  } catch (error) {
    payload.logger.error(
      { err: error, exportId: job.id },
      "Product export failed",
    );
    job.status = "failed";
    job.error =
      error instanceof Error &&
      /^(Bu seçim|Paket |Tek aktarım|Yönetici)/.test(error.message)
        ? error.message
        : "Aktarım tamamlanamadı. Sunucu günlüklerini ve dosyaları kontrol edip yeniden deneyin.";
    await saveJob(job);
    await rm(await exportPath(job.id, "partial"), { force: true });
  } finally {
    await releaseJob(job.id);
  }
}
