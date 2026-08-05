import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "ertip_ui_text_overrides" (
      "locale" varchar(2) PRIMARY KEY NOT NULL,
      "data" jsonb NOT NULL DEFAULT '{}'::jsonb,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "updated_by" varchar,
      CONSTRAINT "ertip_ui_text_overrides_locale_check" CHECK ("locale" IN ('tr', 'en'))
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "ertip_ui_text_overrides";
  `)
}
