---
name: bump-tipi-version
description: Use when modifying ANY file inside an app directory (apps/<app-id>/). Triggers on edits to docker-compose.json, config.json, metadata files, or data files of any app. Must increment tipi_version in config.json for every app change, no exceptions.
---

# Bump tipi_version

## Overview

Every modification to an app's files MUST be accompanied by a `tipi_version` increment in that app's `config.json`. This is how Runtipi detects that an app definition has changed and needs redeployment.

## The Rule

**If you touch any file in `apps/<app-id>/`, you MUST increment `tipi_version` by 1 in `apps/<app-id>/config.json` and update `updated_at` to the current timestamp.**

```
tipi_version: N  →  tipi_version: N + 1
updated_at: old  →  updated_at: Date.now()
```

## When to Bump

ANY change inside `apps/<app-id>/`:

- `docker-compose.json` - image version, environment variables, volumes, services, health checks
- `config.json` - description, form fields, categories, port, any field except `tipi_version` and `updated_at` themselves
- `metadata/description.md` - description text changes
- `metadata/logo.jpg` - logo replacement
- `data/*` - init scripts, config files

## When NOT to Bump

- Changes outside app directories (workflows, scripts, renovate.json, package.json, CLAUDE.md)
- Renovate automated PRs (the `update-tipi-version.yml` workflow handles this)
- Reading files without modifying them

## How to Bump

After making changes to an app, edit its `config.json`:

1. Find current `tipi_version` value
2. Increment by exactly 1
3. Update `updated_at` to current epoch milliseconds

```json
{
  "tipi_version": 5,
  "updated_at": 1739401200000
}
```

becomes:

```json
{
  "tipi_version": 6,
  "updated_at": 1739487600000
}
```

**Multiple changes to the same app in one session = one bump.** Only increment once per app per commit, not once per file edit.

**Multiple apps changed = bump each separately.** If you modify both `n8n` and `wger`, bump both `tipi_version` values independently.

## Red Flags - STOP and Bump

- You edited `docker-compose.json` and are about to commit
- You updated an image version manually
- You added/removed/changed environment variables
- You modified a health check or volume mount
- You changed form fields in `config.json`
- You are about to run `make test` after app changes

If any of these apply, check: did you bump `tipi_version`?

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Forgot to bump after editing docker-compose.json | Always bump immediately after the edit, before testing |
| Bumped by 2 instead of 1 | tipi_version is strictly sequential: +1 per release |
| Updated version but not updated_at | Always update both fields together |
| Bumped tipi_version but used a hardcoded timestamp | Use current epoch ms: in JS `Date.now()`, in shell `date +%s000` |
