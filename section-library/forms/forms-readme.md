---
schema_version: 1
document_type: group
id: forms
group: forms
family: null
variant: null
status: ready
summary: Customer-input families for communication, consent, and subscription.
tags:
  - forms
  - section-group
  - Liquid theme
---

# Forms

Customer-input families for communication, consent, and subscription.

## Purpose

Organize related forms section families so variants can be compared by structure and behavior before installation.

## Physical composition

Form families organize labels, controls, validation, supporting guidance, consent language, and submission feedback into a clear reading and focus sequence.

## Psychology

They reduce submission anxiety by making effort, purpose, and outcome predictable. Unnecessary fields or ambiguous consent weaken trust.

## Best used when

- the customer has a clear reason to provide information and the merchant can explain what happens next.
- The surrounding page gives the composition enough context and space to perform its role.

**Decision rule:** Best used when the customer has a clear reason to provide information and the merchant can explain what happens next; not when the same goal can be completed through a direct link or without collecting personal data.

## Avoid when

- the same goal can be completed through a direct link or without collecting personal data.
- A simpler section can communicate the same information with less interaction or visual weight.

## Good usage

Use this group to compare its families against the actual content and customer task, then descend into one family to select a concrete variant.

## Bad usage

Using the Forms group as a visual mood category leads to mismatched behavior. Choose it only when its customer task matches the page.

## Content requirements

- **Required:** Visible labels, a clear submit action, validation feedback, and an honest explanation of data use.
- **Recommended:** Collect only necessary fields and state response expectations.
- **Unsupported:** Preselected consent, hidden requirements, or collection of data without a defined purpose.

## Accessibility requirements

- Associate every control with a visible label and expose errors programmatically.
- Maintain predictable keyboard order and visible focus.
- Announce success and failure without relying on color alone.

## AI-agent guidance

- **Choose this when:** the requested composition matches this group’s purpose: the customer has a clear reason to provide information and the merchant can explain what happens next
- **Reject this when:** the same goal can be completed through a direct link or without collecting personal data
- **Prefer instead:** a text callout or direct action.
- **Required evidence:** The page objective, content inventory, interaction requirements, and accessibility constraints.

## Related files

- **Liquid:** `not-applicable`
- **Usage:** `../markdown-interface.md`
- **Psychology:** `../markdown-interface.md`
- **Screenshot:** `not-applicable`

## Section families

- [contact-form](./contact-form/contact-form-readme.md)
