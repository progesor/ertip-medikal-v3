import { NextResponse } from "next/server";

type RateLimitStore = Map<string, number[]>;

type RateLimitInput = {
  bucket: string;
  identity: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const MAX_RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

const globalForRateLimit = globalThis as typeof globalThis & {
  __ertipRateLimitStore?: RateLimitStore;
};

const rateLimitStore =
  globalForRateLimit.__ertipRateLimitStore ?? new Map<string, number[]>();

globalForRateLimit.__ertipRateLimitStore = rateLimitStore;

function normalizeClientIp(value: string | null | undefined) {
  const candidate = value?.trim();
  if (!candidate) return null;

  return candidate.slice(0, 100);
}

export function getClientIp(headers: Headers) {
  const cloudflareIp = normalizeClientIp(headers.get("cf-connecting-ip"));
  if (cloudflareIp) return cloudflareIp;

  const realIp = normalizeClientIp(headers.get("x-real-ip"));
  if (realIp) return realIp;

  const forwardedFor = headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  // Traefik and similar reverse proxies append the immediate client address to
  // X-Forwarded-For. Reading the right-most value avoids trusting a spoofed
  // user-supplied left-most entry in the common single-proxy deployment.
  return normalizeClientIp(forwardedFor?.at(-1)) || "unknown";
}

export function consumeRateLimit({
  bucket,
  identity,
  limit,
  windowMs,
}: RateLimitInput): RateLimitResult {
  const now = Date.now();
  const key = `${bucket}:${identity}`;
  const cutoff = now - windowMs;
  const recentAttempts = (rateLimitStore.get(key) ?? []).filter(
    (timestamp) => timestamp > cutoff,
  );

  if (recentAttempts.length >= limit) {
    const oldestAttempt = recentAttempts[0] ?? now;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldestAttempt + windowMs - now) / 1000),
    );

    rateLimitStore.set(key, recentAttempts);

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  recentAttempts.push(now);
  rateLimitStore.set(key, recentAttempts);

  if (rateLimitStore.size > 5_000) {
    const cleanupCutoff = now - MAX_RATE_LIMIT_WINDOW_MS;

    for (const [storedKey, timestamps] of rateLimitStore.entries()) {
      const activeTimestamps = timestamps.filter(
        (timestamp) => timestamp > cleanupCutoff,
      );

      if (activeTimestamps.length === 0) {
        rateLimitStore.delete(storedKey);
      } else {
        rateLimitStore.set(storedKey, activeTimestamps);
      }
    }
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - recentAttempts.length),
    retryAfterSeconds: 0,
  };
}

export function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      success: false,
      message: "Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyin.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "Cache-Control": "no-store",
      },
    },
  );
}

export function isHoneypotFilled(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

export function normalizeText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function isValidEmail(value: string) {
  return (
    value.length > 3 &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}
