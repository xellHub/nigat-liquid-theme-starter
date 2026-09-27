/**
 * scripts/check-composition.mjs
 *
 * Automated Theme Composition & 5-Layer Block Governance Validator
 *
 * Mandates:
 * 1. ZERO INLINE ATOMICS IN SECTIONS: No section shall define inline atomic settings
 *    (text, richtext, inline_richtext, image_picker, video, video_url, etc.).
 *    All content must be decomposed into theme blocks rendered via {% content_for 'blocks' %}.
 * 2. THEME-BLOCK SLOT REQUIREMENT: Sections are layout shells only and must contain
 *    {% content_for 'blocks' %}.
 * 3. COMPOSITE CONTAINER GOVERNANCE: Container blocks with {% content_for 'blocks' %}
 *    must explicitly whitelist allowed children in schema.blocks and must not define
 *    monolithic content settings (title, subheading, heading, text, description, body).
 * 4. TERMINAL LEAF BOUNDARIES: Terminal leaf blocks (heading, text, button, badge, icon, etc.)
 *    must terminate cleanly and never declare schema.blocks or render {% content_for 'blocks' %}.
 * 5. HTML5 SEMANTIC TREE & ACCESSIBLE CANVAS DELEGATION: {% content_for 'blocks' %} must
 *    NEVER be wrapped inside an interactive HTML <button> or <a> tag.
 * 6. SINGLE TYPOGRAPHY IDENTITY: No font_picker settings in schemas; all CSS font-family
 *    declarations must use theme tokens (var(--font-heading-family), var(--font-body-family)).
 * 7. SECTION GROUPING TAXONOMY: header/footer sections must declare enabled_on, and template
 *    sections must declare disabled_on for header/footer groups. Section groups (header-group.json,
 *    footer-group.json) must only contain valid group sections.
 * 8. STRICT TEMPLATE COMPOSITION & WHITELISTING: Every block instance in templates/*.json
 *    must strictly be permitted by its parent container's schema.blocks whitelist.
 *    Block order consistency is validated, and nesting depth must not exceed Shopify's limit of 8.
 * 9. PRESET INTEGRITY: Presets in sections and blocks must reference valid existing blocks
 *    and strictly conform to parent whitelist hierarchies.
 * 10. SAVED SETTING IDS: Template, section-group and preset settings must exist in
 *     the owning section or block schema; app-block settings are externally owned.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const errors = [];
const warnings = [];

// ============================================================================
// 1. DATA SOURCES & PREPARATION
// ============================================================================
const sectionsDir = join(root, "sections");
const sectionFiles = readdirSync(sectionsDir).filter((file) => file.endsWith(".liquid"));

const blocksDir = join(root, "blocks");
const blockFiles = readdirSync(blocksDir).filter((file) => file.endsWith(".liquid"));
const blockTypeSet = new Set(blockFiles.map((f) => f.replace(/\.liquid$/, "")));

function walkDirectory(dir, ext = ".liquid") {
  let results = [];
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(walkDirectory(fullPath, ext));
    } else if (item.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

const libraryFiles = walkDirectory(join(root, "section-library"));

// Terminal Leaf Blocks (strictly terminate the branch)
const terminalLeafBlocks = new Set([
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
]);

// Prohibited monolithic content IDs inside composite container blocks and cards
const prohibitedCompositeContentSettings = new Set([
  "title",
  "subheading",
  "heading",
  "subtitle",
  "eyebrow",
  "text",
  "description",
  "body",
  "caption",
  "quote",
  "button_label",
  "button_text",
  "button_link",
  "button_1_label",
  "button_2_label",
  "secondary_button_label",
  "count_override",
  "count",
  "title_override",
  "link_override",
  "note_heading",
  "note_1_text",
  "note_2_text",
]);

// Disallowed atomic setting types in sections
const disallowedSectionSettingTypes = new Set([
  "richtext",
  "inline_richtext",
  "image_picker",
  "video",
  "video_url",
  "font_picker",
]);

// Disallowed content IDs in section schemas
const disallowedSectionSettingIds = new Set([
  "heading",
  "subheading",
  "title",
  "subtitle",
  "eyebrow",
  "text",
  "body",
  "description",
  "content",
  "caption",
  "quote",
  "author",
  "badge",
  "badge_text",
  "image",
  "mobile_image",
  "desktop_image",
  "background_image",
  "video",
]);

// Cache parsed schemas
const parsedBlockSchemas = new Map();
const parsedSectionSchemas = new Map();

for (const file of blockFiles) {
  const blockName = file.replace(/\.liquid$/, "");
  const source = readFileSync(join(blocksDir, file), "utf8");
  const schemaMatch = source.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  if (schemaMatch) {
    try {
      parsedBlockSchemas.set(blockName, JSON.parse(schemaMatch[1]));
    } catch {}
  }
}

for (const file of sectionFiles) {
  const sectionName = file.replace(/\.liquid$/, "");
  const source = readFileSync(join(sectionsDir, file), "utf8");
  const schemaMatch = source.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  if (schemaMatch) {
    try {
      parsedSectionSchemas.set(sectionName, JSON.parse(schemaMatch[1]));
    } catch {}
  }
}

// ============================================================================
// 2. RULE: HTML5 SEMANTIC TREE & ACCESSIBLE CANVAS DELEGATION
// ============================================================================
// Accurately tracks HTML tag stack in Liquid markup to detect illegal interactive nesting
function checkInteractiveTagNesting(filePath, source) {
  const relPath = relative(root, filePath);
  const schemaIdx = source.search(/\{%-?\s*schema/);
  const body = schemaIdx !== -1 ? source.slice(0, schemaIdx) : source;

  // Split by HTML tags and content_for blocks tag
  const tokens = body
    .split(/(<[^>]+>|\{%-?\s*content_for\s+['"]blocks?['"][^%]*%\})/g)
    .filter(Boolean);
  const stack = [];

  for (const token of tokens) {
    if (/^\{%-?\s*content_for\s+['"]blocks?['"]/.test(token)) {
      if (stack.includes("button")) {
        errors.push(
          `[HTML5 INTERACTIVE NESTING VIOLATION] ${relPath}: {% content_for 'blocks' %} is nested inside an HTML <button>. ` +
            `Child blocks frequently render buttons or links; HTML5 strictly prohibits interactive elements inside <button>. ` +
            `Use accessible semantic delegation (e.g. <div> with ARIA attributes).`
        );
      }
      if (stack.includes("a")) {
        errors.push(
          `[HTML5 INTERACTIVE NESTING VIOLATION] ${relPath}: {% content_for 'blocks' %} is nested inside an HTML <a> link. ` +
            `Child blocks frequently render buttons or links; HTML5 prohibits interactive nesting inside links.`
        );
      }
    } else if (token.startsWith("</")) {
      const tagMatch = token.match(/^<\/([a-zA-Z0-9_-]+)/);
      if (tagMatch) {
        const tag = tagMatch[1].toLowerCase();
        const idx = stack.lastIndexOf(tag);
        if (idx !== -1) stack.splice(idx, 1);
      }
    } else if (token.startsWith("<") && !token.startsWith("<!") && !token.endsWith("/>")) {
      const tagMatch = token.match(/^<([a-zA-Z0-9_-]+)/);
      if (tagMatch) {
        const tag = tagMatch[1].toLowerCase();
        // Void elements that do not require closing tags
        if (["img", "br", "hr", "input", "meta", "link", "source", "col"].includes(tag)) continue;
        stack.push(tag);
      }
    }
  }
}

// ============================================================================
// 3. RULE: SINGLE TYPOGRAPHY IDENTITY & CSS TOKEN ENFORCEMENT
// ============================================================================
function checkTypographyIdentity(filePath, source, schema) {
  const relPath = relative(root, filePath);

  // No font_picker settings anywhere
  const inspectSettingsForFontPicker = (settings = [], context = "") => {
    for (const s of settings) {
      if (s.type === "font_picker") {
        errors.push(
          `[TYPOGRAPHY VIOLATION] ${relPath} ${context}: defines setting '${s.id}' with type 'font_picker'. ` +
            `Storefront must maintain a unified typography identity. Fonts belong strictly in global settings_schema.json.`
        );
      }
    }
  };

  inspectSettingsForFontPicker(schema.settings, "section settings");
  for (const b of schema.blocks || []) {
    inspectSettingsForFontPicker(b.settings, `block '${b.type || b.name}'`);
  }

  // Check CSS font-family rules for hardcoded font stacks
  const fontMatches = source.matchAll(/font-family\s*:\s*([^;}]+)/gi);
  for (const m of fontMatches) {
    const val = m[1].trim();
    if (!val.includes("var(--font-") && !val.includes("inherit")) {
      errors.push(
        `[TYPOGRAPHY VIOLATION] ${relPath}: hardcoded font-family '${val}'. ` +
          `All typography must inherit strictly from theme tokens (var(--font-heading-family), var(--font-body-family)).`
      );
    }
  }
}

// ============================================================================
// 4. RULE: SECTION SHELL ARCHITECTURE (sections/*.liquid & section-library)
// ============================================================================
function inspectSectionSchema(filePath, fileSource, schema) {
  const relPath = relative(root, filePath);
  const settings = schema.settings || [];

  for (const setting of settings) {
    const settingId = setting.id || "";
    const settingType = setting.type || "";

    if (disallowedSectionSettingTypes.has(settingType)) {
      errors.push(
        `[SECTION ATOMIC INLINE VIOLATION] ${relPath}: defines inline '${settingId}' with type '${settingType}'. ` +
          `Sections are layout shells only. Images, videos, and formatted text must be decomposed into theme blocks.`
      );
    }

    if (typeof setting.default === "string" && /#([0-9a-fA-F]{3,8})\b/.test(setting.default)) {
      errors.push(
        `[HARDCODED COLOR IN SCHEMA] ${relPath}: setting '${settingId}' declares hardcoded hex default '${setting.default}'. ` +
          `Use universal theme tokens and color_scheme instead of hardcoded hex values (AGENTS.md §4C).`
      );
    }

    if (disallowedSectionSettingIds.has(settingId)) {
      errors.push(
        `[SECTION ATOMIC INLINE VIOLATION] ${relPath}: defines inline atomic setting '${settingId}' (type: ${settingType}). ` +
          `Sections must not embed content. Text, headings, and buttons must be decomposed into theme blocks.`
      );
    }
  }

  checkTypographyIdentity(filePath, fileSource, schema);
  checkInteractiveTagNesting(filePath, fileSource);
}

for (const file of sectionFiles) {
  const filePath = join(sectionsDir, file);
  const source = readFileSync(filePath, "utf8");
  const schemaMatch = source.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);

  if (!schemaMatch) {
    errors.push(`sections/${file}: missing schema`);
    continue;
  }

  let schema;
  try {
    schema = JSON.parse(schemaMatch[1]);
  } catch (err) {
    errors.push(`sections/${file}: invalid JSON schema (${err.message})`);
    continue;
  }

  inspectSectionSchema(filePath, source, schema);

  const body = source.slice(0, schemaMatch.index);

  // Check: Theme-block slot requirement (sections are layout shells)
  if (file !== "cart-drawer.liquid") {
    if (!/content_for\s+['"]blocks?['"]/.test(body)) {
      errors.push(
        `sections/${file}: missing {% content_for 'blocks' %}; section must render content via theme blocks`
      );
    }
  }

  // Check: Universal color scheme helper
  if (!body.includes("settings.palette_5_light.id") || !body.includes("color-global")) {
    errors.push(
      `sections/${file}: missing universal root color-scheme helper (settings.palette_5_light.id check)`
    );
  }

  // Check: Universal schema color scheme setting
  const colorScheme = (schema.settings || []).find((s) => s.id === "color_scheme");
  if (!colorScheme || colorScheme.type !== "color_scheme" || colorScheme.default !== "bare-light") {
    errors.push(
      `sections/${file}: color_scheme setting must be type color_scheme with default 'bare-light'`
    );
  }

  // Check: Blocks array must reference valid theme blocks or @theme/@app
  if (schema.blocks && schema.blocks.length > 0) {
    for (const b of schema.blocks) {
      if (b.type === "@theme" || b.type === "@app") continue;
      if (!blockTypeSet.has(b.type)) {
        errors.push(`sections/${file}: references unknown block '${b.type}' in schema.blocks`);
      }
    }
  }

  // Check: Section grouping taxonomy (enabled_on for header/footer, disabled_on for template sections)
  if (!file.startsWith("main-") && file !== "cart-drawer.liquid") {
    const hasDisabledOn = Boolean(schema.disabled_on && schema.disabled_on.groups);
    const hasEnabledOn = Boolean(schema.enabled_on && schema.enabled_on.groups);
    if (!hasDisabledOn && !hasEnabledOn) {
      errors.push(
        `sections/${file}: must declare 'disabled_on' or 'enabled_on' to enforce section grouping taxonomy`
      );
    }
  }
}

// Canonical section-library verification
for (const filePath of libraryFiles) {
  const source = readFileSync(filePath, "utf8");
  const schemaMatch = source.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  if (!schemaMatch) continue;

  let schema;
  try {
    schema = JSON.parse(schemaMatch[1]);
  } catch {
    continue;
  }

  inspectSectionSchema(filePath, source, schema);
}

// ============================================================================
// 5. RULE: THEME BLOCKS GOVERNANCE & WHITELISTING (blocks/*.liquid)
// ============================================================================
for (const file of blockFiles) {
  const blockName = file.replace(/\.liquid$/, "");
  const filePath = join(blocksDir, file);
  const source = readFileSync(filePath, "utf8");
  const schemaMatch = source.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);

  if (!schemaMatch) {
    errors.push(`blocks/${file}: missing schema`);
    continue;
  }

  let schema;
  try {
    schema = JSON.parse(schemaMatch[1]);
  } catch (err) {
    errors.push(`blocks/${file}: invalid JSON schema (${err.message})`);
    continue;
  }

  checkTypographyIdentity(filePath, source, schema);
  checkInteractiveTagNesting(filePath, source);

  // Must not read section.settings
  if (source.includes("section.settings")) {
    errors.push(`blocks/${file}: reads section.settings directly; blocks must remain self-scoped`);
  }

  // Tag null requires shopify_attributes
  if (schema.tag === null && !source.includes("block.shopify_attributes")) {
    errors.push(`blocks/${file}: has "tag": null but missing {{ block.shopify_attributes }}`);
  }

  // Presets required
  if (!schema.presets || schema.presets.length === 0) {
    errors.push(
      `blocks/${file}: missing presets; every block requires at least one default preset`
    );
  }

  // Schema settings must not declare hardcoded hex defaults
  for (const s of schema.settings || []) {
    if (typeof s.default === "string" && /#([0-9a-fA-F]{3,8})\b/.test(s.default)) {
      errors.push(
        `[HARDCODED COLOR IN SCHEMA] blocks/${file}: setting '${s.id}' declares hardcoded hex default '${s.default}'. ` +
          `Use universal theme tokens instead of hardcoded hex values (AGENTS.md §4C).`
      );
    }
  }

  const hasSlot = /content_for\s+['"]blocks?['"]/.test(source);
  const hasSchemaBlocks = Boolean(schema.blocks && schema.blocks.length > 0);

  // Terminal Leaf Blocks: Must NOT render content_for 'blocks' and must NOT declare schema.blocks
  if (terminalLeafBlocks.has(blockName)) {
    if (hasSlot) {
      errors.push(
        `[TERMINAL BLOCK VIOLATION] blocks/${file}: terminal leaf block must not contain {% content_for 'blocks' %}`
      );
    }
    if (hasSchemaBlocks) {
      errors.push(
        `[TERMINAL BLOCK VIOLATION] blocks/${file}: terminal leaf block must not declare schema.blocks`
      );
    }
  }

  // Container & Card Blocks Mandate:
  // Container/composite blocks (cards, slides, layouts, wrappers) must NOT define monolithic
  // content settings (title, heading, text, button_label, count_override, link_override, etc.).
  // Any public theme block that is not a terminal leaf must render {% content_for 'blocks' %}
  // and declare a strict 'blocks' whitelist.
  const isLeaf = terminalLeafBlocks.has(blockName);
  const isPublicBlock = !blockName.startsWith("_");

  if (!isLeaf && blockName !== "accordion-item") {
    if (isPublicBlock) {
      for (const s of schema.settings || []) {
        if (s.id && (prohibitedCompositeContentSettings.has(s.id) || s.id.endsWith("_override"))) {
          errors.push(
            `[COMPOSITE MONOLITHIC VIOLATION] blocks/${file}: defines monolithic setting '${s.id}'. ` +
              `Cards and container blocks must not embed titles, headings, links, or count overrides. ` +
              `Decompose content into fine-grained child theme blocks (heading, badge, button, text, etc.).`
          );
        }
      }

      if (!hasSlot) {
        errors.push(
          `[UNCOMPOSED CONTAINER VIOLATION] blocks/${file}: public theme block is not a terminal leaf ` +
            `and must render {% content_for 'blocks' %} so its content is composed of selectable child blocks.`
        );
      }
    } else if (hasSlot) {
      for (const s of schema.settings || []) {
        if (s.id && (prohibitedCompositeContentSettings.has(s.id) || s.id.endsWith("_override"))) {
          errors.push(
            `[COMPOSITE MONOLITHIC VIOLATION] blocks/${file}: defines monolithic setting '${s.id}'. ` +
              `Container blocks must not embed titles, headings, or button labels. Decompose into child blocks.`
          );
        }
      }
    }
  }

  // Interactive Form Decomposition Mandate:
  // Blocks representing interactive customer forms (such as contact forms) MUST NOT hardcode
  // input fields, textareas, selects, or submit buttons monolithically. They must render {% content_for 'blocks' %}
  // so individual form controls, helper copy, and buttons are fine-grained, canvas-clickable theme blocks.
  if (blockName.includes("contact-form")) {
    if (!hasSlot) {
      errors.push(
        `[MONOLITHIC FORM VIOLATION] blocks/${file}: contact / interactive form block is missing {% content_for 'blocks' %}. ` +
          `Every input, textarea, select, text label, and submit button MUST be decomposed into independent, selectable theme blocks.`
      );
    }
    const bodyWithoutSchema = source.slice(0, schemaMatch.index);
    if (
      /<input\s+[^>]*name=["']contact\[/i.test(bodyWithoutSchema) ||
      /<textarea\s+[^>]*name=["']contact\[/i.test(bodyWithoutSchema)
    ) {
      errors.push(
        `[HARDCODED FORM CONTROLS VIOLATION] blocks/${file}: hardcodes <input> or <textarea> directly in template body. ` +
          `Form controls must be composed as selectable child theme blocks (blocks/input.liquid, blocks/textarea.liquid, blocks/select.liquid).`
      );
    }
  }

  // Whitelist Consistency: hasSlot requires schema.blocks, and schema.blocks requires hasSlot
  if (hasSlot && !hasSchemaBlocks) {
    errors.push(
      `[BLOCK WHITELIST VIOLATION] blocks/${file}: renders {% content_for 'blocks' %} but missing 'blocks' array in schema. ` +
        `Container blocks must explicitly whitelist allowed child blocks.`
    );
  }
  if (!hasSlot && hasSchemaBlocks) {
    errors.push(
      `[BLOCK WHITELIST VIOLATION] blocks/${file}: declares 'blocks' whitelist in schema but does not render {% content_for 'blocks' %}.`
    );
  }

  // Whitelisted blocks must exist
  if (schema.blocks && schema.blocks.length > 0) {
    for (const b of schema.blocks) {
      if (b.type === "@theme" || b.type === "@app") continue;
      if (!blockTypeSet.has(b.type)) {
        errors.push(`blocks/${file}: schema.blocks references unknown block '${b.type}'`);
      }
    }
  }
}

// ============================================================================
// 6. RULE: SECTION GROUPS TAXONOMY INTEGRITY
// ============================================================================
const headerGroupPath = join(root, "sections/header-group.json");
if (existsSync(headerGroupPath)) {
  try {
    const data = JSON.parse(readFileSync(headerGroupPath, "utf8"));
    for (const [secId, sec] of Object.entries(data.sections || {})) {
      const s = parsedSectionSchemas.get(sec.type);
      checkSavedSettingIds(sec.settings, s, `header-group.json > ${secId} (${sec.type})`);
      if (!s?.enabled_on?.groups?.includes("header")) {
        errors.push(
          `[SECTION GROUP VIOLATION] header-group.json > ${secId} (${sec.type}): ` +
            `section must declare enabled_on.groups including 'header'.`
        );
      }
    }
  } catch (err) {
    errors.push(`header-group.json: failed to parse JSON (${err.message})`);
  }
}

const footerGroupPath = join(root, "sections/footer-group.json");
if (existsSync(footerGroupPath)) {
  try {
    const data = JSON.parse(readFileSync(footerGroupPath, "utf8"));
    for (const [secId, sec] of Object.entries(data.sections || {})) {
      const s = parsedSectionSchemas.get(sec.type);
      checkSavedSettingIds(sec.settings, s, `footer-group.json > ${secId} (${sec.type})`);
      if (!s?.enabled_on?.groups?.includes("footer")) {
        errors.push(
          `[SECTION GROUP VIOLATION] footer-group.json > ${secId} (${sec.type}): ` +
            `section must declare enabled_on.groups including 'footer'.`
        );
      }
    }
  } catch (err) {
    errors.push(`footer-group.json: failed to parse JSON (${err.message})`);
  }
}

// ============================================================================
// 7. RULE: TEMPLATE COMPOSITION, STRICT WHITELISTING & NESTING (templates/*.json)
// ============================================================================
const templatesDir = join(root, "templates");
const templateFiles = readdirSync(templatesDir).filter((file) => file.endsWith(".json"));

let totalSectionsChecked = 0;
let totalBlocksChecked = 0;
let deepestNesting = 0;
let deepestPath = "";

function checkSavedSettingIds(settings, schema, path) {
  if (!settings || !schema) return;
  const allowed = new Set((schema.settings || []).filter((setting) => setting.id).map((setting) => setting.id));
  for (const key of Object.keys(settings)) {
    if (!allowed.has(key)) {
      errors.push(`[UNKNOWN SETTING] ${path}: '${key}' is not declared by its owning schema`);
    }
  }
}

function inspectBlocks(blocks, order, depth, path, parentType, parentAllowedBlocks) {
  if (!blocks) return;
  const blockKeys = Object.keys(blocks);

  if (order) {
    for (const key of blockKeys) {
      if (blocks[key]?.static) {
        if (order.includes(key)) {
          errors.push(`${path}: static block '${key}' must not be in block_order`);
        }
      } else if (!order.includes(key)) {
        errors.push(`${path}: block '${key}' exists in blocks but is missing from block_order`);
      }
    }
    for (const key of order) {
      if (!blocks[key]) {
        errors.push(`${path}: block '${key}' exists in block_order but is missing from blocks`);
      }
    }
  }

  for (const [key, block] of Object.entries(blocks)) {
    totalBlocksChecked++;
    const currentPath = `${path}/${key} (${block.type})`;

    if (!block.type) {
      errors.push(`[TEMPLATE VIOLATION] ${currentPath}: block is missing 'type' declaration`);
      continue;
    }

    // Check block existence
    if (!blockTypeSet.has(block.type) && block.type !== "@app") {
      errors.push(
        `[TEMPLATE VIOLATION] ${currentPath}: references non-existent block type '${block.type}'`
      );
    }

    // Check parent whitelisting contract
    if (parentAllowedBlocks && parentAllowedBlocks.size > 0) {
      const allowsAllTheme = parentAllowedBlocks.has("@theme");
      const allowsAllApp = parentAllowedBlocks.has("@app");
      const isAllowed =
        allowsAllTheme ||
        (allowsAllApp && block.type === "@app") ||
        parentAllowedBlocks.has(block.type);

      if (!isAllowed) {
        errors.push(
          `[STRICT WHITELIST VIOLATION] ${currentPath}: block '${block.type}' is placed inside '${parentType}', ` +
            `which does not whitelist it in schema.blocks.`
        );
      }
    }

    if (block.settings) {
      checkSavedSettingIds(block.settings, parsedBlockSchemas.get(block.type), currentPath);
      for (const [sKey, sVal] of Object.entries(block.settings)) {
        if (typeof sVal === "string" && /#([0-9a-fA-F]{3,8})\b/.test(sVal)) {
          errors.push(
            `[HARDCODED COLOR IN TEMPLATE] ${currentPath}: setting '${sKey}' uses hardcoded hex '${sVal}'. ` +
              `Components must inherit global theme tokens (AGENTS.md §4C).`
          );
        }
      }
    }

    if (depth > deepestNesting) {
      deepestNesting = depth;
      deepestPath = currentPath;
    }
    if (depth > 8) {
      errors.push(
        `[NESTING VIOLATION] ${currentPath}: nesting depth ${depth} exceeds Shopify limit of 8`
      );
    }

    if (block.blocks) {
      const childSchema = parsedBlockSchemas.get(block.type);
      const childAllowed = new Set((childSchema?.blocks || []).map((b) => b.type));
      inspectBlocks(
        block.blocks,
        block.block_order,
        depth + 1,
        currentPath,
        block.type,
        childAllowed
      );
    }
  }
}

for (const file of templateFiles) {
  let content;
  try {
    content = JSON.parse(readFileSync(join(templatesDir, file), "utf8"));
  } catch (err) {
    errors.push(`templates/${file}: invalid JSON (${err.message})`);
    continue;
  }

  const sections = content.sections || {};
  const order = content.order || [];

  for (const [sectionId, section] of Object.entries(sections)) {
    totalSectionsChecked++;
    const sectionPath = `${file} > sections > ${sectionId} (${section.type})`;

    if (section.settings) {
      for (const [sKey, sVal] of Object.entries(section.settings)) {
        if (typeof sVal === "string" && /#([0-9a-fA-F]{3,8})\b/.test(sVal)) {
          errors.push(
            `[HARDCODED COLOR IN TEMPLATE] ${sectionPath}: setting '${sKey}' uses hardcoded hex '${sVal}'. ` +
              `Components must inherit global theme tokens (AGENTS.md §4C).`
          );
        }
      }
    }

    const secSchema = parsedSectionSchemas.get(section.type);
    checkSavedSettingIds(section.settings, secSchema, sectionPath);
    const secAllowed = new Set((secSchema?.blocks || []).map((b) => b.type));

    if (section.blocks) {
      inspectBlocks(section.blocks, section.block_order, 1, sectionPath, section.type, secAllowed);
    }
  }
}

// ============================================================================
// 8. RULE: PRESET INTEGRITY (sections & blocks presets)
// ============================================================================
function validatePresets(sourcePath, presets = [], rootAllowedBlocks, parentName, rootSchema) {
  const checkSettingsForHex = (settings, context) => {
    if (!settings || typeof settings !== "object") return;
    for (const [key, val] of Object.entries(settings)) {
      if (typeof val === "string" && /#([0-9a-fA-F]{3,8})\b/.test(val)) {
        errors.push(
          `[HARDCODED COLOR IN PRESET] ${sourcePath}: ${context} setting '${key}' uses hardcoded hex '${val}'. ` +
            `All components must inherit theme tokens (AGENTS.md §4C); hardcoded hex overrides are strictly prohibited.`
        );
      }
    }
  };

  for (const preset of presets) {
    checkSavedSettingIds(preset.settings, rootSchema, `${sourcePath} > preset '${preset.name || "default"}'`);
    checkSettingsForHex(preset.settings, `preset '${preset.name || "default"}'`);

    function inspectPresetBlocks(blocks = [], allowedSet, parentType) {
      for (const b of blocks) {
        if (!b.type) continue;
        if (!blockTypeSet.has(b.type) && b.type !== "@app") {
          errors.push(
            `[PRESET VIOLATION] ${sourcePath}: preset references non-existent block '${b.type}'`
          );
        }
        if (allowedSet && allowedSet.size > 0) {
          const allowsAllTheme = allowedSet.has("@theme");
          const isAllowed = allowsAllTheme || allowedSet.has(b.type);
          if (!isAllowed) {
            errors.push(
              `[PRESET WHITELIST VIOLATION] ${sourcePath}: preset places block '${b.type}' inside '${parentType}' ` +
                `which does not whitelist it.`
            );
          }
        }
        checkSettingsForHex(b.settings, `block '${b.type}' in preset`);
        checkSavedSettingIds(b.settings, parsedBlockSchemas.get(b.type), `${sourcePath} > preset '${preset.name || "default"}' > ${b.type}`);
        if (b.blocks) {
          const childSchema = parsedBlockSchemas.get(b.type);
          const childAllowed = new Set((childSchema?.blocks || []).map((cb) => cb.type));
          inspectPresetBlocks(b.blocks, childAllowed, b.type);
        }
      }
    }
    inspectPresetBlocks(preset.blocks, rootAllowedBlocks, parentName);
  }
}

for (const [secName, schema] of parsedSectionSchemas) {
  const allowed = new Set((schema.blocks || []).map((b) => b.type));
  validatePresets(`sections/${secName}.liquid`, schema.presets, allowed, secName, schema);
}

for (const [blockName, schema] of parsedBlockSchemas) {
  const allowed = new Set((schema.blocks || []).map((b) => b.type));
  validatePresets(`blocks/${blockName}.liquid`, schema.presets, allowed, blockName, schema);
}

for (const filePath of libraryFiles) {
  const rel = relative(root, filePath);
  const source = readFileSync(filePath, "utf8");
  const schemaMatch = source.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  if (!schemaMatch) continue;
  try {
    const schema = JSON.parse(schemaMatch[1]);
    const allowed = new Set((schema.blocks || []).map((b) => b.type));
    validatePresets(rel, schema.presets, allowed, basename(filePath, ".liquid"), schema);
  } catch {}
}

// ============================================================================
// 9. RULE: HARDCODED CSS COLOR DETECTION (AGENTS.md §4C)
//    "Never use hardcoded hex values (#fff, #000, #121212, etc.) or generic
//     font stacks (Arial, Georgia, sans-serif) in place of theme tokens."
//
//    Scans CSS in blocks/*.liquid, sections/*.liquid, section-library/**/*.liquid,
//    and snippets/*.liquid for:
//    - #hex values in CSS property declarations (background, color, border, etc.)
//    - rgba() / rgb() with literal numeric arguments
//    - Generic font stacks used directly (sans-serif, serif, monospace, Arial, etc.)
//
//    Exemptions:
//    - Hex values inside var() fallbacks: var(--color-foo, #fff) — warned, not errored
//    - Hex values inside schema JSON blocks (merchant-configurable color pickers)
//    - SVG attributes (fill, stroke in SVG markup)
//    - Liquid output tags {{ setting | color_... }}
//    - color-mix() using var() token arguments (the correct pattern)
//    - Placeholder SVG tag references
// ============================================================================

// CSS properties where hardcoded colors are violations
const colorCssProperties = [
  "background",
  "background-color",
  "background-image",
  "color",
  "border",
  "border-color",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "border-block",
  "border-inline",
  "border-block-start",
  "border-block-end",
  "border-inline-start",
  "border-inline-end",
  "outline",
  "outline-color",
  "box-shadow",
  "text-shadow",
  "text-decoration-color",
  "caret-color",
  "accent-color",
  "fill",
  "stroke",
  "stop-color",
  "flood-color",
  "column-rule-color",
];

// Generic font stacks that violate the single typography identity rule
const genericFontStacks =
  /\b(Arial|Helvetica|Georgia|Times New Roman|Times|Courier New|Courier|Verdana|Tahoma|Palatino|Garamond|Impact|Comic Sans MS|Trebuchet MS|Lucida Console)\b/i;
const genericFontKeywords =
  /\b(sans-serif|serif|monospace|cursive|fantasy|system-ui|ui-serif|ui-sans-serif|ui-monospace)\b/;

let totalHardcodedColorViolations = 0;

function extractCssFromLiquid(source) {
  // Extract CSS from {% style %}, {% stylesheet %}, {%- style -%}, style="" attributes,
  // and <style> tags
  const cssBlocks = [];

  // {% style %} ... {% endstyle %}
  for (const m of source.matchAll(
    /\{%-?\s*style(?:sheet)?\s*-?%\}([\s\S]*?)\{%-?\s*end(?:style(?:sheet)?)\s*-?%\}/g
  )) {
    cssBlocks.push({ css: m[1], offset: m.index });
  }

  // Inline style="" attributes
  for (const m of source.matchAll(/style="([^"]+)"/g)) {
    cssBlocks.push({ css: m[1], offset: m.index });
  }
  for (const m of source.matchAll(/style='([^']+)'/g)) {
    cssBlocks.push({ css: m[1], offset: m.index });
  }

  return cssBlocks;
}

function getLineNumber(source, offset) {
  return source.substring(0, offset).split("\n").length;
}

function checkHardcodedColors(filePath, source) {
  const relPath = relative(root, filePath);

  // Skip non-component files
  if (relPath.endsWith(".md") || relPath.endsWith(".json")) return;

  // Extract the portion before {% schema %} to avoid scanning schema JSON
  const schemaIdx = source.search(/\{%-?\s*schema/);
  const scanSource = schemaIdx !== -1 ? source.slice(0, schemaIdx) : source;

  const cssBlocks = extractCssFromLiquid(scanSource);

  for (const { css, offset } of cssBlocks) {
    const lines = css.split("\n");
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];

      // Skip lines that are comments
      if (/^\s*\/[/*]/.test(line)) continue;

      // Skip lines that are pure Liquid output ({{ }})
      if (/^\s*\{\{/.test(line.trim())) continue;

      // 1. Detect bare #hex values in CSS properties
      const hexMatches = [...line.matchAll(/#([0-9a-fA-F]{3,8})\b/g)];
      for (const hm of hexMatches) {
        const hexValue = hm[0];
        const beforeHex = line.substring(0, hm.index);

        // Exemption: Inside var() fallback — e.g. var(--color-foo, #fff)
        if (/var\(\s*--[a-z0-9_-]+\s*,\s*$/.test(beforeHex)) {
          warnings.push(
            `[HARDCODED FALLBACK] ${relPath}:${getLineNumber(source, offset) + lineIdx}: ` +
              `hex fallback '${hexValue}' in var() — consider removing or documenting the fallback.`
          );
          continue;
        }

        // Exemption: Inside Liquid output tags {{ ... }}
        if (/\{\{[^}]*$/.test(beforeHex)) continue;

        // Exemption: SVG-specific attributes (not CSS properties)
        if (/\b(viewBox|xmlns|xlink|d)\s*=/.test(beforeHex)) continue;

        // Check if this hex is in a CSS property context
        const propMatch = beforeHex.match(/([\w-]+)\s*:\s*(?:[^;]*\s)?$/);
        if (propMatch) {
          const prop = propMatch[1].toLowerCase();
          if (colorCssProperties.some((p) => prop === p || prop.startsWith(p + "-"))) {
            totalHardcodedColorViolations++;
            warnings.push(
              `[HARDCODED COLOR] ${relPath}:${getLineNumber(source, offset) + lineIdx}: ` +
                `'${prop}' uses hardcoded hex '${hexValue}'. Use theme tokens (var(--color-*), color-mix()).`
            );
          }
        }
      }

      // 2. Detect rgba() / rgb() with literal numeric arguments
      const rgbaMatches = [...line.matchAll(/\b(rgba?)\(\s*(\d+)/g)];
      for (const rm of rgbaMatches) {
        const beforeRgba = line.substring(0, rm.index);

        // Exemption: Inside var() fallback
        if (/var\(\s*--[a-z0-9_-]+\s*,\s*$/.test(beforeRgba)) {
          warnings.push(
            `[HARDCODED FALLBACK] ${relPath}:${getLineNumber(source, offset) + lineIdx}: ` +
              `${rm[1]}() fallback in var() — consider using color-mix() with theme tokens.`
          );
          continue;
        }

        // Exemption: Inside Liquid output
        if (/\{\{[^}]*$/.test(beforeRgba)) continue;

        // Check CSS property context
        const propMatch = beforeRgba.match(/([\w-]+)\s*:\s*(?:[^;]*\s)?$/);
        if (propMatch) {
          const prop = propMatch[1].toLowerCase();
          if (colorCssProperties.some((p) => prop === p || prop.startsWith(p + "-"))) {
            totalHardcodedColorViolations++;
            warnings.push(
              `[HARDCODED COLOR] ${relPath}:${getLineNumber(source, offset) + lineIdx}: ` +
                `'${prop}' uses literal ${rm[1]}(). Use theme tokens (var(--color-*), color-mix(in srgb, var(--color-*) N%, transparent)).`
            );
          }
        } else {
          // Also catch rgba() inside gradient / filter / shadow functions
          const funcMatch = beforeRgba.match(
            /(linear-gradient|radial-gradient|drop-shadow|box-shadow|text-shadow)\s*\(/
          );
          if (funcMatch) {
            totalHardcodedColorViolations++;
            warnings.push(
              `[HARDCODED COLOR] ${relPath}:${getLineNumber(source, offset) + lineIdx}: ` +
                `literal ${rm[1]}() inside ${funcMatch[1]}. Use color-mix(in srgb, var(--color-*) N%, transparent).`
            );
          }
        }
      }

      // 3. Detect generic font stacks
      if (/font-family\s*:/i.test(line)) {
        const fontValue = line.replace(/.*font-family\s*:\s*/i, "").replace(/[;}\s].*$/, "");
        if (!fontValue.includes("var(--font-") && !fontValue.includes("inherit")) {
          if (genericFontStacks.test(fontValue)) {
            errors.push(
              `[TYPOGRAPHY VIOLATION] ${relPath}:${getLineNumber(source, offset) + lineIdx}: ` +
                `hardcoded font stack '${fontValue.trim()}'. All typography must use var(--font-heading-family) or var(--font-body-family).`
            );
          }
          if (genericFontKeywords.test(fontValue)) {
            errors.push(
              `[TYPOGRAPHY VIOLATION] ${relPath}:${getLineNumber(source, offset) + lineIdx}: ` +
                `generic font keyword in '${fontValue.trim()}'. Use theme token variables.`
            );
          }
        }
      }
    }
  }
}

// Scan blocks, sections, section-library, and snippets for hardcoded colors
const snippetsDir = join(root, "snippets");
const snippetFiles = existsSync(snippetsDir)
  ? readdirSync(snippetsDir).filter((f) => f.endsWith(".liquid"))
  : [];

for (const file of blockFiles) {
  checkHardcodedColors(join(blocksDir, file), readFileSync(join(blocksDir, file), "utf8"));
}

for (const file of sectionFiles) {
  checkHardcodedColors(join(sectionsDir, file), readFileSync(join(sectionsDir, file), "utf8"));
}

for (const filePath of libraryFiles) {
  checkHardcodedColors(filePath, readFileSync(filePath, "utf8"));
}

for (const file of snippetFiles) {
  checkHardcodedColors(join(snippetsDir, file), readFileSync(join(snippetsDir, file), "utf8"));
}

// ============================================================================
// 10. RULE: MONOLITHIC CONTENT SETTINGS ON BLOCKS WITHOUT content_for 'blocks'
//     (AGENTS.md §7A — The "No Monolithic / Atomic Content Settings" Mandate)
//
//     The existing check (rule 5, line ~364) only flags blocks that have
//     content_for 'blocks' AND monolithic settings. But the mandate also
//     applies to blocks that SHOULD have content_for 'blocks' but don't —
//     i.e. non-leaf blocks that embed content settings like heading, text,
//     title, description, button_label monolithically.
//
//     Exemptions:
//     - Terminal leaf blocks (heading, text, button, etc.)
//     - Specialized Shopify resource plugs that bind to native Liquid objects
// ============================================================================

// Extended monolithic setting IDs — wider net than the container-only set
const monolithicContentIds = new Set([
  "title",
  "subheading",
  "heading",
  "subtitle",
  "eyebrow",
  "text",
  "description",
  "body",
  "button_label",
  "button_text",
  "button_link",
  "button_1_label",
  "button_2_label",
  "secondary_button_label",
  "count_override",
  "count",
  "title_override",
  "link_override",
  "note_heading",
  "note_1_text",
  "note_2_text",
]);

// Blocks that are specialized Shopify resource plugs — they bind to native
// Liquid objects (product, article, cart, etc.) and are exempt from the
// general "decompose into theme blocks" mandate because their content is
// data-driven, not merchant-authored copy.
const resourcePlugBlocks = new Set([
  "_product-title",
  "_product-price",
  "_product-description",
  "_product-vendor",
  "_product-variant-picker",
  "_product-quantity",
  "_product-buy-buttons",
  "_product-share",
  "_product-payment-guarantee",
  "_product-return-policy",
  "_page-content",
  "_cart-content",
  "_cart-drawer-content",
  "_catalog-results",
  "_gift-card-resource",
  "_password-resource",
  "_article-resource",
  "_blog-resource",
  "_header-content",
  "_faq-media",
  "_image-compare",
  "_main-404-content",
  "_shipping-rates-content",
  "_size-guide-content",
  "_blog-carousel",
  "_collection-index",
  "_collection-tabs",
  "_footer-menu-content",
]);

let monolithicBlockCount = 0;

for (const file of blockFiles) {
  const blockName = file.replace(/\.liquid$/, "");

  // Skip terminal leaves, resource plugs, and accordion-item
  if (terminalLeafBlocks.has(blockName)) continue;
  if (resourcePlugBlocks.has(blockName)) continue;
  if (blockName === "accordion-item") continue;

  const schema = parsedBlockSchemas.get(blockName);
  if (!schema) continue;

  const filePath = join(blocksDir, file);
  const source = readFileSync(filePath, "utf8");
  const hasSlot = /content_for\s+['"]blocks?['"]/.test(source);

  // Blocks WITH content_for are already checked in rule 5. Here we catch
  // blocks WITHOUT content_for that still define monolithic content settings.
  if (hasSlot) continue;

  const settings = schema.settings || [];
  const badSettings = settings.filter((s) => s.id && monolithicContentIds.has(s.id));

  if (badSettings.length > 0) {
    monolithicBlockCount++;
    const ids = badSettings.map((s) => `'${s.id}'`).join(", ");
    warnings.push(
      `[MONOLITHIC BLOCK] blocks/${file}: defines monolithic content settings (${ids}) without {% content_for 'blocks' %}. ` +
        `Consider decomposing into fine-grained child theme blocks for canvas clickability and sidebar selectability.`
    );
  }
}

// ============================================================================
// 11. REPORTING
// ============================================================================
console.log("----------------------------------------------------");
console.log("COMPOSITION & THEME BLOCKS VIOLATION CHECK");
console.log("----------------------------------------------------");
console.log(`✓ Audited ${sectionFiles.length} runtime sections in sections/`);
console.log(`✓ Audited ${libraryFiles.length} canonical sections in section-library/`);
console.log(`✓ Verified ZERO inline atomic settings (text, image, video, font) in sections`);
console.log(`✓ Audited ${blockFiles.length} theme blocks in blocks/`);
console.log(`✓ Verified terminal leaf block boundaries & container schema.blocks contracts`);
console.log(`✓ Audited HTML5 semantic tree & verified ZERO interactive nesting around block slots`);
console.log(`✓ Audited single typography identity (no hardcoded font stacks or font_pickers)`);
console.log(`✓ Audited section group taxonomy in header-group.json and footer-group.json`);
console.log(
  `✓ Audited ${totalSectionsChecked} section instances across ${templateFiles.length} templates`
);
console.log(
  `✓ Audited ${totalBlocksChecked} nested theme block instances with strict parent whitelisting`
);
console.log(`✓ Audited preset integrity across all sections and theme blocks`);
console.log(
  `✓ Scanned CSS tokens across ${blockFiles.length + sectionFiles.length + libraryFiles.length + snippetFiles.length} source files for hardcoded colors`
);
if (monolithicBlockCount > 0) {
  console.log(
    `⚠ Found ${monolithicBlockCount} block(s) with monolithic content settings (no content_for 'blocks')`
  );
}
if (totalHardcodedColorViolations > 0) {
  console.log(`⚠ Found ${totalHardcodedColorViolations} hardcoded CSS color(s) (hex/rgba/rgb)`);
}
console.log(`✓ Maximum nesting depth: ${deepestNesting} levels (Shopify limit: 8)`);
if (deepestPath) {
  console.log(`  Deepest node: ${deepestPath}`);
}
console.log("----------------------------------------------------");

if (warnings.length > 0) {
  console.log(`\nWarnings (${warnings.length}):`);
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
}

if (errors.length > 0) {
  console.error(`\nFAILED: Found ${errors.length} composition violation(s):`);
  errors.forEach((err) => console.error(`  ✗ ${err}`));
  console.error("\nFix the above violations to maintain strict 5-layer theme block composition.\n");
  process.exit(1);
} else {
  console.log(
    "\nSUCCESS: Zero composition errors found! All sections and blocks comply with fine-grained theme block standards."
  );
  if (warnings.length > 0) {
    console.log(`(${warnings.length} warning(s) reported above — review and address as needed.)`);
  }
  process.exit(0);
}
