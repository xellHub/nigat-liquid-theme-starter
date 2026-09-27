# Agent resume guide

## Start here

Read the documents in this directory, then inspect the current working tree:

```bash
git status --short
git log -5 --oneline
```

The most relevant implementation files are:

- `config/settings_schema.json`
- `config/settings_data.json`
- `layout/theme.liquid`
- `assets/base.css`
- `assets/theme.js`
- `sections/footer.liquid`
- `scripts/validate-palettes.mjs`
- `scripts/validate-tokens.mjs`
- `scripts/validate-section-library.mjs`

## Safe workflow for adapting another section

1. Identify its library family and whether it already has a mirror.
2. List the section’s fixed visual values with `rg`.
3. Replace color literals with semantic `--color-*` roles.
4. Replace generic spacing/radius/shadow/control values with shared or foundation tokens.
5. Use explicit section settings only for structural/content choices.
6. Edit the canonical library Liquid file only, then run `bun run sync` to install its runtime hardlink. Never write through `sections/`.
7. Add or update the library mirror validation and regenerate usage documentation if schemas changed.
8. Verify contrast for media, buttons, and focus states in both light and dark palettes.

## Required validation

Run all of these before committing:

```bash
node scripts/validate-json.mjs
node scripts/validate-palettes.mjs
node scripts/validate-tokens.mjs
node scripts/validate-section-library.mjs
node --check assets/theme.js
git diff --check
shopify theme check --path .
```

For settings-schema changes, also check range arithmetic. A quick one-liner is:

```bash
node -e "const fs=require('fs'); const groups=JSON.parse(fs.readFileSync('config/settings_schema.json','utf8')); const bad=[]; for (const group of groups) for (const s of group.settings||[]) if(s.type==='range'){const steps=(s.max-s.min)/s.step; if(steps>100 || Math.abs(steps-Math.round(steps))>1e-9 || Math.abs((s.default-s.min)/s.step-Math.round((s.default-s.min)/s.step))>1e-9) bad.push(s.id)} if(bad.length){console.error(bad.join('\\n'));process.exit(1)} console.log('All range defaults and step counts are Shopify-valid.')"
```

## Current constraints and decisions

- Do not use a blank default for `color_background`; Shopify requires a string. Existing scheme data uses an empty string for “no gradient,” while the schema supplies a valid gradient default.
- Do not add raw color/shadow/radius values without a documented reason. Extend the semantic/foundation token layer instead.
- The FAB is a preview tool only. Persisted merchant values belong in theme settings, not `sessionStorage`.
- Native dialog backdrop is intentionally transparent for the design FAB. Do not restore dim/blur without an explicit product decision.
- The active branch may be ahead of `origin/main` if SSH credentials are unavailable. Confirm remote access before assuming pushes succeeded.

## Suggested next work

Continue family-by-family, prioritizing high-visibility sections:

1. Slideshow and image banner: media overlays, text positioning, global media/spacing/button tokens.
2. Featured product and product cards: grid, surface, control, media, and badge tokens.
3. Header, announcement, footer: navigation, chrome, target-size, and transparent-over-media settings.
4. Cart/drawers/modals: drawer width, backdrop effect, modal radius, and focus system.
5. Remaining utility/content sections: rich text, newsletter, blog/article, collections, search, forms.
