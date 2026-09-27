import { describe, test, expect } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { auditSource, auditTheme } from "./lint-atomic-composition.mjs";

const liquid = (body, schema) => `${body}\n{% schema %}${JSON.stringify(schema)}{% endschema %}`;
const rules = (file, body, schema, kind) =>
  auditSource(file, liquid(body, schema), kind).findings.map((f) => f.rule);
const container = { blocks: [{ type: "heading" }], settings: [] };

describe("atomic composition boundaries", () => {
  test("accepts a composed container and a terminal atom", () => {
    expect(rules("blocks/group.liquid", "{% content_for 'blocks' %}", container)).toEqual([]);
    expect(
      rules("blocks/heading.liquid", "<h2>{{ block.settings.text }}</h2>", {
        settings: [{ type: "text", id: "text" }],
      })
    ).toEqual([]);
  });
  test("does not exempt resource layouts or accordion copy", () => {
    for (const name of [
      "_shipping-rates-content",
      "_main-404-content",
      "_comparison-row",
      "accordion-item",
    ]) {
      expect(
        rules(`blocks/${name}.liquid`, "<div>Copy</div>", {
          settings: [{ type: "text", id: "feature_name" }],
        })
      ).toEqual(["CONTENT", "COMPOSITION"]);
    }
  });
  test("distinguishes structural text from editable copy by type", () => {
    expect(
      rules("blocks/card.liquid", "{% content_for 'blocks' %}", {
        ...container,
        settings: [
          { type: "text", id: "foundation_anchor_id" },
          { type: "text", id: "accessibility_label" },
        ],
      })
    ).toEqual([]);
    expect(
      rules("blocks/card.liquid", "{% content_for 'blocks' %}", {
        ...container,
        settings: [{ type: "richtext", id: "custom_marketing_copy" }],
      })
    ).toContain("CONTENT");
  });
  test("atoms cannot declare even an empty child whitelist", () => {
    expect(rules("blocks/button.liquid", "<button>Buy</button>", { blocks: [] })).toEqual([
      "TERMINAL",
    ]);
    expect(rules("blocks/heading.liquid", "{% content_for 'blocks' %}", container)).toContain(
      "TERMINAL"
    );
  });
  test("bundle controls remain a terminal product selector", () => {
    expect(
      rules("blocks/bundle-item-controls.liquid", '<select aria-label="Variant"></select>', {
        settings: [{ type: "product", id: "product" }],
      })
    ).toEqual([]);
    expect(
      rules("blocks/bundle-item-controls.liquid", "{% content_for 'blocks' %}", {
        blocks: [{ type: "heading" }],
        settings: [{ type: "product", id: "product" }],
      })
    ).toContain("TERMINAL");
  });
  test("comments and scripts cannot satisfy the slot requirement", () => {
    const body =
      "{% comment %}{% content_for 'blocks' %}{% endcomment %}" +
      "<!-- {% content_for 'blocks' %} -->" +
      "<script>const example = `{% content_for 'blocks' %}`;</script>";
    expect(rules("blocks/card.liquid", body, {})).toEqual(["COMPOSITION"]);
  });
  test("enforces explicit dynamic and static whitelists", () => {
    expect(rules("blocks/card.liquid", "{% content_for 'blocks' %}", {})).toContain("WHITELIST");
    expect(
      rules("blocks/card.liquid", "{% content_for 'blocks' %}", { blocks: [{ type: "@theme" }] })
    ).toContain("WHITELIST");
    expect(
      rules(
        "blocks/card.liquid",
        "{% content_for 'block', type: 'heading', id: 'title' %}",
        container
      )
    ).toEqual([]);
    expect(
      rules(
        "blocks/card.liquid",
        "{% content_for 'block', type: 'button', id: 'action' %}",
        container
      )
    ).toContain("WHITELIST");
  });
  test("resource forms cannot hide inline fields but hidden inputs and actions are allowed", () => {
    const slot = "{% content_for 'blocks' %}";
    expect(
      rules("blocks/_password-resource.liquid", slot + '<input type="password">', container)
    ).toContain("FORM_CONTROLS");
    expect(
      rules(
        "blocks/form.liquid",
        slot + '<input name="note"><select></select><textarea></textarea>',
        container
      )
    ).toContain("FORM_CONTROLS");
    expect(
      rules(
        "blocks/form.liquid",
        slot + '<input type="hidden"><button class="theme-button" type="submit">Send</button>',
        container
      )
    ).toEqual([]);
  });
  test("checks canonical section media settings and missing slots", () => {
    expect(
      rules(
        "section-library/hero/hero.liquid",
        "<section></section>",
        {
          settings: [{ type: "image_picker", id: "image" }],
        },
        "section"
      )
    ).toEqual(["CONTENT", "COMPOSITION"]);
  });
  test("reports invalid or missing schemas instead of silently skipping them", () => {
    for (const source of [
      "<div></div>",
      "{% schema %}{bad}{% endschema %}",
      liquid("", { blocks: null }),
    ]) {
      expect(auditSource("blocks/card.liquid", source).findings[0].rule).toBe("SCHEMA");
    }
  });
});

describe("repository audit and command integration", () => {
  const root = fileURLToPath(new URL("..", import.meta.url));
  test("audits canonical sources and nested preset branches using block definitions", () => {
    const fixture = mkdtempSync(join(tmpdir(), "atomic-composition-test-"));
    try {
      for (const directory of ["blocks", "section-library", "sections"])
        mkdirSync(join(fixture, directory));
      writeFileSync(
        join(fixture, "blocks/_shipping-rates-content.liquid"),
        liquid("<div>Rates</div>", {})
      );
      writeFileSync(
        join(fixture, "blocks/group.liquid"),
        liquid("{% content_for 'blocks' %}", {
          blocks: [{ type: "_shipping-rates-content" }],
        })
      );
      const section = liquid("{% content_for 'blocks' %}", {
        blocks: [{ type: "group" }],
        presets: [
          {
            name: "Example",
            blocks: [{ type: "group", blocks: [{ type: "_shipping-rates-content" }] }],
          },
        ],
      });
      writeFileSync(join(fixture, "section-library/example.liquid"), section);
      writeFileSync(join(fixture, "sections/example.liquid"), section);
      const result = auditTheme(fixture);
      expect(result.counts["section-library"]).toBe(1);
      expect(
        result.findings.some(
          (f) => f.file === "blocks/_shipping-rates-content.liquid" && f.rule === "COMPOSITION"
        )
      ).toBe(true);
      expect(result.findings.filter((f) => f.rule === "PRESET")).toHaveLength(2);
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });
  test("audit succeeds, strict fails, and strict takes precedence", () => {
    const strictStatus = auditTheme(root).findings.length ? 1 : 0;
    for (const [args, status] of [
      [["--audit"], 0],
      [["--strict"], strictStatus],
      [["--audit", "--strict"], strictStatus],
    ]) {
      const result = spawnSync(process.execPath, ["scripts/lint-atomic-composition.mjs", ...args], {
        cwd: root,
        encoding: "utf8",
      });
      expect(result.status).toBe(status);
      expect(result.stdout).toContain("No files changed.");
      expect(result.stderr).toBe("");
    }
  });
});
