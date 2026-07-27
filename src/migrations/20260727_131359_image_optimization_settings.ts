import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_image_optimization_format" AS ENUM('webp', 'avif');
  CREATE TYPE "public"."enum_image_optimization_optimization_status" AS ENUM('idle', 'stale', 'running', 'ready', 'partial');
  CREATE TABLE "image_optimization" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"format" "enum_image_optimization_format" DEFAULT 'webp' NOT NULL,
  	"profiles_thumbnail_width" numeric DEFAULT 320 NOT NULL,
  	"profiles_thumbnail_quality" numeric DEFAULT 70 NOT NULL,
  	"profiles_card_width" numeric DEFAULT 900 NOT NULL,
  	"profiles_card_quality" numeric DEFAULT 75 NOT NULL,
  	"profiles_content_width" numeric DEFAULT 1600 NOT NULL,
  	"profiles_content_quality" numeric DEFAULT 80 NOT NULL,
  	"profiles_fullscreen_width" numeric DEFAULT 2400 NOT NULL,
  	"profiles_fullscreen_quality" numeric DEFAULT 85 NOT NULL,
  	"settings_fingerprint" varchar,
  	"active_fingerprint" varchar,
  	"optimization_run_id" varchar,
  	"optimization_status" "enum_image_optimization_optimization_status" DEFAULT 'idle',
  	"last_optimized_at" timestamp(3) with time zone,
  	"processed_count" numeric DEFAULT 0,
  	"skipped_count" numeric DEFAULT 0,
  	"error_count" numeric DEFAULT 0,
  	"total_count" numeric DEFAULT 0,
  	"last_message" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "image_optimization" CASCADE;
  DROP TYPE "public"."enum_image_optimization_format";
  DROP TYPE "public"."enum_image_optimization_optimization_status";`)
}
