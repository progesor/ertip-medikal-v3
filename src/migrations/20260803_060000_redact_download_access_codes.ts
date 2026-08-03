import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "download_logs"
    SET "access_code" = 'legacy-redacted'
    WHERE "access_code" IS NOT NULL
      AND "access_code" <> ''
      AND "access_code" NOT LIKE 'hmac:%';
  `)
}

export async function down({}: MigrateDownArgs): Promise<void> {
  // Intentionally irreversible: historical plaintext access codes must never be restored.
}
