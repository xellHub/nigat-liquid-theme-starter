# Theme-block migration audit

## Baseline

The migration began with:

- 44 Liquid sections
- 30 non-editable snippets
- no native theme blocks
- 24 sections declaring local block schemas
- 38 sections containing heading/title concerns
- 20 sections containing image-picker concerns
- 13 sections implementing grid layout
- more than 25 sections implementing button or link controls

These repeated concerns establish the first atom and composite backlog.

## Repeated patterns

| Pattern                            | Target layer            | Initial implementation                          |
| ---------------------------------- | ----------------------- | ----------------------------------------------- |
| Heading and editorial copy         | Atoms                   | `heading`, `text`, `badge`                      |
| Calls to action                    | Atom                    | `button`, including its optional icon           |
| Responsive media                   | Primitive + atom        | `responsive-image` snippet + `image` block      |
| Rhythm and separation              | Atoms                   | `spacer`, `divider`                             |
| Icon-led value proposition         | Atom/composite boundary | `icon-with-text`                                |
| Generic content grouping           | Composite               | `group`                                         |
| Repeated surfaced content          | Composite               | `card`                                          |
| Feature, quote, disclosure         | Composites              | `feature-item`, `testimonial`, `accordion-item` |
| Campaign media and carousel slides | Curated composites      | `_hero-media`, `_hero-carousel`, `_hero-slide`  |

## Completed migration

1. Hero established the reference vertical slice and reusable presets.
2. Rich text, media, FAQ, quotes, icons, collections, and blog sections moved to foundational atoms and composites.
3. Product, cart, search, article, page, password, gift-card, and other resource contracts moved into scoped extension blocks.
4. Interactive steps, comparison, events, and all slideshow presentations moved to reusable coordinators with nested blocks.
5. Header, announcement bar, footer, drawers, and footer-group data moved to global extension compositions.
6. Both homepage templates and every resource template were migrated to nested block data.

Current checkout (2026-09-27): 47 registered Liquid sections are layout-only, 47 section-library mirrors passed the drift check, and the composition gate audited 109 theme blocks. The hero designs are presets of one `hero` section. The active homepage is `templates/index.json`; the previous expanded composition is stored in `templates/index.showcase.json`. Stale standalone hero, collection-carousel, and blog-carousel library implementations were removed after their behavior moved into `_hero-*`, `_collection-tabs`, and `_blog-carousel` extensions.

`surface`, `group`, and `grid` now form the structural contract used across compositions. Package `usage.md` files are derived from live section and nested-block schemas, and validation rejects stale documentation or unregistered library Liquid implementations.
