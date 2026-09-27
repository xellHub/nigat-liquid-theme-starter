#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

export function unsafeImageTagOutputs(source) {
  const findings = [];
  for (const match of source.matchAll(/\{\{([\s\S]*?)\}\}/g)) {
    const imageTag = match[1].search(/\|\s*image_tag\b/);
    if (imageTag < 0) continue;
    if (/\|\s*(?:escape|escape_once|strip_html)\b/.test(match[1].slice(imageTag))) {
      findings.push({ offset: match.index, message: "image_tag HTML is escaped after rendering; escape the alt value before calling image_tag" });
    }
  }
  return findings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const findings = [];
  let files = 0;
  const visit = (directory) => {
    for (const item of readdirSync(directory, { withFileTypes: true })) {
      const file = join(directory, item.name);
      if (item.isDirectory()) visit(file);
      else if (file.endsWith(".liquid")) {
        files += 1;
        const source = readFileSync(file, "utf8");
        for (const result of unsafeImageTagOutputs(source)) findings.push(`${relative(root, file)}:${source.slice(0, result.offset).split("\n").length}: ${result.message}`);
      }
    }
  };
  for (const folder of ["blocks", "snippets", "section-library", "layout"]) visit(join(root, folder));
  if (findings.length) {
    console.error(findings.join("\n"));
    process.exitCode = 1;
  } else console.log(`Validated image_tag output chains across ${files} canonical Liquid files.`);
}
