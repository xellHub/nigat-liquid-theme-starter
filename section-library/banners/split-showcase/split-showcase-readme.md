---
schema_version: 1
document_type: family
id: banners.split-showcase
group: banners
family: split-showcase
variant: null
status: scaffold
summary: A showcase family dividing media and message into two primary regions.
tags:
  - banners
  - split-showcase
  - section-family
---

# Split Showcase

A showcase family dividing media and message into two primary regions.

## Purpose

A showcase family dividing media and message into two primary regions.

## Physical composition

Two large adjacent regions, typically media and copy, that stack in semantic order on narrow screens.

## Psychology

They establish the first attention anchor and communicate priority quickly. Excessive motion, competing actions, or vague claims can create pressure and reduce comprehension. Within this family, variants must change how attention or interaction flows—not merely visual styling.

## Best used when

- media and explanation deserve comparable weight.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when media and explanation deserve comparable weight; not when one side lacks enough meaningful content to balance the composition.

## Avoid when

- one side lacks enough meaningful content to balance the composition.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

A merchant uses this family when media and explanation deserve comparable weight, then selects a child variant whose structure matches the available content.

## Bad usage

Using this family when one side lacks enough meaningful content to balance the composition creates unnecessary visual or interaction cost. Prefer hero or image-with-text.

## Content requirements

- **Required:** A clear primary message and enough content or media to establish one visual focal point.
- **Recommended:** One dominant heading, concise supporting copy, and no more than two actions.
- **Unsupported:** Dense comparison content, long policy text, or unrelated competing promotions.

## Accessibility requirements

- Preserve a logical heading order and readable text contrast over media.
- Provide meaningful media alternatives and keyboard controls for any motion.
- Pause autoplay where required and respect reduced-motion preferences.

## AI-agent guidance

- **Choose this when:** media and explanation deserve comparable weight, and at least one child variant matches the available content
- **Reject this when:** one side lacks enough meaningful content to balance the composition, or no concrete variant has evidence for the required interaction
- **Prefer instead:** hero or image-with-text.
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
