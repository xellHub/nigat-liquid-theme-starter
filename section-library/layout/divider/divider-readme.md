---
schema_version: 1
document_type: family
id: layout.divider
group: layout
family: divider
variant: null
status: scaffold
summary: A family for semantic visual separation.
tags:
  - layout
  - divider
  - section-family
---

# Divider

A family for semantic visual separation.

## Purpose

A family for semantic visual separation.

## Physical composition

A horizontal spacing region with an optional decorative rule that does not interrupt document semantics.

## Psychology

They support comprehension through rhythm and grouping. Decorative structure should clarify relationships rather than create empty friction. Within this family, variants must change how attention or interaction flows—not merely visual styling.

## Best used when

- adjacent sections need clearer grouping or breathing room.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when adjacent sections need clearer grouping or breathing room; not when spacing can be solved within either adjacent section.

## Avoid when

- spacing can be solved within either adjacent section.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

A merchant uses this family when adjacent sections need clearer grouping or breathing room, then selects a child variant whose structure matches the available content.

## Bad usage

Using this family when spacing can be solved within either adjacent section creates unnecessary visual or interaction cost. Prefer section padding settings.

## Content requirements

- **Required:** A defined structural purpose and predictable behavior across viewport sizes.
- **Recommended:** Minimal controls, scoped output, and alignment with surrounding page rhythm.
- **Unsupported:** Unbounded scripts, inaccessible embedded UI, or structure used only to patch unrelated layout defects.

## Accessibility requirements

- Do not alter semantic order solely for visual placement.
- Keep custom content keyboard reachable and focus-visible.
- Avoid decorative separators being announced by assistive technology.

## AI-agent guidance

- **Choose this when:** adjacent sections need clearer grouping or breathing room, and at least one child variant matches the available content
- **Reject this when:** spacing can be solved within either adjacent section, or no concrete variant has evidence for the required interaction
- **Prefer instead:** section padding settings.
- **Required evidence:** Content count, media shape, hierarchy, interaction model, viewport needs, and merchant-configurable data.

## Related files

- **Liquid:** `not-applicable`
- **Usage:** `../../markdown-interface.md`
- **Psychology:** `../../markdown-interface.md`
- **Screenshot:** `not-applicable`

## Variant boundaries

Create a child variant only when structure, reading order, responsive transformation, or interaction behavior changes. Keep color, typography, spacing, copy, alignment options, and ordinary content counts as schema settings.

## Available variants

No concrete variants are registered yet.

| Variant        | Structural distinction                                  | Best for       | Avoid for               | Status   |
| -------------- | ------------------------------------------------------- | -------------- | ----------------------- | -------- |
| Not registered | A concrete structural implementation is still required. | Not applicable | Production installation | Scaffold |
