---
name: alem-image-plus
description: Use this skill when the user wants to generate images, posters, portraits, product shots, storyboards, grids, infographics, or text-in-image assets with Alem AI Plus text-to-image. Also use it when the user needs first-run API key setup for the Alem image endpoint, prompt cleanup for Qwen-Image-2512, cleaner scene descriptions, exact embedded text/layout prompting, or high-quality image output from messy requests. Do not use this skill for true face-locking, exact identity preservation from a reference photo, or image editing workflows that require keeping the same person unchanged across generations; explain that limitation and offer an approximate recreation instead.
---

# Alem AI Plus image generation

This skill wraps the Alem AI Plus image endpoint with a clean local workflow for Operator.

## First-run flow

1. Check whether the API key already exists:

```bash
node scripts/status.mjs --require-key
```

2. If the key is missing, ask the user for their Alem AI Plus image key and show this link:

`https://plus.alem.ai/services/text-to-image`

3. After the user provides the key, save it:

```bash
node scripts/configure.mjs --api-key 'sk-...'
```

Never print the full stored key back to the user.

## Core workflow

1. Rewrite the user's messy request into one clean production prompt.
   - Prefer the helper script for this:

```bash
node scripts/build-prompt.mjs \
  --type portrait \
  --request "make a realistic girl in a dorm room like iphone photo"
```

2. If the request is underspecified, only ask for the missing high-impact details:
   - aspect ratio or orientation
   - style target
   - exact text that must appear in the image
   - number of panels/cards/frames if it is a layout image
3. Use the prompt rules in `references/qwen-image-2512-guide.md`.
4. Save the prompt into a temp file if it is long or contains quotes/newlines.
5. Generate:

```bash
node scripts/generate.mjs \
  --prompt-file /tmp/alem-image-prompt.txt \
  --size 1024x1024
```

6. Return:
   - where the image was saved
   - the cleaned final prompt
   - any important limitation, especially if the user asked for exact identity preservation

## Prompting rules for this model

- Prefer one coherent prompt over keyword soup.
- Specify subject, scene, framing, lighting, materials, mood, and background in one structured description.
- For human realism, explicitly describe face, hair, skin texture, expression, pose, clothing, and surrounding objects.
- For text-heavy graphics, write the exact visible text and describe where each label belongs.
- For comparison cards, timelines, grids, or dashboards, state the layout and every panel explicitly.
- If the user wants a photo-like result, ask for or infer:
  - camera feel
  - lighting
  - lens/framing
  - texture detail
  - environment objects
- Do not promise exact face carry-over from an input image. This skill is text-to-image, not identity-preserving editing.

Read `references/qwen-image-2512-guide.md` before building a difficult prompt.

## Default generation settings

- Default model: `text-to-image`
- Default size: `1024x1024`
- Use `1536x1024` for landscape scenes if the user asks for wide framing
- Use `1024x1536` for portrait posters or vertical human shots
- Use `512x512` only for cheap drafts or quick validation

## Useful commands

Check status:

```bash
node scripts/status.mjs
```

Save or replace key:

```bash
node scripts/configure.mjs --api-key 'sk-...'
```

Generate from inline prompt:

```bash
node scripts/generate.mjs \
  --prompt "A photorealistic..."
```

Build a production prompt first:

```bash
node scripts/build-prompt.mjs \
  --type poster \
  --request "poster about robotics club with neon title and schedule"
```

Generate from stdin:

```bash
cat /tmp/alem-image-prompt.txt | node scripts/generate.mjs --prompt-stdin
```

## When to warn the user

- They ask for exact same face from a reference photo.
- They ask for consistent character identity across many generations.
- They provide a vague prompt but expect premium realism.
- They need image editing, inpainting, or face-preserving transformations instead of new generation.

In those cases, explain the limitation, then offer the closest text-to-image alternative.

## Prompt builder types

The helper supports:

- `general`
- `portrait`
- `product`
- `poster`
- `infographic`
- `storyboard`
- `ui-mockup`

Use the closest type before generation when the user gives a short or messy request.
