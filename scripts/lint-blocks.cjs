#!/usr/bin/env node
/**
 * lint-blocks — flags sections/blocks that are built from hardcoded markup
 * instead of composed from theme blocks.
 *
 * Rules:
 *   no-blocks-slot        (error)   Section has neither `{% content_for 'blocks' %}`
 *                                   nor a `{% for x in section.blocks %}` loop, AND
 *                                   its {% schema %} declares no "blocks" array.
 *   hardcoded-content      (warn)   A content tag (h1-h6, p, blockquote, button, a,
 *                                   figcaption) outside any blocks scope contains
 *                                   literal text with zero Liquid output anywhere
 *                                   in its subtree.
 *   hardcoded-content-mixed(info)   Same, but the subtree DOES contain some Liquid
 *                                   output too — partially hardcoded, lower confidence.
 *   hardcoded-media         (warn) An <img>/<source> outside any blocks scope has a
 *                                   literal `src` with no Liquid interpolation.
 *
 * Suppress a single node with a comment on the line above it:
 *   <!-- lint-disable-next-line hardcoded-content -->
 *   {% comment %} lint-disable-next-line hardcoded-content {% endcomment %}
 *
 * Usage:
 *   node lint-blocks.js <dir-or-file> [...more] [--json] [--tags a,button] [--ignore-empty-schema]
 */

const fs = require("fs");
const path = require("path");
const { toLiquidHtmlAST } = require("@shopify/liquid-html-parser");

const DEFAULT_CONTENT_TAGS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "blockquote",
  "button",
  "a",
  "figcaption",
];
const MEDIA_TAGS = ["img", "source"];
const MEDIA_ATTR = { img: "src", source: "srcset" };

function parseArgs(argv) {
  const opts = { paths: [], json: false, contentTags: new Set(DEFAULT_CONTENT_TAGS) };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") opts.json = true;
    else if (a === "--tags")
      opts.contentTags = new Set(
        argv[++i]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      );
    else opts.paths.push(a);
  }
  if (opts.paths.length === 0) opts.paths = ["sections", "blocks"];
  return opts;
}

function collectLiquidFiles(inputPaths) {
  const files = [];
  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const stat = fs.statSync(dir);
    if (stat.isFile()) {
      if (dir.endsWith(".liquid")) files.push(dir);
      return;
    }
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      const s = fs.statSync(full);
      if (s.isDirectory()) walkDir(full);
      else if (entry.endsWith(".liquid")) files.push(full);
    }
  }
  inputPaths.forEach(walkDir);
  return files;
}

function elementName(node) {
  if (typeof node.name === "string") return node.name;
  return (node.name || [])
    .map((seg) => (seg.type === "TextNode" ? seg.value : "{{liquid}}"))
    .join("");
}

function attrName(attr) {
  return (attr.name || [])
    .map((seg) => (seg.type === "TextNode" ? seg.value : "{{liquid}}"))
    .join("");
}

function isHardcodedAttrValue(attr) {
  const val = attr.value || [];
  if (val.length === 0) return false;
  return val.every((v) => v.type === "TextNode");
}

function subtreeHasLiquidOutput(node) {
  let found = false;
  (function rec(n) {
    if (found || !n || typeof n !== "object") return;
    if (n.type === "LiquidVariableOutput") {
      found = true;
      return;
    }
    if (n.type === "LiquidTag" && ["echo", "render", "include"].includes(n.name)) {
      found = true;
      return;
    }
    if (Array.isArray(n.children)) n.children.forEach(rec);
  })(node);
  return found;
}

function subtreeHardcodedTexts(node) {
  const texts = [];
  (function rec(n) {
    if (!n || typeof n !== "object") return;
    if (n.type === "TextNode" && n.value.trim().length > 0) texts.push(n.value.trim());
    if (Array.isArray(n.children)) n.children.forEach(rec);
  })(node);
  return texts;
}

function lineCol(source, offset) {
  let line = 1,
    col = 1;
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === "\n") {
      line++;
      col = 1;
    } else col++;
  }
  return { line, col };
}

function isIgnoreComment(node) {
  if (!node) return false;
  if (node.type === "HtmlComment") return /lint-disable-next-line/.test(node.body);
  if (node.type === "LiquidRawTag" && node.name === "comment") {
    const text = node.body && node.body.value ? node.body.value : "";
    return /lint-disable-next-line/.test(text);
  }
  return false;
}

function extractSchema(ast) {
  let schemaNode = null;
  (function rec(n) {
    if (schemaNode || !n || typeof n !== "object") return;
    if (n.type === "LiquidRawTag" && n.name === "schema") {
      schemaNode = n;
      return;
    }
    if (Array.isArray(n.children)) n.children.forEach(rec);
  })(ast);
  if (!schemaNode) return { present: false };
  try {
    const json = JSON.parse(schemaNode.body.value);
    return { present: true, json, node: schemaNode };
  } catch (e) {
    return { present: true, parseError: e.message, node: schemaNode };
  }
}

function isInBlocksDir(filePath) {
  const norm = filePath.split(path.sep).join("/");
  return /(^|\/)blocks\//.test(norm) || norm.startsWith("blocks/");
}

function lintFile(filePath, opts) {
  const source = fs.readFileSync(filePath, "utf8");
  let ast;
  try {
    ast = toLiquidHtmlAST(source);
  } catch (e) {
    return { file: filePath, parseError: e.message, violations: [] };
  }

  const ctx = { hasBlocksLoop: false, hasContentForBlocks: false, violations: [] };

  function report(node, rule, severity, message) {
    const { line, col } = lineCol(source, node.position.start);
    const snippet = source
      .slice(node.position.start, Math.min(node.position.end, node.position.start + 80))
      .replace(/\s+/g, " ")
      .trim();
    ctx.violations.push({ rule, severity, line, col, message, snippet });
  }

  function visitChildren(children, state) {
    (children || []).forEach((child, i) => {
      const prev = children[i - 1];
      const suppressThis = isIgnoreComment(prev);
      visit(child, { ...state, suppressThis });
    });
  }

  function visit(node, state) {
    if (!node || typeof node !== "object") return;

    if (node.type === "LiquidTag" && node.name === "for") {
      const markupText = source.slice(node.markupPosition.start, node.markupPosition.end);
      const isBlocksLoop = /\bin\s+(section\.)?blocks\b/.test(markupText);
      if (isBlocksLoop) ctx.hasBlocksLoop = true;
      visitChildren(node.children, { ...state, insideBlocks: state.insideBlocks || isBlocksLoop });
      return;
    }

    if (node.type === "LiquidTag" && node.name === "content_for") {
      const markupText = source.slice(node.markupPosition.start, node.markupPosition.end);
      if (/^\s*['"]blocks['"]/.test(markupText)) ctx.hasContentForBlocks = true;
    }

    const isContentTag = node.type === "HtmlElement" && opts.contentTags.has(elementName(node));
    const isMediaTag =
      (node.type === "HtmlVoidElement" || node.type === "HtmlSelfClosingElement") &&
      MEDIA_TAGS.includes(elementName(node));

    if (!state.insideBlocks && !state.suppressed && !state.suppressThis) {
      if (isMediaTag) {
        const attrKey = MEDIA_ATTR[elementName(node)];
        const srcAttr = (node.attributes || []).find((a) => attrName(a) === attrKey);
        if (srcAttr && isHardcodedAttrValue(srcAttr)) {
          report(
            node,
            "hardcoded-media",
            "warn",
            `<${elementName(node)} ${attrKey}="..."> uses a literal path — should come from a block/setting (image picker), not be baked into the section.`
          );
        }
      }
      if (isContentTag) {
        const hardTexts = subtreeHardcodedTexts(node);
        if (hardTexts.length > 0) {
          const hasLiquidOut = subtreeHasLiquidOutput(node);
          if (hasLiquidOut) {
            report(
              node,
              "hardcoded-content-mixed",
              "info",
              `<${elementName(node)}> mixes literal text ("${hardTexts.join(" / ")}") with dynamic output — the literal part should probably move to a block setting too.`
            );
          } else {
            report(
              node,
              "hardcoded-content",
              "warn",
              `<${elementName(node)}> contains literal text ("${hardTexts.join(" / ")}") with no block/setting backing it — this section can't be re-customized per fork without editing code.`
            );
          }
        }
      }
    }

    const childState = isContentTag ? { ...state, suppressed: true } : state;
    visitChildren(node.children, childState);
  }

  visit(ast, { insideBlocks: false, suppressed: false, suppressThis: false });

  const schema = extractSchema(ast);
  const schemaDeclaresBlocks =
    schema.present &&
    schema.json &&
    Array.isArray(schema.json.blocks) &&
    schema.json.blocks.length > 0;
  const isBlockComposed = ctx.hasBlocksLoop || ctx.hasContentForBlocks || schemaDeclaresBlocks;

  // Atom/composite blocks legitimately have no blocks-of-their-own slot —
  // only enforce no-blocks-slot for files under a `blocks/` directory when
  // they DO try to nest children (i.e. their schema declares blocks but the
  // markup never renders them). Sections always need the check.
  const shouldCheckSlot = !isInBlocksDir(filePath) || schemaDeclaresBlocks;

  if (shouldCheckSlot && !isBlockComposed) {
    ctx.violations.unshift({
      rule: "no-blocks-slot",
      severity: "error",
      line: 1,
      col: 1,
      message: `This section has no {% content_for 'blocks' %}, no {% for x in section.blocks %} loop, and no "blocks" declared in its schema — it isn't block-composed at all.`,
      snippet: "",
    });
  }

  return { file: filePath, violations: ctx.violations, schemaParseError: schema.parseError };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const files = collectLiquidFiles(opts.paths);

  if (files.length === 0) {
    console.error(`No .liquid files found under: ${opts.paths.join(", ")}`);
    process.exit(2);
  }

  const results = files.map((f) => lintFile(f, opts));
  const withIssues = results.filter((r) => r.violations.length > 0 || r.parseError);

  if (opts.json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    let errorCount = 0,
      warnCount = 0,
      infoCount = 0;
    for (const r of withIssues) {
      console.log(`\n${r.file}`);
      if (r.parseError) {
        console.log(`  ✖ parse error: ${r.parseError}`);
        errorCount++;
        continue;
      }
      for (const v of r.violations) {
        const icon = v.severity === "error" ? "✖" : v.severity === "warn" ? "⚠" : "ℹ";
        if (v.severity === "error") errorCount++;
        else if (v.severity === "warn") warnCount++;
        else infoCount++;
        console.log(
          `  ${icon} [${v.rule}] ${r.file.includes(":") ? "" : ""}line ${v.line}:${v.col}`
        );
        console.log(`      ${v.message}`);
        if (v.snippet) console.log(`      → ${v.snippet}`);
      }
    }
    console.log(`\n${files.length} file(s) checked, ${withIssues.length} with issues.`);
    console.log(`${errorCount} error(s), ${warnCount} warning(s), ${infoCount} info.`);
  }

  const hasErrors = results.some(
    (r) => r.parseError || r.violations.some((v) => v.severity === "error")
  );
  process.exit(hasErrors ? 1 : 0);
}

main();
