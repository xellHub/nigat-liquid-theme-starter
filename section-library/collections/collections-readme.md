---
schema_version: 1
document_type: group
id: collections
group: collections
family: null
variant: null
status: ready
summary: Catalog-navigation families for presenting multiple collection destinations.
tags:
  - collections
  - section-group
  - shopify
---

# Collections

Catalog-navigation families for presenting multiple collection destinations.

## Purpose

Organize related collections section families so variants can be compared by structure and behavior before installation.

## Physical composition

Collection families arrange linked destinations through cards, text lists, editorial groupings, grids, or horizontal sequences with consistent labels and hit areas.

## Psychology

They reduce choice complexity by exposing category structure. Unequal emphasis should communicate real priority rather than manipulate attention toward arbitrary inventory.

## Best used when

- customers need to choose among clearly distinct catalog destinations.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when customers need to choose among clearly distinct catalog destinations; not when the page should promote individual products or explain one long-form story.

## Avoid when

- the page should promote individual products or explain one long-form story.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

Use this group to compare its families against the actual content and customer task, then descend into one family to select a concrete variant.

## Bad usage

Using the Collections group as a visual mood category leads to mismatched behavior. Choose it only when its customer task matches the page.

## Content requirements

- **Required:** At least two valid collection destinations with distinct labels.
- **Recommended:** Concise collection names, consistent imagery, and a deliberate ordering strategy.
- **Unsupported:** Product-level variant selection or unrelated editorial links mixed into the same set.

## Accessibility requirements

- Use descriptive linked labels and sufficiently large interactive targets.
- Keep DOM and keyboard order aligned with visual order.
- Give collection images meaningful alt text when they add information.

## AI-agent guidance

- **Choose this when:** the requested composition matches this group’s purpose: customers need to choose among clearly distinct catalog destinations
- **Reject this when:** the page should promote individual products or explain one long-form story
- **Prefer instead:** a product or storytelling family.
- **Required evidence:** The page objective, content inventory, interaction requirements, and accessibility constraints.

## Related files

- **Liquid:** `not-applicable`
- **Usage:** `../markdown-interface.md`
- **Psychology:** `../markdown-interface.md`
- **Screenshot:** `not-applicable`

## Section families

- [collection-links-spotlight](./collection-links-spotlight/collection-links-spotlight-readme.md)
- [collection-links-text](./collection-links-text/collection-links-text-readme.md)
- [collection-list-bento](./collection-list-bento/collection-list-bento-readme.md)
- [collection-list-carousel](./collection-list-carousel/collection-list-carousel-readme.md)
- [collection-list-editorial](./collection-list-editorial/collection-list-editorial-readme.md)
- [collection-list-grid](./collection-list-grid/collection-list-grid-readme.md)
