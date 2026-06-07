# Proposal: fix-renovate-automerge

## Why

Renovate is configured with `automerge: true` + `platformAutomerge: true` for minor/patch/digest updates, but every PR is still merged manually (verified: `mergedBy: filippolmt`, `autoMergeRequest: null` on all recent merged PRs). Three verified bugs break the automerge chain end-to-end, forcing constant manual babysitting of dependency PRs.

## What Changes

- **Bug 1 — Renovate stops managing branches after the bump commit**: `renovate.json` lacks `gitIgnoredAuthors`. The `update-tipi-version.yml` workflow pushes a `tipi_version` bump commit as `github-actions[bot]`, so Renovate marks the branch as "edited/blocked" and stops rebasing/automerging it. Add `gitIgnoredAuthors` for the bot's email.
- **Bug 2 — Bump commit never gets CI checks**: `update-tipi-version.yml` pushes with `secrets.GITHUB_TOKEN`, which never triggers other workflows (GitHub anti-recursion). The PR's final commit has an empty `statusCheckRollup` (verified on PR #421). Fix: after pushing the bump commit, explicitly dispatch `ci.yml` on the PR branch via `gh workflow run` — `workflow_dispatch` is exempt from the `GITHUB_TOKEN` anti-recursion rule. No secrets, apps, or keys required.
- **Bug 3 — `platformAutomerge` is silently dead**: `main` has no branch protection or ruleset (API returns 404), so GitHub auto-merge cannot be enabled on PRs. Create a ruleset on `main` requiring the `ci` status check.
- **Dashboard noise**: set `prHourlyLimit` from 20 to 0 so the "rate-limited" section disappears from the Dependency Dashboard.
- Major updates stay manual by design (labeled `major`, visible in the Dependency Dashboard — no extra notification channel).

Expected outcome: minor/patch/digest PRs merge automatically as soon as CI is green; manual work shrinks to reviewing `major` PRs and real CI failures.

## Capabilities

### New Capabilities
- `renovate-automerge`: end-to-end automerge pipeline for Renovate dependency PRs — Renovate keeps managing branches after bot bump commits, bump commits trigger CI, and green PRs merge automatically via GitHub auto-merge backed by a `main` ruleset.

### Modified Capabilities

<!-- none — openspec/specs/ is empty, no existing capabilities -->

## Impact

- `renovate.json` — add `gitIgnoredAuthors`, set `prHourlyLimit: 0`, enable `bun` + `github-actions` managers (package.json/bun.lock and workflow action updates)
- `.github/dependabot.yml` — deleted: Renovate covers npm (`bun` manager) and `github-actions`; single update bot, single dashboard, automerge rules apply uniformly
- `.github/workflows/update-tipi-version.yml` — `actions: write` permission, dispatch `ci.yml` on the PR branch after pushing the bump commit
- `.github/workflows/ci.yml` — add `workflow_dispatch` trigger (no job changes)
- `.github/workflows/readme-generator.yml` — deleted (redundant: README regenerated per Renovate PR; its `GITHUB_TOKEN` PRs could never pass the required `ci` check post-ruleset)
- GitHub repo settings — new ruleset on `main` (required status check `ci`); no repo secrets needed
- No application/app-definition code affected; CI workflow (`ci.yml`) unchanged
- Risk: with automerge live, a bad upstream image that passes lint/tests merges without human review — acceptable for an appstore repo (CI validates schema/config, not runtime behavior)
