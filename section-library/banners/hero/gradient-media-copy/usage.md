---
schema_version: 1
document_type: usage
id: banners.hero.gradient-media-copy
group: banners
family: hero
variant: gradient-media-copy
status: ready
summary: Configuration reference for the Gradient Media Copy hero.
tags:
  - hero
  - settings
  - configuration
---

# Gradient Media Copy Usage

Configuration guidance for installing and tuning the Gradient Media Copy variant.

## Purpose

Configure the hero without weakening its hierarchy, contrast, crop safety, or responsive behavior.

## Physical composition

Selected media fills the section; content occupies a bounded region opposite the focal side, with a directional scrim between them.

## Psychology

Correct image direction establishes a fast sequence: context, promise, explanation, then action. Incorrect direction makes the scrim fight the subject.

## Best used when

- A campaign needs a strong visual opening and no more than two actions.
- Separate desktop and mobile crops are available when subject placement changes.

**Decision rule:** Best used when the merchant has one focal image and concise copy; not when content density requires a normal content section.

## Avoid when

- Text contrast cannot be verified against the selected image.
- The image subject has no safe responsive crop.

## Good usage

Set the focal side to right for a right-positioned subject, use a dark scrim, and connect the primary button directly to the heading promise.

## Bad usage

Selecting the left focal side for a left-positioned subject covers it with the strongest scrim. Reverse the setting or choose another crop.

## Content requirements

- **Required:** Heading, image decision, focal side, and destination for every visible button.
- **Recommended:** Dedicated mobile image, concise body copy, and one primary action.
- **Unsupported:** Essential text embedded in imagery or unverified button destinations.

## Accessibility requirements

- Keep heading order appropriate to the surrounding template.
- Verify contrast after every media or scrim change.
- Link labels must describe their destination without relying on surrounding copy.

## AI-agent guidance

- **Choose this when:** Inputs include a campaign message, suitable image, and one dominant destination.
- **Reject this when:** Image position, action destination, or contrast cannot be determined.
- **Prefer instead:** Split panels or rich text when full-cover media is unsafe.
- **Required evidence:** Media dimensions, focal position, heading hierarchy, destinations, and section position.

## Related files

- **Migrated preset:** `section-library/banners/hero/presets/presets.liquid` (`Hero full-frame media`)
- **Usage:** usage.md
- **Psychology:** psychology.md
- **Screenshot:** screenshot.png

## Settings interface

| Setting              | Type         | Default                        | Effect                      | Constraint                   |
| -------------------- | ------------ | ------------------------------ | --------------------------- | ---------------------------- |
| image                | Image picker | Empty                          | Desktop media               | Prefer 16:9 or wider         |
| mobile_image         | Image picker | Empty                          | Media below 750 px          | Preserve the focal point     |
| media_side           | Select       | Right                          | Controls gradient direction | Match the subject side       |
| scrim_tone           | Select       | Dark                           | Controls text contrast      | Verify against media         |
| height               | Select       | Medium                         | Controls section height     | Mobile resolves to 560 px    |
| eyebrow              | Text         | New collection                 | Adds context                | Keep brief                   |
| heading              | Text         | Designed to last, made to love | Primary message             | Prefer under 55 characters   |
| text                 | Rich text    | One paragraph                  | Supporting context          | Prefer under 140 characters  |
| primary_label/link   | Text and URL | Shop collection                | Dominant action             | Use one clear destination    |
| secondary_label/link | Text and URL | Our approach                   | Secondary action            | Omit when unnecessary        |
| text_alignment       | Select       | Left                           | Aligns copy                 | Does not alter reading order |
| background_color     | Color        | Dark olive                     | Empty fallback              | Maintain contrast            |
| accent_color         | Color        | Olive                          | Primary button              | Maintain contrast            |
| content_width        | Range        | 580 px                         | Limits copy measure         | 360–720 px                   |
| page_width           | Range        | 1400 px                        | Limits outer width          | 1000–1800 px                 |
| padding_top/bottom   | Range        | 0 px                           | Adds vertical space         | 0–120 px                     |

## Blocks interface

This variant has no blocks. Its fixed hierarchy is intentional; choose another family when repeatable or rearrangeable content is required.

## Configuration recipes

- **Right-weighted campaign:** Right focal side, dark scrim, left copy, medium height, one primary action.
- **Light editorial:** Left focal side, light scrim, right copy, large height, two actions.
- **Compact announcement:** Right focal side, dark scrim, small height, no eyebrow, one sentence.
