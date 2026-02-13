# n8n

Workflow automation tool with 400+ integrations.

## Architecture

4-service setup: main app + PostgreSQL + Redis + worker (queue mode).

- **n8n** (main): Web UI and API on port 5678
- **n8n-db**: PostgreSQL for workflow/execution storage
- **n8n-redis**: Redis for job queue management
- **n8n-worker**: Background workflow execution in queue mode

## Key Details

- Workers use `command: "worker"` and must share the same encryption key and image version as the main service
- Workers `dependsOn` main service with `condition: "service_started"` so migrations complete first
- `NODE_FUNCTION_ALLOW_BUILTIN=crypto` enables crypto module in Code nodes (both main and worker)
- 4 auto-generated secrets (`type: "random"`, `min: 32`): encryption key, DB password, JWT secrets

## Renovate

Per-app customManager in `renovate.json` tracks `n8nio/n8n` Docker image versions.
