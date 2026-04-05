# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Runtipi App Store — self-hosted app definitions in JSON format (dynamic compose schema v2).

## Commands

All commands run via Makefile (Docker). Never use bare `bun` commands.

```bash
make test             # Lint + test (CI equivalent)
make readme           # Regenerate README.md
make renovate-test    # Dry-run Renovate config
make bun-shell        # Interactive shell in container
```

## App Structure

Each app in `apps/<app-id>/`:

- `config.json` — metadata, version, form_fields
- `docker-compose.json` — schema v2, services array, `isMain: true` on primary service
- `metadata/logo.jpg` + `metadata/description.md`

Schemas: `@apps/app-info-schema.json` (config) and `@apps/dynamic-compose-schema.json` (compose). Use `/appstore-patterns` for workflows, examples, and conventions.

## Key Rules

- **tipi_version**: any manual change to `apps/<app-id>/` requires `tipi_version` +1 and `updated_at` = `Date.now()` in config.json
- **Service names**: prefix with app-id (e.g., `n8n-db`, `twenty-redis`)
- **Random form fields**: must NOT have `required: true`
- **New apps**: add a `customManager` entry in `renovate.json` (skip for `version: "latest"`)
- **Validate**: always `make test` + `make renovate-test` before committing

## Conventions

- **Branch naming**: `feat/`, `fix/`, `chore/` prefix (conventional)
- **Commits**: conventional commits format (`feat(app): description`, `fix(app): description`)
- **Approach**: always propose a plan before implementing. For complex tasks, wait for confirmation
- **Language**: all communication and documentation in English
