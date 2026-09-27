import { describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { auditInstalledTheme } from "./audit-installed-theme.mjs";

describe("exported theme audit", () => {
  const fixture = (section) => {
    const root = mkdtempSync(join(tmpdir(), "theme-export-audit-"));
    mkdirSync(join(root, "templates"));
    writeFileSync(join(root, "templates/product.json"), JSON.stringify({ sections: { main: section }, order: ["main"] }));
    return root;
  };

  test("accepts saved settings and static slot order", () => {
    const root = fixture({ type: "main-404", settings: { color_scheme: "bare-light" }, blocks: { content: { type: "_main-404-content", static: true } }, block_order: [] });
    try { expect(auditInstalledTheme(root).findings).toEqual([]); }
    finally { rmSync(root, { recursive: true, force: true }); }
  });

  test("flags stale settings and static block order with migration hints", () => {
    const root = fixture({ type: "main-404", settings: { feature_name: "Old copy" }, blocks: { content: { type: "_main-404-content", static: true } }, block_order: ["content"] });
    try {
      const findings = auditInstalledTheme(root).findings;
      expect(findings.map((item) => item.message)).toContain("Unknown saved setting: feature_name");
      expect(findings.map((item) => item.message)).toContain("Static block appears in block_order");
      expect(findings.find((item) => item.message.includes("feature_name"))?.hint).toContain("comparison row");
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
});
