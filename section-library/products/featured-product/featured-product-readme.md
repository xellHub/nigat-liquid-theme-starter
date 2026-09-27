---
schema_version: 1
document_type: family
id: products.featured-product
group: products
family: featured-product
variant: null
status: scaffold
summary: A family presenting one product with core purchase information.
tags:
  - products
  - featured-product
  - section-family
---

# Featured Product

A family presenting one product with core purchase information.

## Purpose

A family presenting one product with core purchase information.

## Physical composition

A large media region paired with title, price, options, description, and purchase actions structured according to Shopify's 5-layer Theme Blocks architecture:

1. **Section (`featured-product.liquid`):** Owns layout-only properties (color scheme) and top-level block slots (`heading`, `_featured-product-content`, `@theme`).
2. **Composite Block (`_featured-product-content.liquid`):** Houses the media gallery, interactive thumbnail strip, and the nested `fp__info-wrap` block container.
3. **Atom & Structural Blocks:** Merchants can independently select and edit the eyebrow/section `heading`, `badge`, product `heading`, `price`, `text` description, and `group` containers.
4. **Source state:** Until the merchant chooses a product, the section shows Horizon-family placeholder media with sample product title and description. It does not render a purchase form or price. The starter preset binds its title and price atoms to the chosen product; merchants can add action blocks after configuring it.
5. **Gallery behavior:** Preview thumbnails switch between their matching Horizon SVGs in the main media frame. Selected product thumbnails switch the main product image directly and expose their active state with `aria-pressed`.

## Psychology

They support evaluation by making value, differences, and next actions legible. Hidden costs, false scarcity, or misleading recommendations are prohibited. Within this family, variants must change how attention or interaction flows—not merely visual styling.

## Best used when

- one product deserves focused evaluation and can be purchased from the section.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when one product deserves focused evaluation and can be purchased from the section; not when the page must compare several products or tell a broader story.

## Avoid when

- the page must compare several products or tell a broader story.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

A merchant uses this family when one product deserves focused evaluation and can be purchased from the section, then selects a child variant whose structure matches the available content.

## Bad usage

Using this family when the page must compare several products or tell a broader story creates unnecessary visual or interaction cost. Prefer featured-collection-grid or product-highlight.

## Content requirements

- **Required:** Valid product data, accurate price and availability, and a clear product destination or purchase action.
- **Recommended:** Consistent media, honest merchandising labels, and enough context to distinguish items.
- **Unsupported:** Fabricated urgency, obscured pricing, or recommendations presented as neutral when they are sponsored.

## Accessibility requirements

- Expose product names, prices, states, and controls to assistive technology.
- Keep variant and carousel controls keyboard operable.
- Do not encode availability, discount, or selection using color alone.

## AI-agent guidance

- **Choose this when:** one product deserves focused evaluation and can be purchased from the section, and at least one child variant matches the available content
- **Reject this when:** the page must compare several products or tell a broader story, or no concrete variant has evidence for the required interaction
- **Prefer instead:** featured-collection-grid or product-highlight.
- **Required evidence:** Content count, media shape, hierarchy, interaction model, viewport needs, and merchant-configurable data.

## Related files

- **Liquid:** `featured-product.liquid`
- **Usage:** `usage.md`
- **Psychology:** `psychology.md`
- **Screenshot:** `image.png`

## Variant boundaries

Create a child variant only when structure, reading order, responsive transformation, or interaction behavior changes. Keep color, typography, spacing, copy, alignment options, and ordinary content counts as schema settings.

## Available variants

| Variant            | Structural distinction                                                                                                                           | Best for                                                           | Avoid for                                               | Status |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------- | ------ |
| `featured-product` | Editorial spotlight with tokenized elevation, an interactive thumbnail gallery, and a source-aware placeholder before product selection | Flagship single-product spotlighting with merchant-configured actions | Multi-product catalogs requiring comparative evaluation | Ready  |
