import configPromise from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import {
  consumeRateLimit,
  getClientIp,
  normalizeText,
  rateLimitResponse,
} from "@/lib/security/publicRequest";
import { verifyUnsubscribeToken } from "@/lib/security/unsubscribeToken";

type ConfirmBody = {
  token?: unknown;
};

export async function POST(request: NextRequest) {
  const ipAddress = getClientIp(request.headers);
  const limit = consumeRateLimit({
    bucket: "public-unsubscribe-confirm-ip",
    identity: ipAddress,
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });

  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSeconds);
  }

  let body: ConfirmBody;

  try {
    body = (await request.json()) as ConfirmBody;
  } catch {
    return NextResponse.json(
      { success: false, message: "Geçersiz istek." },
      { status: 400 },
    );
  }

  const token = normalizeText(body.token, 4_096);
  const tokenPayload = token ? verifyUnsubscribeToken(token) : null;

  if (!tokenPayload) {
    return NextResponse.json(
      {
        success: false,
        message: "Bağlantı geçersiz veya süresi dolmuş. Yeni bir iptal bağlantısı isteyin.",
      },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  const payload = await getPayload({ config: configPromise });

  try {
    const subscriber = await payload.findByID({
      collection: "subscribers",
      id: tokenPayload.subscriberId,
      overrideAccess: true,
    });

    if (subscriber.email.toLowerCase() !== tokenPayload.email.toLowerCase()) {
      throw new Error("Unsubscribe token subscriber mismatch.");
    }

    if (subscriber.status !== "unsubscribed") {
      await payload.update({
        collection: "subscribers",
        id: subscriber.id,
        overrideAccess: true,
        data: {
          status: "unsubscribed",
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "E-bülten aboneliğiniz iptal edildi. Artık tanıtım e-postaları almayacaksınız.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    payload.logger.error({ err: error }, "Unsubscribe confirmation failed");

    return NextResponse.json(
      {
        success: false,
        message: "İşlem tamamlanamadı. Yeni bir iptal bağlantısı isteyin.",
      },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
