import { existsSync, linkSync, readFileSync, renameSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const options = new Set(process.argv.slice(2));
const checkOnly = options.has("check") || options.has("--check");
if (options.has("help") || options.has("--help")) {
  console.log(
    "Usage: bun run sync [check]\n\n  bun run sync        Create or repair runtime hardlinks\n  bun run sync check  Verify hardlinks without changing files"
  );
  process.exit(0);
}
const unknownOptions = [...options].filter((option) => !["check", "--check"].includes(option));
if (unknownOptions.length) {
  console.error(`Unknown sync option(s): ${unknownOptions.join(", ")}. Run bun run sync help.`);
  process.exit(2);
}
const registrySource = readFileSync(join(root, "scripts/validate-section-library.mjs"), "utf8");
const mirrors = [
  ...registrySource.matchAll(
    /\[\s*['"](section-library\/[^'"]+\.liquid)['"]\s*,\s*['"]([^'"]+\.liquid)['"],?\s*\]/g
  ),
].map((match) => [match[1], match[2]]);
const errors = [];
let linked = 0;

for (const [libraryFile, runtimeFile] of mirrors) {
  const libraryPath = join(root, libraryFile);
  const runtimePath = join(root, runtimeFile);

  if (!existsSync(libraryPath)) {
    errors.push(`missing canonical library file: ${libraryFile}`);
    continue;
  }

  const libraryStat = statSync(libraryPath);
  const runtimeExists = existsSync(runtimePath);
  const runtimeStat = runtimeExists ? statSync(runtimePath) : null;
  if (runtimeStat && libraryStat.dev === runtimeStat.dev && libraryStat.ino === runtimeStat.ino)
    continue;

  if (checkOnly) {
    errors.push(
      `${runtimeExists ? "not hardlinked" : "missing runtime file"}: ${libraryFile} ↔ ${runtimeFile}`
    );
    continue;
  }

  const runtimeDevice = runtimeStat?.dev || statSync(dirname(runtimePath)).dev;
  if (libraryStat.dev !== runtimeDevice) {
    errors.push(`different filesystems cannot be hardlinked: ${libraryFile} ↔ ${runtimeFile}`);
    continue;
  }

  const temporaryPath = join(
    dirname(runtimePath),
    `.${basename(runtimePath)}.hardlink-${process.pid}`
  );
  linkSync(libraryPath, temporaryPath);
  renameSync(temporaryPath, runtimePath);

  const installedStat = statSync(runtimePath);
  if (installedStat.dev !== libraryStat.dev || installedStat.ino !== libraryStat.ino) {
    errors.push(`hardlink verification failed: ${libraryFile} ↔ ${runtimeFile}`);
  } else {
    linked += 1;
  }
}

if (errors.length) {
  console.error(`Section hardlink operation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `${checkOnly ? "Verified" : "Synchronized"} ${mirrors.length} section-library mirror(s)${checkOnly ? "" : ` (${linked} linked or replaced)`}.`
);
