# Implementation contracts for the fork foundation

Status: proposed contracts for [the task plan](fork-foundation-plan.md). Existing behavior is described separately in [the review](fork-foundation-review.md). New filenames mentioned here are planned artifacts unless they already exist.

## C01 — File ownership and the work unit

One implementation session completes one numbered task or one explicitly named subtask. Read its listed files, make the smallest coherent change, run its checks, and report remaining work. Do not opportunistically rewrite other sections.

Every task involving a canonical section automatically includes these companion files in scope: its readme, `usage.md`, `psychology.md`, real visual reference, `scripts/validate-section-library.mjs`, and affected presets/templates/locales. Preserve existing canonical paths; the current library contains historical path exceptions. New packages use `section-library/<group>/<family>/<variant>/<variant>.liquid`.

All runtime Liquid changes happen through `bun run sync`. Section-group JSON files are also under the user-protected `sections/` directory; do not hand-edit them. If a task needs group data changes, first provide a canonical JSON source and a validated generator/sync registration. Until that exists, group updates are an explicit prerequisite, not an exception to the prohibition.

Changing block schemas invalidates generated usage documentation even if no section schema changed. Run `node scripts/generate-section-usage.mjs` after relevant schema/preset changes, then the required suite.

## C02 — The token pipeline

```text
Fork settings and approved foundation defaults
  → layout emits saved values and semantic color schemes
  → public semantic CSS properties
  → atom/composite defaults
  → section layout and merchant content
```

Keep one public name for each meaning. Preserve existing aliases while callers migrate. Foundation literals are allowed in foundation files; UI components consume semantic tokens. Product swatches and brand artwork represent content and must be distinguished from interface colors.

| Concern | Public contract | Main consumers | Required fork proof |
| --- | --- | --- | --- |
| Canvas and surface | `--color-background`, `--color-surface`, `--color-surface-raised` | Shells, surfaces, cards, overlays | Palette swap changes all inherited backgrounds |
| Copy and boundaries | `--color-text`, `--color-muted`, `--color-border` | Heading/text/input/divider | Contrast remains usable in light/dark and explicit schemes |
| Actions | `--color-button`, `--color-button-text`, `--color-accent`, `--color-accent-text` | Every primary/secondary action | Cart and generic button use the same contract |
| Type identity | `--font-heading-family`, `--font-body-family`, corresponding weights | All text atoms and functional labels | No separately loaded accent family or component font picker |
| Type rhythm | `--line-height-*`, `--tracking-body`, proposed `--tracking-heading`, `--text-*` | Body and heading scales | Base size/leading/tracking settings visibly change consumers |
| Spacing | Existing `--space-*`, `--grid-gap`, foundation gutters and section spacing | Group/grid/shells | One scale adjustment reaches all default compositions |
| Geometry | `--radius-button`, `--radius-card`, `--radius-media`, proposed `--radius-modal` alias | Buttons/cards/media/overlays | Square and rounded profiles need no block stylesheet edits |
| Controls | `--control-height`, foundation padding/target/focus settings | Form atoms/action buttons | Forms, quick add and drawer controls match |
| Elevation | `--shadow-*`, `--color-shadow` | Surface/card/modal | Shadow color follows the active scheme |
| Motion | `--motion-duration-fast`, `--motion-duration-normal`, `--motion-ease` | Interactive blocks | Reduced motion suppresses animation and autoplay |
| Navigation | Existing foundation header/drawer settings mapped to CSS or JS explicitly | Header/drawers | Drawer width and selected sticky policy actually work |

Do not introduce a second `--spacing-*` scale simply to resemble Tailwind. Do not put raw `@theme` directives in browser-loaded CSS. CSS custom properties cannot serve as ordinary `@media` breakpoint conditions; retain documented literal breakpoints or deliberately adopt a build step in a separate decision. Named container queries can express component layout without tying it to viewport width.

Define precedence explicitly: foundation default → selected semantic scheme/role → allowed local structural setting. A local “inherit” choice must emit no conflicting declaration. An existing explicit width/padding must not silently disappear during migration. New presets should inherit by default.

The token inventory must include setting ID, units, default, emitted property, aliases, CSS/JS consumers, status, and migration notes. Enumerated behaviors such as sticky mode need JS/data-attribute consumers; emitting a string-valued CSS property alone does not implement them.

## C03 — Data and theme-block context

Blocks may read their own settings, supported global objects and verified resource context. They must not reach into another block's settings or depend on undeclared parent-local assignments. Snippets receive explicit arguments.

For repeated products, prefer a static card slot inside the resource loop with the current product passed as `closest.product`. The repeated card contains editable dynamic atoms. Use a literal static slot ID and `static: true` in saved/preset data where required; omit static IDs from `block_order`. The repeated instance shares its card design, while every product supplies its own data. Verify actual editor behavior in F01/F07; do not invent an independent merchant-editable block per catalog item.

Example intent, to validate with the renderer and local validators before rollout:

```liquid
{% for card_product in collection.products %}
  {% content_for 'block', type: 'product-card', id: 'product-card', closest.product: card_product %}
{% endfor %}
```

The parent explicitly allows `product-card`. The card propagates the chosen product to its children using supported `closest.product` context. Product title/image/price atoms should use dynamic-source defaults while allowing intentional merchant overrides. Include product identity and an instance namespace in HTML control IDs; a static slot ID or product ID alone is insufficient across multiple lists.

Static slots have editing restrictions. Use them for required structural positions or repeated resource templates, and dynamic slots for freely reorderable marketing content. Never convert all marketing buttons/headings to static blocks just to avoid solving context.

Shopify's [dynamic resource context](https://shopify.dev/docs/storefronts/themes/architecture/blocks/theme-blocks/dynamic-sources) and [static slot rules](https://shopify.dev/docs/storefronts/themes/architecture/blocks/theme-blocks/static-blocks) govern these choices. XellHub must demonstrate equivalent behavior before claiming compatibility.

## C04 — Button behavior

| Condition, in priority order | Result |
| --- | --- |
| Merchant supplies a custom link | Anchor to that URL; overrides form, action and resource fallback |
| Required functional static control receives a verified submit context | Native submit button associated with the correct form |
| Required functional static control receives a verified action and target | `type="button"` plus scoped action/target |
| Dynamic button is inside a real form, no custom link/action | Native submit behavior; do not depend on arbitrary parent Liquid assigns |
| Resource CTA has a real inherited resource URL | Anchor with that URL, via supported resource settings/context |
| Optional container action is available | Button resolved by the nearest controller, without a merchant action-type setting |
| No link, resource, form or action exists | Inert/disabled control or editor-only placeholder; never a misleading `href="#"` purchase action |

F03 must prove server-rendered output for forms and resource links. The browser can infer a form owner through native button semantics, and JavaScript can resolve the nearest action container. Neither proves that Liquid can inspect an arbitrary DOM ancestor. Resolve that distinction explicitly.

Recommended implementation boundary: keep native no-link submit semantics for freely inserted form buttons; use resource-bound URL defaults for resource CTAs; use explicit static parameters for required controls with fixed actions. A DOM controller may enhance optional container actions, but must preserve valid HTML, custom-link precedence, keyboard operation, and native form submission when JavaScript fails.

Use `.theme-button` and the shared tokens for all functional controls, with the existing icon-button composition for icon-only controls. Ensure the style contract is available on pages with no generic button instance; do not rely on incidental asset inclusion by an unrelated block. Avoid adding an editable action-type dropdown.

## C05 — Runtime lifecycle and events

Use custom elements or scoped controllers with explicit `mount(root)` and `destroy()` behavior. Mount is idempotent. Destroy clears listeners, observers, pending timers, request controllers and media playback. A controller owns its own DOM subtree, with explicit references for portals.

Handle initial load, `shopify:section:load`, `shopify:section:unload`, relevant block selection, and Ajax-replaced markup. In the editor, reveal a selected hidden slide/tab and pause autoplay. Never use a document-wide first match to choose which product form a quick view/sticky button updates.

Keep the existing cart store as the starting point. Expose one documented, scoped public interface rather than create a second cart state owner. Proposed event payloads:

```text
cart:updated  { cart, source, requestId }
cart:error    { message, source, requestId }
product:variant-changed { productId, variant, instanceId }
```

These are target contracts, not claims about existing payloads. Current `cart:updated` detail is the raw cart. Either retain that shape or migrate every caller together with a compatibility adapter. Do not change event shapes silently.

Locale-aware endpoints come from the existing routes bootstrap. Check non-success HTTP responses, missing/null rendered sections and malformed responses. A cart mutation can succeed even when its optional rendered HTML is missing; refresh the UI safely without repeating the add operation.

## C06 — Accessibility and content truth

Native forms/links remain usable without JavaScript. Dialogs have names, Escape behavior, focus containment/return, and predictable body-scroll restoration. Only modal overlays make the outside page inert. Restore focus sensibly after the original node was replaced.

Keep interactive atoms outside enclosing links/buttons. For delegated disclosure controls, implement Enter/Space as well as click and ignore interactive descendants. Prefer an explicit terminal trigger atom with a properly associated panel. A generic heading containing rich links is not automatically a valid disclosure trigger.

Autoplay must pause for focus, hover where appropriate, hidden tabs, editor selection, and reduced motion; offer an explicit pause control. Avoid announcing every decorative slide change through a permanent live region.

Prices, availability, reviews, discounts, stock and payment methods come from real resources. Empty reviews produce no stars/count. “Low stock” requires tracked inventory, a threshold, and an explicit policy for continued selling. “New” requires a merchant tag/metafield or an agreed date rule. Demo content appears only in an explicitly marked editor/demo state.

Shipping progress is advisory. Configure a threshold with a currency and market applicability, compare values in consistent minor units, hide when the active currency/rule is unknown, and distinguish digital-only carts. Do not derive free shipping from arbitrary cart totals or promise eligibility that only checkout can determine.

## C07 — Migration and compatibility

Preserve section types, block types, block IDs, ordering and settings unless the task names a migration. Do not replace a merchant's entire template with a clean preset.

Every migration has: input version, output version, dry-run report, backup/output path, explicit old→new mapping, unknown-value handling, and an idempotency check. Report unmapped custom colors/font choices for manual mapping; do not silently discard them. Repo presets can be updated directly, but installed merchant data requires an opt-in migration workflow.

Add aliases before removing old tokens. Keep deprecated settings readable for one documented transition period if installed forks depend on them. Brand configuration may change foundation defaults and content; it must not introduce industry conditionals into shared block implementations.

## C08 — Verification

Run the mandatory repository suite once at the end of each completed implementation task:

```bash
bun run sync
bun run sync check
node scripts/validate-json.mjs
node scripts/validate-palettes.mjs
node scripts/validate-tokens.mjs
node scripts/validate-section-library.mjs
node scripts/check-composition.mjs
CI=1 SHOPIFY_CLI_NO_ANALYTICS=1 bun run check
```

When schemas changed, regenerate usage before this suite. For changed JS, also run `node --check` on those files. Run `bun run test:composition` only when changing composition validators or their fixtures. Add focused tests for money calculations, migrations, request/error handling and controller cleanup; do not add tests that only repeat constant markup.

Browser acceptance uses 375px, 768px and 1440px widths; keyboard-only interaction; 200% zoom; reduced motion; light/dark; global and explicit section schemes. Use products covering no image, single variant, multiple variants, sold out, missing reviews, genuine reviews, video media and long localized copy. Use empty and populated carts.

For editor changes: add, select, reorder, hide, delete and duplicate permitted children; reload/unload/re-add sections; verify no extra listeners or timers. Test two product instances on one page and two sections showing the same product. Static structural slots must advertise their editing limitations.

A task is complete only when its specific acceptance conditions and required local suite pass. If renderer/store credentials are unavailable, mark runtime acceptance **pending**, specify the missing evidence, and do not claim the feature is production verified.

## C09 — Agent work order template

```text
Implement task Fxx from docs/foundation-theme/fork-foundation-plan.md.
Read AGENTS.md, Fxx, its dependencies' completion notes, and the cited contracts.
Inspect only the listed implementation files and directly affected callers/data.
Keep user changes. Edit canonical sections only; sync runtime outputs.
Do not implement later tasks or weaken checks to obtain a pass.
Preserve saved IDs/settings; provide a dry-run migration if the task changes them.
Complete the task's numbered steps and acceptance checks.
Regenerate usage if schemas changed and run C08 once.
Report changed files, observable behavior, check results, pending runtime checks,
and the next task. Update the task status without marking untested work complete.
```
