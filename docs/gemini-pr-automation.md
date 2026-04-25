# Gemini PR Automation

This repository includes a GitHub-based Gemini workflow for pull request review and documentation upkeep.

## What runs automatically

When a non-draft pull request is opened, reopened, marked ready for review, or updated:

- GitHub Actions runs Gemini review
- Gemini reviews only the PR diff
- Gemini posts or updates a PR comment with:
  - a verdict
  - concrete findings
  - whether documentation updates are required
  - the recommended target path in `docs/`

The workflow file is `.github/workflows/gemini-pr-review.yml`.

## How to have Gemini update docs

If the review says documentation is required, add the `gemini:docs` label to the PR.

That triggers `.github/workflows/gemini-docs-update.yml`, which:

- checks out the PR head branch
- runs Gemini against the PR diff
- updates files under `docs/`
- updates `README.md` only when onboarding or workflow docs should change
- commits and pushes the documentation changes back to the PR branch

For safety, the docs update workflow only runs for pull requests whose source branch lives in this repository. It does not push to forks.

## Required GitHub setup

Add this repository secret before enabling the workflows:

- `GEMINI_API_KEY`

The official Google action also recommends ignoring local Gemini state files:

- `.gemini/`
- `gha-creds-*.json`

Then configure branch protection in GitHub:

- require the `Gemini PR Review` workflow to pass before merge
- keep human review required for final approval

## Expected team workflow

1. Open or update a PR.
2. Wait for the `Gemini PR Review` comment.
3. Address any findings.
4. If documentation is needed, either update `docs/` in the PR yourself or add the `gemini:docs` label.
5. Complete human review and merge.

## Repo context

Gemini reads repository guidance from:

- `GEMINI.md`
- `.github/gemini/pr-review-prompt.md`
- `.github/gemini/docs-update-prompt.md`

Adjust these files if you want review or documentation behavior to change.
