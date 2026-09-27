#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url);
const locale = JSON.parse(readFileSync(new URL("locales/en.default.json", root), "utf8"));
const schemaLocale = JSON.parse(readFileSync(new URL("locales/en.default.schema.json", root), "utf8"));
const missing = [];
for (const [key, marker] of Object.entries({
  remove_recent: "[term]",
  view_all_for: "[term]",
  search_for: "[term]",
  sale_percentage: "[percent]",
  count_one: "[count]",
  count_other: "[count]",
  view_all_count: "[count]",
  keep_shopping_for_js: "[term]",
  results_for_js: "[term]",
  no_results_for_js: "[term]",
})) {
  if (!locale.general?.search?.[key]?.includes(marker)) {
    missing.push(`general.search.${key}: missing JavaScript marker ${marker}`);
  }
}
let checked = 0;
let schemaChecked = 0;
for (const directory of ["blocks", "snippets", "section-library", "layout"]) {
  const visit = (path) => {
    for (const entry of readdirSync(new URL(path, root), { withFileTypes: true })) {
      const file = `${path}/${entry.name}`;
      if (entry.isDirectory()) visit(file);
      else if (file.endsWith(".liquid")) {
        const source = readFileSync(new URL(file, root), "utf8");
        for (const match of source.matchAll(/['"]([\w.-]+)['"]\s*\|\s*t\b/g)) {
          checked += 1;
          const value = match[1].split(".").reduce((object, key) => object?.[key], locale);
          if (typeof value !== "string") missing.push(`${file}: ${match[1]}`);
        }
        const schema = source.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/)?.[1];
        for (const match of (schema || "").matchAll(/"t:([\w.]+)"/g)) {
          schemaChecked += 1;
          const value = match[1].split(".").reduce((object, key) => object?.[key], schemaLocale);
          if (typeof value !== "string") missing.push(`${file}: schema key ${match[1]}`);
        }
      }
    }
  };
  visit(directory);
}
if (missing.length) {
  console.error(`Missing English locale keys:\n${missing.join("\n")}`);
  process.exitCode = 1;
} else console.log(`Validated ${checked} literal Liquid and ${schemaChecked} schema translation references.`);
