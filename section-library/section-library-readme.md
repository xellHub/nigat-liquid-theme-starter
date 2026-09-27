---
schema_version: 1
document_type: library
id: section-library
group: null
family: null
variant: null
status: ready
summary: Defines the organization and decision rules for the Liquid theme section library.
tags:
  - Liquid theme
  - sections
  - library
  - ai-agent
---

# Section Library

A copy-ready Liquid theme section catalog organized as groups, section families, and concrete variants.

## Purpose

Give merchants, engineers, and AI agents a predictable way to discover, evaluate, and install reusable Liquid theme sections.

## Physical composition

The filesystem has three semantic levels: a broad group, a section family, and a concrete variant package. Documentation remains beside the concept it describes.

## Psychology

A consistent hierarchy reduces choice overload and makes tradeoffs visible before a section is installed. The catalog must not imply that every visually striking option is appropriate.

## Best used when

- a reusable Liquid theme section must be selected by customer need, content shape, and structural behavior.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when a reusable Liquid theme section must be selected by customer need, content shape, and structural behavior; not when a one-off page fragment has no reusable behavior or cannot satisfy the package contract.

## Avoid when

- a one-off page fragment has no reusable behavior or cannot satisfy the package contract.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

An agent compares family guidance, reads variant evidence, and selects the least complex variant that satisfies the merchant’s content.

## Bad usage

Choosing a section from its screenshot alone ignores content, accessibility, and behavioral constraints; inspect the decision rules first.

## Content requirements

- **Required:** A valid group, family, and concrete variant identity.
- **Recommended:** Searchable semantic names and complete evidence for every ready variant.
- **Unsupported:** Unclassified Liquid files or installable code placed directly in a group or family directory.

## Accessibility requirements

- Every ready variant defines and passes its own accessibility requirements.
- Documentation uses semantic headings, descriptive links, and plain language.
- Screenshots supplement documentation and never replace textual explanation.

## AI-agent guidance

- **Choose this when:** the task requires discovering or installing a reusable Liquid theme section
- **Reject this when:** the requested artifact is a full template, layout, snippet, or store-specific one-off
- **Prefer instead:** the live theme directories when modifying an already-installed section.
- **Required evidence:** The requested page context, content type, interaction needs, and available merchant data.

## Related files

- **Liquid:** `not-applicable`
- **Usage:** `markdown-interface.md`
- **Psychology:** `markdown-interface.md`
- **Screenshot:** `not-applicable`

## Groups

- `banners/`
- `collections/`
- `forms/`
- `layout/`
- `products/`
- `storytelling/`
- `text/`

## Hierarchy

```text
section-library/<group>/<section-family>/<specific-variant>/
```

Only concrete variant folders contain installable Liquid files.
