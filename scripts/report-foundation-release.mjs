#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const run = (command, args) => spawnSync(command, args, { cwd: root, encoding: "utf8" });
const args = process.argv.slice(2);
const logIndex = args.indexOf("--check-log");
const evidenceIndex = args.indexOf("--evidence-dir");
const logPath = logIndex >= 0 ? args[logIndex + 1] : null;
const output = logPath && existsSync(logPath) ? readFileSync(logPath, "utf8") : "";
const revision = run("git", ["rev-parse", "--short", "HEAD"]).stdout.trim() || "unknown";
const dirty = Boolean(run("git", ["status", "--porcelain"]).stdout.trim());
const files = ["assets/base.css", "assets/theme.js", "assets/embla-carousel.umd.js"];
const assets = files.map((file) => {
  const content = readFileSync(join(root, file));
  return { file, raw: content.length, gzip: gzipSync(content).length };
});
const evidencePath = evidenceIndex >= 0 && args[evidenceIndex + 1] ? resolve(args[evidenceIndex + 1]) : null;
const evidenceFiles = evidencePath && existsSync(evidencePath) ? readdirSync(evidencePath).filter((name) => statSync(join(evidencePath, name)).isFile()) : [];
const mirrorCount = output.match(/Verified (\d+) section-library mirror/)?.[1] || "unknown";
const themeCheck = output.match(/(\d+) files inspected with no offenses found/)?.[1] || "unconfirmed";
const localeCounts = output.match(/Validated (\d+) literal Liquid and (\d+) schema translation references/) || [];
const checkPassed = Boolean(output.includes("Verified") && output.includes("Theme Check Summary.") && output.includes("no offenses found") && output.includes("Found 0 composition violation(s)") && !output.includes('error: script "check:foundation"'));

console.log(`# Foundation release report — ${new Date().toISOString()}`);
console.log(`\nRevision: \`${revision}\`${dirty ? " (working tree has changes)" : ""}`);
console.log(`\nLocal gate: **${checkPassed ? "passing check log supplied" : "unverified; run bun run check:foundation and supply its output with --check-log"}**; ${mirrorCount} mirrors; Theme Check ${themeCheck === "unconfirmed" ? "not confirmed" : `${themeCheck} files, zero offenses`}; ${localeCounts[1] || "unknown"} Liquid and ${localeCounts[2] || "unknown"} schema locale references.`);
console.log("\n| Asset | Raw bytes | Gzip bytes |\n| --- | ---: | ---: |");
for (const asset of assets) console.log(`| ${asset.file} | ${asset.raw} | ${asset.gzip} |`);
console.log(`\nLive evidence: ${evidencePath ? `${evidenceFiles.length} file(s) supplied in ${evidencePath}; manual review required` : "none supplied"}.`);
console.log("\nRelease decision: **pending** until storefront, Theme Editor, accessibility/device, provider, market and installed merchant-data checks are recorded and reviewed.");
