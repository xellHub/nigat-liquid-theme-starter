# Template Coverage Plan

## Objective

Extend the theme with the requested Liquid theme storefront, utility, and custom
page templates. Do not add legacy customer-account templates.

## Templates to add

### Liquid theme utility template

- `templates/gift_card.liquid`
  - Render the gift-card page using the password-style minimal layout or a
    dedicated gift-card section.
  - Display the gift-card code, QR code, balance, expiry information, and
    wallet/add-to-wallet action when supported by the platform.
  - Support the `/gift_cards/<id>/<token>` URL shape.
  - Add the required translation keys and styles without exposing the code in
    page metadata or unrelated markup.

- `templates/robots.txt.liquid`
  - Preserve the platform’s default crawler directives.
  - Add only intentional theme-level rules; do not block storefront,
    collection, product, search, or policy pages by default.
  - Keep the output plain text and validate that no HTML is emitted.

### Custom page templates

- `templates/page.about.json`
  - Use the generic page structure with an editorial hero/content composition.
  - Keep sections merchant-editable through the theme editor.

- `templates/page.faq.json`
  - Provide an FAQ-focused layout using collapsible question/answer content.
  - Ensure keyboard access, semantic headings, and accessible disclosure state.

- `templates/page.shipping.json`
  - Use the generic page structure for shipping information and policy content.
  - Include optional informational sections without hard-coding store-specific
    rates or delivery promises.

- `templates/page.size-guide.json`
  - Provide a size-guide page structure suitable for rich text and tables.
  - Ensure responsive table behavior and accessible table headings.

### Catalog alternate templates

- `templates/collection.featured.json`
  - Reuse the existing collection section with featured-collection defaults.
  - Keep sorting/filtering settings configurable and avoid duplicating catalog
    rendering logic.

- `templates/product.quick-view.json`
  - Provide a compact product layout for quick-view contexts.
  - Reuse the existing product media, variant picker, price, and buy-button
    components where possible.
  - Confirm that it works when rendered as a section or modal and does not
    assume full-page navigation or unavailable product context.

## Shared implementation work

1. Reuse existing sections and snippets before introducing new ones.
2. Add any new section schemas and translation keys required by the templates.
3. Add template presets/default settings that match the existing theme style.
4. Verify links and route behavior for gift cards, custom pages, collections,
   and products.
5. Run `node scripts/validate-json.mjs` and `git diff --check`.
6. Review rendered markup for accessibility, mobile layout, and plain-text
   output of `robots.txt.liquid`.

## Explicit exclusion

Do not add any legacy customer-account templates under `templates/customers/`:

- `account.liquid`
- `activate_account.liquid`
- `addresses.liquid`
- `login.liquid`
- `order.liquid`
- `register.liquid`
- `reset_password.liquid`
