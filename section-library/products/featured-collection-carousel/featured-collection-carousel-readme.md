---
schema_version: 1
document_type: family
id: products.featured-collection-carousel
group: products
family: featured-collection-carousel
variant: null
status: scaffold
summary: A family for horizontally browsing products from one selected collection.
tags:
  - products
  - featured-collection-carousel
  - section-family
---

# Featured Collection Carousel

A family for horizontally browsing products from one selected collection.

## Purpose

A family for horizontally browsing products from one selected collection.

## Physical composition

A product-card track with collection context, explicit controls, and visible continuation.

## Psychology

They support evaluation by making value, differences, and next actions legible. Hidden costs, false scarcity, or misleading recommendations are prohibited. Within this family, variants must change how attention or interaction flows—not merely visual styling.

## Best used when

- a curated product set should be browsable without consuming a tall page region.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when a curated product set should be browsable without consuming a tall page region; not when all products must be immediately comparable or carousel controls would hide essential choices.

## Avoid when

- all products must be immediately comparable or carousel controls would hide essential choices.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

A merchant uses this family when a curated product set should be browsable without consuming a tall page region, then selects a child variant whose structure matches the available content.

## Bad usage

Using this family when all products must be immediately comparable or carousel controls would hide essential choices creates unnecessary visual or interaction cost. Prefer featured-collection-grid.

## Content requirements

- **Required:** Valid product data, accurate price and availability, and a clear product destination or purchase action.
- **Recommended:** Consistent media, honest merchandising labels, and enough context to distinguish items.
- **Unsupported:** Fabricated urgency, obscured pricing, or recommendations presented as neutral when they are sponsored.

## Accessibility requirements

- Expose product names, prices, states, and controls to assistive technology.
- Keep variant and carousel controls keyboard operable.
- Do not encode availability, discount, or selection using color alone.

## AI-agent guidance

- **Choose this when:** a curated product set should be browsable without consuming a tall page region, and at least one child variant matches the available content
- **Reject this when:** all products must be immediately comparable or carousel controls would hide essential choices, or no concrete variant has evidence for the required interaction
- **Prefer instead:** featured-collection-grid.
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
