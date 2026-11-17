import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "site_settings_locales" ADD COLUMN "contact_address" varchar;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  INSERT INTO media_locales (_parent_id, _locale, alt, caption)
    SELECT m.id, locale, m.alt, m.caption FROM media m CROSS JOIN unnest(enum_range(NULL::_locales)) locale;
  INSERT INTO site_settings_locales (_parent_id, _locale, contact_address)
    SELECT s.id, locale, s.contact_address FROM site_settings s CROSS JOIN unnest(enum_range(NULL::_locales)) locale
    ON CONFLICT (_locale, _parent_id) DO UPDATE SET contact_address = EXCLUDED.contact_address;
  ALTER TABLE "media" DROP COLUMN "alt";
  ALTER TABLE "media" DROP COLUMN "caption";
  ALTER TABLE "site_settings" DROP COLUMN "contact_address";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE media ADD COLUMN alt varchar, ADD COLUMN caption varchar;
  UPDATE media m SET alt = best.alt, caption = best.caption FROM (
    SELECT DISTINCT ON (_parent_id) _parent_id, alt, caption FROM media_locales
    ORDER BY _parent_id, (_locale = 'tr') DESC
  ) best WHERE m.id = best._parent_id;
  UPDATE media SET alt = COALESCE(filename, '') WHERE alt IS NULL;
  ALTER TABLE media ALTER COLUMN alt SET NOT NULL;
  ALTER TABLE site_settings ADD COLUMN contact_address varchar;
  UPDATE site_settings s SET contact_address = l.contact_address FROM site_settings_locales l
    WHERE l._parent_id = s.id AND l._locale = 'tr';
  ALTER TABLE site_settings_locales DROP COLUMN contact_address;
  DROP TABLE media_locales;`)
}
