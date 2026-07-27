import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import { verifyProtectedDownloadToken } from "@/lib/security/protectedDownloadToken";
import { getRelationId } from "@/lib/security/protectedMedia";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function deniedResponse() {
  return NextResponse.json(
    { success: false, message: "İndirme bağlantısı geçersiz veya süresi dolmuş." },
    {
      status: 403,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    },
  );
}

function getContentDisposition(filename: string) {
  const asciiFilename = filename
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/["\\]/g, "_")
    .trim();
  const safeAsciiFilename = asciiFilename || "document";

  return `inline; filename="${safeAsciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token || token.length > 4096) return deniedResponse();

  let tokenPayload;

  try {
    tokenPayload = verifyProtectedDownloadToken(token);
  } catch {
    return deniedResponse();
  }

  if (!tokenPayload) return deniedResponse();

  const payload = await getPayload({ config: configPromise });

  try {
    const product = await payload.findByID({
      collection: "products",
      id: tokenPayload.productId,
      depth: 0,
      overrideAccess: true,
    });
    const protectedDocument = product.protectedDocs?.find((document) => {
      const documentIdMatches = tokenPayload.documentId
        ? String(document.id) === tokenPayload.documentId
        : true;

      return (
        documentIdMatches && document.label === tokenPayload.documentLabel
      );
    });
    const currentMediaId = getRelationId(protectedDocument?.file);

    if (
      !protectedDocument ||
      currentMediaId === null ||
      String(currentMediaId) !== tokenPayload.mediaId
    ) {
      return deniedResponse();
    }

    const media = await payload.findByID({
      collection: "media",
      id: tokenPayload.mediaId,
      depth: 0,
      overrideAccess: true,
    });

    if (!media.filename) return deniedResponse();

    const mediaDirectory = path.resolve(process.cwd(), "media");
    const filename = path.basename(media.filename);
    const filePath = path.resolve(mediaDirectory, filename);

    if (!filePath.startsWith(`${mediaDirectory}${path.sep}`)) {
      return deniedResponse();
    }

    const fileStats = await stat(filePath);

    if (!fileStats.isFile()) return deniedResponse();

    const nodeStream = createReadStream(filePath);
    const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Type": media.mimeType || "application/octet-stream",
        "Content-Length": String(fileStats.size),
        "Content-Disposition": getContentDisposition(filename),
        "Cache-Control": "private, no-store, max-age=0",
        Pragma: "no-cache",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  } catch (error) {
    payload.logger.error({ err: error }, "Protected document download failed");
    return deniedResponse();
  }
}
