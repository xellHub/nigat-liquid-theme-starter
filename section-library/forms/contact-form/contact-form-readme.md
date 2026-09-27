---
schema_version: 1
document_type: family
id: forms.contact-form
group: forms
family: contact-form
variant: null
status: implemented
summary: A family for structured customer inquiries.
tags:
  - forms
  - contact-form
  - section-family
---

# Contact Form

A family for structured customer inquiries.

## Purpose

A family for structured customer inquiries.

## Physical composition

Labeled identity and message fields, contextual guidance, validation feedback, and a clear submit region.

## Psychology

They reduce submission anxiety by making effort, purpose, and outcome predictable. Unnecessary fields or ambiguous consent weaken trust. Within this family, variants must change how attention or interaction flows—not merely visual styling.

## Best used when

- customers need to send a question that cannot be resolved through existing guidance.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when customers need to send a question that cannot be resolved through existing guidance; not when the request can be handled by FAQ content or a direct self-service action.

## Avoid when

- the request can be handled by FAQ content or a direct self-service action.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

A merchant uses this family when customers need to send a question that cannot be resolved through existing guidance, then selects a child variant whose structure matches the available content.

## Bad usage

Using this family when the request can be handled by FAQ content or a direct self-service action creates unnecessary visual or interaction cost. Prefer faq or rich-text.

## Content requirements

- **Required:** Visible labels, a clear submit action, validation feedback, and an honest explanation of data use.
- **Recommended:** Collect only necessary fields and state response expectations.
- **Unsupported:** Preselected consent, hidden requirements, or collection of data without a defined purpose.

## Accessibility requirements

- Associate every control with a visible label and expose errors programmatically.
- Maintain predictable keyboard order and visible focus.
- Announce success and failure without relying on color alone.

## AI-agent guidance

- **Choose this when:** customers need to send a question that cannot be resolved through existing guidance, and at least one child variant matches the available content
- **Reject this when:** the request can be handled by FAQ content or a direct self-service action, or no concrete variant has evidence for the required interaction
- **Prefer instead:** faq or rich-text.
- **Required evidence:** Content count, media shape, hierarchy, interaction model, viewport needs, and merchant-configurable data.

## Related files

- **Liquid:** `sticky-aside/sticky-aside.liquid`
- **Installation:** Copy the Liquid file to the theme's `sections/` directory as `contact-form.liquid`.
- **Usage:** `../../markdown-interface.md`
- **Psychology:** `../../markdown-interface.md`
- **Screenshot:** `not-applicable`

## Variant boundaries

Create a child variant only when structure, reading order, responsive transformation, or interaction behavior changes. Keep color, typography, spacing, copy, alignment options, and ordinary content counts as schema settings.

## Available variants

| Variant        | Structural distinction                                       | Best for                                                                        | Avoid for                       | Status      |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------- | ------------------------------- | ----------- |
| `sticky-aside` | A sticky 30% guidance column sits beside a 70% inquiry form. | Detailed support requests where response expectations help the customer submit. | Very short one-field inquiries. | Implemented |
