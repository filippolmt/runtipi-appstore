# CLAUDE.md

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

See `AGENTS.md` for full examples and templates.

## Key Rules

- **tipi_version**: any manual change to `apps/<app-id>/` requires `tipi_version` +1 and `updated_at` = `Date.now()` in config.json
- **Service names**: prefix with app-id (e.g., `n8n-db`, `twenty-redis`)
- **Random form fields**: must NOT have `required: true`
- **New apps**: add a `customManager` entry in `renovate.json` (skip for `version: "latest"`)
- **Validate**: always `make test` + `make renovate-test` before committing
