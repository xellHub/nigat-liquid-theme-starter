# Installed-data migration and release record

Migration record version: `foundation-f30-2026-09-27`. This version labels the repository handoff; it is not evidence that any installed merchant theme was migrated.

## Inspect the target before applying changes

Export the installed theme's `config/settings_data.json`, all JSON templates and section groups, and a copy of custom section/block settings. Record the upstream and fork revisions. Compare IDs against the owning schemas with the F24 validator. Preserve an untouched export for rollback.

Run `node scripts/audit-installed-theme.mjs /path/to/exported-theme` against the export. It reads saved JSON without changing it and reports unknown settings, block types, parent contracts and static block ordering. A nonzero exit means the mapping needs review. Its migration hints are starting points; they do not modify merchant data. The repository's own saved JSON is audited by `bun run check:foundation`.

Map these known repository changes in the installed copy:

| Area | Mapping to review |
| --- | --- |
| Product cards | F07 repeated static `product-card` slot and editable image/title/price children; preserve merchant ordering and custom badges. |
| Comparison rows | Old `feature_name` becomes a `text` child. |
| FAQ disclosures | Old first heading becomes the static `trigger` slot; preserve content and order. |
| Collection tabs | Obsolete `title_1`–`title_4` settings are gone; select the corresponding collections explicitly. |
| Rich text | Old `text_alignment` becomes `alignment`. |
| Product page | Map old size chart and review settings to selected page and provider app block; preserve product sections. |
| Homepage | Default `index.json` is now minimal; the former showcase is `index.showcase.json`. Do not overwrite a customized live homepage. |
| Optional packages | F19 recommendations are in the starter PDP; F20 recently viewed and F21 curated bundles require deliberate installation and product/privacy configuration. |
| Foundation settings | The F22 audit removed inactive media overlay, media text position/hover, header behavior/transparency and accessibility toggle keys. Overlay color follows palette roles, hero content position and sticky mode stay in their owning blocks, and skip navigation/reduced motion remain enabled. Compare installed values before dropping any merchant data. |

See the [card contract](product-card-contract.md), [F12–F20 contract](f12-f20-contract.md), and [implementation log](implementation-progress.md) for exact behavior. Test an imported copy in the Theme Editor, then compare serialized JSON and screenshots. If the target contains unknown custom settings, stop that mapping and record a manual choice. Re-running the mapping must produce the same output before it is used on merchant data.

## Release evidence

| Gate | Current evidence | State |
| --- | --- | --- |
| Canonical mirrors | `bun run check:foundation` verified 47 mirrors after the last Liquid edit. | Local pass |
| JSON, palette, tokens, composition, Theme Check | Final foundation suite passed; Theme Check inspected 224 files with zero offenses. | Local pass |
| English locale references | Literal Liquid key validator checked 353 references and schema validator checked 144 references. JavaScript search template markers are checked. | Local pass |
| Asset bytes | README contains 2026-09-27 raw/gzip baseline; optional Embla now loads from its section. | File baseline only |
| Two style profiles | Generator writes independent preview settings. | Generated locally; visual proof pending |
| Storefront and Theme Editor | No connected preview target. | Pending |
| Installed merchant data | No target export supplied. | Pending |
| Provider and market behavior | Reviews, cart, recommendations, privacy, localized routes need real platform checks. | Pending |

The latest read-only local snapshot is [local-release-report.md](local-release-report.md). It reports passed static checks and no supplied live evidence.

Do not tag or publish a release candidate until the live and migration gates have evidence. Record screenshots with date, browser, viewport, profile, upstream revision and preview store/theme ID in a fork-local evidence folder.
