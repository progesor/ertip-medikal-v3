import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_timeline_layout_mode" AS ENUM('alternating', 'vertical', 'cards');
  CREATE TYPE "public"."enum_pages_blocks_timeline_alignment" AS ENUM('center', 'left');
  CREATE TYPE "public"."enum_pages_blocks_timeline_card_style" AS ENUM('elevated', 'outlined', 'minimal');
  CREATE TYPE "public"."enum_pages_blocks_timeline_section_background" AS ENUM('transparent', 'light', 'muted', 'dark', 'primary');
  CREATE TYPE "public"."enum_pages_blocks_timeline_section_spacing" AS ENUM('none', 'compact', 'standard', 'large');
  CREATE TYPE "public"."enum_pages_blocks_timeline_section_content_width" AS ENUM('compact', 'standard', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_timeline_section_decoration" AS ENUM('none', 'glow', 'grid');
  CREATE TYPE "public"."enum_cat_showcase_selection_mode" AS ENUM('topLevel', 'manual');
  CREATE TYPE "public"."enum_cat_showcase_layout_mode" AS ENUM('grid', 'featured', 'compact');
  CREATE TYPE "public"."enum_cat_showcase_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_cat_showcase_card_style" AS ENUM('overlay', 'card', 'minimal');
  CREATE TYPE "public"."enum_cat_showcase_image_ratio" AS ENUM('4:3', '16:9', '1:1', '3:4');
  CREATE TYPE "public"."enum_cat_showcase_alignment" AS ENUM('center', 'left');
  CREATE TYPE "public"."enum_cat_showcase_section_background" AS ENUM('transparent', 'light', 'muted', 'dark', 'primary');
  CREATE TYPE "public"."enum_cat_showcase_section_spacing" AS ENUM('none', 'compact', 'standard', 'large');
  CREATE TYPE "public"."enum_cat_showcase_section_content_width" AS ENUM('compact', 'standard', 'wide', 'full');
  CREATE TYPE "public"."enum_cat_showcase_section_decoration" AS ENUM('none', 'glow', 'grid');
  CREATE TYPE "public"."enum_pages_blocks_video_media_source_type" AS ENUM('external', 'upload');
  CREATE TYPE "public"."enum_pages_blocks_video_media_layout_mode" AS ENUM('full', 'split');
  CREATE TYPE "public"."enum_pages_blocks_video_media_media_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_blocks_video_media_aspect_ratio" AS ENUM('16:9', '4:3', '1:1', '9:16');
  CREATE TYPE "public"."enum_pages_blocks_video_media_frame_style" AS ENUM('elevated', 'outlined', 'plain');
  CREATE TYPE "public"."enum_pages_blocks_video_media_alignment" AS ENUM('center', 'left');
  CREATE TYPE "public"."enum_pages_blocks_video_media_section_background" AS ENUM('transparent', 'light', 'muted', 'dark', 'primary');
  CREATE TYPE "public"."enum_pages_blocks_video_media_section_spacing" AS ENUM('none', 'compact', 'standard', 'large');
  CREATE TYPE "public"."enum_pages_blocks_video_media_section_content_width" AS ENUM('compact', 'standard', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_video_media_section_decoration" AS ENUM('none', 'glow', 'grid');
  CREATE TYPE "public"."enum__pages_v_blocks_timeline_layout_mode" AS ENUM('alternating', 'vertical', 'cards');
  CREATE TYPE "public"."enum__pages_v_blocks_timeline_alignment" AS ENUM('center', 'left');
  CREATE TYPE "public"."enum__pages_v_blocks_timeline_card_style" AS ENUM('elevated', 'outlined', 'minimal');
  CREATE TYPE "public"."enum__pages_v_blocks_timeline_section_background" AS ENUM('transparent', 'light', 'muted', 'dark', 'primary');
  CREATE TYPE "public"."enum__pages_v_blocks_timeline_section_spacing" AS ENUM('none', 'compact', 'standard', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_timeline_section_content_width" AS ENUM('compact', 'standard', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_timeline_section_decoration" AS ENUM('none', 'glow', 'grid');
  CREATE TYPE "public"."enum__cat_showcase_v_selection_mode" AS ENUM('topLevel', 'manual');
  CREATE TYPE "public"."enum__cat_showcase_v_layout_mode" AS ENUM('grid', 'featured', 'compact');
  CREATE TYPE "public"."enum__cat_showcase_v_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__cat_showcase_v_card_style" AS ENUM('overlay', 'card', 'minimal');
  CREATE TYPE "public"."enum__cat_showcase_v_image_ratio" AS ENUM('4:3', '16:9', '1:1', '3:4');
  CREATE TYPE "public"."enum__cat_showcase_v_alignment" AS ENUM('center', 'left');
  CREATE TYPE "public"."enum__cat_showcase_v_section_background" AS ENUM('transparent', 'light', 'muted', 'dark', 'primary');
  CREATE TYPE "public"."enum__cat_showcase_v_section_spacing" AS ENUM('none', 'compact', 'standard', 'large');
  CREATE TYPE "public"."enum__cat_showcase_v_section_content_width" AS ENUM('compact', 'standard', 'wide', 'full');
  CREATE TYPE "public"."enum__cat_showcase_v_section_decoration" AS ENUM('none', 'glow', 'grid');
  CREATE TYPE "public"."enum__pages_v_blocks_video_media_source_type" AS ENUM('external', 'upload');
  CREATE TYPE "public"."enum__pages_v_blocks_video_media_layout_mode" AS ENUM('full', 'split');
  CREATE TYPE "public"."enum__pages_v_blocks_video_media_media_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_video_media_aspect_ratio" AS ENUM('16:9', '4:3', '1:1', '9:16');
  CREATE TYPE "public"."enum__pages_v_blocks_video_media_frame_style" AS ENUM('elevated', 'outlined', 'plain');
  CREATE TYPE "public"."enum__pages_v_blocks_video_media_alignment" AS ENUM('center', 'left');
  CREATE TYPE "public"."enum__pages_v_blocks_video_media_section_background" AS ENUM('transparent', 'light', 'muted', 'dark', 'primary');
  CREATE TYPE "public"."enum__pages_v_blocks_video_media_section_spacing" AS ENUM('none', 'compact', 'standard', 'large');
  CREATE TYPE "public"."enum__pages_v_blocks_video_media_section_content_width" AS ENUM('compact', 'standard', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_video_media_section_decoration" AS ENUM('none', 'glow', 'grid');
  CREATE TABLE "pages_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date_label" varchar,
  	"item_title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"highlight" boolean DEFAULT false,
  	"link_text" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "pages_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar DEFAULT 'Kilometre Taşlarımız',
  	"subtitle" varchar,
  	"layout_mode" "enum_pages_blocks_timeline_layout_mode" DEFAULT 'alternating',
  	"alignment" "enum_pages_blocks_timeline_alignment" DEFAULT 'center',
  	"card_style" "enum_pages_blocks_timeline_card_style" DEFAULT 'elevated',
  	"section_anchor" varchar,
  	"section_background" "enum_pages_blocks_timeline_section_background" DEFAULT 'light',
  	"section_spacing" "enum_pages_blocks_timeline_section_spacing" DEFAULT 'large',
  	"section_content_width" "enum_pages_blocks_timeline_section_content_width" DEFAULT 'wide',
  	"section_divider_top" boolean DEFAULT false,
  	"section_divider_bottom" boolean DEFAULT false,
  	"section_decoration" "enum_pages_blocks_timeline_section_decoration" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "cat_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar DEFAULT 'Ürün Kategorilerimiz',
  	"subtitle" varchar,
  	"selection_mode" "enum_cat_showcase_selection_mode" DEFAULT 'topLevel',
  	"layout_mode" "enum_cat_showcase_layout_mode" DEFAULT 'grid',
  	"columns" "enum_cat_showcase_columns" DEFAULT '3',
  	"card_style" "enum_cat_showcase_card_style" DEFAULT 'overlay',
  	"image_ratio" "enum_cat_showcase_image_ratio" DEFAULT '4:3',
  	"alignment" "enum_cat_showcase_alignment" DEFAULT 'center',
  	"show_description" boolean DEFAULT true,
  	"show_product_count" boolean DEFAULT true,
  	"include_child_products" boolean DEFAULT true,
  	"empty_state_text" varchar DEFAULT 'Henüz gösterilecek kategori bulunmuyor.',
  	"section_anchor" varchar,
  	"section_background" "enum_cat_showcase_section_background" DEFAULT 'muted',
  	"section_spacing" "enum_cat_showcase_section_spacing" DEFAULT 'large',
  	"section_content_width" "enum_cat_showcase_section_content_width" DEFAULT 'wide',
  	"section_divider_top" boolean DEFAULT false,
  	"section_divider_bottom" boolean DEFAULT false,
  	"section_decoration" "enum_cat_showcase_section_decoration" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_video_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"content" jsonb,
  	"source_type" "enum_pages_blocks_video_media_source_type" DEFAULT 'external',
  	"layout_mode" "enum_pages_blocks_video_media_layout_mode" DEFAULT 'full',
  	"media_position" "enum_pages_blocks_video_media_media_position" DEFAULT 'left',
  	"external_url" varchar,
  	"video_file_id" integer,
  	"poster_id" integer,
  	"aspect_ratio" "enum_pages_blocks_video_media_aspect_ratio" DEFAULT '16:9',
  	"frame_style" "enum_pages_blocks_video_media_frame_style" DEFAULT 'elevated',
  	"alignment" "enum_pages_blocks_video_media_alignment" DEFAULT 'center',
  	"controls" boolean DEFAULT true,
  	"autoplay" boolean DEFAULT false,
  	"loop" boolean DEFAULT false,
  	"muted" boolean DEFAULT false,
  	"caption" varchar,
  	"button_text" varchar,
  	"button_link" varchar,
  	"section_anchor" varchar,
  	"section_background" "enum_pages_blocks_video_media_section_background" DEFAULT 'light',
  	"section_spacing" "enum_pages_blocks_video_media_section_spacing" DEFAULT 'large',
  	"section_content_width" "enum_pages_blocks_video_media_section_content_width" DEFAULT 'wide',
  	"section_divider_top" boolean DEFAULT false,
  	"section_divider_bottom" boolean DEFAULT false,
  	"section_decoration" "enum_pages_blocks_video_media_section_decoration" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date_label" varchar,
  	"item_title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"highlight" boolean DEFAULT false,
  	"link_text" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar DEFAULT 'Kilometre Taşlarımız',
  	"subtitle" varchar,
  	"layout_mode" "enum__pages_v_blocks_timeline_layout_mode" DEFAULT 'alternating',
  	"alignment" "enum__pages_v_blocks_timeline_alignment" DEFAULT 'center',
  	"card_style" "enum__pages_v_blocks_timeline_card_style" DEFAULT 'elevated',
  	"section_anchor" varchar,
  	"section_background" "enum__pages_v_blocks_timeline_section_background" DEFAULT 'light',
  	"section_spacing" "enum__pages_v_blocks_timeline_section_spacing" DEFAULT 'large',
  	"section_content_width" "enum__pages_v_blocks_timeline_section_content_width" DEFAULT 'wide',
  	"section_divider_top" boolean DEFAULT false,
  	"section_divider_bottom" boolean DEFAULT false,
  	"section_decoration" "enum__pages_v_blocks_timeline_section_decoration" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cat_showcase_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar DEFAULT 'Ürün Kategorilerimiz',
  	"subtitle" varchar,
  	"selection_mode" "enum__cat_showcase_v_selection_mode" DEFAULT 'topLevel',
  	"layout_mode" "enum__cat_showcase_v_layout_mode" DEFAULT 'grid',
  	"columns" "enum__cat_showcase_v_columns" DEFAULT '3',
  	"card_style" "enum__cat_showcase_v_card_style" DEFAULT 'overlay',
  	"image_ratio" "enum__cat_showcase_v_image_ratio" DEFAULT '4:3',
  	"alignment" "enum__cat_showcase_v_alignment" DEFAULT 'center',
  	"show_description" boolean DEFAULT true,
  	"show_product_count" boolean DEFAULT true,
  	"include_child_products" boolean DEFAULT true,
  	"empty_state_text" varchar DEFAULT 'Henüz gösterilecek kategori bulunmuyor.',
  	"section_anchor" varchar,
  	"section_background" "enum__cat_showcase_v_section_background" DEFAULT 'muted',
  	"section_spacing" "enum__cat_showcase_v_section_spacing" DEFAULT 'large',
  	"section_content_width" "enum__cat_showcase_v_section_content_width" DEFAULT 'wide',
  	"section_divider_top" boolean DEFAULT false,
  	"section_divider_bottom" boolean DEFAULT false,
  	"section_decoration" "enum__cat_showcase_v_section_decoration" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_video_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"content" jsonb,
  	"source_type" "enum__pages_v_blocks_video_media_source_type" DEFAULT 'external',
  	"layout_mode" "enum__pages_v_blocks_video_media_layout_mode" DEFAULT 'full',
  	"media_position" "enum__pages_v_blocks_video_media_media_position" DEFAULT 'left',
  	"external_url" varchar,
  	"video_file_id" integer,
  	"poster_id" integer,
  	"aspect_ratio" "enum__pages_v_blocks_video_media_aspect_ratio" DEFAULT '16:9',
  	"frame_style" "enum__pages_v_blocks_video_media_frame_style" DEFAULT 'elevated',
  	"alignment" "enum__pages_v_blocks_video_media_alignment" DEFAULT 'center',
  	"controls" boolean DEFAULT true,
  	"autoplay" boolean DEFAULT false,
  	"loop" boolean DEFAULT false,
  	"muted" boolean DEFAULT false,
  	"caption" varchar,
  	"button_text" varchar,
  	"button_link" varchar,
  	"section_anchor" varchar,
  	"section_background" "enum__pages_v_blocks_video_media_section_background" DEFAULT 'light',
  	"section_spacing" "enum__pages_v_blocks_video_media_section_spacing" DEFAULT 'large',
  	"section_content_width" "enum__pages_v_blocks_video_media_section_content_width" DEFAULT 'wide',
  	"section_divider_top" boolean DEFAULT false,
  	"section_divider_bottom" boolean DEFAULT false,
  	"section_decoration" "enum__pages_v_blocks_video_media_section_decoration" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "pages_blocks_timeline_items" ADD CONSTRAINT "pages_blocks_timeline_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline_items" ADD CONSTRAINT "pages_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline" ADD CONSTRAINT "pages_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cat_showcase" ADD CONSTRAINT "cat_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video_media" ADD CONSTRAINT "pages_blocks_video_media_video_file_id_media_id_fk" FOREIGN KEY ("video_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_video_media" ADD CONSTRAINT "pages_blocks_video_media_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_video_media" ADD CONSTRAINT "pages_blocks_video_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline_items" ADD CONSTRAINT "_pages_v_blocks_timeline_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline_items" ADD CONSTRAINT "_pages_v_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline" ADD CONSTRAINT "_pages_v_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cat_showcase_v" ADD CONSTRAINT "_cat_showcase_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video_media" ADD CONSTRAINT "_pages_v_blocks_video_media_video_file_id_media_id_fk" FOREIGN KEY ("video_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video_media" ADD CONSTRAINT "_pages_v_blocks_video_media_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video_media" ADD CONSTRAINT "_pages_v_blocks_video_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_timeline_items_order_idx" ON "pages_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_timeline_items_parent_id_idx" ON "pages_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_timeline_items_image_idx" ON "pages_blocks_timeline_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_timeline_order_idx" ON "pages_blocks_timeline" USING btree ("_order");
  CREATE INDEX "pages_blocks_timeline_parent_id_idx" ON "pages_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_timeline_path_idx" ON "pages_blocks_timeline" USING btree ("_path");
  CREATE INDEX "cat_showcase_order_idx" ON "cat_showcase" USING btree ("_order");
  CREATE INDEX "cat_showcase_parent_id_idx" ON "cat_showcase" USING btree ("_parent_id");
  CREATE INDEX "cat_showcase_path_idx" ON "cat_showcase" USING btree ("_path");
  CREATE INDEX "pages_blocks_video_media_order_idx" ON "pages_blocks_video_media" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_media_parent_id_idx" ON "pages_blocks_video_media" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_media_path_idx" ON "pages_blocks_video_media" USING btree ("_path");
  CREATE INDEX "pages_blocks_video_media_video_file_idx" ON "pages_blocks_video_media" USING btree ("video_file_id");
  CREATE INDEX "pages_blocks_video_media_poster_idx" ON "pages_blocks_video_media" USING btree ("poster_id");
  CREATE INDEX "_pages_v_blocks_timeline_items_order_idx" ON "_pages_v_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_timeline_items_parent_id_idx" ON "_pages_v_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_timeline_items_image_idx" ON "_pages_v_blocks_timeline_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_timeline_order_idx" ON "_pages_v_blocks_timeline" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_timeline_parent_id_idx" ON "_pages_v_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_timeline_path_idx" ON "_pages_v_blocks_timeline" USING btree ("_path");
  CREATE INDEX "_cat_showcase_v_order_idx" ON "_cat_showcase_v" USING btree ("_order");
  CREATE INDEX "_cat_showcase_v_parent_id_idx" ON "_cat_showcase_v" USING btree ("_parent_id");
  CREATE INDEX "_cat_showcase_v_path_idx" ON "_cat_showcase_v" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_video_media_order_idx" ON "_pages_v_blocks_video_media" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_video_media_parent_id_idx" ON "_pages_v_blocks_video_media" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_video_media_path_idx" ON "_pages_v_blocks_video_media" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_video_media_video_file_idx" ON "_pages_v_blocks_video_media" USING btree ("video_file_id");
  CREATE INDEX "_pages_v_blocks_video_media_poster_idx" ON "_pages_v_blocks_video_media" USING btree ("poster_id");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_categories_id_idx" ON "pages_rels" USING btree ("categories_id");
  CREATE INDEX "_pages_v_rels_categories_id_idx" ON "_pages_v_rels" USING btree ("categories_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_timeline_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cat_showcase" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_video_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_timeline_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cat_showcase_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_video_media" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_timeline_items" CASCADE;
  DROP TABLE "pages_blocks_timeline" CASCADE;
  DROP TABLE "cat_showcase" CASCADE;
  DROP TABLE "pages_blocks_video_media" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline_items" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline" CASCADE;
  DROP TABLE "_cat_showcase_v" CASCADE;
  DROP TABLE "_pages_v_blocks_video_media" CASCADE;
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_categories_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_categories_fk";
  
  DROP INDEX "pages_rels_categories_id_idx";
  DROP INDEX "_pages_v_rels_categories_id_idx";
  ALTER TABLE "pages_rels" DROP COLUMN "categories_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "categories_id";
  DROP TYPE "public"."enum_pages_blocks_timeline_layout_mode";
  DROP TYPE "public"."enum_pages_blocks_timeline_alignment";
  DROP TYPE "public"."enum_pages_blocks_timeline_card_style";
  DROP TYPE "public"."enum_pages_blocks_timeline_section_background";
  DROP TYPE "public"."enum_pages_blocks_timeline_section_spacing";
  DROP TYPE "public"."enum_pages_blocks_timeline_section_content_width";
  DROP TYPE "public"."enum_pages_blocks_timeline_section_decoration";
  DROP TYPE "public"."enum_cat_showcase_selection_mode";
  DROP TYPE "public"."enum_cat_showcase_layout_mode";
  DROP TYPE "public"."enum_cat_showcase_columns";
  DROP TYPE "public"."enum_cat_showcase_card_style";
  DROP TYPE "public"."enum_cat_showcase_image_ratio";
  DROP TYPE "public"."enum_cat_showcase_alignment";
  DROP TYPE "public"."enum_cat_showcase_section_background";
  DROP TYPE "public"."enum_cat_showcase_section_spacing";
  DROP TYPE "public"."enum_cat_showcase_section_content_width";
  DROP TYPE "public"."enum_cat_showcase_section_decoration";
  DROP TYPE "public"."enum_pages_blocks_video_media_source_type";
  DROP TYPE "public"."enum_pages_blocks_video_media_layout_mode";
  DROP TYPE "public"."enum_pages_blocks_video_media_media_position";
  DROP TYPE "public"."enum_pages_blocks_video_media_aspect_ratio";
  DROP TYPE "public"."enum_pages_blocks_video_media_frame_style";
  DROP TYPE "public"."enum_pages_blocks_video_media_alignment";
  DROP TYPE "public"."enum_pages_blocks_video_media_section_background";
  DROP TYPE "public"."enum_pages_blocks_video_media_section_spacing";
  DROP TYPE "public"."enum_pages_blocks_video_media_section_content_width";
  DROP TYPE "public"."enum_pages_blocks_video_media_section_decoration";
  DROP TYPE "public"."enum__pages_v_blocks_timeline_layout_mode";
  DROP TYPE "public"."enum__pages_v_blocks_timeline_alignment";
  DROP TYPE "public"."enum__pages_v_blocks_timeline_card_style";
  DROP TYPE "public"."enum__pages_v_blocks_timeline_section_background";
  DROP TYPE "public"."enum__pages_v_blocks_timeline_section_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_timeline_section_content_width";
  DROP TYPE "public"."enum__pages_v_blocks_timeline_section_decoration";
  DROP TYPE "public"."enum__cat_showcase_v_selection_mode";
  DROP TYPE "public"."enum__cat_showcase_v_layout_mode";
  DROP TYPE "public"."enum__cat_showcase_v_columns";
  DROP TYPE "public"."enum__cat_showcase_v_card_style";
  DROP TYPE "public"."enum__cat_showcase_v_image_ratio";
  DROP TYPE "public"."enum__cat_showcase_v_alignment";
  DROP TYPE "public"."enum__cat_showcase_v_section_background";
  DROP TYPE "public"."enum__cat_showcase_v_section_spacing";
  DROP TYPE "public"."enum__cat_showcase_v_section_content_width";
  DROP TYPE "public"."enum__cat_showcase_v_section_decoration";
  DROP TYPE "public"."enum__pages_v_blocks_video_media_source_type";
  DROP TYPE "public"."enum__pages_v_blocks_video_media_layout_mode";
  DROP TYPE "public"."enum__pages_v_blocks_video_media_media_position";
  DROP TYPE "public"."enum__pages_v_blocks_video_media_aspect_ratio";
  DROP TYPE "public"."enum__pages_v_blocks_video_media_frame_style";
  DROP TYPE "public"."enum__pages_v_blocks_video_media_alignment";
  DROP TYPE "public"."enum__pages_v_blocks_video_media_section_background";
  DROP TYPE "public"."enum__pages_v_blocks_video_media_section_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_video_media_section_content_width";
  DROP TYPE "public"."enum__pages_v_blocks_video_media_section_decoration";`)
}
