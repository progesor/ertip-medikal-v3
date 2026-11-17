import { getUnsubscribePath } from "@/lib/i18n/routing";
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
  locale?: unknown;
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

  const locale = body.locale === "en" ? "en" : "tr";
  const en = locale === "en";
  const genericMessage = en ? "If the address is subscribed, a confirmation link has been sent to it." : GENERIC_MESSAGE;

  if (isHoneypotFilled(body.website)) {
    return NextResponse.json(
      { success: true, message: genericMessage },
      { status: 202 },
    );
  }

  const email = normalizeText(body.email, 254).toLowerCase();

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { success: false, message: en ? "Enter a valid email address." : "Geçerli bir e-posta adresi girin." },
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
        getUnsubscribePath(locale),
        serverEnv.publicSiteUrl,
      );
      confirmationURL.searchParams.set("token", token);
      const safeURL = escapeHtml(confirmationURL.toString());

      await payload.sendEmail({
        to: email,
        subject: en ? "Confirm your Ertip Medikal newsletter cancellation" : "Ertip Medikal e-bülten aboneliği iptal onayı",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;line-height:1.6;color:#172033;">
            <h2 style="margin:0 0 16px;">${en ? "Unsubscribe request" : "Abonelikten ayrılma isteği"}</h2>
            <p>${en ? "Use the link below to unsubscribe from the Ertip Medikal newsletter." : "Ertip Medikal e-bülten aboneliğinizi iptal etmek için aşağıdaki bağlantıyı kullanın."}</p>
            <p style="margin:28px 0;">
              <a href="${safeURL}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#b42318;color:#ffffff;text-decoration:none;font-weight:700;">${en ? "Unsubscribe" : "Aboneliği İptal Et"}</a>
            </p>
            <p style="font-size:13px;color:#667085;">${en ? "This link is valid for 48 hours. If you did not make this request, you can ignore this email." : "Bu bağlantı 48 saat geçerlidir. Bu isteği siz yapmadıysanız e-postayı yok sayabilirsiniz."}</p>
          </div>
        `,
      });
    }
  } catch (error) {
    payload.logger.error({ err: error }, "Unsubscribe confirmation request failed");
  }

  return NextResponse.json(
    { success: true, message: genericMessage },
    {
      status: 202,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
