# Fork and preview guide

Create one fork per brand. Keep structural fixes in `section-library/`, blocks, snippets and controllers; keep brand identity in foundational settings, semantic palettes and merchant content. Record the upstream commit or tag and the fork's migration version in its README before changing saved theme data.

## Start a fork

1. Fork or clone the repository, then run `bun install` (Bun 1.4 or newer) and `bun run sync` to restore library-to-runtime hardlinks after checkout.
2. Set up an authorized Liquid theme development store and run `bun run dev` for a preview. This repository has no connected live XellHub or Liquid theme preview target, so local checks cannot prove Theme Editor behavior.
3. Set metadata, logo, favicon, social links, policies, menus and products in the preview store. Replace starter content with brand content before release. Keep optional sections such as recently viewed and bundles uninstalled until configured.
4. Choose one heading font and one body font in `config/settings_data.json`. Set palette roles and type, spacing, width, radius, button and card values there; `assets/base.css` and `layout/theme.liquid` resolve reusable variables. Review explicit section color schemes individually.
5. Configure homepage presets through the Theme Editor or `templates/index.json`. Edit section implementations only in `section-library/`, register new mirrors and run `bun run sync`; never edit `sections/` directly.
6. Run `bun run check:foundation` before previewing or publishing. Regenerate usage with `node scripts/generate-section-usage.mjs` after canonical or block edits.

Run `bun run report:foundation` for a dated, read-only local release report. Supply a captured successful check log with `node scripts/report-foundation-release.mjs --check-log /path/to/check.log`; optionally add `--evidence-dir /path/to/evidence`. The report leaves the release decision pending until live evidence is reviewed.

## Style profile proof

Two example profiles live in [`profiles/sharp-compact.json`](profiles/sharp-compact.json) and [`profiles/soft-spacious.json`](profiles/soft-spacious.json). They contain only existing foundation setting keys and semantic roles. Generate settings files outside the active theme:

```bash
node scripts/preview-foundation-profile.mjs sharp-compact /tmp/nigat-sharp-settings.json
node scripts/preview-foundation-profile.mjs soft-spacious /tmp/nigat-soft-settings.json
```

Use separate preview theme copies for those files as `config/settings_data.json`. The source theme's production settings stay untouched. Check contrast, long labels and 200% zoom after changing colors or fonts.

## Preview matrix

For each profile, inspect home, product page, collection page, cart drawer and page, forms, footer, and missing-data states at desktop (1440 px), tablet (768 px), and mobile (390 px). Check keyboard focus, Escape/overlay close, product variants, cart quantity and notes, localized routes, and Theme Editor section add/reorder/remove. Capture screenshots dated with upstream revision, profile, viewport, browser and platform version. Compare custom-section and card blocks outside their original caller.

The optional bundle needs real multi-item Ajax cart, sold-out, changed quantity and partial rejection checks. Recommendations need the platform endpoint; recently viewed needs privacy consent tests; reviews need a configured provider. These are release gates, not claims of completion from local validation.

## Release record

Record upstream revision, fork revision, saved-data migration version, preview target, platform capabilities, installed optional packages, check output, visual evidence paths, unresolved blockers and deployment approval. Installed merchant template data is not migrated by repository template edits; inventory it before deploying a fork update.
