# Recently viewed

Optional template section. Add it to product templates where view history should be collected. It stores only product handles and timestamps under the versioned `framework:recently-viewed:v1` browser key, capped at 12 entries for 30 days. Existing history under `nigat:recently-viewed:v1` is migrated when read. The current product is omitted from the displayed list.

The controller loads the platform's Customer Privacy API and checks preference processing permission before reading or writing history. It resolves each handle through a locale-aware product page section render, so unpublished, unavailable, and inaccessible products produce no card. Three requests run at a time and are aborted when the section is removed. Cards are rendered by the same static `product-card` slot as the catalog, not assembled in JavaScript.

Only product templates carrying this optional section record views. A merchant should add it to every product template where a complete history is desired. Failed or blocked storage leaves the section hidden.
