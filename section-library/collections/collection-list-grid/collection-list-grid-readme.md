---
schema_version: 1
document_type: family
id: collections.collection-list-grid
group: collections
family: collection-list-grid
variant: null
status: scaffold
summary: A collection-list family using a regular responsive matrix.
tags:
  - collections
  - collection-list-grid
  - section-family
---

# Collection List Grid

A collection-list family using a regular responsive matrix.

## Purpose

A collection-list family using a regular responsive matrix.

## Physical composition

Repeated equal-weight cards align in rows and collapse predictably across breakpoints.

## Psychology

They reduce choice complexity by exposing category structure. Unequal emphasis should communicate real priority rather than manipulate attention toward arbitrary inventory. Within this family, variants must change how attention or interaction flows—not merely visual styling.

## Best used when

- customers need to scan and compare several peer collections.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when customers need to scan and compare several peer collections; not when one collection needs narrative emphasis or item counts are very small.

## Avoid when

- one collection needs narrative emphasis or item counts are very small.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

A merchant uses this family when customers need to scan and compare several peer collections, then selects a child variant whose structure matches the available content.

## Bad usage

Using this family when one collection needs narrative emphasis or item counts are very small creates unnecessary visual or interaction cost. Prefer collection-links-spotlight or collection-list-editorial.

## Content requirements

- **Required:** At least two valid collection destinations with distinct labels.
- **Recommended:** Concise collection names, consistent imagery, and a deliberate ordering strategy.
- **Unsupported:** Product-level variant selection or unrelated editorial links mixed into the same set.

## Accessibility requirements

- Use descriptive linked labels and sufficiently large interactive targets.
- Keep DOM and keyboard order aligned with visual order.
- Give collection images meaningful alt text when they add information.

## AI-agent guidance

- **Choose this when:** customers need to scan and compare several peer collections, and at least one child variant matches the available content
- **Reject this when:** one collection needs narrative emphasis or item counts are very small, or no concrete variant has evidence for the required interaction
- **Prefer instead:** collection-links-spotlight or collection-list-editorial.
- **Required evidence:** Content count, media shape, hierarchy, interaction model, viewport needs, and merchant-configurable data.

## Related files

- **Liquid:** `not-applicable`
- **Usage:** `../../markdown-interface.md`
- **Psychology:** `../../markdown-interface.md`
- **Screenshot:** `not-applicable`

## Variant boundaries

Create a child variant only when structure, reading order, responsive transformation, or interaction behavior changes. Keep color, typography, spacing, copy, alignment options, and ordinary content counts as schema settings.

## Available variants

No concrete variants are registered yet.

| Variant        | Structural distinction                                  | Best for       | Avoid for               | Status   |
| -------------- | ------------------------------------------------------- | -------------- | ----------------------- | -------- |
| Not registered | A concrete structural implementation is still required. | Not applicable | Production installation | Scaffold |
