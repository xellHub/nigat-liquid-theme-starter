---
schema_version: 1
document_type: family
id: text.pull-quote
group: text
family: pull-quote
variant: null
status: scaffold
summary: A family emphasizing a quotation or testimonial.
tags:
  - text
  - pull-quote
  - section-family
---

# Pull Quote

A family emphasizing a quotation or testimonial.

## Purpose

A family emphasizing a quotation or testimonial.

## Physical composition

A large quotation, attribution, and optional contextual mark occupy a focused text region.

## Psychology

They reduce uncertainty through clarity and scanning. Oversized claims, buried limitations, or dense undifferentiated copy undermine trust. Within this family, variants must change how attention or interaction flows—not merely visual styling.

## Best used when

- a credible attributed statement supports the surrounding narrative.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when a credible attributed statement supports the surrounding narrative; not when the quotation is anonymous, unverifiable, or substitutes for necessary evidence.

## Avoid when

- the quotation is anonymous, unverifiable, or substitutes for necessary evidence.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

A merchant uses this family when a credible attributed statement supports the surrounding narrative, then selects a child variant whose structure matches the available content.

## Bad usage

Using this family when the quotation is anonymous, unverifiable, or substitutes for necessary evidence creates unnecessary visual or interaction cost. Prefer rich-text.

## Content requirements

- **Required:** Structured, accurate copy with a clear heading and readable hierarchy.
- **Recommended:** Short paragraphs, descriptive headings, and progressive disclosure for optional detail.
- **Unsupported:** Critical terms hidden in low-emphasis text or motion used to force reading speed.

## Accessibility requirements

- Use semantic headings, lists, quotations, and disclosure controls.
- Maintain readable line length, contrast, and zoom behavior.
- Ensure icons supplement rather than replace textual meaning.

## AI-agent guidance

- **Choose this when:** a credible attributed statement supports the surrounding narrative, and at least one child variant matches the available content
- **Reject this when:** the quotation is anonymous, unverifiable, or substitutes for necessary evidence, or no concrete variant has evidence for the required interaction
- **Prefer instead:** rich-text.
- **Required evidence:** Content count, media shape, hierarchy, interaction model, viewport needs, and merchant-configurable data.

## Related files

- **Liquid:** `../quotes-carousel/quotes-carousel.liquid`
- **Usage:** `../quotes-carousel/usage.md`
- **Psychology:** `../quotes-carousel/psychology.md`
- **Screenshot:** `../quotes-carousel/image.png`

## Variant boundaries

Create a child variant only when structure, reading order, responsive transformation, or interaction behavior changes. Keep color, typography, spacing, copy, alignment options, and ordinary content counts as schema settings.

## Available variants

| Variant           | Structural distinction                                                                                                                     | Best for                                                                  | Avoid for                                              | Status |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------ | ------ |
| `quotes-carousel` | Centered testimonial slider with top publication logo, large active theme serif typography, minimal flanking chevrons, and pagination dots | Highlighting prestigious press reviews, endorsements, and customer praise | Long-form story testimonials with multi-paragraph text | Ready  |
