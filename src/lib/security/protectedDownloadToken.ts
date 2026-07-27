import { createHmac, timingSafeEqual } from "node:crypto";

type ProtectedDownloadTokenPayload = {
  version: 1;
  productId: string;
  documentId?: string;
  documentLabel: string;
  mediaId: string;
  expiresAt: number;
};

const TOKEN_TTL_SECONDS = 15 * 60;

function getSigningSecret() {
  const secret =
    process.env.PROTECTED_DOWNLOAD_SECRET || process.env.PAYLOAD_SECRET;

  if (!secret || secret === "SECRET_KEY_MISSING") {
    throw new Error("Protected download signing secret is not configured.");
  }

  return secret;
}

function sign(encodedPayload: string) {
  return createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createProtectedDownloadToken(
  payload: Omit<ProtectedDownloadTokenPayload, "version" | "expiresAt">,
) {
  const tokenPayload: ProtectedDownloadTokenPayload = {
    ...payload,
    version: 1,
    expiresAt: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString(
    "base64url",
  );

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyProtectedDownloadToken(
  token: string,
): ProtectedDownloadTokenPayload | null {
  const [encodedPayload, providedSignature, ...extraParts] = token.split(".");

  if (!encodedPayload || !providedSignature || extraParts.length > 0) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<ProtectedDownloadTokenPayload>;

    if (
      payload.version !== 1 ||
      typeof payload.productId !== "string" ||
      typeof payload.documentLabel !== "string" ||
      typeof payload.mediaId !== "string" ||
      typeof payload.expiresAt !== "number" ||
      (payload.documentId !== undefined &&
        typeof payload.documentId !== "string") ||
      payload.expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload as ProtectedDownloadTokenPayload;
  } catch {
    return null;
  }
}
