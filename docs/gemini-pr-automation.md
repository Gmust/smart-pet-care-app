# Gemini PR Automation

This repository includes a GitHub-based Gemini workflow for pull request documentation upkeep.

## What runs automatically

When a pull request has the `gemini:docs` label, the docs update workflow runs when the PR is labeled, reopened, marked ready for review, or updated with new commits.

The workflow file is `.github/workflows/gemini-docs-update.yml`.

## How to have Gemini update docs

If documentation is required, add the `gemini:docs` label to the PR. This label is typically added after checking the documentation impact in `.github/pull_request_template.md`.

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

Then configure branch protection in GitHub to keep human review required for final approval.

## Expected team workflow

1. Open or update a PR.
2. If documentation is needed, either update `docs/` in the PR yourself or add the `gemini:docs` label.
3. Wait for `Gemini Docs Update` to push any generated docs changes.
4. Complete human review and merge.

## Repo context

Gemini reads repository guidance from:

- `GEMINI.md`
- `.github/gemini/docs-update-prompt.md`

Adjust these files if you want documentation behavior to change.
