#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repository = resolve(fileURLToPath(new URL("..", import.meta.url)));
const schemaPattern = /\{%\s*schema\s*%\}([\s\S]*?)\{%\s*endschema\s*%\}/;
const hints = {
  feature_name: "Move the value to the comparison row's text child.",
  text_alignment: "Map to the rich-text alignment setting.",
  placeholder_name: "Remove only after checking the selected placeholder index.",
  review_count: "Use real product rating metafields; do not migrate an invented count.",
  font_accent: "Choose the fork's heading or body font before removing this picker.",
};

function schemasIn(directory) {
  const result = new Map();
  for (const name of readdirSync(join(repository, directory)).filter((name) => name.endsWith(".liquid"))) {
    const source = readFileSync(join(repository, directory, name), "utf8");
    const match = source.match(schemaPattern);
    if (match) result.set(basename(name, ".liquid"), JSON.parse(match[1]));
  }
  return result;
}

export function auditInstalledTheme(exportRoot) {
  const root = resolve(exportRoot);
  const sections = schemasIn("sections");
  const blocks = schemasIn("blocks");
  const findings = [];
  let files = 0;
  const add = (path, message, setting) => findings.push({ path, message, ...(setting && { hint: hints[setting] || "Inspect and map this saved setting manually." }) });
  const checkSettings = (settings, schema, path) => {
    if (!settings || !schema) return;
    const allowed = new Set((schema.settings || []).map((setting) => setting.id).filter(Boolean));
    for (const key of Object.keys(settings)) if (!allowed.has(key)) add(path, `Unknown saved setting: ${key}`, key);
  };
  const checkBlocks = (saved, order, parentSchema, path) => {
    const entries = Object.entries(saved || {});
    const allowed = new Set((parentSchema?.blocks || []).map((block) => block.type));
    const ordered = new Set(order || []);
    for (const [id, block] of entries) {
      const itemPath = `${path}/blocks/${id}`;
      if (block.static && ordered.has(id)) add(itemPath, "Static block appears in block_order");
      if (!block.static && Array.isArray(order) && !ordered.has(id)) add(itemPath, "Dynamic block is missing from block_order");
      if (block.type !== "@app" && !blocks.has(block.type)) add(itemPath, `Unknown block type: ${block.type}`);
      if (allowed.size && !allowed.has(block.type) && !allowed.has("@theme") && !(block.type === "@app" && allowed.has("@app"))) add(itemPath, `Block ${block.type} is not allowed by its parent`);
      checkSettings(block.settings, blocks.get(block.type), itemPath);
      checkBlocks(block.blocks, block.block_order, blocks.get(block.type), itemPath);
    }
    if (Array.isArray(order)) for (const id of order) if (!saved?.[id]) add(path, `block_order references missing block: ${id}`);
  };
  const inspect = (file) => {
    const source = JSON.parse(readFileSync(file, "utf8"));
    files += 1;
    for (const [id, section] of Object.entries(source.sections || {})) {
      const path = `${file}/sections/${id}`;
      if (!sections.has(section.type)) add(path, `Unknown section type: ${section.type}`);
      const schema = sections.get(section.type);
      checkSettings(section.settings, schema, path);
      checkBlocks(section.blocks, section.block_order, schema, path);
    }
  };
  for (const directory of ["templates", "sections"]) {
    const folder = join(root, directory);
    if (!existsSync(folder)) continue;
    for (const name of readdirSync(folder).filter((name) => name.endsWith(".json") && (directory === "templates" || name.endsWith("-group.json")))) inspect(join(folder, name));
  }
  const settingsFile = join(root, "config/settings_data.json");
  if (existsSync(settingsFile)) {
    const data = JSON.parse(readFileSync(settingsFile, "utf8"));
    const definitions = JSON.parse(readFileSync(join(repository, "config/settings_schema.json"), "utf8"));
    const allowed = new Set(definitions.flatMap((group) => group.settings || []).map((setting) => setting.id).filter(Boolean));
    for (const key of Object.keys(data.current || {})) if (key !== "color_schemes" && !allowed.has(key)) add(settingsFile, `Unknown global setting: ${key}`, key);
    files += 1;
  }
  return { files, findings };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const target = process.argv[2];
  if (!target || !existsSync(target)) {
    console.error("Usage: node scripts/audit-installed-theme.mjs <exported-theme-directory>");
    process.exit(2);
  }
  const report = auditInstalledTheme(target);
  console.log(JSON.stringify(report, null, 2));
  if (report.findings.length) process.exitCode = 1;
}
