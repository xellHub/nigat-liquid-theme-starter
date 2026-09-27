# Nigat — Advanced Liquid Theme Starter Pack

**An open-source, MIT-licensed, AI-agent-ready foundation for building composed Liquid storefronts.**

Nigat gives developers and teams a structured starting point for storefronts built with Liquid: reusable sections, independently configurable theme blocks, shared design tokens, and documented workflows for both people and coding agents.

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

## What’s included

- **Composable storefront architecture** with JSON templates, reusable sections, and fine-grained theme blocks.
- **A documented section library** organized by group, family, and variant, with usage notes and implementation guidance.
- **A shared design system** for colors, typography, spacing, and responsive behavior.
- **Storefront interactions** for product options, search, cart updates, carousels, and more.
- **Accessibility foundations** including semantic markup, keyboard support, focus handling, and reduced-motion behavior.
- **Validation tools** for section mirrors, schemas, tokens, composition, and theme checks.

## AI-agent ready

Nigat includes repository-specific guidance so coding agents can make focused, reviewable changes:

- [`AGENTS.md`](AGENTS.md) describes repository conventions and canonical edit paths.
- [`PR_REVIEWER.md`](PR_REVIEWER.md) provides a focused pull request review checklist.
- `section-library/` is the canonical source for section changes; `bun run sync` updates the generated runtime mirrors in `sections/`.
- Validation scripts check the contracts agents are expected to follow.

Start an agent task with the relevant file or feature, follow `AGENTS.md`, and run the documented checks after implementation.

## Quick start

Requirements: [Bun](https://bun.sh/) 1.4 or newer and a compatible Liquid storefront host. Preview and deployment also require that host’s CLI and development-store access.

```bash
bun install
bun run sync
bun run check:foundation
bun run dev
```

`bun run check:foundation` runs the repository’s validation suite. The `dev` script starts the configured theme preview; its host-specific APIs and editor contracts are documented in the source.

## Project structure

```text
assets/          Shared styles, tokens, and storefront JavaScript
blocks/          Reusable atomic and composite theme blocks
config/          Theme and design-system configuration
layout/          Storefront document shells
locales/         Translation and schema labels
scripts/         Validation, synchronization, and maintenance tools
section-library/ Canonical section implementations and documentation
sections/        Generated runtime section mirrors
snippets/        Reusable Liquid rendering helpers
templates/       JSON-driven storefront page composition
```

## Making changes

For a section update, edit its canonical package under `section-library/<group>/<family>/<variant>/`, then run `bun run sync`. Do not edit generated files under `sections/` directly. For other changes, follow the repository guidance in `AGENTS.md` and run `bun run check:foundation` before submitting.

## Platform compatibility

Liquid is a template language; storefront hosts provide the runtime, editor, and commerce APIs. Nigat uses host-specific runtime contracts for those features. Moving it to a different Liquid host may require replacing or adapting those integrations.

## License

Nigat is released under the [MIT License](LICENSE). You are free to use, modify, and redistribute the code under its terms. The license retains attribution for portions derived from the Lumen theme.
