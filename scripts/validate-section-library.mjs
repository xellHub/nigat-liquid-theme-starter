import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const mirrors = [
  ["section-library/products/frequently-bought-together/default/frequently-bought-together.liquid", "sections/frequently-bought-together.liquid"],
  ["section-library/products/recently-viewed/default/recently-viewed.liquid", "sections/recently-viewed.liquid"],
  ["section-library/products/recommended-products/default/recommended-products.liquid", "sections/recommended-products.liquid"],
  ["section-library/layout/custom-section/default/custom-section.liquid", "sections/custom-section.liquid"],
  [
    "section-library/global/footer-subscribe/default/footer-subscribe.liquid",
    "sections/footer-subscribe.liquid",
  ],
  ["section-library/global/footer/default/footer.liquid", "sections/footer.liquid"],
  [
    "section-library/global/announcement/default/announcement.liquid",
    "sections/announcement-bar.liquid",
  ],
  ["section-library/resources/cart/drawer/cart-drawer.liquid", "sections/cart-drawer.liquid"],
  ["section-library/global/footer-menu/default/footer-menu.liquid", "sections/footer-menu.liquid"],
  ["section-library/global/header/default/header.liquid", "sections/header.liquid"],
  ["section-library/resources/error/not-found/not-found.liquid", "sections/main-404.liquid"],
  ["section-library/resources/shipping/rates/rates.liquid", "sections/shipping-rates.liquid"],
  ["section-library/resources/size-guide/default/size-guide.liquid", "sections/size-guide.liquid"],
  ["section-library/resources/product/default/product.liquid", "sections/main-product.liquid"],
  ["section-library/resources/blog/default/blog.liquid", "sections/main-blog.liquid"],
  ["section-library/resources/article/default/article.liquid", "sections/main-article.liquid"],
  [
    "section-library/resources/gift-card/default/gift-card.liquid",
    "sections/main-gift-card.liquid",
  ],
  ["section-library/resources/password/default/password.liquid", "sections/main-password.liquid"],
  ["section-library/resources/page/default/page.liquid", "sections/main-page.liquid"],
  ["section-library/resources/cart/default/cart.liquid", "sections/main-cart.liquid"],
  [
    "section-library/resources/catalog/collection/collection.liquid",
    "sections/main-collection.liquid",
  ],
  ["section-library/resources/catalog/search/search.liquid", "sections/main-search.liquid"],
  [
    "section-library/resources/collection-index/default/collection-index.liquid",
    "sections/main-list-collections.liquid",
  ],
  ["section-library/banners/hero/presets/presets.liquid", "sections/hero.liquid"],
  [
    "section-library/banners/hero/editorial-carousel-hero/editorial-carousel-hero.liquid",
    "sections/editorial-carousel-hero.liquid",
  ],
  [
    "section-library/products/featured-collection-grid/featured-collection.liquid",
    "sections/featured-collection.liquid",
  ],
  [
    "section-library/storytelling/blog-posts-grid/featured-blog.liquid",
    "sections/featured-blog.liquid",
  ],
  [
    "section-library/forms/contact-form/sticky-aside/sticky-aside.liquid",
    "sections/contact-form.liquid",
  ],
  [
    "section-library/storytelling/interactive-steps/interactive-steps.liquid",
    "sections/interactive-steps.liquid",
  ],
  [
    "section-library/banners/editorial-triptych/editorial-triptych.liquid",
    "sections/editorial-triptych.liquid",
  ],
  [
    "section-library/storytelling/marquee-showcase/marquee-showcase.liquid",
    "sections/marquee-showcase.liquid",
  ],
  [
    "section-library/collections/collection-list-carousel/collection-list-carousel.liquid",
    "sections/collection-list-carousel.liquid",
  ],
  [
    "section-library/banners/hero/full-frame-media/full-frame-media.liquid",
    "sections/image-banner.liquid",
  ],
  [
    "section-library/collections/collection-list-editorial/collection-list-editorial.liquid",
    "sections/collection-list-editorial.liquid",
  ],
  [
    "section-library/banners/slideshow-inset/slideshow-inset.liquid",
    "sections/slideshow-inset.liquid",
  ],
  [
    "section-library/collections/collection-list-material-cards/collection-list-material-cards.liquid",
    "sections/collection-list-material-cards.liquid",
  ],
  [
    "section-library/text/icons-with-text/icons-with-text.liquid",
    "sections/icons-with-text.liquid",
  ],
  ["section-library/storytelling/events-list/events-list.liquid", "sections/events-list.liquid"],
  [
    "section-library/products/comparison-table/comparison-table.liquid",
    "sections/comparison-table.liquid",
  ],
  [
    "section-library/storytelling/image-compare/image-compare.liquid",
    "sections/image-compare.liquid",
  ],
  [
    "section-library/collections/collection-list-bento/collection-list-bento.liquid",
    "sections/collection-list-bento.liquid",
  ],
  [
    "section-library/banners/layered-slideshow/layered-slideshow.liquid",
    "sections/layered-slideshow.liquid",
  ],
  [
    "section-library/text/quotes-carousel/quotes-carousel.liquid",
    "sections/quotes-carousel.liquid",
  ],
  [
    "section-library/products/featured-product/featured-product.liquid",
    "sections/featured-product.liquid",
  ],
  [
    "section-library/text/rich-text/editorial-centered/rich-text.liquid",
    "sections/rich-text.liquid",
  ],
  ["section-library/text/faq/lifestyle-media/lifestyle-media.liquid", "sections/faq.liquid"],
  [
    "section-library/banners/slideshow-full-frame/embla-carousel/embla-carousel.liquid",
    "sections/slideshow.liquid",
  ],
];
const errors = [];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function fingerprint(paths) {
  const hash = createHash("sha256");
  for (const path of paths.sort())
    hash.update(`${relative(root, path)}\0${readFileSync(path, "utf8")}\0`);
  return hash.digest("hex");
}

function normalize(source) {
  return source.replace(/\{%- comment -%\}[\s\S]*?\{%- endcomment -%\}/, "").trim();
}

for (const [libraryFile, installedFile] of mirrors) {
  const libraryPath = join(root, libraryFile);
  const installedPath = join(root, installedFile);
  if (!existsSync(libraryPath) || !existsSync(installedPath)) {
    errors.push(`missing mirror: ${libraryFile} ↔ ${installedFile}`);
    continue;
  }
  if (
    normalize(readFileSync(libraryPath, "utf8")) !== normalize(readFileSync(installedPath, "utf8"))
  ) {
    errors.push(`library drift: ${libraryFile} ↔ ${installedFile}`);
  }
  const libraryStat = statSync(libraryPath);
  const installedStat = statSync(installedPath);
  if (libraryStat.dev !== installedStat.dev || libraryStat.ino !== installedStat.ino) {
    errors.push(`mirror is not hardlinked: ${libraryFile} ↔ ${installedFile}; run bun run sync`);
  }

  const packageDir = dirname(libraryPath);
  const variant = basename(libraryFile, ".liquid");
  for (const required of [`${variant}-readme.md`, "usage.md", "psychology.md"]) {
    if (!existsSync(join(packageDir, required)))
      errors.push(`missing package documentation: ${dirname(libraryFile)}/${required}`);
  }
  const hasVisual = readdirSync(packageDir).some((file) =>
    /^(image\.(png|jpe?g|webp)|screenshot.*\.(png|jpe?g|webp|svg))$/i.test(file)
  );
  if (!hasVisual)
    errors.push(`missing package visual: ${dirname(libraryFile)}/image.png or screenshot`);
}

const registeredLibraryFiles = new Set(mirrors.map(([libraryFile]) => libraryFile));
for (const path of walk(join(root, "section-library")).filter((file) => file.endsWith(".liquid"))) {
  const libraryFile = relative(root, path);
  if (!registeredLibraryFiles.has(libraryFile))
    errors.push(`unregistered library implementation: ${libraryFile}`);
}

const usageManifestPath = join(root, "section-library/.usage-manifest.json");
if (!existsSync(usageManifestPath)) {
  errors.push("missing generated usage manifest; run node scripts/generate-section-usage.mjs");
} else {
  const manifest = JSON.parse(readFileSync(usageManifestPath, "utf8"));
  const sourcePaths = [
    ...mirrors.map(([libraryFile]) => join(root, libraryFile)),
    ...readdirSync(join(root, "blocks"))
      .filter((file) => file.endsWith(".liquid"))
      .map((file) => join(root, "blocks", file)),
    join(root, "scripts/generate-section-usage.mjs"),
  ];
  const usagePaths = mirrors.map(([libraryFile]) => join(root, dirname(libraryFile), "usage.md"));
  if (
    manifest.sourceHash !== fingerprint(sourcePaths) ||
    manifest.usageHash !== fingerprint(usagePaths)
  ) {
    errors.push(
      "generated usage documentation is stale; run node scripts/generate-section-usage.mjs"
    );
  }
}

if (errors.length) {
  console.error(`Section-library validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Section-library validation passed for ${mirrors.length} mirrored section(s).`);
