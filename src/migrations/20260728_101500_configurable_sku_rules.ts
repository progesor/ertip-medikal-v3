import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_sku_rule_profile" AS ENUM('legacy-punch', 'template', 'manual');
  CREATE TYPE "public"."enum_products_sku_value_normalization" AS ENUM('none', 'compact', 'uppercase-compact', 'slug');
  CREATE TYPE "public"."enum__products_v_version_sku_rule_profile" AS ENUM('legacy-punch', 'template', 'manual');
  CREATE TYPE "public"."enum__products_v_version_sku_value_normalization" AS ENUM('none', 'compact', 'uppercase-compact', 'slug');
  ALTER TABLE "products_variants" ADD COLUMN "combination_key" varchar;
  ALTER TABLE "products" ADD COLUMN "sku_rule_profile" "enum_products_sku_rule_profile" DEFAULT 'legacy-punch';
  ALTER TABLE "products" ADD COLUMN "max_variant_combinations" numeric DEFAULT 500;
  ALTER TABLE "products" ADD COLUMN "sku_template" varchar DEFAULT '{prefix}{values}{suffix}';
  ALTER TABLE "products" ADD COLUMN "sku_value_separator" varchar DEFAULT '-';
  ALTER TABLE "products" ADD COLUMN "sku_value_normalization" "enum_products_sku_value_normalization" DEFAULT 'compact';
  ALTER TABLE "_products_v_version_variants" ADD COLUMN "combination_key" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_sku_rule_profile" "enum__products_v_version_sku_rule_profile" DEFAULT 'legacy-punch';
  ALTER TABLE "_products_v" ADD COLUMN "version_max_variant_combinations" numeric DEFAULT 500;
  ALTER TABLE "_products_v" ADD COLUMN "version_sku_template" varchar DEFAULT '{prefix}{values}{suffix}';
  ALTER TABLE "_products_v" ADD COLUMN "version_sku_value_separator" varchar DEFAULT '-';
  ALTER TABLE "_products_v" ADD COLUMN "version_sku_value_normalization" "enum__products_v_version_sku_value_normalization" DEFAULT 'compact';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_variants" DROP COLUMN "combination_key";
  ALTER TABLE "products" DROP COLUMN "sku_rule_profile";
  ALTER TABLE "products" DROP COLUMN "max_variant_combinations";
  ALTER TABLE "products" DROP COLUMN "sku_template";
  ALTER TABLE "products" DROP COLUMN "sku_value_separator";
  ALTER TABLE "products" DROP COLUMN "sku_value_normalization";
  ALTER TABLE "_products_v_version_variants" DROP COLUMN "combination_key";
  ALTER TABLE "_products_v" DROP COLUMN "version_sku_rule_profile";
  ALTER TABLE "_products_v" DROP COLUMN "version_max_variant_combinations";
  ALTER TABLE "_products_v" DROP COLUMN "version_sku_template";
  ALTER TABLE "_products_v" DROP COLUMN "version_sku_value_separator";
  ALTER TABLE "_products_v" DROP COLUMN "version_sku_value_normalization";
  DROP TYPE "public"."enum_products_sku_rule_profile";
  DROP TYPE "public"."enum_products_sku_value_normalization";
  DROP TYPE "public"."enum__products_v_version_sku_rule_profile";
  DROP TYPE "public"."enum__products_v_version_sku_value_normalization";`)
}
