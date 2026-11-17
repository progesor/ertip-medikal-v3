import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "news_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "news_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "news_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "news_categories_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "news_categories_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "news_categories_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "pages_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "pages_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "pages_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "media_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "media_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "main_menu_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "main_menu_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "site_settings_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "site_settings_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "theme_settings_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "theme_settings_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "payload_mcp_tool_find_catalog_item" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "payload_mcp_tool_review_product_content" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "payload_mcp_tool_get_content_overview" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "payload_mcp_tool_get_inbox_summary" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "payload_mcp_resource_editorial_guide" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "payload_mcp_prompt_translate_product" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "news_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "news_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "news_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "news_categories_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "news_categories_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "news_categories_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "pages_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "pages_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "pages_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "media_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "media_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "main_menu_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "main_menu_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "site_settings_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "site_settings_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "theme_settings_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "theme_settings_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "payload_mcp_tool_find_catalog_item";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "payload_mcp_tool_review_product_content";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "payload_mcp_tool_get_content_overview";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "payload_mcp_tool_get_inbox_summary";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "payload_mcp_resource_editorial_guide";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "payload_mcp_prompt_translate_product";`)
}
