#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [profileName, outputPath] = process.argv.slice(2);
if (!["sharp-compact", "soft-spacious"].includes(profileName) || !outputPath) {
  console.error("Usage: node scripts/preview-foundation-profile.mjs <sharp-compact|soft-spacious> <output-settings-data.json>");
  process.exit(1);
}

const root = resolve(import.meta.dirname, "..");
const source = JSON.parse(readFileSync(resolve(root, "config/settings_data.json"), "utf8"));
const settingsSchema = JSON.parse(readFileSync(resolve(root, "config/settings_schema.json"), "utf8"));
const settingDefinitions = new Map(settingsSchema.flatMap((group) => group.settings || []).filter((setting) => setting.id).map((setting) => [setting.id, setting]));
const profile = JSON.parse(readFileSync(resolve(root, `docs/foundation-theme/profiles/${profileName}.json`), "utf8"));
const current = source.current;
for (const [key, value] of Object.entries(profile.settings)) {
  if (!(key in current)) throw new Error(`Unknown foundation setting: ${key}`);
  if (typeof current[key] !== typeof value) throw new Error(`Wrong value type for ${key}`);
  const definition = settingDefinitions.get(key);
  if (!definition) throw new Error(`Setting is absent from the Theme Editor schema: ${key}`);
  if (definition.type === "range" && (value < definition.min || value > definition.max || (value - definition.min) % definition.step !== 0)) throw new Error(`Out-of-range or off-step value for ${key}`);
  if (definition.type === "select" && !definition.options.some((option) => option.value === value)) throw new Error(`Invalid option for ${key}`);
  current[key] = value;
}
for (const [scheme, values] of Object.entries(profile.color_schemes)) {
  const target = current.color_schemes[scheme]?.settings;
  if (!target) throw new Error(`Unknown color scheme: ${scheme}`);
  for (const [key, value] of Object.entries(values)) {
    if (!(key in target)) throw new Error(`Unknown ${scheme} color role: ${key}`);
    if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`Invalid ${scheme} color: ${key}`);
    target[key] = value;
  }
}
writeFileSync(resolve(outputPath), `${JSON.stringify(source, null, 2)}\n`);
console.log(`Wrote ${profileName} preview settings to ${outputPath}`);
