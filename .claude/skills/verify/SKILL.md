---
name: verify
description: Run full validation suite (lint + tests + Renovate config) before committing. Use after any app change to ensure everything passes.
---

# Verify

Run the complete validation pipeline for this appstore repository.

## Steps

1. Run `make test` (lint + unit tests in Docker)
2. Run `make renovate-test` (Renovate config dry-run)
3. Report results — if anything fails, show the error and suggest a fix

## When to Use

- Before committing any changes
- After modifying app files (config.json, docker-compose.json, metadata)
- After editing renovate.json
- When you want to confirm everything is green

## Important

- Both commands MUST pass before considering changes ready to commit
- `make test` runs Biome lint + Jest tests inside Docker
- `make renovate-test` validates Renovate customManager regex patterns
- If `make test` fails on formatting, run `make bun-shell` and `biome check --write .` to auto-fix
