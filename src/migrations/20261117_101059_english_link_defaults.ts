import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cta" ALTER COLUMN "button_link" SET DEFAULT '/contact';
  ALTER TABLE "_pages_v_blocks_cta" ALTER COLUMN "button_link" SET DEFAULT '/contact';
  ALTER TABLE "site_settings_locales" ALTER COLUMN "header_header_cta_href" SET DEFAULT '/contact';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cta" ALTER COLUMN "button_link" SET DEFAULT '/iletisim';
  ALTER TABLE "_pages_v_blocks_cta" ALTER COLUMN "button_link" SET DEFAULT '/iletisim';
  ALTER TABLE "site_settings_locales" ALTER COLUMN "header_header_cta_href" SET DEFAULT '/iletisim';`)
}
