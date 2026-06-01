import { readFileSync, writeFileSync } from "node:fs";
import { stdin } from "node:process";
import {
  API_ENDPOINT,
  ensureFileParent,
  parseArgs,
  requireApiKey,
  resolveOutputPath,
} from "./common.mjs";

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    stdin.setEncoding("utf8");
    stdin.on("data", (chunk) => {
      data += chunk;
    });
    stdin.on("end", () => resolve(data));
    stdin.on("error", reject);
  });
}

async function resolvePrompt(args) {
  if (typeof args.prompt === "string" && args.prompt.trim()) {
    return args.prompt.trim();
  }
  if (typeof args["prompt-file"] === "string") {
    return readFileSync(args["prompt-file"], "utf8").trim();
  }
  if (args["prompt-stdin"]) {
    return (await readStdin()).trim();
  }
  throw new Error("Provide --prompt, --prompt-file, or --prompt-stdin");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const prompt = await resolvePrompt(args);
  if (!prompt) {
    throw new Error("Prompt is empty");
  }

  const apiKey = requireApiKey(typeof args["api-key"] === "string" ? args["api-key"] : undefined);
  const model = typeof args.model === "string" ? args.model : "text-to-image";
  const size = typeof args.size === "string" ? args.size : "1024x1024";
  const outputPath = resolveOutputPath(typeof args.output === "string" ? args.output : undefined);

  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      size,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Alem API error ${response.status}`);
  }

  const item = payload?.data?.[0];
  if (!item) {
    throw new Error("Alem API returned no image payload");
  }

  if (item.b64_json) {
    ensureFileParent(outputPath);
    writeFileSync(outputPath, Buffer.from(item.b64_json, "base64"));
  } else if (item.url) {
    const imageResponse = await fetch(item.url);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download generated image: ${imageResponse.status}`);
    }
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    ensureFileParent(outputPath);
    writeFileSync(outputPath, buffer);
  } else {
    throw new Error("Alem API returned neither b64_json nor url");
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        outputPath,
        model,
        size,
        endpoint: API_ENDPOINT,
        prompt,
        revisedPrompt: item.revised_prompt ?? null,
        created: payload.created ?? null,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
