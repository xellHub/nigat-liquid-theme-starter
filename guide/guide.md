› The layering model

Think of it as 5 layers, each only allowed to depend on the one below it:

Tokens — global settings (settings_schema.json) compiled into CSS custom properties: color, spacing scale, radius, type scale, shadows, borders, container widths.
Primitives (non-editable) — pure Liquid snippets for markup that merchants never need to reorder themselves: icon.liquid, price.liquid, image.liquid, rating-
stars.liquid. Internal plumbing, not shadcn-style pieces.
Atom blocks — your shadcn layer. Native theme blocks in /blocks: button.liquid, heading.liquid, badge.liquid, text.liquid, spacer.liquid. Each has its own scoped
schema settings that default to tokens but allow local overrides.
Composite blocks — molecules built by nesting atoms: card.liquid, feature-item.liquid, testimonial.liquid, accordion-item.liquid. Theme blocks can accept other
theme blocks as children, nested up to 8 levels deep, excluding the section level, and you can use presets so merchants get a sensible starting config instead of a
blank block.
Liquid theme
Sections = layouts — no hardcoded content markup at all. A section owns grid/flex settings (columns, gap, alignment, max-width, vertical spacing, background) and a
blocks array — usually "@theme" or a curated allow-list — that just renders whatever blocks get dropped in via {% content_for 'blocks' %}.

This architecture treats blocks as first-class, self-contained UI components with their own animation, layout, and styling rather than simple content placeholders.
Layout tokens use CSS custom properties and responsive container queries so components stay context-aware wherever they appear. Before distributing a theme through a
platform marketplace, check its current submission rules and supported starter requirements.

Rules that keep it from turning into spaghetti
Settings scoping: theme settings should be scoped to the block that uses them — no block should reach up and read another block's settings.
Liquid theme
Granularity: avoid blocks that are too granular — group related settings together rather than splitting them into many tiny blocks, since over-granularity adds
complexity to both the code and the merchant's editing experience. So resist making "button icon" its own block; it's a setting on the button block.
Liquid theme
Flow: whatever grid layout a section uses, blocks should read logically regardless of their type or order — don't let a section's visual result depend on blocks
being added in a specific sequence.
Liquid theme
Hard limits to design around: nesting caps at 8 levels excluding the section level, and a theme can hold at most 300 theme blocks total — every .liquid file in /
blocks counts, even unused ones, so prune dead blocks as you go.
Liquid theme
Liquid theme
Implementation plan

Phase 0 — Audit (1–2 days)
Inventory every existing section, list every repeated visual pattern (buttons, headings, cards, media+text splits, grids). This becomes your atom/composite
backlog. Flag any section that currently hardcodes something that should be a block.

architecture.md) so forks know what's safe to retheme vs. what's structural.

Phase 2 — Atom blocks
Build the small set first: button, heading/rich-text, image, badge, icon-with-text, spacer, divider. Each gets its own {% schema %} with settings that default to
tokens.

Phase 3 — Composite blocks
Card, media-with-text, testimonial, accordion-item, feature-item — each nests 2–3 atoms as children. Ship presets for each so the block picker isn't just an empty
shell.

Phase 4 — Section refactor
Strip content-specific markup out of every existing section. What's left should only be: layout settings (columns/gap/width/padding/background) + a blocks slot.
This is the biggest, riskiest phase — do it section-by-section, not all at once.

Phase 5 — Fork governance
Since forkability is the whole point, write:

theme-architecture.md explaining the 5 layers and the rule "sections don't hardcode content, blocks don't reach outside their own settings"
naming convention (e.g. _ prefix for internal-only snippets vs. public blocks)
Phase 6 — QA pass

bun run check (lint) clean
Manually verify every block's settings are self-scoped (Phase check above)
Confirm nesting depth and total block count are within the platform's limits
Open the theme editor and check every section/block combination for orphaned or nonsensical setting groupings
Basic Lighthouse + axe pass on a page assembled purely from the new blocks

If it'd help, I can sketch the actual /blocks/button.liquid + a section schema referencing "@theme" as a concrete starting template — just say the word.
