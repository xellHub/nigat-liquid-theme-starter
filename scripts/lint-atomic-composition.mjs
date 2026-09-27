#!/usr/bin/env node
/**
 * Read-only Atomic Design audit. --audit reports without failing; --strict
 * (the default) fails on findings. Audits canonical and runtime sections.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Only single-purpose endpoints: resource-backed layouts and forms are not
// exemptions. Snippets may supply plumbing but cannot replace editable children.
const terminalBlocks = new Set([
  "heading",
  "text",
  "eyebrow",
  "quote",
  "button",
  "link",
  "icon-button",
  "image",
  "video",
  "icon",
  "spacer",
  "divider",
  "price",
  "badge",
  "rating",
  "countdown",
  "input",
  "select",
  "textarea",
  "checkbox",
  "tab-trigger",
  "accordion-trigger",
  "stat",
  "logo-item",
  "product-swatches",
  "cart-note",
  "cart-shipping-progress",
  "bundle-item-controls",
  "_product-title",
  "_product-price",
  "_product-vendor",
  "_product-quantity",
  "_product-share",
  "_page-content",
  "_faq-media",
]);
const contentTypes = new Set(["text", "textarea", "richtext", "inline_richtext", "url"]);
const structuralTextIds = new Set([
  "foundation_custom_class",
  "foundation_anchor_id",
  "accessibility_label",
  "alt",
  "alt_text",
  "anchor_id",
  "custom_class",
  "identifier",
  "year",
  "date",
  "day",
  "time",
]);
const sectionMediaTypes = new Set(["image_picker", "video", "video_url", "font_picker"]);
const schemaPattern = /\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/;

function markupOnly(source) {
  return source
    .replace(
      /\{%-?\s*(comment|raw|stylesheet|javascript)\s*-?%\}[\s\S]*?\{%-?\s*end\1\s*-?%\}/g,
      ""
    )
    .replace(/\{%-?\s*#[\s\S]*?%\}/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
}

export function auditSource(file, source, kind = "block") {
  const findings = [];
  const add = (rule, detail) => findings.push({ file, rule, detail });
  // Extract schema before stripping markup so rich text defaults stay intact.
  const uncommented = source.replace(
    /\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g,
    ""
  );
  const match = uncommented.match(schemaPattern);
  if (!match) {
    add("SCHEMA", "Missing Liquid schema.");
    return { findings };
  }
  let schema;
  try {
    schema = JSON.parse(match[1]);
    if (!schema || typeof schema !== "object" || Array.isArray(schema))
      throw new Error("expected an object");
    for (const key of ["settings", "blocks", "presets"]) {
      if (schema[key] !== undefined && !Array.isArray(schema[key]))
        throw new Error(key + " must be an array");
    }
    if ((schema.settings || []).some((s) => !s || typeof s !== "object"))
      throw new Error("invalid setting");
    if ((schema.blocks || []).some((b) => !b || typeof b.type !== "string"))
      throw new Error("invalid child block");
  } catch (error) {
    add("SCHEMA", "Invalid schema: " + error.message);
    return { findings };
  }
  const body = markupOnly(uncommented.slice(0, match.index));
  const slots = [...body.matchAll(/\{%-?\s*content_for\s+(['"])(blocks?)\1([^%]*)%\}/g)];
  const hasSlot = slots.length > 0;
  const leaf = kind === "block" && terminalBlocks.has(basename(file, ".liquid"));
  const children = schema.blocks || [];
  const allowed = new Set(children.map((child) => child.type));

  if (leaf) {
    if (hasSlot || schema.blocks !== undefined)
      add("TERMINAL", "Atomic blocks must not render child slots or declare schema.blocks.");
  } else {
    const content = (schema.settings || []).filter(
      (s) =>
        s.id &&
        ((contentTypes.has(s.type) && !structuralTextIds.has(s.id)) ||
          (kind === "section" && sectionMediaTypes.has(s.type)))
    );
    if (content.length)
      add(
        "CONTENT",
        "Move editable content to child atoms: " + content.map((s) => s.id).join(", ") + "."
      );
    if (!hasSlot)
      add(
        "COMPOSITION",
        "Container must render child theme blocks; a snippet wrapper alone does not make its content independently selectable."
      );
    if (hasSlot && !children.length)
      add("WHITELIST", "Declare the specific child block types accepted by this container.");
    if (!hasSlot && children.length)
      add("WHITELIST", "Child types are declared but no child slot renders them.");
    if (allowed.has("@theme"))
      add("WHITELIST", "Replace unrestricted @theme with explicit child block types.");

    // Action-coupled buttons and hidden plumbing inputs are explicitly allowed.
    const controls = [...body.matchAll(/<(input|select|textarea)\b[^>]*>/gi)].filter(
      ([tag, type]) =>
        type.toLowerCase() !== "input" ||
        !/\btype\s*=\s*(?:"hidden"|'hidden'|hidden(?=\s|>))/i.test(tag)
    );
    if (controls.length)
      add(
        "FORM_CONTROLS",
        "Compose " +
          controls.length +
          " visible form control(s) from terminal input/select/textarea blocks."
      );
  }
  for (const slot of slots.filter((slot) => slot[2] === "block")) {
    const type = slot[3].match(/\btype:\s*['"]([^'"]+)['"]/);
    if (!type) add("STATIC_BLOCK", "Static child slots must specify a literal block type.");
    else if (!allowed.has(type[1]))
      add("WHITELIST", "Static child '" + type[1] + "' is absent from the explicit whitelist.");
  }
  return { findings, schema, hasSlot, leaf };
}

function liquidFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? liquidFiles(path) : entry.name.endsWith(".liquid") ? [path] : [];
    })
    .sort();
}

export function auditTheme(root) {
  const findings = [];
  const blocks = new Map();
  const sources = [];
  const counts = {};
  for (const [directory, kind] of [
    ["blocks", "block"],
    ["section-library", "section"],
    ["sections", "section"],
  ]) {
    const files = liquidFiles(join(root, directory));
    counts[directory] = files.length;
    if (!files.length)
      findings.push({
        file: directory,
        rule: "SOURCE",
        detail: "No Liquid sources found; cannot verify composition.",
      });
    for (const path of files) {
      const file = relative(root, path);
      const result = auditSource(file, readFileSync(path, "utf8"), kind);
      findings.push(...result.findings);
      sources.push({ file, ...result });
      if (kind === "block") blocks.set(basename(path, ".liquid"), result);
    }
  }
  for (const source of sources) {
    const report = (rule, detail) => findings.push({ file: source.file, rule, detail });
    for (const child of source.schema?.blocks || []) {
      if (!child.type.startsWith("@") && !blocks.has(child.type))
        report("REFERENCE", "Unknown child block '" + child.type + "'.");
    }
    // Inspect every explicit preset branch, not only single '*-content' blocks.
    function inspect(instances, parent, path) {
      if (!instances) return;
      if (typeof instances !== "object") {
        report("PRESET", path + ": blocks must be an array or object.");
        return;
      }
      for (const [id, instance] of Object.entries(instances)) {
        if (!instance || typeof instance.type !== "string") {
          report("PRESET", path + "/" + id + ": invalid block instance.");
          continue;
        }
        if (instance.type === "@app") continue;
        const target = blocks.get(instance.type);
        const node = path + "/" + id + " (" + instance.type + ")";
        if (!target?.schema) {
          report("PRESET", node + ": missing or invalid block definition.");
          continue;
        }
        const permitted = (parent.blocks || []).some(
          (child) =>
            child.type === instance.type ||
            (child.type === "@theme" && !instance.type.startsWith("_"))
        );
        if (!permitted) report("PRESET", node + ": child is not whitelisted by its parent.");
        if (!target.leaf && !target.hasSlot)
          report("PRESET", node + ": preset uses an uncomposed container.");
        if (target.leaf && Object.keys(instance.blocks || {}).length)
          report("PRESET", node + ": atomic block cannot have children.");
        inspect(instance.blocks, target.schema, node);
      }
    }
    for (const preset of source.schema?.presets || []) {
      if (!preset || typeof preset !== "object") report("PRESET", "Invalid preset.");
      else inspect(preset.blocks, source.schema, preset.name || "default");
    }
  }
  return { findings, counts };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const result = auditTheme(fileURLToPath(new URL("..", import.meta.url)));
  console.log("ATOMIC COMPOSITION AUDIT");
  for (const [directory, count] of Object.entries(result.counts))
    console.log("Audited " + count + " Liquid files in " + directory + "/");
  for (const f of result.findings) console.log("[" + f.rule + "] " + f.file + ": " + f.detail);
  console.log("Found " + result.findings.length + " composition violation(s). No files changed.");
  if (args.includes("--verbose") || args.includes("-v"))
    console.log(
      "Atoms terminate; containers whitelist children; canonical and runtime sections are checked. Action-coupled buttons and hidden inputs are allowed."
    );
  process.exitCode =
    result.findings.length && (!args.includes("--audit") || args.includes("--strict")) ? 1 : 0;
}
