const PLACEHOLDER_VALUES = new Set([
  "SECRET_KEY_MISSING",
  "change-me",
  "changeme",
  "your-secret-here",
  "replace-me",
]);

function readRequired(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function validateSecret(value: string) {
  if (value.length < 32 || PLACEHOLDER_VALUES.has(value.toLowerCase())) {
    throw new Error(
      "PAYLOAD_SECRET must be a non-placeholder value with at least 32 characters.",
    );
  }

  return value;
}

function validateDatabaseUri(value: string) {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error("DATABASE_URI must be a valid PostgreSQL connection URL.");
  }

  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("DATABASE_URI must use the postgres or postgresql protocol.");
  }

  return value;
}

function validatePublicUrl(value: string) {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Public site URL must be a valid absolute URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Public site URL must use http or https.");
  }

  return parsed.origin;
}

function parsePort(value: string) {
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("SMTP_PORT must be an integer between 1 and 65535.");
  }

  return port;
}

function validateEmail(value: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error("SMTP_FROM_ADDRESS must be a valid email address.");
  }

  return value;
}

const isProduction = process.env.NODE_ENV === "production";
const smtpHost = process.env.SMTP_HOST?.trim();
const smtpPort = process.env.SMTP_PORT?.trim();
const smtpUser = process.env.SMTP_USER?.trim();
const smtpPass = process.env.SMTP_PASS?.trim();
const smtpFromName = process.env.SMTP_FROM_NAME?.trim();
const smtpFromAddress = process.env.SMTP_FROM_ADDRESS?.trim();
const configuredPublicUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  process.env.NEXT_PUBLIC_SERVER_URL?.trim();

if (Boolean(smtpUser) !== Boolean(smtpPass)) {
  throw new Error("SMTP_USER and SMTP_PASS must be configured together.");
}

if (
  isProduction &&
  (!smtpHost || !smtpPort || !smtpFromName || !smtpFromAddress)
) {
  throw new Error(
    "SMTP_HOST, SMTP_PORT, SMTP_FROM_NAME and SMTP_FROM_ADDRESS are required in production.",
  );
}

if (isProduction && !configuredPublicUrl) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_SERVER_URL is required in production.",
  );
}

export const serverEnv = Object.freeze({
  databaseUri: validateDatabaseUri(readRequired("DATABASE_URI")),
  payloadSecret: validateSecret(readRequired("PAYLOAD_SECRET")),
  publicSiteUrl: validatePublicUrl(
    configuredPublicUrl || "http://localhost:3000",
  ),
  smtp: {
    host: smtpHost || "127.0.0.1",
    port: parsePort(smtpPort || "1025"),
    user: smtpUser,
    pass: smtpPass,
    fromName: smtpFromName || "Ertip Medikal",
    fromAddress: validateEmail(
      smtpFromAddress || "iletisim@ertip.com.tr",
    ),
  },
});
