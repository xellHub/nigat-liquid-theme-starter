---
schema_version: 1
document_type: usage
id: products.featured-collection-carousel
group: products
family: featured-collection-carousel
variant: featured-collection-carousel
status: ready
summary: Configuration reference for the tabbed multi-collection carousel with slide counter.
tags:
  - products
  - featured-collection-carousel
  - multi-collection
  - tabs
  - carousel
---

# Featured Collection Carousel Usage

Configuration guidance for the editorial multi-collection tabbed carousel section.

## Purpose

Showcase curated furniture and product lines across multiple categories (e.g. Chairs, Living Room, Bedroom, Dining Room) in a single horizontal browsing space without cluttering the page.

## Physical composition

- **Header:** Centered italic serif heading (`Featured collection`).
- **Category Tabs:** Centered rounded pill navigation filters supporting multi-collections via blocks or `collection_list`. Active tab is outlined with a subtle border.
- **Product Track:** Smooth horizontal scroll snap rail (4 columns on desktop, 3 on laptop, 2 on tablet, 1.2 on mobile).
- **Product Cards:**
  - Square 1:1 media container with soft neutral background (`#f6f6f6`).
  - Dark floating "On sale" pill badge on discounted items.
  - Eyebrow vendor name (`Majestic`).
  - Italic serif product title.
  - Price display with red strikethrough for compare-at prices.
  - Circular color swatches with active selection ring and `+N` badge.
- **Bottom Controls:**
  - Centered circular navigation buttons (Previous outline, Next solid dark).
  - Dynamic slide counter below buttons (e.g. `01 / 06`) with active slide index underlined.

## Schema settings reference

### Section settings

- `title`: Section heading (default: "Featured collection")
- `collection_list`: Native multi-collection selector for quick tab creation
- `collection`: Single fallback collection
- `products_to_show`: Number of products to load per collection tab (default: 6)
- `columns_desktop`: Number of visible cards per row on desktop (default: 4)
- `show_vendor`: Toggle product vendor/eyebrow (default: true)
- `show_swatches`: Toggle color swatches (default: true)
- `padding_top`: Top section spacing (default: 56px)
- `padding_bottom`: Bottom section spacing (default: 56px)

### Block settings (`collection`)

- `collection`: Collection picker for this tab
- `title`: Custom label override for the tab
