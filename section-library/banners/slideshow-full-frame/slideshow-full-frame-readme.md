---
schema_version: 1
document_type: family
id: banners.slideshow-full-frame
group: banners
family: slideshow-full-frame
variant: null
status: scaffold
summary: A slideshow family in which every slide fills the section frame.
tags:
  - banners
  - slideshow-full-frame
  - section-family
---

# Slideshow Full Frame

A slideshow family in which every slide fills the section frame.

## Purpose

A slideshow family in which every slide fills the section frame.

## Physical composition

A viewport-width stage with full-bleed slide media and overlaid or adjacent controls.

## Psychology

They establish the first attention anchor and communicate priority quickly. Excessive motion, competing actions, or vague claims can create pressure and reduce comprehension. Within this family, variants must change how attention or interaction flows—not merely visual styling.

## Best used when

- high-quality imagery can communicate distinct sequential messages.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when high-quality imagery can communicate distinct sequential messages; not when media crops poorly or every slide needs dense explanatory copy.

## Avoid when

- media crops poorly or every slide needs dense explanatory copy.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

A merchant uses this family when high-quality imagery can communicate distinct sequential messages, then selects a child variant whose structure matches the available content.

## Bad usage

Using this family when media crops poorly or every slide needs dense explanatory copy creates unnecessary visual or interaction cost. Prefer slideshow-inset or editorial.

## Content requirements

- **Required:** A clear primary message and enough content or media to establish one visual focal point.
- **Recommended:** One dominant heading, concise supporting copy, and no more than two actions.
- **Unsupported:** Dense comparison content, long policy text, or unrelated competing promotions.

## Accessibility requirements

- Preserve a logical heading order and readable text contrast over media.
- Provide meaningful media alternatives and keyboard controls for any motion.
- Pause autoplay where required and respect reduced-motion preferences.

## AI-agent guidance

- **Choose this when:** high-quality imagery can communicate distinct sequential messages, and at least one child variant matches the available content
- **Reject this when:** media crops poorly or every slide needs dense explanatory copy, or no concrete variant has evidence for the required interaction
- **Prefer instead:** slideshow-inset or editorial.
- **Required evidence:** Content count, media shape, hierarchy, interaction model, viewport needs, and merchant-configurable data.

## Related files

- **Liquid:** `not-applicable`
- **Usage:** `../../markdown-interface.md`
- **Psychology:** `../../markdown-interface.md`
- **Screenshot:** `not-applicable`

## Variant boundaries

Create a child variant only when structure, reading order, responsive transformation, or interaction behavior changes. Keep color, typography, spacing, copy, alignment options, and ordinary content counts as schema settings.

## Available variants

| Variant          | Structural distinction                                                               | Best for                                              | Avoid for                              | Status |
| ---------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------- | -------------------------------------- | ------ |
| `embla-carousel` | Full-frame touch and drag carousel with backdrops and flexible pagination indicators | Immersive visual campaigns with smooth tactile pacing | Densely textual or informational pages | Ready  |
