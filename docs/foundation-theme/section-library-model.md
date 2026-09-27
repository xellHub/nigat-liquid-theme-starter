# Section-library model

## Why mirrors exist

The library organizes reusable section implementations by intent. Liquid theme, however, can only render runtime files from `sections/`. Each installed library implementation therefore has two identical files:

- Library reference: `section-library/.../*.liquid`
- Liquid theme runtime: `sections/*.liquid`

Do not edit only one side.

## Registered mirrors

`scripts/validate-section-library.mjs` currently enforces these pairs:

| Library file                                                   | Runtime file                          |
| -------------------------------------------------------------- | ------------------------------------- |
| `banners/hero/gradient-media-copy/split-hero.liquid`           | `sections/split-hero.liquid`          |
| `products/featured-collection-grid/featured-collection.liquid` | `sections/featured-collection.liquid` |
| `storytelling/image-with-text/image-with-text.liquid`          | `sections/image-with-text.liquid`     |
| `storytelling/blog-posts-grid/featured-blog.liquid`            | `sections/featured-blog.liquid`       |
| `forms/contact-form/sticky-aside/sticky-aside.liquid`          | `sections/contact-form.liquid`        |

The script permits a different leading Liquid comment, but the implementation must otherwise match exactly.

## Adding a new library-backed section

1. Choose the library family based on structure and content purpose, not color or superficial styling.
2. Add the implementation under the correct `section-library/` family directory.
3. Create the same Liquid theme runtime file in `sections/`.
4. Add the pair to `scripts/validate-section-library.mjs`.
5. Bind the section to semantic colors and applicable foundation tokens.
6. Run the full validation suite.

## Homepage mapping

The homepage template is `templates/index.json`.

- `split-hero` is a gradient-media-copy hero, not a `split-showcase`; the latter is only a scaffold.
- `featured-collection` belongs to the featured-collection-grid family.
- `image-with-text` belongs to the storytelling image-with-text family.
- `featured-blog` belongs to the blog-posts-grid family.
