import { getPayload } from "payload";
import configPromise from "@payload-config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config: configPromise });
  const { productId, code, docLabel } = await req.json();

  // 1. Ürünü bul
  const product = await payload.findByID({
    collection: "products",
    id: productId,
    depth: 2,
  });

  // 2. Kodu kontrol et
  const protectedDoc = product.protectedDocs?.find(
    (d: any) => d.label === docLabel,
  );
  const validCode = protectedDoc?.accessCodes?.find(
    (c: any) => c.code === code && c.isActive,
  );

  if (!validCode) {
    return NextResponse.json(
      { success: false, message: "Geçersiz veya iptal edilmiş kod." },
      { status: 403 },
    );
  }

  // 3. LOGLAMA (MDR Uyumluluğu)
  const ip = req.headers.get("x-forwarded-for") || "Bilinmiyor";
  const userAgent = req.headers.get("user-agent") || "Bilinmiyor";

  await payload.create({
    collection: "download-logs",
    data: {
      productTitle: product.title,
      documentName: docLabel,
      accessCode: code,
      ipAddress: ip,
      deviceInfo: userAgent,
      // Lokasyon servisi entegre edilirse buraya ülke eklenebilir
    },
  });

  return NextResponse.json({
    success: true,
    fileUrl:
      typeof protectedDoc?.file === "object" &&
      protectedDoc.file !== null &&
      "url" in protectedDoc.file
        ? (protectedDoc.file as any).url
        : "",
  });
}
