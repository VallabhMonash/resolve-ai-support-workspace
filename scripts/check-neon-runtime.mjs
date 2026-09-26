import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const databaseUrl = new URL(connectionString);
const pooledConnection = databaseUrl.hostname.includes("-pooler.");

if (!pooledConnection) {
  throw new Error("DATABASE_URL must use Neon's pooled endpoint");
}

const pool = new Pool({
  connectionString,
  max: 1,
  connectionTimeoutMillis: 15_000,
  idleTimeoutMillis: 5_000,
});

const startedAt = performance.now();
let client;

try {
  const connectionStartedAt = performance.now();
  client = await pool.connect();
  const connectionMs = performance.now() - connectionStartedAt;

  const identityResult = await client.query(`
    SELECT
      current_database() AS database_name,
      current_setting('server_version') AS postgres_version
  `);

  const extensionResult = await client.query(`
    SELECT extversion
    FROM pg_extension
    WHERE extname = 'vector'
  `);

  if (extensionResult.rowCount !== 1) {
    throw new Error("The pgvector extension is not enabled");
  }

  const sampleVector = `[${[
    "1",
    ...Array.from({ length: 767 }, () => "0"),
  ].join(",")}]`;

  await client.query("BEGIN");

  await client.query(`
    CREATE TEMPORARY TABLE resolve_vector_compatibility (
      id integer PRIMARY KEY,
      embedding vector(768) NOT NULL
    ) ON COMMIT DROP
  `);

  await client.query(
    `
      INSERT INTO resolve_vector_compatibility (id, embedding)
      VALUES ($1, $2::vector)
    `,
    [1, sampleVector],
  );

  const vectorResult = await client.query(`
    SELECT vector_dims(embedding) AS dimensions
    FROM resolve_vector_compatibility
    WHERE id = 1
  `);

  await client.query("COMMIT");

  const database = drizzle(client);

  const drizzleResult = await database.execute(sql`
    SELECT 1::integer AS value
  `);

  console.log(
    JSON.stringify(
      {
        provider: "Neon",
        pooledConnection,
        database: identityResult.rows[0],
        pgvector: {
          version: extensionResult.rows[0].extversion,
          storedDimensions: vectorResult.rows[0].dimensions,
        },
        drizzle: {
          queryValue: drizzleResult.rows[0].value,
        },
        connectionMs: Number(connectionMs.toFixed(2)),
        totalMs: Number((performance.now() - startedAt).toFixed(2)),
        compatibilityPassed: true,
      },
      null,
      2,
    ),
  );
} catch (error) {
  if (client) {
    await client.query("ROLLBACK").catch(() => {});
  }

  throw error;
} finally {
  client?.release();
  await pool.end();
}
