# Compass PR Automation

The `Compass Docs` workflow uses Gemini through `AI_PROVIDER=gemini`, the
`gemini-2.5-flash` model, and the `GEMINI_API_KEY` repository secret.

## Documentation Updates

The `Compass Docs` workflow runs on pull requests from this repository **when they are labeled with `compass`**. It asks Compass to inspect the PR diff and update documentation.

Documentation updates must follow `docs/documentation-rules.md`.

Use docs automation when a PR changes setup, environment variables, API contracts, generated-client workflow, CI behavior, release process, user-facing behavior, or agent automation.

Do not use it for purely internal refactors that do not change documented behavior.
