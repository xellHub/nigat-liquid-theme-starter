---
schema_version: 1
document_type: family
id: collections.collection-list-carousel
group: collections
family: collection-list-carousel
variant: collection-list-carousel
status: ready
summary: A collection-list family using horizontal progression with tactile arrow controls, smooth touch snapping, and superscript product counts.
tags:
  - collections
  - collection-list-carousel
  - section-family
---

# Collection List Carousel

A collection-list family using horizontal progression with tactile arrow controls, smooth touch snapping, and superscript product counts.

## Purpose

Enable shoppers to explore curated collections or high-level department categories through an elegant horizontal scroll rail with tactile arrow navigation, smooth touch gesture snapping, and clear product count cues.

## Physical composition

A single-row horizontal card track with explicit next/prev navigation buttons, an uppercase "EXPLORE ALL" catalog link, and partial next-item affordance on mobile.

## Psychology

Reduces choice complexity by chunking category structure into 3 focal items at a time. Superscript counts provide quantitative depth without cluttering editorial elegance.

## Best used when

- Space is constrained and customers benefit from browsing department categories horizontally.
- The merchant wants a high-fashion editorial showcase for curated collections.

## Avoid when

- Every collection must be visible simultaneously in a grid layout (prefer `collection-list-grid` or `collection-list-bento`).

## Related files

- **Liquid:** `collection-list-carousel.liquid`
- **Usage:** `usage.md`
- **Psychology:** `psychology.md`
- **Screenshot:** `image.png`

## Available variants

| Variant                    | Structural distinction                                                     | Best for                    | Avoid for               | Status |
| -------------------------- | -------------------------------------------------------------------------- | --------------------------- | ----------------------- | ------ |
| `collection-list-carousel` | Horizontal rail with `<` / `>` buttons, superscript counts, and touch snap | Curated fashion collections | Full catalog flat grids | Ready  |
