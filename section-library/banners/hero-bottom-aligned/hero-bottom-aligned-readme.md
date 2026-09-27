---
schema_version: 1
document_type: family
id: banners.hero-bottom-aligned
group: banners
family: hero-bottom-aligned
variant: null
status: scaffold
summary: A hero family with content anchored toward the lower edge.
tags:
  - banners
  - hero-bottom-aligned
  - section-family
---

# Hero Bottom Aligned

A hero family with content anchored toward the lower edge.

## Purpose

A hero family with content anchored toward the lower edge.

## Physical composition

A tall media frame with text and actions aligned to a protected lower content zone.

## Psychology

They establish the first attention anchor and communicate priority quickly. Excessive motion, competing actions, or vague claims can create pressure and reduce comprehension. Within this family, variants must change how attention or interaction flows—not merely visual styling.

## Best used when

- the image has usable negative space above and the message should feel grounded.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when the image has usable negative space above and the message should feel grounded; not when important media detail or text occupies the lower edge.

## Avoid when

- important media detail or text occupies the lower edge.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

A merchant uses this family when the image has usable negative space above and the message should feel grounded, then selects a child variant whose structure matches the available content.

## Bad usage

Using this family when important media detail or text occupies the lower edge creates unnecessary visual or interaction cost. Prefer hero or split-showcase.

## Content requirements

- **Required:** A clear primary message and enough content or media to establish one visual focal point.
- **Recommended:** One dominant heading, concise supporting copy, and no more than two actions.
- **Unsupported:** Dense comparison content, long policy text, or unrelated competing promotions.

## Accessibility requirements

- Preserve a logical heading order and readable text contrast over media.
- Provide meaningful media alternatives and keyboard controls for any motion.
- Pause autoplay where required and respect reduced-motion preferences.

## AI-agent guidance

- **Choose this when:** the image has usable negative space above and the message should feel grounded, and at least one child variant matches the available content
- **Reject this when:** important media detail or text occupies the lower edge, or no concrete variant has evidence for the required interaction
- **Prefer instead:** hero or split-showcase.
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
