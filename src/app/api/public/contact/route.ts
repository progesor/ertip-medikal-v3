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

type ContactBody = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  website?: unknown;
};

export async function POST(request: NextRequest) {
  const ipAddress = getClientIp(request.headers);
  const limit = consumeRateLimit({
    bucket: "public-contact",
    identity: ipAddress,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSeconds);
  }

  let body: ContactBody;

  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json(
      { success: false, message: "Geçersiz istek." },
      { status: 400 },
    );
  }

  if (isHoneypotFilled(body.website)) {
    return NextResponse.json({ success: true }, { status: 202 });
  }

  const name = normalizeText(body.name, 120);
  const email = normalizeText(body.email, 254).toLowerCase();
  const phone = normalizeText(body.phone, 50);
  const message = normalizeText(body.message, 5_000);

  if (name.length < 2 || !isValidEmail(email) || message.length < 5) {
    return NextResponse.json(
      {
        success: false,
        message: "Lütfen zorunlu alanları geçerli bilgilerle doldurun.",
      },
      { status: 400 },
    );
  }

  const payload = await getPayload({ config: configPromise });

  try {
    await payload.create({
      collection: "inquiries",
      overrideAccess: true,
      data: {
        name,
        email,
        phone: phone || null,
        message,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    payload.logger.error({ err: error }, "Public contact submission failed");

    return NextResponse.json(
      {
        success: false,
        message: "Talebiniz şu anda gönderilemedi. Lütfen tekrar deneyin.",
      },
      { status: 500 },
    );
  }
}
