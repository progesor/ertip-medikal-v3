import { Pool } from "pg";
import type { SiteLocale } from "@/lib/i18n/config";
import { serverEnv } from "@/lib/config/env";
import {
  normalizeUiTextOverrides,
  type UiTextOverrides,
} from "@/lib/i18n/uiTextOverrides";

const TABLE_NAME = "ertip_ui_text_overrides";

type GlobalWithUiTextPool = typeof globalThis & {
  __ertipUiTextPool?: Pool;
};

const globalWithPool = globalThis as GlobalWithUiTextPool;
const pool =
  globalWithPool.__ertipUiTextPool ||
  new Pool({
    connectionString: serverEnv.databaseUri,
    max: 2,
    idleTimeoutMillis: 30_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalWithPool.__ertipUiTextPool = pool;
}

function isMissingTableError(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: unknown }).code === "42P01",
  );
}

export async function readUiTextOverrides(
  locale: SiteLocale,
): Promise<UiTextOverrides> {
  try {
    const result = await pool.query<{ data: unknown }>(
      `SELECT data FROM ${TABLE_NAME} WHERE locale = $1 LIMIT 1`,
      [locale],
    );

    return normalizeUiTextOverrides(result.rows[0]?.data);
  } catch (error) {
    // Local development may start before the optional M10.4 migration is
    // applied. Reads must safely fall back to the typed dictionaries.
    if (isMissingTableError(error)) return {};
    throw error;
  }
}

export async function writeUiTextOverrides({
  locale,
  data,
  userId,
}: {
  locale: SiteLocale;
  data: unknown;
  userId?: string | number | null;
}): Promise<UiTextOverrides> {
  const normalized = normalizeUiTextOverrides(data);

  await pool.query(
    `
      INSERT INTO ${TABLE_NAME} (locale, data, updated_at, updated_by)
      VALUES ($1, $2::jsonb, NOW(), $3)
      ON CONFLICT (locale)
      DO UPDATE SET
        data = EXCLUDED.data,
        updated_at = NOW(),
        updated_by = EXCLUDED.updated_by
    `,
    [locale, JSON.stringify(normalized), userId == null ? null : String(userId)],
  );

  return normalized;
}
