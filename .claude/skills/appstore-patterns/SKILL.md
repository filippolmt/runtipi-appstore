---
name: appstore-patterns
description: Add an application to this Runtipi app store from a source repository or deployment URL. Use when asked to add, package, import, or onboard an app that is not already present.
---

# Add a Runtipi app

Package the smallest supported deployment that preserves the upstream application's required services, persistence, configuration, and security.

## 1. Establish the source of truth

1. Search `apps/`, `renovate.json`, and `README.md` for the app's current and former names. Update an existing definition instead of creating a duplicate.
2. Read the upstream release, container, and deployment documentation from primary sources. Prefer the Compose file at the latest stable tag over `main`.
3. Record the latest stable application version, image tags, required services, ports, volumes, required variables, optional integrations, and supported architectures.
4. Inspect each image manifest when declaring `amd64` or `arm64` support.

This step is complete when every service and persistent path in the upstream minimal deployment is accounted for.

## 2. Choose local patterns

Read `apps/app-info-schema.json`, `apps/dynamic-compose-schema.json`, and one existing app with the closest service topology. Reuse its structure, not its app-specific settings.

Map the upstream deployment into dynamic Compose v2:

- Prefix every service name and internal hostname with the app id.
- Mark exactly one primary web service with `"isMain": true` and set its `internalPort`.
- Store persistent data under `${APP_DATA_DIR}/data/<component>`.
- Translate environment variables, commands, dependencies, health checks, capabilities, and volumes only when upstream requires them.
- Generate secrets with `random` form fields; keep those fields free of `required: true`.
- Use required form fields only for user-supplied values without which the app cannot start.
- Keep optional validated values valid on existing installs with `${VAR:-upstream-default}` rather than passing empty strings.
- For OpenAI-compatible integrations, expose the API key, base URL, model names, and provider-specific protocol toggles together.
- Keep credentials in form fields and substitutions; never place literal secrets in Compose.

This step is complete when the local definition can reproduce upstream's minimal supported deployment without speculative services or settings.

## 3. Create the app files

Create:

- `apps/<app-id>/config.json`
- `apps/<app-id>/docker-compose.json`
- `apps/<app-id>/metadata/description.md`
- `apps/<app-id>/metadata/logo.jpg`

For a new app:

- Start `tipi_version` at `1`.
- Set `created_at` and `updated_at` to the same current epoch-millisecond value immediately before writing the config.
- Keep `updated_at` at or below the current time.
- Choose a `port` unused by every other app; it is independent from the container's `internalPort`.
- Pin the main image to the latest stable release unless upstream only publishes a rolling tag.
- Write first-run, optional-integration, storage, and security guidance that changes how the user operates the app.
- Use an upstream project logo where available and store a real JPEG at `metadata/logo.jpg`; prefer a square image of at least 512×512.

## 4. Configure updates

When `version` is not `latest`, add a `customManager` in `renovate.json` that extracts the config version from `apps/<app-id>/config.json` and resolves the main container image.

Confirm that Renovate also extracts every image from `docker-compose.json`. Preserve upstream pins for stateful dependencies when upgrades require migrations.

## 5. Generate and validate

1. Run `make readme`.
2. Run `make test`.
3. Run `make renovate-config-test`.
4. Run `make renovate-test`; its disposable copy stages untracked files before Renovate scans the repository.
5. If dependency extraction needs inspection, run `make renovate-debug > /tmp/renovate.log 2>&1` and search that file for the app paths and expected packages.
6. Run `git diff --check` and inspect the complete diff.
7. Recheck the upstream latest stable release and verify `updated_at` is not in the future.

The app is complete only when all required files exist, both schemas pass, all validation commands pass, Renovate detects the pinned application version, README lists the app, and no upstream deployment requirement is unaccounted for.
