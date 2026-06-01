# Alem AI Plus image API

Validated against:

- setup page: `https://plus.alem.ai/services/text-to-image`
- endpoint: `https://llm.alem.ai/v1/images/generations`

## Request

OpenAI-compatible image generation shape:

```json
{
  "model": "text-to-image",
  "prompt": "A futuristic city in the mountains at sunrise",
  "size": "1024x1024"
}
```

Headers:

- `Authorization: Bearer <API_KEY>`
- `Content-Type: application/json`

## Observed success response

The endpoint returned:

- top-level `created`
- `data[0].b64_json`
- `data[0].revised_prompt`
- `data[0].url`

Current observed behavior:

- image payload came back in `b64_json`
- `url` was `null`
- `revised_prompt` was `null`

The generator script therefore:

- prefers `b64_json`
- falls back to `url` if it ever appears later
- writes a `.png` file locally

## Auth notes

- malformed or missing auth returns an auth error
- the endpoint expects a normal `Bearer sk-...` header

## Safe defaults

- `model`: `text-to-image`
- `size`: `1024x1024`

Use smaller sizes only for drafts.
