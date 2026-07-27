import { createHash, timingSafeEqual } from "node:crypto";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import { createProtectedDownloadToken } from "@/lib/security/protectedDownloadToken";
import { getRelationId } from "@/lib/security/protectedMedia";
import {
  consumeRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/security/publicRequest";

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

function invalidCodeResponse() {
  return NextResponse.json(
    { success: false, message: "Geçersiz veya iptal edilmiş kod." },
    { status: 403, headers: { "Cache-Control": "no-store" } },
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

  const ipAddress = getClientIp(request.headers);
  const generalLimit = consumeRateLimit({
    bucket: "manual-verification-ip",
    identity: ipAddress,
    limit: 20,
    windowMs: 15 * 60 * 1000,
  });

  if (!generalLimit.allowed) {
    return rateLimitResponse(generalLimit.retryAfterSeconds);
  }

  const targetLimit = consumeRateLimit({
    bucket: "manual-verification-target",
    identity: `${ipAddress}:${String(productId)}:${documentLabel.toLowerCase()}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });

  if (!targetLimit.allowed) {
    return rateLimitResponse(targetLimit.retryAfterSeconds);
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
        accessCode: code,
        ipAddress,
        deviceInfo: (request.headers.get("user-agent") || "Bilinmiyor").slice(
          0,
          500,
        ),
      },
    });

    return NextResponse.json(
      {
        success: true,
        fileUrl: `/api/protected-download?token=${encodeURIComponent(token)}`,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
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
