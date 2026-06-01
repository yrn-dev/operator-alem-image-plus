import { parseArgs, saveStoredKey, maskKey, PROVIDER_ID } from "./common.mjs";

const args = parseArgs(process.argv.slice(2));
const apiKey = typeof args["api-key"] === "string" ? args["api-key"].trim() : "";

if (!apiKey) {
  console.error("Missing --api-key");
  process.exit(1);
}

if (!apiKey.startsWith("sk-")) {
  console.error("API key must start with sk-");
  process.exit(1);
}

const authPath = saveStoredKey(apiKey);
console.log(
  JSON.stringify(
    {
      ok: true,
      providerId: PROVIDER_ID,
      authPath,
      maskedKey: maskKey(apiKey),
    },
    null,
    2,
  ),
);
