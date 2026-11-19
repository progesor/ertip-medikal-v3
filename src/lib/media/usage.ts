import { sql, type PostgresAdapter } from "@payloadcms/db-postgres";
import { APIError, type PayloadRequest } from "payload";

type ImageRow = {
  id: number; filename: string; filesize: number; created_at: string;
  thumbnail: string | null; card: string | null; hero: string | null;
};
type Column = { source: string; field: string };
type Status = "unused" | "current" | "history";
function sourceLabel(table: string) {
  if (table.startsWith("catalog")) return "Katalog Stüdyosu";
  if (table.startsWith("_")) return "Taslak ve sürüm geçmişi";
  if (table.includes("variants")) return "Ürün varyantları";
  if (table.startsWith("products")) return "Ürünler";
  if (table.startsWith("categories")) return "Ürün kategorileri";
  if (table.startsWith("pages")) return "Sayfalar";
  if (table.startsWith("news")) return "Haberler";
  if (table.startsWith("site_settings")) return "Site ayarları";
  if (table.startsWith("main_menu")) return "Ana menü";
  return "Diğer site içeriği";
}
function decodeReference(value: string) {
  // Image delivery and the filename itself may both be URL-encoded.
  return value.replace(/(?:%[a-f0-9]{2})+/gi, part => {
    try { return decodeURIComponent(part); } catch { return part; }
  });
}

export async function scanImages(req: PayloadRequest, deletingId?: number | string) {
  const adapter = req.payload.db as unknown as Pick<PostgresAdapter, "drizzle" | "sessions">;
  const session = req.transactionID && adapter.sessions[await req.transactionID];
  if (deletingId !== undefined && !session) throw new APIError("Silme işlemi için veritabanı kilidi alınamadı.", 409);
  const db = session ? session.db : adapter.drizzle;
  const rows = (await db.execute(sql`
    SELECT id, filename, filesize, created_at, sizes_thumbnail_filename AS thumbnail,
      sizes_card_filename AS card, sizes_hero_filename AS hero
    FROM media WHERE mime_type LIKE 'image/%'
    ${deletingId === undefined ? sql`ORDER BY created_at, id` : sql`AND id = ${deletingId} FOR UPDATE`}
  `)).rows as ImageRow[];
  if (!rows.length) return [];
  const byId = new Map(rows.map(row => [row.id, new Set<string>()]));
  const filenames = new Map<string, number>();
  for (const row of rows) {
    for (const name of [row.filename, row.thumbnail, row.card, row.hero]) if (name) filenames.set(name.normalize("NFC"), row.id);
  }
  const add = (id: unknown, source: string) => {
    const found = byId.get(Number(id));
    if (found) found.add(sourceLabel(source));
  };

  // Discover actual upload relationships, including block tables, locales and version tables.
  const foreignKeys = (await db.execute(sql`
    SELECT t.relname AS source, a.attname AS field FROM pg_constraint fk
    JOIN pg_class t ON t.oid = fk.conrelid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = fk.conkey[1]
    WHERE fk.contype = 'f' AND fk.confrelid = 'media'::regclass
      AND t.relnamespace = (SELECT relnamespace FROM pg_class WHERE oid = 'media'::regclass)
      AND t.relname NOT IN ('media_locales', 'payload_locked_documents_rels')
  `)).rows as Column[];
  const selects = foreignKeys.map(({ source, field }) => {
    const column = sql.identifier(field);
    return sql`SELECT DISTINCT ${source}::text AS source, ${column} AS id FROM ${sql.identifier(source)}
      WHERE ${deletingId === undefined ? sql`${column} IS NOT NULL` : sql`${column} = ${deletingId}`}`;
  });
  if (selects.length) {
    const refs = (await db.execute(sql.join(selects, sql` UNION ALL `))).rows;
    for (const ref of refs) add(ref.id, String(ref.source));
  }

  // Lexical uploads are JSON, and editors can paste file URLs into ordinary text fields.
  const columns = (await db.execute(sql`
    SELECT table_name AS source, column_name AS field FROM information_schema.columns
    WHERE table_schema = current_schema() AND data_type IN ('json','jsonb','text','character varying')
      AND table_name NOT IN ('media','media_locales','users') AND left(table_name,8) <> 'payload_'
    ORDER BY table_name, ordinal_position
  `)).rows as Column[];
  const grouped = new Map<string, string[]>();
  for (const { source, field } of columns) {
    if (!grouped.has(source)) grouped.set(source, []);
    grouped.get(source)!.push(field);
  }
  function inspect(value: unknown, source: string) {
    if (typeof value === "string") {
      if (!/media/i.test(value)) return;
      const url = decodeReference(decodeReference(value)).normalize("NFC");
      for (const match of url.matchAll(/\/api\/media\/(\d+)(?=[/?#\s"'<>)]|$)/gi)) add(match[1], source);
      for (const match of url.matchAll(/\/(?:api\/media\/file|media)\//gi)) {
        const tail = url.slice(match.index! + match[0].length);
        for (const [name, id] of filenames) {
          if (tail.startsWith(name) && (!tail[name.length] || /[\s?#"'<>),;&\]]/.test(tail[name.length]))) add(id, source);
        }
      }
    } else if (value && typeof value === "object") {
      const node = value as Record<string, unknown>;
      if (node.relationTo === "media") {
        const relation = node.value as { id?: unknown } | number | string | null;
        add(typeof relation === "object" ? relation?.id : relation, source);
      }
      for (const child of Object.values(node)) inspect(child, source);
    }
  }
  // Only transfer cells that can contain a media reference, never whole content tables.
  for (const [source, fields] of grouped) {
    const values = fields.map(field => sql`(to_jsonb(t.${sql.identifier(field)}))`);
    const matches = await db.execute(sql`
      SELECT DISTINCT cell FROM ${sql.identifier(source)} t
      CROSS JOIN LATERAL (VALUES ${sql.join(values, sql`, `)}) v(cell)
      WHERE cell::text ~* '(/|%2f|%252f)media(/|%2f|%252f)|"relationTo"[[:space:]]*:[[:space:]]*"media"'
    `);
    for (const { cell } of matches.rows) inspect(cell, source);
  }

  return rows.map(row => {
    const sources = [...byId.get(row.id)!];
    const status: Status = sources.length === 0 ? "unused" :
      sources.every(source => source === "Taslak ve sürüm geçmişi") ? "history" : "current";
    return { id: row.id, filename: row.filename, thumbnail: row.thumbnail || row.filename, bytes: Number(row.filesize || 0),
      createdAt: row.created_at, status, sources };
  });
}

export async function preventUsedImageDeletion({ id, req }: { id: string | number; req: PayloadRequest }) {
  const [image] = await scanImages(req, id);
  if (image && image.status !== "unused") {
    throw new APIError(`Görsel silinmedi. Kullanıldığı yerler: ${image.sources.join(", ")}.`, 409);
  }
}