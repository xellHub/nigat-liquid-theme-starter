---
schema_version: 1
document_type: family
id: products.featured-collection-grid
group: products
family: featured-collection-grid
variant: null
status: scaffold
summary: A family showing selected collection products in an equal-weight grid.
tags:
  - products
  - featured-collection-grid
  - section-family
---

# Featured Collection Grid

A family showing selected collection products in an equal-weight grid.

## Purpose

A family showing selected collection products in an equal-weight grid.

## Physical composition

A section heading and regular responsive matrix of consistent product cards.

## Psychology

They support evaluation by making value, differences, and next actions legible. Hidden costs, false scarcity, or misleading recommendations are prohibited. Within this family, variants must change how attention or interaction flows—not merely visual styling.

## Best used when

- customers should scan several products with equal visual priority.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when customers should scan several products with equal visual priority; not when the assortment requires narrative sequencing or one item dominates.

## Avoid when

- the assortment requires narrative sequencing or one item dominates.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

A merchant uses this family when customers should scan several products with equal visual priority, then selects a child variant whose structure matches the available content.

## Bad usage

Using this family when the assortment requires narrative sequencing or one item dominates creates unnecessary visual or interaction cost. Prefer featured-collection-editorial or featured-product.

## Content requirements

- **Required:** Valid product data, accurate price and availability, and a clear product destination or purchase action.
- **Recommended:** Consistent media, honest merchandising labels, and enough context to distinguish items.
- **Unsupported:** Fabricated urgency, obscured pricing, or recommendations presented as neutral when they are sponsored.

## Accessibility requirements

- Expose product names, prices, states, and controls to assistive technology.
- Keep variant and carousel controls keyboard operable.
- Do not encode availability, discount, or selection using color alone.

## AI-agent guidance

- **Choose this when:** customers should scan several products with equal visual priority, and at least one child variant matches the available content
- **Reject this when:** the assortment requires narrative sequencing or one item dominates, or no concrete variant has evidence for the required interaction
- **Prefer instead:** featured-collection-editorial or featured-product.
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
