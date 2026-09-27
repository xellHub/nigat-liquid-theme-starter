# AGENTS.md — Guidelines for AI Coding Assistants

> Applicable to: **Claude**, **OpenCode**, **Codex**, **Antigravity**, and all autonomous or pair-programming coding agents.


This repository follows strict design system architecture, token validation, and a centralized section library model. All agents must comply with the rules below without exception.

### Context & Scope

* Do **not** scan, inspect, or analyze the entire codebase unless explicitly requested.
* The developer will provide the necessary context or explicitly ask you to inspect additional files/code.
* Start with the files and code directly relevant to the current prompt.
* Do not search for unrelated implementations, patterns, or potential improvements.
* Treat each prompt as a small, isolated change unless the developer explicitly states otherwise.
* Make the smallest reasonable change, verify it once if needed, and **stop**.
* Do not enter repetitive investigation, refactoring, or validation loops.


## Package Manager

- Bun 1.4 or newer is the only supported package manager.
- Use `bun install` and `bun run <script>`. Never invoke npm, pnpm, or Yarn in this repository.
- `package.json` declares `packageManager: bun@1.4.0` so incompatible package managers fail immediately.

---

## 1. Never Edit `sections/` Directly

- **Strict prohibition:** Do **NOT** create, edit, patch, format, overwrite, move, or delete files under `sections/` directly. This applies even when a runtime file is hardlinked: writing through `sections/` would mutate the canonical inode but still violates the required source-path workflow.
- **Canonical edit path:** All section implementation changes must be made in `section-library/<group>/<family>/<variant>/<variant>.liquid`.
- **Generated runtime:** `sections/` is an installation target that may be overwritten at any time. After changing a canonical library Liquid file, run `bun run sync`.
- **Non-mirrored files:** If a task requires changing a file under `sections/` that is not registered as a library mirror, first create and register an appropriate canonical library source or stop and ask the user for direction.
- **Templates:** Homepage integrations must still follow Section 5 below; do not treat template changes as permission to patch a runtime section.
- **Rationale:** A single write direction prevents runtime changes from being lost and keeps the section library authoritative.

---

## 2. Section Library is the Single Source of Truth

- All component improvements, styling updates, schema modifications, and feature expansions must target the library package under:
  ```text
  section-library/<group>/<family>/<variant>/
  ```
- Each library package must maintain complete self-containment:
  - `<variant>.liquid` — The canonical implementation.
  - `<variant>-readme.md` — Physical anatomy, responsive behavior, and accessibility.
  - `usage.md` — Complete schema settings and block documentation.
  - `psychology.md` — Attention flow, decision support, and conversion rationale.
  - `image.png` (or screenshot) — Visual design reference.

---

## 3. Synchronize Runtime Sections and Validate Zero Drift

- When a section in `section-library/` is created or updated, register its mirror and run `bun run sync`. Never copy or patch the runtime file manually.
- Synchronization is strictly one-way: `section-library/` → `sections/`. The sync tool creates or replaces runtime files as hardlinks; it never imports runtime changes into the library.
- Because Git does not preserve hardlink inode relationships, run `bun run sync` after cloning, checkout, rebase, merge, or any operation that rewrites either side.
- Ensure the mirror pair is registered in `scripts/validate-section-library.mjs`.
- Always run the validation suite before finishing a task:
  ```bash
  bun run sync
  bun run sync check
  node scripts/validate-json.mjs
  node scripts/validate-palettes.mjs
  node scripts/validate-tokens.mjs
  node scripts/validate-section-library.mjs
  node scripts/check-composition.mjs
  bun run check
  ```
- Validation must pass with **0 drift** and **0 theme check errors**.

---

## 4. Universal Theme Token & Configuration Standard (`footer.liquid` Pattern)

Every section must follow the general configuration established in `sections/footer.liquid`. **No exceptions.**

### A. Root Container Color Scheme

Every section's root HTML element must include the dynamic color scheme helper:

```liquid
<section
  id="{{ section.id }}"
  class="my-section section {% if section.settings.color_scheme.id == settings.palette_5_light.id %}color-global{% else %}color-{{ section.settings.color_scheme.id }}{% endif %}"
>
```

### B. Schema Color Scheme Setting

Every section schema must declare the color scheme selector:

```json
{
  "type": "color_scheme",
  "id": "color_scheme",
  "label": "Color scheme",
  "default": "bare-light"
}
```

### C. Universal CSS Variables (No Hardcoded Colors or Fonts)

Never use hardcoded hex values (`#fff`, `#000`, `#121212`, etc.) or generic font stacks (`Arial`, `Georgia`, `sans-serif`) in place of theme tokens:

- **Backgrounds**: `var(--color-background)`, `var(--color-surface)`, `var(--color-surface-raised)`
- **Text**: `var(--color-text)`, `var(--color-muted)`, `color-mix(in srgb, var(--color-text) 72%, transparent)`
- **Accents & Buttons**: `var(--color-accent)`, `var(--color-accent-text)`, `var(--color-button)`, `var(--color-button-text)`
- **Borders & Dividers**: `var(--color-border)`, `color-mix(in srgb, var(--color-text) 12%, transparent)`
- **Typography**:
  - Headings: `font-family: var(--font-heading-family); font-weight: var(--font-heading-weight);`
  - Body / Subtext: `font-family: var(--font-body-family); font-weight: var(--font-body-weight);`

---

## 5. Homepage Integration via Library Import

- When adding sections to the homepage (`templates/index.json`), always ensure the section exists in the library with complete documentation and is registered in the validation suite.
- Section definitions in `templates/index.json` should use clean presets provided by the section library.

---

## 6. Single Typography Identity & The Fork-and-Specialize Philosophy

A single theme codebase must maintain **one unified typography identity**; it must never attempt to support multiple divergent font families, bloated multi-font pickers, or industry-specific styling conditionals within the same theme instance.

### A. The Fork-and-Specialize Model

- **Industry Specialization**: When adapting this theme for different verticals (e.g. an electronics store vs. a beauty & cosmetics boutique vs. culinary/gourmet food vs. architectural luxury furniture), **never** bloat a single theme with multi-font selectors, vertical-specific layout switches, or competing CSS overrides.
- **The Canonical Fork Workflow**:
  1. **Fork the repository** to create a specialized storefront instance.
  2. **Customize foundation tokens**: Update font families, letter-spacing, line-heights, color palettes, and radii in `assets/base.css`, `layout/theme.liquid`, and `config/settings_data.json`.
  3. **Preserve component architecture**: The section library, composite blocks, primitives, and validation suite remain 100% reusable and invariant across all forks.

### B. Invariant Structure vs. Specialized Identity

- **Structure is Shared**: Sections, blocks, schemas, and responsive layouts are structural invariants maintained centrally in `section-library/`.
- **Identity is Local to the Fork**: Fonts, colors, and corner radii represent brand identity and live strictly in the foundational token layer (`base.css` / `theme.liquid` / `settings_data.json`).
- **No Per-Component Font Overrides**: Never introduce font-family selectors or hardcoded font stacks into individual sections, blocks, or presets. All typography must inherit strictly from `--font-heading-family` and `--font-body-family`.

---

## 7. The 5-Layer Theme Block Architecture & Fine-Grained Composition Standard

Every component in this repository adheres strictly to the modern 5-layer dependency hierarchy. A layer may only depend on layers below it:

```text
Layer 1: Layout & Storeframe (layout/theme.liquid)
  ↓
Layer 2: Template (templates/*.json)
  ↓
Layer 3: Section Shell (section-library/.../<variant>.liquid → sections/<variant>.liquid)
  ↓
Layer 4: Composite Theme Blocks (blocks/group.liquid, blocks/surface.liquid, blocks/_<feature>-content.liquid)
  ↓
Layer 5: Atomic Theme Blocks (blocks/heading.liquid, blocks/text.liquid, blocks/button.liquid, blocks/badge.liquid)
  ↓
Non-Editable Plumbing (snippets/*.liquid)
  ↓
Design Tokens (config/settings_data.json, assets/base.css)
```

### A. The "No Monolithic / Atomic Content Settings" Mandate

- **Strict Prohibition:** Never embed editable headings, titles, descriptions, body copy, or action buttons/links as `schema.settings` inside sections or composite container blocks (e.g. `_interactive-step`, `_comparison-row`, cards, slides).
- **The Fine-Grained Theme Block Requirement:** Every text element, heading, and button MUST be decomposed into independent child theme blocks (`heading`, `text`, `button`, etc.) rendered via `{% content_for 'blocks' %}`.
- **Why This Matters to Merchants:**
  - **Sidebar Tree Selectability:** Each title, description, and button appears as an individual item in the Theme Editor sidebar hierarchy.
  - **Canvas Clickability:** Clicking on a heading or button directly on the visual preview selects that specific atomic block, not the outer section or container.
  - **Independent Control:** Merchants can independently edit, style, reorder, hide, or delete text elements and buttons without being trapped in an atomic inspector panel or relying on blank string fallbacks.
  - **Extensibility:** Merchants can freely insert additional blocks (`+ Add block`) such as badges, icons, secondary text, or app blocks into any container.

### B. Strict Block Whitelisting Down to Terminal Blocks

- **Container / Composite Blocks:** Blocks that render `{% content_for 'blocks' %}` must explicitly declare the specific blocks they accept in `"blocks": [...]`. Never accept arbitrary blocks that violate layout contracts.
- **Terminal / Leaf Blocks:** Atomic blocks (`heading`, `text`, `button`, `badge`, `icon`, `image`, `divider`, `spacer`, `price`, etc.) are terminal endpoints. They must **never** declare `"blocks"` in their schema and must **never** contain `{% content_for 'blocks' %}`.

### C. HTML5 Semantic Tree & Canvas Clickability Rule

- **No Interactive Nesting:** Never wrap `{% content_for 'blocks' %}` inside an HTML `<button>` or `<a>` tag (e.g. for accordion triggers or step headers).
- **Rationale:** Because child blocks can render buttons or links, nesting `<button>` or `<a>` inside an outer `<button>` is illegal in HTML5. It causes browser click dispatch bugs, invalidates keyboard focus, and breaks canvas selection in the visual theme editor.
- **Accessible Delegation:** Use semantic `<div>` elements with ARIA attributes and click event listeners that explicitly ignore clicks originating from interactive children:
  ```javascript
  step.addEventListener("click", (e) => {
    if (e.target.closest("a, button, input, select, textarea")) return;
    activate(index);
  });
  ```

### D. Action-Coupled Buttons Exception ("The Action-Only Coupling")

- **Freestanding vs. Coupled:** Marketing and promotional links pointing to external URLs must always be child `button` theme blocks. However, when a button's action is functionally coupled to internal section logic (e.g. section browser triggers, auto-open buttons, modal launchers, drawer toggles, form submits), the section or container is permitted to provide action-coupled controls.
- **The Mandate:** Coupling applies **strictly to the action** (triggering section state or event controllers). The button markup and styling **must still reuse and compose from the universal button contract** (`.theme-button`, token variables `--color-button`, `--color-button-text`, `--radius-button`, and standard styles/sizes).
- **Higher-Order Parent Cascade (No Manual "Action Type" Setting):** Merchants should never be forced to pick an "Action type: Link / Form submit / Action" dropdown in the button inspector. Instead, `blocks/button.liquid` acts as a higher-order component that automatically resolves its role, behavior, and fallback link from its parent container context:
  - **Inside Forms:** When placed inside a `<form>` (e.g. `newsletter-form` or product cart forms) without a custom link override, it automatically renders `<button type="submit">`.
  - **Section Actions:** When the parent container defines `button_action` (e.g. `open-browser`, `auto-open`), the button renders `<button type="button" data-action="...">`.
  - **Resource Cascade:** When the parent provides `button_link` (e.g. collection or product URL) and the merchant hasn't entered an override, the button inherits that link automatically.
  - **Custom Override:** If the merchant specifies a `link` setting in the Theme Editor, it takes precedence.

---

## 8. Section Grouping Taxonomy (`disabled_on` / `enabled_on`)

To prevent layout corruption and maintain clean Theme Editor menus:

- **Header Sections:** Sections intended exclusively for the header group (`sections/header.liquid`) must declare:
  ```json
  "enabled_on": {
    "groups": ["header"]
  }
  ```
- **Footer Sections:** Sections intended exclusively for the footer group (`sections/footer.liquid`) must declare:
  ```json
  "enabled_on": {
    "groups": ["footer"]
  }
  ```
- **Storytelling & Content Sections:** All general template sections must declare:
  ```json
  "disabled_on": {
    "groups": ["header", "footer"]
  }
  ```
  This ensures template sections cannot be accidentally added into header or footer groups, keeping the section pickers organized.

---

## 9. Tailwind v4 Mental Model: CSS Variables, Token Reusability & Atomic Encapsulation

Tailwind CSS v4 serves as the repository's principal design-system mental model for CSS variables (`var(--*)`), token inheritance, and component reusability.

### A. The CSS-First Variable System
- **Centralized Semantic Tokens:** Just like Tailwind v4's `@theme` CSS layer, foundational design tokens live centrally in `assets/base.css` and color palettes (`--color-background`, `--color-surface`, `--color-text`, `--color-border`, `--color-primary`, `--color-accent`, etc.).
- **Tonal Variations via `color-mix()`:** Tints, shades, and opacities must be derived functionally from semantic tokens using modern CSS `color-mix(in srgb, var(--color-*) N%, transparent | var(--color-other))` rather than inventing new hex values or per-component color picker settings.
- **Strict Theme Variable Consumption:** Components must consume semantic variables directly (`var(--color-border)`, `var(--color-surface)`, `var(--color-primary)`). Micro-overriding colors with hardcoded hex values in blocks, schemas, presets, or templates is strictly forbidden and actively rejected by automated token and composition linters.

### B. Atomic Encapsulation vs. Section Orchestration
- **Blocks/Atoms Must Define Their Own Default Style:**
  Theme blocks and primitives (Layer 4 & Layer 5) must encapsulate their own styles, transitions, interactive hover/active states, and default token bindings within their own block stylesheets (`{% stylesheet %}` or `{% style %}`). An atomic block must look complete, styled, and functional on its own regardless of which section renders it.
- **Sections Just Orchestrate Layout:**
  Section shells (Layer 3) are layout orchestrators. Their responsibility is viewport structure, grid distribution, flow spacing, and coordination of child slots. Sections should never strip or duplicate an atom's base styling into monolithic section CSS.
- **Contextual Overrides Without Structural Mutation:**
  A parent section may supply layout coordinates (grid placement, flex ordering) or pass contextual custom properties (e.g. `--card-size`, `--grid-gap`), but the child block retains authority over its internal anatomy, states, and token consumption.

---

## 10. Original Content and Third-Party References

- Write original copy and create original visual assets. Do not copy or closely imitate third-party documentation, marketing copy, illustrations, screenshots, or other protected material unless the repository has a license or explicit permission covering that use.
- Avoid adding third-party brand names, trademarks, product names, and proprietary labels to user-facing copy, documentation, examples, or agent instructions when they are not needed.
- Keep names that are required for technical compatibility, file formats, APIs, legal attribution, or accurate license notices. Do not rename compatibility identifiers in a way that breaks behavior; explain unavoidable references in the change.
- When updating a file, remove unnecessary legacy brand references in the edited content. Reviewers should flag new copied material and unnecessary third-party names, and request a source or license for any questionable reuse.
- Follow the focused pull request review checklist in [`PR_REVIEWER.md`](PR_REVIEWER.md).
