---
schema_version: 1
document_type: family
id: storytelling.image-compare
group: storytelling
family: image-compare
variant: null
status: ready
summary: A family for directly comparing two aligned images.
tags:
  - storytelling
  - image-compare
  - section-family
---

# Image Compare

A family for directly comparing two aligned images.

## Purpose

A family for directly comparing two aligned images.

## Physical composition

Two registered images share one frame and are revealed through an accessible comparison control.

## Psychology

They create context and emotional continuity before asking for action. Narrative should clarify genuine value rather than conceal essential commercial facts. Within this family, variants must change how attention or interaction flows—not merely visual styling.

## Best used when

- before-and-after states use the same viewpoint and the visual difference is meaningful.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when before-and-after states use the same viewpoint and the visual difference is meaningful; not when images are misaligned or the comparison implies unsupported results.

## Avoid when

- images are misaligned or the comparison implies unsupported results.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

A merchant uses this family when before-and-after states use the same viewpoint and the visual difference is meaningful, then selects a child variant whose structure matches the available content.

## Bad usage

Using this family when images are misaligned or the comparison implies unsupported results creates unnecessary visual or interaction cost. Prefer image-with-text.

## Content requirements

- **Required:** A coherent narrative progression and media that contributes information.
- **Recommended:** One idea per section, concise transitions, and an optional action after the story resolves.
- **Unsupported:** Decorative media sequences with no informational relationship or inaccessible autoplay.

## Accessibility requirements

- Keep narrative order identical in visual and document flow.
- Caption meaningful video and describe informative imagery.
- Provide controls for motion and respect reduced-motion preferences.

## CSS Encapsulation & Styling Rules

- **Self-contained CSS:** All Image Compare styles must reside strictly within `image-compare.liquid` and `_image-compare.liquid` via Liquid `{% stylesheet %}` blocks.
- **Pure Global Base CSS:** Never place component-specific Image Compare selectors into `assets/base.css`. `assets/base.css` is strictly reserved for global design tokens, resets, and universal utilities.
- **Universal Tokens:** Component styles must consume standard theme CSS variables (`var(--color-*)`, `var(--font-*)`, `var(--space-*)`, `var(--radius-*)`) for design system harmony.

## AI-agent guidance

- **Choose this when:** before-and-after states use the same viewpoint and the visual difference is meaningful, and at least one child variant matches the available content
- **Reject this when:** images are misaligned or the comparison implies unsupported results, or no concrete variant has evidence for the required interaction
- **Prefer instead:** image-with-text.
- **Required evidence:** Content count, media shape, hierarchy, interaction model, viewport needs, and merchant-configurable data.

## Related files

- **Liquid:** `image-compare.liquid`
- **Usage:** `usage.md`
- **Psychology:** `psychology.md`
- **Screenshot:** `image.png`

## Variant boundaries

Create a child variant only when structure, reading order, responsive transformation, or interaction behavior changes. Keep color, typography, spacing, copy, alignment options, and ordinary content counts as schema settings.

## Available variants

| Variant       | Structural distinction                                                                          | Best for                                                             | Avoid for                             | Status |
| ------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------- | ------ |
| image-compare | Interactive before/after split comparison slider with responsive side-by-side or stacked layout | Direct visual comparison of 2 states, fits, materials, or treatments | Unrelated images or multi-slide lists | Ready  |
