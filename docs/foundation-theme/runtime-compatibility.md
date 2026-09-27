# Runtime compatibility record

Updated: 2026-09-26. This is a capability record for F01 of the [implementation plan](fork-foundation-plan.md).

## Declared baseline

- This repository uses Liquid template files, JSON templates, native theme blocks, and platform Ajax routes.
- Bun 1.4.0 and theme CLI 4.3.0 were available during local source validation.
- The intended relationship between XellHub and hosted storefront has not been confirmed. XellHub renderer code, API contract and development store are not present in this repository review. XellHub compatibility is **unverified**.
- No Liquid theme store credentials or preview store were used in this implementation session. Theme Check is a static validator; it cannot establish actual Liquid block scope or theme-editor behavior.

## Fork preview setup

Install dependencies with `bun install`, then run `bun run sync`. Start a Liquid theme development preview with `bun run dev --store your-development-store.example`, or set `THEME_PREVIEW_STORE` for the current shell and run `bun run dev`. The theme CLI remembers the selected store for later theme commands. A fork's preview store is never embedded in `package.json`. The `theme dev` command uploads a temporary development theme; it should be used only with a store the fork maintainer intends to preview.

the platform's theme CLI guide and theme dev reference define the current preview and store flags.

## Required capability fixture

Build an isolated preview template in a development store before F03/F07/F08/F19 migration. Keep it out of the production homepage. Record the generated HTML and Theme Editor behavior for each row.

| Capability | Exact proof | Current status |
| --- | --- | --- |
| Dynamic block nesting | `group` with independent heading, text and button; add/reorder/hide each in editor | Static schema passes; browser/editor pending |
| Parent Liquid assignments | Render `newsletter-form` with child `button`; inspect whether the child reads `button_element` and whether clicking submits the intended form | Pending; platform documentation says theme blocks do not inherit arbitrary parent-local assignments |
| Static block parameters | Render a fixed button/action slot with explicit parameter; verify action, merchant link precedence and editor controls | Pending |
| Resource context | Render two products in a loop using a static `product-card` slot and `closest.product`; verify child media/title/price differ per product | Pending |
| Static ID persistence | Save preset/template data with `static: true` and literal static ID excluded from `block_order`; reload editor | Pending |
| Block clickability | Select headings/buttons directly on canvas, including inside cards, forms and overlays | Pending |
| App slots | Insert/remove an app block in an allowed slot and reload editor | Pending |
| Ajax section rendering | Mutate cart, request registered section IDs, replace relevant markup and restore focus | Source path exists; live test pending |
| XellHub equivalence | Demonstrate each capability against its renderer and matching endpoint | Target/API details pending |

For the two-product proof, include the same product in two sections to expose duplicated HTML IDs. For forms, test a custom link button inside the form; custom link must remain an anchor. For any renderer failure, record the exact generated HTML/error and revise the dependent task before implementing a broad migration.

## Current static checks and limits

The repository checks JSON parseability, registered hardlink mirrors, documented usage hashes, color schemes, token references, theme-block whitelists, nesting and Theme Check offenses. `.theme-check.yml` currently disables `ValidSchema` and `ValidJSON`; source checks do not prove every theme schema rule. They also do not catch escaped output after `image_tag`, incorrect review data, parent-variable scope, live cart behavior, focus handling or actual unused settings.

The F04 change corrects escaped product-card images and replaces fabricated product ratings/counts with standard metafields. Storefront rendering of that change is pending, so the task is marked **implemented, runtime pending** in [progress](implementation-progress.md).
