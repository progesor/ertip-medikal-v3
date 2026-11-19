import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_catalog_outputs_status" AS ENUM('queued', 'running', 'done', 'failed');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'catalogPDF');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'catalogPDF');
  CREATE TABLE "catalogs" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "is_template" boolean DEFAULT false,
    "config" jsonb NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "catalogs_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "media_id" integer
  );

  CREATE TABLE "catalog_outputs" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "catalog_id" integer,
    "status" "enum_catalog_outputs_status" DEFAULT 'queued' NOT NULL,
    "error" varchar,
    "pages" numeric,
    "snapshot" jsonb NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "url" varchar,
    "thumbnail_u_r_l" varchar,
    "filename" varchar,
    "mime_type" varchar,
    "filesize" numeric,
    "width" numeric,
    "height" numeric,
    "focal_x" numeric,
    "focal_y" numeric
  );

  CREATE TABLE "catalog_outputs_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "media_id" integer
  );

  CREATE TABLE "payload_jobs_log" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "executed_at" timestamp(3) with time zone NOT NULL,
    "completed_at" timestamp(3) with time zone NOT NULL,
    "task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
    "task_i_d" varchar NOT NULL,
    "input" jsonb,
    "output" jsonb,
    "state" "enum_payload_jobs_log_state" NOT NULL,
    "error" jsonb
  );

  CREATE TABLE "payload_jobs" (
    "id" serial PRIMARY KEY NOT NULL,
    "input" jsonb,
    "completed_at" timestamp(3) with time zone,
    "total_tried" numeric DEFAULT 0,
    "has_error" boolean DEFAULT false,
    "error" jsonb,
    "task_slug" "enum_payload_jobs_task_slug",
    "queue" varchar DEFAULT 'default',
    "wait_until" timestamp(3) with time zone,
    "processing" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "catalogs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "catalog_outputs_id" integer;
  ALTER TABLE "catalogs_rels" ADD CONSTRAINT "catalogs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."catalogs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "catalogs_rels" ADD CONSTRAINT "catalogs_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "catalog_outputs" ADD CONSTRAINT "catalog_outputs_catalog_id_catalogs_id_fk" FOREIGN KEY ("catalog_id") REFERENCES "public"."catalogs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "catalog_outputs_rels" ADD CONSTRAINT "catalog_outputs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."catalog_outputs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "catalog_outputs_rels" ADD CONSTRAINT "catalog_outputs_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "catalogs_updated_at_idx" ON "catalogs" USING btree ("updated_at");
  CREATE INDEX "catalogs_created_at_idx" ON "catalogs" USING btree ("created_at");
  CREATE INDEX "catalogs_rels_order_idx" ON "catalogs_rels" USING btree ("order");
  CREATE INDEX "catalogs_rels_parent_idx" ON "catalogs_rels" USING btree ("parent_id");
  CREATE INDEX "catalogs_rels_path_idx" ON "catalogs_rels" USING btree ("path");
  CREATE INDEX "catalogs_rels_media_id_idx" ON "catalogs_rels" USING btree ("media_id");
  CREATE INDEX "catalog_outputs_catalog_idx" ON "catalog_outputs" USING btree ("catalog_id");
  CREATE INDEX "catalog_outputs_updated_at_idx" ON "catalog_outputs" USING btree ("updated_at");
  CREATE INDEX "catalog_outputs_created_at_idx" ON "catalog_outputs" USING btree ("created_at");
  CREATE UNIQUE INDEX "catalog_outputs_filename_idx" ON "catalog_outputs" USING btree ("filename");
  CREATE INDEX "catalog_outputs_rels_order_idx" ON "catalog_outputs_rels" USING btree ("order");
  CREATE INDEX "catalog_outputs_rels_parent_idx" ON "catalog_outputs_rels" USING btree ("parent_id");
  CREATE INDEX "catalog_outputs_rels_path_idx" ON "catalog_outputs_rels" USING btree ("path");
  CREATE INDEX "catalog_outputs_rels_media_id_idx" ON "catalog_outputs_rels" USING btree ("media_id");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_catalogs_fk" FOREIGN KEY ("catalogs_id") REFERENCES "public"."catalogs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_catalog_outputs_fk" FOREIGN KEY ("catalog_outputs_id") REFERENCES "public"."catalog_outputs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_catalogs_id_idx" ON "payload_locked_documents_rels" USING btree ("catalogs_id");
  CREATE INDEX "payload_locked_documents_rels_catalog_outputs_id_idx" ON "payload_locked_documents_rels" USING btree ("catalog_outputs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "catalogs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "catalogs_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "catalog_outputs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "catalog_outputs_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "catalogs" CASCADE;
  DROP TABLE "catalogs_rels" CASCADE;
  DROP TABLE "catalog_outputs" CASCADE;
  DROP TABLE "catalog_outputs_rels" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_catalogs_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_catalog_outputs_fk";

  DROP INDEX "payload_locked_documents_rels_catalogs_id_idx";
  DROP INDEX "payload_locked_documents_rels_catalog_outputs_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "catalogs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "catalog_outputs_id";
  DROP TYPE "public"."enum_catalog_outputs_status";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
