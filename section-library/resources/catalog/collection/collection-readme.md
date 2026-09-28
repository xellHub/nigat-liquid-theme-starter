# Collection products

A collection-resource layout containing sort, filter, pagination, and product results.

## Anatomy

The section owns color scheme, maximum width, and vertical spacing. The `_catalog-results` block owns Liquid theme-resource rendering and its internal accessible structure.

The collection banner renders only its image and is omitted when the collection has no image. Catalog results show a filter message when filters produce no matches, or a separate empty collection message when no products are available. The all-products page does not link back to itself from its empty state.

## Responsive behavior

Content remains constrained by the section container and adapts within the block using container-aware layout.

## Accessibility

Resource headings, links, controls, lists, and status content retain semantic HTML and keyboard behavior.
