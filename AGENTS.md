# AGENTS.md

Quick guide to creating and publishing new “runtipi” apps with this repository.

## Repository layout

- `apps/<app-id>/config.json`: app metadata and user-facing config fields (schema in `apps/app-info-schema.json`).
- `apps/<app-id>/docker-compose.json`: dynamic manifest schemaVersion 2 (`$schema` https://schemas.runtipi.io/v2/dynamic-compose.json) consumed by Tipi via `@runtipi/common` and validated against the Tipi schema.
- `apps/<app-id>/metadata/description.md` and `logo.jpg`: required description and logo (tests expect them).
- `apps/docker-compose.common.yml`: shared network `runtipi_tipi_main_network`.
- Scripts/tests: `bun test` runs `apps/__tests__/apps.test.ts` (consistency checks); `scripts/validate-json.js` validates dynamic manifests against the remote schema.
- `Makefile`: `make test` runs `bun install --ignore-scripts && bun test && bun run scripts/validate-json.js` inside the `BUN_IMAGE` container (defaults to `oven/bun:1.2.2`).

## Minimum requirements for a new app

1. **Unique ID and unique port**

   - `config.json.id` must be unique.
   - `config.json.port` must not collide with other apps (enforced by tests).

2. **Mandatory metadata** (`config.json` must follow `app-info-schema.json`)

   - Required fields: `id`, `available`, `name`, `tipi_version > 0`, `short_desc`, `author`, `source`, `supported_architectures`, `created_at`, `updated_at`.
   - `categories` must use the enum values from the schema.
   - `version` in `config.json` must appear in the image tag in `docker-compose.json` (and any static compose you keep for legacy setups).
   - `min_tipi_version` controls visibility: apps are hidden on Tipi versions below this value (current Tipi is v4.6.5).
   - `dynamic_config` true if you use `docker-compose.json` with templated values.
   - `form_fields`: define user inputs (type, label, env_variable, default, etc.); fields with `type: "random"` must not be `required: true`.

3. **Dynamic manifest (`docker-compose.json`)**

   - `schemaVersion`: 2; include `$schema: https://schemas.runtipi.io/v2/dynamic-compose.json`.
   - `services[]` key fields: `name`, `image`, `isMain`, `internalPort`, `environment` (array `{key,value}`), `addPorts` (hostPort/containerPort, tcp/udp), `volumes` (hostPath/containerPath, readOnly/shared/private), `healthCheck`, optional `hostname`, `dependsOn`, `extraLabels`, `networkMode`, `addToMainNetwork`.
   - Dynamic compose can be minimal (e.g. `schemaVersion`, `services` with `name`/`image`/`internalPort`/`isMain`); add routing/network extras only if needed for your deployment.
   - Keep in sync with `config.json.requirements` (ports/volumes) so users see the right info.

4. **Metadata**
   - `metadata/description.md`: short overview plus features/tips.
   - `metadata/logo.jpg`: required by tests.
   - Ensure `created_at` / `updated_at` dates are >= 2023 and < `Date.now()`.

## Suggested workflow

1. Copy an existing app folder (e.g., `apps/mailpit`) and rename it to the new `id`.
2. Update `config.json` following the schema and required fields.
3. Update `docker-compose.json` (dynamic manifest).
4. Write `metadata/description.md` and add `logo.jpg`.
5. Verify locally:
   - `make test` (runs bun install, tests, and JSON validation in Docker), or manually:
     - `bun test` (checks config, compose json, metadata, unique ids/ports).
     - `bun run scripts/validate-json.js` (validates `docker-compose.json` against the Tipi schema; remote fetch with local fallback).
6. If the app is exposable, ensure `form_fields` cover all env vars used in the manifests.
7. Add Renovate regex entries: whenever you add a new app, create a matching `customManager` in `renovate.json` that updates both the image tag in `docker-compose.json` and the `version` field in that app’s `config.json` (pattern like the existing entries for budibase, mailpit, nginx, puter, traccar).

## Common field notes

- Typical placeholders:
  - `${APP_DATA_DIR}` for persistence.
  - `${APP_PORT}` if the port is user-configurable in Tipi.
  - `${APP_DOMAIN}` / `${LOCAL_DOMAIN}` for Traefik routing.
  - `${PUID}` / `${PGID}` for filesystem ownership.
- `requirements` in `config.json` lists ports and volumes to create/show to users.
- `force_pull`, `force_expose`, `generate_vapid_keys`, `https`, `no_gui` are optional with defaults defined in the schema.
- Network exceptions: tests expect `tipi_main_network` by default; only apps listed in `networkExceptions` in `apps/__tests__/apps.test.ts` may omit it.

Reference: full config JSON spec — https://runtipi.io/docs/reference/config-json

### Example `config.json`

```json
{
  "name": "Nginx",
  "id": "nginx",
  "available": true,
  "short_desc": "Open-source simple and fast web server.",
  "author": "nginx.org",
  "port": 8754,
  "categories": ["utilities"],
  "description": "Simple webserver to test your Tipi install. An alternative to the hello-world app.",
  "tipi_version": 1,
  "version": "1.25.3",
  "source": "https://github.com/nginx/nginx",
  "website": "https://www.nginx.com/",
  "exposable": true,
  "supported_architectures": ["arm64", "amd64"],
  "created_at": 1688169600000,
  "updated_at": 1706745600000,
  "dynamic_config": true,
  "form_fields": [],
  "min_tipi_version": "4.5.0",
  "requirements": {
    "ports": [8754]
  },
  "$schema": "https://schemas.runtipi.io/v2/app-info.json"
}
```

## Minimal example (schemaVersion 2)

```jsonc
// apps/myapp/docker-compose.json
{
  "$schema": "https://schemas.runtipi.io/v2/dynamic-compose.json",
  "schemaVersion": 2,
  "services": [
    {
      "name": "myapp",
      "image": "myapp:latest",
      "internalPort": 80,
      "isMain": true,
      "volumes": [
        {
          "hostPath": "${APP_DATA_DIR}/data/myapp",
          "containerPath": "/data",
          "readOnly": false
        }
      ],
      "environment": [
        { "key": "FOO", "value": "bar" },
        { "key": "PASSWORD", "value": "${MYAPP_PASSWORD}" }
      ],
      "addPorts": [
        { "containerPort": 8080, "hostPort": 8080, "tcp": true },
        { "containerPort": 25565, "hostPort": 25565, "udp": true }
      ],
      "healthCheck": {
        "test": "curl --fail http://localhost || exit 1",
        "retries": 3,
        "interval": "30s",
        "timeout": "10s"
      },
      "dependsOn": {
        "service1": { "condition": "service_healthy" }
      }
    }
  ]
}
```

## What the automated tests check

- Existence of `config.json`, `docker-compose.json`, `metadata/description.md`, `metadata/logo.jpg`.
- `config.json` validity against `app-info-schema.json`.
- `docker-compose.json` validity against the Tipi schema (remote, with local fallback).
- Unique ports and IDs, and plausible `created_at` / `updated_at` timestamps.

Follow these guidelines to add new apps to the runtipi app store and integrate them into your local installation with a repeatable validation loop.
