import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ADD COLUMN "_order" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version__order" varchar;
  WITH manual_positions AS (
    SELECT rel.products_id, min(rel."order") AS position
    FROM site_settings_rels rel
    JOIN site_settings settings ON settings.id = rel.parent_id
    WHERE rel.path = 'productCatalog.manualProductOrder'
      AND settings.product_catalog_default_sort_mode = 'manual'
    GROUP BY rel.products_id
  ), ranked AS (
    SELECT p.id, row_number() OVER (
      ORDER BY m.position NULLS LAST,
        CASE WHEN (SELECT product_catalog_default_sort_mode FROM site_settings LIMIT 1) = 'oldest'
          THEN p.created_at END ASC,
        p.created_at DESC, p.id
    ) AS position
    FROM products p LEFT JOIN manual_positions m ON m.products_id = p.id
  )
  UPDATE products p SET "_order" = 'j' || lpad(ranked.position::text, 10, '0')
    FROM ranked WHERE ranked.id = p.id;
  UPDATE "_products_v" v SET "version__order" = p."_order"
    FROM products p WHERE p.id = v.parent_id;
  CREATE INDEX "products__order_idx" ON "products" USING btree ("_order");
  CREATE INDEX "_products_v_version_version__order_idx" ON "_products_v" USING btree ("version__order");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "products__order_idx";
  DROP INDEX "_products_v_version_version__order_idx";
  ALTER TABLE "products" DROP COLUMN "_order";
  ALTER TABLE "_products_v" DROP COLUMN "version__order";`)
}
