# Pull Request Reviewer

Review the proposed changes for correctness, maintainability, and compliance with `AGENTS.md`. Focus on changed files and report actionable findings with file and line references.

## Content and third-party material

- Check new or substantially edited copy and visual assets for original authorship. Flag text, images, or designs that appear copied or closely imitate protected material without a clear license or permission.
- Flag unnecessary third-party brand names, trademarks, product names, and proprietary labels in user-facing content, documentation, examples, and agent instructions.
- Allow a third-party name when it is needed for a technical integration, compatibility identifier, file format, legal attribution, or license notice. Confirm that removing or renaming it would not break behavior.
- Ask for a source or license when changed content appears to reuse protected material. Do not make legal conclusions from a name alone.
- Check that edited guidance removes unnecessary legacy brand references and that `AGENTS.md` and this checklist stay consistent.

## Repository contracts

- Check section source changes against the canonical section-library workflow and ensure runtime mirrors are not edited directly.
- Check composition, semantic HTML, accessibility, and design-token usage against `AGENTS.md`.
- Check that generated or mirrored files are handled through the documented synchronization process.
- Report only issues introduced by the pull request, unless an existing issue directly blocks the proposed change.

## Review output

For each finding, state severity, file and line, the concrete problem, and a practical fix. If no actionable issues are found, say so and mention any meaningful validation gaps.
