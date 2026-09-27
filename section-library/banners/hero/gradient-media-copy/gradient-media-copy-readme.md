---
schema_version: 1
document_type: variant
id: banners.hero.gradient-media-copy
group: banners
family: hero
variant: gradient-media-copy
status: ready
summary: A full-cover image hero with directional gradient protection for readable copy.
tags:
  - hero
  - full-bleed
  - gradient
  - media-copy
---

# Gradient Media Copy

A full-cover media hero that protects a bounded copy region with a directional gradient.

## Purpose

Open a page with one campaign promise, supporting context, and one or two actions while preserving the emotional effect of full-width imagery.

## Physical composition

Media fills the frame. A dark or light scrim is opaque behind the copy and fades toward the media focal side. Copy is vertically centered on desktop and settles toward the bottom on mobile.

## Psychology

The image creates immediate context while the scrim reduces visual competition around the message. One dominant heading and one primary action lower decision effort.

## Best used when

- One concise campaign and one strong landscape image should share importance.
- The image has a clear subject position or negative space opposite the copy.

**Decision rule:** Best used when one message needs immersive media with reliable text contrast; not when several offers require equal comparison.

## Avoid when

- Important image detail fills the frame and cannot tolerate responsive cropping.
- The page requires dense explanation, a product matrix, or more than two actions.

## Good usage

A seasonal collection uses a right-weighted model photograph, a six-word heading on the left, one sentence of context, and one collection link.

## Bad usage

Four promotions over a busy group photograph obscure the image and provide no clear action. Use a card grid instead.

## Content requirements

- **Required:** One heading and either a meaningful image or the built-in fallback artwork.
- **Recommended:** A 16:9 image, heading under 55 characters, body under 140 characters, and one primary action.
- **Unsupported:** Video, rotating slides, product options, or more than two calls to action.

## Accessibility requirements

- Image alt text falls back to the heading; decorative fallback artwork is hidden.
- Text contrast must remain readable with either scrim tone and every crop.
- Buttons provide visible focus, and motion respects reduced-motion preferences.

## AI-agent guidance

- **Choose this when:** The request calls for one full-bleed hero, one focal image, and copy protected by a directional gradient.
- **Reject this when:** The image has no safe crop, content exceeds two actions, or several items need equal visibility.
- **Prefer instead:** A split showcase for separate panels or a collection grid for equal choices.
- **Required evidence:** Image ratio, subject position, heading length, action count, desired height, and contrast needs.

## Related files

- **Migrated preset:** `section-library/banners/hero/presets/presets.liquid` (`Hero full-frame media`)
- **Usage:** usage.md
- **Psychology:** psychology.md
- **Screenshot:** screenshot.png

## Visual anatomy

1. Full-cover desktop and optional mobile media.
2. Directional dark or light gradient scrim.
3. Eyebrow, heading, supporting text, and action cluster.

## Responsive transformation

Desktop positions copy opposite the selected media focal side. Below 750 px, the composition uses a vertical gradient and anchors content toward the lower edge.

## Liquid behavior

The section uses responsive Shopify image output, prioritizes media only when first on the page, and renders inline fallback SVG when empty. CSS is scoped to the section ID; no snippets, assets, translations, or JavaScript are required.
