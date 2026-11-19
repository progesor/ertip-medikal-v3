import type { TaskConfig } from "payload";
import type { CatalogSnapshot } from "@/types/catalog";

export const catalogPDFTask: TaskConfig<{
  input: { outputId: number };
  output: { pages: number };
}> = {
  slug: "catalogPDF",
  label: "Katalog PDF oluştur",
  inputSchema: [{ name: "outputId", type: "number", required: true }],
  outputSchema: [{ name: "pages", type: "number" }],
  retries: 0,
  handler: async ({ input, req }) => {
    const { payload } = req;
    const output = await payload.findByID({
      collection: "catalog-outputs",
      id: input.outputId,
      depth: 0,
    });
    if (output.status === "done" && output.filename)
      return { output: { pages: output.pages || 0 } };
    await payload.update({
      collection: "catalog-outputs",
      id: output.id,
      data: { status: "running", error: null },
    });
    try {
      const { generateCatalogPDF } = await import("./pdf");
      const result = await generateCatalogPDF(
        output.snapshot as unknown as CatalogSnapshot,
      );
      await payload.update({
        collection: "catalog-outputs",
        id: output.id,
        data: { status: "done", pages: result.pages, error: null },
        file: {
          data: result.data,
          name: "ertip-catalog-" + output.id + ".pdf",
          mimetype: "application/pdf",
          size: result.data.length,
        },
      });
      return { output: { pages: result.pages } };
    } catch (error) {
      payload.logger.error(
        { err: error, outputId: output.id },
        "Catalog PDF failed",
      );
      const message =
        error instanceof Error && error.message.startsWith("Sayfaya")
          ? error.message
          : "PDF oluşturulamadı. Görselleri ve PDF sunucusunu kontrol edip tekrar deneyin.";
      await payload.update({
        collection: "catalog-outputs",
        id: output.id,
        data: { status: "failed", error: message },
      });
      throw Error(message);
    }
  },
};
