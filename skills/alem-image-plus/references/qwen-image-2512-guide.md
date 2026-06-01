# Qwen-Image-2512 prompting guide

This guide is tuned for the behavior shown on the Hugging Face `Qwen/Qwen-Image-2512` page and the examples the user supplied.

## What the model appears good at

- better human realism than older Qwen image variants
- stronger fine detail on hair, skin, background props, and materials
- better semantic obedience when the prompt clearly specifies pose, layout, or object relationships
- strong text-in-image and infographic-style rendering when the layout is described explicitly
- multi-panel comparison graphics and timelines when every panel is spelled out

## What the model is weak at

- vague prompts
- keyword soup
- exact identity preservation from a source face
- "same person, same face, just change X" expectations
- underspecified poster layouts with many labels but weak structure

## Best prompting pattern

Use this order:

1. image type and style target
2. main subject
3. composition or camera framing
4. lighting
5. materials and texture details
6. background environment
7. exact visible text and placement if needed
8. quality cues

## Good prompt skeleton

```text
A [style target] image of [main subject]. The composition is [framing / camera view / layout].
Lighting is [lighting]. The subject has [appearance details]. Clothing/materials are [details].
The background shows [environment objects]. The overall mood is [mood].
High detail in [hair / skin / objects / typography], clean edges, coherent anatomy, realistic textures.
```

## Human realism prompts

For portraits or lifestyle scenes, explicitly include:

- age range
- face shape
- eye expression
- hair length and texture
- skin texture or makeup level
- pose
- clothing
- environment props
- camera feel

Example structure:

```text
A photorealistic indoor portrait of a 22-year-old woman with soft oval facial features, natural skin texture,
slightly tousled shoulder-length black hair, calm bright eyes, and a subtle half-smile. She is standing in a
student dorm room with a neatly made upper bunk, a wooden desk, books, and stationery visible in the background.
Shot like a casual smartphone photo with soft ambient daylight, natural color tones, realistic hair strands,
clear background objects, and high facial detail.
```

## Text-heavy graphic prompts

This model does better when the graphic is described like a layout spec, not like loose marketing fluff.

Rules:

- specify canvas mood and background first
- specify panel count and arrangement
- for each panel, specify icon/image, exact text, and marker colors
- say where warnings, checkmarks, arrows, or labels sit
- if the language matters, keep the exact user text unchanged

Example pattern:

```text
Create a clean modern infographic on a dark blue industrial-tech background. The layout is split into two large
vertical panels. The left panel title is "Actual Issues" inside a blue rounded rectangle. It contains three stacked
rows with icons, labels, and green check marks...
```

## Grid / storyboard prompts

For multi-frame outputs:

- state the exact number of cells
- describe each cell in order
- specify whether there are captions
- specify whether the person should look like the same approximate character across all cells

Use "same approximate person" rather than "exact same face".

## Identity limitation guidance

If the user wants:

- exact same face from a reference image
- strict consistency across many outputs
- editing one uploaded image while preserving identity

do not promise it. Say:

- this workflow is text-to-image only
- likeness can be approximated by description
- exact identity lock is unreliable here

## Operator-side cleanup policy

When the user's request is messy:

- convert it into one polished prompt
- remove contradictory style words
- keep only the strongest composition instructions
- turn bullet chaos into one coherent paragraph
- preserve exact text strings for posters or infographics

## Practical defaults

- square: `1024x1024`
- wide: `1536x1024`
- vertical: `1024x1536`
- draft: `512x512`
