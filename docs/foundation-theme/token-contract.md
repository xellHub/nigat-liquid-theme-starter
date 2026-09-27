# Foundation token inventory

Generated from the current schema and source by `node scripts/report-foundation-tokens.mjs`. This is a static reference map, not a browser behavior claim. Regenerate after foundation setting changes.

The inventory contains 51 foundation settings: 35 have a direct component `var()` reference, 7 reach a component through one shared alias, 6 have a layout behavior mapping, 3 are consumed by Liquid/JS without a CSS emission, and 0 have root emission only. The design-preview controls are excluded from consumer counts. Longer alias chains and JS behavior still require inspection.

| Setting | Default / schema unit | CSS property name | Static status | Example source files |
| --- | --- | --- | --- | --- |
| `foundation_content_width_narrow` | 760 px | `--foundation-content-width-narrow` | Direct component reference; behavior unverified | assets/base.css, blocks/divider.liquid, blocks/newsletter-form.liquid |
| `foundation_reading_width` | 680 px | `--foundation-reading-width` | Direct component reference; behavior unverified | blocks/divider.liquid, blocks/group.liquid, blocks/quote.liquid |
| `foundation_gutter_mobile` | 16 px | `--foundation-gutter-mobile` | Direct component reference; behavior unverified | assets/base.css, blocks/_featured-product-content.liquid, blocks/_hero-media.liquid |
| `foundation_gutter_tablet` | 24 px | `--foundation-gutter-tablet` | Direct component reference; behavior unverified | assets/base.css |
| `foundation_gutter_desktop` | 40 px | `--foundation-gutter-desktop` | Direct component reference; behavior unverified | assets/base.css, blocks/_featured-product-content.liquid, section-library/banners/hero/presets/presets.liquid |
| `foundation_section_spacing_mobile` | 40 px | `--foundation-section-spacing-mobile` | Direct component reference; behavior unverified | assets/base.css, blocks/_hero-media.liquid, blocks/_hero-slide.liquid |
| `foundation_section_spacing_desktop` | 64 px | `--foundation-section-spacing-desktop` | Direct component reference; behavior unverified | assets/base.css, blocks/_hero-media.liquid, blocks/_hero-slide.liquid |
| `foundation_grid_columns_desktop` | 4 range | `--foundation-grid-columns-desktop` | Direct component reference; behavior unverified | blocks/grid.liquid |
| `foundation_grid_columns_mobile` | 2 range | `--foundation-grid-columns-mobile` | Direct component reference; behavior unverified | assets/base.css, blocks/grid.liquid |
| `foundation_type_scale` | major-third select | `--foundation-type-scale` | Shared alias reference; behavior unverified | blocks/_blog-carousel.liquid, blocks/collection-card.liquid |
| `foundation_base_font_size` | 16 px | `--foundation-base-font-size` | Direct component reference; behavior unverified | assets/base.css, blocks/_blog-carousel.liquid, blocks/collection-card.liquid |
| `foundation_small_text_size` | 13 px | `--foundation-small-text-size` | Direct component reference; behavior unverified | blocks/eyebrow.liquid, section-library/collections/collection-list-editorial/collection-list-editorial.liquid, blocks/_blog-carousel.liquid |
| `foundation_display_scale` | 140 % | `--foundation-display-scale` | Direct component reference; behavior unverified | blocks/heading.liquid, assets/theme.js |
| `foundation_body_tracking` | 0 ‰ | `--foundation-body-tracking` | Shared alias reference; behavior unverified | assets/base.css |
| `foundation_heading_tracking` | -10 ‰ | `--foundation-heading-tracking` | Direct component reference; behavior unverified | assets/base.css, blocks/_featured-product-content.liquid |
| `foundation_heading_case` | none select | `--foundation-heading-case` | Direct component reference; behavior unverified | blocks/_featured-product-content.liquid |
| `foundation_label_case` | uppercase select | `--foundation-label-case` | Direct component reference; behavior unverified | blocks/_featured-product-content.liquid, blocks/eyebrow.liquid, section-library/collections/collection-list-editorial/collection-list-editorial.liquid |
| `foundation_label_tracking` | 80 ‰ | `--foundation-label-tracking` | Direct component reference; behavior unverified | assets/base.css, blocks/_featured-product-content.liquid, blocks/eyebrow.liquid |
| `foundation_border_style` | solid select | `--foundation-border-style` | Direct component reference; behavior unverified | assets/base.css |
| `foundation_border_opacity` | 100 % | `--foundation-border-opacity` | Direct component reference; behavior unverified | blocks/divider.liquid |
| `foundation_divider_width` | 1 px | `--foundation-divider-width` | Direct component reference; behavior unverified | blocks/_collection-tabs.liquid, blocks/_image-compare.liquid, blocks/accordion-item.liquid |
| `foundation_badge_radius` | 100 px | `--foundation-badge-radius` | Direct component reference; behavior unverified | blocks/_featured-product-content.liquid, blocks/badge.liquid, blocks/collection-card.liquid |
| `foundation_image_radius` | 12 px | `--foundation-image-radius` | Direct component reference; behavior unverified | assets/base.css, blocks/video.liquid, blocks/_blog-carousel.liquid |
| `foundation_modal_radius` | 16 px | `--foundation-modal-radius` | Direct component reference; behavior unverified | assets/base.css |
| `foundation_shadow_blur` | 32 px | `--foundation-shadow-blur` | Shared alias reference; behavior unverified | assets/base.css, blocks/_featured-product-content.liquid, blocks/_header-content.liquid |
| `foundation_shadow_y_offset` | 12 px | `--foundation-shadow-y-offset` | Shared alias reference; behavior unverified | assets/base.css, blocks/_featured-product-content.liquid, blocks/_header-content.liquid |
| `foundation_surface_treatment` | solid select | `--foundation-surface-treatment` | Layout behavior mapping; browser unverified | assets/theme.js, layout/theme.liquid |
| `foundation_button_style` | solid select | `--foundation-button-style` | Layout behavior mapping; browser unverified | layout/theme.liquid |
| `foundation_secondary_button_style` | outline select | `--foundation-secondary-button-style` | Layout behavior mapping; browser unverified | layout/theme.liquid |
| `foundation_button_padding_x` | 24 px | `--foundation-button-padding-x` | Direct component reference; behavior unverified | blocks/button.liquid |
| `foundation_button_padding_y` | 12 px | `--foundation-button-padding-y` | Direct component reference; behavior unverified | blocks/button.liquid |
| `foundation_icon_button_size` | 44 px | `--foundation-icon-button-size` | Direct component reference; behavior unverified | blocks/_collection-tabs.liquid, blocks/icon-button.liquid |
| `foundation_input_padding_x` | 16 px | `--foundation-input-padding-x` | Direct component reference; behavior unverified | blocks/cart-note.liquid, blocks/input.liquid, blocks/select.liquid |
| `foundation_focus_ring_width` | 2 px | `--foundation-focus-ring-width` | Direct component reference; behavior unverified | assets/base.css, blocks/_image-compare.liquid, blocks/button.liquid |
| `foundation_focus_ring_offset` | 2 px | `--foundation-focus-ring-offset` | Direct component reference; behavior unverified | assets/base.css, blocks/_image-compare.liquid, blocks/button.liquid |
| `foundation_focus_ring_style` | outline select | `--foundation-focus-ring-style` | Layout behavior mapping; browser unverified | layout/theme.liquid |
| `foundation_image_fit` | cover select | `--foundation-image-fit` | Direct component reference; behavior unverified | assets/base.css, blocks/_hero-media.liquid |
| `foundation_image_loading` | eager-hero select | `--foundation-image-loading` | Liquid/JS behavior; no CSS emission | blocks/_hero-media.liquid, blocks/_hero-slide.liquid |
| `foundation_media_text_max_width` | 580 px | `--foundation-media-text-max-width` | Direct component reference; behavior unverified | blocks/_hero-media.liquid, blocks/_hero-slide.liquid |
| `foundation_header_height` | 64 px | `--foundation-header-height` | Direct component reference; behavior unverified | assets/base.css, layout/theme.liquid |
| `foundation_drawer_width` | 420 px | `--foundation-drawer-width` | Direct component reference; behavior unverified | assets/base.css |
| `foundation_overlay_backdrop_opacity` | 35 % | `--foundation-overlay-backdrop-opacity` | Shared alias reference; behavior unverified | assets/base.css |
| `foundation_overlay_backdrop_effect` | dim select | `--foundation-overlay-backdrop-effect` | Layout behavior mapping; browser unverified | layout/theme.liquid |
| `foundation_toast_position` | bottom-right select | `--foundation-toast-position` | Layout behavior mapping; browser unverified | assets/theme.js, layout/theme.liquid |
| `foundation_transition_fast` | 160 ms | `--foundation-transition-fast` | Shared alias reference; behavior unverified | assets/base.css, blocks/_material-collection-card.liquid, blocks/accordion-item.liquid |
| `foundation_transition_standard` | 240 ms | `--foundation-transition-standard` | Shared alias reference; behavior unverified | assets/base.css, blocks/_blog-carousel.liquid, blocks/_material-collection-card.liquid |
| `foundation_motion_easing` | spring select | `--foundation-motion-easing` | Direct component reference; behavior unverified | assets/base.css, assets/base.css, blocks/_blog-carousel.liquid |
| `foundation_hover_lift` | 2 px | `--foundation-hover-lift` | Direct component reference; behavior unverified | assets/base.css, blocks/button.liquid, blocks/card.liquid |
| `foundation_minimum_target_size` | 44 px | `--foundation-minimum-target-size` | Direct component reference; behavior unverified | assets/base.css, blocks/_announcement-rotator.liquid, blocks/_blog-carousel.liquid |
| `foundation_show_color_mode_switcher` | true boolean | `--foundation-show-color-mode-switcher` | Liquid/JS behavior; no CSS emission | assets/theme.js, layout/theme.liquid |
| `foundation_show_palette_switcher` | true boolean | `--foundation-show-palette-switcher` | Liquid/JS behavior; no CSS emission | assets/theme.js, layout/theme.liquid |

## Precedence and migration decisions

- Palette settings emit semantic `--color-*` roles. Components inherit those roles; an explicit section scheme takes precedence.
- Existing heading/body font pickers are the only font identities. The removed `font_accent` setting is no longer loaded; old `--font-accent-*` references alias the heading role. Before deploying to an installed fork, record any customized accent font and choose a heading/body mapping deliberately.
- The `foundation_type_scale` select now maps to numeric ratios in `layout/theme.liquid`, so dependent `calc()` expressions receive a number.
- Global layout defaults coexist with explicit saved section widths and padding. New presets should inherit; existing explicit values require an opt-in migration.
- Settings labeled “root emission only” are not automatically dead. F05/F22 must trace aliases and JS consumers, wire the intended behavior, or mark the control deprecated.
- Layout behavior mappings include Liquid-derived properties and root data attributes. These are static source findings, not proof of browser behavior or accessible contrast.
