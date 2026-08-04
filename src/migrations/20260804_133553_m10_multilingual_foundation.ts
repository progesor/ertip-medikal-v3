import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('tr', 'en');
  CREATE TYPE "public"."enum__products_v_published_locale" AS ENUM('tr', 'en');
  CREATE TYPE "public"."enum__news_v_published_locale" AS ENUM('tr', 'en');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('tr', 'en');
  CREATE TABLE "products_locales" (
  	"title" varchar,
  	"short_description" varchar,
  	"description" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_keywords" varchar,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_locales" (
  	"version_title" varchar,
  	"version_short_description" varchar,
  	"version_description" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_keywords" varchar,
  	"version_slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "categories_locales" (
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "news_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_keywords" varchar,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_news_v_locales" (
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_keywords" varchar,
  	"version_slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_keywords" varchar,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_keywords" varchar,
  	"version_slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "news_categories_locales" (
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings_locales" (
  	"header_show_logo_in_header" boolean DEFAULT false,
  	"header_header_logo_variant" "enum_site_settings_header_header_logo_variant" DEFAULT 'auto',
  	"header_show_company_name_in_header" boolean DEFAULT true,
  	"header_show_tagline_in_header" boolean DEFAULT true,
  	"header_header_company_name" varchar DEFAULT 'Ertip Medikal',
  	"header_header_tagline" varchar DEFAULT 'Medical Instruments',
  	"header_header_layout" "enum_site_settings_header_header_layout" DEFAULT 'default',
  	"header_header_cta_label" varchar DEFAULT 'Bize Ulaşın',
  	"header_header_cta_href" varchar DEFAULT '/iletisim',
  	"floating_action_enabled" boolean DEFAULT false,
  	"floating_action_type" "enum_site_settings_floating_action_type" DEFAULT 'whatsapp',
  	"floating_action_position" "enum_site_settings_floating_action_position" DEFAULT 'bottom-right',
  	"floating_action_label" varchar DEFAULT 'WhatsApp ile İletişim',
  	"floating_action_open_in_new_tab" boolean DEFAULT true,
  	"floating_action_style_mode" "enum_site_settings_floating_action_style_mode" DEFAULT 'whatsapp',
  	"floating_action_appearance" "enum_site_settings_floating_action_appearance" DEFAULT 'pill',
  	"floating_action_show_icon" boolean DEFAULT true,
  	"floating_action_show_pulse" boolean DEFAULT true,
  	"floating_action_show_helper_text" boolean DEFAULT false,
  	"floating_action_helper_text" varchar DEFAULT 'Size nasıl yardımcı olabiliriz?',
  	"floating_action_phone_number" varchar,
  	"floating_action_message" varchar DEFAULT 'Merhaba, ürünleriniz hakkında bilgi almak istiyorum.',
  	"floating_action_email" varchar,
  	"floating_action_custom_url" varchar,
  	"footer_copyright" varchar DEFAULT '© 2026 Ertip Medikal. Tüm Hakları Saklıdır.',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "products" DROP CONSTRAINT "products_meta_image_id_media_id_fk";
  
  ALTER TABLE "_products_v" DROP CONSTRAINT "_products_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "news" DROP CONSTRAINT "news_meta_image_id_media_id_fk";
  
  ALTER TABLE "_news_v" DROP CONSTRAINT "_news_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_meta_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk";
  
  DROP INDEX "products_meta_meta_image_idx";
  DROP INDEX "products_slug_idx";
  DROP INDEX "_products_v_version_meta_version_meta_image_idx";
  DROP INDEX "_products_v_version_version_slug_idx";
  DROP INDEX "categories_slug_idx";
  DROP INDEX "news_meta_meta_image_idx";
  DROP INDEX "news_slug_idx";
  DROP INDEX "_news_v_version_meta_version_meta_image_idx";
  DROP INDEX "_news_v_version_version_slug_idx";
  DROP INDEX "pages_meta_meta_image_idx";
  DROP INDEX "pages_slug_idx";
  DROP INDEX "_pages_v_version_meta_version_meta_image_idx";
  DROP INDEX "_pages_v_version_version_slug_idx";
  DROP INDEX "news_categories_slug_idx";
  DROP INDEX "pages_rels_categories_id_idx";
  DROP INDEX "pages_rels_products_id_idx";
  DROP INDEX "_pages_v_rels_categories_id_idx";
  DROP INDEX "_pages_v_rels_products_id_idx";
  ALTER TABLE "products_specs" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_products_v_version_specs" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_products_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "_products_v" ADD COLUMN "published_locale" "enum__products_v_published_locale";
  ALTER TABLE "_news_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "_news_v" ADD COLUMN "published_locale" "enum__news_v_published_locale";
  ALTER TABLE "pages_blocks_hero_buttons" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_content" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_media_text" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_timeline_items" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_timeline" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "cat_showcase" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_video_media" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_features_features" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_features" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_featured_products" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_faq_questions" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_faq" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_testimonial_testimonials" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_testimonial" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_stats_stats" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_stats" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_gallery_images" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_gallery" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_logo_slider_logos" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_logo_slider" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_location_locations" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_location" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_team_members" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_team" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_newsletter" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_hero_slider_slides" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_hero_slider" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_certificate_grid_certificates" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_certificate_grid" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_process_steps" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_process" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_cta_buttons" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_contact_form_departments" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_contact_form" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_blocks_news_feed" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "pages_rels" ADD COLUMN "locale" "_locales";
  ALTER TABLE "_pages_v_blocks_hero_buttons" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_content" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_media_text" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_timeline_items" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_timeline" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_cat_showcase_v" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_video_media" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_features_features" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_features" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_featured_products" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_faq_questions" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_testimonial_testimonials" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_testimonial" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_stats_stats" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_stats" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_gallery_images" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_logo_slider_logos" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_logo_slider" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_location_locations" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_location" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_team_members" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_team" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_newsletter" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_hero_slider_slides" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_hero_slider" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_certificate_grid_certificates" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_certificate_grid" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_process_steps" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_process" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_cta_buttons" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_contact_form_departments" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_contact_form" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v_blocks_news_feed" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_pages_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "_pages_v" ADD COLUMN "published_locale" "enum__pages_v_published_locale";
  ALTER TABLE "_pages_v_rels" ADD COLUMN "locale" "_locales";
  ALTER TABLE "site_settings_blocks_text_column" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "site_settings_blocks_menu_column_links" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "site_settings_blocks_menu_column" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "site_settings_blocks_contact_column" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "site_settings_footer_bottom_links" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "main_menu_items" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "products_locales" ADD CONSTRAINT "products_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_locales" ADD CONSTRAINT "products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_locales" ADD CONSTRAINT "_products_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_locales" ADD CONSTRAINT "_products_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_locales" ADD CONSTRAINT "news_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_locales" ADD CONSTRAINT "news_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_locales" ADD CONSTRAINT "_news_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v_locales" ADD CONSTRAINT "_news_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_news_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_categories_locales" ADD CONSTRAINT "news_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_meta_meta_image_idx" ON "products_locales" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "products_locales_locale_parent_id_unique" ON "products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_version_meta_version_meta_image_idx" ON "_products_v_locales" USING btree ("version_meta_image_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_products_v_locales_locale_parent_id_unique" ON "_products_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "news_meta_meta_image_idx" ON "news_locales" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "news_slug_idx" ON "news_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "news_locales_locale_parent_id_unique" ON "news_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_news_v_version_meta_version_meta_image_idx" ON "_news_v_locales" USING btree ("version_meta_image_id");
  CREATE INDEX "_news_v_version_version_slug_idx" ON "_news_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_news_v_locales_locale_parent_id_unique" ON "_news_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages_locales" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v_locales" USING btree ("version_meta_image_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "news_categories_slug_idx" ON "news_categories_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "news_categories_locales_locale_parent_id_unique" ON "news_categories_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_specs_locale_idx" ON "products_specs" USING btree ("_locale");
  CREATE INDEX "_products_v_version_specs_locale_idx" ON "_products_v_version_specs" USING btree ("_locale");
  CREATE INDEX "_products_v_snapshot_idx" ON "_products_v" USING btree ("snapshot");
  CREATE INDEX "_products_v_published_locale_idx" ON "_products_v" USING btree ("published_locale");
  CREATE INDEX "_news_v_snapshot_idx" ON "_news_v" USING btree ("snapshot");
  CREATE INDEX "_news_v_published_locale_idx" ON "_news_v" USING btree ("published_locale");
  CREATE INDEX "pages_blocks_hero_buttons_locale_idx" ON "pages_blocks_hero_buttons" USING btree ("_locale");
  CREATE INDEX "pages_blocks_hero_locale_idx" ON "pages_blocks_hero" USING btree ("_locale");
  CREATE INDEX "pages_blocks_content_locale_idx" ON "pages_blocks_content" USING btree ("_locale");
  CREATE INDEX "pages_blocks_media_text_locale_idx" ON "pages_blocks_media_text" USING btree ("_locale");
  CREATE INDEX "pages_blocks_timeline_items_locale_idx" ON "pages_blocks_timeline_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_timeline_locale_idx" ON "pages_blocks_timeline" USING btree ("_locale");
  CREATE INDEX "cat_showcase_locale_idx" ON "cat_showcase" USING btree ("_locale");
  CREATE INDEX "pages_blocks_video_media_locale_idx" ON "pages_blocks_video_media" USING btree ("_locale");
  CREATE INDEX "pages_blocks_features_features_locale_idx" ON "pages_blocks_features_features" USING btree ("_locale");
  CREATE INDEX "pages_blocks_features_locale_idx" ON "pages_blocks_features" USING btree ("_locale");
  CREATE INDEX "pages_blocks_featured_products_locale_idx" ON "pages_blocks_featured_products" USING btree ("_locale");
  CREATE INDEX "pages_blocks_faq_questions_locale_idx" ON "pages_blocks_faq_questions" USING btree ("_locale");
  CREATE INDEX "pages_blocks_faq_locale_idx" ON "pages_blocks_faq" USING btree ("_locale");
  CREATE INDEX "pages_blocks_testimonial_testimonials_locale_idx" ON "pages_blocks_testimonial_testimonials" USING btree ("_locale");
  CREATE INDEX "pages_blocks_testimonial_locale_idx" ON "pages_blocks_testimonial" USING btree ("_locale");
  CREATE INDEX "pages_blocks_stats_stats_locale_idx" ON "pages_blocks_stats_stats" USING btree ("_locale");
  CREATE INDEX "pages_blocks_stats_locale_idx" ON "pages_blocks_stats" USING btree ("_locale");
  CREATE INDEX "pages_blocks_gallery_images_locale_idx" ON "pages_blocks_gallery_images" USING btree ("_locale");
  CREATE INDEX "pages_blocks_gallery_locale_idx" ON "pages_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "pages_blocks_logo_slider_logos_locale_idx" ON "pages_blocks_logo_slider_logos" USING btree ("_locale");
  CREATE INDEX "pages_blocks_logo_slider_locale_idx" ON "pages_blocks_logo_slider" USING btree ("_locale");
  CREATE INDEX "pages_blocks_location_locations_locale_idx" ON "pages_blocks_location_locations" USING btree ("_locale");
  CREATE INDEX "pages_blocks_location_locale_idx" ON "pages_blocks_location" USING btree ("_locale");
  CREATE INDEX "pages_blocks_team_members_locale_idx" ON "pages_blocks_team_members" USING btree ("_locale");
  CREATE INDEX "pages_blocks_team_locale_idx" ON "pages_blocks_team" USING btree ("_locale");
  CREATE INDEX "pages_blocks_newsletter_locale_idx" ON "pages_blocks_newsletter" USING btree ("_locale");
  CREATE INDEX "pages_blocks_hero_slider_slides_locale_idx" ON "pages_blocks_hero_slider_slides" USING btree ("_locale");
  CREATE INDEX "pages_blocks_hero_slider_locale_idx" ON "pages_blocks_hero_slider" USING btree ("_locale");
  CREATE INDEX "pages_blocks_certificate_grid_certificates_locale_idx" ON "pages_blocks_certificate_grid_certificates" USING btree ("_locale");
  CREATE INDEX "pages_blocks_certificate_grid_locale_idx" ON "pages_blocks_certificate_grid" USING btree ("_locale");
  CREATE INDEX "pages_blocks_process_steps_locale_idx" ON "pages_blocks_process_steps" USING btree ("_locale");
  CREATE INDEX "pages_blocks_process_locale_idx" ON "pages_blocks_process" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cta_buttons_locale_idx" ON "pages_blocks_cta_buttons" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cta_locale_idx" ON "pages_blocks_cta" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contact_form_departments_locale_idx" ON "pages_blocks_contact_form_departments" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contact_form_locale_idx" ON "pages_blocks_contact_form" USING btree ("_locale");
  CREATE INDEX "pages_blocks_news_feed_locale_idx" ON "pages_blocks_news_feed" USING btree ("_locale");
  CREATE INDEX "pages_rels_locale_idx" ON "pages_rels" USING btree ("locale");
  CREATE INDEX "_pages_v_blocks_hero_buttons_locale_idx" ON "_pages_v_blocks_hero_buttons" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_hero_locale_idx" ON "_pages_v_blocks_hero" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_content_locale_idx" ON "_pages_v_blocks_content" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_media_text_locale_idx" ON "_pages_v_blocks_media_text" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_timeline_items_locale_idx" ON "_pages_v_blocks_timeline_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_timeline_locale_idx" ON "_pages_v_blocks_timeline" USING btree ("_locale");
  CREATE INDEX "_cat_showcase_v_locale_idx" ON "_cat_showcase_v" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_video_media_locale_idx" ON "_pages_v_blocks_video_media" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_features_features_locale_idx" ON "_pages_v_blocks_features_features" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_features_locale_idx" ON "_pages_v_blocks_features" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_featured_products_locale_idx" ON "_pages_v_blocks_featured_products" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_faq_questions_locale_idx" ON "_pages_v_blocks_faq_questions" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_faq_locale_idx" ON "_pages_v_blocks_faq" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_testimonial_testimonials_locale_idx" ON "_pages_v_blocks_testimonial_testimonials" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_testimonial_locale_idx" ON "_pages_v_blocks_testimonial" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_stats_stats_locale_idx" ON "_pages_v_blocks_stats_stats" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_stats_locale_idx" ON "_pages_v_blocks_stats" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_gallery_images_locale_idx" ON "_pages_v_blocks_gallery_images" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_gallery_locale_idx" ON "_pages_v_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_logo_slider_logos_locale_idx" ON "_pages_v_blocks_logo_slider_logos" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_logo_slider_locale_idx" ON "_pages_v_blocks_logo_slider" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_location_locations_locale_idx" ON "_pages_v_blocks_location_locations" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_location_locale_idx" ON "_pages_v_blocks_location" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_team_members_locale_idx" ON "_pages_v_blocks_team_members" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_team_locale_idx" ON "_pages_v_blocks_team" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_newsletter_locale_idx" ON "_pages_v_blocks_newsletter" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_hero_slider_slides_locale_idx" ON "_pages_v_blocks_hero_slider_slides" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_hero_slider_locale_idx" ON "_pages_v_blocks_hero_slider" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_certificate_grid_certificates_locale_idx" ON "_pages_v_blocks_certificate_grid_certificates" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_certificate_grid_locale_idx" ON "_pages_v_blocks_certificate_grid" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_process_steps_locale_idx" ON "_pages_v_blocks_process_steps" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_process_locale_idx" ON "_pages_v_blocks_process" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cta_buttons_locale_idx" ON "_pages_v_blocks_cta_buttons" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cta_locale_idx" ON "_pages_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contact_form_departments_locale_idx" ON "_pages_v_blocks_contact_form_departments" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contact_form_locale_idx" ON "_pages_v_blocks_contact_form" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_news_feed_locale_idx" ON "_pages_v_blocks_news_feed" USING btree ("_locale");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_rels_locale_idx" ON "_pages_v_rels" USING btree ("locale");
  CREATE INDEX "site_settings_blocks_text_column_locale_idx" ON "site_settings_blocks_text_column" USING btree ("_locale");
  CREATE INDEX "site_settings_blocks_menu_column_links_locale_idx" ON "site_settings_blocks_menu_column_links" USING btree ("_locale");
  CREATE INDEX "site_settings_blocks_menu_column_locale_idx" ON "site_settings_blocks_menu_column" USING btree ("_locale");
  CREATE INDEX "site_settings_blocks_contact_column_locale_idx" ON "site_settings_blocks_contact_column" USING btree ("_locale");
  CREATE INDEX "site_settings_footer_bottom_links_locale_idx" ON "site_settings_footer_bottom_links" USING btree ("_locale");
  CREATE INDEX "main_menu_items_locale_idx" ON "main_menu_items" USING btree ("_locale");
  CREATE INDEX "pages_rels_categories_id_idx" ON "pages_rels" USING btree ("categories_id","locale");
  CREATE INDEX "pages_rels_products_id_idx" ON "pages_rels" USING btree ("products_id","locale");
  CREATE INDEX "_pages_v_rels_categories_id_idx" ON "_pages_v_rels" USING btree ("categories_id","locale");
  CREATE INDEX "_pages_v_rels_products_id_idx" ON "_pages_v_rels" USING btree ("products_id","locale");
  
  -- M10 data preservation: all legacy content is Turkish.
  INSERT INTO "products_locales" ("title", "short_description", "description", "meta_title", "meta_description", "meta_image_id", "meta_keywords", "slug", "_locale", "_parent_id")
SELECT "title", "short_description", "description", "meta_title", "meta_description", "meta_image_id", "meta_keywords", "slug", 'tr'::"_locales", "id" FROM "products";
  INSERT INTO "_products_v_locales" ("version_title", "version_short_description", "version_description", "version_meta_title", "version_meta_description", "version_meta_image_id", "version_meta_keywords", "version_slug", "_locale", "_parent_id")
SELECT "version_title", "version_short_description", "version_description", "version_meta_title", "version_meta_description", "version_meta_image_id", "version_meta_keywords", "version_slug", 'tr'::"_locales", "id" FROM "_products_v";
  INSERT INTO "categories_locales" ("title", "slug", "description", "_locale", "_parent_id")
SELECT "title", "slug", "description", 'tr'::"_locales", "id" FROM "categories";
  INSERT INTO "news_locales" ("title", "excerpt", "content", "meta_title", "meta_description", "meta_image_id", "meta_keywords", "slug", "_locale", "_parent_id")
SELECT "title", "excerpt", "content", "meta_title", "meta_description", "meta_image_id", "meta_keywords", "slug", 'tr'::"_locales", "id" FROM "news";
  INSERT INTO "_news_v_locales" ("version_title", "version_excerpt", "version_content", "version_meta_title", "version_meta_description", "version_meta_image_id", "version_meta_keywords", "version_slug", "_locale", "_parent_id")
SELECT "version_title", "version_excerpt", "version_content", "version_meta_title", "version_meta_description", "version_meta_image_id", "version_meta_keywords", "version_slug", 'tr'::"_locales", "id" FROM "_news_v";
  INSERT INTO "pages_locales" ("title", "meta_title", "meta_description", "meta_image_id", "meta_keywords", "slug", "_locale", "_parent_id")
SELECT "title", "meta_title", "meta_description", "meta_image_id", "meta_keywords", "slug", 'tr'::"_locales", "id" FROM "pages";
  INSERT INTO "_pages_v_locales" ("version_title", "version_meta_title", "version_meta_description", "version_meta_image_id", "version_meta_keywords", "version_slug", "_locale", "_parent_id")
SELECT "version_title", "version_meta_title", "version_meta_description", "version_meta_image_id", "version_meta_keywords", "version_slug", 'tr'::"_locales", "id" FROM "_pages_v";
  INSERT INTO "news_categories_locales" ("title", "slug", "_locale", "_parent_id")
SELECT "title", "slug", 'tr'::"_locales", "id" FROM "news_categories";
  INSERT INTO "site_settings_locales" ("header_show_logo_in_header", "header_header_logo_variant", "header_show_company_name_in_header", "header_show_tagline_in_header", "header_header_company_name", "header_header_tagline", "header_header_layout", "header_header_cta_label", "header_header_cta_href", "floating_action_enabled", "floating_action_type", "floating_action_position", "floating_action_label", "floating_action_open_in_new_tab", "floating_action_style_mode", "floating_action_appearance", "floating_action_show_icon", "floating_action_show_pulse", "floating_action_show_helper_text", "floating_action_helper_text", "floating_action_phone_number", "floating_action_message", "floating_action_email", "floating_action_custom_url", "footer_copyright", "_locale", "_parent_id")
SELECT "header_show_logo_in_header", "header_header_logo_variant", "header_show_company_name_in_header", "header_show_tagline_in_header", "header_header_company_name", "header_header_tagline", "header_header_layout", "header_header_cta_label", "header_header_cta_href", "floating_action_enabled", "floating_action_type", "floating_action_position", "floating_action_label", "floating_action_open_in_new_tab", "floating_action_style_mode", "floating_action_appearance", "floating_action_show_icon", "floating_action_show_pulse", "floating_action_show_helper_text", "floating_action_helper_text", "floating_action_phone_number", "floating_action_message", "floating_action_email", "floating_action_custom_url", "footer_copyright", 'tr'::"_locales", "id" FROM "site_settings";
  UPDATE "products_specs" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "products_specs" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_products_v_version_specs" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_products_v_version_specs" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_hero_buttons" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_hero_buttons" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_hero" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_content" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_content" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_media_text" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_media_text" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_timeline_items" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_timeline_items" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_timeline" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_timeline" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "cat_showcase" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "cat_showcase" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_video_media" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_video_media" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_features_features" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_features_features" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_features" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_features" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_featured_products" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_featured_products" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_faq_questions" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_faq_questions" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_faq" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_faq" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_testimonial_testimonials" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_testimonial_testimonials" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_testimonial" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_testimonial" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_stats_stats" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_stats_stats" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_stats" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_stats" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_gallery_images" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_gallery_images" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_gallery" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_gallery" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_logo_slider_logos" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_logo_slider_logos" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_logo_slider" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_logo_slider" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_location_locations" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_location_locations" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_location" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_location" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_team_members" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_team_members" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_team" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_team" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_newsletter" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_newsletter" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_hero_slider_slides" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_hero_slider_slides" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_hero_slider" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_hero_slider" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_certificate_grid_certificates" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_certificate_grid_certificates" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_certificate_grid" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_certificate_grid" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_process_steps" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_process_steps" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_process" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_process" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_cta_buttons" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_cta_buttons" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_cta" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_cta" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_contact_form_departments" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_contact_form_departments" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_contact_form" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_contact_form" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_blocks_news_feed" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "pages_blocks_news_feed" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_hero_buttons" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_hero_buttons" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_hero" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_hero" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_content" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_content" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_media_text" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_media_text" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_timeline_items" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_timeline_items" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_timeline" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_timeline" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_cat_showcase_v" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_cat_showcase_v" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_video_media" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_video_media" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_features_features" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_features_features" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_features" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_features" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_featured_products" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_featured_products" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_faq_questions" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_faq_questions" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_faq" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_faq" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_testimonial_testimonials" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_testimonial_testimonials" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_testimonial" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_testimonial" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_stats_stats" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_stats_stats" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_stats" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_stats" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_gallery_images" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_gallery_images" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_gallery" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_gallery" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_logo_slider_logos" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_logo_slider_logos" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_logo_slider" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_logo_slider" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_location_locations" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_location_locations" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_location" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_location" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_team_members" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_team_members" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_team" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_team" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_newsletter" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_newsletter" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_hero_slider_slides" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_hero_slider_slides" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_hero_slider" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_hero_slider" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_certificate_grid_certificates" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_certificate_grid_certificates" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_certificate_grid" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_certificate_grid" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_process_steps" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_process_steps" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_process" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_process" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_cta_buttons" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_cta_buttons" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_cta" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_cta" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_contact_form_departments" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_contact_form_departments" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_contact_form" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_contact_form" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "_pages_v_blocks_news_feed" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "_pages_v_blocks_news_feed" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "site_settings_blocks_text_column" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "site_settings_blocks_text_column" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "site_settings_blocks_menu_column_links" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "site_settings_blocks_menu_column_links" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "site_settings_blocks_menu_column" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "site_settings_blocks_menu_column" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "site_settings_blocks_contact_column" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "site_settings_blocks_contact_column" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "site_settings_footer_bottom_links" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "site_settings_footer_bottom_links" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "main_menu_items" SET "_locale" = 'tr'::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "main_menu_items" ALTER COLUMN "_locale" SET NOT NULL;
  UPDATE "pages_rels" SET "locale" = 'tr'::"_locales" WHERE "locale" IS NULL;
  UPDATE "_pages_v_rels" SET "locale" = 'tr'::"_locales" WHERE "locale" IS NULL;
  ALTER TABLE "products" DROP COLUMN "title";
  ALTER TABLE "products" DROP COLUMN "short_description";
  ALTER TABLE "products" DROP COLUMN "description";
  ALTER TABLE "products" DROP COLUMN "meta_title";
  ALTER TABLE "products" DROP COLUMN "meta_description";
  ALTER TABLE "products" DROP COLUMN "meta_image_id";
  ALTER TABLE "products" DROP COLUMN "meta_keywords";
  ALTER TABLE "products" DROP COLUMN "slug";
  ALTER TABLE "_products_v" DROP COLUMN "version_title";
  ALTER TABLE "_products_v" DROP COLUMN "version_short_description";
  ALTER TABLE "_products_v" DROP COLUMN "version_description";
  ALTER TABLE "_products_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_products_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "_products_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_products_v" DROP COLUMN "version_meta_keywords";
  ALTER TABLE "_products_v" DROP COLUMN "version_slug";
  ALTER TABLE "categories" DROP COLUMN "title";
  ALTER TABLE "categories" DROP COLUMN "slug";
  ALTER TABLE "categories" DROP COLUMN "description";
  ALTER TABLE "news" DROP COLUMN "title";
  ALTER TABLE "news" DROP COLUMN "excerpt";
  ALTER TABLE "news" DROP COLUMN "content";
  ALTER TABLE "news" DROP COLUMN "meta_title";
  ALTER TABLE "news" DROP COLUMN "meta_description";
  ALTER TABLE "news" DROP COLUMN "meta_image_id";
  ALTER TABLE "news" DROP COLUMN "meta_keywords";
  ALTER TABLE "news" DROP COLUMN "slug";
  ALTER TABLE "_news_v" DROP COLUMN "version_title";
  ALTER TABLE "_news_v" DROP COLUMN "version_excerpt";
  ALTER TABLE "_news_v" DROP COLUMN "version_content";
  ALTER TABLE "_news_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_news_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "_news_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_news_v" DROP COLUMN "version_meta_keywords";
  ALTER TABLE "_news_v" DROP COLUMN "version_slug";
  ALTER TABLE "pages" DROP COLUMN "title";
  ALTER TABLE "pages" DROP COLUMN "meta_title";
  ALTER TABLE "pages" DROP COLUMN "meta_description";
  ALTER TABLE "pages" DROP COLUMN "meta_image_id";
  ALTER TABLE "pages" DROP COLUMN "meta_keywords";
  ALTER TABLE "pages" DROP COLUMN "slug";
  ALTER TABLE "_pages_v" DROP COLUMN "version_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_keywords";
  ALTER TABLE "_pages_v" DROP COLUMN "version_slug";
  ALTER TABLE "news_categories" DROP COLUMN "title";
  ALTER TABLE "news_categories" DROP COLUMN "slug";
  ALTER TABLE "site_settings" DROP COLUMN "header_show_logo_in_header";
  ALTER TABLE "site_settings" DROP COLUMN "header_header_logo_variant";
  ALTER TABLE "site_settings" DROP COLUMN "header_show_company_name_in_header";
  ALTER TABLE "site_settings" DROP COLUMN "header_show_tagline_in_header";
  ALTER TABLE "site_settings" DROP COLUMN "header_header_company_name";
  ALTER TABLE "site_settings" DROP COLUMN "header_header_tagline";
  ALTER TABLE "site_settings" DROP COLUMN "header_header_layout";
  ALTER TABLE "site_settings" DROP COLUMN "header_header_cta_label";
  ALTER TABLE "site_settings" DROP COLUMN "header_header_cta_href";
  ALTER TABLE "site_settings" DROP COLUMN "floating_action_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "floating_action_type";
  ALTER TABLE "site_settings" DROP COLUMN "floating_action_position";
  ALTER TABLE "site_settings" DROP COLUMN "floating_action_label";
  ALTER TABLE "site_settings" DROP COLUMN "floating_action_open_in_new_tab";
  ALTER TABLE "site_settings" DROP COLUMN "floating_action_style_mode";
  ALTER TABLE "site_settings" DROP COLUMN "floating_action_appearance";
  ALTER TABLE "site_settings" DROP COLUMN "floating_action_show_icon";
  ALTER TABLE "site_settings" DROP COLUMN "floating_action_show_pulse";
  ALTER TABLE "site_settings" DROP COLUMN "floating_action_show_helper_text";
  ALTER TABLE "site_settings" DROP COLUMN "floating_action_helper_text";
  ALTER TABLE "site_settings" DROP COLUMN "floating_action_phone_number";
  ALTER TABLE "site_settings" DROP COLUMN "floating_action_message";
  ALTER TABLE "site_settings" DROP COLUMN "floating_action_email";
  ALTER TABLE "site_settings" DROP COLUMN "floating_action_custom_url";
  ALTER TABLE "site_settings" DROP COLUMN "footer_copyright";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  throw new Error(
    "M10 multilingual localization is intentionally irreversible. Restore the pre-migration PostgreSQL backup instead of running migrate:down.",
  )
}
