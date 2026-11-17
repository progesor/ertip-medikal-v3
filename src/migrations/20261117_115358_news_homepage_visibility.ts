import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "news" ADD COLUMN "hide_from_homepage" boolean DEFAULT false;
  ALTER TABLE "_news_v" ADD COLUMN "version_hide_from_homepage" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "news" DROP COLUMN "hide_from_homepage";
  ALTER TABLE "_news_v" DROP COLUMN "version_hide_from_homepage";`)
}
