import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const blocksDir = join(root, "blocks");
const blockFiles = readdirSync(blocksDir).filter((file) => file.endsWith(".liquid"));
const errors = [];

const foundationalBlocks = [
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
  "icon-with-text",
  "group",
  "surface",
  "spacer",
  "divider",
  "price",
  "badge",
  "rating",
  "countdown",
  "input",
  "select",
  "checkbox",
  "tab-trigger",
  "accordion-trigger",
  "card",
  "media-text",
  "feature-item",
  "testimonial",
  "accordion-item",
  "tab-panel",
  "stat",
  "logo-item",
  "product-card",
  "newsletter-form",
  "collection-card",
  "grid",
  "carousel",
];

const foundationalSettingContract = {
  heading: ["text", "level", "size", "weight", "color_role", "alignment", "max_width"],
  text: ["text", "size", "color_role", "alignment", "max_width"],
  eyebrow: ["text", "color_role", "uppercase", "letter_spacing"],
  quote: ["text", "size", "alignment"],
  button: ["label", "link", "style", "size", "icon", "open_in_new_tab"],
  link: ["label", "link", "icon", "underline"],
  "icon-button": ["icon", "label", "size", "link"],
  image: ["image", "alt", "aspect_ratio", "fit", "focal_point", "radius", "lazy_load"],
  video: ["video", "video_url", "poster", "autoplay", "loop", "muted", "controls", "aspect_ratio"],
  icon: ["icon", "size", "color_role", "stroke_width"],
  "icon-with-text": ["media_type", "icon", "image", "heading", "text", "alignment", "link"],
  group: [
    "direction",
    "alignment",
    "justify",
    "wrap",
    "gap",
    "custom_gap",
    "padding",
    "custom_padding",
    "surface",
    "background",
    "border",
    "border_color",
    "border_width",
    "radius",
    "custom_radius",
    "max_width",
    "custom_max_width",
  ],
  surface: [
    "shade",
    "background",
    "border",
    "border_color",
    "border_width",
    "shadow",
    "radius",
    "custom_radius",
    "padding",
    "custom_padding",
    "hover_elevate",
  ],
  spacer: ["desktop_size", "mobile_size"],
  divider: ["style", "color_role", "weight", "width"],
  price: ["product", "show_compare_at", "show_sale_badge"],
  badge: ["label", "style", "custom_background", "custom_text"],
  rating: ["product", "rating", "display", "color_role"],
  countdown: ["end_date", "expired_behavior", "expired_text", "style"],
  input: ["label", "placeholder", "type", "required"],
  select: ["label", "options", "placeholder", "required"],
  checkbox: ["label", "required"],
  "tab-trigger": ["label", "target", "icon", "default_open"],
  "accordion-trigger": ["label", "target", "icon", "default_open"],
  card: ["layout", "media_position", "content_alignment", "surface", "hover_effect"],
  "media-text": ["media_position", "ratio", "alignment"],
  "feature-item": ["icon_size", "icon_position", "alignment"],
  testimonial: ["layout", "avatar_shape"],
  "accordion-item": ["heading", "open_by_default", "icon_style", "show_divider"],
  "tab-panel": ["identifier", "content_padding"],
  stat: ["value", "label", "number_size", "label_position", "count_up"],
  "logo-item": ["image", "size", "grayscale", "link"],
  "product-card": [
    "product",
    "image_aspect_ratio",
    "hover_image_swap",
    "show_rating",
    "show_vendor",
    "quick_view",
  ],
  "collection-card": [
    "collection",
    "image",
    "title",
    "count_override",
    "aspect_ratio",
    "show_count",
  ],
  grid: [
    "columns_desktop",
    "columns_tablet",
    "columns_mobile",
    "sizing_mode",
    "min_item_width",
    "gap",
    "split_gap",
    "row_gap",
    "column_gap",
    "align_items",
    "justify_items",
    "equal_height",
  ],
  carousel: ["columns_desktop", "columns_tablet", "columns_mobile", "show_navigation"],
};

for (const name of foundationalBlocks) {
  if (!blockFiles.includes(`${name}.liquid`))
    errors.push(`missing foundational block: blocks/${name}.liquid`);
}

const settingsSchema = JSON.parse(readFileSync(join(root, "config/settings_schema.json"), "utf8"));
const layoutSource = readFileSync(join(root, "layout/theme.liquid"), "utf8");
const foundationSettings = settingsSchema
  .flatMap((group) => group.settings || [])
  .map((setting) => setting.id)
  .filter((id) => id?.startsWith("foundation_"));

for (const id of foundationSettings) {
  const token = `--${id.replaceAll("_", "-")}`;
  if (!layoutSource.includes(token))
    errors.push(`config setting ${id} is not compiled to ${token}`);
}

if (blockFiles.length > 300)
  errors.push(`theme block count ${blockFiles.length} exceeds Shopify's limit of 300`);

for (const file of blockFiles) {
  const source = readFileSync(join(blocksDir, file), "utf8");
  const schemaMatch = source.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  if (!schemaMatch) {
    errors.push(`${file}: missing schema`);
    continue;
  }

  let schema;
  try {
    schema = JSON.parse(schemaMatch[1]);
  } catch (error) {
    errors.push(`${file}: invalid schema JSON (${error.message})`);
    continue;
  }

  if (!schema.presets?.length) errors.push(`${file}: at least one preset is required`);
  if (source.includes("section.settings"))
    errors.push(`${file}: reads section.settings; block settings must remain self-scoped`);
  if (schema.tag === null && !source.includes("block.shopify_attributes")) {
    errors.push(`${file}: tag:null requires block.shopify_attributes on its root element`);
  }
  if (foundationalBlocks.includes(file.replace(/\.liquid$/, ""))) {
    const blockName = file.replace(/\.liquid$/, "");
    const settingIds = new Set((schema.settings || []).map((setting) => setting.id));
    for (const id of foundationalSettingContract[blockName] || []) {
      if (!settingIds.has(id))
        errors.push(`${file}: missing documented foundational setting ${id}`);
    }
    for (const id of [
      "foundation_visibility",
      "foundation_custom_class",
      "foundation_margin_top",
      "foundation_margin_bottom",
      "foundation_anchor_id",
    ]) {
      if (!schema.settings?.some((setting) => setting.id === id))
        errors.push(`${file}: missing cross-cutting setting ${id}`);
    }
    for (const marker of [
      "data-foundation-visibility",
      "data-foundation-margin-top",
      "data-foundation-margin-bottom",
      "foundation_custom_class",
      "foundation-block-anchor",
    ]) {
      if (!source.includes(marker))
        errors.push(`${file}: does not render cross-cutting control ${marker}`);
    }
  }
}

let deepest = 0;
let deepestLocation = "";

function inspectBlocks(blocks, depth, location) {
  if (!blocks) return;
  const entries = Array.isArray(blocks)
    ? blocks.map((block, index) => [String(index), block])
    : Object.entries(blocks);
  for (const [id, block] of entries) {
    if (depth > deepest) {
      deepest = depth;
      deepestLocation = `${location}/${id}`;
    }
    if (depth > 8) errors.push(`${location}/${id}: nesting depth ${depth} exceeds the limit of 8`);
    inspectBlocks(block.blocks, depth + 1, `${location}/${id}`);
  }
}

for (const file of readdirSync(join(root, "templates")).filter((entry) =>
  entry.endsWith(".json")
)) {
  const template = JSON.parse(readFileSync(join(root, "templates", file), "utf8"));
  for (const [sectionId, section] of Object.entries(template.sections || {})) {
    inspectBlocks(section.blocks, 1, `${file}/${sectionId}`);
  }
}

for (const file of readdirSync(join(root, "sections")).filter((entry) => entry.endsWith(".json"))) {
  const group = JSON.parse(readFileSync(join(root, "sections", file), "utf8"));
  for (const [sectionId, section] of Object.entries(group.sections || {})) {
    inspectBlocks(section.blocks, 1, `${file}/${sectionId}`);
  }
}

const layoutSettingIds = new Set([
  "color_scheme",
  "page_width",
  "max_width",
  "padding_top",
  "padding_bottom",
  "alignment",
  "surface",
  "columns_desktop",
  "height_desktop",
  "height_mobile",
  "full_width",
]);
const sectionFiles = readdirSync(join(root, "sections")).filter((entry) =>
  entry.endsWith(".liquid")
);

for (const file of sectionFiles) {
  const source = readFileSync(join(root, "sections", file), "utf8");
  const schemaMatch = source.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  if (!schemaMatch) {
    errors.push(`sections/${file}: missing schema`);
    continue;
  }
  const body = source.slice(0, schemaMatch.index);
  if (!/content_for\s+['"]blocks?['"]/.test(body))
    errors.push(`sections/${file}: missing theme-block slot`);
  if (/for\s+\w+\s+in\s+section\.blocks/.test(body))
    errors.push(`sections/${file}: iterates legacy section.blocks`);
  if (/case\s+block\.type/.test(body))
    errors.push(`sections/${file}: switches on legacy local block types`);
  if (!body.includes("settings.palette_5_light.id") || !body.includes("color-global")) {
    errors.push(`sections/${file}: missing the universal root color-scheme helper`);
  }

  let schema;
  try {
    schema = JSON.parse(schemaMatch[1]);
  } catch {
    continue;
  }
  const colorScheme = schema.settings?.find((setting) => setting.id === "color_scheme");
  if (!colorScheme || colorScheme.type !== "color_scheme" || colorScheme.default !== "bare-light") {
    errors.push(`sections/${file}: color_scheme must use the universal bare-light setting`);
  }
  for (const setting of schema.settings || []) {
    if (setting.id && !layoutSettingIds.has(setting.id)) {
      errors.push(`sections/${file}: content setting ${setting.id} belongs in a theme block`);
    }
  }
}

if (errors.length) {
  console.error(`Theme-layer validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Theme-layer validation passed: ${sectionFiles.length} layout-only sections; ${foundationalBlocks.length} foundational blocks; ${foundationSettings.length} foundation settings compiled; ${blockFiles.length}/300 theme blocks; maximum template nesting depth ${deepest}${deepestLocation ? ` (${deepestLocation})` : ""}.`
);
