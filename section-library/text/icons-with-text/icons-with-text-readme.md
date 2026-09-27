---
schema_version: 1
document_type: family
id: text.icons-with-text
group: text
family: icons-with-text
variant: icons-with-text
status: ready
summary: A responsive layout shell for reusable icon-led claim blocks.
tags:
  - text
  - icons-with-text
  - trust-signals
  - section-family
---

# Icons With Text

A responsive grid for short benefits, service facts, or brand values.

## Physical anatomy

The section owns grid columns, width, spacing, color scheme, and optional surface. Each claim is an independent `icon-with-text` atom or nested `feature-item` composite. Introductory heading and text blocks can be placed in any logical order.

## Responsive behavior

The desktop column setting collapses to two columns and then one as the available container width decreases. Image and icon sizing remains scoped to each claim block.

## Accessibility

Built-in decorative icons are hidden from assistive technology. Linked claims use a semantic anchor, while headings and descriptive copy remain readable without relying on visual position.

## Extension boundary

Create a new block only for genuinely new claim behavior or interaction. Do not add section-owned content, color, font, or icon settings.
