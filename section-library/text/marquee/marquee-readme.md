---
schema_version: 1
document_type: family
id: text.marquee
group: text
family: marquee
variant: null
status: scaffold
summary: A family for continuously repeated short text.
tags:
  - text
  - marquee
  - section-family
---

# Marquee

A family for continuously repeated short text.

## Purpose

A family for continuously repeated short text.

## Physical composition

A clipped horizontal track repeats brief labels at a controlled readable speed.

## Psychology

They reduce uncertainty through clarity and scanning. Oversized claims, buried limitations, or dense undifferentiated copy undermine trust. Within this family, variants must change how attention or interaction flows—not merely visual styling.

## Best used when

- a nonessential phrase benefits from ambient rhythm or repetition.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when a nonessential phrase benefits from ambient rhythm or repetition; not when the content is required, interactive, lengthy, or time-sensitive.

## Avoid when

- the content is required, interactive, lengthy, or time-sensitive.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

A merchant uses this family when a nonessential phrase benefits from ambient rhythm or repetition, then selects a child variant whose structure matches the available content.

## Bad usage

Using this family when the content is required, interactive, lengthy, or time-sensitive creates unnecessary visual or interaction cost. Prefer rich-text or icons-with-text.

## Content requirements

- **Required:** Structured, accurate copy with a clear heading and readable hierarchy.
- **Recommended:** Short paragraphs, descriptive headings, and progressive disclosure for optional detail.
- **Unsupported:** Critical terms hidden in low-emphasis text or motion used to force reading speed.

## Accessibility requirements

- Use semantic headings, lists, quotations, and disclosure controls.
- Maintain readable line length, contrast, and zoom behavior.
- Ensure icons supplement rather than replace textual meaning.

## AI-agent guidance

- **Choose this when:** a nonessential phrase benefits from ambient rhythm or repetition, and at least one child variant matches the available content
- **Reject this when:** the content is required, interactive, lengthy, or time-sensitive, or no concrete variant has evidence for the required interaction
- **Prefer instead:** rich-text or icons-with-text.
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
