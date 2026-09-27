# Fundamental Blocks

Foundational theme blocks. Sections are layout-only and must be built entirely from these — if a section needs a pattern not listed here, add the block here first, don't inline markup.

Layering: tokens → atoms → structural → composites → sections.

## Cross-cutting options

Every block below inherits these — don't respecify per block.

| Option                        | Purpose                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| Visibility (mobile / desktop) | show/hide per breakpoint                                                                          |
| Custom class                  | free-text CSS hook — the escape valve for a one-off section-level tweak without forking the block |
| Spacing override              | margin-top / margin-bottom, independent of the block's own padding                                |
| Anchor ID                     | deep-linking / in-page nav                                                                        |

---

## Structural

### `group` / `container`

Arrange a fixed, known set of elements (card internals, a header row, a button pair).

| Option      | Values                |
| ----------- | --------------------- |
| layout mode | stack / row           |
| gap         | token or custom       |
| padding     | token or custom       |
| background  | token / custom / none |
| border      | on/off, color, width  |
| radius      | token or custom       |
| alignment   | align/justify         |
| wrap        | on/off                |
| max-width   | token or custom       |

### `surface`

Elevation/background layering — cards, dropdowns, modals, popovers. Ramp, not a single color, so re-theming and dark mode remap automatically.

| Shade   | Use                                          | Default treatment                   |
| ------- | -------------------------------------------- | ----------------------------------- |
| canvas  | page background itself                       | no bg, no shadow                    |
| subtle  | cards, table rows, sidebars                  | 1 step off canvas, no shadow        |
| raised  | hover states, nested cards, active tab panel | 2 steps off canvas, soft shadow     |
| overlay | modals, dropdowns, popovers, mega-menu panel | strongest contrast, elevated shadow |

| Option        | Values                                  |
| ------------- | --------------------------------------- |
| shade         | canvas / subtle / raised / overlay      |
| background    | auto (from shade) or custom override    |
| border        | auto / on / off, color override         |
| shadow        | auto (from shade) / none / sm / md / lg |
| radius        | token or custom                         |
| padding       | token or custom                         |
| hover-elevate | off / bump one shade level              |

Composites (`card`, etc.) should **compose** `surface` internally rather than reimplementing background/shadow logic.

### `grid`

Repeat an unknown/variable count of same-shaped composites (product grids, feature grids, logo walls). One level above composites.

| Option                          | Values                                      |
| ------------------------------- | ------------------------------------------- |
| columns (desktop/tablet/mobile) | independent integers per breakpoint         |
| sizing mode                     | fixed columns / auto-fit (min item width)   |
| gap                             | single value, or split row-gap / column-gap |
| item alignment                  | align-items, justify-items                  |
| equal-height items              | toggle                                      |

**Rule:** `group` arranges a fixed set once. `grid` repeats a variable count of identical items. If a block author reaches for `group` + "layout mode: grid," that's the block that should have been `grid`.

---

## Atoms

| Block                               | Options                                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------------------------- |
| `heading`                           | tag (h1–h6), size, weight, color, alignment, max-width                                    |
| `text` / `rich-text`                | content, size, color, alignment, max-width                                                |
| `eyebrow`                           | text, color, uppercase toggle, letter-spacing                                             |
| `quote`                             | content, size (default/large), alignment                                                  |
| `button`                            | label, link, variant (primary/secondary/outline/link), size, icon, open-in-new-tab        |
| `link`                              | text, url, icon toggle, underline style                                                   |
| `icon-button`                       | icon, aria-label, size, link                                                              |
| `image`                             | image, alt text, aspect ratio, object-fit, focal point, radius override, lazy-load toggle |
| `video`                             | source (file/YouTube/Vimeo), autoplay, loop, muted, controls, poster, aspect ratio        |
| `icon`                              | icon picker, size, color, stroke width                                                    |
| `icon-with-text`                    | vector/custom icon or image, optional demo illustration, heading, text, alignment, link   |
| `spacer`                            | height desktop, height mobile                                                             |
| `divider`                           | style (solid/dashed), color, weight, width                                                |
| `price`                             | show-compare-at toggle, sale-badge toggle                                                 |
| `badge`                             | text, style (sale/sold-out/custom), color                                                 |
| `rating`                            | source (metafield/app), display (stars/number), color                                     |
| `countdown`                         | end date/time, expired-behavior (hide/show message), style                                |
| `input`                             | label, placeholder, type, required toggle                                                 |
| `select`                            | label, options source, placeholder                                                        |
| `checkbox`                          | label, required toggle                                                                    |
| `tab-trigger` / `accordion-trigger` | label, icon, default-open                                                                 |

## Composites

| Block             | Options                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------- |
| `card`            | layout (vertical/horizontal), image position, content alignment, surface toggle, hover effect |
| `media-text`      | media position (left/right), content-width ratio, vertical alignment                          |
| `feature-item`    | icon size, icon position, alignment                                                           |
| `testimonial`     | layout (quote-first/image-first), avatar shape                                                |
| `accordion-item`  | icon style, divider-between-items toggle                                                      |
| `tab-panel`       | content padding                                                                               |
| `stat`            | number size, label position, count-up-animation toggle                                        |
| `logo-item`       | image size, grayscale toggle, link                                                            |
| `product-card`    | image aspect ratio, hover-image-swap toggle, show rating, show vendor, quick-view toggle      |
| `newsletter-form` | customer signup form composed from input, checkbox, text, and submit-button atoms             |
| `collection-card` | collection, image/title/count overrides, aspect ratio, product-count visibility               |
| `carousel`        | responsive visible-item count, navigation controls, scroll snapping                           |

---

## Section-level (applies above any section, regardless of blocks used)

| Option                          | Purpose                        |
| ------------------------------- | ------------------------------ |
| columns (desktop/tablet/mobile) | independent                    |
| gap                             | token or custom                |
| container width                 | full / wide / narrow           |
| padding top/bottom              | token or custom                |
| background                      | token / custom / image         |
| blocks slot                     | `@theme` or curated allow-list |
