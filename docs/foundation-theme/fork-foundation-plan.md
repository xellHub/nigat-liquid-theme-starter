# Fork foundation implementation plan

Prepared 2026-09-26. All implementation tasks below start as **not started**. This document is a work specification, not a report that the proposed features have shipped.

Read [the current review](fork-foundation-review.md) and [the implementation contracts](fork-foundation-contracts.md). The review maps every item in the requested checklist to source evidence. The contracts define shared rules so individual task prompts remain small.

## Execution rules

1. Complete one numbered task or named subtask per implementation session. Each task is independently reviewable; do not give a smaller model the entire plan as one coding assignment.
2. Read the task's listed files and directly affected consumers. Existing canonical paths below are intentional. New canonical packages follow the required group/family/variant naming.
3. Follow C01 for section synchronization, documentation, group JSON and usage regeneration. Follow C07 for compatibility. Every task inherits C08's mandatory validation suite in addition to its own acceptance checks.
4. Record implementation status separately from browser/editor/platform acceptance. Do not replace “not tested” with “passed” based on static analysis.
5. The platform question must be resolved in F01: Shopify, XellHub, or both. Default planning assumption is Shopify contracts plus an explicit XellHub capability assessment. This review does not authorize platform-specific guesses.
6. No new package manager, framework, wholesale CSS rewrite, broad `@theme` whitelist or alternative font system is required.

## Dependency and priority table

| Task | Priority | Depends on | Deliverable |
| --- | --- | --- | --- |
| F01 | P0 | — | Runtime capability evidence and corrected handoff entry points |
| F02 | P0 | — | Token inventory and one typography identity |
| F03 | P0 | F01 | Reliable button context and custom-link precedence |
| F04 | P0 | — | Correct card images and honest product ratings |
| F05 | P0 | F02 | Working foundation inheritance for core primitives |
| F06 | P0 | F01 | Controller lifecycle and instance conventions |
| F07 | P1 | F01, F03, F04, F05 | One editable product-card composition |
| F08 | P1 | F03, F06, F07 | Real quick view and quick add |
| F09 | P1 | F03, F06 | Drawer content inside its panel and stable cart refresh |
| F10 | P1 | F09 | Cart notes |
| F11 | P1 | F05, F09 | Shipping progress and configurable upsell slot |
| F12 | P1 | F03, F06 | Reliable main product interactions |
| F13 | P1 | F06, F12 | Product information disclosure composition |
| F14 | P1 | F04, F12 | Review summary and app integration |
| F15 | P1 | F07, F08, F06 | Complete collection page composition |
| F16 | P1 | F03, F05, F06 | Mega menu and consistent header behavior |
| F17 | P1 | F06 | Dismissible accessible announcements |
| F18 | P1 | F03, F05, F06 | Generic composition shell and missing home presets |
| F19 | P1 | F06, F07 | Actual product recommendations |
| F20 | P2 | F06, F07, F19 | Recently viewed package |
| F21 | P2 | F03, F07, F09, F12, F19 | Frequently bought together package |
| F22 | P1 | F05, F07, F09, F12, F18 | Completed style ownership and measured loading |
| F23 | P1 | F08–F21 | Localization and truthful empty states |
| F24 | P1 | F01–F05; final pass after F22–F23 | Stronger regression and schema gates |
| F25 | P1 | Required tasks above | Fork guide, release fixtures and final acceptance |
| F26 | P1 | F25 | Repeatable preview profile fixtures |
| F27 | P1 | F23, F26 | Accessibility and device acceptance record |
| F28 | P1 | F23 | Locale key and long-label gates |
| F29 | P1 | F24, F26 | Installed-data migration handoff |
| F30 | P1 | F25–F29 | Release evidence and blocker decision |
| F31 | P1 | F23 | Truthful starter endorsements, returns and payment methods |
| F32 | P1 | F22 | Quote component style ownership |
| F33 | P1 | F23 | Product and cart interface localization |
| F34 | P1 | F23, F28 | Theme Editor schema localization |
| F35 | P1 | F28, F34 | Literal and schema translation key gate |
| F36 | P1 | F29 | Read-only exported-theme audit |
| F37 | P1 | F21, F24 | Purchase and button regression coverage |
| F38 | P1 | F26 | Profile and package validation |
| F39 | P1 | F30–F38 | Repeatable release report |
| F40 | P1 | F39 | Final storefront/editor acceptance |

P0 protects basic correctness and contracts. P1 is the default foundation release. P2 features are optional to install, but both are necessary to satisfy the complete feature checklist. Do not postpone P0 defects until the optional packages are finished.

## F01 — Prove runtime contracts and repair misleading handoff instructions

**Files to read/edit:** `docs/foundation-theme/{README,technical-architecture,agent-resume-guide,migration-audit}.md`, `theme-architecture.md`, `package.json`, `.theme-check.yml`; read `blocks/button.liquid`, `blocks/newsletter-form.liquid`, `blocks/product-card.liquid`, `scripts/check-composition.mjs` and `scripts/lint-atomic-composition.mjs` for the proof. Proposed output: `docs/foundation-theme/runtime-compatibility.md`.

**Steps:**

1. Record target platform(s), supported renderer/CLI versions, and a preview/editor test route. Treat XellHub behavior as unknown until exercised against its actual renderer.
2. In an isolated fixture/preview, prove dynamic nesting, resource context, static parameters, static card repetition, block editor attributes, native forms, app slots and Ajax section rendering. The fixture must not become a production homepage.
3. Specifically prove the newsletter button's generated element and the selected product available to card children. Capture rendered HTML and editor observations. If a renderer lacks a required capability, record the adapter or prerequisite before dependent work.
4. Correct old section/block counts and the absent `index.second.json` claim. Replace “update both copies” with canonical edits plus sync. State that existing validators have a limited scope.
5. Make `dev` accept the fork's store configuration instead of prescribing `eragel-mismar.myshopify.com`. Document environment/CLI input without embedding credentials. Preserve an explicit local override workflow.

**Acceptance:** A reader can identify supported platforms, reproduce the small fixture, and see which checks are pending. Handoff docs never instruct edits through `sections/`. A new fork can choose its own preview store without editing application code.

**Boundary:** Do not build a speculative XellHub adapter or copy Horizon source. If runtime access is unavailable, documentation work may finish, but the capability proof remains pending for dependent platform features.

## F02 — Inventory tokens and consolidate typography

**Files:** `config/settings_schema.json`, `config/settings_data.json`, `layout/theme.liquid`, `assets/base.css`; scoped reads of `blocks/{heading,text,badge,eyebrow,button}.liquid`; proposed `docs/foundation-theme/token-contract.md` and migration notes.

**Steps:**

1. Inventory all global foundation settings using C02's columns. Trace aliases and direct JS/settings consumers; separate active, partially applied, compatibility alias and unimplemented behavior.
2. Adopt the existing public token names in C02. List each competing setting pair and its precedence before editing it. Keep dimensions/units explicit; the existing root uses 1rem = 10px.
3. Keep the heading/body role model and remove the separate accent font as a configurable third identity. Alias `--font-accent-family` and weight to the chosen existing role during transition, then migrate consumers incrementally.
4. Stop loading a third font face. Preserve required bold/italic faces and default font fallbacks in the foundation layer. Remove industry-specific font guidance from global schema descriptions.
5. Map current accent-family settings in a documented migration; do not silently rewrite installed merchant choices. Repo starter defaults can adopt the agreed unified profile immediately.

**Acceptance:** No independent accent font is loaded in a fresh foundation configuration. Token inventory identifies a real consumer or an explicit pending/deprecated status for every setting. Existing public aliases resolve. Palette selection and heading/body differentiation still work.

**Boundary:** Inventory first; wiring all consumers is F05/F22. Do not introduce more font pickers or a new CSS build pipeline.

## F03 — Make the universal button behave correctly in context

**Files:** `blocks/button.liquid`, `blocks/newsletter-form.liquid`, `blocks/_contact-form-content.liquid`, `blocks/_featured-product-content.liquid`, `blocks/icon-with-text.liquid`, corresponding form presets; relevant action handlers in `assets/theme.js`. Any extracted shared button styling must have one documented owner.

**Steps:**

1. Apply the C04 precedence table. Test a merchant link inside a form and an action container first: the custom link must remain an anchor.
2. Replace arbitrary parent-local variable inheritance with the F01-proven mechanisms. Use native form semantics for dynamic submit buttons, supported resource bindings for links, and explicit parameters on fixed functional static controls.
3. For optional action containers, define the nearest scoped action controller and disabled fallback. Avoid an “Action type” merchant setting and avoid `href="#"` as a functional fallback.
4. Remove `UndefinedObject` suppression for variables no longer needed. Keep legitimate explicit static parameters documented instead of blindly deleting all annotations.
5. Ensure `.theme-button` styles load for functional controls even if the page has no ordinary button block. Unify disabled, loading, focus and size states without moving atom anatomy into sections.

**Acceptance:** Render and exercise newsletter/contact submit with JS enabled and disabled; custom link inside either form; product URL fallback; scoped modal trigger; disconnected button; two forms on the same page. Only the intended form submits and no action is dispatched twice. Links obey target/rel settings.

**Boundary:** Do not migrate every commerce control in this task; establish the reusable contract and the listed consumers first.

## F04 — Correct escaped media and remove fabricated product proof

**Files:** `snippets/product-card.liquid`, `blocks/_product-price.liquid`, `blocks/rating.liquid`, `templates/product.json`, `templates/product.quick-view.json` where applicable, associated presets and locale keys.

**Steps:**

1. Compute image alt fallback before `image_tag`; remove escaping of the complete generated HTML. Keep escaped user text at its proper attribute/text boundary.
2. Replace the fixed product stars/count with validated product review metafields or no output. Support the metafield's actual scale and fractional value; normalize only for display.
3. Distinguish product-derived ratings from deliberately authored testimonial ratings. A product with no data must not inherit the generic five-star default.
4. Remove “289 reviews” from production template defaults. Keep actual product price/variant display intact. Create only focused regression evidence for these bugs.

**Acceptance:** Product cards render real `<img>` elements, not visible escaped tags. Missing alt uses a safe product-title fallback. Product without reviews has no review score/count; valid non-five-point/fractional data is represented accurately; zero and missing values are handled deliberately.

## F05 — Make core tokens and layout defaults control the UI

**Files:** `assets/base.css`, `layout/theme.liquid`, `config/settings_schema.json`, `blocks/{heading,text,button,badge,group,grid,surface,card,media-text}.liquid`; targeted shell defaults for later adoption.

**Split into F05a typography/controls, F05b geometry/layout, F05c local-color migration if needed.**

**Steps:**

1. Wire body base size/leading/tracking and heading size/tracking to the selected public tokens while preserving the initial visual scale. Do not change root rem semantics during this migration.
2. Wire button radius/padding, minimum target size, input geometry and focus width/offset/style. Required focus visibility and reduced motion remain protected behavior, not merchant-disableable accessibility.
3. Replace default drawer width `46rem` with the mapped foundation token, bounded by viewport width. Resolve modal radius, overlay opacity and motion aliases in their actual consumers.
4. Give layout settings a real inherit path. Keep current explicit saved values; make new presets inherit. Distinguish global section spacing from inner grid/card gaps.
5. Replace raw color pickers in badge/group/surface with named roles or schemes. Dry-run report existing custom values and map them using C07; no silent deletion.
6. Fix `media-text` class names so media position and vertical alignment use distinct namespaces. Ensure the intended container query actually has a container ancestor, including standalone use.

**Acceptance:** Change five foundation values—base font size, button radius, card radius, grid gap and drawer width—and observe changes without component stylesheet edits. The image-with-text orientation does not change when vertical alignment changes. Explicit section schemes remain effective; inherited schemes track the root.

**Boundary:** Keep historical aliases until consumers are migrated. Do not perform a bulk numerical search-and-replace across CSS.

## F06 — Define controller lifecycle and per-instance behavior

**Files:** `assets/theme.js`, `blocks/_announcement-rotator.liquid`; inspect existing `SlideshowComponent`, `ThemeOverlay`, `VariantPicker`, zoom and sticky initialization. Proposed `docs/foundation-theme/runtime-events.md`; small JS files may be extracted when ownership is clear.

**Steps:**

1. Document existing cart/event payloads and consumers before exposing the C05 interface. Keep backward compatibility if payloads change.
2. Implement one mounting/teardown convention that works at initial load and after editor/Ajax replacement. Prefer the existing custom-element mechanisms where adequate.
3. Store timer/observer/listener/request handles per instance. Clear them on disconnect/unload. Avoid anonymous listeners that cannot be removed.
4. Make product controllers resolve their owning product root/form, including portal dialogs. Establish an instance-ID convention for product/section/block repetitions.
5. Use the announcement controller as a small lifecycle proof; complete its product behavior in F17. Keep existing slideshow selection support.

**Acceptance:** Mount/unmount/remount the same fixture three times: one action produces one response, abandoned requests do not update new content, and timers stop after removal. Two product roots never update each other's price/form/sticky control.

## F07 — Use one editable product-card implementation everywhere

**Files:** `blocks/product-card.liquid`, `blocks/_collection-tabs.liquid`, `blocks/_catalog-results.liquid`, `snippets/catalog-facets.liquid`, `snippets/product-card.liquid`, `blocks/{heading,image,price,badge,rating}.liquid`, relevant `assets/base.css` card rules; existing featured collection/catalog canonical shells.

**Split:** F07a repeated card/context proof; F07b featured collection migration; F07c catalog/search migration. Keep each caller switch reviewable.

**Steps:**

1. Implement C03's repeated static card slot with editable child atoms and correct resource context. Prove shared editor customization across repeated products before switching callers.
   If the local validator rejects valid static slot data, complete F24a's narrowly scoped static-slot support first. Do not weaken block-order checks or invent dynamic IDs to bypass the failure.
2. Make product image/title/price/rating/button defaults read the nearest chosen product. Explicit merchant overrides win. Define intentional empty-resource/editor behavior.
3. Add truthful badge modes: manual, sale, new and low stock. Sale derives from valid compare-at/current prices; new needs an explicit tag/metafield/date rule; inventory policy follows C06. Keep `badge` terminal.
4. Move card-owned CSS into the card contract; preserve hover image, vendor, rating and image-ratio features. Use existing atomic media and price plumbing.
5. Replace `_collection-tabs` and catalog card rendering with the same block structure. Keep pagination/search non-product results intact. If plumbing remains in `catalog-facets`, pass captured card markup into it explicitly; snippets must not own editable card content.
6. Deprecate the old card snippet only after all intended callers migrate. Provide preset/data migrations preserving block IDs and styles. Remove stale `title_1` etc. settings only after verifying their current schema replacements.

**Acceptance:** An editor change to card title/price order affects collection and featured-grid repetitions. Different products display their own data. Same product in two sections has unique IDs. Keyboard links/actions work without nested anchors; merchant selection is not blocked by overlay links. Search pagination remains correct.

## F08 — Add actual quick view and quick add

**Files:** `blocks/product-card.liquid`, `templates/product.quick-view.json`, product form/variant blocks, `snippets/overlay.liquid`, relevant `assets/theme.js` cart/overlay/product code; proposed `assets/quick-view.js` if it improves isolation.

**Steps:**

1. Retain the product URL as a valid fallback. Enhance the quick-view trigger to open the existing overlay primitive and fetch/render only the intended product fragment.
2. Use the F01-proven response format. Do not inject an entire layout into a modal or assume inline scripts execute after `innerHTML` replacement.
3. Give the fragment a distinct instance namespace and mount/dispose its controllers. Handle loading, missing product, request failure and rapid switch/close.
4. Quick-add a single unambiguous available variant through the existing cart mutation service. Products requiring variant/options selection open quick view; never choose an arbitrary variant silently.
5. Honor quantity rules and required selling plans when applicable; fall back to the product page when the compact UI cannot satisfy them. Expose localized inline errors and prevent duplicate requests.

**Acceptance:** Single-variant add; multivariant selection; sold-out and server inventory errors; repeated open/close; close during fetch; keyboard focus return; no-JS navigation; cart count/drawer update once. PDP and modal variant changes remain isolated.

## F09 — Place drawer blocks inside the panel and stabilize cart rendering

**Files:** `blocks/_cart-drawer-content.liquid`, `snippets/{cart-drawer,cart-items,cart-item,cart-summary,overlay}.liquid`, `assets/theme.js`, canonical `section-library/resources/cart/drawer/cart-drawer.liquid` and cart page package as needed.

**Steps:**

1. Capture the editable child output in the owning block and pass it as an explicit snippet argument into the drawer's panel content, or move that composition to the owning block. Preserve editor attributes.
2. Define panel regions: heading/close, scrollable items, editable supplemental content, summary and checkout. Supplemental content must not appear on the ordinary page while the drawer is closed.
3. Make refresh update items, totals and supplemental cart-dependent regions together. Preserve the overlay instance and focus where possible; remount replaced children deliberately.
4. Use line-item keys for mutation identity where variant IDs are ambiguous. Handle repeated clicks, discounts, empty transitions and section-render failures without repeating successful cart mutations.
5. Apply `.theme-button`/icon-button contract to functional drawer actions. Preserve localized native checkout fallback.

**Acceptance:** Empty→populated→empty cart transitions; add/remove/update; same variant with different properties; discount update; drawer close/focus restoration; supplemental child selected in editor; no child content outside the panel. Cart page and drawer agree after mutations.

## F10 — Add persistent cart notes

**Files:** proposed `blocks/cart-note.liquid`, existing textarea atom, cart parent whitelists/presets, relevant cart service in `assets/theme.js`, locales; canonical cart/drawer packages only if their schemas change.

**Steps:**

1. Add a composed note control with a visible label and the current cart note. Reuse the textarea atom or a narrowly scoped terminal cart-note input; do not put editable copy into a section setting.
2. Persist through the locale-aware cart update endpoint on blur/debounced input. Serialize or sequence writes so older requests cannot overwrite the newest note.
3. Expose saving/error state accessibly and preserve unsaved input during unrelated cart refresh. Provide a retry route.
4. Ensure checkout waits for the most recent note save, or submits the note through the native cart form. Define behavior with multiple cart-note instances.

**Acceptance:** Notes survive reload and item changes; empty note clears correctly; rapid edits preserve the latest value; failed save is visible; checkout receives the current note; keyboard/no-JS cart page works.

## F11 — Add cart shipping progress and an editable upsell region

**Files:** proposed `blocks/cart-shipping-progress.liquid` and `blocks/_cart-upsell.liquid`, `blocks/_cart-drawer-content.liquid`, existing card/heading/text/button atoms, cart service, relevant settings/locales.

**Steps:**

1. Configure threshold amount, currency and market applicability with an explicit owner. Prefer an opt-in feature with no default monetary promise. Define whether discounted shippable subtotal or another agreed basis drives progress.
2. Compare consistent minor units, clamp progress from 0 to 100%, and format remaining currency using platform formatting. Hide unsupported-currency/no-rule/digital-only states per C06.
3. Keep explanatory copy in text/heading atoms and functional remaining-amount output in the progress atom. Announce meaningful completion changes rather than every animation frame.
4. Add an in-panel upsell composition with merchant-selected products first. Reuse F07 cards and F08 actions; exclude unavailable/current cart products according to a documented policy.
5. Refresh both regions after successful cart mutations and market changes. Keep totals and checkout authoritative.

**Acceptance:** Below/exactly/above threshold; zero/invalid threshold; discounted cart; unsupported currency; digital-only cart; sold-out upsell; cart refresh after add. Upsell children remain independently selectable and reorderable where allowed.

## F12 — Harden the main product composition

**Files:** `blocks/_product-resource.liquid`, product title/price/quantity/variant/buy blocks, `snippets/{variant-picker,buy-buttons,price}.liquid`, PDP/featured/quick-view templates, relevant product JS.

**Steps:**

1. Inventory the existing gallery, zoom, variant, size-chart, quantity, buy and sticky functionality. Preserve it while applying F06 instance scoping.
2. Bind every quantity/variant/submit control to the correct native product form. Avoid relying on sibling order or document-wide first matches.
3. Update selected variant price/media/availability/URL and sticky state consistently. Respect unavailable combinations, deep links and server errors.
4. Bind size-chart trigger/dialog IDs using the same instance namespace and show real configured page/metafield content. Hide the trigger if content is unavailable.
5. Use a native submit or `requestSubmit` path for sticky add-to-cart so validation is preserved. Keep the sticky bar out of keyboard navigation while hidden.
6. Establish gallery keyboard behavior and video/model fallback. Maintain zoom focus/scroll cleanup and product structured data from actual resources.

**Acceptance:** Deep-linked variant; variant with different media; no media; sold out; quantity limits; sticky submit after changing quantity; PDP plus featured product plus quick view; size chart open/close; keyboard zoom; no-JS product purchase.

## F13 — Add product information accordions with reliable triggers

**Files:** `blocks/accordion-item.liquid`, `blocks/accordion-trigger.liquid`, `blocks/accordion-items.liquid`, `blocks/_product-description.liquid`, `blocks/_product-resource.liquid`, `templates/product.json`; existing FAQ callers for compatibility checks.

**Steps:**

1. Replace the empty-summary/JavaScript heading move with a server-rendered terminal trigger in a structurally valid position. Use supported static slots for required triggers if needed; editable body remains a dynamic child composition.
2. Migrate old first-heading trigger content to the new trigger representation without losing copy or IDs unnecessarily. Prevent nested interactive links inside a trigger.
3. Add PDP presets for description, shipping/returns, care and ingredients using resource/metafield/page bindings. Show only configured information and preserve intentional merchant overrides.
4. Keep product information as child blocks of the existing product resource unless a genuinely independent section is required. Choose accordions for the initial release; a separate tabs system is unnecessary to satisfy “tabs or accordion.”

**Acceptance:** Named trigger exists before JS runs; keyboard opens/closes; no duplicate moved heading; deleted/empty optional content behaves predictably; FAQ presets still render; product information can be selected/reordered in the editor.

## F14 — Integrate genuine reviews without inventing a review backend

**Files:** `blocks/rating.liquid`, product price/resource composition, app whitelists in canonical product package, product presets and locales; proposed review-integration documentation.

**Steps:**

1. Define supported summary fields: rating value/scale/count from real product metafields. Reuse F04's empty-data behavior.
2. Provide an explicitly allowed app slot for the chosen review provider's list/form. Keep optional merchant heading/text as independent atoms.
3. Link the summary to the actual review region only when it exists. Avoid a dead anchor when no app is installed.
4. Document provider setup and the distinction between editorial testimonials and verified product reviews. Never emit fabricated aggregate review structured data.

**Acceptance:** With no provider/data, no false score or blank review heading is exposed. With real data, count/scale/link are accurate and app blocks remain editor selectable. App absence does not break product purchase.

## F15 — Complete the collection page

**Files:** `blocks/_catalog-results.liquid`, `snippets/catalog-facets.liquid`, `assets/theme.js` facets logic, `templates/collection.json`; proposed `section-library/collections/collection-banner/default/default.liquid`, `section-library/collections/collection-navigation/default/default.liquid`, and `blocks/_collection-navigation.liquid`.

**Steps:**

1. Build a banner shell from existing image/heading/text atoms bound to current collection resources. Empty image/description does not leave a large blank area. The collection heading owns the page H1.
2. Add menu-based subcategory navigation. Do not infer parent/child collection hierarchy from Shopify collections; the merchant chooses a navigation menu. Mark current destination appropriately.
3. Integrate banner/navigation/results in the template using registered clean presets, preserving existing results settings and merchant data via migration.
4. Keep sorting/filter URLs compatible with form GET fallback. Verify active-filter removal, clear-all, mobile drawer, pagination, back/forward, price range and empty results after Ajax replacement.
5. Use F07/F08 cards and actions; make desktop/mobile column settings affect the actual grid with inherited defaults.

**Acceptance:** Collection with/without media, nested menu, multiple active filters, localized price filters, empty result, clear all, back/forward and paginated quick add. Correct H1 and accessible results count; no loss of focus after filtering.

## F16 — Add a real mega menu and consistent header policy

**Files:** `blocks/_header-content.liquid`, canonical header package, header JS/CSS, new narrowly scoped mega-menu/promotion composites only as necessary.

**Steps:**

1. Extend real menu data to three levels with a multicolumn desktop panel and sensible mobile nested navigation. Use menu resource labels for navigation; promotional copy/images/buttons remain child atoms.
2. Match optional promotional blocks to a stable, documented menu identifier. Validate collisions and missing menu items; do not match translated display strings silently.
3. Define Enter/Space, arrow behavior if used, Escape, outside click and focus return. Preserve parent link destinations and do not depend solely on hover.
4. Consolidate the local sticky toggle and foundation header behavior into documented precedence, preserving existing saved toggles. Recalculate offsets after announcement dismissal and resize.
5. Preserve logo, search, cart and account functionality, including account-enabled/disabled states. Use locale strings for the currently hardcoded account labels.

**Acceptance:** Three-level navigation at mobile/desktop, keyboard-only use, parent link navigation, no promo content, long labels, sticky enable/disable and announcement-height changes. Header stays usable in editor re-renders.

## F17 — Make announcements dismissible and accessible

**Files:** `blocks/_announcement-rotator.liquid`, canonical announcement package, lifecycle controller, locale files; group data only through C01's canonical generation prerequisite.

**Steps:**

1. Add optional dismissal and explicit pause/play controls, with localized accessible labels. Preserve text/link atomic children.
2. Use a session-scoped dismissal key tied to section/message revision so new announcements are not suppressed indefinitely. Do not suppress the bar in the editor.
3. Pause on focus, hover, hidden document, reduced motion and editor block selection. Destroy timers on unload. Keep the selected message visible in the editor.
4. Update header geometry after dismissal or message-height changes. Keep no-JS messages readable.

**Acceptance:** Single/multiple messages, dismiss/reload/new revision, keyboard pause, reduced motion, section reload and message selection. No accumulating intervals or repeated unsolicited screen-reader announcements.

## F18 — Expose missing homepage compositions as clean presets

**Files:** existing `blocks/{group,grid,surface,media-text,logo-item,newsletter-form,video,card}.liquid`, existing hero/slideshow/quotes/icons/blog packages; proposed `section-library/layout/custom-section/default/default.liquid` with docs/registration.

**Split:** F18a generic shell; F18b image/text/value/logo/newsletter presets; F18c hero video wiring; F18d footer completion.

**Steps:**

1. Implement the existing scaffold custom-section family as a constrained template shell. Explicitly allow only the approved composites/atoms needed by its presets; include `@app` only where layout permits it. Follow universal scheme and group taxonomy.
2. Add named presets: Image with text (left/right), Brand story, Multicolumn value props, Newsletter/promo, and Logo list. Reuse group row/stack, grid, media-text and newsletter atoms. Avoid five duplicated section implementations where composition is sufficient.
3. Keep existing rich text, testimonials, blog and collection list packages. Add neutral preset options where missing; changing ordinary copy/color is not grounds for another variant.
4. Wire video into the intended hero/slideshow slots using existing video/media atoms. Define poster, controls, muted autoplay, pause-on-hidden-slide and reduced-motion behavior. Load first visible hero media deliberately; defer other slide media.
5. Verify footer menu columns, newsletter, socials, payment providers and copyright as a coherent group. Remove unsupported payment-logo fallback claims. Keep footer-only shells in the footer group and newsletter marketing presets template eligible.
6. Document every preset's tree and allowed child types. Add a clean minimal homepage composition; do not install every showcase variant on the default home page.
7. Verify existing countdown presets before reuse: require an explicit expiry with timezone, define the expired state, stop timers on removal, and never restart an elapsed campaign automatically. Keep countdown as a terminal atom and avoid artificial urgency in starter copy.

**Acceptance:** Every requested home section can be added from a sensible preset. Image/text orientations work; logo alt text is meaningful; newsletter submits; video controls work; hidden slides stop playing. Merchant can edit individual headings/buttons and insert permitted blocks without changing Liquid.

## F19 — Implement product recommendations

**Files:** existing `section-library/products/recommended-products/` scaffold; proposed `default/default.liquid` package and `blocks/_product-recommendations.liquid`; F07 card composition, product template, scoped request controller.

**Steps:**

1. Register a real canonical recommendation section, with independent heading/text and a resource-loop composite. Preserve the existing family documentation and mark implementation status accurately.
2. Request recommendations through the locale-aware Shopify endpoint with product ID, section ID, limit and declared intent, or the F01-proven XellHub equivalent. Avoid calling a curated featured collection personalized recommendations.
3. Render returned product resources through the same static card slot. Handle initial unperformed state, empty list, failed request, disposed section and changed product context.
4. Keep related and complementary intents distinct. Filter duplicates/current product as appropriate; allow an explicitly labeled curated fallback only if configured.
5. Replace the default PDP's mislabeled featured-collection fallback with the real recommendation preset through a compatibility migration.

**Acceptance:** Valid recommendations, zero results, failed request, duplicate/current product, different locale, editor preview, section removal during fetch. One card implementation and no blank heading on empty output.

## F20 — Add recently viewed as an optional package

**Files:** proposed `section-library/products/recently-viewed/default/default.liquid`, `blocks/_recently-viewed.liquid`, scoped storage/request controller; F07 card composition and documentation.

**Steps:**

1. Record minimal product identifiers and timestamps after genuine product views. Version the storage key; deduplicate; cap at 12 entries and expire after 30 days as documented starter defaults.
2. Exclude the current product and resolve only published/available storefront resources in the current market. Handle deleted products and stale identifiers without broken cards.
3. Use the F01-approved rendering endpoint to render F07 cards; reuse its resource-loop contract. Do not reconstruct a second card from hand-built JavaScript strings.
4. Support unavailable storage and any platform-required consent policy. Empty history produces no live empty heading; editor may show explicitly labeled preview content.
5. Lazy-load only when the section is needed, cap concurrent requests and abort on removal.

**Acceptance:** Visit A→B→A, verify dedup/order/current exclusion; expired and deleted entries; blocked storage; market switch; no history; failed partial fetch. The feature does not block product rendering or cart use.

## F21 — Add frequently bought together as an optional package

**Files:** proposed `section-library/products/frequently-bought-together/default/default.liquid`, `blocks/_product-bundle.liquid`, small item-selector composite if necessary, existing product/card/cart contracts.

**Steps:**

1. Use merchant-curated complementary products first, optionally the supported complementary recommendation source. Do not manufacture behavioral claims without evidence; allow a truthful “Pair it with” label through a heading atom.
2. Display selectable products, explicit required variant choices and quantities. Use real available variants, quantity rules and prices. Exclude duplicate/current products as configured.
3. Calculate display totals in consistent currency units from selected variants. Advertise bundle savings only when an actual configured discount is applied by the platform.
4. Submit selected items through one shared cart service call where supported. Handle server rejection or partial outcomes by re-fetching cart and explaining the actual result; do not claim transactional rollback.
5. Reuse F07 rendering and F03 action controls. Keep marketing text as child atoms and selection state in the feature controller.

**Acceptance:** One/multiple items selected, multivariant item, sold out, changed quantity, unavailable item at submission, network retry and rapid double click. Displayed and actual cart totals are reconciled; no unearned savings claim.

## F22 — Complete style ownership and loading improvements

**Files:** `assets/base.css`, `assets/theme.js`, `layout/theme.liquid`, F07/F09/F12/F18 feature owners, quotes-carousel canonical package and quote/testimonial blocks; `README.md` measurements.

**Steps:**

1. Work one feature at a time: product cards, drawer, product UI, quote/testimonial, shared surfaces. Identify the existing owner and callers before moving rules.
2. Keep tokens/reset/common documented utilities in base CSS. Put atom defaults/states in atom-owned styles; let composites own internal layout; let sections own outer distribution and contextual properties.
3. Replace section selectors that mutate child internals with a documented contextual property or move the behavior into the relevant child. Keep a single style definition for shared surface treatment and ensure every consumer loads it.
4. Extract optional controllers only where measured loading benefits exist. Preserve script order, one-time custom-element registration and section editor loading. Load Embla where used, with an idempotent loader if sections can be added dynamically.
5. Complete the token inventory's remaining actionable consumers or mark unsupported settings deprecated. Do not leave an apparently active settings control with no effect.
6. Measure bytes and representative page performance again, including block inline assets. Update README to measured values/date rather than an unsupported tiny-bundle claim.

**Acceptance:** Component outside its original section remains fully styled. Fork geometry/type/palette changes propagate. No missing CSS on Ajax/editor-added blocks. Initial asset bytes do not grow without a documented feature reason. No claim of performance improvement without before/after measurements.

## F23 — Localize interface text and remove production demo fallbacks

**Files:** `locales/en.default.json`, `locales/en.default.schema.json`, blocks/snippets/controllers changed by F08–F21, `config/settings_data.json`, starter templates/presets.

**Steps:**

1. Move system interface strings—account, quick view, navigation controls, review labels, form status, shipping and errors—to locale keys. Merchant marketing content remains in atoms and translation-compatible saved data.
2. Preserve interpolation, pluralization, money and date formatting. Add schema locale keys for new controls. Use logical CSS properties for new directional layout.
3. Gate product demo cards, artificial review counts, unsupported payment logos and brand-specific placeholder claims to explicit editor/demo conditions. Live empty data should be honest and useful.
4. Validate native routes under a locale prefix and long translations. Do not invent translated copy for languages not supplied; document the translation workflow.

**Acceptance:** No newly added hardcoded customer-facing interface strings; missing review/stock/shipping data produces no false claims; long labels fit at 200% zoom; locale-aware cart/search/recommendation routes work.

## F24 — Strengthen checks around actual failure modes

**Files:** `scripts/{validate-tokens,validate-json,check-composition,lint-atomic-composition}.mjs`, existing composition tests, `.theme-check.yml`, `package.json`; new narrowly scoped fixtures/check scripts only when needed.

**Split:** F24a context/schema checks alongside early tasks; F24b token and migration checks; F24c final regression coverage. This task can progress incrementally after its early dependencies.

**Steps:**

1. Validate saved setting IDs against owning schemas and catch stale keys such as obsolete collection-tab titles. Handle dynamic sources and static slot data intentionally.
2. Extend block context checks to reject unsupported arbitrary parameters on dynamic `content_for 'blocks'` and detect undocumented parent-variable reliance. Permit supported static parameters and resource bindings.
3. Check missing token references, local UI color pickers/defaults, competing font identities and documented aliases. Scope raw-color checks so foundation palette values and product content swatches remain valid.
4. Add regression fixtures for post-`image_tag` escaping, static `block_order`, interactive nesting, native submit/custom-link precedence and migration idempotency. Runtime lifecycle and money calculations need focused behavioral tests rather than string matching alone.
5. Re-enable platform schema/JSON checking when supported reproducibly, or supply explicit equivalent offline coverage. Explain required network/schema prerequisites; never disable additional checks merely to make CI green.
6. Add one documented foundation-check command that includes mirror/usage/palette/schema/token/composition checks in a sensible order without silently generating source changes during read-only CI.

**Acceptance:** Each new negative fixture fails for the intended reason and a valid counterpart passes. Current supported presets remain valid. CI catches the original bugs fixed by F03/F04 and stale template settings. No blanket ignored directories beyond generated/canonical duplication policy.

## F25 — Publish the fork workflow and prove a release candidate

**Files:** `README.md`, `docs/foundation-theme/*`, package scripts, token inventory, proposed `docs/foundation-theme/fork-guide.md` and test fixture profiles stored outside active production settings.

**Steps:**

1. Document creating a fork, running Bun install/sync, configuring preview platform/store, setting metadata/logo/socials, selecting heading/body fonts and semantic schemes, and choosing initial presets.
2. Define fork ownership: brand identity in foundation/config/content; shared component fixes upstream; no vertical-specific CSS branches. Record the upstream release/tag and migration version used by the fork.
3. Provide two small temporary style profiles: sharp/compact and soft/spacious. Apply them to a preview fixture through foundation settings only. Preserve production settings while proving the profiles.
4. Compare home, PDP, PLP, cart drawer, forms, footer and missing-data states in both profiles. Explicit section schemes should remain intentional; default consumers must follow the foundation.
5. Complete C08's editor/device/accessibility matrix and platform capabilities. Record screenshots and measurements with actual date/version/viewport. Replace placeholder package diagrams with actual visual evidence where needed.
6. Run final validation, document release blockers and mark tasks complete only with their acceptance evidence. Produce a clean minimal default storefront plus optional packages; do not install all demonstrations by default.

**Acceptance:** Another developer can fork, configure a distinct coherent style and launch a preview by following the guide. Both visual profiles require zero block/section implementation edits. Required features pass on the declared platform(s), with no drift, no theme-check errors and no fabricated production data.

## F26–F30 — Added release tasks (2026-09-27)

These five tasks extend the original F01–F25 roadmap to answer the requested 21–30 scope. They are release proof, not extra storefront features.

### F26 — Repeatable preview profile fixtures

Keep sharp/compact and soft/spacious foundation setting overrides outside production settings. Validate referenced keys and output independent preview `settings_data.json` files. Acceptance: both profiles generate without section or block edits; live visual comparison remains separate.

### F27 — Accessibility and device acceptance record

Run the fork guide's keyboard, focus, 200% zoom, screen reader and three-viewport matrix on a real preview. Store dated screenshots and defects. Acceptance requires actual preview evidence, not static lint alone.

### F28 — Locale key and long-label gates

Validate literal Liquid translation references against the English locale, preserve interpolation, and check long translated labels and locale-prefixed routes in preview. Acceptance requires zero missing keys plus visual and route proof.

### F29 — Installed-data migration handoff

Inventory changed schema IDs, static block IDs, template and section-group settings, and optional package installation instructions. Keep a reversible merchant-data migration plan and recorded version. Acceptance requires an inspected target copy before applying a migration.

### F30 — Release evidence and blocker decision

Run the foundation suite and record mirror count, Theme Check result, bytes, preview/platform evidence, migration version and unresolved blockers. Mark a release candidate only after every required live acceptance case passes.

## F31–F40 — Final hardening phase (added 2026-09-27)

The prior roadmap stopped at F30. These are derived from its unresolved acceptance criteria for the requested “31 to final” continuation. F40 is the final release gate; a local check cannot substitute for a connected storefront.

| Task | Implementation and acceptance |
| --- | --- |
| F31 | Remove invented endorsement, review, return and payment claims from installable presets. Show only enabled payment methods. |
| F32 | Move quote anatomy and variant styles into the quote block; keep carousel distribution and movement in its section. |
| F33 | Localize remaining product/cart functional labels and remove dead native-route links. Verify no new customer-facing literals in changed components. |
| F34 | Use schema locale keys for newly added bundle controls and section settings. |
| F35 | Fail read-only CI on missing English Liquid or schema locale references. |
| F36 | Audit exported merchant JSON without mutation; flag stale settings, unknown types and bad static ordering, with valid and failing fixtures. |
| F37 | Test actual bundle controller selection, minor-unit totals, multi-item request, duplicate suppression and rejection; protect button custom-link precedence. |
| F38 | Validate profile overrides against setting ranges/options, and package completeness through the existing library gate. |
| F39 | Generate a dated read-only release report from repository facts and explicitly supplied live evidence. |
| F40 | Finish real preview, Theme Editor, device, accessibility, market, provider and merchant-data migration acceptance. No release tag until these pass. |

## Task completion record

Use this small record after each task; keep source review findings separate from implementation status:

```text
Task/subtask:
Date and commit/diff reference:
Status: not started | in progress | implemented, runtime pending | verified
Files changed:
Migration/compatibility notes:
Local check results:
Browser/editor/platform evidence:
Remaining blocker, if any:
Next eligible task:
```

The progress log records implementation separately from live preview and release acceptance.
