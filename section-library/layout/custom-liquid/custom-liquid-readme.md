---
schema_version: 1
document_type: family
id: layout.custom-liquid
group: layout
family: custom-liquid
variant: null
status: scaffold
summary: A family for controlled merchant-authored Liquid.
tags:
  - layout
  - custom-liquid
  - section-family
---

# Custom Liquid

A family for controlled merchant-authored Liquid.

## Purpose

A family for controlled merchant-authored Liquid.

## Physical composition

A scoped output container whose visible structure is determined by validated merchant markup.

## Psychology

They support comprehension through rhythm and grouping. Decorative structure should clarify relationships rather than create empty friction. Within this family, variants must change how attention or interaction flows—not merely visual styling.

## Best used when

- a trusted merchant needs a small Shopify-aware composition unavailable elsewhere.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when a trusted merchant needs a small Shopify-aware composition unavailable elsewhere; not when the requirement can be met by an existing supported section.

## Avoid when

- the requirement can be met by an existing supported section.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

A merchant uses this family when a trusted merchant needs a small Shopify-aware composition unavailable elsewhere, then selects a child variant whose structure matches the available content.

## Bad usage

Using this family when the requirement can be met by an existing supported section creates unnecessary visual or interaction cost. Prefer custom-section or a purpose-built family.

## Content requirements

- **Required:** A defined structural purpose and predictable behavior across viewport sizes.
- **Recommended:** Minimal controls, scoped output, and alignment with surrounding page rhythm.
- **Unsupported:** Unbounded scripts, inaccessible embedded UI, or structure used only to patch unrelated layout defects.

## Accessibility requirements

- Do not alter semantic order solely for visual placement.
- Keep custom content keyboard reachable and focus-visible.
- Avoid decorative separators being announced by assistive technology.

## AI-agent guidance

- **Choose this when:** a trusted merchant needs a small Shopify-aware composition unavailable elsewhere, and at least one child variant matches the available content
- **Reject this when:** the requirement can be met by an existing supported section, or no concrete variant has evidence for the required interaction
- **Prefer instead:** custom-section or a purpose-built family.
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
