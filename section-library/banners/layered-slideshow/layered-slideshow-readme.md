---
schema_version: 1
document_type: family
id: banners.layered-slideshow
group: banners
family: layered-slideshow
variant: layered-slideshow
status: ready
summary: A slideshow family with overlapping media and content layers stacked along the Z-axis.
tags:
  - banners
  - layered-slideshow
  - multi-layer
  - section-family
---

# Layered Slideshow

A slideshow family featuring overlapping visual depth planes and editorial storytelling.

## Purpose

Create depth, atmosphere, and visual hierarchy by staging an atmospheric background layer, an elevated primary focal media card, an offset accent detail layer, and high-contrast editorial messaging.

## Physical composition

A fixed stage where slides, captions, and decorative layers overlap with controlled depth. Each slide integrates four discrete planes:

1. **Atmospheric Background:** Soft tone or full-bleed ambient lifestyle backdrop.
2. **Primary Focal Media:** Elevated hero product layer with smooth parallax entry.
3. **Offset Accent Layer:** Secondary context detail card (detail crop, swatch, or badge).
4. **Editorial Copy Plane:** Prominent serif heading, supporting copy, and dual pill action buttons.

## Psychology

Layered compositions provide dimensional cues that mimic tactile physical magazine layouts. The deliberate overlap draws the eye from the overarching mood (background) to the specific object of desire (focal product) and its craftsmanship details (accent card).

## Best used when

- Presenting curated seasonal campaigns or lookbooks where depth and texture convey brand value.
- Storytelling requires both high-level atmosphere and tangible product detail in a single visual field.

**Decision rule:** Best used when a small curated sequence gains meaning from visual layering; not when slides require flat data tables or independent before-and-after comparison.

## Avoid when

- Direct pixel-level before-and-after comparison is needed (use `image-compare` instead).
- Content is simple, flat promotional messaging where a single banner suffices.

## Good usage

A merchant showcases a seasonal outerwear collection: an ambient alpine background, an elevated studio model card in the foreground, an overlapping swatch card showing shearling lining, and a clear "Shop collection" button.

## Bad usage

Using this section as a split image comparison slider. Use the dedicated `image-compare` section for before/after comparison.

## Content requirements

- **Required:** A clear primary message and focal media for each slide.
- **Recommended:** An offset accent crop/swatch and up to two conversion actions.
- **Unsupported:** Dense tabular data or overcrowded unaligned imagery.

## Accessibility requirements

- Standard keyboard arrow navigation and touch swipe controls.
- Full respect for `prefers-reduced-motion` settings.
- Pause-on-hover and pause-on-focus for autoplay.

## AI-agent guidance

- **Choose this when:** Immersive multi-plane visual depth elevates the brand proposition.
- **Reject this when:** The task requires direct two-image comparison (use `image-compare`).

## Related files

- **Liquid:** `layered-slideshow.liquid`
- **Usage:** `usage.md`
- **Psychology:** `psychology.md`

## Variant boundaries

Create a child variant only when structure, reading order, responsive transformation, or interaction behavior changes.

## Available variants

| Variant           | Structural distinction                                                                                       | Best for                                                                        | Avoid for                                                  | Status |
| ----------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------ |
| layered-slideshow | Multi-layer stage with atmospheric background, elevated focal media, offset detail layer, and editorial copy | Immersive product storytelling, editorial lookbooks, curated seasonal campaigns | Single flat image banners or basic text-only announcements | Ready  |
