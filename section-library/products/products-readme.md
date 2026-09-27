---
schema_version: 1
document_type: group
id: products
group: products
family: null
variant: null
status: ready
summary: Merchandising families for product discovery, evaluation, and purchase.
tags:
  - products
  - section-group
  - shopify
---

# Products

Merchandising families for product discovery, evaluation, and purchase.

## Purpose

Organize related products section families so variants can be compared by structure and behavior before installation.

## Physical composition

Product families combine product media, title, price, merchandising context, availability, and optional purchase controls in grids, carousels, or focused arrangements.

## Psychology

They support evaluation by making value, differences, and next actions legible. Hidden costs, false scarcity, or misleading recommendations are prohibited.

## Best used when

- customers are ready to inspect, compare, or act on product-level information.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when customers are ready to inspect, compare, or act on product-level information; not when the primary task is choosing a collection or understanding a brand narrative.

## Avoid when

- the primary task is choosing a collection or understanding a brand narrative.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

Use this group to compare its families against the actual content and customer task, then descend into one family to select a concrete variant.

## Bad usage

Using the Products group as a visual mood category leads to mismatched behavior. Choose it only when its customer task matches the page.

## Content requirements

- **Required:** Valid product data, accurate price and availability, and a clear product destination or purchase action.
- **Recommended:** Consistent media, honest merchandising labels, and enough context to distinguish items.
- **Unsupported:** Fabricated urgency, obscured pricing, or recommendations presented as neutral when they are sponsored.

## Accessibility requirements

- Expose product names, prices, states, and controls to assistive technology.
- Keep variant and carousel controls keyboard operable.
- Do not encode availability, discount, or selection using color alone.

## AI-agent guidance

- **Choose this when:** the requested composition matches this group’s purpose: customers are ready to inspect, compare, or act on product-level information
- **Reject this when:** the primary task is choosing a collection or understanding a brand narrative
- **Prefer instead:** a collections or storytelling family.
- **Required evidence:** The page objective, content inventory, interaction requirements, and accessibility constraints.

## Related files

- **Liquid:** `not-applicable`
- **Usage:** `../markdown-interface.md`
- **Psychology:** `../markdown-interface.md`
- **Screenshot:** `not-applicable`

## Section families

- [featured-collection-carousel](./featured-collection-carousel/featured-collection-carousel-readme.md)
- [featured-collection-editorial](./featured-collection-editorial/featured-collection-editorial-readme.md)
- [featured-collection-grid](./featured-collection-grid/featured-collection-grid-readme.md)
- [featured-product](./featured-product/featured-product-readme.md)
- [product-highlight](./product-highlight/product-highlight-readme.md)
- [product-hotspots](./product-hotspots/product-hotspots-readme.md)
- [recommended-products](./recommended-products/recommended-products-readme.md)
