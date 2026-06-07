# Tasks: fix-renovate-automerge

## 1. Prerequisites (manual / verification)

- [x] 1.1 ~~Identify the installed GitHub App~~ Obsolete: D2 switched to workflow_dispatch chain (App route not automatable — App creation/key download are web-UI-only; Mend's Renovate App key unavailable)
- [x] 1.2 ~~Verify App permissions~~ Obsolete (see 1.1)
- [x] 1.3 ~~Create repo secrets `RENOVATE_APP_ID` / `RENOVATE_APP_PRIVATE_KEY`~~ Obsolete: no secrets needed with workflow_dispatch chain
- [x] 1.4 Audit workflows pushing directly to `main` (check `readme-generator.yml`) — note which need ruleset bypass → none push to main directly; `readme-generator.yml` opened PRs via `peter-evans/create-pull-request` with `GITHUB_TOKEN` (deleted, see 4.4)

## 2. renovate.json

- [x] 2.1 Add `gitIgnoredAuthors` with the bump-commit author email (currently `github-actions[bot]@users.noreply.github.com` — must match what the workflow sets in `git config user.email`; align with 3.3 if changed)
- [x] 2.2 Set `prHourlyLimit` to 0
- [x] 2.3 Run `make renovate-test` and confirm config validates
- [x] 2.4 Add `bun` to `enabledManagers` so Renovate updates `package.json` deps and regenerates `bun.lock` (user request during apply)
- [x] 2.5 Add `github-actions` to `enabledManagers` and delete `.github/dependabot.yml` — Renovate replaces Dependabot entirely (user request during apply); automerge packageRules are manager-agnostic, so actions/bun updates automerge too

## 3. update-tipi-version.yml + ci.yml (workflow_dispatch chain)

- [x] 3.1 Add `workflow_dispatch` trigger to `ci.yml`
- [x] 3.2 Add `actions: write` to job permissions and a `Trigger CI on bump commit` step (`gh workflow run ci.yml --ref <head_ref>`) gated on `steps.commit.outputs.pushed == 'true'`; `HEAD_REF` passed via `env:` (injection-safe)
- [x] 3.3 Keep commit author consistent with `gitIgnoredAuthors` (2.1): kept `github-actions[bot]` identity — no renovate.json change needed
- [x] 3.4 Confirm the `github.actor == 'renovate[bot]'` guard remains in place (no widening of `pull_request_target` exposure)
- [x] 3.5 Verify the no-op path: `GITHUB_TOKEN` push raises no `pull_request_target` event at all → no second run possible; dispatch step skipped when nothing was pushed — design.md and spec.md updated accordingly

## 4. Ruleset on main

- [x] 4.1 Create ruleset on `main` requiring status check `ci` before merge → ruleset `main-require-ci` (id 17365556): require PR (squash only) + status check `ci`, enforcement active
- [x] 4.2 Add bypass actors found in 1.4 (GitHub App / `github-actions`) if any workflow pushes to `main` directly → none push to main; added Repository admin bypass (`always`) to avoid locking the owner out
- [x] 4.3 Verify GitHub auto-merge is now available on PRs → `viewerCanEnableAutoMerge: true` on PR #292 (repo `allow_auto_merge` already true)
- [x] 4.4 Delete `readme-generator.yml` (user request during apply): redundant — `update-tipi-version.yml` regenerates README per Renovate PR; post-ruleset its `GITHUB_TOKEN` PRs could never pass the required `ci` check

## 5. Validation end-to-end

- [x] 5.1 Run `make test` and `make renovate-test` locally → 97 pass / 0 fail, lint clean, renovate config valid (only preexisting env warnings)
- [x] 5.2 Commit and merge this change → PR #422, auto-merged alone via the new ruleset (`ci` green → squash-merge, zero clicks) — first real proof of Bug 3 fix
- [ ] 5.3 Wait for / force the next Renovate PR (tick a checkbox on the Dependency Dashboard if needed)
- [ ] 5.4 Verify on that PR: bump commit present → `ci` check runs on it → PR not "edited/blocked" on dashboard → auto-merge enabled → PR merges alone when green
- [ ] 5.5 Verify README freshness path post-ruleset: bump commit on next Renovate PR includes regenerated README (weekly `readme-generator.yml` deleted)
- [x] 5.6 Verify the Dependency Dashboard shows no "rate-limited" section → clean post-merge; new `bun`/`github-actions` managers detected (8 npm deps + checkout v6); only `typescript v6` major in Pending Approval (manual by design)
