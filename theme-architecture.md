# Theme architecture

This theme uses five one-way layers. A layer may depend only on layers below it.

```text
Sections (layout only)
  ↓
Composite theme blocks
  ↓
Atom theme blocks
  ↓
Non-editable snippets
  ↓
Global design tokens
```

## 1. Tokens

`config/settings_schema.json` defines merchant-level design decisions. `layout/theme.liquid` compiles them into CSS custom properties. Components consume semantic variables and never copy saved values or hardcode brand colors, font families, radii, spacing, or shadows. A theme instance maintains a single, coherent typography identity; adapting the storefront for distinct industry verticals (such as electronics vs. beauty) is achieved by forking the theme and customizing foundation tokens in `assets/base.css`, rather than accumulating multi-font selectors in a single codebase.

Token families:

- Color: `--color-*`
- Spacing: `--space-*`, `--spacing-sections`, `--foundation-gutter-*`
- Type: `--font-*`, `--line-height-*`, `--foundation-*-tracking`
- Geometry: `--radius-*`, `--foundation-*-radius`
- Border and elevation: `--color-border`, `--card-border-width`, `--foundation-divider-width`, `--shadow-*`
- Layout: `--page-width`, `--foundation-content-width-narrow`, `--foundation-reading-width`, `--grid-gap`
- Motion and accessibility: `--motion-*`, `--foundation-focus-ring-*`, `--foundation-minimum-target-size`

## 2. Primitives

Non-editable plumbing belongs in `snippets/`. Use an underscore prefix when adding an internal-only primitive. Snippets accept explicit arguments and do not expose merchant schema.

Current examples include `icon.liquid`, `price.liquid`, `responsive-image.liquid`, and `placeholder-image.liquid`.

## 3. Atom blocks

Reusable merchant-editable atoms live in `blocks/`: `button`, `heading`, `text`, `badge`, `image`, `spacer`, `divider`, and `icon-with-text`.

Every atom:

- owns and reads only `block.settings`;
- consumes global tokens by default;
- groups closely related controls rather than creating microscopic blocks;
- includes at least one preset;
- includes `block.shopify_attributes` when using `tag: null`.

## 4. Composite blocks

Structural blocks (`group`, `surface`, and `grid`) provide shared composition, elevation, and repetition contracts. Molecules such as `card`, `media-text`, `feature-item`, `testimonial`, and `accordion-item` compose those structural blocks and atoms with `{% content_for 'blocks' %}`. `card` consumes the shared surface class contract rather than defining its own background, border, radius, or shadow ramp.

A leading underscore marks a context-specific extension hidden from general `@theme` pickers. Extensions own only behavior or presentation that cannot be expressed by the 37 registered foundational blocks: resource renderers, coordinated carousels, product forms, comparison rows, event cards, or global navigation frames. Their merchant-facing content remains self-scoped or nested as atoms.

**No Monolithic Content in Composite Blocks:** Composite blocks (e.g. `_interactive-step`, `_comparison-row`, cards, slides) must NEVER embed editable headings, titles, descriptions, body copy, or buttons in `schema.settings`. All text, headings, and actions MUST be nested child theme blocks (`heading`, `text`, `button`, etc.) rendered via `{% content_for 'blocks' %}`. This ensures merchants can select, edit, style, reorder, or delete them independently on the canvas and in the sidebar tree.

Nested presets must provide a useful initial composition. Keep nesting at or below eight block levels and keep the whole theme below 300 files in `blocks/`.

## 5. Sections

Sections own layout only: color scheme, width, grid/flex behavior, gap, alignment, and outer spacing. Content is rendered through `{% content_for 'blocks' %}`. A section must not embed headings, marketing copy, buttons, cards, or media content.

All 43 runtime sections in the 2026-09-26 checkout follow this contract. `scripts/validate-theme-layers.mjs` rejects any section without a theme-block slot, any legacy `section.blocks` loop, content-oriented section settings, a missing universal color-scheme helper, or a documented foundational setting that is absent from its block schema.

The section library contains exactly one registered canonical Liquid implementation for each runtime section. Runtime files in `sections/` are hardlinks to those canonical files, created with `bun run sync`. Because Git stores contents rather than inode relationships, run that command after cloning or checking out the repository. The sync is strictly one-way from `section-library/` to `sections/`; it creates missing runtime files and atomically replaces broken or overwritten mirrors. Use `bun run sync check` for read-only verification. `scripts/validate-section-library.mjs` rejects missing documentation or visuals, non-hardlinked mirrors, mirror drift, unregistered library implementations, and stale generated `usage.md` references.

## Non-negotiable dependency rules

1. **Sections do not hardcode content:** Sections are layout shells and render content purely via `{% content_for 'blocks' %}`.
2. **No monolithic content in composite blocks:** Composite blocks compose atoms; they must never lock editable headings, body text, or buttons into `schema.settings`.
3. **Strict block whitelisting:** Every container and composite block must explicitly whitelist its allowed child blocks in `"blocks": [...]`.
4. **Terminal blocks terminate:** Atomic blocks (`heading`, `text`, `button`, `badge`, `icon`, `image`, `divider`, `spacer`, `price`) are terminal leaves and must never declare `"blocks"` or render `content_for 'blocks'`.
5. **No button-in-button wrapping:** Blocks rendering `{% content_for 'blocks' %}` must never be wrapped in HTML `<button>` or `<a>` elements, preventing invalid HTML5 nesting and ensuring canvas selectability.
6. **Blocks do not read another block's settings or `section.settings`:** Blocks remain self-scoped and read only `block.settings`.
7. **Snippets remain non-editable and receive explicit inputs:** Snippets provide plumbing and never declare schemas.
8. **Tokens are the only source for theme appearance defaults:** Never hardcode hex values or font stacks.
9. **Section grouping taxonomy:** Header sections declare `"enabled_on": { "groups": ["header"] }`, footer sections declare `"enabled_on": { "groups": ["footer"] }`, and template sections declare `"disabled_on": { "groups": ["header", "footer"] }`.
10. **Block order must retain a logical reading flow for any permitted sequence.**

When schemas change, run `node scripts/generate-section-usage.mjs` before the standard validation suite. The library validator checks that generated usage references remain current.
