---
schema_version: 1
document_type: family
id: text.faq
group: text
family: faq
variant: null
status: implemented
summary: Layout families composed from reusable disclosure, media, content, and action blocks.
tags:
  - text
  - faq
  - section-family
---

# FAQ

A family for progressively disclosed questions and answers.

## Architecture

FAQ sections own layout, width, spacing, and color scheme. Questions use the foundational `accordion-item` composite, answers use nested `text` atoms, and introductory content uses `group`, `heading`, and `text`.

The lifestyle-media variant adds one private `_faq-media` extension because its overlapping decorative artwork is structurally distinct from the general image atom.

## Accessibility

Disclosure controls use native `details` and `summary`. Questions remain keyboard-operable, open state is exposed natively, and answers are readable in source order.

## Available variants

| Variant           | Structural distinction                                                          | Best for                                      | Status                          |
| ----------------- | ------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------- |
| `lifestyle-media` | Intro group above media and disclosures, with optional decorative media accent. | Lifestyle brands and visually supported FAQs. | Foundational-block architecture |
