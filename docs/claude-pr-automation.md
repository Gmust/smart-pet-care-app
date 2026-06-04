# Claude/Compass PR Automation

The Compass workflows use Claude through `AI_PROVIDER=claude` and the `ANTHROPIC_API_KEY` repository secret.

## Documentation Updates

The `Compass Docs` workflow runs on pull requests from this repository. It asks Compass to inspect the PR diff and update documentation.

Documentation updates must follow `docs/documentation-rules.md`.

Use docs automation when a PR changes setup, environment variables, API contracts, generated-client workflow, CI behavior, release process, user-facing behavior, or agent automation.

Do not use it for purely internal refactors that do not change documented behavior.
