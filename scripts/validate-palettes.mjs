import { readFileSync } from "node:fs";

const data = JSON.parse(
  readFileSync(new URL("../config/settings_data.json", import.meta.url), "utf8")
);
const required = [
  "background",
  "surface",
  "surface_raised",
  "text",
  "muted",
  "border",
  "shadow",
  "accent",
  "accent_foreground",
  "button",
  "button_label",
  "secondary_button_label",
  "announcement",
  "announcement_text",
  "footer",
  "footer_text",
  "success",
  "warning",
  "danger",
  "info",
];

function rgb(hex) {
  const value = hex.replace("#", "");
  if (!/^[\da-f]{6}$/i.test(value))
    throw new Error(`Expected a 6-digit hex color, received ${hex}`);
  return [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255);
}

function luminance(hex) {
  return rgb(hex)
    .map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const schemes = data.current?.color_schemes || {};
const pairs = [
  ["background", "text"],
  ["surface", "text"],
  ["surface_raised", "text"],
  ["button", "button_label"],
  ["accent", "accent_foreground"],
  ["announcement", "announcement_text"],
  ["footer", "footer_text"],
];
const errors = [];

for (const [id, scheme] of Object.entries(schemes)) {
  const values = scheme.settings || {};
  required.forEach((key) => {
    if (!values[key]) errors.push(`${id}: missing ${key}`);
  });
  pairs.forEach(([background, foreground]) => {
    if (!values[background] || !values[foreground]) return;
    try {
      const ratio = contrast(values[background], values[foreground]);
      if (ratio < 4.5)
        errors.push(
          `${id}: ${foreground} on ${background} has ${ratio.toFixed(2)}:1 contrast (minimum 4.5:1)`
        );
    } catch (error) {
      errors.push(`${id}: ${error.message}`);
    }
  });
}

for (let index = 1; index <= 5; index += 1) {
  for (const mode of ["light", "dark"]) {
    const scheme = data.current?.[`palette_${index}_${mode}`];
    if (!schemes[scheme])
      errors.push(`palette_${index}_${mode} references missing scheme ${scheme || "(empty)"}`);
  }
}

if (errors.length) {
  console.error(`Palette validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Palette validation passed for ${Object.keys(schemes).length} schemes.`);
