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

type QuoteItemBody = {
  productTitle?: unknown;
  variantInfo?: unknown;
  sku?: unknown;
  quantity?: unknown;
};

type QuoteBody = {
  customerName?: unknown;
  company?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  items?: unknown;
  website?: unknown;
};

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
  const rawItems = Array.isArray(body.items) ? body.items : [];

  if (
    customerName.length < 2 ||
    !isValidEmail(email) ||
    phone.length < 5 ||
    rawItems.length === 0 ||
    rawItems.length > 50
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Teklif talebi geçerli müşteri ve ürün bilgileri içermelidir.",
      },
      { status: 400 },
    );
  }

  const items = rawItems.map((rawItem) => {
    const item = (rawItem ?? {}) as QuoteItemBody;
    const quantity =
      typeof item.quantity === "number" && Number.isInteger(item.quantity)
        ? item.quantity
        : Number(item.quantity);

    return {
      productTitle: normalizeText(item.productTitle, 200),
      variantInfo: normalizeText(item.variantInfo, 200),
      sku: normalizeText(item.sku, 120),
      quantity,
    };
  });

  const hasInvalidItem = items.some(
    (item) =>
      item.productTitle.length < 1 ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 999,
  );

  if (hasInvalidItem) {
    return NextResponse.json(
      { success: false, message: "Ürün listesi geçersiz." },
      { status: 400 },
    );
  }

  const payload = await getPayload({ config: configPromise });

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
        items,
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
