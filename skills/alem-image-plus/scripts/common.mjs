import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

export const PROVIDER_ID = "alem-image-plus-imagegen";
export const SETUP_URL = "https://plus.alem.ai/services/text-to-image";
export const API_ENDPOINT = "https://llm.alem.ai/v1/images/generations";

export function getAgentDir() {
  const envDir = process.env.OPERATOR_CODING_AGENT_DIR;
  if (envDir) {
    if (envDir === "~") return homedir();
    if (envDir.startsWith("~/")) return join(homedir(), envDir.slice(2));
    return envDir;
  }
  return join(homedir(), ".operator", "agent");
}

export function getAuthPath() {
  return join(getAgentDir(), "auth.json");
}

export function ensureParentDir(filePath) {
  const parent = dirname(filePath);
  if (!existsSync(parent)) {
    mkdirSync(parent, { recursive: true, mode: 0o700 });
  }
}

export function readJson(filePath, fallback = {}) {
  if (!existsSync(filePath)) {
    return fallback;
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function writeJsonSecure(filePath, value) {
  ensureParentDir(filePath);
  writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
  chmodSync(filePath, 0o600);
}

export function loadStoredKey() {
  const authPath = getAuthPath();
  const auth = readJson(authPath, {});
  const entry = auth[PROVIDER_ID];
  if (entry?.type === "api_key" && typeof entry.key === "string" && entry.key.trim()) {
    return entry.key.trim();
  }
  return undefined;
}

export function saveStoredKey(apiKey) {
  const authPath = getAuthPath();
  const auth = readJson(authPath, {});
  auth[PROVIDER_ID] = {
    type: "api_key",
    key: apiKey.trim(),
  };
  writeJsonSecure(authPath, auth);
  return authPath;
}

export function maskKey(apiKey) {
  if (!apiKey) return null;
  if (apiKey.length <= 8) return "****";
  return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
}

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

export function requireApiKey(candidate) {
  const apiKey = (candidate ?? loadStoredKey() ?? "").trim();
  if (!apiKey) {
    const error = new Error(
      `Alem image API key is missing. Get it at ${SETUP_URL} and save it with configure.mjs.`,
    );
    error.code = "MISSING_API_KEY";
    throw error;
  }
  return apiKey;
}

export function resolveOutputPath(outputArg) {
  if (outputArg) {
    return resolve(outputArg);
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return resolve(process.cwd(), "generated", `alem-image-${timestamp}.png`);
}

export function ensureFileParent(filePath) {
  ensureParentDir(filePath);
}
