# Technical architecture

The normative five-layer dependency model is documented in [`theme-architecture.md`](../../theme-architecture.md). This document records the underlying token pipeline and runtime facilities.

## Configuration layers

### 1. Shopify settings schema

`config/settings_schema.json` defines:

- `color_schemes`: semantic color roles for canvas, surfaces, text, actions, chrome, and status.
- Five visitor palette slots. Each slot maps a light and dark scheme.
- Existing typography/layout/card settings.
- `Foundation: future global tokens`: the extended inventory for geometry, typography, borders/elevation, controls, media, navigation, motion, and accessibility.

Shopify range settings have strict requirements. Every default must align to `min + n × step`, and a range may have at most 101 steps. Validate this whenever changing ranges.

### 2. Root custom properties

`layout/theme.liquid` emits the saved settings as CSS custom properties on `html:root`, then emits each Shopify color scheme as both:

```css
html[data-color-scheme="scheme-id"],
.color-scheme-id {
  /* semantic color tokens */
}
```

This enables a global visitor palette while retaining explicit per-section schemes.

Frequently used foundation variables include:

```css
--foundation-gutter-mobile
--foundation-gutter-desktop
--foundation-section-spacing-mobile
--foundation-section-spacing-desktop
--foundation-grid-columns-mobile
--foundation-grid-columns-desktop
--foundation-image-fit
--foundation-image-radius
--foundation-media-overlay-color
--foundation-media-overlay-opacity
--foundation-media-text-max-width
--foundation-header-height
--foundation-button-padding-x
--foundation-button-padding-y
--foundation-focus-ring-width
--foundation-focus-ring-offset
--foundation-hover-lift
```

Existing shared tokens remain valid and should be preferred where they already express the need: `--page-width`, `--grid-gap`, `--space-*`, `--radius-*`, `--control-height`, `--shadow-*`, `--motion-*`, and all `--color-*` roles.

### 3. Base CSS and block primitives

`assets/base.css` owns shared behavior. A new section should consume existing primitives before adding CSS:

- `.section` for section spacing
- `.page-width` for containers
- `.theme-button` for reusable button atoms and action-coupled controls; legacy `.button` remains in older chrome markup
- `.product-grid` and `.blog-grid` for grids
- `.color-inverse` and media variables for content over imagery

Shared structural contracts:

| Contract  | Responsibility                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------- |
| `surface` | semantic shade ramp, border, radius, padding, shadow, and hover elevation                           |
| `group`   | fixed stack/row composition, alignment, wrapping, gaps, padding, and maximum width                  |
| `grid`    | fixed or auto-fit repetition, independent responsive columns, split gaps, and equal-height behavior |

This checkout contains 41 public block filenames and 55 private extension filenames. `card` and `group` route their visual surface treatment through the shared `.theme-surface` CSS contract in `assets/base.css`.

### 4. Visitor palette controls

`assets/theme.js` manages persistent visitor choices:

- `nigat-palette` in `localStorage`
- `nigat-color-mode` in `localStorage`
- `data-palette`, `data-color-mode`, and `data-color-scheme` on `<html>`

Header controls use `data-theme-toggle`, `data-palette-toggle`, and `data-palette-option`.

### 5. Live design FAB

`sections/footer.liquid` provides the optional FAB when `show_design_controls` is enabled. It is an accessible native dialog with no visual backdrop. It previews:

- visitor palette and color mode
- canvas, text, and accent colors
- active layout/radius/elevation/type/motion tokens
- the entire future foundation-token inventory in collapsed groups

Preview values are saved only in `sessionStorage` under `nigat-design-preview`; they are never written to Shopify theme settings. The FAB writes root inline custom properties. `Reset preview` removes them.

For custom accent values, `assets/theme.js` calculates a black or white foreground to preserve button-label contrast.
