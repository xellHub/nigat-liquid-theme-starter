import { spawnSync } from "node:child_process";
import {
  cp,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, extname, join, parse } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { minify as minifyCss } from "csso";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDirectory = join(projectRoot, "dist");
const settingsSchemaPath = join(projectRoot, "config", "settings_schema.json");
const themeDirectories = [
  "assets",
  "blocks",
  "config",
  "layout",
  "listings",
  "locales",
  "sections",
  "snippets",
  "templates",
];

async function listCodeAssets(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const assets = [];

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      assets.push(...(await listCodeAssets(entryPath)));
    } else if (entry.isFile() && [".css", ".js"].includes(extname(entry.name))) {
      assets.push(entryPath);
    }
  }

  return assets;
}

function runBunBuild(args, cwd) {
  const result = spawnSync("bun", args, { cwd, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Bun asset minification failed (exit code ${result.status ?? "unknown"}).`);
  }
}

async function minifyAssets(directory) {
  for (const assetPath of await listCodeAssets(directory)) {
    if (extname(assetPath) === ".css") {
      const source = await readFile(assetPath, "utf8");
      const result = minifyCss(source, { restructure: false });
      await writeFile(assetPath, result.css);
      continue;
    }

    const { dir, name, ext } = parse(assetPath);
    const minifiedPath = join(dir, `${name}.min${ext}`);

    runBunBuild(
      ["build", assetPath, "--no-bundle", "--minify", "--outfile", minifiedPath],
      projectRoot
    );
    await rename(minifiedPath, assetPath);
  }
}

const settingsSchema = JSON.parse(await readFile(settingsSchemaPath, "utf8"));
const themeInfo = settingsSchema.find((entry) => entry.name === "theme_info");

if (!themeInfo?.theme_name || !themeInfo?.theme_version) {
  throw new Error("config/settings_schema.json must define theme_name and theme_version.");
}

const archiveName = `${themeInfo.theme_name}-${themeInfo.theme_version}.zip`;
const outputPath = join(outputDirectory, archiveName);
const stagingParent = await mkdtemp(join(tmpdir(), "nigat-theme-build-"));
const stagingDirectory = join(stagingParent, "theme");

await mkdir(outputDirectory, { recursive: true });
await mkdir(stagingDirectory);

try {
  for (const directory of themeDirectories) {
    await cp(join(projectRoot, directory), join(stagingDirectory, directory), {
      recursive: true,
      force: true,
    }).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
  }

  await copyFile(join(projectRoot, ".shopifyignore"), join(stagingDirectory, ".shopifyignore"));
  await minifyAssets(join(stagingDirectory, "assets"));

  const result = spawnSync("shopify", ["theme", "package", "--path", stagingDirectory], {
    cwd: stagingDirectory,
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
  } else {
    await copyFile(join(stagingDirectory, archiveName), outputPath);
    console.log(`Theme package created at ${outputPath}`);
  }
} finally {
  await rm(stagingParent, { recursive: true, force: true });
}
