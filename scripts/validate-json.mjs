#!/usr/bin/env node
/**
 * Validates that:
 *   1. Every {% schema %} block in sections/*.liquid and blocks/*.liquid is valid JSON.
 *   2. Every templates/*.json (and section group JSON) parses.
 *   3. Every locale file parses.
 *
 * Run: node scripts/validate-json.mjs
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let errors = 0;
let checked = 0;

function ok(msg) {
  console.log(`  [32m✓[0m ${msg}`);
}
function fail(msg) {
  console.log(`  [31m✗[0m ${msg}`);
  errors++;
}

// 1. Schema blocks in sections and theme blocks
function validateLiquidSchemas(directory, label) {
  console.log(`\nSchema blocks in ${label}:`);
  for (const file of readdirSync(directory).filter((entry) => entry.endsWith(".liquid"))) {
    const src = readFileSync(join(directory, file), "utf8");
    const match = src.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
    if (!match) {
      console.log(`  – ${file} (no schema block)`);
      continue;
    }
    checked++;
    try {
      const parsed = JSON.parse(match[1]);
      if (!parsed.name) throw new Error('schema missing "name"');
      const validateRangeSettings = (settings = [], ctx = "") => {
        for (const s of settings) {
          if (s.type === "range") {
            const { min, max, step = 1, default: def, id } = s;
            if (min !== undefined && max !== undefined && min > max) {
              throw new Error(`range setting '${id}'${ctx} min (${min}) > max (${max})`);
            }
            if (def !== undefined && min !== undefined) {
              if (def < min || (max !== undefined && def > max)) {
                throw new Error(
                  `range setting '${id}'${ctx} default (${def}) outside [${min}, ${max}]`
                );
              }
              const rem = Math.round(((def - min) % step) * 1000) / 1000;
              if (rem !== 0 && Math.abs(rem - step) > 0.001) {
                throw new Error(
                  `range setting '${id}'${ctx} default (${def}) is not a step of ${step} from min ${min}`
                );
              }
            }
          }
        }
      };
      const validateLinkListSettings = (settings = [], ctx = "") => {
        const linkLists = settings.filter((s) => s.type === "link_list");
        if (linkLists.length > 1) {
          throw new Error(
            `setting link_list type can only be inserted once in settings${ctx}, found: ${linkLists.map((s) => s.id).join(", ")}`
          );
        }
      };
      validateLinkListSettings(parsed.settings);
      for (const b of parsed.blocks || []) {
        validateRangeSettings(b.settings, ` in block '${b.type || b.name}'`);
        validateLinkListSettings(b.settings, ` in block '${b.type || b.name}'`);
      }
      ok(`${file} → "${parsed.name}"`);
    } catch (e) {
      fail(`${file}: ${e.message}`);
    }
  }
}

validateLiquidSchemas(join(root, "sections"), "sections/*.liquid");
validateLiquidSchemas(join(root, "blocks"), "blocks/*.liquid");

// 2. JSON files in sections (section groups) + templates (recursive)
function walkJson(dir, label) {
  console.log(`\n${label}:`);
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkJson(full, `${label}/${entry.name}`);
      continue;
    }
    if (!entry.name.endsWith(".json")) continue;
    checked++;
    try {
      const parsed = JSON.parse(readFileSync(full, "utf8"));
      if (Array.isArray(parsed.order) && parsed.order.length > 25) {
        fail(
          `${entry.name}: exceeds Shopify platform limit of 25 sections (currently ${parsed.order.length})`
        );
      } else {
        ok(`${entry.name}`);
      }
    } catch (e) {
      fail(`${entry.name}: ${e.message}`);
    }
  }
}

walkJson(join(root, "templates"), "templates/*.json");
walkJson(join(root, "sections"), "sections/*.json (section groups)");
// only .json files in sections are section groups; liquid handled above

// 2b. Template and section-group references must resolve to installed section
// and theme-block files (or blocks declared inline in the section schema),
// with complete block_order arrays at every level.
const sectionBlockCache = new Map();

function getSectionDeclaredBlocks(sectionType) {
  if (!sectionType) return new Set();
  if (sectionBlockCache.has(sectionType)) return sectionBlockCache.get(sectionType);
  const declared = new Set();
  const filePath = join(root, "sections", `${sectionType}.liquid`);
  if (existsSync(filePath)) {
    const src = readFileSync(filePath, "utf8");
    const match = src.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed.blocks)) {
          for (const b of parsed.blocks) {
            if (b.type && !b.type.startsWith("@")) {
              declared.add(b.type);
            }
          }
        }
      } catch {}
    }
  }
  sectionBlockCache.set(sectionType, declared);
  return declared;
}

function validateBlockTree(blocks, order, location, sectionType = null) {
  if (!blocks) return;
  const ids = Object.keys(blocks);
  const ordered = order || [];
  for (const id of ids) {
    if (blocks[id]?.static) {
      if (ordered.includes(id)) fail(`${location}: static block ${id} must not be in block_order`);
    } else if (!ordered.includes(id)) {
      fail(`${location}: block ${id} is missing from block_order`);
    }
  }
  for (const id of ordered) {
    if (!blocks[id]) fail(`${location}: block_order references missing block ${id}`);
  }
  const declaredBlocks = getSectionDeclaredBlocks(sectionType);
  for (const [id, block] of Object.entries(blocks)) {
    if (!block.type) {
      fail(`${location}/${id}: missing block type`);
    } else if (
      !block.type.startsWith("shopify://") &&
      !declaredBlocks.has(block.type) &&
      !existsSync(join(root, "blocks", `${block.type}.liquid`))
    ) {
      fail(`${location}/${id}: unresolved block type ${block.type}`);
    }
    validateBlockTree(block.blocks, block.block_order, `${location}/${id}`, sectionType);
  }
}

for (const directory of ["templates", "sections"]) {
  for (const file of readdirSync(join(root, directory)).filter((entry) =>
    entry.endsWith(".json")
  )) {
    const document = JSON.parse(readFileSync(join(root, directory, file), "utf8"));
    if (document.sections && Array.isArray(document.order)) {
      const secKeys = Object.keys(document.sections);
      for (const id of secKeys) {
        if (!document.order.includes(id))
          fail(`${directory}/${file}: Section id '${id}' must exist in order`);
      }
      for (const id of document.order) {
        if (!document.sections[id])
          fail(`${directory}/${file}: order contains missing section '${id}'`);
      }
    }
    for (const [id, section] of Object.entries(document.sections || {})) {
      if (!existsSync(join(root, "sections", `${section.type}.liquid`)))
        fail(`${directory}/${file}/${id}: unresolved section type ${section.type}`);
      validateBlockTree(
        section.blocks,
        section.block_order,
        `${directory}/${file}/${id}`,
        section.type
      );
    }
  }
}

// 3. Config + locales
walkJson(join(root, "config"), "config/*.json");
walkJson(join(root, "locales"), "locales/*.json");

console.log(`\n—— ${checked} JSON blocks checked, ${errors} error(s) ——`);
process.exit(errors > 0 ? 1 : 0);
