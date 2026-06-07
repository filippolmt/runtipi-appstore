# Design: fix-renovate-automerge

## Context

Renovate (Mend hosted, community tier) opens dependency PRs. The `update-tipi-version.yml` workflow (trigger: `pull_request_target`) pushes a follow-up commit to each Renovate branch that bumps `tipi_version`/`updated_at` and regenerates the README. The intended flow is: Renovate PR → bump commit → CI green → automerge. Today the chain breaks at three points:

```
Renovate PR ──▶ bump commit (github-actions[bot], GITHUB_TOKEN)
                  │
                  ├─✗ GITHUB_TOKEN push never triggers ci.yml → last commit has no checks
                  ├─✗ foreign-author commit → Renovate marks branch "edited", stops managing it
                  └─✗ main has no ruleset → GitHub auto-merge cannot be enabled
                  ▼
              manual merge (every PR)
```

Constraints:
- Mend hosted community tier: no control over Renovate run scheduling; config changes only via `renovate.json`.
- No usable GitHub App credentials: App creation/private-key download are web-UI-only, and the repo has zero Actions secrets — drove D2 toward a secret-less solution.
- CI job name is `ci` (from `.github/workflows/ci.yml`, job id `ci`).

## Goals / Non-Goals

**Goals:**
- Minor/patch/digest Renovate PRs merge automatically once CI is green, zero human action.
- Renovate keeps rebasing/updating branches after the bot bump commit.
- Dependency Dashboard stays the single manual touchpoint (major PRs, failures).

**Non-Goals:**
- No notification channels (Telegram/mail/issues) for major PRs.
- No migration off the Mend hosted app (no self-hosted Renovate runner).
- No change to what gets automerged (major still manual; db images still pinned/disabled).
- No changes to `ci.yml` test content.

## Decisions

### D1 — `gitIgnoredAuthors` over splitting the bump into a separate PR
Add to `renovate.json`:
```json
"gitIgnoredAuthors": ["github-actions[bot]@users.noreply.github.com"]
```
Renovate then treats the bump commit as its own and keeps managing the branch (rebase, automerge). Alternative considered: have the workflow amend Renovate's commit or open a separate PR — more moving parts, breaks `rebaseWhen: conflicted`, rejected.

The email must match what the workflow sets in `git config user.email` (`github-actions[bot]@users.noreply.github.com`).

### D2 — workflow_dispatch chain over GitHub App token / deploy key / PAT
Keep pushing the bump commit with `secrets.GITHUB_TOKEN`, then explicitly dispatch CI on the PR branch: `gh workflow run ci.yml --ref <head_ref>` (job permission `actions: write`; `ci.yml` gains a `workflow_dispatch` trigger). `workflow_dispatch`/`repository_dispatch` are the documented exemptions to the `GITHUB_TOKEN` anti-recursion rule, so the dispatched run executes and attaches the `ci` check run to the bump-commit SHA — exactly where the ruleset looks for it.

Alternatives rejected:
- GitHub App installation token — App creation and private-key download are web-UI-only (not automatable); two secrets to manage. The Mend-hosted Renovate App's key is not available to the repo owner.
- Deploy key (SSH push) — automatable but adds a write-capable key + secret to custody.
- Fine-grained PAT — expires, tied to a person, web-UI-only.

Constraint: the `workflow_dispatch` trigger must exist in `ci.yml` on the PR branch — true for every Renovate branch created after this change merges.

Note: the bump commit author stays `github-actions[bot]@users.noreply.github.com`, matching `gitIgnoredAuthors` (D1).

### D3 — Ruleset over classic branch protection
Create a repository ruleset on `main`:
- require status check `ci` to pass before merge
- require a pull request before merging (audit result: no workflow pushes to `main` directly; `readme-generator.yml` was deleted as redundant — README is regenerated per Renovate PR by `update-tipi-version.yml`; Repository-admin bypass added so the owner is never locked out)

With merges blocked on checks, GitHub auto-merge becomes available and Renovate's `platformAutomerge: true` starts working: Renovate flips auto-merge on at PR creation, GitHub merges when `ci` is green. Alternative: Renovate-side automerge without platform support — depends on Mend run cadence (slow, hours of latency); rejected.

### D4 — `prHourlyLimit: 0`
With 24 dependencies the limit (20/h) adds dashboard noise ("rate-limited" section) without protecting anything. Set to 0 (unlimited). `prConcurrentLimit`/`branchConcurrentLimit` already 0.

## Risks / Trade-offs

- [Ruleset blocks existing automation pushing to `main` (e.g. `readme-generator.yml`)] → audit workflows that push to `main`; add bypass actor (the GitHub App or `github-actions`) to the ruleset before enforcing.
- [Bump-commit push re-triggers `update-tipi-version.yml` (`synchronize`) → loop] → impossible by construction: the push uses `GITHUB_TOKEN`, which raises no `pull_request`/`pull_request_target` events at all. Only the explicitly dispatched `ci.yml` runs. (Belt-and-braces: even if the event fired, the `github.actor == 'renovate[bot]'` job guard would skip the run. The changed-files filter does NOT guard the loop — `base...HEAD` still contains Renovate's compose change, and `update-config.ts` is not idempotent.)
- [Automerged bad upstream release lands in the store] → CI validates schema/lint only; accepted trade-off, same trust level as today's rubber-stamp manual merges.
- [`pull_request_target` + App token = elevated credentials on fork PRs] → job already gated by `github.actor == 'renovate[bot]'`; keep that guard, do not widen it.
- [Mend community tier run cadence delays PR creation] → out of scope; automerge removes the human latency, which dominates.

## Migration Plan

1. Merge config + workflow changes (this change). No secrets needed.
2. Create ruleset on `main` (done during apply: `main-require-ci`, id 17365556, admin bypass).
3. Watch the next Renovate PR end-to-end; if automerge fails, dashboard + PR timeline show why (rollback: disable ruleset, revert workflow dispatch change).

## Open Questions

- ~~Exact GitHub App in use and its bot identity/email~~ Moot: D2 switched to the workflow_dispatch chain, no App involved; commit author stays `github-actions[bot]`, consistent with D1.
- ~~Does `readme-generator.yml` push directly to `main`?~~ Resolved: it opened PRs (no direct push) and was deleted as redundant.
