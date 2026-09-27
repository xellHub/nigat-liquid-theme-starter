#!/usr/bin/env node
/**
 * check-sections.mjs
 *
 * Scans the theme's `sections/` directory and verifies that sections
 * are composed from Theme Blocks and Snippets (Atomic Design hierarchy)
 * rather than hard-built or monolithic.
 *
 * A section triggers a warning if it:
 *  - has no {% schema %} tag at all (not merchant-customizable)
 *  - has a schema with invalid JSON
 *  - has a schema with no "blocks" array (merchants cannot add/remove/reorder components)
 *  - neither uses Theme Blocks ({% content_for 'blocks' %} or section.blocks)
 *    nor Snippets ({% render 'snippet' %}) (all markup inlined and uncomposed)
 *  - markup body exceeds the line-count threshold (doing too much in one file)
 *
 * Usage:
 *   node scripts/check-sections.mjs [path-to-theme] [--threshold <n>] [--verbose]
 *
 * Exit code is 1 if any warnings were raised, 0 otherwise (handy for CI).
 */

import { readdir, readFile } from "node:fs/promises";
import { join, basename } from "node:path";

const args = process.argv.slice(2);
let themeRoot = ".";
let lineThreshold = 250; // Maximum allowed lines of template markup before schema/stylesheet
let verbose = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--threshold" && args[i + 1]) {
    lineThreshold = Number.parseInt(args[++i], 10);
  } else if (arg === "--verbose" || arg === "-v") {
    verbose = true;
  } else if (!arg.startsWith("-")) {
    themeRoot = arg;
  }
}

const SECTIONS_DIR = join(themeRoot, "sections");

async function getLiquidSectionFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".liquid"))
    .map((e) => join(dir, e.name));
}

function extractSchema(content) {
  const match = content.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return "invalid-json";
  }
}

function extractMarkupBody(content) {
  return content
    .replace(/{%-?\s*schema[\s\S]*?endschema\s*-?%}/g, "")
    .replace(/{%-?\s*stylesheet[\s\S]*?endstylesheet\s*-?%}/g, "")
    .trim();
}

function checkSection(filePath, content) {
  const warnings = [];
  const name = basename(filePath);

  // 1. Schema existence & validity
  const schema = extractSchema(content);
  if (schema === null) {
    warnings.push("no {% schema %} tag — section isn't customizable in the theme editor");
  } else if (schema === "invalid-json") {
    warnings.push("{% schema %} block has invalid JSON");
  } else if (!Array.isArray(schema.blocks) || schema.blocks.length === 0) {
    warnings.push('schema has no "blocks" — merchants can\'t add/remove/reorder content');
  }

  // 2. Composition check: Theme Blocks (Atoms/Molecules) or Snippets
  const usesBlocksSlot = /{%-?\s*content_for\s+['"]blocks?['"]/.test(content);
  const usesBlocksLoop = /section\.blocks/.test(content);
  const usesSnippets = /{%-?\s*render\s+['"][\w-]+['"]/.test(content);

  const isComposed = usesBlocksSlot || usesBlocksLoop || usesSnippets;
  if (!isComposed) {
    warnings.push(
      "neither {% content_for 'blocks' %} nor {% render 'snippet' %} used — markup is fully inlined, not composed"
    );
  }

  // 3. Markup complexity / line count
  // We evaluate the actual template markup body (excluding schema & stylesheet blocks)
  const markupBody = extractMarkupBody(content);
  // Exclude embedded <script> tags when assessing markup complexity (e.g. interactive controllers)
  const markupWithoutScripts = markupBody.replace(/<script[\s\S]*?<\/script>/gi, "").trim();
  const markupLines = markupWithoutScripts ? markupWithoutScripts.split("\n").length : 0;

  if (markupLines > lineThreshold) {
    warnings.push(
      `markup body is ${markupLines} lines (threshold: ${lineThreshold}) — consider splitting into blocks/snippets`
    );
  }

  // 4. Fine-grained theme block decomposition (no single-monolithic-block preset anti-pattern)
  if (schema && typeof schema === "object" && Array.isArray(schema.presets)) {
    for (const preset of schema.presets) {
      if (Array.isArray(preset.blocks) && preset.blocks.length === 1) {
        const singleBlock = preset.blocks[0];
        if (
          !singleBlock.blocks &&
          singleBlock.type &&
          singleBlock.type.endsWith("-content") &&
          !singleBlock.type.includes("page") &&
          !singleBlock.type.includes("cart") &&
          !singleBlock.type.includes("404") &&
          !singleBlock.type.includes("menu")
        ) {
          warnings.push(
            `preset '${preset.name || "default"}' delegates to single uncomposed block '${singleBlock.type}' — decompose into fine-grained atomic blocks`
          );
        }
      }
    }
  }

  return { name, warnings, isComposed, markupLines };
}

async function main() {
  let files;
  try {
    files = await getLiquidSectionFiles(SECTIONS_DIR);
  } catch (err) {
    console.error(`Could not read sections directory at "${SECTIONS_DIR}": ${err.message}`);
    process.exit(2);
  }

  if (files.length === 0) {
    console.log(`No .liquid files found in ${SECTIONS_DIR}`);
    process.exit(0);
  }

  let hadWarnings = false;
  let passedCount = 0;

  console.log("----------------------------------------------------");
  console.log("ATOMIC DESIGN & SECTION COMPOSITION LINTER");
  console.log(`Checking ${files.length} sections in ${SECTIONS_DIR}`);
  console.log("----------------------------------------------------");

  for (const filePath of files) {
    const content = await readFile(filePath, "utf8");
    const { name, warnings, markupLines } = checkSection(filePath, content);

    if (warnings.length > 0) {
      hadWarnings = true;
      console.warn(`\n⚠️  ${name} (${markupLines} markup lines)`);
      for (const w of warnings) console.warn(`   - ${w}`);
    } else {
      passedCount++;
      if (verbose) {
        console.log(`✓ ${name} (${markupLines} markup lines)`);
      }
    }
  }

  console.log("\n----------------------------------------------------");
  if (!hadWarnings) {
    console.log(
      `✅ All ${passedCount}/${files.length} sections look composed (Theme Blocks + Snippets).`
    );
    console.log("Zero monolithic section violations found!");
  } else {
    console.log(`Summary: ${passedCount} passed, ${files.length - passedCount} had warnings.`);
  }
  console.log("----------------------------------------------------");

  process.exit(hadWarnings ? 1 : 0);
}

main();
