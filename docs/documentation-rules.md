# Documentation Rules

These rules apply to automated documentation updates from Compass, Claude, Codex, and other agents.

## Scope

- Update documentation only when the PR changes user-facing behavior, setup steps, environment variables, API contracts, generated-client workflow, CI behavior, release process, or agent automation.
- Keep docs changes scoped to the files affected by the PR.
- Do not rewrite unrelated sections, reformat whole files, or make broad copy edits.
- Do not document implementation details that are likely to churn unless they affect developer workflow or app behavior.

## Source of Truth

- Use the PR diff as the primary source.
- Verify commands, filenames, environment variables, and routes against the repository before writing them.
- Treat `docs/openapi.json` as the committed API contract snapshot.
- Treat `src/api/generated/` as generated output; never instruct contributors to edit it by hand.
- Preserve existing project conventions from `AGENTS.md`, `CLAUDE.md`, and README.

## Style

- Write concise Markdown with practical instructions.
- Prefer exact commands and paths over prose-only explanations.
- Use fenced code blocks for commands and examples.
- Keep headings stable when possible so links do not break.
- Use present tense and avoid speculative language.
- Do not add marketing language, emojis, or large tutorial sections unless the PR specifically adds a new workflow that needs them.

## Required Checks Before Committing Docs

- Confirm every referenced file exists, unless the documentation is intentionally introducing it.
- Confirm every command uses the repo package manager, `pnpm`, unless documenting an external tool that requires another command.
- Confirm links to local docs match real paths.
- If no docs update is needed, leave documentation unchanged.
