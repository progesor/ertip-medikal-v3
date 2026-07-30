import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_media_text_layout_mode" AS ENUM('split', 'wrap');
  CREATE TYPE "public"."enum_pages_blocks_media_text_column_ratio" AS ENUM('mediaOneThird', 'equal', 'mediaTwoThird');
  CREATE TYPE "public"."enum_pages_blocks_media_text_vertical_alignment" AS ENUM('start', 'center');
  CREATE TYPE "public"."enum_pages_blocks_media_text_image_ratio" AS ENUM('auto', 'landscape', 'wide', 'square', 'portrait');
  CREATE TYPE "public"."enum_pages_blocks_media_text_content_width" AS ENUM('compact', 'standard', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_media_text_content_alignment" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_media_text_layout_mode" AS ENUM('split', 'wrap');
  CREATE TYPE "public"."enum__pages_v_blocks_media_text_column_ratio" AS ENUM('mediaOneThird', 'equal', 'mediaTwoThird');
  CREATE TYPE "public"."enum__pages_v_blocks_media_text_vertical_alignment" AS ENUM('start', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_media_text_image_ratio" AS ENUM('auto', 'landscape', 'wide', 'square', 'portrait');
  CREATE TYPE "public"."enum__pages_v_blocks_media_text_content_width" AS ENUM('compact', 'standard', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_media_text_content_alignment" AS ENUM('left', 'center');
  ALTER TABLE "pages_blocks_media_text" ADD COLUMN "layout_mode" "enum_pages_blocks_media_text_layout_mode" DEFAULT 'split';
  ALTER TABLE "pages_blocks_media_text" ADD COLUMN "column_ratio" "enum_pages_blocks_media_text_column_ratio" DEFAULT 'equal';
  ALTER TABLE "pages_blocks_media_text" ADD COLUMN "vertical_alignment" "enum_pages_blocks_media_text_vertical_alignment" DEFAULT 'center';
  ALTER TABLE "pages_blocks_media_text" ADD COLUMN "image_ratio" "enum_pages_blocks_media_text_image_ratio" DEFAULT 'landscape';
  ALTER TABLE "pages_blocks_media_text" ADD COLUMN "content_width" "enum_pages_blocks_media_text_content_width" DEFAULT 'standard';
  ALTER TABLE "pages_blocks_media_text" ADD COLUMN "content_alignment" "enum_pages_blocks_media_text_content_alignment" DEFAULT 'left';
  ALTER TABLE "_pages_v_blocks_media_text" ADD COLUMN "layout_mode" "enum__pages_v_blocks_media_text_layout_mode" DEFAULT 'split';
  ALTER TABLE "_pages_v_blocks_media_text" ADD COLUMN "column_ratio" "enum__pages_v_blocks_media_text_column_ratio" DEFAULT 'equal';
  ALTER TABLE "_pages_v_blocks_media_text" ADD COLUMN "vertical_alignment" "enum__pages_v_blocks_media_text_vertical_alignment" DEFAULT 'center';
  ALTER TABLE "_pages_v_blocks_media_text" ADD COLUMN "image_ratio" "enum__pages_v_blocks_media_text_image_ratio" DEFAULT 'landscape';
  ALTER TABLE "_pages_v_blocks_media_text" ADD COLUMN "content_width" "enum__pages_v_blocks_media_text_content_width" DEFAULT 'standard';
  ALTER TABLE "_pages_v_blocks_media_text" ADD COLUMN "content_alignment" "enum__pages_v_blocks_media_text_content_alignment" DEFAULT 'left';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_media_text" DROP COLUMN "layout_mode";
  ALTER TABLE "pages_blocks_media_text" DROP COLUMN "column_ratio";
  ALTER TABLE "pages_blocks_media_text" DROP COLUMN "vertical_alignment";
  ALTER TABLE "pages_blocks_media_text" DROP COLUMN "image_ratio";
  ALTER TABLE "pages_blocks_media_text" DROP COLUMN "content_width";
  ALTER TABLE "pages_blocks_media_text" DROP COLUMN "content_alignment";
  ALTER TABLE "_pages_v_blocks_media_text" DROP COLUMN "layout_mode";
  ALTER TABLE "_pages_v_blocks_media_text" DROP COLUMN "column_ratio";
  ALTER TABLE "_pages_v_blocks_media_text" DROP COLUMN "vertical_alignment";
  ALTER TABLE "_pages_v_blocks_media_text" DROP COLUMN "image_ratio";
  ALTER TABLE "_pages_v_blocks_media_text" DROP COLUMN "content_width";
  ALTER TABLE "_pages_v_blocks_media_text" DROP COLUMN "content_alignment";
  DROP TYPE "public"."enum_pages_blocks_media_text_layout_mode";
  DROP TYPE "public"."enum_pages_blocks_media_text_column_ratio";
  DROP TYPE "public"."enum_pages_blocks_media_text_vertical_alignment";
  DROP TYPE "public"."enum_pages_blocks_media_text_image_ratio";
  DROP TYPE "public"."enum_pages_blocks_media_text_content_width";
  DROP TYPE "public"."enum_pages_blocks_media_text_content_alignment";
  DROP TYPE "public"."enum__pages_v_blocks_media_text_layout_mode";
  DROP TYPE "public"."enum__pages_v_blocks_media_text_column_ratio";
  DROP TYPE "public"."enum__pages_v_blocks_media_text_vertical_alignment";
  DROP TYPE "public"."enum__pages_v_blocks_media_text_image_ratio";
  DROP TYPE "public"."enum__pages_v_blocks_media_text_content_width";
  DROP TYPE "public"."enum__pages_v_blocks_media_text_content_alignment";`)
}
