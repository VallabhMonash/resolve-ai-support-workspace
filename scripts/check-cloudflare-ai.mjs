const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;

if (!accountId || !apiToken) {
  throw new Error(
    "CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required",
  );
}

const structuredModel = "@cf/meta/llama-3.1-8b-instruct";
const toolModel = "@cf/qwen/qwen3-30b-a3b-fp8";
const embeddingModel = "@cf/baai/bge-base-en-v1.5";

async function runModel(model, input) {
  const startedAt = performance.now();

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  const payload = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(
      `Cloudflare request failed for ${model}: ${response.status} ${JSON.stringify(payload.errors)}`,
    );
  }

  return {
    result: payload.result,
    durationMs: Number((performance.now() - startedAt).toFixed(2)),
  };
}

function vectorNorm(vector) {
  return Math.sqrt(
    vector.reduce((total, value) => total + value * value, 0),
  );
}

const totalStartedAt = performance.now();

const structured = await runModel(structuredModel, {
  messages: [
    {
      role: "system",
      content:
        "Classify support tickets. Return only data matching the supplied schema.",
    },
    {
      role: "user",
      content:
        "CSV order import fails with an invalid UTF-8 error. No orders can be imported and there is no workaround.",
    },
  ],
  response_format: {
    type: "json_schema",
    json_schema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["IMPORT_EXPORT", "SYNC", "AUTHENTICATION", "OTHER"],
        },
        priority: {
          type: "string",
          enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
        },
        summary: {
          type: "string",
        },
      },
      required: ["category", "priority", "summary"],
      additionalProperties: false,
    },
  },
  temperature: 0,
  max_tokens: 160,
});

const structuredOutput =
  typeof structured.result.response === "string"
    ? JSON.parse(structured.result.response)
    : structured.result.response;

if (
  structuredOutput?.category !== "IMPORT_EXPORT" ||
  !["HIGH", "URGENT"].includes(structuredOutput?.priority) ||
  typeof structuredOutput?.summary !== "string"
) {
  throw new Error(
    `Structured output did not satisfy the expected contract: ${JSON.stringify(structuredOutput)}`,
  );
}

const tool = await runModel(toolModel, {
  messages: [
    {
      role: "system",
      content:
        "You are a support assistant. When asked to find related cases, call the supplied tool. Do not answer with prose.",
    },
    {
      role: "user",
      content:
        "Find three tickets similar to: CSV order import fails with an invalid UTF-8 error.",
    },
  ],
  tools: [
    {
      name: "findSimilarTickets",
      description: "Find semantically similar historical support tickets.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
          },
          limit: {
            type: "integer",
            minimum: 1,
            maximum: 10,
          },
        },
        required: ["query", "limit"],
      },
    },
  ],
  temperature: 0,
  max_tokens: 512,
});

const toolCalls =
  tool.result.tool_calls ??
  tool.result.choices?.[0]?.message?.tool_calls ??
  [];

if (toolCalls.length === 0) {
  throw new Error(
    `The hosted model did not return a native tool call: ${JSON.stringify(tool.result)}`,
  );
}

const firstToolCall = toolCalls[0];
const toolName = firstToolCall.name ?? firstToolCall.function?.name;
const rawArguments =
  firstToolCall.arguments ?? firstToolCall.function?.arguments;

const toolArguments =
  typeof rawArguments === "string"
    ? JSON.parse(rawArguments)
    : rawArguments;

if (
  toolName !== "findSimilarTickets" ||
  toolArguments?.limit !== 3 ||
  typeof toolArguments?.query !== "string"
) {
  throw new Error(
    `The hosted tool call did not satisfy the contract: ${JSON.stringify(firstToolCall)}`,
  );
}

const embeddings = await runModel(embeddingModel, {
  text: [
    "query: CSV order import fails with an invalid UTF-8 error",
    "document: Orders cannot be imported because the uploaded CSV contains invalid UTF-8 data",
  ],
  pooling: "cls",
});

const vectors = embeddings.result.data;

if (
  !Array.isArray(vectors) ||
  vectors.length !== 2 ||
  vectors.some(
    (vector) =>
      !Array.isArray(vector) ||
      vector.length !== 768 ||
      vector.some((value) => typeof value !== "number"),
  )
) {
  throw new Error("Cloudflare did not return two numeric 768-dimensional vectors");
}

console.log(
  JSON.stringify(
    {
      provider: "Cloudflare Workers AI",
      structuredOutput: {
        model: structuredModel,
        result: structuredOutput,
        durationMs: structured.durationMs,
        passed: true,
      },
      toolCalling: {
        model: toolModel,
        toolName,
        arguments: toolArguments,
        durationMs: tool.durationMs,
        passed: true,
      },
      embeddings: {
        model: embeddingModel,
        vectorCount: vectors.length,
        dimensions: vectors.map((vector) => vector.length),
        allNumeric: true,
        pooling: embeddings.result.pooling,
        norms: vectors.map((vector) =>
          Number(vectorNorm(vector).toFixed(6)),
        ),
        durationMs: embeddings.durationMs,
        passed: true,
      },
      totalMs: Number((performance.now() - totalStartedAt).toFixed(2)),
      compatibilityPassed: true,
    },
    null,
    2,
  ),
);
