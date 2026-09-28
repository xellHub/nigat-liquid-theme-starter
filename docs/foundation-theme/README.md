# Foundation theme handoff

Start a brand fork with the [fork and preview guide](fork-guide.md). Keep the [implementation progress](implementation-progress.md) record alongside static and live acceptance evidence.
Use the [release handoff](release-handoff.md) to inventory installed merchant data and record release gates.

This directory explains the configurable foundation-theme system added to Framework and is the starting point for any agent continuing the work.

For the 2026-09-26 fork-foundation review and next implementation work, start with:

1. [Current review and checklist coverage](fork-foundation-review.md)
2. [Detailed implementation tasks and dependencies](fork-foundation-plan.md)
3. [Shared contracts, migration rules, and acceptance checks](fork-foundation-contracts.md)
4. [Current implementation progress](implementation-progress.md)
5. [Foundation token inventory](token-contract.md)
6. [Product-card composition and migration](product-card-contract.md)
7. [Quick view and quick add contract](quick-shopping-contract.md)

These documents distinguish observed implementations from proposed work and identify stale guidance below. Current `AGENTS.md` remains authoritative; all section edits must use canonical library paths followed by `bun run sync`.

For a read-only check after installing dependencies, run `bun run check:foundation`. It verifies section mirrors and generated usage docs, then runs JSON, palette, token, library, composition and Theme Check validation. When intentionally changing a canonical section or block, run `bun run sync` and `node scripts/generate-section-usage.mjs` first; the check command does not regenerate files.

Read in this order:

1. [Goal and principles](goal-and-principles.md)
2. [Technical architecture](technical-architecture.md)
3. [Section-library model](section-library-model.md)
4. [Agent resume guide](agent-resume-guide.md)
5. [Fine-Grained Theme Block Conversion Guide](../fine-grained-block-conversion-guide.md)
6. [Theme Block Composition Standard](../theme-block-composition-standard.md)

## Current outcome

The theme supports paired light/dark visitor palettes, semantic color schemes, global foundation settings, and an optional footer floating action button (FAB) for tab-only live previews. The homepage hero, featured collection, image-with-text, and featured blog are library/runtime mirrors and consume the relevant global tokens.

The implementation is intentionally incremental: foundation settings exist for the complete system, while only sections that have been explicitly adapted are required to consume every applicable token.
