---
schema_version: 1
document_type: library
id: section-library--markdown-interface
group: null
family: null
variant: null
status: ready
summary: Defines the required content and structure of section-library Markdown documents.
tags:
  - documentation
  - interface
  - ai-agent
---

# Section Library Markdown Interface

Every Markdown document in the section library must use this contract. Replace
all angle-bracket placeholders and remove instructional comments before marking
a document as ready.

## Purpose

Make section documentation consistent, decision-oriented, testable, and
readable by both people and AI agents.

## Physical composition

Each installable section lives at `section-library/<group>/<family>/<variant>/`.
Every package contains exactly one registered canonical `.liquid` file, a
matching `<variant>-readme.md`, `usage.md`, `psychology.md`, and at least one
`image.*` or `screenshot.*` visual. The canonical Liquid file is mirrored to
one runtime file under `sections/` and registered in
`scripts/validate-section-library.mjs`.

Reference-only folders may retain historical design notes and images after a
variant is consolidated into another section's presets, but they must not keep
an executable `.liquid` implementation. This prevents multiple sources of
truth while retaining design evidence.

## Psychology

The interface reduces ambiguity and visual-only selection by requiring authors
to explain attention, trust, decision support, good usage, and harmful usage.

## Best used when

- A section-library concept or implementation needs durable documentation.
- An AI agent must compare alternatives using explicit evidence.

**Decision rule:** Best used when documenting a reusable section-library item; not when documenting unrelated project code.

## Avoid when

- The document belongs outside `section-library/`.
- A short code comment can communicate the complete requirement more clearly.

## Good usage

A family document (`hero--split.md`) states its physical boundaries, customer
psychology, selection conditions, rejection conditions, and the evidence
needed to choose a variant — and lists its variants by their full ids
(`hero--split--image-left`) rather than assuming folder proximity implies
relationship.

## Bad usage

Copying the headings while filling them with generic promotional adjectives
creates apparent conformance without helping a merchant or agent decide.

## Content requirements

- **Required:** Complete frontmatter, every shared heading, and applicable type-specific additions for authored narrative documents. Generated `usage.md` files use their generator marker instead of frontmatter.
- **Recommended:** Concrete language, observable conditions, and links to related files by id.
- **Unsupported:** Empty headings, undocumented omissions, or visual claims without behavioral explanation.

## Accessibility requirements

- Use semantic heading order and descriptive link text.
- Keep tables understandable through explicit column headings.
- Describe screenshot information in text rather than relying on the image alone.

## AI-agent guidance

- **Choose this when:** Creating or reviewing any Markdown document under `section-library/`.
- **Reject this when:** The target documentation is outside the section library.
- **Prefer instead:** The owning subsystem's documentation contract for unrelated files.
- **Required evidence:** The document type, id segments, related files, intended audience, and section behavior.

## Related files

- **Liquid:** `not-applicable`
- **Usage:** `README.md`
- **Psychology:** `not-applicable`
- **Screenshot:** `not-applicable`

## Required frontmatter

```yaml
---
schema_version: 1
document_type: <library | group | family | variant | usage | psychology>
id: <group--family or group--family--variant>
group: <group-name>
family: <family-name or null>
variant: <variant-name or null>
status: <scaffold | draft | ready | deprecated>
summary: <one plain sentence describing the document subject>
tags:
  - <searchable-semantic-tag>
---
```

## Required document body

```markdown
# <Human-readable name>

<One sentence stating what this section, family, or document is.>

## Purpose

<Describe the customer or merchant problem it solves. Do not describe only its
appearance.>

## Physical composition

<Describe the visible structure: regions, alignment, proportions, hierarchy,
media placement, text placement, controls, rhythm, and responsive changes.>

## Psychology

<Explain how the composition guides attention, reduces uncertainty, creates
trust, supports comparison, or encourages a decision. State any risk of visual
pressure, distraction, or dark-pattern behavior.>

## Best used when

- <Concrete content, audience, or layout condition where this is appropriate.>
- <Another positive condition.>

**Decision rule:** Best used when <X>; not when <Y>.

## Avoid when

- <Concrete condition where another family or variant is more appropriate.>
- <Content or interaction limitation that makes this a poor choice.>

## Good usage

<Describe one specific implementation that uses the section well and explain
why it works.>

## Bad usage

<Describe one specific misuse, the harm it causes, and the preferred
alternative.>

## Content requirements

- **Required:** <minimum content or data needed to render correctly>
- **Recommended:** <content shape, length, image treatment, or item count>
- **Unsupported:** <content or behavior this pattern must not attempt>

## Accessibility requirements

- <Semantic structure and heading requirement.>
- <Keyboard and focus behavior, when interactive.>
- <Alt-text, contrast, motion, caption, or reduced-motion requirement.>

## AI-agent guidance

- **Choose this when:** <machine-actionable selection conditions>
- **Reject this when:** <machine-actionable exclusion conditions>
- **Prefer instead:** <alternative family or variant and triggering condition>
- **Required evidence:** <merchant data or page context the agent must inspect>

## Related files

<List the files in the owning package and the installed runtime mirror.>

- **Library Liquid:** `<variant>.liquid`
- **Runtime mirror:** `sections/<section-name>.liquid`
- **Usage:** `usage.md`
- **Psychology:** `psychology.md`
- **Screenshot:** `image.png` or `screenshot.svg`
```

## Document-type additions

The required body above is the shared interface. Add these sections after it
for the matching `document_type`.

### `family`

```markdown
## Variant boundaries

<Define which differences require a child variant and which remain ordinary
theme-editor settings.>

## Available variants

| Variant id                  | Structural distinction | Best for    | Avoid for   | Status   |
| --------------------------- | ---------------------- | ----------- | ----------- | -------- |
| <family-id>--<variant-name> | <difference>           | <condition> | <condition> | <status> |
```

### `variant`

```markdown
## Visual anatomy

1. <First visible region>
2. <Second visible region>
3. <Interaction or action region>

## Responsive transformation

<State exactly how the composition changes across narrow and wide viewports.>

## Liquid behavior

<Explain Liquid theme objects, render order, empty states, schema, CSS, JavaScript,
and external dependencies. Name the exact file: sections/<id>.liquid or
blocks/<id>.liquid.>
```

### `usage`

Installable package usage files are generated from live section and nested
block schemas by `scripts/generate-section-usage.mjs`. Do not hand-edit them;
change the owning schema and regenerate. The generated document must enumerate
all section settings, permitted top-level blocks, recursively reachable curated
blocks, each block's settings, and allowed children.

```markdown
## Settings interface

| Setting | Type           | Default | Effect     | Constraint   |
| ------- | -------------- | ------- | ---------- | ------------ |
| <id>    | <Liquid theme type> | <value> | <behavior> | <constraint> |

## Blocks interface

| Block  |    Limit | Purpose   | Required settings | Failure behavior |
| ------ | -------: | --------- | ----------------- | ---------------- |
| <type> | <number> | <purpose> | <settings>        | <behavior>       |

## Configuration recipes

<Provide named, reproducible setting and block combinations.>
```

### `psychology`

```markdown
## Attention sequence

1. <What customers notice first and why>
2. <What they process next>
3. <What decision or action follows>

## Ethical safeguards

- <How the section avoids manufactured urgency or coercion.>
- <How claims, pricing, controls, and actions remain clear.>

## Audience fit

| Audience state | Expected response | Appropriate? | Reason   |
| -------------- | ----------------- | ------------ | -------- |
| <state>        | <response>        | <yes/no>     | <reason> |
```

## Conformance rules

- Do not omit required headings; use `Not applicable` with a reason when needed.
- Use observable, testable language instead of adjectives such as “beautiful”
  or “modern” without explanation.
- Good and bad usage must be concrete examples, not restatements of purpose.
- Every document must include one explicit `Best used when X; not when Y`
  decision rule.
- AI-agent guidance must contain selection and rejection conditions.
- Family documents describe families; only variant documents may describe an
  installable Liquid implementation.
- A document's `id`, its filename (minus extension), and its `group`/`family`/
  `variant` frontmatter fields joined with `--` must match exactly. A mismatch
  breaks lookup, since there is no folder path to fall back on.
