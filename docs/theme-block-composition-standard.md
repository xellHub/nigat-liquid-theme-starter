# The 5-Layer Theme Block Composition Standard

> **Status:** Authoritative & Permanent Architecture Reference  
> **Applies to:** All future sections, composite blocks, atomic theme blocks, and template configurations across `nigat` and its specialized forks.

---

## 1. Core Philosophy: The 5-Layer Architecture

Shopify Theme Blocks provide fine-grained, merchant-editable composability. In this repository, all UI is decomposed into five strict, one-way dependency layers. A layer may only depend on layers below it:

```text
Layer 1: Storeframe Layout (layout/theme.liquid)
  ↓
Layer 2: Template Configuration (templates/*.json)
  ↓
Layer 3: Section Shell (section-library/.../<variant>.liquid → sections/<variant>.liquid)
  ↓
Layer 4: Composite Theme Blocks (blocks/group.liquid, blocks/surface.liquid, blocks/_<feature>-content.liquid)
  ↓
Layer 5: Atomic Theme Blocks (blocks/heading.liquid, blocks/text.liquid, blocks/button.liquid, blocks/badge.liquid)
  ↓
Plumbing: Non-Editable Snippets (snippets/*.liquid)
  ↓
Tokens: Design Tokens (config/settings_data.json, assets/base.css)
```

---

## 2. The Mandate: No Monolithic / Atomic Content Settings

### The Problem: Monolithic Blocks

When a section or block embeds editable content into its `schema.settings` (e.g., `heading`, `title`, `subheading`, `text`, `button_label`, `button_link`), it creates an **atomic / monolithic lock-in**:

- **Canvas Selection Failure:** Merchants clicking on a heading, paragraph, or button in the visual preview are trapped at the outer section or container level. The individual element cannot be selected on canvas.
- **No Sidebar Tree Granularity:** Titles and buttons do not appear in the Theme Editor sidebar hierarchy.
- **Inability to Reorder or Delete:** Merchants cannot reorder elements, add a secondary paragraph or badge, or delete a button without entering empty strings or toggling obscure flags.
- **No Independent Styling:** A button or heading cannot be individually styled (size, alignment, color role, icon) using standard theme blocks.

### The Modern Standard: Fine-Grained Theme Blocks

1. **Sections and Composite Containers are Layout Shells:**
   - They hold **only** structural, media, and layout configuration (e.g. `image`, `step_index`, `columns`, `aspect_ratio`, `color_scheme`, `padding_top`, `padding_bottom`).
   - They render content strictly through `{% content_for 'blocks' %}`.
2. **All Text, Headings, and Buttons are Independent Blocks:**
   - Titles are rendered using `blocks/heading.liquid`.
   - Body copy and descriptions are rendered using `blocks/text.liquid`.
   - Actions and links are rendered using `blocks/button.liquid` or `blocks/link.liquid`.
   - Eyebrows, pills, and statuses are rendered using `blocks/eyebrow.liquid` or `blocks/badge.liquid`.
3. **Sidebar Tree & Canvas Selectability:**
   - Every individual element appears under the step/item in the Theme Editor sidebar hierarchy.
   - Merchants can click directly on any element in the visual preview to open its specific inspector.
   - Merchants can click `+ Add block` inside the step/card to add secondary badges, images, text, or apps.

### D. The Action-Coupled Button Exception ("The Action-Only Coupling")

While headings, body copy, and images must **strictly** remain decomposed child theme blocks, the architecture explicitly distinguishes between:

1. **Freestanding Marketing Buttons:** General navigation or promotional links pointing to collections, products, or external URLs. These are independent child `button` theme blocks.
2. **Action-Coupled Buttons:** Buttons where the action is functionally bound to section or container logic (e.g. section browser triggers, auto-open buttons, modal launchers, drawer toggles, form submits, or step activators):
   - **Why Action Coupling is Necessary:** A freestanding button with a random external URL cannot be substituted when a section requires an internal controller action (e.g. opening a section browser drawer or auto-opening an active state).
   - **Higher-Order Parent Cascade (No Manual "Action Type" Setting):** Merchants should never have to manually select an "Action type: Link / Form submit / Action" dropdown on the button. The button acts as a higher-order component that automatically inherits its role and target from its parent container context:
     - **Inside a Form:** When placed inside a `<form>` (such as `newsletter-form` or a product cart form) with no custom link, it automatically renders `<button type="submit">`.
     - **Action Trigger:** When the parent container defines `button_action` (e.g. `open-browser`, `auto-open`), the button automatically renders `<button type="button" data-action="...">`.
     - **Resource Cascade:** When the parent provides `button_link` (such as a collection or product URL) and the merchant hasn't entered an override, the button automatically links to that parent resource.
     - **Custom Override:** If the merchant fills in the `link` setting on the button, it honors that custom link.
   - **The Presentation Mandate:** The button markup and styling **must still reuse and compose from the universal button contract** (`.theme-button`, token variables `--color-button`, `--color-button-text`, `--radius-button`, and standard sizes/styles). It must never invent hardcoded button styling.

---

## 3. Strict Block Whitelisting & Terminal Leaves

### A. Strict Block Whitelisting

Every container and composite block must explicitly whitelist its allowed child blocks in its schema. Never permit arbitrary blocks where they would violate layout contracts.

```json
{
  "name": "Interactive step",
  "tag": null,
  "blocks": [
    { "type": "heading" },
    { "type": "text" },
    { "type": "button" },
    { "type": "badge" },
    { "type": "link" },
    { "type": "group" },
    { "type": "image" },
    { "type": "divider" },
    { "type": "@app" }
  ]
}
```

### B. Terminal / Leaf Blocks

Atomic blocks provide semantic HTML and typography styling. They are **terminal leaves** in the tree:

- Reusable atom blocks: `heading`, `text`, `button`, `link`, `icon-button`, `badge`, `price`, `icon`, `image`, `video`, `divider`, `spacer`, `input`, `select`, `checkbox`, `rating`, `countdown`, `stat`, `logo-item`.
- **Termination Rule:** Terminal blocks must **NEVER** declare `"blocks": [...]` in their schema and must **NEVER** contain `{% content_for 'blocks' %}`. They terminate the branch cleanly.

---

## 4. Canvas Selectability & HTML5 Semantic Rules

### The Prohibition: Never Wrap `content_for 'blocks'` in `<button>` or `<a>`

When building interactive elements (such as accordions, interactive steps, tabs, or modal triggers):

- **Never** render `{% content_for 'blocks' %}` inside an HTML `<button>` or `<a>` tag.
- **Why:** Child blocks frequently render buttons (`<a>` or `<button>`) or links. In HTML5, nesting interactive elements (`<button>` inside `<button>`, or `<a>` inside `<button>`) is strictly invalid. Browsers will either strip the inner tag, break click dispatch, or prevent the Theme Editor from capturing canvas click events for element selection.

### Accessible Split / Delegation Pattern

Instead of wrapping the entire row in a `<button>`, use a semantic container with accessible delegation:

```liquid
<div class="is__step" data-step-index="{{ block.id }}" {{ block.shopify_attributes }}>
  <div class="is__step-header">
    <div class="is__step-eyebrow">
      <span class="is__step-bullet" aria-hidden="true"></span>
      <span class="is__step-number">{{ block.settings.step_number | escape }}</span>
    </div>
  </div>
  <div class="is__step-body-grid">
    <div class="is__step-content-col" id="is-body-{{ block.id }}">
      {% content_for 'blocks' %}
    </div>
    <div class="is__step-pill-col">
      <span class="is__step-pill">...</span>
    </div>
  </div>
</div>
```

**JavaScript Click Delegation:**
Ensure the parent activation handler ignores clicks originating on interactive child elements so buttons and links work seamlessly:

```javascript
step.addEventListener("click", (e) => {
  if (e.target.closest("a, button, input, select, textarea")) return;
  activate(index);
});
```

---

## 5. Section Grouping Taxonomy (`disabled_on` / `enabled_on`)

To prevent sections from appearing in inappropriate contexts in the Theme Editor:

1. **Header Group Sections:**
   Must declare:
   ```json
   "enabled_on": {
     "groups": ["header"]
   }
   ```
2. **Footer Group Sections:**
   Must declare:
   ```json
   "enabled_on": {
     "groups": ["footer"]
   }
   ```
3. **General Content / Storytelling Sections:**
   All template sections (e.g. `hero`, `interactive-steps`, `featured-product`, `image-compare`, `slideshow`, etc.) must declare:
   ```json
   "disabled_on": {
     "groups": [
       "header",
       "footer"
     ]
   }
   ```
   This strictly keeps the header and footer section pickers clean.

---

## 6. Template Composition Standard (`templates/*.json`)

When sections are instantiated in templates:

1. They must use the fine-grained theme block structure.
2. Every composite block must include its default children (`heading`, `text`, `button`).
3. Example canonical template structure for `interactive-steps`:
   ```json
   "interactive-steps": {
     "type": "interactive-steps",
     "settings": {
       "color_scheme": "bare-light",
       "page_width": 1400,
       "padding_top": 24,
       "padding_bottom": 24
     },
     "blocks": {
       "heading": {
         "type": "heading",
         "settings": {
           "text": "How to care for glowing skin.",
           "level": "h2",
           "size": "inherit",
           "alignment": "center"
         }
       },
       "steps": {
         "type": "_interactive-steps",
         "settings": {
           "image_position": "left",
           "always_expand": true,
           "active_step_default": 1
         },
         "blocks": {
           "step-1": {
             "type": "_interactive-step",
             "settings": {
               "step_index": 1,
               "step_number": "STEP 1"
             },
             "blocks": {
               "title": {
                 "type": "heading",
                 "settings": {
                   "text": "Cleansers",
                   "level": "h3",
                   "size": "medium"
                 }
               },
               "description": {
                 "type": "text",
                 "settings": {
                   "text": "<p>Start with a gentle purifying cleanser...</p>",
                   "color_role": "muted"
                 }
               },
               "button": {
                 "type": "button",
                 "settings": {
                   "label": "Shop Cleansers",
                   "link": "shopify://collections/all",
                   "style": "primary"
                 }
               }
             },
             "block_order": ["title", "description", "button"]
           }
         },
         "block_order": ["step-1"]
       }
     },
     "block_order": ["heading", "steps"]
   }
   ```

---

## 7. Mandatory Validation Suite

Before concluding any work, the following verification commands must pass with **0 errors and 0 drift**:

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
