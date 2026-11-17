import path from "node:path";
import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { invalidateProtectedMediaCache } from "@/lib/security/protectedMedia";
import { execute } from "./engine.mjs";
import { privateDir, processStarted, saveJSON } from "./storage.mjs";
export async function scheduleBackup(
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
      const result = await execute(
        action,
        value,
        async () => {
          invalidateProtectedMediaCache();
          revalidatePath("/", "layout");
        },
        job.id,
      );
      if (action === "restore")
        await saveJSON(file, { ...job, status: "done", kind: result.kind });
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
  return { id: job.id };
}
