# F08 quick shopping contract

Updated: 2026-09-26. Source implementation and local browser fixture are complete; Liquid theme editor/storefront and XellHub rendering remain unverified.

## Quick view

- Eligible product-card links keep the normal product URL as their no-JavaScript fallback. The delegated controller intercepts an ordinary same-origin click and requests that product with `?view=quick-view`, using the existing alternate `product.quick-view.json` template. It parses the returned HTML and inserts only the `[data-product-section]` fragment into the shared modal overlay. It rejects non-success responses and a missing or mismatched product fragment; executable scripts are discarded. The fragment's custom elements mount when inserted.
- Every opening receives a new namespace. IDs and `for`, `form`, ARIA references, dialog targets, fragment links and variant-radio names are rewritten together. Product form and picker instance data are updated. This keeps a quick-view form isolated from the PDP and from earlier modal content. Variant selection inside the modal does not rewrite the page URL.
- Opening another product aborts the previous request. Closing aborts and removes the fragment. A load failure shows a localized message and an ordinary product-page link. The existing overlay handles Escape, backdrop dismissal, focus return and scroll locking.
- Liquid theme documents alternate `view` templates and recommends extracting only required rendered markup, with controllers that remount after DOM insertion (Section Rendering API). The response format and behavior must still be tested against a development store and XellHub before claiming platform acceptance.

## Quick add

- A native add form is offered only when the product has one default variant, that variant is available, no selling plan is required, and quantity one satisfies its rule. The form posts to the locale-aware `routes.cart_add_url` without JavaScript. With JavaScript, one in-flight submission per form is allowed; the Ajax request adds exactly quantity one, refreshes cart state/sections once, and opens the drawer. A successful cart mutation is never retried because a later UI refresh failed.
- A product with multiple variants uses the quick-view link to select options. If any variant requires a selling plan or a quantity rule that cannot be represented by the compact form, the card retains its ordinary product-page link and shows no compact action. Add the `compact-purchase-disabled` product tag for products whose required custom properties or other purchase choices must be collected on the full product page.
- Liquid theme errors appear beside the card action; network failures use a localized fallback. Removing the card aborts its in-flight request before it can refresh new DOM. Product forms in quick view use the same cart path; after a successful add, the modal closes and the cart drawer opens once.
- These eligibility rules use the platform's documented variant quantity rules and selling-plan requirement and locale-aware cart add endpoint.

## Local verification and live acceptance

A local headless Chrome fixture passed twelve assertions: fragment load, ID/reference rekeying, rapid product switch, abandoned-request abort, load-error fallback, close disposal, duplicate quick-add suppression, drawer opening, inline Liquid theme error, modal-add closure, close-during-fetch abort and removal-during-add abort. It used mocked Liquid theme responses and did not prove Liquid rendering or merchant editor behavior.

In a development store, verify single-variant add, multivariant selection, sold-out and inventory errors, required selling-plan and quantity-rule fallbacks, repeated open/close, close during fetch, keyboard focus return, no-JavaScript navigation/add, cart count/drawer consistency and PDP/modal variant isolation. Confirm the alternate product template returns a fragment with the expected product ID and that Theme Editor section replacement leaves one active controller.
