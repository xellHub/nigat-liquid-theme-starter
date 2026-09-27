# Nigat — Advanced Liquid-Based Storefront Engine & Theme Starter

**Nigat** is an advanced, open-source Liquid-based theme starter for building
fast, modern storefronts. Built as a lightweight storefront engine on top of
the Liquid templating language, Nigat gives developers and agencies a
production-ready foundation for launching ecommerce storefronts — without the
bloat of legacy theme codebases.

Whether you're building a custom storefront from scratch or need a solid
Liquid theme starter to extend, Nigat is designed to be read, understood, and
shipped fast: a modern, composable, accessible ecommerce theme built for
developers who want control over every layer of their storefront.

**Use cases:**

- Launching a new Liquid-based storefront from a clean, modern starter
- Building a custom theme engine for an ecommerce brand or agency client
- Learning how a real, production-grade Liquid storefront is structured
- Extending a lightweight base into a fully custom, composable storefront

This repository is kept private and maintained as the official starter theme
for storefronts built on **XellHub (xellhub.com)**. Access is limited to
invited collaborators.

---

## Why Nigat

- **Advanced Liquid architecture** — JSON-driven templates, reusable section
  groups, and schema-driven content blocks power a fully composable storefront
  engine, letting merchants rearrange, add, and configure every part of the
  storefront without touching code.
- **Measured asset baseline** — no framework build step. On 2026-09-27,
  the checked-in `theme.js` measured 208,372 bytes (42,858 gzip),
  `base.css` 228,242 bytes (36,243 gzip), and the Embla library 32,549 bytes
  (8,842 gzip), loaded only by the quotes carousel. These are file measurements, not
  storefront transfer or performance scores; measure each fork in its preview.
- **Composable by design** — every section and block is self-contained and
  reusable, so storefronts built on Nigat scale cleanly as new pages, layouts,
  and merchandising needs are added.
- **Accessible storefronts, out of the box** — skip links, semantic landmarks,
  keyboard-friendly interactions, and properly sized tap targets ship with
  every page, not bolted on later.
- **Real-time storefront interactions** — an AJAX cart, live variant
  selection, and predictive search all update instantly without full page
  reloads, giving shoppers an app-like storefront experience.
- **Readable, maintainable codebase** — a from-scratch, minimal implementation
  built to be understood end-to-end, ideal as a long-term foundation rather
  than a one-off template.

---

## Core Storefront Features

- Composable, schema-driven sections and content blocks
- AJAX cart with instant add / update / remove
- Predictive, keyboard-accessible search
- Real-time variant and pricing updates
- Native collection sorting and storefront filtering
- Fully responsive, lazy-loaded imagery
- Deep theme-editor customization (color, typography, layout, cart style)
- Accessibility-first markup throughout

---

## Getting Started

Requirements: a store on XellHub (or a local/dev store for preview).

```bash
zip -r nigat-theme.zip . -x ".git/*"
```

Import the zip from your XellHub dashboard (**Themes → Import**) to deploy
the storefront engine to your store.

To validate the theme's JSON configuration before deploying:

```bash
node scripts/validate-json.mjs
```

---

## License

See [LICENSE](LICENSE). The underlying code remains MIT-licensed; exclusivity
for XellHub is enforced by keeping this repository private, not by the
license terms themselves.

---

<details>
<summary><strong>Technical reference (project structure, JS architecture, customization)</strong></summary>

### Project structure

nigat-theme/
├── assets/
│ ├── base.css
│ └── theme.js
├── config/
│ ├── settings_schema.json
│ └── settings_data.json
├── layout/
│ ├── theme.liquid
│ └── password.liquid
├── locales/
│ ├── en.default.json
│ └── en.default.schema.json
├── sections/
│ ├── header-group.json
│ ├── footer-group.json
│ ├── header.liquid
│ ├── footer.liquid
│ ├── announcement-bar.liquid
│ ├── image-banner.liquid
│ ├── featured-collection.liquid
│ ├── featured-product.liquid
│ ├── rich-text.liquid
│ ├── image-with-text.liquid
│ ├── newsletter.liquid
│ ├── main-product.liquid
│ ├── main-collection.liquid
│ ├── main-cart.liquid
│ ├── main-search.liquid
│ ├── main-page.liquid
│ ├── main-blog.liquid
│ ├── main-article.liquid
│ ├── main-list-collections.liquid
│ ├── main-404.liquid
│ └── main-password.liquid
├── snippets/
│ ├── product-card.liquid
│ ├── price.liquid
│ ├── responsive-image.liquid
│ ├── cart-drawer.liquid
│ ├── cart-items.liquid
│ ├── buy-buttons.liquid
│ ├── variant-picker.liquid
│ ├── predictive-search.liquid
│ ├── pagination.liquid
│ ├── icon.liquid
│ └── meta-tags.liquid
├── templates/
│ ├── index.json
│ ├── product.json
│ ├── collection.json
│ ├── cart.json
│ ├── page.json
│ ├── blog.json
│ ├── article.json
│ ├── search.json
│ ├── list-collections.json
│ ├── 404.json
│ └── password.liquid
├── scripts/
│ └── validate-json.mjs
├── .gitignore
├── LICENSE
└── README.md

### JavaScript architecture

| Element / listener    | Responsibility                                          |
| --------------------- | ------------------------------------------------------- |
| `<cart-drawer>`       | Open/close the slide-out cart, focus management, Escape |
| `<product-form>`      | AJAX add-to-cart, error display                         |
| `<quantity-input>`    | +/- stepper that fires a native `change` event          |
| `<variant-picker>`    | Resolve the selected variant, update price/URL/button   |
| `<predictive-search>` | Debounced fetch from the search-suggestions endpoint    |
| document listeners    | Cart line updates, remove, toggles, sort, filters, menu |

### Customizing

- **Colors / fonts / layout** — Theme editor → Theme settings.
- **Home page** — edit `templates/index.json` or rearrange sections in the editor.
- **New section** — drop a `*.liquid` file in `sections/` with a `{% schema %}` and a `presets` array.
- **Translations** — copy `locales/en.default.json` to e.g. `locales/fr.json`.

### Known limitations

- Customer account templates and a gift-card template.
- Product recommendations endpoint integration.
- Quick-add / quick-view, product media zoom or video, model/3D media.
- Localization form and multi-currency UI.
- Metafield-driven content blocks.

</details>
