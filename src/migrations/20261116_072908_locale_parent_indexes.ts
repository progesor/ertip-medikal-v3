import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE INDEX "products_locales_parent_id_idx" ON "products_locales" USING btree ("_parent_id");
  CREATE INDEX "_products_v_locales_parent_id_idx" ON "_products_v_locales" USING btree ("_parent_id");
  CREATE INDEX "categories_locales_parent_id_idx" ON "categories_locales" USING btree ("_parent_id");
  CREATE INDEX "news_locales_parent_id_idx" ON "news_locales" USING btree ("_parent_id");
  CREATE INDEX "_news_v_locales_parent_id_idx" ON "_news_v_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_locales_parent_id_idx" ON "pages_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_locales_parent_id_idx" ON "_pages_v_locales" USING btree ("_parent_id");
  CREATE INDEX "news_categories_locales_parent_id_idx" ON "news_categories_locales" USING btree ("_parent_id");
  CREATE INDEX "site_settings_locales_parent_id_idx" ON "site_settings_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "products_locales_parent_id_idx";
  DROP INDEX "_products_v_locales_parent_id_idx";
  DROP INDEX "categories_locales_parent_id_idx";
  DROP INDEX "news_locales_parent_id_idx";
  DROP INDEX "_news_v_locales_parent_id_idx";
  DROP INDEX "pages_locales_parent_id_idx";
  DROP INDEX "_pages_v_locales_parent_id_idx";
  DROP INDEX "news_categories_locales_parent_id_idx";
  DROP INDEX "site_settings_locales_parent_id_idx";`)
}
