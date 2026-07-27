import { createHash, timingSafeEqual } from "node:crypto";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import { createProtectedDownloadToken } from "@/lib/security/protectedDownloadToken";
import { getRelationId } from "@/lib/security/protectedMedia";

type VerifyManualBody = {
  productId?: unknown;
  code?: unknown;
  docLabel?: unknown;
};

function secureCodeEquals(storedCode: string, suppliedCode: string) {
  const storedDigest = createHash("sha256").update(storedCode).digest();
  const suppliedDigest = createHash("sha256").update(suppliedCode).digest();

  return timingSafeEqual(storedDigest, suppliedDigest);
}

function maskAccessCode(code: string) {
  if (code.length <= 2) return "**";
  if (code.length <= 4) return `${code.slice(0, 1)}***${code.slice(-1)}`;

  return `${code.slice(0, 2)}***${code.slice(-2)}`;
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0];

  return (
    forwardedFor?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "Bilinmiyor"
  ).slice(0, 100);
}

function invalidCodeResponse() {
  return NextResponse.json(
    { success: false, message: "Geçersiz veya iptal edilmiş kod." },
    { status: 403 },
  );
}

export async function POST(request: NextRequest) {
  let body: VerifyManualBody;

  try {
    body = (await request.json()) as VerifyManualBody;
  } catch {
    return NextResponse.json(
      { success: false, message: "Geçersiz istek." },
      { status: 400 },
    );
  }

  const productId =
    typeof body.productId === "string" || typeof body.productId === "number"
      ? body.productId
      : null;
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const documentLabel =
    typeof body.docLabel === "string" ? body.docLabel.trim() : "";

  if (
    productId === null ||
    !code ||
    code.length > 128 ||
    !documentLabel ||
    documentLabel.length > 200
  ) {
    return NextResponse.json(
      { success: false, message: "Geçersiz istek." },
      { status: 400 },
    );
  }

  const payload = await getPayload({ config: configPromise });

  try {
    const product = await payload.findByID({
      collection: "products",
      id: productId,
      depth: 2,
      overrideAccess: true,
    });
    const protectedDocument = product.protectedDocs?.find(
      (document) => document.label === documentLabel,
    );
    const validCode = protectedDocument?.accessCodes?.find(
      (accessCode) =>
        accessCode.isActive !== false &&
        typeof accessCode.code === "string" &&
        secureCodeEquals(accessCode.code, code),
    );
    const mediaId = getRelationId(protectedDocument?.file);

    if (!protectedDocument || !validCode || mediaId === null) {
      return invalidCodeResponse();
    }

    const token = createProtectedDownloadToken({
      productId: String(product.id),
      documentId: protectedDocument.id
        ? String(protectedDocument.id)
        : undefined,
      documentLabel: protectedDocument.label,
      mediaId: String(mediaId),
    });

    await payload.create({
      collection: "download-logs",
      overrideAccess: true,
      data: {
        productTitle: product.title,
        documentName: protectedDocument.label,
        accessCode: maskAccessCode(code),
        ipAddress: getClientIp(request),
        deviceInfo: (request.headers.get("user-agent") || "Bilinmiyor").slice(
          0,
          500,
        ),
      },
    });

    return NextResponse.json({
      success: true,
      fileUrl: `/api/protected-download?token=${encodeURIComponent(token)}`,
    });
  } catch (error) {
    payload.logger.error({ err: error }, "Protected document verification failed");

    return NextResponse.json(
      {
        success: false,
        message: "Doğrulama işlemi tamamlanamadı. Lütfen tekrar deneyin.",
      },
      { status: 500 },
    );
  }
}
