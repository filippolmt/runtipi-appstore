# Spec: renovate-automerge

## ADDED Requirements

### Requirement: Renovate keeps managing branches after the tipi_version bump commit
Renovate SHALL continue to rebase, update, and automerge its branches after the `update-tipi-version` workflow pushes the `tipi_version` bump commit. The bump commit author MUST be listed in `gitIgnoredAuthors` in `renovate.json` so the branch is never marked as "edited/blocked".

#### Scenario: Bump commit does not block the branch
- **WHEN** the `update-tipi-version` workflow pushes a bump commit to a Renovate branch
- **THEN** the Dependency Dashboard does not list the PR under "edited/blocked" and Renovate continues to manage the branch

#### Scenario: Conflicted branch still gets rebased
- **WHEN** a Renovate branch with a bump commit becomes conflicted with `main`
- **THEN** Renovate rebases the branch (per `rebaseWhen: conflicted`) on its next run

### Requirement: Bump commits trigger CI
After pushing the bump commit, the `update-tipi-version` workflow SHALL explicitly dispatch `ci.yml` on the PR branch (`gh workflow run`, exploiting the `workflow_dispatch` exemption from `GITHUB_TOKEN` anti-recursion) so the PR head commit always carries the `ci` status check.

#### Scenario: CI runs on the bump commit
- **WHEN** the workflow pushes the bump commit to a Renovate PR branch
- **THEN** it dispatches `ci.yml` on that branch and the `ci` check run attaches to the bump-commit SHA in the PR's status check rollup

#### Scenario: No dispatch without a push
- **WHEN** the workflow run produces no changes to commit
- **THEN** no CI dispatch happens (the PR head already carries the checks from Renovate's own push)

#### Scenario: No workflow loop
- **WHEN** the bump commit is pushed with `GITHUB_TOKEN`
- **THEN** no `pull_request_target` event fires (anti-recursion), so `update-tipi-version` does not re-run and no further commit is pushed

### Requirement: Eligible PRs merge automatically via GitHub auto-merge
A ruleset on `main` SHALL require the `ci` status check before merging. Renovate's `platformAutomerge` SHALL enable GitHub auto-merge on minor/patch/digest/pin PRs, so they merge (squash) without human action once `ci` passes.

#### Scenario: Minor update merges itself
- **WHEN** Renovate opens a minor/patch/digest update PR and `ci` passes on the head commit
- **THEN** GitHub auto-merge squash-merges the PR with no human interaction

#### Scenario: Major update stays manual
- **WHEN** Renovate opens a major update PR
- **THEN** the PR is labeled `major`, auto-merge is not enabled, and the PR waits for human review

#### Scenario: Red CI blocks the merge
- **WHEN** `ci` fails on a Renovate PR head commit
- **THEN** the PR remains open and unmerged, visible in the Dependency Dashboard

### Requirement: Existing automation can still push to main
Workflows that legitimately push to `main` SHALL continue to work after the ruleset is enforced, via ruleset bypass actors where needed. README freshness SHALL be maintained by the `update-tipi-version` workflow (regeneration per Renovate PR); the standalone weekly README workflow is removed.

#### Scenario: README stays fresh without the weekly workflow
- **WHEN** a Renovate PR changes any app
- **THEN** the bump commit includes the regenerated README, so `main` is up to date after merge

### Requirement: Dependency Dashboard free of self-inflicted rate limiting
`renovate.json` SHALL set `prHourlyLimit` to 0 so the Dependency Dashboard never shows a "rate-limited" section caused by repo config.

#### Scenario: Burst of updates creates all PRs
- **WHEN** more than 20 dependency updates are pending in the same hour
- **THEN** Renovate opens all PRs without listing any as rate-limited on the dashboard
