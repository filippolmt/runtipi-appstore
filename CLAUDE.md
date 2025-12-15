# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Runtipi App Store repository containing self-hosted application definitions. Runtipi uses a dynamic JSON-based format (v2 schema) to define Docker containers rather than traditional docker-compose.yml files.

## Commands

**Full validation (Docker-based, CI equivalent):**
```bash
make test
```

**Local development:**
```bash
bun install --ignore-scripts
bun run lint          # Biome check with auto-fix
bun test              # Run tests
bun run scripts/validate-json.js  # Validate docker-compose.json files
```

**Generate README from apps:**
```bash
make readme
```

**Interactive shell:**
```bash
make bun-shell
```

## App Structure

Each app lives in `apps/<app-id>/` with:
- `config.json` - App metadata (validated against `apps/app-info-schema.json` and `@runtipi/common` schemas)
- `docker-compose.json` - Container definition using schemaVersion 2 (validated against `apps/dynamic-compose-schema.json`)
- `metadata/logo.jpg` - App logo
- `metadata/description.md` - Full description

### config.json Required Fields
- `id`, `name`, `available`, `tipi_version`, `short_desc`, `author`, `source`

### docker-compose.json Format
Uses dynamic compose schema v2 with `schemaVersion: 2` and a `services` array. Key differences from standard docker-compose:
- `internalPort` instead of exposed ports
- `isMain: true` marks the primary service
- `hostPath`/`containerPath` for volumes using `${APP_DATA_DIR}` variable
- Environment as array of `{key, value}` objects

## Validation

Tests in `apps/__tests__/apps.test.ts` verify:
1. Required files exist for each app
2. `config.json` validates against `@runtipi/common` appInfoSchema
3. `docker-compose.json` validates against dynamic-compose schema (fetched from https://schemas.runtipi.io/v2/dynamic-compose.json with local fallback)

## Code Style

Uses Biome with double quotes, 2-space indent, 150 char line width. Run `bun run lint` to auto-fix.

## Renovate (Automatic Updates)

Renovate monitors `docker-compose.json` and `config.json` files for Docker image updates.

**Update flow:**
1. Renovate detects new Docker image version
2. Renovate creates PR updating image tags in `docker-compose.json` and version in `config.json`
3. GitHub Action (`update-tipi-version.yml`) triggers on PR and:
   - Runs `scripts/update-config.ts` to increment `tipi_version` (+1) and update `updated_at` timestamp
   - Commits changes back to the Renovate PR branch

**Why `pull_request_target`:** The workflow uses `pull_request_target` instead of `pull_request` because `GITHUB_TOKEN` doesn't have permission to push to branches created by external actors (like Renovate bot). `pull_request_target` runs in the base repo context with write access.

**Safety mechanisms (no infinite loops):**
- Workflow condition: `if: github.actor == 'renovate[bot]'`
- When workflow commits, actor becomes `github-actions[bot]` → workflow won't re-trigger
- Renovate config has `rebaseWhen: "conflicted"` → won't overwrite workflow commits

**Test Renovate configuration:**
```bash
make renovate-test
```

**Configuration structure** (`renovate.json`):
- First customManager matches ALL `docker-compose.json` files (extracts image name dynamically)
- Per-app customManagers match `config.json` files to update version field
- Uses current syntax: `customType: "regex"`, `managerFilePatterns`, `matchStrings`
- PostgreSQL/MySQL/Redis images are disabled (won't auto-update)

Note: Renovate only sees files committed to git.

## Adding a New App

1. Create `apps/<app-id>/` directory with:
   - `config.json` - App metadata
   - `docker-compose.json` - Container definition (schemaVersion: 2)
   - `metadata/logo.jpg` - Logo image (convert from PNG if needed: `sips -s format jpeg input.png --out logo.jpg`)
   - `metadata/description.md` - Markdown description

2. For apps with databases, add a second service in `docker-compose.json` with `dependsOn` and `healthCheck`

3. Add entry to `renovate.json` customManagers for the new app's `config.json`:
   ```json
   {
     "customType": "regex",
     "managerFilePatterns": ["apps/<app-id>/config.json"],
     "matchStrings": ["\"version\":\\s*\"(?<currentValue>[^\"]+)\""],
     "depNameTemplate": "<docker-image-name>",
     "datasourceTemplate": "docker"
   }
   ```

4. Run `make test` and `make renovate-test` to validate

5. Commit files (Renovate needs them in git to detect updates)

## Current Apps

| App | Services | Description |
|-----|----------|-------------|
| budibase | 1 | Low-code platform for business apps |
| kitchenowl | 1 | Grocery list and recipe manager |
| mailpit | 1 | Email testing tool for developers |
| nginx | 1 | Web server and reverse proxy |
| puter | 1 | Cloud desktop environment |
| traccar | 1 | GPS tracking system |
| wger | 5 | Fitness/workout tracking (web + db + redis + celery worker + celery beat) |
| workout-cool | 2 | Fitness coaching platform (web + db) |

### Complex App: wger

wger is the most complex app with 5 services:
- **wger** - Main Django web server (port 8000)
- **wger-db** - PostgreSQL 15 database
- **wger-cache** - Redis (caching + Celery broker)
- **wger-celery-worker** - Background task processing
- **wger-celery-beat** - Scheduled tasks (syncs exercises/ingredients from wger.de)

User-configurable: Secret Key, JWT Signing Key, DB Password (all auto-generated), Timezone, Allow Registration, Allow Guest Users
