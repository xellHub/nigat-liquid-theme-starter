# Goal and principles

## Goal

Framework is intended to be a forkable foundation theme rather than a one-brand storefront. A fork should be able to establish a distinct visual system through settings and semantic tokens instead of searching for hard-coded colors, spacing, radii, shadows, or motion values throughout section code.

The desired end state is:

- Several coherent light/dark palettes, including a bare black-and-white baseline.
- Semantic color roles instead of component-specific color literals.
- A global foundation-token layer for geometry, type, surfaces, controls, media, navigation, motion, and accessibility.
- Library source material organized by section family, with deployable Liquid theme copies kept in sync.
- Theme-editor settings as the source of saved configuration.
- A footer FAB for safe, tab-only exploration of the same system.

## Non-negotiable principles

### Semantic before literal

Use a semantic custom property such as `--color-surface`, `--color-border`, `--color-on-media`, `--shadow-lg`, or `--grid-gap`. Do not introduce a raw color, radius, or shadow simply because a section needs one.

### Global defaults, local intent

A section should inherit global foundation values by default. A section-level setting is appropriate only for real content or structural intent: for example, choosing which image to show, changing a hero from left to right, or selecting an explicit color scheme.

### Palette-aware media

Text placed over imagery must use the media foreground and scrim tokens. It must not rely on the active page text color or a hard-coded black/white value.

### Liquid theme remains deployable

Liquid theme only loads files inside `sections/`. The section library cannot replace these runtime files directly. Library files are canonical reference/mirror copies; `sections/` files remain Liquid theme entry points.

### Progressive adoption is deliberate

The full foundation settings inventory exists now. Do not claim a setting is supported by a section until that section actually consumes its token. Wire settings by shared primitive first, then by section family, rather than creating isolated overrides.

### Accessibility is a design token concern

Focus rings, target size, reduced motion, semantic foregrounds, contrast, and keyboard behavior are part of the foundation system—not optional decoration.

### Single typography identity via fork-and-specialize

A single theme instance maintains one unified typography identity (`--font-heading-family` and `--font-body-family`). When tailoring the theme for distinct industry verticals (such as an electronics shop vs. a beauty boutique), never introduce multiple font pickers, per-section font overrides, or conditional CSS bloat into the same codebase. Instead, fork the repository and specialize the foundational design tokens in `assets/base.css`, `layout/theme.liquid`, and `config/settings_data.json` while keeping the section library and block architecture invariant.
