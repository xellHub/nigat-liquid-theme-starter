# Product recommendations

This template section requests the platform's locale-aware Product Recommendations HTML endpoint after entering the viewport. The section shell controls the color scheme and width; the `_product-recommendations` block loops resources through the same static `product-card` slot used in catalog and featured collections.

The heading is a separate atom. It appears only when the server returns at least one distinct product other than the current product. Related and complementary intents are separate settings. A missing, failed, or empty response leaves no visible section.

The default product template replaces its previous curated featured collection with this package. Installed merchant templates require an opt-in migration of saved section settings and card children.
