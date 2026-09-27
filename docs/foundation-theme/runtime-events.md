# Runtime lifecycle and event contract

Updated: 2026-09-26. This is the F06 contract for the fork foundation. Liquid theme editor and storefront verification remains pending.

## Mounting

- Custom elements mount in `connectedCallback` and release their owned resources in `disconnectedCallback`. The mount guard prevents a second listener set; reconnecting creates a fresh lifecycle scope.
- `createLifecycleScope()` in `assets/theme.js` owns event listeners (via an abort signal), timeouts, intervals, observers and fetch abort controllers. Controllers must destroy their scope on disconnect. A response must check its request signal and `isConnected` before changing DOM.
- Document-level handlers that delegate to the current DOM are page-lifetime handlers. Sticky product controllers are the exception: a single document `MutationObserver` mounts each product root once and destroys its observer/listener scope when that root leaves the DOM. Liquid theme section load/unload also requests synchronization.
- Announcement rotation pauses when the document is hidden, reduced motion is requested, or its block is selected in the editor. Unmount clears its interval. F17 owns dismissibility, translated messages and full announcement behavior.
- Slideshow editor block selection and visibility listeners are instance-owned and removed on disconnect. Cart overlay/drawer, product form, variant picker, quantity, predictive search, price range and facet filters follow the same lifecycle. Facet filters and predictive search abort in-flight requests on removal or replacement.
- Product zoom controllers are keyed by product root; the portal dialog moves to `body` while mounted, stays linked to its owner, and returns to the detached root when that owner leaves the DOM. Reattaching the same root can mount it again. Its listeners and body scroll lock are released with the owner.

## Product identity

- `product.id` identifies merchandise; it is not a DOM-instance key. `section.id` identifies a rendered product instance in the current section architecture. The main product root exposes `data-product-id` and `data-product-instance`.
- Product form, quantity, picker and size-chart dialog IDs use `section.id`. A variant picker resolves its nearest `[data-product-section]` for form input, price, gallery and sticky bar updates. Sticky controls submit the form within their own root.
- A future repeated product slot or quick-view portal must mint a unique rendered instance ID and rewrite any associated `id`, `for`, `form`, `aria-labelledby` and dialog target references together. F07/F08 must prove that contract with two copies of the same product.

## Events and payloads

| Event | Target / producer | Payload | Current consumer / compatibility |
| --- | --- | --- | --- |
| `cart:updated` | Private `CartEvents` target, `refreshCart()` | The raw Liquid theme `/cart.js` object in `detail` | Header/cart count listener reads `detail.item_count`; keep this shape. This target is not a public API. |
| `wishlist:updated` | `window`, wishlist storage writer | `{ wishlist: string[] }` | Existing wishlist UI consumers; unchanged. |
| `wishlist:updated` | `document`, wishlist storage writer | `{ wishlist: string[] }` | Existing Liquid theme-facing integration; unchanged. |
| `product:variant-changed` | Product root, variant picker | `{ productId, instanceId, variant }`; bubbles | New instance-scoped hook; listeners should filter by root or `instanceId`. |
| `product:added` | `product-form` after cart refresh | `{ productId, instanceId }`; bubbles and cancelable | Quick-view controller cancels default drawer handling, closes its modal, then opens the cart drawer. PDP handling is unchanged. |
| `overlay:open`, `overlay:close`, `overlay:backdrop-click` | `theme-overlay` | `{ overlay, type }`; backdrop event cancelable | Drawer state and integrations; unchanged. |

`refreshCart(signal)` and `renderCartSections(signal)` accept an optional abort signal. Existing callers still work without one. Product-form submissions pass their instance-owned signal through all three requests, so removing the form prevents its abandoned response from updating cart DOM.

## Verification still required

In a Liquid theme development preview, repeat mount/unmount/remount three times for announcement, slideshow and product form; verify one action fires once, old intervals stop, and abandoned fetches leave new DOM alone. Render two roots for the same product; verify each picker changes only its own form, price, gallery, zoomer and sticky control, and each size-chart trigger opens its own dialog. Check the editor's block-select pause and Ajax section replacement. Static validation does not establish these browser and editor outcomes.
