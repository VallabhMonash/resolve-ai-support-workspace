import { readFile } from "node:fs/promises";
import { Tokenizer } from "@huggingface/tokenizers";

const assetDirectory = new URL(
  "../assets/tokenizers/qwen3-4b-instruct-2507/",
  import.meta.url,
);

const [tokenizerJsonText, tokenizerConfigText] = await Promise.all([
  readFile(new URL("tokenizer.json", assetDirectory), "utf8"),
  readFile(new URL("tokenizer_config.json", assetDirectory), "utf8"),
]);

const tokenizer = new Tokenizer(
  JSON.parse(tokenizerJsonText),
  JSON.parse(tokenizerConfigText),
);

const input = "CSV order import fails with an invalid UTF-8 error.";
const encoded = tokenizer.encode(input);
const decoded = tokenizer.decode(encoded.ids);

if (encoded.ids.length === 0) {
  throw new Error("Tokenizer returned no token IDs.");
}

if (!encoded.ids.every(Number.isInteger)) {
  throw new Error("Tokenizer returned a non-integer token ID.");
}

if (decoded !== input) {
  throw new Error(
    `Decoded text did not match the input.\nExpected: ${input}\nReceived: ${decoded}`,
  );
}

console.log(
  JSON.stringify(
    {
      input,
      tokenCount: encoded.ids.length,
      tokenIds: encoded.ids,
      tokens: encoded.tokens,
      decoded,
      roundTripPassed: true,
    },
    null,
    2,
  ),
);
