import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_products_sku_rule_profile" AS ENUM('legacy-punch', 'template', 'manual');
    CREATE TYPE "public"."enum_products_sku_value_normalization" AS ENUM('none', 'compact', 'uppercase-compact', 'slug');
    CREATE TYPE "public"."enum__products_v_version_sku_rule_profile" AS ENUM('legacy-punch', 'template', 'manual');
    CREATE TYPE "public"."enum__products_v_version_sku_value_normalization" AS ENUM('none', 'compact', 'uppercase-compact', 'slug');

    ALTER TABLE "products"
      ADD COLUMN "sku_rule_profile" "enum_products_sku_rule_profile" DEFAULT 'legacy-punch' NOT NULL,
      ADD COLUMN "sku_template" varchar DEFAULT '{prefix}{values}{suffix}' NOT NULL,
      ADD COLUMN "sku_value_separator" varchar DEFAULT '-' NOT NULL,
      ADD COLUMN "sku_value_normalization" "enum_products_sku_value_normalization" DEFAULT 'compact' NOT NULL,
      ADD COLUMN "max_variant_combinations" numeric DEFAULT 500 NOT NULL;

    ALTER TABLE "products_variants"
      ADD COLUMN "combination_key" varchar;

    ALTER TABLE "_products_v"
      ADD COLUMN "version_sku_rule_profile" "enum__products_v_version_sku_rule_profile" DEFAULT 'legacy-punch' NOT NULL,
      ADD COLUMN "version_sku_template" varchar DEFAULT '{prefix}{values}{suffix}' NOT NULL,
      ADD COLUMN "version_sku_value_separator" varchar DEFAULT '-' NOT NULL,
      ADD COLUMN "version_sku_value_normalization" "enum__products_v_version_sku_value_normalization" DEFAULT 'compact' NOT NULL,
      ADD COLUMN "version_max_variant_combinations" numeric DEFAULT 500 NOT NULL;

    ALTER TABLE "_products_v_version_variants"
      ADD COLUMN "combination_key" varchar;

    CREATE INDEX "products_variants_combination_key_idx"
      ON "products_variants" USING btree ("_parent_id", "combination_key");
    CREATE INDEX "products_version_variants_combination_key_idx"
      ON "_products_v_version_variants" USING btree ("_parent_id", "combination_key");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "products_version_variants_combination_key_idx";
    DROP INDEX "products_variants_combination_key_idx";

    ALTER TABLE "_products_v_version_variants"
      DROP COLUMN "combination_key";

    ALTER TABLE "_products_v"
      DROP COLUMN "version_sku_rule_profile",
      DROP COLUMN "version_sku_template",
      DROP COLUMN "version_sku_value_separator",
      DROP COLUMN "version_sku_value_normalization",
      DROP COLUMN "version_max_variant_combinations";

    ALTER TABLE "products_variants"
      DROP COLUMN "combination_key";

    ALTER TABLE "products"
      DROP COLUMN "sku_rule_profile",
      DROP COLUMN "sku_template",
      DROP COLUMN "sku_value_separator",
      DROP COLUMN "sku_value_normalization",
      DROP COLUMN "max_variant_combinations";

    DROP TYPE "public"."enum__products_v_version_sku_value_normalization";
    DROP TYPE "public"."enum__products_v_version_sku_rule_profile";
    DROP TYPE "public"."enum_products_sku_value_normalization";
    DROP TYPE "public"."enum_products_sku_rule_profile";
  `)
}