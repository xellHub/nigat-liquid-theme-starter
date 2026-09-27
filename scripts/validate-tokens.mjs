import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const sourceRoots = ["assets", "blocks", "layout", "sections", "snippets", "section-library"];
const files = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(css|js|liquid)$/.test(entry.name)) files.push(file);
  }
}

sourceRoots.forEach((directory) => walk(join(root, directory)));

const definitions = new Set();
const uses = new Map();
for (const file of files) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/(--[a-z0-9_-]+)\s*:/gi)) definitions.add(match[1]);
  for (const match of source.matchAll(/var\(\s*(--[a-z0-9_-]+)/gi)) {
    const token = match[1];
    const use = uses.get(token) || new Set();
    use.add(relative(root, file));
    uses.set(token, use);
  }
}

// These are intentionally supplied by a component's runtime interaction state.
const localRuntimeTokens = new Set(["--bar-h", "--arrow-left"]);
const errors = [];
for (const [token, tokenFiles] of uses) {
  if (!definitions.has(token) && !localRuntimeTokens.has(token)) {
    errors.push(`${token} is used but never defined (${[...tokenFiles].join(", ")})`);
  }
}

// UI state colors must come from semantic tokens. Brand artwork and product
// swatches are deliberately excluded by limiting this check to theme assets.
const forbiddenStateColors = /#(?:e53e3e|e11d48|dc2626|16a34a|38a169|f59e0b)\b/gi;
for (const file of files.filter((file) => /assets\/(base\.css|theme\.js)$/.test(file))) {
  const source = readFileSync(file, "utf8");
  const matches = source.match(forbiddenStateColors);
  if (matches?.length)
    errors.push(
      `${relative(root, file)} contains hard-coded UI state color(s): ${matches.join(", ")}`
    );
}

// Component-specific styles for section-library components must remain encapsulated
// in their respective Liquid {% stylesheet %} blocks and never leak into assets/base.css.
const baseCssPath = join(root, "assets/base.css");
if (existsSync(baseCssPath)) {
  const baseCssContent = readFileSync(baseCssPath, "utf8");
  if (/\.image-compare\b/.test(baseCssContent)) {
    errors.push(
      "assets/base.css contains component-specific .image-compare styles; image-compare CSS must be encapsulated within its Liquid stylesheet only."
    );
  }
}

// Universal Theme Token & Configuration Standard (AGENTS.md §4C):
// Sections and theme blocks in section-library, sections, and blocks must never define
// hardcoded hex values in schema settings defaults or presets.
for (const file of files.filter((f) => /\.(liquid)$/.test(f))) {
  const rel = relative(root, file);
  if (!rel.startsWith("section-library/") && !rel.startsWith("sections/") && !rel.startsWith("blocks/")) continue;
  const source = readFileSync(file, "utf8");
  const schemaMatch = source.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  if (!schemaMatch) continue;
  try {
    const schema = JSON.parse(schemaMatch[1]);
    for (const s of schema.settings || []) {
      if (typeof s.default === "string" && /#([0-9a-fA-F]{3,8})\b/.test(s.default)) {
        errors.push(`${rel}: schema setting '${s.id}' has hardcoded hex default '${s.default}'`);
      }
    }
    const scanSettings = (settings, ctx) => {
      if (!settings || typeof settings !== "object") return;
      for (const [k, v] of Object.entries(settings)) {
        if (typeof v === "string" && /#([0-9a-fA-F]{3,8})\b/.test(v)) {
          errors.push(`${rel}: preset ${ctx} setting '${k}' has hardcoded hex '${v}'`);
        }
      }
    };
    const scanBlocks = (blocks, ctx) => {
      for (const b of blocks || []) {
        scanSettings(b.settings, `block '${b.type}' in ${ctx}`);
        if (b.blocks) scanBlocks(b.blocks, `${ctx} > block '${b.type}'`);
      }
    };
    for (const preset of schema.presets || []) {
      scanSettings(preset.settings, `preset '${preset.name || "default"}'`);
      scanBlocks(preset.blocks, `preset '${preset.name || "default"}'`);
    }
  } catch {}
}

if (errors.length) {
  console.error(`Token validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Token validation passed across ${files.length} source files.`);
