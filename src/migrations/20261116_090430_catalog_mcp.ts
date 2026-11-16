import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload_mcp_api_keys" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL,
    "label" varchar,
    "description" varchar,
    "products_find" boolean DEFAULT false,
    "products_create" boolean DEFAULT false,
    "products_update" boolean DEFAULT false,
    "categories_find" boolean DEFAULT false,
    "categories_create" boolean DEFAULT false,
    "categories_update" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "enable_a_p_i_key" boolean,
    "api_key" varchar,
    "api_key_index" varchar
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "payload_mcp_api_keys_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "payload_mcp_api_keys_id" integer;
  ALTER TABLE "payload_mcp_api_keys" ADD CONSTRAINT "payload_mcp_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "payload_mcp_api_keys_user_idx" ON "payload_mcp_api_keys" USING btree ("user_id");
  CREATE INDEX "payload_mcp_api_keys_updated_at_idx" ON "payload_mcp_api_keys" USING btree ("updated_at");
  CREATE INDEX "payload_mcp_api_keys_created_at_idx" ON "payload_mcp_api_keys" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_mcp_api_keys_id");
  CREATE INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx" ON "payload_preferences_rels" USING btree ("payload_mcp_api_keys_id");`)
  // Correct the two published variants and the corresponding latest editable versions.
  // Match both the catalogue identity and dimensions; the other owner of "125" is correct.
  await db.execute(sql`
    WITH corrections(slug, old_sku, new_sku) AS (
      VALUES ('duz-fue-motorize-punch', '110-125', '110-1025'),
             ('xs-fue-motorize-punch', '110-125-XS', '110-1025-XS')
    )
    UPDATE products_variants v SET sku = c.new_sku
    FROM products_locales p JOIN corrections c ON c.slug = p.slug
    WHERE p._locale = 'tr' AND p._parent_id = v._parent_id
      AND v.title = '1 mm Çap - 2.5 mm Uzunluk' AND v.sku = c.old_sku;

    WITH corrections(slug, old_sku, new_sku) AS (
      VALUES ('duz-fue-motorize-punch', '110-125', '110-1025'),
             ('xs-fue-motorize-punch', '110-125-XS', '110-1025-XS')
    )
    UPDATE _products_v_version_variants v SET sku = c.new_sku
    FROM _products_v revision
    JOIN products_locales p ON p._parent_id = revision.parent_id AND p._locale = 'tr'
    JOIN corrections c ON c.slug = p.slug
    WHERE revision.latest IS TRUE AND revision.id = v._parent_id
      AND v.title = '1 mm Çap - 2.5 mm Uzunluk' AND v.sku = c.old_sku;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk";

  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk";

  DROP INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx";
  DROP INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "payload_mcp_api_keys_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "payload_mcp_api_keys_id";
  DROP TABLE "payload_mcp_api_keys";`)
}
