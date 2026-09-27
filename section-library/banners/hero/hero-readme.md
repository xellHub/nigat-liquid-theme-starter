---
schema_version: 1
document_type: family
id: banners.hero
group: banners
family: hero
variant: null
status: scaffold
summary: A dominant media-and-message section with a primary action.
tags:
  - banners
  - hero
  - section-family
---

# Hero

A dominant media-and-message section with a primary action.

## Purpose

A dominant media-and-message section with a primary action.

## Physical composition

One full-width frame, one focal media layer, one bounded content region, and one primary action cluster.

## Psychology

They establish the first attention anchor and communicate priority quickly. Excessive motion, competing actions, or vague claims can create pressure and reduce comprehension. Within this family, variants must change how attention or interaction flows—not merely visual styling.

## Best used when

- a campaign has one clear promise and one strong visual.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when a campaign has one clear promise and one strong visual; not when several offers need equal prominence.

## Avoid when

- several offers need equal prominence.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

A merchant uses this family when a campaign has one clear promise and one strong visual, then selects a child variant whose structure matches the available content.

## Bad usage

Using this family when several offers need equal prominence creates unnecessary visual or interaction cost. Prefer split-showcase or collection-list-grid.

## Content requirements

- **Required:** A clear primary message and enough content or media to establish one visual focal point.
- **Recommended:** One dominant heading, concise supporting copy, and no more than two actions.
- **Unsupported:** Dense comparison content, long policy text, or unrelated competing promotions.

## Accessibility requirements

- Preserve a logical heading order and readable text contrast over media.
- Provide meaningful media alternatives and keyboard controls for any motion.
- Pause autoplay where required and respect reduced-motion preferences.

## AI-agent guidance

- **Choose this when:** a campaign has one clear promise and one strong visual, and at least one child variant matches the available content
- **Reject this when:** several offers need equal prominence, or no concrete variant has evidence for the required interaction
- **Prefer instead:** split-showcase or collection-list-grid.
- **Required evidence:** Content count, media shape, hierarchy, interaction model, viewport needs, and merchant-configurable data.

## Related files

- **Liquid:** `not-applicable`
- **Usage:** `../../markdown-interface.md`
- **Psychology:** `../../markdown-interface.md`
- **Screenshot:** `not-applicable`

## Variant boundaries

Create a child variant only when structure, reading order, responsive transformation, or interaction behavior changes. Keep color, typography, spacing, copy, alignment options, and ordinary content counts as schema settings.

## Available variants

| Variant                                                                                | Structural distinction                                                                               | Best for                                                               | Avoid for                                                 | Status |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------- | ------ |
| [Hero presets](./presets/presets-readme.md)                                            | One storefront section with editorial-carousel and gradient-media-copy preset configurations         | A clean Theme Editor with multiple hero designs                        | Treating structural designs as unrelated runtime sections | Ready  |
| [Gradient media copy](./gradient-media-copy/gradient-media-copy-readme.md)             | Full-cover media with a directional contrast scrim and bounded copy                                  | One immersive campaign message                                         | Equal comparison or dense content                         | Ready  |
| [Full frame media](./full-frame-media/full-frame-media-readme.md)                      | Full-bleed background image and video with dual-action buttons                                       | Cinematic brand immersion                                              | Split-layout or product-specific callouts                 | Ready  |
| [Material showcase](./material-showcase/material-showcase-readme.md)                   | Isolated product media with optional material callouts and a compact related-product rail            | One product or material story                                          | Equal comparison or exhaustive product facts              | Ready  |
| [Editorial carousel hero](./editorial-carousel-hero/editorial-carousel-hero-readme.md) | 50/50 dual-panel editorial hero with synchronized dynamic copy templates and infinite mini-card rail | Multi-angle curated collections with bespoke per-card narrative pacing | Static single-message announcements                       | Ready  |
