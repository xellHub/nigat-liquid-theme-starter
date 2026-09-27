---
schema_version: 1
document_type: family
id: storytelling.blog-posts-editorial
group: storytelling
family: blog-posts-editorial
variant: null
status: scaffold
summary: A family presenting articles with varied editorial hierarchy.
tags:
  - storytelling
  - blog-posts-editorial
  - section-family
---

# Blog Posts Editorial

A family presenting articles with varied editorial hierarchy.

## Purpose

A family presenting articles with varied editorial hierarchy.

## Physical composition

One or more lead stories use larger media or typography beside supporting article entries.

## Psychology

They create context and emotional continuity before asking for action. Narrative should clarify genuine value rather than conceal essential commercial facts. Within this family, variants must change how attention or interaction flows—not merely visual styling.

## Best used when

- real editorial priority and strong imagery justify unequal emphasis.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when real editorial priority and strong imagery justify unequal emphasis; not when articles require equal treatment or publication order changes automatically.

## Avoid when

- articles require equal treatment or publication order changes automatically.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

A merchant uses this family when real editorial priority and strong imagery justify unequal emphasis, then selects a child variant whose structure matches the available content.

## Bad usage

Using this family when articles require equal treatment or publication order changes automatically creates unnecessary visual or interaction cost. Prefer blog-posts-grid.

## Content requirements

- **Required:** A coherent narrative progression and media that contributes information.
- **Recommended:** One idea per section, concise transitions, and an optional action after the story resolves.
- **Unsupported:** Decorative media sequences with no informational relationship or inaccessible autoplay.

## Accessibility requirements

- Keep narrative order identical in visual and document flow.
- Caption meaningful video and describe informative imagery.
- Provide controls for motion and respect reduced-motion preferences.

## AI-agent guidance

- **Choose this when:** real editorial priority and strong imagery justify unequal emphasis, and at least one child variant matches the available content
- **Reject this when:** articles require equal treatment or publication order changes automatically, or no concrete variant has evidence for the required interaction
- **Prefer instead:** blog-posts-grid.
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
