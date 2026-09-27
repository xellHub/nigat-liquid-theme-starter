---
schema_version: 1
document_type: family
id: storytelling.blog-posts-carousel
group: storytelling
family: blog-posts-carousel
variant: null
status: scaffold
summary: A family for horizontally browsing article cards.
tags:
  - storytelling
  - blog-posts-carousel
  - section-family
---

# Blog Posts Carousel

A family for horizontally browsing article cards.

## Purpose

A family for horizontally browsing article cards.

## Physical composition

A labeled article-card track with navigation controls and visible continuation.

## Psychology

They create context and emotional continuity before asking for action. Narrative should clarify genuine value rather than conceal essential commercial facts. Within this family, variants must change how attention or interaction flows—not merely visual styling.

## Best used when

- supplementary reading should remain compact while offering several choices.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when supplementary reading should remain compact while offering several choices; not when all articles are equally essential or users may miss off-screen content.

## Avoid when

- all articles are equally essential or users may miss off-screen content.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

A merchant uses this family when supplementary reading should remain compact while offering several choices, then selects a child variant whose structure matches the available content.

## Bad usage

Using this family when all articles are equally essential or users may miss off-screen content creates unnecessary visual or interaction cost. Prefer blog-posts-grid.

## Content requirements

- **Required:** A coherent narrative progression and media that contributes information.
- **Recommended:** One idea per section, concise transitions, and an optional action after the story resolves.
- **Unsupported:** Decorative media sequences with no informational relationship or inaccessible autoplay.

## Accessibility requirements

- Keep narrative order identical in visual and document flow.
- Caption meaningful video and describe informative imagery.
- Provide controls for motion and respect reduced-motion preferences.

## AI-agent guidance

- **Choose this when:** supplementary reading should remain compact while offering several choices, and at least one child variant matches the available content
- **Reject this when:** all articles are equally essential or users may miss off-screen content, or no concrete variant has evidence for the required interaction
- **Prefer instead:** blog-posts-grid.
- **Required evidence:** Content count, media shape, hierarchy, interaction model, viewport needs, and merchant-configurable data.

## Related files

- **Migrated preset:** `section-library/storytelling/blog-posts-grid/featured-blog.liquid` (`Blog posts`)
- **Usage:** `usage.md`
- **Psychology:** `psychology.md`
- **Screenshot:** `image.png`

## Variant boundaries

Create a child variant only when structure, reading order, responsive transformation, or interaction behavior changes. Keep color, typography, spacing, copy, alignment options, and ordinary content counts as schema settings.

## Available variants

| Variant               | Structural distinction                                                                                                          | Best for                                                     | Avoid for                              | Status |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------- | ------ |
| `blog-posts-carousel` | Snap-scroll horizontal rail showing 3 full cards + 4th card peek on desktop with minimal previous/next buttons and square media | Editorial blog discoverability without vertical page clutter | Small post collections (<= 2 articles) | Ready  |
