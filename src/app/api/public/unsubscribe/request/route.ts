import configPromise from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/config/env";
import { escapeHtml } from "@/lib/security/html";
import {
  consumeRateLimit,
  getClientIp,
  isHoneypotFilled,
  isValidEmail,
  normalizeText,
  rateLimitResponse,
} from "@/lib/security/publicRequest";
import { createUnsubscribeToken } from "@/lib/security/unsubscribeToken";

type UnsubscribeRequestBody = {
  email?: unknown;
  website?: unknown;
};

const GENERIC_MESSAGE =
  "Adres abonelik listemizde bulunuyorsa doğrulama bağlantısı e-posta adresinize gönderildi.";

export async function POST(request: NextRequest) {
  const ipAddress = getClientIp(request.headers);
  const ipLimit = consumeRateLimit({
    bucket: "public-unsubscribe-request-ip",
    identity: ipAddress,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });

  if (!ipLimit.allowed) {
    return rateLimitResponse(ipLimit.retryAfterSeconds);
  }

  let body: UnsubscribeRequestBody;

  try {
    body = (await request.json()) as UnsubscribeRequestBody;
  } catch {
    return NextResponse.json(
      { success: false, message: "Geçersiz istek." },
      { status: 400 },
    );
  }

  if (isHoneypotFilled(body.website)) {
    return NextResponse.json(
      { success: true, message: GENERIC_MESSAGE },
      { status: 202 },
    );
  }

  const email = normalizeText(body.email, 254).toLowerCase();

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { success: false, message: "Geçerli bir e-posta adresi girin." },
      { status: 400 },
    );
  }

  const emailLimit = consumeRateLimit({
    bucket: "public-unsubscribe-request-email",
    identity: email,
    limit: 3,
    windowMs: 24 * 60 * 60 * 1000,
  });

  if (!emailLimit.allowed) {
    return rateLimitResponse(emailLimit.retryAfterSeconds);
  }

  const payload = await getPayload({ config: configPromise });

  try {
    const result = await payload.find({
      collection: "subscribers",
      overrideAccess: true,
      limit: 1,
      where: {
        email: { equals: email },
      },
    });
    const subscriber = result.docs[0];

    if (subscriber?.status === "active") {
      const token = createUnsubscribeToken({
        subscriberId: String(subscriber.id),
        email,
      });
      const confirmationURL = new URL(
        "/abonelikten-ayril",
        serverEnv.publicSiteUrl,
      );
      confirmationURL.searchParams.set("token", token);
      const safeURL = escapeHtml(confirmationURL.toString());

      await payload.sendEmail({
        to: email,
        subject: "Ertip Medikal e-bülten aboneliği iptal onayı",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;line-height:1.6;color:#172033;">
            <h2 style="margin:0 0 16px;">Abonelikten ayrılma isteği</h2>
            <p>Ertip Medikal e-bülten aboneliğinizi iptal etmek için aşağıdaki bağlantıyı kullanın.</p>
            <p style="margin:28px 0;">
              <a href="${safeURL}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#b42318;color:#ffffff;text-decoration:none;font-weight:700;">Aboneliği İptal Et</a>
            </p>
            <p style="font-size:13px;color:#667085;">Bu bağlantı 48 saat geçerlidir. Bu isteği siz yapmadıysanız e-postayı yok sayabilirsiniz.</p>
          </div>
        `,
      });
    }
  } catch (error) {
    payload.logger.error({ err: error }, "Unsubscribe confirmation request failed");
  }

  return NextResponse.json(
    { success: true, message: GENERIC_MESSAGE },
    {
      status: 202,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
