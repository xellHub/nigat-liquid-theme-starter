---
schema_version: 1
document_type: family
id: text.rich-text
group: text
family: rich-text
variant: null
status: scaffold
summary: A family for flexible headings, prose, lists, and actions.
tags:
  - text
  - rich-text
  - section-family
---

# Rich Text

A family for flexible headings, prose, lists, and actions.

## Purpose

A family for flexible headings, prose, lists, and actions.

## Physical composition

A constrained readable column organizes semantic text with optional heading and action elements.

## Psychology

They reduce uncertainty through clarity and scanning. Oversized claims, buried limitations, or dense undifferentiated copy undermine trust. Within this family, variants must change how attention or interaction flows—not merely visual styling.

## Best used when

- clear written explanation is the primary need.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when clear written explanation is the primary need; not when customers need visual comparison, complex interaction, or long unstructured content.

## Avoid when

- customers need visual comparison, complex interaction, or long unstructured content.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

A merchant uses this family when clear written explanation is the primary need, then selects a child variant whose structure matches the available content.

## Bad usage

Using this family when customers need visual comparison, complex interaction, or long unstructured content creates unnecessary visual or interaction cost. Prefer multicolumn, FAQ, or storytelling.

## Content requirements

- **Required:** Structured, accurate copy with a clear heading and readable hierarchy.
- **Recommended:** Short paragraphs, descriptive headings, and progressive disclosure for optional detail.
- **Unsupported:** Critical terms hidden in low-emphasis text or motion used to force reading speed.

## Accessibility requirements

- Use semantic headings, lists, quotations, and disclosure controls.
- Maintain readable line length, contrast, and zoom behavior.
- Ensure icons supplement rather than replace textual meaning.

## AI-agent guidance

- **Choose this when:** clear written explanation is the primary need, and at least one child variant matches the available content
- **Reject this when:** customers need visual comparison, complex interaction, or long unstructured content, or no concrete variant has evidence for the required interaction
- **Prefer instead:** multicolumn, FAQ, or storytelling.
- **Required evidence:** Content count, media shape, hierarchy, interaction model, viewport needs, and merchant-configurable data.

## Related files

- **Liquid:** `not-applicable`
- **Usage:** `../../markdown-interface.md`
- **Psychology:** `../../markdown-interface.md`
- **Screenshot:** `not-applicable`

## Variant boundaries

Create a child variant only when structure, reading order, responsive transformation, or interaction behavior changes. Keep color, typography, spacing, copy, alignment options, and ordinary content counts as schema settings.

## Available variants

| Variant              | Structural distinction                                                        | Best for                                 | Avoid for                             | Status |
| -------------------- | ----------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------- | ------ |
| `editorial-centered` | Centered or left-aligned column organizing heading, RTE body, and CTA button. | Brand statements, mission, announcements | Multi-column features, structured FAQ | Ready  |
