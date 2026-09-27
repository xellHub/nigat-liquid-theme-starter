Built and tested — this parses your .liquid files with Shopify's own @shopify/liquid-html-parser (the same parser theme-check uses), not regex, so it correctly understands nesting and loop scope instead of guessing from text patterns.

The archive is integrated into the repository as `scripts/lint-blocks.cjs`. Install dependencies and lint all runtime sections and theme blocks with:

```bash
bun install
bun run lint
```

Targeted forms:

```bash
bun run lint
bun run lint sections
bun run lint sections/hero.liquid
bun run lint --json
```

What it catches:

no-blocks-slot (error) — a section with no content_for 'blocks', no section.blocks loop, and no "blocks" in its schema. Not applied to atom blocks, which legitimately don't nest anything.
hardcoded-content (warn) — a heading/paragraph/button/link with literal text and zero Liquid output anywhere inside it, sitting outside any blocks scope.
hardcoded-content-mixed (info) — same tag, but partially dynamic — lower-confidence flag worth a manual look.
hardcoded-media (warn) — <img src="..."> with a literal path instead of a dynamic source.

Content inside a {% for block in section.blocks %} loop is never flagged — that's correctly recognized as block-driven, which is the whole point of scope-tracking instead of a flat text scan.

Verified against four real fixtures in the zip: a fully hardcoded section (5 violations + 1 error), a clean content_for-based layout (zero issues), a legacy for-loop section where only the hardcoded heading outside the loop gets flagged, and a suppressed example showing the <!-- lint-disable-next-line hardcoded-content --> escape hatch in action.

Exit code is 1 on any error-severity issue, so it's ready to drop into a CI step or pre-commit hook as-is.
