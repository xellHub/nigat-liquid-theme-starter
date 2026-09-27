---
schema_version: 1
document_type: family
id: text.multicolumn
group: text
family: multicolumn
variant: null
status: scaffold
summary: A family presenting parallel content units in columns.
tags:
  - text
  - multicolumn
  - section-family
---

# Multicolumn

A family presenting parallel content units in columns.

## Purpose

A family presenting parallel content units in columns.

## Physical composition

Equal or intentionally weighted columns repeat a heading, text, media, or action pattern.

## Psychology

They reduce uncertainty through clarity and scanning. Oversized claims, buried limitations, or dense undifferentiated copy undermine trust. Within this family, variants must change how attention or interaction flows—not merely visual styling.

## Best used when

- two or more peer ideas should be compared or scanned together.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when two or more peer ideas should be compared or scanned together; not when content has a strict narrative order or columns differ greatly in length.

## Avoid when

- content has a strict narrative order or columns differ greatly in length.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

A merchant uses this family when two or more peer ideas should be compared or scanned together, then selects a child variant whose structure matches the available content.

## Bad usage

Using this family when content has a strict narrative order or columns differ greatly in length creates unnecessary visual or interaction cost. Prefer editorial or rich-text.

## Content requirements

- **Required:** Structured, accurate copy with a clear heading and readable hierarchy.
- **Recommended:** Short paragraphs, descriptive headings, and progressive disclosure for optional detail.
- **Unsupported:** Critical terms hidden in low-emphasis text or motion used to force reading speed.

## Accessibility requirements

- Use semantic headings, lists, quotations, and disclosure controls.
- Maintain readable line length, contrast, and zoom behavior.
- Ensure icons supplement rather than replace textual meaning.

## AI-agent guidance

- **Choose this when:** two or more peer ideas should be compared or scanned together, and at least one child variant matches the available content
- **Reject this when:** content has a strict narrative order or columns differ greatly in length, or no concrete variant has evidence for the required interaction
- **Prefer instead:** editorial or rich-text.
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
