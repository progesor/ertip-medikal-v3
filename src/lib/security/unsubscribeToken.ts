import { createHmac, timingSafeEqual } from "node:crypto";

type UnsubscribeTokenPayload = {
  version: 1;
  subscriberId: string;
  email: string;
  expiresAt: number;
};

const TOKEN_TTL_SECONDS = 48 * 60 * 60;

function getSigningSecret() {
  const secret = process.env.UNSUBSCRIBE_SECRET || process.env.PAYLOAD_SECRET;

  if (!secret || secret === "SECRET_KEY_MISSING") {
    throw new Error("Unsubscribe signing secret is not configured.");
  }

  return secret;
}

function sign(encodedPayload: string) {
  return createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createUnsubscribeToken(input: {
  subscriberId: string;
  email: string;
}) {
  const payload: UnsubscribeTokenPayload = {
    version: 1,
    subscriberId: input.subscriberId,
    email: input.email.toLowerCase(),
    expiresAt: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyUnsubscribeToken(
  token: string,
): UnsubscribeTokenPayload | null {
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
    ) as Partial<UnsubscribeTokenPayload>;

    if (
      payload.version !== 1 ||
      typeof payload.subscriberId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload as UnsubscribeTokenPayload;
  } catch {
    return null;
  }
}
