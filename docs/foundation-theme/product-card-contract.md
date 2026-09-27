# F07 product-card composition

Updated: 2026-09-26. Code and static gates are implemented; Liquid theme editor and storefront rendering remain unverified without a development store.

## One repeated editable slot

`_collection-tabs` and `_catalog-results` each render the same literal static `product-card` slot inside their product loops. Every iteration passes its current product as `closest.product`. The static card's `product` setting and its image, title, price, rating, badge, link and optional swatches/vendor children use dynamic-source settings. Merchants can reorder or hide the dynamic child atoms once for all repeated cards in that parent instance. A deliberate setting override wins over the nearest product.

The card owns its border, radius, image ratio, hover image and internal spacing. The parent owns grid columns and rail placement. Image and button atoms own their links, leaving the title and other child blocks directly selectable without an enclosing overlay anchor. Image hover swapping only uses a second image media item. Each rendered card gets a `data-card-instance` value from section ID, parent block ID, tab/page and loop position; its optional anchor appends that value. The same product in two positions therefore has distinct HTML IDs.

Liquid theme documents resource context in repeated static blocks and static block preset/data rules. This source implementation follows those rules; actual editor behavior must still be checked in a Liquid theme development preview and separately in XellHub if it has a compatible renderer.

## Content truth

The card renders only for an assigned product on the storefront. In Theme Editor mode, an empty slot shows its editable placeholder atoms. An empty featured collection shows a localized no-matches message outside the editor. Search keeps non-product results as linked results and retains the same pagination and facets wrapper.

`badge` has four modes: manual text; sale if the selected available variant has a real higher compare-at price; new if the product has an exact `new` or `New` tag; and low stock only for a single default variant with Liquid theme-tracked inventory, deny overselling, positive quantity at or below the merchant threshold. Other cases emit no automatic badge. Product swatches link only available variants from the first color/colour option, use Liquid theme swatch colors when present and use semantic surface tokens otherwise. The price and rating atoms retain the F04 real product-data rules.

## Saved-data migration

- Repository templates that contain `_collection-tabs` or `_catalog-results` now persist a `product-card` child with `static: true`. Its literal ID is absent from the parent's `block_order`; its own dynamic children retain normal IDs and order.
- Old `_collection-tabs.show_vendor` and `show_swatches` values were removed from repository template data. A true vendor setting became an editable `eyebrow` child; a true swatches setting became an editable `product-swatches` child. The new featured-tabs preset includes both because the old defaults were true. The catalog preset retains neither, matching its previous caller behavior.
- Existing merchant-installed theme data is **not** migrated by repository edits. Inventory each installed template/section group before deployment and carry over these two settings as corresponding child blocks. Keep merchant child IDs and ordering when merging remote customization.
- `snippets/product-card.liquid` remains for the header search banner and its compatibility wrapper. `featured-collection-demo-card.liquid` was removed after its final caller migrated. F08 owns quick-view/quick-add actions; this card currently offers native product navigation.

## Preview acceptance still due

In theme editor, reorder title and price in one static card and confirm every product in that parent reflects the order; then test both featured tabs and collection/search. Test two different products and the same product in two sections, keyboard selection of image/link/swatches, empty collections, sale/new/low-stock edge cases, and search pagination with page results. Verify the rendered HTML has no duplicate IDs or nested links. Static validation cannot establish these runtime outcomes.
