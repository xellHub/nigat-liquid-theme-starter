---
schema_version: 1
document_type: family
id: collections.collection-list-bento
group: collections
family: collection-list-bento
variant: null
status: scaffold
summary: A collection-list family using mixed-size modular tiles.
tags:
  - collections
  - collection-list-bento
  - section-family
---

# Collection List Bento

A collection-list family using mixed-size modular tiles.

## Purpose

A collection-list family using mixed-size modular tiles.

## Physical composition

A bounded grid of unequal spans with intentional focal and supporting tiles.

## Psychology

They reduce choice complexity by exposing category structure. Unequal emphasis should communicate real priority rather than manipulate attention toward arbitrary inventory. Within this family, variants must change how attention or interaction flows—not merely visual styling.

## Best used when

- collection priority can be represented honestly through tile size.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when collection priority can be represented honestly through tile size; not when items require equal comparison or ordering changes frequently.

## Avoid when

- items require equal comparison or ordering changes frequently.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

A merchant uses this family when collection priority can be represented honestly through tile size, then selects a child variant whose structure matches the available content.

## Bad usage

Using this family when items require equal comparison or ordering changes frequently creates unnecessary visual or interaction cost. Prefer collection-list-grid.

## Content requirements

- **Required:** At least two valid collection destinations with distinct labels.
- **Recommended:** Concise collection names, consistent imagery, and a deliberate ordering strategy.
- **Unsupported:** Product-level variant selection or unrelated editorial links mixed into the same set.

## Accessibility requirements

- Use descriptive linked labels and sufficiently large interactive targets.
- Keep DOM and keyboard order aligned with visual order.
- Give collection images meaningful alt text when they add information.

## AI-agent guidance

- **Choose this when:** collection priority can be represented honestly through tile size, and at least one child variant matches the available content
- **Reject this when:** items require equal comparison or ordering changes frequently, or no concrete variant has evidence for the required interaction
- **Prefer instead:** collection-list-grid.
- **Required evidence:** Content count, media shape, hierarchy, interaction model, viewport needs, and merchant-configurable data.

## Related files

- **Liquid:** `collection-list-bento.liquid`
- **Usage:** `usage.md`
- **Psychology:** `psychology.md`
- **Screenshot:** `image.png`

## Variant boundaries

Create a child variant only when structure, reading order, responsive transformation, or interaction behavior changes. Keep color, typography, spacing, copy, alignment options, and ordinary content counts as schema settings.

## Available variants

| Variant                 | Structural distinction                                                                                    | Best for                                       | Avoid for                       | Status |
| ----------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------- | ------ |
| `collection-list-bento` | 2x2 asymmetric bento grid (1:2 and 2:1 alternating layout) with neutral frames and lower-left pill badges | Visual category discovery with engaging rhythm | Strict uniform comparison grids | Ready  |
