import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createSchema, createYoga } from "graphql-yoga";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import pg from "pg";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);

const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      compatibility: String!
    }
  `,
  resolvers: {
    Query: {
      compatibility: () => "Node 24 + GraphQL Yoga",
    },
  },
});

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  graphiql: false,
});

const response = await yoga.fetch("http://localhost/api/graphql", {
  method: "POST",
  headers: {
    "content-type": "application/json",
  },
  body: JSON.stringify({
    query: "{ compatibility }",
  }),
});

const result = await response.json();

assert.equal(response.status, 200);
assert.deepEqual(result, {
  data: {
    compatibility: "Node 24 + GraphQL Yoga",
  },
});

const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey(),
  workspaceId: uuid("workspace_id").notNull(),
  subject: text("subject").notNull(),
});

const pool = new pg.Pool({
  connectionString: "postgresql://compat:compat@127.0.0.1:1/compat",
  connectionTimeoutMillis: 50,
});

const database = drizzle(pool);

const workspaceId = "11111111-1111-4111-8111-111111111111";

const generatedQuery = database
  .select({
    id: tickets.id,
    subject: tickets.subject,
  })
  .from(tickets)
  .where(eq(tickets.workspaceId, workspaceId))
  .toSQL();

assert.match(generatedQuery.sql, /workspace_id/);
assert.deepEqual(generatedQuery.params, [workspaceId]);

await pool.end();

console.log(
  JSON.stringify(
    {
      node: process.version,
      dependencies: {
        graphqlYoga: packageJson.dependencies["graphql-yoga"],
        graphql: packageJson.dependencies.graphql,
        drizzleOrm: packageJson.dependencies["drizzle-orm"],
        pg: packageJson.dependencies.pg,
      },
      graphql: {
        status: response.status,
        result,
      },
      drizzle: {
        generatedSql: generatedQuery.sql,
        parameters: generatedQuery.params,
        workspaceFilterPresent: true,
      },
      databaseConnectionAttempted: false,
      compatibilityPassed: true,
    },
    null,
    2,
  ),
);
