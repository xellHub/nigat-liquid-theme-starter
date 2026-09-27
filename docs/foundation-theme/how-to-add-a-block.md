# How to add a theme block

1. Decide whether the component is an atom, a reusable composite, or a context-specific composite. Do not create a block for internal plumbing that merchants never edit.
2. Add one `.liquid` file to `blocks/`. Prefix context-specific children with `_` and explicitly allow them only in the parent section or block that needs them.
3. Keep every setting local to `block.settings`. Use token-backed selects for appearance choices instead of raw brand values.
4. If the block nests children, add `{% content_for 'blocks' %}` and a curated `blocks` schema allow-list. Use `@theme` only when broad composition is intentional.
5. Add at least one complete preset. Composite presets should include sensible child blocks so merchants never start with an unexplained empty shell.
6. When using `"tag": null`, render one root element with the required editor-selection attributes.
7. Check that arbitrary allowed child order still reads logically.
8. Run:

   ```bash
   node scripts/generate-section-usage.mjs
   node scripts/validate-json.mjs
   node scripts/validate-palettes.mjs
   node scripts/validate-tokens.mjs
   node scripts/validate-section-library.mjs
   node scripts/validate-theme-layers.mjs
   bun run check
   ```

Avoid reading `section.settings`, exposing a setting that belongs to a child, nesting beyond eight levels, or splitting one understandable control into several tiny blocks.
