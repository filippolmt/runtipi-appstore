# AGENTS.md

Quick guide to creating and publishing new “runtipi” apps with this repository.

## Repository layout
- `apps/<app-id>/config.json`: app metadata and user-facing config fields (schema in `apps/app-info-schema.json`).
- `apps/<app-id>/docker-compose.yml`: static manifest Tipi uses; must join `tipi_main_network`, set `container_name` equal to `id`, include `runtipi.managed: "true"`, and for exposable apps add Traefik labels.
- `apps/<app-id>/docker-compose.json`: dynamic manifest schemaVersion 2 (`$schema` https://schemas.runtipi.io/dynamic-compose.json or `/v2/…`) consumed by Tipi via `@runtipi/common`.
- `apps/<app-id>/metadata/description.md` and `logo.jpg`: required description and logo (tests expect them).
- `apps/docker-compose.common.yml`: shared network `runtipi_tipi_main_network`.
- Scripts/tests: `bun test` runs `apps/__tests__/apps.test.ts` (consistency checks); `scripts/validate-json.js` validates dynamic manifests against the remote schema.

## Minimum requirements for a new app
1) **Unique ID and unique port**  
   - `config.json.id` must be unique.  
   - `config.json.port` must not collide with other apps (enforced by tests).

2) **Mandatory metadata** (`config.json` must follow `app-info-schema.json`)  
   - Required fields: `id`, `available`, `name`, `tipi_version > 0`, `short_desc`, `author`, `source`, `supported_architectures`, `created_at`, `updated_at`.  
   - `categories` must use the enum values from the schema.  
   - `version` in `config.json` must appear in the image tag in `docker-compose.yml`.  
   - `dynamic_config` true if you use `docker-compose.json` with templated values.  
   - `form_fields`: define user inputs (type, label, env_variable, default, etc.); fields with `type: "random"` must not be `required: true`.

3) **Static manifest (`docker-compose.yml`)**  
   - `services.<id>.container_name` equals `id`.  
   - `networks` includes `tipi_main_network` (except explicit exceptions).  
   - Minimum label: `runtipi.managed: "true"`.  
   - For web apps, use the standard Traefik label pattern (seen in Budibase/Mailpit/Puter/Traccar):  
     - `traefik.enable: true`  
     - Redirect middleware `traefik.http.middlewares.<id>-web-redirect.redirectscheme.scheme: https`  
     - Service port `traefik.http.services.<id>.loadbalancer.server.port: <internal-port>`  
     - `-insecure` router on `APP_DOMAIN`/`web` with redirect middleware  
     - Main router on `APP_DOMAIN`/`websecure` with `tls.certresolver: myresolver`  
     - `-local-insecure` and `-local` routers on `LOCAL_DOMAIN` with the same pattern  
   - Image port must match `config.json.port` and `docker-compose.json.internalPort`.  
   - Volumes and environment variables should use Tipi placeholders (`${APP_DATA_DIR}`, `${APP_PORT}`, `${APP_DOMAIN}`, `${LOCAL_DOMAIN}`, `${PUID}`, `${PGID}`, etc.).

4) **Dynamic manifest (`docker-compose.json`)**  
   - `schemaVersion`: 2.  
   - `services[]` key fields: `name`, `image`, `isMain`, `internalPort`, `environment` (array `{key,value}`), `addPorts` (hostPort/containerPort, tcp/udp), `volumes` (hostPath/containerPath, readOnly/shared/private), `healthCheck`, optional `hostname`, `extraLabels`, `networkMode`, `addToMainNetwork`.  
   - Use the same image tag as the static compose.  
   - Keep in sync with `config.json.requirements` (ports/volumes) so users see the right info.

5) **Metadata**  
   - `metadata/description.md`: short overview plus features/tips.  
   - `metadata/logo.jpg`: required by tests.  
   - Ensure `created_at` / `updated_at` dates are >= 2023 and < `Date.now()`.

## Suggested workflow
1. Copy an existing app folder (e.g., `apps/mailpit`) and rename it to the new `id`.  
2. Update `config.json` following the schema and required fields.  
3. Update `docker-compose.yml`: image/tag, ports, volumes, Traefik labels, network.  
4. Update `docker-compose.json` to stay consistent with the static compose.  
5. Write `metadata/description.md` and add `logo.jpg`.  
6. Verify locally:  
   - `bun test` (checks config, compose yml, metadata, unique ids/ports, version/tag coherence).  
   - `bun run scripts/validate-json.js` (validates `docker-compose.json` against the remote schema).  
7. If the app is exposable, ensure `form_fields` cover all env vars used in the manifests and Traefik labels use the app name consistently.

## Common field notes
- Typical placeholders:  
  - `${APP_DATA_DIR}` for persistence.  
  - `${APP_PORT}` if the port is user-configurable in Tipi.  
  - `${APP_DOMAIN}` / `${LOCAL_DOMAIN}` for Traefik routing.  
  - `${PUID}` / `${PGID}` for filesystem ownership.  
- `requirements` in `config.json` lists ports and volumes to create/show to users.  
- `force_pull`, `force_expose`, `generate_vapid_keys`, `https`, `no_gui` are optional with defaults defined in the schema.

## Minimal example (schemaVersion 2)
```jsonc
// apps/myapp/docker-compose.json
{
  "$schema": "https://schemas.runtipi.io/dynamic-compose.json",
  "schemaVersion": 2,
  "services": [
    {
      "name": "myapp",
      "image": "org/myapp:1.0.0",
      "isMain": true,
      "internalPort": 3000,
      "environment": [{ "key": "MYAPP_KEY", "value": "${MYAPP_KEY:-changeme}" }],
      "addPorts": [{ "hostPort": 3000, "containerPort": 3000, "tcp": true, "udp": false }],
      "volumes": [{ "hostPath": "${APP_DATA_DIR}/data", "containerPath": "/data" }]
    }
  ]
}
```

```yaml
# apps/myapp/docker-compose.yml
version: "3.7"
services:
  myapp:
    image: org/myapp:1.0.0
    container_name: myapp
    restart: unless-stopped
    ports:
      - "${APP_PORT:-3000}:3000"
    environment:
      MYAPP_KEY: ${MYAPP_KEY:-changeme}
    volumes:
      - ${APP_DATA_DIR}/data:/data
    networks:
      - tipi_main_network
    labels:
      traefik.enable: true
      traefik.http.middlewares.myapp-web-redirect.redirectscheme.scheme: https
      traefik.http.services.myapp.loadbalancer.server.port: 3000
      traefik.http.routers.myapp-insecure.rule: Host(`${APP_DOMAIN}`)
      traefik.http.routers.myapp-insecure.entrypoints: web
      traefik.http.routers.myapp-insecure.service: myapp
      traefik.http.routers.myapp-insecure.middlewares: myapp-web-redirect
      traefik.http.routers.myapp.rule: Host(`${APP_DOMAIN}`)
      traefik.http.routers.myapp.entrypoints: websecure
      traefik.http.routers.myapp.service: myapp
      traefik.http.routers.myapp.tls.certresolver: myresolver
      traefik.http.routers.myapp-local-insecure.rule: Host(`myapp.${LOCAL_DOMAIN}`)
      traefik.http.routers.myapp-local-insecure.entrypoints: web
      traefik.http.routers.myapp-local-insecure.service: myapp
      traefik.http.routers.myapp-local-insecure.middlewares: myapp-web-redirect
      traefik.http.routers.myapp-local.rule: Host(`myapp.${LOCAL_DOMAIN}`)
      traefik.http.routers.myapp-local.entrypoints: websecure
      traefik.http.routers.myapp-local.service: myapp
      traefik.http.routers.myapp-local.tls: true
      runtipi.managed: "true"

networks:
  tipi_main_network:
    external: true
```

## What the automated tests check
- Parsing `docker-compose.json` with `@runtipi/common` (`parseComposeJson`).  
- Existence and validity of `config.json`, `metadata/description.md`, `metadata/logo.jpg`.  
- `container_name` = `id` and membership in `tipi_main_network`.  
- `runtipi.managed` label present on all services.  
- Image tag matches `config.json.version` (except listed exceptions).  
- Unique ports and IDs, and plausible `created_at` / `updated_at` timestamps.

Follow these guidelines to add new apps to the runtipi app store and integrate them into your local installation with a repeatable validation loop.
