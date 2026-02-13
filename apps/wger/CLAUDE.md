# wger

Self-hosted fitness and workout tracking application.

## Architecture

Multi-service setup: main app + PostgreSQL + Redis + nginx + Celery workers.

- **wger** (main): Django app on port 8000
- Uses `version: "latest"` (no semver tags available)

## Key Details

- Django app requiring `SECRET_KEY` and `SIGNING_KEY` (both auto-generated, min 50 chars)
- Configurable timezone, registration, and guest access via form fields
- All services sharing Redis must include proper cache client configuration

## Renovate

No per-app customManager needed (version is `latest`). No digest pinning configured.
