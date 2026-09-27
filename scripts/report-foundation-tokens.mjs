import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const groups = JSON.parse(readFileSync(join(root, "config/settings_schema.json"), "utf8"));
const foundation = groups.find((group) => group.name === "Foundation: future global tokens");
if (!foundation) throw new Error("Foundation settings group is missing");

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const sourcePaths = ["assets", "blocks", "snippets", "section-library"]
  .flatMap((directory) => walk(join(root, directory)))
  .filter((path) => /\.(css|js|liquid)$/.test(path))
  .filter((path) => relative(root, path) !== "snippets/design-controls.liquid");
const sourceFiles = sourcePaths.map((path) => ({
  path: relative(root, path),
  source: readFileSync(path, "utf8"),
}));
const layout = readFileSync(join(root, "layout/theme.liquid"), "utf8");
const settings = foundation.settings.filter((setting) => setting.id?.startsWith("foundation_"));

const rows = settings.map((setting) => {
  const property = `--${setting.id.replaceAll("_", "-")}`;
  const emitted = layout.includes(`${property}:`);
  const consumers = sourceFiles
    .filter(({ source }) => source.includes(`var(${property}`) || source.includes(`var( ${property}`))
    .map(({ path }) => path);
  const aliases = [...layout.matchAll(/--([a-z0-9-]+):[^;]*;/g)]
    .filter(([declaration]) => declaration.includes(`var(${property}`))
    .map(([, name]) => `--${name}`)
    .filter((alias) => alias !== property);
  const aliasConsumers = sourceFiles
    .filter(({ source }) => aliases.some((alias) => source.includes(`var(${alias}`)))
    .map(({ path }) => path);
  const rawConsumers = sourceFiles
    .filter(({ source }) => source.includes(`settings.${setting.id}`) || source.includes(setting.id))
    .map(({ path }) => path)
    .filter((path) => !consumers.includes(path));
  const layoutReferences = layout.match(new RegExp(`settings\\.${setting.id}\\b`, "g"))?.length || 0;
  const status = !emitted
    ? rawConsumers.length ? "Liquid/JS behavior; no CSS emission" : "No root emission or source consumer"
    : consumers.length
      ? "Direct component reference; behavior unverified"
      : aliasConsumers.length
        ? "Shared alias reference; behavior unverified"
      : layoutReferences > 1
        ? "Layout behavior mapping; browser unverified"
      : rawConsumers.length
        ? "Source reference; behavior unverified"
        : "Root emission only; trace aliases or implement";
  const unit = setting.unit || (setting.type === "checkbox" ? "boolean" : setting.type);
  const references = [...consumers, ...aliasConsumers, ...rawConsumers, ...(layoutReferences > 1 ? ["layout/theme.liquid"] : [])]
    .slice(0, 3)
    .join(", ") || "—";
  return `| \`${setting.id}\` | ${String(setting.default ?? "—").replaceAll("|", "\\|")} ${unit} | \`${property}\` | ${status} | ${references} |`;
});

const direct = rows.filter((row) => row.includes("Direct component reference")).length;
const aliased = rows.filter((row) => row.includes("Shared alias reference")).length;
const rootOnly = rows.filter((row) => row.includes("Root emission only")).length;
const layoutMapped = rows.filter((row) => row.includes("Layout behavior mapping")).length;
const liquidMapped = rows.filter((row) => row.includes("Liquid/JS behavior")).length;
const unconsumed = rows.filter((row) => row.includes("Root emission only") || row.includes("No root emission or source consumer"));

if (process.argv.includes("--check")) {
  if (unconsumed.length) {
    process.stderr.write(`Foundation settings without a source consumer:\n${unconsumed.join("\n")}\n`);
    process.exit(1);
  }
  process.stdout.write(`Validated ${rows.length} foundation settings with source consumers.\n`);
  process.exit(0);
}

process.stdout.write(`# Foundation token inventory\n\n`);
process.stdout.write(`Generated from the current schema and source by \`node scripts/report-foundation-tokens.mjs\`. This is a static reference map, not a browser behavior claim. Regenerate after foundation setting changes.\n\n`);
process.stdout.write(`The inventory contains ${rows.length} foundation settings: ${direct} have a direct component \`var()\` reference, ${aliased} reach a component through one shared alias, ${layoutMapped} have a layout behavior mapping, ${liquidMapped} are consumed by Liquid/JS without a CSS emission, and ${rootOnly} have root emission only. The design-preview controls are excluded from consumer counts. Longer alias chains and JS behavior still require inspection.\n\n`);
process.stdout.write(`| Setting | Default / schema unit | CSS property name | Static status | Example source files |\n| --- | --- | --- | --- | --- |\n`);
process.stdout.write(`${rows.join("\n")}\n\n`);
process.stdout.write(`## Precedence and migration decisions\n\n`);
process.stdout.write(`- Palette settings emit semantic \`--color-*\` roles. Components inherit those roles; an explicit section scheme takes precedence.\n`);
process.stdout.write(`- Existing heading/body font pickers are the only font identities. The removed \`font_accent\` setting is no longer loaded; old \`--font-accent-*\` references alias the heading role. Before deploying to an installed fork, record any customized accent font and choose a heading/body mapping deliberately.\n`);
process.stdout.write(`- The \`foundation_type_scale\` select now maps to numeric ratios in \`layout/theme.liquid\`, so dependent \`calc()\` expressions receive a number.\n`);
process.stdout.write(`- Global layout defaults coexist with explicit saved section widths and padding. New presets should inherit; existing explicit values require an opt-in migration.\n`);
process.stdout.write(`- Settings labeled “root emission only” are not automatically dead. F05/F22 must trace aliases and JS consumers, wire the intended behavior, or mark the control deprecated.\n`);
process.stdout.write(`- Layout behavior mappings include Liquid-derived properties and root data attributes. These are static source findings, not proof of browser behavior or accessible contrast.\n`);
