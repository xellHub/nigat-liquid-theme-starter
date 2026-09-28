---
schema_version: 1
document_type: variant
id: banners.hero.editorial-carousel-hero
group: banners
family: hero
variant: editorial-carousel-hero
status: ready
summary: A high-end lifestyle interior hero featuring full-bleed ambient media, floating editorial copy, vector material callouts, and an interactive 7-card product rail.
tags:
  - hero
  - lifestyle
  - interior
  - callouts
  - carousel
  - furniture
---

# Editorial Carousel Hero

An editorial lifestyle hero that pairs a full-bleed architectural interior with bold typography, material annotations, and a floating horizontal product carousel rail.

## Purpose

Establish brand pedigree and tactile material quality through an immersive living room environment while enabling seamless product exploration through an interactive card rail.

## Physical composition

1. **Section Shell (`editorial-carousel-hero.liquid`)**: Full-bleed layout container supporting dynamic theme palette color schemes, page width constraints, and padding. Directly hosts composable slides and the navigation rail via `{% content_for 'blocks' %}`, dynamically synchronizing ambient background layers (`eh__bg-stage`) with the reactive thumbnail rail.

When a merchant has not chosen slide media, both the background and rail thumbnails use the platform's Horizon `hero-apparel-*` SVG placeholders. Merchant images replace them immediately after selection. Each placeholder SVG namespaces its definition IDs so hiding a background cannot hide a thumbnail through a shared clipping reference.
Each slide has one `image` setting shared by its main background and navigation thumbnail. Rail thumbnails load eagerly in both server-rendered and rebuilt cards and render selected merchant images directly, without the site's loading wrapper, so changing the active card does not leave a thumbnail transparent. The server-rendered rail and the interactive slide template use the same placeholder family.
Selecting a rail thumbnail keeps the rail at its current scroll position and keeps inactive thumbnails fully opaque; the selected border and scale still identify the active slide. Arrow and autoplay navigation can scroll the rail to reveal their newly active card.
The rail defaults to cover fitting with no inner thumbnail padding, including cards rebuilt after a slide change. Merchants can select contain fitting when they want to show the entire image instead.
2. **Selectable Navigation Rail (`_editorial-rail.liquid`)**: A discrete, directly selectable theme block that encapsulates thumbnail button dimensions, corner radii, spacing gaps, image fitting modes, and active highlight borders. This keeps the main section lightweight while empowering merchants to select and customize the entire navigation bar on the visual canvas or sidebar.
3. **Composable Slide Blocks (`_editorial-slide.liquid`)**: Each slide provides its background media, thumbnail configuration, and child theme blocks via `{% content_for 'blocks' %}`. Supports programmatic focus on activation so keyboard and screen reader focus smoothly transitions to the active slide.
4. **Fine-Grained Atomic Theme Blocks (`heading`, `eyebrow`, `text`, `button`)**: Every title, eyebrow, body text, and action button is an independent theme block that is directly selectable and editable on the Theme Editor visual canvas and in the sidebar tree.

## Psychology

- **Atmospheric Immersion**: Immersive environments establish immediate emotional connection and spatial context for high-ticket furniture.
- **Effortless Discovery**: The floating card rail invites touch and navigation without forcing users to leave the hero section.

## Best used when

- The brand possesses high-resolution lifestyle interior or studio photography.
- Material construction and craftsmanship are primary purchasing drivers.
- The collection features complementary pieces (seating, lounges, tables).

## Avoid when

- Low-resolution imagery with busy or cluttered backgrounds is used.
- Callouts obscure key facial or architectural focal points.

## Accessibility requirements

- Semantic `h1` and clear contrast ratios across text overlays.
- Media copy inherits the stable white foundation foreground; ambient and bottom scrims use the dark media-overlay token in every palette and mode. Primary buttons retain the selected palette colors.
- Keyboard navigation (Tab, Enter, Space) and arrow controls for interactive cards.
- Programmatic slide focus (`focusSlide`) on navigation button selection, enabling immediate sequential Tab navigation into child action buttons.
- ARIA attributes (`role="button"`, `aria-label`, `aria-current`) on rail cards and slider controls.
- Reduced motion support disabling scale and transition transforms.

## Related files

- **Migrated preset:** `section-library/banners/hero/presets/presets.liquid` (`Hero carousel`)
- **Usage:** `usage.md`
- **Psychology:** `psychology.md`
- **Screenshot:** `image.png`
