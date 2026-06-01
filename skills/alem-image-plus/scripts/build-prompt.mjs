import { parseArgs } from "./common.mjs";

const TYPE_HINTS = {
  general:
    "Build one coherent image-generation prompt with clear subject, composition, lighting, texture, background, and quality cues.",
  portrait:
    "Prioritize photorealistic human detail, face, hair, skin texture, expression, pose, clothing, environment props, and camera feel.",
  product:
    "Prioritize product framing, material detail, reflections, background cleanliness, lighting direction, and premium commercial presentation.",
  poster:
    "Prioritize layout hierarchy, exact visible text, typography placement, colors, composition, and poster readability.",
  infographic:
    "Prioritize panel layout, exact labels, icons, arrows, card arrangement, and structured visual explanation.",
  storyboard:
    "Prioritize exact frame count, per-frame descriptions, continuity of approximate character appearance, captions, and cinematic flow.",
  "ui-mockup":
    "Prioritize interface layout, sections, cards, spacing, typography hierarchy, labels, states, and product-like screen composition.",
};

const BASE_RULES = [
  "Turn the request into a single production-ready prompt for a text-to-image model.",
  "Do not produce keyword soup.",
  "Resolve obvious contradictions by keeping the most realistic, most concrete instruction.",
  "Preserve exact quoted text and important labels exactly as the user gave them.",
  "Add missing quality cues only when they help realism or layout clarity.",
  "Do not promise exact identity preservation from a reference image.",
  "Output JSON only.",
];

const FIELDS_BY_TYPE = {
  general: ["subject", "composition", "lighting", "details", "background", "quality"],
  portrait: [
    "subject",
    "age_range",
    "face",
    "hair",
    "expression",
    "pose",
    "clothing",
    "environment",
    "camera_feel",
    "lighting",
    "quality",
  ],
  product: [
    "product",
    "materials",
    "composition",
    "background",
    "lighting",
    "branding_text",
    "quality",
  ],
  poster: [
    "poster_goal",
    "main_title",
    "supporting_text",
    "layout",
    "color_direction",
    "visual_subject",
    "quality",
  ],
  infographic: [
    "topic",
    "panel_count",
    "panel_structure",
    "exact_labels",
    "icons_or_images",
    "background_style",
    "quality",
  ],
  storyboard: [
    "frame_count",
    "character",
    "frame_descriptions",
    "captions",
    "visual_continuity",
    "lighting",
    "quality",
  ],
  "ui-mockup": [
    "product_type",
    "screen_layout",
    "sections",
    "labels",
    "visual_style",
    "device_context",
    "quality",
  ],
};

function titleCaseType(type) {
  return type
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getSchema(type) {
  const fields = FIELDS_BY_TYPE[type] ?? FIELDS_BY_TYPE.general;
  return {
    type,
    expected_json_shape: {
      inferred_type: type,
      missing_details: ["Only include truly missing, high-impact details."],
      cleaned_request: "Short cleaned summary of the user's raw request.",
      production_prompt: "Final prompt string ready for the image API.",
      notes: ["Brief limitations or warnings, especially identity-preservation limits."],
      structured_fields: Object.fromEntries(fields.map((field) => [field, "string"])),
    },
  };
}

function buildMetaPrompt(type, request) {
  const normalizedType = TYPE_HINTS[type] ? type : "general";
  const schema = getSchema(normalizedType);
  const rules = BASE_RULES.map((rule) => `- ${rule}`).join("\n");
  const fieldNames = Object.keys(schema.expected_json_shape.structured_fields)
    .map((field) => `- ${field}`)
    .join("\n");

  return [
    `You are building a production prompt for ${titleCaseType(normalizedType)} image generation.`,
    "",
    "Goal:",
    TYPE_HINTS[normalizedType],
    "",
    "Rules:",
    rules,
    "",
    "Structured fields to infer when possible:",
    fieldNames,
    "",
    "User request:",
    request,
    "",
    "Return JSON with this shape:",
    JSON.stringify(schema.expected_json_shape, null, 2),
  ].join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const type = typeof args.type === "string" ? args.type : "general";
  const request = typeof args.request === "string" ? args.request.trim() : "";

  if (!request) {
    console.error("Missing --request");
    process.exit(1);
  }

  const metaPrompt = buildMetaPrompt(type, request);
  const payload = {
    ok: true,
    type: TYPE_HINTS[type] ? type : "general",
    request,
    metaPrompt,
    usage: [
      "Send metaPrompt to Operator or another reasoning model.",
      "Parse the returned JSON.",
      "Use production_prompt as the final prompt for generate.mjs.",
    ],
  };

  console.log(JSON.stringify(payload, null, 2));
}

main();
