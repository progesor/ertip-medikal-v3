import configPromise from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import {
  resolveQuoteItems,
  type QuoteProductRecord,
} from "@/lib/quote/resolveQuoteItems";
import {
  consumeRateLimit,
  getClientIp,
  isHoneypotFilled,
  isValidEmail,
  normalizeText,
  rateLimitResponse,
} from "@/lib/security/publicRequest";

type QuoteBody = {
  customerName?: unknown;
  company?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  items?: unknown;
  website?: unknown;
};

function payloadProductId(productId: string): string | number {
  return /^\d+$/.test(productId) ? Number(productId) : productId;
}

export async function POST(request: NextRequest) {
  const ipAddress = getClientIp(request.headers);
  const limit = consumeRateLimit({
    bucket: "public-quote-request",
    identity: ipAddress,
    limit: 4,
    windowMs: 15 * 60 * 1000,
  });

  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSeconds);
  }

  let body: QuoteBody;

  try {
    body = (await request.json()) as QuoteBody;
  } catch {
    return NextResponse.json(
      { success: false, message: "Geçersiz istek." },
      { status: 400 },
    );
  }

  if (isHoneypotFilled(body.website)) {
    return NextResponse.json({ success: true }, { status: 202 });
  }

  const customerName = normalizeText(body.customerName, 120);
  const company = normalizeText(body.company, 160);
  const email = normalizeText(body.email, 254).toLowerCase();
  const phone = normalizeText(body.phone, 50);
  const message = normalizeText(body.message, 5_000);

  if (
    customerName.length < 2 ||
    !isValidEmail(email) ||
    phone.length < 5
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Teklif talebi geçerli müşteri bilgileri içermelidir.",
      },
      { status: 400 },
    );
  }

  const payload = await getPayload({ config: configPromise });
  const resolvedItems = await resolveQuoteItems(body.items, async (productId) => {
    try {
      const product = await payload.findByID({
        collection: "products",
        id: payloadProductId(productId),
        depth: 0,
        draft: false,
        overrideAccess: true,
      });

      return product as unknown as QuoteProductRecord;
    } catch {
      return null;
    }
  });

  if (!resolvedItems.ok) {
    return NextResponse.json(
      { success: false, message: resolvedItems.message },
      { status: 400 },
    );
  }

  try {
    await payload.create({
      collection: "quote-requests",
      overrideAccess: true,
      data: {
        customerName,
        company: company || null,
        email,
        phone,
        message: message || null,
        items: resolvedItems.items,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    payload.logger.error({ err: error }, "Public quote submission failed");

    return NextResponse.json(
      {
        success: false,
        message: "Teklif talebiniz şu anda gönderilemedi. Lütfen tekrar deneyin.",
      },
      { status: 500 },
    );
  }
}
