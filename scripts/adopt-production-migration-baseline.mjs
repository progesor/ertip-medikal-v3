import process from "node:process";
import pg from "pg";

const { Client } = pg;

const BASELINE_NAME = "20260727_101107_production_baseline";
const CONFIRMATION_ENV = "MIGRATION_BASELINE_ADOPT";
const LOCK_KEY = "ertip-medikal-v3:production-migration-baseline";

// These fields remain present before and after M10 localization. The baseline
// adoption helper is intentionally schema-aware rather than migration-aware:
// it must recognize an existing pre-M10 production database as well as a fully
// migrated M10 database used by CI's production-history simulation.
const COMMON_REQUIRED_SCHEMA = {
  users: ["id", "role", "email", "created_at", "updated_at"],
  media: ["id", "filename", "mime_type", "created_at", "updated_at"],
  products: ["id", "_status", "created_at", "updated_at"],
  categories: ["id", "created_at", "updated_at"],
  inquiries: ["id", "status", "name", "email", "message"],
  news: ["id", "_status"],
  pages: ["id", "_status"],
  news_categories: ["id"],
  quote_requests: ["id", "customer_name", "email", "phone", "status"],
  download_logs: ["id", "document_name", "access_code", "ip_address"],
  subscribers: ["id", "email", "status", "source"],
  site_settings: ["id", "general_site_logo_id"],
  main_menu: ["id", "created_at", "updated_at"],
  email_settings: ["id", "created_at", "updated_at"],
  theme_settings: ["id", "color_palette", "border_radius"],
};

const LEGACY_EDITORIAL_SCHEMA = {
  products: ["title", "description", "slug"],
  categories: ["title", "slug"],
  news: ["title", "content", "slug"],
  pages: ["title", "slug"],
  news_categories: ["title", "slug"],
  site_settings: ["footer_copyright"],
};

const LOCALIZED_EDITORIAL_SCHEMA = {
  products_locales: ["_parent_id", "_locale", "title", "description", "slug"],
  categories_locales: ["_parent_id", "_locale", "title", "slug"],
  news_locales: ["_parent_id", "_locale", "title", "content", "slug"],
  pages_locales: ["_parent_id", "_locale", "title", "slug"],
  news_categories_locales: ["_parent_id", "_locale", "title", "slug"],
  site_settings_locales: ["_parent_id", "_locale", "footer_copyright"],
};

const ALL_SCHEMA_TABLES = [
  ...new Set([
    ...Object.keys(COMMON_REQUIRED_SCHEMA),
    ...Object.keys(LEGACY_EDITORIAL_SCHEMA),
    ...Object.keys(LOCALIZED_EDITORIAL_SCHEMA),
  ]),
];

function fail(message) {
  throw new Error(message);
}

function getDatabaseUri() {
  const value = process.env.DATABASE_URI?.trim();
  if (!value) fail("DATABASE_URI is required.");
  return value;
}

async function getSchemaColumns(client) {
  const result = await client.query(
    `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ANY($1::text[])
    `,
    [ALL_SCHEMA_TABLES],
  );

  const columnsByTable = new Map();
  for (const row of result.rows) {
    const columns = columnsByTable.get(row.table_name) ?? new Set();
    columns.add(row.column_name);
    columnsByTable.set(row.table_name, columns);
  }
  return columnsByTable;
}

function collectSchemaProblems(columnsByTable, requiredSchema) {
  const problems = [];

  for (const [table, requiredColumns] of Object.entries(requiredSchema)) {
    const actualColumns = columnsByTable.get(table);
    if (!actualColumns) {
      problems.push(`missing table: public.${table}`);
      continue;
    }

    for (const column of requiredColumns) {
      if (!actualColumns.has(column)) {
        problems.push(`missing column: public.${table}.${column}`);
      }
    }
  }

  return problems;
}

async function verifyPayloadSchema(client) {
  const columnsByTable = await getSchemaColumns(client);
  const commonProblems = collectSchemaProblems(
    columnsByTable,
    COMMON_REQUIRED_SCHEMA,
  );

  // Presence of products_locales is the M10 boundary. A partially-created
  // localization schema must not be mistaken for a valid legacy database.
  const isLocalizedSchema = columnsByTable.has("products_locales");
  const editorialProblems = collectSchemaProblems(
    columnsByTable,
    isLocalizedSchema ? LOCALIZED_EDITORIAL_SCHEMA : LEGACY_EDITORIAL_SCHEMA,
  );

  const problems = [...commonProblems, ...editorialProblems];

  if (isLocalizedSchema) {
    const localeEnum = await client.query(`
      SELECT enumlabel
      FROM pg_type
      JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid
      JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
      WHERE pg_namespace.nspname = 'public'
        AND pg_type.typname = '_locales'
      ORDER BY enumsortorder
    `);
    const localeValues = localeEnum.rows.map((row) => row.enumlabel);
    if (localeValues.join(",") !== "tr,en") {
      problems.push(
        `unexpected _locales values: ${localeValues.join(",") || "<missing>"}`,
      );
    }
  }

  const roleEnum = await client.query(`
    SELECT enumlabel
    FROM pg_type
    JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid
    JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
    WHERE pg_namespace.nspname = 'public'
      AND pg_type.typname = 'enum_users_role'
    ORDER BY enumsortorder
  `);
  const roleValues = roleEnum.rows.map((row) => row.enumlabel);
  if (roleValues.join(",") !== "admin,editor") {
    problems.push(
      `unexpected enum_users_role values: ${roleValues.join(",") || "<missing>"}`,
    );
  }

  if (problems.length > 0) {
    fail(
      `The connected database does not match the expected Ertip Medikal ${
        isLocalizedSchema ? "localized" : "legacy"
      } schema:\n- ${problems.join("\n- ")}`,
    );
  }

  return isLocalizedSchema ? "localized" : "legacy";
}

async function ensureMigrationTable(client, apply) {
  const result = await client.query(`
    SELECT to_regclass('public.payload_migrations') AS table_name
  `);

  if (result.rows[0]?.table_name) return;
  if (!apply) {
    fail(
      "public.payload_migrations is missing. Re-run with --apply after taking a database backup to create only the migration-history table.",
    );
  }

  await client.query(`
    CREATE TABLE "payload_migrations" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar,
      "batch" numeric,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )
  `);
  await client.query(`
    CREATE INDEX "payload_migrations_updated_at_idx"
      ON "payload_migrations" USING btree ("updated_at")
  `);
  await client.query(`
    CREATE INDEX "payload_migrations_created_at_idx"
      ON "payload_migrations" USING btree ("created_at")
  `);
}

async function readMigrationHistory(client) {
  const result = await client.query(`
    SELECT id, name, batch, created_at
    FROM payload_migrations
    ORDER BY id ASC
  `);
  return result.rows;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const check = process.argv.includes("--check") || !apply;

  if (apply && process.env[CONFIRMATION_ENV] !== BASELINE_NAME) {
    fail(
      `Refusing to modify migration history. Set ${CONFIRMATION_ENV}=${BASELINE_NAME} for this one command only.`,
    );
  }

  const client = new Client({ connectionString: getDatabaseUri() });
  await client.connect();

  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [LOCK_KEY]);

    const schemaVariant = await verifyPayloadSchema(client);
    await ensureMigrationTable(client, apply);

    const history = await readMigrationHistory(client);
    const baselineExists = history.some((row) => row.name === BASELINE_NAME);
    const productionHistory = history.filter(
      (row) => Number(row.batch) >= 0 && row.name !== BASELINE_NAME,
    );
    const devHistory = history.filter((row) => Number(row.batch) === -1);

    if (productionHistory.length > 0) {
      fail(
        `Unexpected non-development migration history already exists: ${productionHistory
          .map((row) => `${row.name} (batch ${row.batch})`)
          .join(", ")}. Review it manually before adopting this baseline.`,
      );
    }

    if (baselineExists) {
      await client.query("COMMIT");
      console.log(`Baseline already adopted: ${BASELINE_NAME}`);
      return;
    }

    if (check) {
      await client.query("ROLLBACK");
      console.log(`Production ${schemaVariant} schema check passed.`);
      console.log(`Baseline ready to adopt: ${BASELINE_NAME}`);
      console.log(`Development migration markers found: ${devHistory.length}`);
      console.log(
        `After taking a database backup, run: ${CONFIRMATION_ENV}=${BASELINE_NAME} pnpm db:baseline:adopt`,
      );
      return;
    }

    if (devHistory.length > 0) {
      await client.query("DELETE FROM payload_migrations WHERE batch = -1");
    }

    await client.query(
      `INSERT INTO payload_migrations (name, batch, created_at, updated_at)
       VALUES ($1, 1, now(), now())`,
      [BASELINE_NAME],
    );

    await client.query("COMMIT");
    console.log(`Adopted migration baseline: ${BASELINE_NAME}`);
    console.log(`Validated schema variant: ${schemaVariant}`);
    console.log(`Removed development migration markers: ${devHistory.length}`);
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Preserve the original failure.
    }
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});