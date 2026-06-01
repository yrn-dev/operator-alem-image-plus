import { API_ENDPOINT, PROVIDER_ID, SETUP_URL, getAuthPath, loadStoredKey, maskKey, parseArgs } from "./common.mjs";

const args = parseArgs(process.argv.slice(2));
const apiKey = loadStoredKey();
const payload = {
  providerId: PROVIDER_ID,
  hasApiKey: Boolean(apiKey),
  needsSetup: !apiKey,
  maskedKey: maskKey(apiKey),
  authPath: getAuthPath(),
  setupUrl: SETUP_URL,
  endpoint: API_ENDPOINT,
  message: apiKey
    ? "Alem image API key is configured."
    : "Alem image API key is missing. Ask the user to get one from the setupUrl and paste it.",
};

if (args["require-key"] && !apiKey) {
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(payload, null, 2));
