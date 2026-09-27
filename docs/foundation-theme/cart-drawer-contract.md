# F09 cart drawer contract

The `_cart-drawer-content` theme block owns the editable child tree. It captures `{% content_for 'blocks' %}` once and passes the HTML to `cart-drawer`, which passes it to `cart-items`. The supplemental region is a sibling of the item scroller and the checkout form inside the overlay panel. It remains in the panel in both empty and populated states. No editable child is rendered beside the closed overlay. Each child keeps its Shopify editor attributes.

The populated panel has four regions in order: header and close control; scrollable item list; bounded, independently scrollable supplemental content; discount, summary and native checkout form. The item quantity inputs use `form="cart-drawer-form"`, so the native checkout form still includes `updates[]` even though the supplemental region sits outside that form. This avoids nesting app block forms inside the checkout form.

Each item exposes Shopify's `item.key` on the row and quantity input. Ajax changes send `{ id: key, quantity }` to the locale-aware cart change endpoint. Changes run in one queue across cart lines; rapid changes to one line retain the latest quantity. A successful change uses the returned cart to update count and re-renders the drawer and cart page through the Section Rendering API. A failed section render is retried once by rendering sections only; the successful mutation is never submitted again. A failed mutation fetches fresh cart state before trying to repaint the UI.

The overlay root and panel remain mounted while the cart body is replaced. Replacement restores item-list scroll and quantity focus by line key where the item remains; removal moves focus to the drawer close control. Browser custom elements mount replaced quantity controls through their connected callbacks. Discount and wishlist display state are synchronized after replacement. Existing discount-code persistence is a session checkout helper; Shopify is the source of truth for actual cart discounts and totals.

## Live Shopify proof still required

1. In Theme Editor, add heading, text, button and app content under Cart drawer content. Select each child in the canvas, close the drawer, and confirm nothing appears outside the panel.
2. Test empty → add → change quantity → remove → empty, with cart page open in another tab for comparison.
3. Add two lines with the same variant and different properties or selling plans. Change and remove only one line, then verify both totals.
4. Test rapid quantity clicks, applied discounts, an unavailable section-render response, Escape/backdrop close, focus restoration, and native checkout with JavaScript disabled.
