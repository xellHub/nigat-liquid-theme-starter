---
schema_version: 1
document_type: group
id: layout
group: layout
family: null
variant: null
status: ready
summary: Structural families for merchant-authored content and page separation.
tags:
  - layout
  - section-group
  - shopify
---

# Layout

Structural families for merchant-authored content and page separation.

## Purpose

Organize related layout section families so variants can be compared by structure and behavior before installation.

## Physical composition

Layout families provide neutral containers, separators, or controlled custom-rendering regions without prescribing a merchandising narrative.

## Psychology

They support comprehension through rhythm and grouping. Decorative structure should clarify relationships rather than create empty friction.

## Best used when

- the page needs structural control that no content-specific family provides.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when the page needs structural control that no content-specific family provides; not when a purpose-built family already expresses the content and interaction more clearly.

## Avoid when

- a purpose-built family already expresses the content and interaction more clearly.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

Use this group to compare its families against the actual content and customer task, then descend into one family to select a concrete variant.

## Bad usage

Using the Layout group as a visual mood category leads to mismatched behavior. Choose it only when its customer task matches the page.

## Content requirements

- **Required:** A defined structural purpose and predictable behavior across viewport sizes.
- **Recommended:** Minimal controls, scoped output, and alignment with surrounding page rhythm.
- **Unsupported:** Unbounded scripts, inaccessible embedded UI, or structure used only to patch unrelated layout defects.

## Accessibility requirements

- Do not alter semantic order solely for visual placement.
- Keep custom content keyboard reachable and focus-visible.
- Avoid decorative separators being announced by assistive technology.

## AI-agent guidance

- **Choose this when:** the requested composition matches this group’s purpose: the page needs structural control that no content-specific family provides
- **Reject this when:** a purpose-built family already expresses the content and interaction more clearly
- **Prefer instead:** the closest content-specific family.
- **Required evidence:** The page objective, content inventory, interaction requirements, and accessibility constraints.

## Related files

- **Liquid:** `not-applicable`
- **Usage:** `../markdown-interface.md`
- **Psychology:** `../markdown-interface.md`
- **Screenshot:** `not-applicable`

## Section families

- [custom-liquid](./custom-liquid/custom-liquid-readme.md)
- [custom-section](./custom-section/custom-section-readme.md)
- [divider](./divider/divider-readme.md)
