---
schema_version: 1
document_type: family
id: products.featured-collection-editorial
group: products
family: featured-collection-editorial
variant: null
status: scaffold
summary: A family combining collection narrative with selected product cards.
tags:
  - products
  - featured-collection-editorial
  - section-family
---

# Featured Collection Editorial

A family combining collection narrative with selected product cards.

## Purpose

A family combining collection narrative with selected product cards.

## Physical composition

An editorial lead region and an intentionally varied product-card arrangement.

## Psychology

They support evaluation by making value, differences, and next actions legible. Hidden costs, false scarcity, or misleading recommendations are prohibited. Within this family, variants must change how attention or interaction flows—not merely visual styling.

## Best used when

- a collection has a clear story that improves product understanding.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when a collection has a clear story that improves product understanding; not when customers primarily need fast price and feature comparison.

## Avoid when

- customers primarily need fast price and feature comparison.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

A merchant uses this family when a collection has a clear story that improves product understanding, then selects a child variant whose structure matches the available content.

## Bad usage

Using this family when customers primarily need fast price and feature comparison creates unnecessary visual or interaction cost. Prefer featured-collection-grid.

## Content requirements

- **Required:** Valid product data, accurate price and availability, and a clear product destination or purchase action.
- **Recommended:** Consistent media, honest merchandising labels, and enough context to distinguish items.
- **Unsupported:** Fabricated urgency, obscured pricing, or recommendations presented as neutral when they are sponsored.

## Accessibility requirements

- Expose product names, prices, states, and controls to assistive technology.
- Keep variant and carousel controls keyboard operable.
- Do not encode availability, discount, or selection using color alone.

## AI-agent guidance

- **Choose this when:** a collection has a clear story that improves product understanding, and at least one child variant matches the available content
- **Reject this when:** customers primarily need fast price and feature comparison, or no concrete variant has evidence for the required interaction
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
