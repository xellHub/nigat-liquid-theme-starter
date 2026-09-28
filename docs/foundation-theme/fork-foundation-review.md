# Fork foundation review — 2026-09-26

Status: source review and implementation plan, not an implementation release.

Read [the implementation tasks](fork-foundation-plan.md) after this review. Each task refers to [shared contracts and acceptance checks](fork-foundation-contracts.md). Current `AGENTS.md` takes precedence over older handoff documents.

## Recommendation

Keep the current nested theme-block architecture. Framework already has the core structure needed for a reusable foundation. The next work should make its contracts reliable, complete the essential commerce features, and make brand changes propagate consistently through tokens.

The principal weakness is the difference between declaring reusable blocks/tokens and actually using them throughout the storefront. A passing composition check does not establish that every visible element is selectable, every setting changes the page, or every commerce interaction works.

Use Tailwind v4's CSS-variable approach as the design model. Retain native CSS and Liquid as the implementation. Introducing a Tailwind compilation pipeline would be a separate decision with little immediate benefit to this review's goals.

Platform assumption while preparing this plan: Liquid theme compatibility is the reference contract; XellHub support must be demonstrated against its actual renderer and endpoints. No XellHub renderer or backend was available in this repository review. This is an implementation prerequisite for platform-dependent tasks, not a claim that Liquid theme code runs unchanged on XellHub.

## Verified baseline

| Item | Observed result |
| --- | --- |
| Canonical section implementations | 43 registered Liquid mirrors |
| Runtime sections | 43; sync changed no files |
| Theme blocks | 96: 41 public filenames and 55 filenames beginning with `_` |
| JSON templates | 17 |
| Nested block instances in templates | 411, according to composition validation |
| Deepest template nesting | 4 block levels |
| Color schemes | 10, validated |
| Theme Check | 205 files inspected; no offenses under current configuration |
| Atomic composition audit | Zero reported violations |
| Bun | 1.4.0 |
| theme CLI used for checks | 4.3.0 |

All required commands completed successfully: `bun run sync`, `bun run sync check`, the JSON/palette/token/library/composition validators, and `bun run check`. The last command ran in CI mode to avoid CLI auto-upgrade during validation. Initial CLI version inspection attempted an automatic package-manager upgrade; that process was interrupted. No dependency upgrade was part of this review.

`AGENTS.md` already had a user modification at the start. It was not edited. No storefront implementation was changed. No browser, merchant editor, live checkout, or XellHub integration test was performed; feature statuses below describe source evidence.

## Checklist coverage

Status meanings: **Implemented** = substantive source exists, still requires runtime acceptance; **Partial** = part of the requested behavior exists; **Composable** = blocks exist but a clear installable section/preset is missing; **Missing** = no functional implementation found in the relevant inventory. A scaffold readme is not an implementation.

### Global sections

| Requested feature | Status | Evidence and required work |
| --- | --- | --- |
| Header logo, navigation, search, cart, account, sticky toggle | Implemented | `blocks/_header-content.liquid` and `assets/theme.js`; preserve these capabilities and test instance/lifecycle behavior. |
| Mega menu | Partial | Header has a child-link dropdown. Add a real multicolumn hierarchy, third-level navigation, keyboard behavior, and optional independently editable promotional content. |
| Rotating announcement | Implemented | `_announcement-rotator.liquid`; interval starts in an inline script. Add teardown, pause controls, editor selection, and reduced-motion handling. |
| Dismissible/localizable announcement | Partial | Text/link children are editable; no dismissal mechanism found. System controls need locale keys. |
| Footer columns, newsletter, socials, payments, copyright | Implemented across compositions | `_footer-content`, `_footer-column`, `_footer-subscribe`, `newsletter-form`; verify form submission/context and remove payment-provider demo fallbacks on live stores. |
| Slide-out cart and line items | Implemented | `_cart-drawer-content`, `cart-drawer`, `cart-items`, `cart-item`, overlay and cart JS. |
| Cart notes | Missing | No note control/persistence found in the inspected drawer/page cart paths. |
| Cart upsell slot | Partial | Editable children exist, but render after the drawer snippet, outside its panel. They are not a working in-panel upsell slot. |
| Free-shipping progress | Missing | No threshold/progress implementation found. Must be market/currency aware and never imply a checkout guarantee. |

### Homepage sections

| Requested feature | Status | Evidence and required work |
| --- | --- | --- |
| Hero/slideshow | Implemented | Registered hero and slideshow variants with nested slide/media blocks. |
| Video-capable hero/slides | Partial | `video` atom exists; image-led hero/slide coordinators do not establish complete video wiring. Add explicit supported slots/presets and playback lifecycle tests. |
| Featured collection with columns | Implemented | Featured collection shell and `_collection-tabs`; currently repeats the product-card snippet rather than the editable product-card block. |
| Rich text/brand story | Implemented | Registered rich-text package and heading/text/group/quote atoms. |
| Image with text, both orientations | Composable | `media-text` exists. Its `--end` class currently serves both alignment and media order, causing a setting collision. No dedicated registered image-with-text shell was found. |
| Multicolumn/value propositions | Implemented/composable | Icons-with-text package plus grid/group/icon-with-text; add a neutral multicolumn preset rather than duplicate atoms. |
| Testimonials carousel | Implemented | Quotes-carousel package, testimonial and quote blocks. Separate editorial testimonials from verified product review data. |
| Featured blog posts | Implemented | Featured-blog shell and `_blog-carousel`. |
| Newsletter/promo banner | Composable | Newsletter atom, footer-subscribe, rich-text/group exist. Add a template-eligible newsletter preset with native form behavior. |
| Visual collection list | Implemented | Carousel, bento, editorial, material-card registered variants. |
| Logo list | Composable | `logo-item`, grid and marquee exist; supply a curated neutral preset and meaningful logo alt text. |

### Product and collection pages

| Requested feature | Status | Evidence and required work |
| --- | --- | --- |
| Gallery/zoom | Implemented | `_product-resource` and the zoom controller in `theme.js`; scope IDs/listeners to the product instance. |
| Variants/swatches/size chart | Implemented | `_product-variant-picker`, `variant-picker`, size-chart trigger/modal. Verify product-instance IDs, unavailable combinations, and real size-chart content. |
| Quantity and sticky add-to-cart | Implemented | Product quantity/buy blocks and sticky controller. Global selectors make multiple product instances a risk. |
| Description/shipping/care/ingredients accordion or tabs | Partial | Description and accordion atoms exist; product template does not provide the complete merchant-editable information composition. |
| Frequently bought together | Missing | Wishlist popover “quick-add” comment is not a bundle/cross-sell implementation. |
| Recently viewed | Missing | No product-history/storage/rendering feature found. |
| Recommended products | Missing as recommendations | Family readme explicitly says scaffold/no concrete variants. Product template currently uses featured collection under “You may also like.” |
| Product reviews | Partial; unsafe defaults | Rating atom and app slots exist, but `_product-price` renders fixed four stars and a default “289 reviews.” There is no complete verified review-list feature. |
| Collection filtering and sorting | Implemented | `_catalog-results`, `catalog-facets`, `FacetFiltersForm`, price-range controls. Verify back/forward, pagination, localization, and replacement lifecycle. |
| Collection image/title/description banner | Partial | Catalog has header child slots and a title fallback; default collection template only configures the results block. Add a proper resource-bound banner composition. |
| Subcategory navigation | Missing as PLP feature | Collection-list building blocks exist, but no dedicated menu-bound collection-page navigation in the template. |
| Card quick view | Partial | `product-card` atom has a link to `?view=quick-view`; no actual modal loading controller was found. |
| Card quick add | Missing as shared card action | Product forms exist elsewhere. Neither shared card path establishes the required quick-add contract. |

### Reusable blocks

All requested basic types already have corresponding files: `card`, `product-card`, `badge`, `button`, `image`, `video`, `icon`, `text`, `countdown`, `accordion-item`, `testimonial`, `quote`, `grid`, `group`, and `surface`. `group` provides row/stack layout; separate row and stack implementations are unnecessary.

The gaps concern behavior and adoption: product context, automatic badge data, resource-bound text/media, button actions, responsive layout settings, and reusable styling. Preserve existing type names and IDs wherever possible.

## Findings ordered by implementation priority

### R01 — Product-card image output is escaped after HTML generation

`snippets/product-card.liquid:64` applies `escape` after `image_tag` for both product images. That escapes the generated tag rather than just image alt text. The featured collection and catalog use this path, so this is a purchase-path defect to verify and correct before the card migration. Compute fallback alt text separately and pass it into `image_tag`.

### R02 — Parent button variables do not establish a Liquid theme theme-block contract

`blocks/newsletter-form.liquid:17` assigns `button_element` before a dynamic block slot. `blocks/button.liquid:10` reads that variable and other parent-local variables while suppressing `UndefinedObject`. Similar assignments exist in contact form, featured product and icon-with-text.

Liquid theme theme blocks do not inherit arbitrary surrounding Liquid assignments. Resource context and explicitly passed static-block parameters are supported alternatives. The current pattern is therefore a compatibility defect/risk, even though its linter passes. In addition, an explicit submit/action context currently wins over a custom link in `button.liquid`, contrary to the documented custom-link precedence. See task F03 and the button decision table.

### R03 — Product proof is fabricated by default

`blocks/_product-price.liquid:3` renders a fixed rating and “289 reviews”; `templates/product.json` also supplies that count. `blocks/rating.liquid:11` falls back to a configured score, whose schema default is five. Product review UI must use genuine metafields/app data and omit itself when unavailable. Editorial testimonials may have deliberately authored ratings, with clearly separate semantics.

### R04 — Product cards have two competing implementations

`blocks/product-card.liquid` composes atoms. `snippets/product-card.liquid` owns separate image/title/price/badge markup, styled largely in `assets/base.css:3807`. `_collection-tabs.liquid:58` and catalog rendering use the snippet. Editing the product-card block therefore does not control the principal product lists.

Use one repeated editable card composition, preserving snippets only for non-editable media/price/API plumbing. Keep repeated card HTML IDs unique even when the same product appears in multiple lists.

### R05 — Drawer extension content is outside the interactive surface

`blocks/_cart-drawer-content.liquid:10` renders the drawer, then its children as siblings. `snippets/cart-drawer.liquid` captures the actual panel content separately. Move the editable slot into the panel before adding upsells, shipping progress or messages. Cart replacement currently updates `[data-cart-items]`; additions must participate in that refresh contract.

### R06 — A third font identity and per-block colors undermine simple forks

`config/settings_schema.json:250` exposes `font_accent`; `layout/theme.liquid:47` resolves it and may load a third family. Badge and other label styles consume that third family. Keep the allowed heading/body identity and alias old accent tokens during migration.

`blocks/badge.liquid:95`, `blocks/group.liquid:307`, and `blocks/surface.liquid:69` expose local color pickers. These can override a fork's semantic palette without triggering the current no-hardcoded-default checks. Map existing overrides to named semantic roles/schemes using an explicit migration policy.

### R07 — Some foundation settings do not control the advertised behavior

Concrete example: `layout/theme.liquid:136` emits `--foundation-drawer-width`, while `assets/base.css:8633` uses `width: min(46rem, 100vw)`.

Body text at `assets/base.css:136` uses a fixed `1.6rem` base; the emitted `--foundation-base-font-size` feeds other aliases instead of the base body rule. Heading tracking also has a fixed base rule. The plan must trace each setting through aliases to actual consumers before labeling it active.

A preliminary search found 33 emitted foundation properties without a direct `var()` consumer outside `layout/theme.liquid`. This is only a triage count: indirect aliases and JavaScript/settings reads mean it is **not** proof that all 33 are unused. Build the explicit token inventory in F02.

### R08 — Component ownership remains mixed

`assets/base.css` has 10,680 lines, including product-card, cart and other feature styles; quotes-carousel's section stylesheet targets quote atoms' internals. Shared surface styling is also defined in base CSS. Move ownership in small feature slices with render comparisons; keep resets, tokens and documented common utilities central.

Measured files: `base.css` 225,113 bytes / approximately 35,054 gzip; `theme.js` 157,342 bytes / approximately 32,292 gzip. These are local measurements, not network transfer or performance scores. `layout/theme.liquid:360` loads Embla globally as well. README's “~4.5 KB gzipped” total JavaScript claim does not match this checkout.

### R09 — Lifecycle and progressive enhancement need explicit contracts

Announcement rotation uses an untracked interval. Product zoom and sticky add-to-cart initialize from document-level selectors. Slideshow has some editor lifecycle support, so preserve and extend that work rather than replace it indiscriminately.

`accordion-item.liquid` moves a heading into an initially unnamed summary using JavaScript. Its no-JS state and linked-heading semantics require correction. `media-text.liquid` uses `theme-media-text--end` for two different settings; changing vertical alignment can change media order.

### R10 — Documentation and validators overstate coverage

`migration-audit.md` says 44 sections and 37 foundational blocks; the actual counts are 43 and 41 public filenames. It references an absent `index.second.json`. `agent-resume-guide.md` tells agents to update both copies, contradicting canonical-only editing. `technical-architecture.md` treats `.button` as the control primitive while AGENTS mandates `.theme-button` for action controls.

`.theme-check.yml` disables `ValidSchema` and `ValidJSON`; current checks cannot be treated as full platform-schema verification. Local JSON validation is useful but does not prove all schema semantics or reject every stale template setting. The composition audit also does not detect escaped images, false review data, broken Liquid context, runtime focus behavior or unused settings.

## Recommended milestones

| Milestone | Outcome | Tasks |
| --- | --- | --- |
| A: reliable contracts | Honest data, correct media, tested context, measurable tokens, lifecycle foundation | F01–F06 |
| B: complete core storefront | One product-card composition, usable quick shopping/cart, complete PDP/PLP | F07–F15 |
| C: checklist completion | Navigation, announcements, reusable home presets, real discovery sections | F16–F21 |
| D: fork release | Token portability, localized interface, verified gates, fork documentation | F22–F25 |

Core foundation release requires A, B, F16–F19, and D. Recently viewed and frequently bought together can ship as optional library packages, but the full requested checklist is complete only after F20–F21 also pass.

## External references checked for this plan

- Liquid theme theme blocks: reusable block files and Liquid scope.
- Dynamic sources and closest resources: resource propagation through `content_for`.
- Static theme blocks: explicit parameters, fixed slots, and persisted `static: true` data.
- Theme limits: validate nesting and other platform limits rather than assuming local checks cover them.
- [Tailwind theme variables](https://tailwindcss.com/docs/theme): CSS-first configuration; `@theme` belongs to Tailwind's compiler and is not a browser-native substitute for `:root`.
- Cart API, section rendering, and recommendations: Liquid theme runtime contracts for the proposed commerce features.
