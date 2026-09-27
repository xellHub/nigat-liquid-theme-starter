# Liquid theme Section Library Plan

## Objective

Build a copy-ready Liquid theme section library using the seven requested groups.
The 41 named second-level folders are section families, not installable Liquid
components. Each family can hold multiple concrete variants one level deeper.

Importing an existing theme section means creating a self-contained library
edition. Live files remain in `sections/` so the storefront keeps working.

## Hierarchy

```text
section-library/<group>/<section-family>/<specific-variant>/
```

Example:

```text
section-library/
└── collections/
    └── collection-list-editorial/
        ├── collection-list-editorial-readme.md
        ├── asymmetric-magazine/
        │   ├── asymmetric-magazine.liquid
        │   ├── asymmetric-magazine-readme.md
        │   ├── usage.md
        │   ├── psychology.md
        │   └── screenshot.png
        └── lead-card-with-stack/
            ├── lead-card-with-stack.liquid
            ├── lead-card-with-stack-readme.md
            ├── usage.md
            ├── psychology.md
            └── screenshot.png
```

Rules:

- Level one is one of `banners`, `collections`, `forms`, `layout`,
  `products`, `storytelling`, or `text`.
- Level two is a reusable section family from the supplied 41-folder inventory.
- Level three names one concrete visual or interaction variant.
- Liquid files exist only inside level-three variant folders.
- A family README describes shared intent and the rules separating its variants.
- A family should contain at least two materially different variants before it
  is considered complete.
- Variants must differ structurally or behaviorally. Color, copy, spacing, and
  normal theme-editor options do not justify a separate variant.
- Names use lowercase kebab-case.

## Existing family inventory

- **Banners:** Hero; Hero: Bottom aligned; Hero: Marquee; Large logo; Layered
  slideshow; Slideshow: Full frame; Slideshow: Inset; Split showcase.
- **Collections:** Collection links: Spotlight; Collection links: Text;
  Collection list: Bento; Collection list: Carousel; Collection list:
  Editorial; Collection list: Grid.
- **Forms:** Contact form; Email signup.
- **Layout:** Custom Liquid; Custom section; Divider.
- **Products:** Featured collection: Carousel; Featured collection: Editorial;
  Featured collection: Grid; Featured product; Product highlight; Product
  hotspots; Recommended products.
- **Storytelling:** Blog posts: Carousel; Blog posts: Editorial; Blog posts:
  Grid; Carousel; Editorial; Editorial: Jumbo text; Image compare; Image with
  text; Video.
- **Text:** FAQ; Icons with text; Marquee; Multicolumn; Pull quote; Rich text.

## Current homepage import

The current homepage sections become concrete variants, not family roots:

| Live section                 | Concrete library variant                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| `split-hero.liquid`          | `banners/hero/gradient-media-copy/gradient-media-copy.liquid`                        |
| `featured-collection.liquid` | `products/featured-collection-grid/balanced-four-column/balanced-four-column.liquid` |
| `image-with-text.liquid`     | `storytelling/image-with-text/balanced-media-copy/balanced-media-copy.liquid`        |
| `featured-blog.liquid`       | `storytelling/blog-posts-grid/editorial-three-column/editorial-three-column.liquid`  |

These names describe the actual composition. Labels such as “homepage version”
or “default” are not acceptable variant names.

## Variant package contract

Each concrete variant folder contains:

- One self-contained, production-ready `<variant>.liquid` section.
- `<variant>-readme.md` describing its visual anatomy, Liquid flow, responsive
  behavior, accessibility, and installation.
- `usage.md` listing settings, blocks, presets, content limits, supported
  contexts, and AI-agent configuration instructions.
- `psychology.md` explaining attention flow, decision support, appropriate
  use, inappropriate use, and dark-pattern safeguards.
- `screenshot.png` showing the canonical preset at a 1440 px viewport.

Each Liquid variant includes valid theme schema, locally scoped CSS and
JavaScript, empty-state handling, reduced-motion behavior, and support for
multiple instances. It must not depend on repository-specific snippets or
assets.

## Index and validation

The root and group readmes document the taxonomy. Each family has a named
family README. A future `catalog.json` indexes concrete variants—not family
folders—for AI-agent discovery.

Validation must confirm:

- All seven groups and 41 family folders are represented.
- No Liquid file is placed directly in a group or family folder.
- Every cataloged variant has one Liquid file, three Markdown documents, and
  one screenshot.
- Every completed family has at least two structurally distinct variants.
- Embedded theme schemas and catalog JSON are valid.
- Components pass theme checker and rendering checks for empty content,
  populated content, mobile, desktop, keyboard access, repeated instances, and
  reduced motion.
- Importing a library variant does not alter live homepage references.
