import configPromise from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import {
  consumeRateLimit,
  getClientIp,
  isHoneypotFilled,
  isValidEmail,
  normalizeText,
  rateLimitResponse,
} from "@/lib/security/publicRequest";

type NewsletterBody = {
  email?: unknown;
  website?: unknown;
};

export async function POST(request: NextRequest) {
  const ipAddress = getClientIp(request.headers);
  const ipLimit = consumeRateLimit({
    bucket: "public-newsletter-ip",
    identity: ipAddress,
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });

  if (!ipLimit.allowed) {
    return rateLimitResponse(ipLimit.retryAfterSeconds);
  }

  let body: NewsletterBody;

  try {
    body = (await request.json()) as NewsletterBody;
  } catch {
    return NextResponse.json(
      { success: false, message: "Geçersiz istek." },
      { status: 400 },
    );
  }

  if (isHoneypotFilled(body.website)) {
    return NextResponse.json({ success: true }, { status: 202 });
  }

  const email = normalizeText(body.email, 254).toLowerCase();

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { success: false, message: "Geçerli bir e-posta adresi girin." },
      { status: 400 },
    );
  }

  const emailLimit = consumeRateLimit({
    bucket: "public-newsletter-email",
    identity: email,
    limit: 3,
    windowMs: 24 * 60 * 60 * 1000,
  });

  if (!emailLimit.allowed) {
    return rateLimitResponse(emailLimit.retryAfterSeconds);
  }

  const payload = await getPayload({ config: configPromise });

  try {
    const existing = await payload.find({
      collection: "subscribers",
      overrideAccess: true,
      limit: 1,
      where: {
        email: { equals: email },
      },
    });
    const subscriber = existing.docs[0];

    if (subscriber) {
      if (subscriber.status !== "active") {
        await payload.update({
          collection: "subscribers",
          id: subscriber.id,
          overrideAccess: true,
          data: {
            status: "active",
            source: "Website Newsletter",
          },
        });
      }

      return NextResponse.json({ success: true });
    }

    await payload.create({
      collection: "subscribers",
      overrideAccess: true,
      data: {
        email,
        status: "active",
        source: "Website Newsletter",
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    payload.logger.error({ err: error }, "Public newsletter subscription failed");

    return NextResponse.json(
      {
        success: false,
        message: "Abonelik işlemi şu anda tamamlanamadı. Lütfen tekrar deneyin.",
      },
      { status: 500 },
    );
  }
}
