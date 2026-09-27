---
schema_version: 1
document_type: variant
id: banners.hero.presets
group: banners
family: hero
variant: presets
status: ready
summary: One merchant-facing Hero section with editorial-carousel and gradient-media-copy presets.
---

# Hero Presets

The Hero is a layout-only section with two nested theme-block presets. Merchants add “Hero” once and receive either an editorial carousel composition or a gradient media composition assembled from reusable atoms.

## Physical anatomy

- **Editorial carousel:** `_hero-carousel` containing reorderable `_hero-slide` composites; each slide nests badge, heading, text, and button atoms.
- **Gradient media copy:** `_hero-media` containing badge, heading, text, button, spacer, or divider atoms.

## Responsive behavior

The editorial rail remains horizontally scrollable while callouts are removed on narrow screens. Gradient media copy moves its content toward the lower edge and uses a vertical mobile scrim. Both designs preserve the configured focal media and readable content order.

## Accessibility

Both presets preserve native heading and link semantics. The carousel uses native horizontal scrolling and scroll snapping, decorative scrims are hidden from assistive technology, and each block exposes Shopify editor attributes.

## Related files

- **Liquid:** `presets.liquid`
- **Usage:** `usage.md`
- **Psychology:** `psychology.md`
- **Screenshot:** `screenshot.png`
