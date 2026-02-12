---
name: sync-upstream-appstore
description: Use when syncing this appstore with the official runtipi/runtipi-appstore repo, adding new apps from upstream, updating configurations to match official patterns, or checking if local setup has drifted from upstream best practices. Triggers on requests like "align with official repo", "check upstream", "add app from official store", "update to match upstream".
---

# Sync Upstream Appstore

## Overview

Synchronize this custom Runtipi appstore with the official `runtipi/runtipi-appstore` repository while preserving local customizations. The official repo is the source of truth for patterns, schemas, and best practices.

## When to Use

- Adding a new app from the official store
- Checking if workflows, scripts, or configs have drifted from upstream
- Updating dependencies (`@runtipi/common`, Biome, etc.) to match upstream
- After noticing test failures from schema changes in `@runtipi/common`

## Reference URLs

- Official repo: `https://github.com/runtipi/runtipi-appstore/tree/master`
- Official apps: `https://github.com/runtipi/runtipi-appstore/tree/master/apps`
- API access: `gh api repos/runtipi/runtipi-appstore/contents/<path>`

## Sync Process

### Phase 1: Fetch Upstream State

Fetch these files from the official repo using `gh api` and compare with local:

```bash
# List upstream workflows
gh api repos/runtipi/runtipi-appstore/contents/.github/workflows --jq '.[].name'

# Fetch a specific file
gh api repos/runtipi/runtipi-appstore/contents/<path> --jq '.content' | base64 -d
```

**Files to compare:**

| File | What to check |
|------|---------------|
| `package.json` | Scripts (`test`, `lint`, `lint:ci`), dependencies (`@runtipi/common` version), devDependencies |
| `renovate.json` | customManagers structure, packageRules, postUpgradeTasks |
| `scripts/update-config.ts` | Arguments accepted, `isMain` logic, version update strategy |
| `apps/__tests__/apps.test.ts` | Schema imports, validation approach, test coverage |
| `.github/workflows/ci.yml` | Steps, node/bun versions, lint commands |
| `.github/workflows/*.yml` | Any new workflows added upstream |
| `biome.json` | Rule changes, formatter settings |
| `tsconfig.json` | Compiler options changes |

### Phase 2: Identify Differences

Categorize each difference as:

1. **Adopt** - upstream change is an improvement, no conflict with local customizations
2. **Adapt** - upstream change is good but needs modification for our setup (e.g., Renovate hosted vs self-hosted)
3. **Skip** - upstream change doesn't apply (e.g., `docker-compose.yml` support, we only use `.json`)
4. **Preserve** - local customization that must be kept (custom apps, VM debugging config)

**Key constraints for this repo:**
- We use **Renovate GitHub App (hosted)**, NOT self-hosted. `postUpgradeTasks` won't work.
- We use `pull_request_target` workflow to update `config.json` on Renovate PRs instead.
- Per-app `renovate.json` customManagers for `config.json` provide redundancy with the workflow.
- We only use `docker-compose.json` (dynamic v2 schema), NOT `docker-compose.yml`.

### Phase 3: Apply Changes

**Order matters:**

1. **Dependencies first** - Update `package.json` dependencies, then `bun install` via Docker
2. **Test infrastructure** - Update test file (`apps/__tests__/apps.test.ts`) to match new dependency APIs
3. **Scripts** - Update `scripts/update-config.ts` and `package.json` scripts
4. **Workflows** - Update GitHub Actions workflows
5. **Renovate config** - Update `renovate.json`
6. **App configs** - Fix any app configs that fail new tests (e.g., `required: true` on random fields)
7. **Validate** - Run `make test` (Docker-based, full CI equivalent)
8. **Documentation** - Update `CLAUDE.md` and regenerate `README.md` with `make readme`

### Phase 4: Validate

```bash
# Full validation (always use Docker)
make test

# Should see all tests pass + all JSON files valid
```

**If tests fail after dependency update:** Check if `@runtipi/common` changed schema library (e.g., Zod → ArkType). The official test file shows how to handle the new API.

## Adding an App from Upstream

```bash
# 1. List app files
gh api repos/runtipi/runtipi-appstore/contents/apps/<app-id> --jq '.[].name'

# 2. Fetch each file
gh api repos/runtipi/runtipi-appstore/contents/apps/<app-id>/config.json --jq '.content' | base64 -d

# 3. For binary files (logo.jpg)
gh api repos/runtipi/runtipi-appstore/contents/apps/<app-id>/metadata/logo.jpg --jq '.content' | base64 -d > apps/<app-id>/metadata/logo.jpg

# 4. Check for data/ directory with init scripts
gh api repos/runtipi/runtipi-appstore/contents/apps/<app-id>/data --jq '.[].name' 2>/dev/null
```

**After fetching:**

1. Review and customize `config.json` (rename if desired, update `id` and `name`)
2. Update `docker-compose.json` service names to match new `id`
3. Verify image versions are current (check Docker Hub)
4. Add per-app customManager to `renovate.json` (match `depNameTemplate` to Docker image name)
5. Ensure `form_fields` with `type: "random"` do NOT have `required: true`
6. Run `make test` to validate
7. Run `make readme` to update README

**Service naming convention:** When renaming an app (e.g., `n8n-2` → `n8n`), update ALL references:
- `config.json`: `id`, `name`
- `docker-compose.json`: all service `name` fields, `dependsOn` keys, environment variable values referencing service names (e.g., `DB_POSTGRESDB_HOST`)
- `renovate.json`: `managerFilePatterns` path

## Common Upstream Patterns to Watch

| Pattern | Description |
|---------|-------------|
| `parseComposeJson` | Official uses this from `@runtipi/common/schemas` for docker-compose validation |
| `isMain` check in update-config.ts | Only updates `config.json` version if the `isMain` service matches the package |
| `lint:ci` with `--changed` | Official lints only changed files in CI |
| Random fields not required | Official enforces that `type: "random"` fields must not be `required: true` |
| `postUpgradeTasks` in renovate.json | Only works with self-hosted Renovate - we use workflow instead |

## Checklist

- [ ] Fetch and compare all key files from upstream
- [ ] Categorize differences (adopt/adapt/skip/preserve)
- [ ] Update dependencies via Docker (`make test` includes `bun install`)
- [ ] Update test file if `@runtipi/common` API changed
- [ ] Update scripts and workflows
- [ ] Update renovate.json (keep per-app customManagers for hosted Renovate)
- [ ] Fix app configs that fail new tests
- [ ] Run `make test` - all pass
- [ ] Run `make readme` - regenerate
- [ ] Update `CLAUDE.md` with any new patterns or gotchas
