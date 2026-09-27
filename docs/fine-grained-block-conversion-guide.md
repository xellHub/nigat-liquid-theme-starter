# Guide: Converting Sections to Fine-Grained Theme Blocks (Liquid theme 5-Layer Architecture)

This guide provides an end-to-end, reproducible manual for decomposing any monolithic Liquid theme section into fine-grained, nested theme blocks. Following this architecture ensures that merchants can individually select, edit, reorder, style, hide, and toggle every single element (headings, badges, prices, copy, and buttons) directly in the theme editor sidebar and canvas, while maintaining zero drift and strict design-token governance.

---

## 1. Architectural Philosophy: The 5-Layer Model

In this repository (`nigat`), components strictly follow a 5-layer dependency hierarchy. A layer may only depend on layers below it:

```text
Layer 1: Layout & Storeframe (layout/theme.liquid)
  ↓
Layer 2: Template (templates/*.json)
  ↓
Layer 3: Section Shell (section-library/.../<variant>.liquid → sections/<variant>.liquid)
  ↓
Layer 4: Composite Theme Blocks (blocks/_<feature>-content.liquid, blocks/group.liquid, blocks/surface.liquid)
  ↓
Layer 5: Atomic Theme Blocks (blocks/heading.liquid, blocks/text.liquid, blocks/button.liquid, blocks/badge.liquid, etc.)
  ↓
Non-Editable Plumbing (snippets/*.liquid)
  ↓
Design Tokens (config/settings_data.json, assets/base.css)
```

### The Problem with Monolithic Sections

In older themes, a section like `featured-product` or `hero` defines 20+ schema settings (`heading`, `subheading`, `button_label_1`, `button_link_1`, `button_label_2`, `show_badge`, etc.).

- **Merchant Pain:** When clicking on a button or heading in the theme editor canvas, the entire section gets selected.
- **Inflexibility:** The merchant cannot reorder elements, add a second badge, insert a bullet list between price and description, hide a single button, or customize the styling/alignment of one button independently.

### The Fine-Grained Theme Block Solution

- **Section (Layer 3):** Becomes a minimal layout shell (color scheme, outer padding, section container). It renders `{% content_for 'blocks' %}`.
- **Composite Block (Layer 4):** Handles complex structural layout (e.g. product gallery grid, form wrappers, card surfaces) and contains nested `{% content_for 'blocks' %}` slots.
- **Atomic Blocks (Layer 5):** Reusable atoms (`heading`, `text`, `badge`, `price`, `button`) where every individual text element or button is its own selectable block in the Theme Editor tree.
- **Sub-grouping:** Groups of buttons or cards live inside a `group` or `surface` block, enabling the merchant to hide the entire button stack with one eye toggle in the theme editor or style its flex direction, gap, and alignment.

---

## 2. Strict Repository Governance & AGENTS.md Rules

Every session working in this repository **must** abide by the following non-negotiable rules:

1. **NEVER edit `sections/*.liquid` directly:**
   - All section code lives in `section-library/<group>/<family>/<variant>/<variant>.liquid`.
   - Files under `sections/` are hardlinked runtime targets managed by `bun run sync`.
2. **Universal Theme Tokens (`footer.liquid` Pattern):**
   - Every section root element must include dynamic color scheme class:
     ```liquid
     <section
       id="{{ section.id }}"
       class="... {% if section.settings.color_scheme.id == settings.palette_5_light.id %}color-global{% else %}color-{{ section.settings.color_scheme.id }}{% endif %}"
     >
     ```
   - Never use hardcoded hex colors (`#fff`, `#000`), generic font stacks, or manual margins. Always use `var(--color-*)`, `var(--font-*)`, and `var(--space-*)`.
3. **Package Manager:**
   - Bun 1.4+ is the only package manager (`bun run sync`, `bun run check`).
4. **Validation Suite Must Pass with 0 Errors:**
   ```bash
   bun run sync
   bun run sync check
   node scripts/validate-json.mjs
   node scripts/validate-palettes.mjs
   node scripts/validate-tokens.mjs
   node scripts/validate-section-library.mjs
   bun run check
   ```

---

## 3. theme blocks Schema Rules (Crucial Pitfalls)

### A. The `@theme` Requirement

Any block located in the `/blocks/*.liquid` directory is a **theme-defined block**.

- **The Rule:** A section or parent block **cannot** accept theme-defined blocks unless its `blocks` array explicitly contains `{ "type": "@theme" }`.
- **The Pitfall:** If you write:
  ```json
  "blocks": [
    { "type": "heading" },
    { "type": "badge" },
    { "type": "button" }
  ]
  ```
  Liquid theme will reject the schema with:
  `invalid block type "badge": "_xxx" does not accept theme defined blocks`
  or when saving `templates/index.json`:
  `Block type 'heading' is not allowed in 'sections/xxx.liquid'`.
- **The Correct Schema Pattern:**
  ```json
  "blocks": [
    { "type": "@theme" },
    { "type": "@app" },
    { "type": "_feature-content" }
  ]
  ```
  `{ "type": "@theme" }` automatically permits all theme-defined foundational blocks (`heading`, `text`, `badge`, `button`, `group`, `surface`, etc.).
  Context-specific extension blocks (those prefixed with `_`) are hidden from the general picker and must be explicitly declared alongside `@theme`.

### B. Single `{% content_for 'blocks' %}` Entry

the Liquid parser strictly forbids multiple `{% content_for 'blocks' %}` tags within the same Liquid file, even if placed inside mutually exclusive `{% if product != blank %}` branches.

- **Wrong:**
  ```liquid
  {% if product != blank %}
    <form>
      {% content_for 'blocks' %}
    </form>
  {% else %}
    <div class="mock">
      {% content_for 'blocks' %}
    </div>
  {% endif %}
  ```
  _Result:_ `Liquid syntax error: Duplicate entries for 'content_for "blocks"'`.
- **Right:**
  Wrap the slot in a unified container or single form:
  ```liquid
  <form
    method="post"
    action="{{ routes.cart_add_url }}"
    class="fp__form"
    id="ProductForm-{{ section_id }}"
  >
    {% if current_variant != blank %}
      <input type="hidden" name="id" value="{{ current_variant.id }}">
    {% endif %}
    {% content_for 'blocks' %}
  </form>
  ```

---

## 4. Step-by-Step Conversion Recipe

Follow these 5 steps when converting any section:

### Step 1: Content & Layout Audit

Examine the original section and categorize every setting and HTML element:

| Original Element             | Architectural Destination                             | Block / Setting                                                   |
| :--------------------------- | :---------------------------------------------------- | :---------------------------------------------------------------- |
| Section background, palette  | **Section Schema**                                    | `color_scheme` setting                                            |
| Outer padding, max width     | **Section Schema** or **Composite Settings**          | `padding_top`, `padding_bottom`, `page_width`                     |
| Media Gallery, 2-Column Grid | **Composite Block** (`blocks/_<name>-content.liquid`) | Markup + layout CSS                                               |
| Eyebrow / Subheading         | **Atomic Block**                                      | `blocks/heading.liquid` or `blocks/eyebrow.liquid`                |
| Badge / Starburst / Pill     | **Atomic Block**                                      | `blocks/badge.liquid`                                             |
| Product Title / Main Title   | **Atomic Block**                                      | `blocks/heading.liquid`                                           |
| Price Display                | **Atomic Block**                                      | `blocks/price.liquid` (with `custom_price` fallback)              |
| Description / Body Copy      | **Atomic Block**                                      | `blocks/text.liquid`                                              |
| CTA Buttons Container        | **Structural Composite**                              | `blocks/group.liquid` (`direction: column`, `alignment: stretch`) |
| Add to Cart Button           | **Atomic Block**                                      | `blocks/button.liquid` (`element: submit`, `style: secondary`)    |
| Buy It Now / Secondary CTA   | **Atomic Block**                                      | `blocks/button.liquid` (`element: link`, `style: primary`)        |

---

### Step 2: Refactor the Canonical Section

Edit `section-library/<group>/<family>/<variant>/<variant>.liquid`:

```liquid
<section
  id="{{ section.id }}"
  class="featured-section section {% if section.settings.color_scheme.id == settings.palette_5_light.id %}color-global{% else %}color-{{ section.settings.color_scheme.id }}{% endif %}"
>
  {% content_for 'blocks' %}
</section>

{% schema %}
{
  "name": "Featured section",
  "tag": "section",
  "class": "featured-section",
  "blocks": [{ "type": "@theme" }, { "type": "@app" }, { "type": "_featured-content" }],
  "settings": [
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "Color scheme",
      "default": "bare-light"
    }
  ],
  "presets": [
    {
      "name": "Featured section",
      "blocks": [
        {
          "type": "_featured-content"
        }
      ]
    }
  ]
}
{% endschema %}
```

---

### Step 3: Create / Adapt the Composite Block

Create or edit `blocks/_<name>-content.liquid`:

1. Render structural containers and layouts (e.g. media gallery on the left, info column on the right).
2. Inside the content column, render `{% content_for 'blocks' %}`.
3. Ensure the root element carries the required editor-selection attributes if `"tag": null`.
4. Define the schema with `@theme` and `@app`:
   ```json
   {% schema %}
   {
     "name": "Featured content",
     "tag": null,
     "blocks": [
       { "type": "@theme" },
       { "type": "@app" }
     ],
     "settings": [
       {
         "type": "color_scheme",
         "id": "color_scheme",
         "label": "Color scheme",
         "default": "bare-light"
       },
       {
         "type": "product",
         "id": "product",
         "label": "Product"
       }
     ],
     "presets": [
       {
         "name": "Featured content",
         "blocks": [
           { "type": "badge", "settings": { "label": "New!", "style": "accent" } },
           { "type": "heading", "settings": { "text": "Product title", "level": "h2", "size": "medium" } },
           { "type": "price", "settings": { "custom_price": "$12.00" } },
           { "type": "text", "settings": { "text": "<p>Description copy here.</p>" } },
           {
             "type": "group",
             "settings": { "direction": "column", "gap": "3", "alignment": "stretch" },
             "blocks": [
               { "type": "button", "settings": { "label": "Add to cart", "element": "submit", "style": "secondary" } },
               { "type": "button", "settings": { "label": "Buy it now", "element": "link", "link": "/collections/all", "style": "primary" } }
             ]
           }
         ]
       }
     ]
   }
   {% endschema %}
   ```

---

### Step 4: Ensure Atomic Blocks Support Required Layout Behaviors

When nesting buttons inside a `group` block:

1. **Full-Width Stretch:**
   In `blocks/group.liquid`, verify that `.theme-group--align-stretch` forces direct children to 100% width:
   ```css
   .theme-group--align-stretch > * {
     width: 100%;
   }
   ```
2. **Mock Pricing Fallback:**
   In `blocks/price.liquid`, ensure it provides a `custom_price` setting so sections can display prices (`$12.00`) even when no Liquid theme catalog product is selected in demo templates.
3. **Button Form Submission:**
   In `blocks/button.liquid`, ensure setting `"element": "submit"` renders `<button type="submit" ...>` so it functions seamlessly within product forms.

---

### Step 5: Update the Template JSON (`templates/*.json`)

In `templates/index.json` (or any target template):
Declare the section and nest child blocks accurately with full `block_order`:

```json
"featured-product": {
  "type": "featured-product",
  "settings": {
    "color_scheme": "bare-light"
  },
  "blocks": {
    "heading": {
      "type": "heading",
      "settings": {
        "text": "Product of the Month",
        "level": "h2",
        "size": "large",
        "alignment": "center"
      }
    },
    "content": {
      "type": "_featured-product-content",
      "settings": {
        "color_scheme": "bare-light",
        "page_width": 1150
      },
      "blocks": {
        "badge": {
          "type": "badge",
          "settings": {
            "label": "New!",
            "style": "accent"
          }
        },
        "title": {
          "type": "heading",
          "settings": {
            "text": "Crispy Chili Oil",
            "level": "h2",
            "size": "medium"
          }
        },
        "price": {
          "type": "price",
          "settings": {
            "custom_price": "$12.00"
          }
        },
        "description": {
          "type": "text",
          "settings": {
            "text": "<p>Deliciously fiery and surprisingly versatile! Bold, aromatic chilies get a savory boost...</p>"
          }
        },
        "actions": {
          "type": "group",
          "settings": {
            "direction": "column",
            "gap": "3",
            "alignment": "stretch"
          },
          "blocks": {
            "add_to_cart": {
              "type": "button",
              "settings": {
                "label": "Add to cart",
                "element": "submit",
                "style": "secondary"
              }
            },
            "buy_now": {
              "type": "button",
              "settings": {
                "label": "Buy it now",
                "element": "link",
                "link": "/collections/all",
                "style": "primary"
              }
            }
          },
          "block_order": [
            "add_to_cart",
            "buy_now"
          ]
        }
      },
      "block_order": [
        "badge",
        "title",
        "price",
        "description",
        "actions"
      ]
    }
  },
  "block_order": [
    "heading",
    "content"
  ]
}
```

---

## 5. Verification & Deployment Checklist

Before completing any conversion session, execute these commands in order:

```bash
# 1. Regenerate schema usage documentation for all section packages
node scripts/generate-section-usage.mjs

# 2. Synchronize section-library to runtime sections
bun run sync

# 3. Verify zero drift between library and runtime mirrors
bun run sync check

# 4. Validate JSON schemas, palette tokens, and design tokens
node scripts/validate-json.mjs
node scripts/validate-palettes.mjs
node scripts/validate-tokens.mjs
node scripts/validate-section-library.mjs

# 5. Run theme checker (0 errors, 0 warnings)
bun run check
```

---

## 6. Summary Reference: Registered Foundational Blocks in `blocks/`

| Block Type | Class / Category     | Key Roles & Use Cases                                                                 |
| :--------- | :------------------- | :------------------------------------------------------------------------------------ |
| `heading`  | Atom                 | Section titles, product titles, card headlines (`level`, `size`, `alignment`)         |
| `eyebrow`  | Atom                 | Small uppercase category or kicker text (`text`, `case`)                              |
| `text`     | Atom                 | Rich text paragraphs, descriptions, footnotes (`alignment`, `max_width`)              |
| `badge`    | Atom                 | Sticker badges, stock tags, sale indicators (`label`, `style`)                        |
| `price`    | Atom                 | Dynamic or mock price display (`custom_price`, money format)                          |
| `button`   | Atom                 | Primary, secondary, link buttons (`label`, `link`, `element`, `style`)                |
| `group`    | Structural Composite | Flexbox wrapper for rows, columns, or button stacks (`direction`, `gap`, `alignment`) |
| `surface`  | Structural Composite | Background card container (`shade`, `border`, `shadow`, `radius`, `padding`)          |
| `grid`     | Structural Composite | Multi-column responsive grid (`columns_desktop`, `columns_mobile`, `gap`)             |
| `card`     | Structural Composite | Standardized product, collection, or feature card shell                               |
| `spacer`   | Atom                 | Vertical rhythm control (`height`)                                                    |
| `divider`  | Atom                 | Visual separator line (`style`, `width`)                                              |
