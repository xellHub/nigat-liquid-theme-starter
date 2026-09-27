# Pair it with

Optional merchant-curated product bundle. Select up to six products in the `_product-bundle` block. The current product is excluded by default; duplicate and unavailable products are skipped. Each candidate renders through the shared static `product-card` slot. Merchant heading and supporting text are child atoms.

JavaScript enables an action-coupled add button, synchronizes selected variant quantity rules, totals the selected variant prices in presentment currency minor units, and sends one `/cart/add.js` request containing all selected items. It re-fetches the cart after success or server rejection so partial outcomes are reflected. No discount or savings claim is emitted. With JavaScript unavailable, product cards still link to their product pages.

Keep quick add and quick view disabled on the bundle's static card, so the selector remains the single purchase control. Verify multi-variant products, quantity rules, rejection/partial outcomes and actual cart totals on a Liquid theme development store.
