import { readFile } from "node:fs/promises";
import { Tokenizer } from "@huggingface/tokenizers";
import { createSchema, createYoga } from "graphql-yoga";

const tokenizerDirectory = new URL(
  "../assets/tokenizers/qwen3-4b-instruct-2507/",
  import.meta.url,
);

const tokenizerPromise = Promise.all([
  readFile(new URL("tokenizer.json", tokenizerDirectory), "utf8"),
  readFile(new URL("tokenizer_config.json", tokenizerDirectory), "utf8"),
]).then(
  ([tokenizerJson, tokenizerConfig]) =>
    new Tokenizer(JSON.parse(tokenizerJson), JSON.parse(tokenizerConfig)),
);

const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      compatibility: CompatibilityResult!
    }

    type CompatibilityResult {
      status: String!
      runtime: String!
      tokenizerTokenCount: Int!
    }
  `,
  resolvers: {
    Query: {
      compatibility: async () => {
        const tokenizer = await tokenizerPromise;
        const encoded = tokenizer.encode(
          "CSV order import fails with an invalid UTF-8 error.",
        );

        return {
          status: "ok",
          runtime: `Node ${process.versions.node}`,
          tokenizerTokenCount: encoded.ids.length,
        };
      },
    },
  },
});

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  graphiql: false,
});

export default {
  fetch(request) {
    return yoga.fetch(request);
  },
};
